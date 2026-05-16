package billing

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/yusii/dropdat/api/internal/auth"
	"github.com/yusii/dropdat/api/internal/db/dbgen"
	"github.com/yusii/dropdat/api/internal/httpx"
)

type Handler struct {
	q      *dbgen.Queries
	dodo   *DodoClient
	appURL string
}

func NewHandler(q *dbgen.Queries, dodo *DodoClient) *Handler {
	app := os.Getenv("APP_URL")
	if app == "" {
		app = "https://capsule.dropdat.app"
	}
	return &Handler{q: q, dodo: dodo, appURL: app}
}

// Mount registers authenticated billing endpoints under the parent router.
// The webhook is mounted separately on the public router.
func (h *Handler) Mount(r chi.Router) {
	r.Get("/billing/subscription", h.GetSubscription)
	r.Post("/billing/checkout", h.CreateCheckout)
	r.Get("/billing/portal", h.PortalLink)
	r.Post("/billing/sync", h.Sync)
	r.Post("/billing/cancel", h.Cancel)
}

// MountWebhook attaches the unauthenticated dodo webhook receiver.
func (h *Handler) MountWebhook(r chi.Router) {
	r.Post("/webhooks/dodopayments", h.HandleWebhook)
}

type subscriptionResponse struct {
	Tier               string   `json:"tier"`
	Status             string   `json:"status"`
	ProductID          string   `json:"product_id,omitempty"`
	CurrentPeriodEnd   string   `json:"current_period_end,omitempty"`
	CapsuleLimit       int64    `json:"capsule_limit"`
	CapsulesUsed       int64    `json:"capsules_used"`
	Scopes             []string `json:"scopes"`
	HasCustomer        bool     `json:"has_customer"`
}

func (h *Handler) GetSubscription(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	tier := TierBasic
	resp := subscriptionResponse{Tier: tier, Status: "inactive"}

	sub, err := h.q.GetSubscription(r.Context(), uid)
	if err == nil {
		tier = sub.Tier
		resp.Tier = tier
		resp.Status = sub.Status
		if sub.ProductID != nil {
			resp.ProductID = *sub.ProductID
		}
		if sub.CurrentPeriodEnd.Valid {
			resp.CurrentPeriodEnd = sub.CurrentPeriodEnd.Time.Format(time.RFC3339)
		}
		resp.HasCustomer = sub.DodopaymentsCustomerID != nil && *sub.DodopaymentsCustomerID != ""
	}

	lim := TierLimits(tier)
	resp.CapsuleLimit = lim.CapsuleLimit
	resp.Scopes = lim.Scopes

	used, err := h.q.CountUserCapsulesActive(r.Context(), uid)
	if err == nil {
		resp.CapsulesUsed = used
	}

	httpx.JSON(w, http.StatusOK, resp)
}

type checkoutRequest struct {
	Plan            string `json:"plan"`
	BillingInterval string `json:"billing_interval"`
	Email           string `json:"email"`
}

type checkoutResponseDTO struct {
	Link string `json:"link"`
}

func (h *Handler) CreateCheckout(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	if h.dodo == nil {
		httpx.Error(w, http.StatusServiceUnavailable, "billing not configured")
		return
	}

	var body checkoutRequest
	if err := httpx.DecodeJSON(r, &body); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	plan := strings.ToLower(strings.TrimSpace(body.Plan))
	interval := strings.ToLower(strings.TrimSpace(body.BillingInterval))
	if interval == "" {
		interval = "monthly"
	}
	productID := ProductIDForPlan(plan, interval)
	if productID == "" {
		httpx.Error(w, http.StatusBadRequest, "invalid plan or billing interval")
		return
	}

	req := CheckoutRequest{
		ProductCart: []CheckoutLineItem{{ProductID: productID, Quantity: 1}},
		ReturnURL:   h.appURL + "/billing?status=completed",
		AllowedPaymentMethodType: []string{
			"credit", "debit", "apple_pay", "google_pay",
		},
		ShowSavedPaymentMethods: true,
		Metadata: map[string]string{
			"user_id":          uid,
			"plan":             plan,
			"billing_interval": interval,
		},
	}
	if body.Email != "" {
		req.Customer = &CheckoutCustomer{Email: body.Email}
		req.Metadata["customer_email"] = body.Email
	}

	out, err := h.dodo.CreateCheckoutSession(r.Context(), req)
	if err != nil {
		slog.Error("dodo checkout failed", "err", err, "user", uid, "plan", plan)
		httpx.Error(w, http.StatusBadGateway, "checkout failed")
		return
	}
	httpx.JSON(w, http.StatusOK, checkoutResponseDTO{Link: out.CheckoutURL})
}

type syncRequest struct {
	SubscriptionID string `json:"subscription_id"`
}

// Sync pulls subscription state directly from dodopayments and applies it
// locally. The frontend calls this after the user returns from the hosted
// checkout — bypasses any webhook-delivery delay or misconfiguration.
func (h *Handler) Sync(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	if h.dodo == nil {
		httpx.Error(w, http.StatusServiceUnavailable, "billing not configured")
		return
	}

	var body syncRequest
	_ = httpx.DecodeJSON(r, &body)
	subID := strings.TrimSpace(body.SubscriptionID)
	if subID == "" {
		// Fall back to the user's last saved subscription id.
		if sub, err := h.q.GetSubscription(r.Context(), uid); err == nil &&
			sub.DodopaymentsSubscriptionID != nil {
			subID = *sub.DodopaymentsSubscriptionID
		}
	}
	if subID == "" {
		httpx.Error(w, http.StatusBadRequest, "subscription_id required")
		return
	}

	ds, err := h.dodo.GetSubscription(r.Context(), subID)
	if err != nil {
		slog.Error("dodo subscription fetch failed", "err", err, "sub", subID)
		httpx.Error(w, http.StatusBadGateway, "lookup failed")
		return
	}

	// Trust the metadata user_id when present (the checkout we created set
	// it). Refuse to apply a subscription that belongs to someone else.
	if metaUser, ok := ds.Metadata["user_id"].(string); ok && metaUser != "" && metaUser != uid {
		httpx.Error(w, http.StatusForbidden, "subscription does not belong to this user")
		return
	}

	if err := h.applySubscription(r.Context(), uid, ds); err != nil {
		slog.Error("apply subscription", "err", err, "user", uid)
		httpx.Error(w, http.StatusInternalServerError, "apply failed")
		return
	}
	h.GetSubscription(w, r)
}

// Cancel stops the recurring subscription at dodopayments. Local state
// flips to cancelled on the next webhook OR the next /billing/sync.
func (h *Handler) Cancel(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	if h.dodo == nil {
		httpx.Error(w, http.StatusServiceUnavailable, "billing not configured")
		return
	}
	sub, err := h.q.GetSubscription(r.Context(), uid)
	if err != nil || sub.DodopaymentsSubscriptionID == nil || *sub.DodopaymentsSubscriptionID == "" {
		httpx.Error(w, http.StatusNotFound, "no active subscription")
		return
	}
	if err := h.dodo.CancelSubscription(r.Context(), *sub.DodopaymentsSubscriptionID); err != nil {
		slog.Error("dodo cancel failed", "err", err, "sub", *sub.DodopaymentsSubscriptionID)
		httpx.Error(w, http.StatusBadGateway, "cancel failed")
		return
	}
	// Optimistically mark cancelled locally so the UI updates immediately.
	_, _ = h.q.UpsertSubscription(r.Context(), dbgen.UpsertSubscriptionParams{
		UserID:                     uid,
		Tier:                       TierBasic,
		Status:                     "cancelled",
		DodopaymentsCustomerID:     sub.DodopaymentsCustomerID,
		DodopaymentsSubscriptionID: sub.DodopaymentsSubscriptionID,
		ProductID:                  sub.ProductID,
		CurrentPeriodStart:         sub.CurrentPeriodStart,
		CurrentPeriodEnd:           sub.CurrentPeriodEnd,
	})
	h.GetSubscription(w, r)
}

// applySubscription writes a dodopayments Subscription into the local DB.
// Shared between webhook + manual sync paths.
func (h *Handler) applySubscription(ctx context.Context, uid string, ds *Subscription) error {
	tier := TierForProductID(ds.ProductID)
	status := strings.ToLower(ds.Status)
	if status == "active" || status == "on_hold" || status == "trialing" {
		// keep tier
	} else if status == "cancelled" || status == "expired" || status == "failed" || status == "paused" {
		tier = TierBasic
	}
	_, err := h.q.UpsertSubscription(ctx, dbgen.UpsertSubscriptionParams{
		UserID:                     uid,
		Tier:                       tier,
		Status:                     status,
		DodopaymentsCustomerID:     strPtr(ds.Customer.CustomerID),
		DodopaymentsSubscriptionID: strPtr(ds.SubscriptionID),
		ProductID:                  strPtr(ds.ProductID),
		CurrentPeriodStart:         parseTS(ds.CreatedAt),
		CurrentPeriodEnd:           parseTS(ds.NextBillingDate),
	})
	return err
}

func (h *Handler) PortalLink(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	if h.dodo == nil {
		httpx.Error(w, http.StatusServiceUnavailable, "billing not configured")
		return
	}
	sub, err := h.q.GetSubscription(r.Context(), uid)
	if err != nil || sub.DodopaymentsCustomerID == nil || *sub.DodopaymentsCustomerID == "" {
		httpx.Error(w, http.StatusNotFound, "no active subscription")
		return
	}
	link, err := h.dodo.CustomerPortalLink(r.Context(), *sub.DodopaymentsCustomerID)
	if err != nil {
		slog.Error("dodo portal failed", "err", err, "user", uid)
		httpx.Error(w, http.StatusBadGateway, "portal unavailable")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]string{"link": link})
}

// ----- webhook -----

type dodoCustomer struct {
	CustomerID string `json:"customer_id"`
	Email      string `json:"email"`
	Name       string `json:"name"`
}

type dodoData struct {
	SubscriptionID  string                 `json:"subscription_id"`
	ProductID       string                 `json:"product_id"`
	Status          string                 `json:"status"`
	CreatedAt       string                 `json:"created_at"`
	NextBillingDate string                 `json:"next_billing_date"`
	Customer        dodoCustomer           `json:"customer"`
	Metadata        map[string]interface{} `json:"metadata,omitempty"`
}

type dodoEvent struct {
	Type      string   `json:"type"`
	Data      dodoData `json:"data"`
	Timestamp string   `json:"timestamp"`
}

func (h *Handler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	raw, err := io.ReadAll(r.Body)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "read body")
		return
	}
	defer r.Body.Close()

	secret := os.Getenv("DODO_WEBHOOK_SECRET")
	sig := r.Header.Get("Dodo-Signature")
	if sig == "" {
		sig = r.Header.Get("dodo-signature")
	}
	if secret != "" {
		if !verifyDodoSig(raw, sig, secret) {
			httpx.Error(w, http.StatusBadRequest, "invalid signature")
			return
		}
	} else {
		slog.Warn("DODO_WEBHOOK_SECRET unset; skipping signature verification")
	}

	var evt dodoEvent
	if err := json.Unmarshal(raw, &evt); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid payload")
		return
	}

	uid, _ := evt.Data.Metadata["user_id"].(string)
	if uid == "" {
		// Cannot resolve user without metadata. Acknowledge so dodo doesn't retry forever.
		slog.Warn("dodo webhook missing user_id metadata", "type", evt.Type, "sub", evt.Data.SubscriptionID)
		httpx.JSON(w, http.StatusOK, map[string]string{"ok": "skipped"})
		return
	}

	if err := h.applyEvent(r.Context(), uid, evt); err != nil {
		slog.Error("dodo webhook apply", "err", err, "type", evt.Type, "user", uid)
		httpx.Error(w, http.StatusInternalServerError, "apply failed")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handler) applyEvent(ctx context.Context, uid string, evt dodoEvent) error {
	tier := TierForProductID(evt.Data.ProductID)
	custID := evt.Data.Customer.CustomerID
	subID := evt.Data.SubscriptionID

	periodStart := parseTS(evt.Data.CreatedAt)
	periodEnd := parseTS(evt.Data.NextBillingDate)

	switch evt.Type {
	case "subscription.active", "subscription.renewed", "subscription.created":
		_, err := h.q.UpsertSubscription(ctx, dbgen.UpsertSubscriptionParams{
			UserID:                     uid,
			Tier:                       tier,
			Status:                     "active",
			DodopaymentsCustomerID:     strPtr(custID),
			DodopaymentsSubscriptionID: strPtr(subID),
			ProductID:                  strPtr(evt.Data.ProductID),
			CurrentPeriodStart:         periodStart,
			CurrentPeriodEnd:           periodEnd,
		})
		return err

	case "subscription.cancelled", "subscription.expired", "subscription.failed", "subscription.paused":
		// Downgrade to basic, mark inactive.
		_, err := h.q.UpsertSubscription(ctx, dbgen.UpsertSubscriptionParams{
			UserID:                     uid,
			Tier:                       TierBasic,
			Status:                     evt.Type[len("subscription."):],
			DodopaymentsCustomerID:     strPtr(custID),
			DodopaymentsSubscriptionID: strPtr(subID),
			ProductID:                  strPtr(evt.Data.ProductID),
			CurrentPeriodStart:         periodStart,
			CurrentPeriodEnd:           periodEnd,
		})
		return err

	default:
		slog.Info("dodo webhook unhandled type", "type", evt.Type)
		return nil
	}
}

func verifyDodoSig(payload []byte, sig, secret string) bool {
	if sig == "" {
		return false
	}
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(payload)
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(strings.ToLower(expected)), []byte(strings.ToLower(strings.TrimSpace(sig))))
}

func parseTS(s string) pgtype.Timestamptz {
	if s == "" {
		return pgtype.Timestamptz{}
	}
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return pgtype.Timestamptz{}
	}
	return pgtype.Timestamptz{Time: t, Valid: true}
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

