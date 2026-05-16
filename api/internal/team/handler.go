package team

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/yusii/dropdat/api/internal/auth"
	"github.com/yusii/dropdat/api/internal/db/dbgen"
	"github.com/yusii/dropdat/api/internal/httpx"
)

// CanJoin returns true when the user's plan allows joining a team.
// Wired by main.go to gate on subscription tier.
type CanJoin func(ctx context.Context, userID string) bool

type Handler struct {
	svc     *Service
	canJoin CanJoin
}

func NewHandler(svc *Service, canJoin CanJoin) *Handler {
	if canJoin == nil {
		canJoin = func(context.Context, string) bool { return true }
	}
	return &Handler{svc: svc, canJoin: canJoin}
}

func (h *Handler) Mount(r chi.Router) {
	r.Get("/teams", h.List)
	r.Post("/teams", h.Create)
	r.Post("/teams/join", h.Join)
	r.Get("/teams/{id}", h.Get)
	r.Patch("/teams/{id}", h.Rename)
	r.Delete("/teams/{id}", h.Delete)
	r.Post("/teams/{id}/rotate-link", h.RotateLink)
	r.Get("/teams/{id}/members", h.Members)
	r.Patch("/teams/{id}/members/{user_id}", h.SetRole)
	r.Delete("/teams/{id}/members/{user_id}", h.Remove)
	r.Post("/capsules/{id}/team", h.ShareCapsule)
	r.Post("/folders/{id}/team", h.ShareFolder)
	r.Get("/teams/{id}/capsules", h.TeamCapsules)
	r.Get("/teams/{id}/folders", h.TeamFolders)
}

func (h *Handler) TeamCapsules(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	if _, err := h.svc.MyRole(r.Context(), id, uid); err != nil {
		httpx.Error(w, http.StatusForbidden, "not a member")
		return
	}
	rows, err := h.svc.TeamCapsules(r.Context(), id)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	if rows == nil {
		rows = []dbgen.Capsule{}
	}
	httpx.JSON(w, http.StatusOK, rows)
}

func (h *Handler) TeamFolders(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	if _, err := h.svc.MyRole(r.Context(), id, uid); err != nil {
		httpx.Error(w, http.StatusForbidden, "not a member")
		return
	}
	rows, err := h.svc.TeamFolders(r.Context(), id)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	if rows == nil {
		rows = []dbgen.Folder{}
	}
	httpx.JSON(w, http.StatusOK, rows)
}

// ----- DTOs -----

type teamDTO struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	OwnerID     string  `json:"owner_user_id"`
	JoinToken   *string `json:"join_token,omitempty"`
	JoinEnabled bool    `json:"join_enabled"`
	MyRole      string  `json:"my_role,omitempty"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}

func toTeamDTO(t *dbgen.Team, role string, includeToken bool) teamDTO {
	dto := teamDTO{
		ID:          t.ID.String(),
		Name:        t.Name,
		OwnerID:     t.OwnerUserID,
		JoinEnabled: t.JoinEnabled,
		MyRole:      role,
		CreatedAt:   t.CreatedAt.Time.Format(time.RFC3339),
		UpdatedAt:   t.UpdatedAt.Time.Format(time.RFC3339),
	}
	if includeToken {
		dto.JoinToken = t.JoinToken
	}
	return dto
}

// ----- handlers -----

type createReq struct {
	Name string `json:"name"`
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	if !h.canJoin(r.Context(), uid) {
		httpx.Error(w, http.StatusPaymentRequired, "teams require a paid plan")
		return
	}
	var body createReq
	_ = httpx.DecodeJSON(r, &body)
	t, err := h.svc.Create(r.Context(), uid, body.Name)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusCreated, toTeamDTO(t, RoleOwner, true))
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	rows, err := h.svc.ListForUser(r.Context(), uid)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	out := make([]teamDTO, 0, len(rows))
	for _, row := range rows {
		t := dbgen.Team{
			ID:          row.ID,
			Name:        row.Name,
			OwnerUserID: row.OwnerUserID,
			JoinToken:   row.JoinToken,
			JoinEnabled: row.JoinEnabled,
			CreatedAt:   row.CreatedAt,
			UpdatedAt:   row.UpdatedAt,
		}
		out = append(out, toTeamDTO(&t, row.MyRole, row.MyRole == RoleOwner || row.MyRole == RoleAdmin))
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
	t, err := h.svc.Get(r.Context(), id)
	if err != nil {
		httpx.Error(w, http.StatusNotFound, "not found")
		return
	}
	role, err := h.svc.MyRole(r.Context(), id, uid)
	if err != nil {
		httpx.Error(w, http.StatusForbidden, "not a member")
		return
	}
	includeToken := role == RoleOwner || role == RoleAdmin
	httpx.JSON(w, http.StatusOK, toTeamDTO(t, role, includeToken))
}

func (h *Handler) Rename(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	var body createReq
	if err := httpx.DecodeJSON(r, &body); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	t, err := h.svc.Rename(r.Context(), id, uid, body.Name)
	if err != nil {
		writeErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, toTeamDTO(t, RoleOwner, true))
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

func (h *Handler) RotateLink(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	tok, err := h.svc.RotateJoinToken(r.Context(), id, uid)
	if err != nil {
		writeErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]string{"join_token": tok})
}

type joinReq struct {
	Token string `json:"token"`
}

func (h *Handler) Join(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	if !h.canJoin(r.Context(), uid) {
		httpx.Error(w, http.StatusPaymentRequired, "joining a team requires a paid plan")
		return
	}
	var body joinReq
	if err := httpx.DecodeJSON(r, &body); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	t, err := h.svc.Join(r.Context(), body.Token, uid)
	if err != nil {
		writeErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, toTeamDTO(t, RoleMember, false))
}

type memberDTO struct {
	UserID   string `json:"user_id"`
	Role     string `json:"role"`
	JoinedAt string `json:"joined_at"`
}

func (h *Handler) Members(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	if _, err := h.svc.MyRole(r.Context(), id, uid); err != nil {
		httpx.Error(w, http.StatusForbidden, "not a member")
		return
	}
	rows, err := h.svc.Members(r.Context(), id)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	out := make([]memberDTO, 0, len(rows))
	for _, m := range rows {
		out = append(out, memberDTO{
			UserID:   m.UserID,
			Role:     m.Role,
			JoinedAt: m.JoinedAt.Time.Format(time.RFC3339),
		})
	}
	httpx.JSON(w, http.StatusOK, out)
}

type roleReq struct {
	Role string `json:"role"`
}

func (h *Handler) SetRole(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	target := chi.URLParam(r, "user_id")
	var body roleReq
	if err := httpx.DecodeJSON(r, &body); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.svc.Promote(r.Context(), id, uid, target, body.Role); err != nil {
		writeErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) Remove(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	target := chi.URLParam(r, "user_id")
	if err := h.svc.Remove(r.Context(), id, uid, target); err != nil {
		writeErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type shareReq struct {
	TeamID string `json:"team_id"` // empty string = unshare
}

func (h *Handler) ShareCapsule(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	capsuleID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	var body shareReq
	_ = httpx.DecodeJSON(r, &body)
	var teamPtr *uuid.UUID
	if body.TeamID != "" {
		t, err := uuid.Parse(body.TeamID)
		if err != nil {
			httpx.Error(w, http.StatusBadRequest, "invalid team_id")
			return
		}
		teamPtr = &t
	}
	if err := h.svc.ShareCapsule(r.Context(), capsuleID, uid, teamPtr); err != nil {
		writeErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) ShareFolder(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	folderID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	var body shareReq
	_ = httpx.DecodeJSON(r, &body)
	var teamPtr *uuid.UUID
	if body.TeamID != "" {
		t, err := uuid.Parse(body.TeamID)
		if err != nil {
			httpx.Error(w, http.StatusBadRequest, "invalid team_id")
			return
		}
		teamPtr = &t
	}
	if err := h.svc.ShareFolder(r.Context(), folderID, uid, teamPtr); err != nil {
		writeErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func writeErr(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		httpx.Error(w, http.StatusNotFound, err.Error())
	case errors.Is(err, ErrInviteToken):
		httpx.Error(w, http.StatusBadRequest, err.Error())
	case errors.Is(err, ErrForbidden):
		httpx.Error(w, http.StatusForbidden, err.Error())
	default:
		httpx.Error(w, http.StatusInternalServerError, err.Error())
	}
}
