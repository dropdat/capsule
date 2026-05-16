package billing

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// DodoClient is a minimal client over the dodopayments REST API. The official
// SDK isn't available for Go yet, so we hand-roll the few endpoints we need:
// checkout sessions and customer portal links.
type DodoClient struct {
	baseURL string
	apiKey  string
	http    *http.Client
}

// NewDodoClient reads DODO_PAYMENTS_API_KEY and DODO_PAYMENTS_ENVIRONMENT.
// Returns nil if no API key is configured (callers handle the disabled state).
func NewDodoClient() *DodoClient {
	key := os.Getenv("DODO_PAYMENTS_API_KEY")
	if key == "" {
		return nil
	}
	base := "https://test.dodopayments.com"
	if os.Getenv("DODO_PAYMENTS_ENVIRONMENT") == "live_mode" {
		base = "https://live.dodopayments.com"
	}
	return &DodoClient{
		baseURL: base,
		apiKey:  key,
		http:    &http.Client{Timeout: 20 * time.Second},
	}
}

type CheckoutLineItem struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

type CheckoutCustomer struct {
	Email string `json:"email,omitempty"`
	Name  string `json:"name,omitempty"`
}

type CheckoutRequest struct {
	ProductCart              []CheckoutLineItem `json:"product_cart"`
	ReturnURL                string             `json:"return_url"`
	Customer                 *CheckoutCustomer  `json:"customer,omitempty"`
	AllowedPaymentMethodType []string           `json:"allowed_payment_method_types,omitempty"`
	ShowSavedPaymentMethods  bool               `json:"show_saved_payment_methods,omitempty"`
	Metadata                 map[string]string  `json:"metadata,omitempty"`
}

type CheckoutResponse struct {
	CheckoutURL  string `json:"checkout_url"`
	PaymentID    string `json:"payment_id"`
	ClientSecret string `json:"client_secret"`
}

// CreateCheckoutSession posts to /checkouts and returns the hosted url.
func (c *DodoClient) CreateCheckoutSession(ctx context.Context, in CheckoutRequest) (*CheckoutResponse, error) {
	var out CheckoutResponse
	if err := c.do(ctx, http.MethodPost, "/checkouts", in, &out); err != nil {
		return nil, err
	}
	if out.CheckoutURL == "" {
		return nil, errors.New("dodopayments: empty checkout_url")
	}
	return &out, nil
}

// CustomerPortalLink returns a portal session url for an existing customer.
// Dodo exposes this as POST /customers/{id}/customer-portal/session.
func (c *DodoClient) CustomerPortalLink(ctx context.Context, customerID string) (string, error) {
	if customerID == "" {
		return "", errors.New("customer id required")
	}
	var out struct {
		Link string `json:"link"`
	}
	if err := c.do(ctx, http.MethodPost,
		fmt.Sprintf("/customers/%s/customer-portal/session", customerID),
		map[string]any{}, &out,
	); err != nil {
		return "", err
	}
	return out.Link, nil
}

func (c *DodoClient) do(ctx context.Context, method, path string, body, out any) error {
	var rdr io.Reader
	if body != nil {
		buf, err := json.Marshal(body)
		if err != nil {
			return err
		}
		rdr = bytes.NewReader(buf)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, rdr)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	res, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	raw, _ := io.ReadAll(res.Body)
	if res.StatusCode >= 300 {
		return fmt.Errorf("dodopayments %s %s: %d %s", method, path, res.StatusCode, string(raw))
	}
	if out != nil && len(raw) > 0 {
		return json.Unmarshal(raw, out)
	}
	return nil
}
