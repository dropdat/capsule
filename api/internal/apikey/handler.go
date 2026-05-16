package apikey

import (
	"context"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/yusii/dropdat/api/internal/auth"
	"github.com/yusii/dropdat/api/internal/db/dbgen"
	"github.com/yusii/dropdat/api/internal/httpx"
)

// TierResolver returns the scopes the user's current subscription allows
// them to put on an API key. Wired by main.go via billing.
type TierResolver func(ctx context.Context, userID string) []string

type Handler struct {
	svc     *Service
	allowed TierResolver
}

func NewHandler(svc *Service, allowed TierResolver) *Handler {
	if allowed == nil {
		allowed = func(context.Context, string) []string { return nil }
	}
	return &Handler{svc: svc, allowed: allowed}
}

func (h *Handler) Mount(r chi.Router) {
	r.Post("/api_keys", h.Create)
	r.Get("/api_keys", h.List)
	r.Delete("/api_keys/{id}", h.Revoke)
}

type createRequest struct {
	Name   string   `json:"name"`
	Scopes []string `json:"scopes"`
}

type createResponse struct {
	ID        string   `json:"id"`
	Name      string   `json:"name"`
	Prefix    string   `json:"prefix"`
	Scopes    []string `json:"scopes"`
	CreatedAt string   `json:"created_at"`
	Token     string   `json:"token"` // shown ONCE
}

type listItem struct {
	ID         string   `json:"id"`
	Name       string   `json:"name"`
	Prefix     string   `json:"prefix"`
	Scopes     []string `json:"scopes"`
	LastUsedAt *string  `json:"last_used_at"`
	CreatedAt  string   `json:"created_at"`
	RevokedAt  *string  `json:"revoked_at"`
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	var body createRequest
	_ = httpx.DecodeJSON(r, &body) // body optional

	allowed := h.allowed(r.Context(), uid)
	requested := body.Scopes
	if len(requested) == 0 {
		requested = allowed
	}
	scopes := intersect(requested, allowed)

	created, err := h.svc.Create(r.Context(), CreateInput{
		UserID: uid,
		Name:   body.Name,
		Scopes: scopes,
	})
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusCreated, createResponse{
		ID:        created.Key.ID.String(),
		Name:      created.Key.Name,
		Prefix:    created.Key.Prefix,
		Scopes:    created.Key.Scopes,
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

func intersect(want, allow []string) []string {
	if len(allow) == 0 {
		return []string{}
	}
	set := make(map[string]struct{}, len(allow))
	for _, s := range allow {
		set[s] = struct{}{}
	}
	out := make([]string, 0, len(want))
	for _, s := range want {
		if _, ok := set[s]; ok {
			out = append(out, s)
		}
	}
	return out
}

func toListItem(row dbgen.ListAPIKeysByUserRow) listItem {
	item := listItem{
		ID:        row.ID.String(),
		Name:      row.Name,
		Prefix:    row.Prefix,
		Scopes:    row.Scopes,
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
