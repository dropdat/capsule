package capsule

import (
	"context"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/yusii/dropdat/api/internal/auth"
	"github.com/yusii/dropdat/api/internal/httpx"
)

// CanShare returns true when the user's current plan allows public sharing.
type CanShare func(ctx context.Context, userID string) bool

type Handler struct {
	svc      *Service
	canShare CanShare
}

func NewHandler(svc *Service, canShare CanShare) *Handler {
	if canShare == nil {
		canShare = func(context.Context, string) bool { return false }
	}
	return &Handler{svc: svc, canShare: canShare}
}

func (h *Handler) Mount(r chi.Router) {
	r.Post("/capsules", h.Create)
	r.Get("/capsules", h.List)
	r.Get("/capsules/{id}", h.Get)
	r.Patch("/capsules/{id}", h.Patch)
	r.Delete("/capsules/{id}", h.Delete)
	r.Post("/capsules/{id}/versions", h.CreateVersion)
	r.Get("/capsules/{id}/lineage", h.Lineage)
	r.Post("/capsules/search", h.Search)
	r.Post("/capsules/{id}/share", h.Share)
	r.Delete("/capsules/{id}/share", h.Unshare)
}

// MountPublic mounts unauthenticated share-link reads.
func (h *Handler) MountPublic(r chi.Router) {
	r.Get("/public/capsules/share/{token}", h.PublicGet)
}

func (h *Handler) Share(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	if !h.canShare(r.Context(), uid) {
		httpx.Error(w, http.StatusPaymentRequired, "sharing requires Ultimate plan")
		return
	}
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	tok, err := h.svc.Share(r.Context(), uid, id)
	if err != nil {
		writeServiceErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]string{"share_token": tok})
}

func (h *Handler) Unshare(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.svc.Unshare(r.Context(), uid, id); err != nil {
		writeServiceErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) PublicGet(w http.ResponseWriter, r *http.Request) {
	token := chi.URLParam(r, "token")
	c, err := h.svc.GetByShareToken(r.Context(), token)
	if err != nil {
		writeServiceErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, c)
}

func (h *Handler) Search(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	var body SearchRequest
	if err := httpx.DecodeJSON(r, &body); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	hits, err := h.svc.Search(r.Context(), uid, body)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, hits)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	var body CreateRequest
	if err := httpx.DecodeJSON(r, &body); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	c, err := h.svc.Create(r.Context(), uid, body)
	if err != nil {
		writeServiceErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusCreated, c)
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	q := r.URL.Query()
	f := ListFilters{
		Tag:    q.Get("tag"),
		Search: q.Get("q"),
	}
	if l := q.Get("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil {
			f.Limit = int32(n)
		}
	}
	out, err := h.svc.List(r.Context(), uid, f)
	if err != nil {
		writeServiceErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, out)
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	c, err := h.svc.Get(r.Context(), uid, id)
	if err != nil {
		writeServiceErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, c)
}

func (h *Handler) Patch(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	var body PatchRequest
	if err := httpx.DecodeJSON(r, &body); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	c, err := h.svc.Patch(r.Context(), uid, id, body)
	if err != nil {
		writeServiceErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, c)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.svc.Delete(r.Context(), uid, id); err != nil {
		writeServiceErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) CreateVersion(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	parentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	var body VersionRequest
	if err := httpx.DecodeJSON(r, &body); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	c, err := h.svc.CreateVersion(r.Context(), uid, parentID, body)
	if err != nil {
		writeServiceErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusCreated, c)
}

func (h *Handler) Lineage(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	out, err := h.svc.Lineage(r.Context(), uid, id)
	if err != nil {
		writeServiceErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, out)
}

func writeServiceErr(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		httpx.Error(w, http.StatusNotFound, err.Error())
	case errors.Is(err, ErrInvalidSource), errors.Is(err, ErrEmptyTitle), errors.Is(err, ErrInvalidID):
		httpx.Error(w, http.StatusBadRequest, err.Error())
	case errors.Is(err, ErrCapsuleLimit):
		httpx.Error(w, http.StatusPaymentRequired, err.Error())
	default:
		httpx.Error(w, http.StatusInternalServerError, "internal error")
	}
}
