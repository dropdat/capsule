// Package apikey issues and verifies user API keys (used by the Chrome extension).
//
// Token format: dk_live_<base64url(32 random bytes)>
// We never store the raw token — only sha256(token) — so a DB leak doesn't
// expose live keys. The token is shown to the user exactly once at creation.
package apikey

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/yusii/dropdat/api/internal/db/dbgen"
)

const (
	tokenPrefix    = "dk_live_"
	tokenRandBytes = 32
	previewLen     = 12 // "dk_live_AbCd…"
)

type Service struct {
	q *dbgen.Queries
}

func NewService(q *dbgen.Queries) *Service { return &Service{q: q} }

// CreateInput is the request body for creating a new API key.
type CreateInput struct {
	UserID string
	Name   string
}

// Created bundles the persisted record with the one-time-shown raw token.
type Created struct {
	Key   dbgen.ApiKey
	Token string
}

// Create issues a new key. The raw token is only returned here — callers must
// surface it to the user exactly once.
func (s *Service) Create(ctx context.Context, in CreateInput) (*Created, error) {
	name := strings.TrimSpace(in.Name)
	if name == "" {
		name = "Extension"
	}
	if in.UserID == "" {
		return nil, errors.New("user_id required")
	}

	raw := make([]byte, tokenRandBytes)
	if _, err := rand.Read(raw); err != nil {
		return nil, fmt.Errorf("rand: %w", err)
	}
	token := tokenPrefix + base64.RawURLEncoding.EncodeToString(raw)

	row, err := s.q.CreateAPIKey(ctx, dbgen.CreateAPIKeyParams{
		ID:        uuid.New(),
		UserID:    in.UserID,
		Name:      name,
		TokenHash: hashToken(token),
		Prefix:    safePreview(token),
	})
	if err != nil {
		return nil, err
	}
	return &Created{Key: row, Token: token}, nil
}

// List returns all keys for a user. Tokens are never included.
func (s *Service) List(ctx context.Context, userID string) ([]dbgen.ListAPIKeysByUserRow, error) {
	if userID == "" {
		return nil, errors.New("user_id required")
	}
	return s.q.ListAPIKeysByUser(ctx, userID)
}

// Revoke marks a key as revoked. Idempotent.
func (s *Service) Revoke(ctx context.Context, userID string, id uuid.UUID) error {
	if userID == "" {
		return errors.New("user_id required")
	}
	return s.q.RevokeAPIKey(ctx, dbgen.RevokeAPIKeyParams{ID: id, UserID: userID})
}

// Verify resolves a raw token to its owning user_id, or returns an error.
// Side effect: updates last_used_at on success.
func (s *Service) Verify(ctx context.Context, token string) (string, error) {
	if !strings.HasPrefix(token, tokenPrefix) {
		return "", errors.New("invalid token format")
	}
	row, err := s.q.GetAPIKeyByHash(ctx, hashToken(token))
	if err != nil {
		return "", errors.New("invalid api key")
	}
	if row.RevokedAt.Valid {
		return "", errors.New("revoked api key")
	}
	// Best-effort touch; ignore errors so verification never fails on a
	// transient write hiccup.
	_ = s.q.TouchAPIKey(ctx, row.ID)
	_ = time.Now() // keep import even if Postgres handles touch
	return row.UserID, nil
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func safePreview(token string) string {
	if len(token) <= previewLen {
		return token
	}
	return token[:previewLen]
}
