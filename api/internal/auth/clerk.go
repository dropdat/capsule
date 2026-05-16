// Package auth verifies Clerk session JWTs against the project's JWKS.
package auth

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"

	"github.com/yusii/dropdat/api/internal/httpx"
)

type ctxKey int

const (
	userIDKey ctxKey = iota
	scopesKey
	authKindKey
)

// AuthKind labels how the request was authenticated.
type AuthKind string

const (
	AuthKindJWT    AuthKind = "jwt"
	AuthKindAPIKey AuthKind = "api_key"
)

// UserID extracts the authenticated Clerk user id (sub claim) from context.
// Returns empty string if no auth context (caller treats as unauthenticated).
func UserID(ctx context.Context) string {
	v, _ := ctx.Value(userIDKey).(string)
	return v
}

// Scopes returns the scopes attached to this request. Empty for JWT auth
// (callers fall back to the user's tier scopes); populated for API key auth.
func Scopes(ctx context.Context) []string {
	v, _ := ctx.Value(scopesKey).([]string)
	return v
}

// Kind returns how the request was authenticated.
func Kind(ctx context.Context) AuthKind {
	v, _ := ctx.Value(authKindKey).(AuthKind)
	return v
}

// APIKeyVerifier checks an extension API key (dk_live_…) and returns the
// owning user id plus the scopes granted to that key.
type APIKeyVerifier interface {
	Verify(ctx context.Context, token string) (string, []string, error)
}

// Verifier holds a cached JWKS keyfunc for one Clerk instance.
type Verifier struct {
	jwks      keyfunc.Keyfunc
	issuer    string
	devBypass bool
	devUserID string
	apiKeys   APIKeyVerifier
}

// SetAPIKeyVerifier wires in extension API key verification. If unset, only
// Clerk JWTs are accepted.
func (v *Verifier) SetAPIKeyVerifier(a APIKeyVerifier) { v.apiKeys = a }

// NewVerifier constructs a verifier from env:
//   - CLERK_JWKS_URL   (e.g. https://your-app.clerk.accounts.dev/.well-known/jwks.json)
//   - CLERK_ISSUER     (e.g. https://your-app.clerk.accounts.dev)
//   - DEV_AUTH_BYPASS  ("1" to skip JWT verification — uses DEV_USER_ID as the user)
//   - DEV_USER_ID      (default "user_dev")
func NewVerifier(ctx context.Context) (*Verifier, error) {
	if os.Getenv("DEV_AUTH_BYPASS") == "1" {
		uid := os.Getenv("DEV_USER_ID")
		if uid == "" {
			uid = "user_dev"
		}
		slog.Warn("DEV_AUTH_BYPASS active — accepting all requests", "userId", uid)
		return &Verifier{devBypass: true, devUserID: uid}, nil
	}

	jwksURL := os.Getenv("CLERK_JWKS_URL")
	if jwksURL == "" {
		return nil, errors.New("CLERK_JWKS_URL not set (or set DEV_AUTH_BYPASS=1 for local dev)")
	}

	jwks, err := keyfunc.NewDefaultCtx(ctx, []string{jwksURL})
	if err != nil {
		return nil, err
	}

	return &Verifier{
		jwks:   jwks,
		issuer: os.Getenv("CLERK_ISSUER"),
	}, nil
}

// Middleware returns an http middleware that verifies the bearer token and
// puts the user id (sub) into the request context.
func (v *Verifier) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if v.devBypass {
			ctx := context.WithValue(r.Context(), userIDKey, v.devUserID)
			ctx = context.WithValue(ctx, authKindKey, AuthKindJWT)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		auth := r.Header.Get("Authorization")
		token := strings.TrimPrefix(auth, "Bearer ")
		if token == "" || token == auth {
			httpx.Error(w, http.StatusUnauthorized, "missing bearer token")
			return
		}

		// Extension API key path.
		if v.apiKeys != nil && strings.HasPrefix(token, "dk_") {
			uid, scopes, err := v.apiKeys.Verify(r.Context(), token)
			if err != nil {
				httpx.Error(w, http.StatusUnauthorized, "invalid api key")
				return
			}
			ctx := context.WithValue(r.Context(), userIDKey, uid)
			ctx = context.WithValue(ctx, scopesKey, scopes)
			ctx = context.WithValue(ctx, authKindKey, AuthKindAPIKey)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		parsed, err := jwt.Parse(token, v.jwks.Keyfunc, jwt.WithValidMethods([]string{"RS256"}))
		if err != nil || !parsed.Valid {
			httpx.Error(w, http.StatusUnauthorized, "invalid token")
			return
		}

		claims, ok := parsed.Claims.(jwt.MapClaims)
		if !ok {
			httpx.Error(w, http.StatusUnauthorized, "invalid claims")
			return
		}

		if exp, err := claims.GetExpirationTime(); err != nil || exp == nil || exp.Before(time.Now()) {
			httpx.Error(w, http.StatusUnauthorized, "token expired")
			return
		}

		if v.issuer != "" {
			if iss, err := claims.GetIssuer(); err != nil || iss != v.issuer {
				httpx.Error(w, http.StatusUnauthorized, "issuer mismatch")
				return
			}
		}

		sub, err := claims.GetSubject()
		if err != nil || sub == "" {
			httpx.Error(w, http.StatusUnauthorized, "missing subject")
			return
		}

		ctx := context.WithValue(r.Context(), userIDKey, sub)
		ctx = context.WithValue(ctx, authKindKey, AuthKindJWT)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
