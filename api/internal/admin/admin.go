// Package admin owns the admin dashboard endpoints + the middleware that
// (a) tracks per-user activity, (b) blocks banned users.
//
// Admin access is gated by the ADMIN_USER_IDS env var — a comma-separated
// list of Clerk user ids. Nothing else grants admin; the empty list locks
// every admin route by default.
package admin

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/yusii/dropdat/api/internal/auth"
	"github.com/yusii/dropdat/api/internal/clerk"
	"github.com/yusii/dropdat/api/internal/db/dbgen"
	"github.com/yusii/dropdat/api/internal/httpx"
)

type Handler struct {
	q       *dbgen.Queries
	clerk   *clerk.Client // nil = no name lookup, fall back to raw ids
	adminID map[string]struct{}
}

func NewHandler(q *dbgen.Queries, ck *clerk.Client) *Handler {
	ids := strings.Split(os.Getenv("ADMIN_USER_IDS"), ",")
	set := make(map[string]struct{}, len(ids))
	for _, id := range ids {
		id = strings.TrimSpace(id)
		if id != "" {
			set[id] = struct{}{}
		}
	}
	return &Handler{q: q, clerk: ck, adminID: set}
}

func (h *Handler) IsAdmin(userID string) bool {
	_, ok := h.adminID[userID]
	return ok
}

func (h *Handler) Mount(r chi.Router) {
	r.Get("/admin/me", h.Me)
	r.Get("/admin/stats", h.guard(h.Stats))
	r.Get("/admin/users", h.guard(h.Users))
	r.Post("/admin/users/{id}/ban", h.guard(h.Ban))
	r.Post("/admin/users/{id}/unban", h.guard(h.Unban))
	r.Get("/admin/users/{id}/capsules", h.guard(h.UserCapsules))
}

func (h *Handler) guard(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid := auth.UserID(r.Context())
		if uid == "" {
			httpx.Error(w, http.StatusUnauthorized, "auth required")
			return
		}
		if !h.IsAdmin(uid) {
			httpx.Error(w, http.StatusForbidden, "admin only")
			return
		}
		next(w, r)
	}
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	httpx.JSON(w, http.StatusOK, map[string]bool{"admin": uid != "" && h.IsAdmin(uid)})
}

func (h *Handler) Stats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.q.AdminStats(r.Context())
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	tiers, _ := h.q.AdminTierBreakdown(r.Context())
	tierOut := make([]map[string]any, 0, len(tiers))
	for _, t := range tiers {
		tierOut = append(tierOut, map[string]any{"tier": t.Tier, "users": t.Users})
	}
	httpx.JSON(w, http.StatusOK, map[string]any{
		"totalUsers":       stats.TotalUsers,
		"liveUsers":        stats.LiveUsers,
		"active24h":        stats.Active24h,
		"totalCapsules":    stats.TotalCapsules,
		"totalPacks":       stats.TotalPacks,
		"totalAttachments": stats.TotalAttachments,
		"attachmentBytes":  stats.AttachmentBytes,
		"bannedUsers":      stats.BannedUsers,
		"tiers":            tierOut,
	})
}

type userDTO struct {
	UserID             string `json:"userId"`
	DisplayName        string `json:"displayName"`
	Email              string `json:"email"`
	AvatarURL          string `json:"avatarUrl"`
	Tier               string `json:"tier"`
	SubscriptionStatus string `json:"subscriptionStatus"`
	CapsuleCount       int64  `json:"capsuleCount"`
	LastSeenAt         string `json:"lastSeenAt"`
	LastPath           string `json:"lastPath"`
	RequestCount       int64  `json:"requestCount"`
	Banned             bool   `json:"banned"`
	BannedReason       string `json:"bannedReason"`
}

func (h *Handler) Users(w http.ResponseWriter, r *http.Request) {
	limit := 200
	if s := r.URL.Query().Get("limit"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 && n <= 1000 {
			limit = n
		}
	}
	rows, err := h.q.AdminUsersList(r.Context(), int32(limit))
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	// Batch-resolve display names via Clerk. nil client (CLERK_SECRET_KEY
	// unset) → fall back to bare ids.
	ids := make([]string, 0, len(rows))
	for _, row := range rows {
		ids = append(ids, row.UserID)
	}
	people := map[string]clerk.User{}
	if h.clerk != nil {
		people = h.clerk.GetUsers(r.Context(), ids)
	}
	out := make([]userDTO, 0, len(rows))
	for _, row := range rows {
		u := people[row.UserID]
		display := row.UserID
		if u.ID != "" {
			display = u.Display()
		}
		out = append(out, userDTO{
			UserID:             row.UserID,
			DisplayName:        display,
			Email:              u.PrimaryEmail,
			AvatarURL:          u.ImageURL,
			Tier:               row.Tier,
			SubscriptionStatus: row.SubscriptionStatus,
			CapsuleCount:       row.CapsuleCount,
			LastSeenAt:         row.LastSeenAt.Time.Format(time.RFC3339),
			LastPath:           row.LastPath,
			RequestCount:       row.RequestCount,
			Banned:             row.BannedAt.Valid,
			BannedReason:       row.BannedReason,
		})
	}
	httpx.JSON(w, http.StatusOK, out)
}

type capsuleSummaryDTO struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Summary   string `json:"summary"`
	Source    string `json:"source"`
	UpdatedAt string `json:"updatedAt"`
	CreatedAt string `json:"createdAt"`
	Version   int32  `json:"version"`
}

// UserCapsules lists the most recent capsules owned by an arbitrary user.
// Admin-only; bypasses the per-user scoping in the normal capsule handler.
func (h *Handler) UserCapsules(w http.ResponseWriter, r *http.Request) {
	uid := chi.URLParam(r, "id")
	if uid == "" {
		httpx.Error(w, http.StatusBadRequest, "id required")
		return
	}
	rows, err := h.q.AdminListUserCapsules(r.Context(), dbgen.AdminListUserCapsulesParams{
		UserID: uid, Limit: 200,
	})
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	out := make([]capsuleSummaryDTO, 0, len(rows))
	for _, c := range rows {
		out = append(out, capsuleSummaryDTO{
			ID:        c.ID.String(),
			Title:     c.Title,
			Summary:   c.Summary,
			Source:    string(c.Source),
			UpdatedAt: c.UpdatedAt.Time.Format(time.RFC3339),
			CreatedAt: c.CreatedAt.Time.Format(time.RFC3339),
			Version:   c.Version,
		})
	}
	httpx.JSON(w, http.StatusOK, out)
}


type banRequest struct {
	Reason string `json:"reason"`
}

func (h *Handler) Ban(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		httpx.Error(w, http.StatusBadRequest, "id required")
		return
	}
	var body banRequest
	_ = json.NewDecoder(r.Body).Decode(&body)
	if err := h.q.SetUserBan(r.Context(), dbgen.SetUserBanParams{UserID: id, BannedReason: body.Reason}); err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) Unban(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		httpx.Error(w, http.StatusBadRequest, "id required")
		return
	}
	if err := h.q.ClearUserBan(r.Context(), id); err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ActivityMiddleware writes last_seen_at + request_count for every
// authenticated request, and blocks banned users with 403. Activity update
// is fire-and-forget so request latency is unaffected.
func ActivityMiddleware(q *dbgen.Queries) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			uid := auth.UserID(r.Context())
			if uid == "" {
				next.ServeHTTP(w, r)
				return
			}
			// Banned-check is synchronous — must precede the handler.
			if over, err := q.GetUserOverride(r.Context(), uid); err == nil && over.BannedAt.Valid {
				reason := over.BannedReason
				if reason == "" {
					reason = "account suspended"
				}
				httpx.Error(w, http.StatusForbidden, reason)
				return
			}
			// Skip activity tracking for admin self-traffic — the dashboard
			// auto-refreshes /admin/stats and /admin/me, which would otherwise
			// pin the admin's last_path to those routes and flicker the table.
			path := r.URL.Path
			if !strings.HasPrefix(path, "/api/v1/admin/") {
				go func(p string) {
					touchCtx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
					defer cancel()
					_ = q.TouchUserActivity(touchCtx, dbgen.TouchUserActivityParams{UserID: uid, LastPath: p})
				}(path)
			}
			next.ServeHTTP(w, r)
		})
	}
}
