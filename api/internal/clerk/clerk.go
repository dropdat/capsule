// Package clerk wraps the small slice of the Clerk REST API we need
// server-side — resolving Clerk user ids to display info (name/email/avatar)
// for the team roster.
package clerk

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"sync"
	"time"
)

type User struct {
	ID           string `json:"id"`
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	Username     string `json:"username"`
	ImageURL     string `json:"image_url"`
	PrimaryEmail string `json:"primary_email_address,omitempty"`
}

// Display returns a human-friendly name: "First Last" → username → email → id.
func (u *User) Display() string {
	name := ""
	if u.FirstName != "" || u.LastName != "" {
		if u.FirstName != "" && u.LastName != "" {
			name = u.FirstName + " " + u.LastName
		} else {
			name = u.FirstName + u.LastName
		}
	}
	if name != "" {
		return name
	}
	if u.Username != "" {
		return u.Username
	}
	if u.PrimaryEmail != "" {
		return u.PrimaryEmail
	}
	return u.ID
}

// Client is a thin wrapper around api.clerk.com using CLERK_SECRET_KEY.
type Client struct {
	secret string
	http   *http.Client

	// Tiny TTL cache so a roster of 5 stops hammering Clerk on every render.
	mu    sync.RWMutex
	cache map[string]cacheEntry
}

type cacheEntry struct {
	user      User
	expiresAt time.Time
}

// New reads CLERK_SECRET_KEY. Returns nil if the secret isn't set — callers
// should treat nil as "lookup unavailable, fall back to raw ids".
func New() *Client {
	secret := os.Getenv("CLERK_SECRET_KEY")
	if secret == "" {
		return nil
	}
	return &Client{
		secret: secret,
		http:   &http.Client{Timeout: 10 * time.Second},
		cache:  make(map[string]cacheEntry),
	}
}

// GetUsers resolves a batch of Clerk ids. Missing/failed lookups are
// silently omitted. Cached entries reused for ~5 minutes.
func (c *Client) GetUsers(ctx context.Context, ids []string) map[string]User {
	out := make(map[string]User, len(ids))
	if c == nil || len(ids) == 0 {
		return out
	}

	var miss []string
	c.mu.RLock()
	for _, id := range ids {
		if e, ok := c.cache[id]; ok && time.Now().Before(e.expiresAt) {
			out[id] = e.user
		} else {
			miss = append(miss, id)
		}
	}
	c.mu.RUnlock()

	if len(miss) == 0 {
		return out
	}

	// Clerk caps multi-id lookups around 100; we'd never hit that in a
	// team roster, but split anyway for safety.
	const chunk = 50
	for i := 0; i < len(miss); i += chunk {
		j := i + chunk
		if j > len(miss) {
			j = len(miss)
		}
		users, err := c.fetchUsers(ctx, miss[i:j])
		if err != nil {
			continue
		}
		c.mu.Lock()
		for _, u := range users {
			u := u
			out[u.ID] = u
			c.cache[u.ID] = cacheEntry{user: u, expiresAt: time.Now().Add(5 * time.Minute)}
		}
		c.mu.Unlock()
	}
	return out
}

// rawUser is what Clerk returns for a user. Email addresses arrive as an
// array of objects; we flatten the primary one onto User.PrimaryEmail.
type rawUser struct {
	ID                    string `json:"id"`
	FirstName             string `json:"first_name"`
	LastName              string `json:"last_name"`
	Username              string `json:"username"`
	ImageURL              string `json:"image_url"`
	PrimaryEmailAddressID string `json:"primary_email_address_id"`
	EmailAddresses        []struct {
		ID    string `json:"id"`
		Email string `json:"email_address"`
	} `json:"email_addresses"`
}

func (c *Client) fetchUsers(ctx context.Context, ids []string) ([]User, error) {
	q := url.Values{}
	for _, id := range ids {
		q.Add("user_id", id)
	}
	q.Set("limit", fmt.Sprintf("%d", len(ids)))

	req, err := http.NewRequestWithContext(ctx, http.MethodGet,
		"https://api.clerk.com/v1/users?"+q.Encode(), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+c.secret)

	res, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	if res.StatusCode >= 300 {
		return nil, fmt.Errorf("clerk users: %d %s", res.StatusCode, string(body))
	}
	var raws []rawUser
	if err := json.Unmarshal(body, &raws); err != nil {
		return nil, err
	}
	out := make([]User, 0, len(raws))
	for _, r := range raws {
		u := User{
			ID:        r.ID,
			FirstName: r.FirstName,
			LastName:  r.LastName,
			Username:  r.Username,
			ImageURL:  r.ImageURL,
		}
		for _, e := range r.EmailAddresses {
			if e.ID == r.PrimaryEmailAddressID {
				u.PrimaryEmail = e.Email
				break
			}
		}
		if u.PrimaryEmail == "" && len(r.EmailAddresses) > 0 {
			u.PrimaryEmail = r.EmailAddresses[0].Email
		}
		out = append(out, u)
	}
	return out, nil
}
