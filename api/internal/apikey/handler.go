package apikey

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/yusii/dropdat/api/internal/auth"
	"github.com/yusii/dropdat/api/internal/db/dbgen"
	"github.com/yusii/dropdat/api/internal/httpx"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) Mount(r chi.Router) {
	r.Post("/api_keys", h.Create)
	r.Get("/api_keys", h.List)
	r.Delete("/api_keys/{id}", h.Revoke)
}

type createRequest struct {
	Name string `json:"name"`
}

type createResponse struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Prefix    string  `json:"prefix"`
	CreatedAt string  `json:"created_at"`
	Token     string  `json:"token"` // shown ONCE
}

type listItem struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Prefix     string  `json:"prefix"`
	LastUsedAt *string `json:"last_used_at"`
	CreatedAt  string  `json:"created_at"`
	RevokedAt  *string `json:"revoked_at"`
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	var body createRequest
	_ = httpx.DecodeJSON(r, &body) // name optional

	created, err := h.svc.Create(r.Context(), CreateInput{UserID: uid, Name: body.Name})
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusCreated, createResponse{
		ID:        created.Key.ID.String(),
		Name:      created.Key.Name,
		Prefix:    created.Key.Prefix,
		CreatedAt: created.Key.CreatedAt.Time.Format(time.RFC3339),
		Token:     created.Token,
	})
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
	out := make([]listItem, 0, len(rows))
	for _, row := range rows {
		out = append(out, toListItem(row))
	}
	httpx.JSON(w, http.StatusOK, out)
}

func (h *Handler) Revoke(w http.ResponseWriter, r *http.Request) {
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
	if err := h.svc.Revoke(r.Context(), uid, id); err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func toListItem(row dbgen.ListAPIKeysByUserRow) listItem {
	item := listItem{
		ID:        row.ID.String(),
		Name:      row.Name,
		Prefix:    row.Prefix,
		CreatedAt: row.CreatedAt.Time.Format(time.RFC3339),
	}
	if row.LastUsedAt.Valid {
		ts := row.LastUsedAt.Time.Format(time.RFC3339)
		item.LastUsedAt = &ts
	}
	if row.RevokedAt.Valid {
		ts := row.RevokedAt.Time.Format(time.RFC3339)
		item.RevokedAt = &ts
	}
	return item
}
