package attach

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"io"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/yusii/dropdat/api/internal/auth"
	"github.com/yusii/dropdat/api/internal/db/dbgen"
	"github.com/yusii/dropdat/api/internal/httpx"
)

// CanUse returns true if the user's tier grants attachments.
type CanUse func(ctx context.Context, userID string) bool

type Handler struct {
	q      *dbgen.Queries
	store  *Storage
	canUse CanUse
}

func NewHandler(q *dbgen.Queries, store *Storage, canUse CanUse) *Handler {
	if canUse == nil {
		canUse = func(context.Context, string) bool { return true }
	}
	return &Handler{q: q, store: store, canUse: canUse}
}

func (h *Handler) Mount(r chi.Router) {
	r.Post("/capsules/{id}/attachments", h.Init)
	r.Post("/capsules/{id}/attachments/{aid}/commit", h.Commit)
	r.Post("/capsules/{id}/attachments/direct", h.Direct)
	r.Get("/capsules/{id}/attachments", h.List)
	r.Get("/attachments/{aid}/download", h.Download)
	r.Delete("/attachments/{aid}", h.Delete)
}

// Direct accepts the raw file bytes and writes to R2 server-side. Use this
// path from clients that can't talk to R2 over CORS (browser extensions). The
// API takes a 50MB body cap; web clients should still prefer the presigned
// flow so the bytes don't traverse the API.
//
//   Headers:
//     X-Dropdat-Filename:     <UTF-8 filename>
//     X-Dropdat-Content-Type: <mime>   (optional, defaults to body Content-Type)
//   Body: raw octet-stream of the file.
func (h *Handler) Direct(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	if h.store == nil {
		httpx.Error(w, http.StatusServiceUnavailable, "attachments storage not configured")
		return
	}
	if !h.canUse(r.Context(), uid) {
		httpx.Error(w, http.StatusPaymentRequired, "attachments require Premium plan or higher")
		return
	}
	capsuleID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid capsule id")
		return
	}
	if _, err := h.q.GetCapsule(r.Context(), dbgen.GetCapsuleParams{ID: capsuleID, UserID: uid}); err != nil {
		httpx.Error(w, http.StatusNotFound, "capsule not found")
		return
	}
	filename := strings.TrimSpace(r.Header.Get("X-Dropdat-Filename"))
	if filename == "" {
		httpx.Error(w, http.StatusBadRequest, "X-Dropdat-Filename header required")
		return
	}
	contentType := r.Header.Get("X-Dropdat-Content-Type")
	if contentType == "" {
		contentType = r.Header.Get("Content-Type")
	}
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	const maxBytes = 50 * 1024 * 1024
	r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
	body, err := io.ReadAll(r.Body)
	if err != nil {
		httpx.Error(w, http.StatusRequestEntityTooLarge, "file too large (max 50MB)")
		return
	}
	if len(body) == 0 {
		httpx.Error(w, http.StatusBadRequest, "empty body")
		return
	}
	// Content-hash dedupe — same bytes uploaded twice to the same capsule
	// return the existing row instead of creating a duplicate. Fixes the
	// extension retrying uploads and the user re-pressing Generate.
	sum := sha256.Sum256(body)
	hash := hex.EncodeToString(sum[:])
	if existing, err := h.q.FindAttachmentByHash(r.Context(), dbgen.FindAttachmentByHashParams{
		CapsuleID: capsuleID, UserID: uid, ContentHash: hash,
	}); err == nil {
		httpx.JSON(w, http.StatusOK, attachmentDTO{
			ID: existing.ID.String(), Filename: existing.Filename, ContentType: existing.ContentType,
			SizeBytes: existing.SizeBytes, CreatedAt: existing.CreatedAt.Time.Format(time.RFC3339),
		})
		return
	}

	attID := uuid.New()
	key := path.Join(uid, capsuleID.String(), attID.String()+"-"+safeName(filename))
	if err := h.store.Put(r.Context(), key, contentType, bytes.NewReader(body), int64(len(body))); err != nil {
		httpx.Error(w, http.StatusBadGateway, "upload to storage failed: "+err.Error())
		return
	}
	row, err := h.q.CreateAttachment(r.Context(), dbgen.CreateAttachmentParams{
		ID:          attID,
		CapsuleID:   capsuleID,
		UserID:      uid,
		Filename:    filename,
		ContentType: contentType,
		SizeBytes:   int64(len(body)),
		StorageKey:  key,
		ContentHash: hash,
	})
	if err != nil {
		// Best-effort: try to clean up the object we just wrote.
		_ = h.store.Delete(r.Context(), key)
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusCreated, attachmentDTO{
		ID: row.ID.String(), Filename: row.Filename, ContentType: row.ContentType,
		SizeBytes: row.SizeBytes, CreatedAt: row.CreatedAt.Time.Format(time.RFC3339),
	})
}

type initRequest struct {
	Filename    string `json:"filename"`
	ContentType string `json:"contentType"`
	SizeBytes   int64  `json:"sizeBytes"`
}

type initResponse struct {
	AttachmentID string `json:"id"`
	UploadURL    string `json:"uploadUrl"`
	ExpiresIn    int    `json:"expiresIn"` // seconds
}

// Init issues a presigned PUT for browser-direct upload. Caller then PUTs the
// bytes, then calls Commit to mark the row as ready.
func (h *Handler) Init(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	if h.store == nil {
		httpx.Error(w, http.StatusServiceUnavailable, "attachments storage not configured")
		return
	}
	if !h.canUse(r.Context(), uid) {
		httpx.Error(w, http.StatusPaymentRequired, "attachments require Premium plan or higher")
		return
	}
	capsuleID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid capsule id")
		return
	}
	// Confirm capsule ownership.
	if _, err := h.q.GetCapsule(r.Context(), dbgen.GetCapsuleParams{ID: capsuleID, UserID: uid}); err != nil {
		httpx.Error(w, http.StatusNotFound, "capsule not found")
		return
	}
	var body initRequest
	if err := httpx.DecodeJSON(r, &body); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	body.Filename = strings.TrimSpace(body.Filename)
	if body.Filename == "" {
		httpx.Error(w, http.StatusBadRequest, "filename required")
		return
	}
	if body.SizeBytes <= 0 || body.SizeBytes > 50*1024*1024 {
		httpx.Error(w, http.StatusBadRequest, "size must be 1B..50MB")
		return
	}
	attID := uuid.New()
	key := path.Join(uid, capsuleID.String(), attID.String()+"-"+safeName(body.Filename))
	row, err := h.q.CreateAttachment(r.Context(), dbgen.CreateAttachmentParams{
		ID:          attID,
		CapsuleID:   capsuleID,
		UserID:      uid,
		Filename:    body.Filename,
		ContentType: body.ContentType,
		SizeBytes:   body.SizeBytes,
		StorageKey:  key,
		// Init path: hash unknown until bytes land. Leave empty — dedupe only
		// applies to Direct uploads where we see the bytes server-side.
		ContentHash: "",
	})
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	url, err := h.store.PresignPut(r.Context(), row.StorageKey, body.ContentType, 10*time.Minute)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusCreated, initResponse{
		AttachmentID: row.ID.String(),
		UploadURL:    url,
		ExpiresIn:    600,
	})
}

// Commit is a no-op marker the client calls after a successful PUT. We keep it
// for symmetry — future versions may verify the object exists or update size.
func (h *Handler) Commit(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type attachmentDTO struct {
	ID          string `json:"id"`
	Filename    string `json:"filename"`
	ContentType string `json:"contentType"`
	SizeBytes   int64  `json:"sizeBytes"`
	CreatedAt   string `json:"createdAt"`
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	capsuleID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid capsule id")
		return
	}
	rows, err := h.q.ListAttachments(r.Context(), dbgen.ListAttachmentsParams{CapsuleID: capsuleID, UserID: uid})
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	out := make([]attachmentDTO, 0, len(rows))
	for _, a := range rows {
		out = append(out, attachmentDTO{
			ID: a.ID.String(), Filename: a.Filename, ContentType: a.ContentType,
			SizeBytes: a.SizeBytes, CreatedAt: a.CreatedAt.Time.Format(time.RFC3339),
		})
	}
	httpx.JSON(w, http.StatusOK, out)
}

func (h *Handler) Download(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	if h.store == nil {
		httpx.Error(w, http.StatusServiceUnavailable, "attachments storage not configured")
		return
	}
	id, err := uuid.Parse(chi.URLParam(r, "aid"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	row, err := h.q.GetAttachment(r.Context(), dbgen.GetAttachmentParams{ID: id, UserID: uid})
	if err != nil {
		httpx.Error(w, http.StatusNotFound, "not found")
		return
	}
	url, err := h.store.PresignGet(r.Context(), row.StorageKey, 5*time.Minute)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"url": url, "expiresIn": 300, "filename": row.Filename})
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	id, err := uuid.Parse(chi.URLParam(r, "aid"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	row, err := h.q.GetAttachment(r.Context(), dbgen.GetAttachmentParams{ID: id, UserID: uid})
	if err != nil {
		httpx.Error(w, http.StatusNotFound, "not found")
		return
	}
	if h.store != nil {
		_ = h.store.Delete(r.Context(), row.StorageKey)
	}
	if err := h.q.DeleteAttachment(r.Context(), dbgen.DeleteAttachmentParams{ID: id, UserID: uid}); err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// safeName strips path separators and oddities so the storage key stays sane.
func safeName(in string) string {
	in = strings.ReplaceAll(in, "/", "_")
	in = strings.ReplaceAll(in, "\\", "_")
	in = strings.Trim(in, " .")
	if in == "" {
		return "file"
	}
	if len(in) > 120 {
		in = in[:120]
	}
	return in
}

var _ = errors.New // keep import in case service wraps in future
