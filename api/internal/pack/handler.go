package pack

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/yusii/dropdat/api/internal/auth"
	"github.com/yusii/dropdat/api/internal/db/dbgen"
	"github.com/yusii/dropdat/api/internal/httpx"
)

// CanCreate returns true when the user's plan allows creating context packs.
type CanCreate func(ctx context.Context, userID string) bool

type Handler struct {
	svc       *Service
	canCreate CanCreate
}

func NewHandler(svc *Service, canCreate CanCreate) *Handler {
	if canCreate == nil {
		canCreate = func(context.Context, string) bool { return true }
	}
	return &Handler{svc: svc, canCreate: canCreate}
}

func (h *Handler) Mount(r chi.Router) {
	r.Get("/packs", h.List)
	r.Post("/packs", h.Create)
	r.Get("/packs/{id}", h.Get)
	r.Patch("/packs/{id}", h.Update)
	r.Delete("/packs/{id}", h.Delete)
	r.Get("/packs/{id}/items", h.Items)
	r.Post("/packs/{id}/items", h.AddItem)
	r.Delete("/packs/{id}/items/{capsule_id}", h.RemoveItem)
	r.Post("/packs/{id}/autofill", h.AutoFill)
	r.Get("/packs/{id}/render", h.Render)
	r.Get("/capsules/{id}/related", h.Related)
}

// ----- DTOs -----

type packDTO struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Goal      string `json:"goal"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

func toPackDTO(p *dbgen.ContextPack) packDTO {
	return packDTO{
		ID:        p.ID.String(),
		Name:      p.Name,
		Goal:      p.Goal,
		CreatedAt: p.CreatedAt.Time.Format(time.RFC3339),
		UpdatedAt: p.UpdatedAt.Time.Format(time.RFC3339),
	}
}

type packItemDTO struct {
	CapsuleID string `json:"capsule_id"`
	Title     string `json:"title"`
	Summary   string `json:"summary"`
	Source    string `json:"source"`
	Position  int32  `json:"position"`
}

// ----- handlers -----

type packReq struct {
	Name string `json:"name"`
	Goal string `json:"goal"`
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	if !h.canCreate(r.Context(), uid) {
		httpx.Error(w, http.StatusPaymentRequired, "context packs require a paid plan")
		return
	}
	var body packReq
	_ = httpx.DecodeJSON(r, &body)
	p, err := h.svc.Create(r.Context(), uid, body.Name, body.Goal)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusCreated, toPackDTO(p))
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	rows, err := h.svc.List(r.Context(), uid)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	out := make([]packDTO, 0, len(rows))
	for i := range rows {
		out = append(out, toPackDTO(&rows[i]))
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
	p, err := h.svc.Get(r.Context(), id, uid)
	if err != nil {
		writeErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, toPackDTO(p))
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	var body packReq
	if err := httpx.DecodeJSON(r, &body); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	p, err := h.svc.Update(r.Context(), id, uid, body.Name, body.Goal)
	if err != nil {
		writeErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, toPackDTO(p))
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.svc.Delete(r.Context(), id, uid); err != nil {
		writeErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) Items(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	rows, err := h.svc.Items(r.Context(), id, uid)
	if err != nil {
		writeErr(w, err)
		return
	}
	out := make([]packItemDTO, 0, len(rows))
	for _, r := range rows {
		out = append(out, packItemDTO{
			CapsuleID: r.ID.String(),
			Title:     r.Title,
			Summary:   r.Summary,
			Source:    r.Source,
			Position:  r.Position,
		})
	}
	httpx.JSON(w, http.StatusOK, out)
}

type addItemReq struct {
	CapsuleID string `json:"capsule_id"`
}

func (h *Handler) AddItem(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	packID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid pack id")
		return
	}
	var body addItemReq
	if err := httpx.DecodeJSON(r, &body); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	capsuleID, err := uuid.Parse(body.CapsuleID)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid capsule id")
		return
	}
	if err := h.svc.AddCapsule(r.Context(), packID, capsuleID, uid); err != nil {
		writeErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) RemoveItem(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	packID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid pack id")
		return
	}
	capsuleID, err := uuid.Parse(chi.URLParam(r, "capsule_id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid capsule id")
		return
	}
	if err := h.svc.RemoveCapsule(r.Context(), packID, capsuleID, uid); err != nil {
		writeErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type autofillReq struct {
	SeedCapsuleID string `json:"seed_capsule_id"`
	Limit         int    `json:"limit"`
}

func (h *Handler) AutoFill(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	packID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid pack id")
		return
	}
	var body autofillReq
	if err := httpx.DecodeJSON(r, &body); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	seed, err := uuid.Parse(body.SeedCapsuleID)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid seed capsule id")
		return
	}
	added, err := h.svc.AutoFill(r.Context(), packID, seed, uid, body.Limit)
	if err != nil {
		writeErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]int{"added": added})
}

func (h *Handler) Render(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	md, err := h.svc.Render(r.Context(), id, uid)
	if err != nil {
		writeErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]string{"markdown": md})
}

func (h *Handler) Related(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	limit := 10
	if l := r.URL.Query().Get("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil {
			limit = n
		}
	}
	rows, err := h.svc.Related(r.Context(), id, uid, limit)
	if err != nil {
		if errors.Is(err, ErrNoEmbedding) {
			// Caller will see an empty list — embed is still pending or capsule
			// has no embedding (e.g. OPENAI_API_KEY not configured).
			httpx.JSON(w, http.StatusOK, []RelatedCapsule{})
			return
		}
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	if rows == nil {
		rows = []RelatedCapsule{}
	}
	httpx.JSON(w, http.StatusOK, rows)
}

func writeErr(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		httpx.Error(w, http.StatusNotFound, err.Error())
	case errors.Is(err, ErrCapsuleAccess):
		httpx.Error(w, http.StatusForbidden, err.Error())
	case errors.Is(err, ErrNoEmbedding):
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
	default:
		httpx.Error(w, http.StatusInternalServerError, err.Error())
	}
}
