package capsule

import (
	"context"
	"crypto/rand"
	"encoding/base32"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/yusii/dropdat/api/internal/db/dbgen"
	"github.com/yusii/dropdat/api/internal/embed"
)

var (
	ErrNotFound       = errors.New("capsule not found")
	ErrInvalidSource  = errors.New("invalid source")
	ErrEmptyTitle     = errors.New("title required")
	ErrInvalidID      = errors.New("invalid uuid")
	ErrCapsuleLimit   = errors.New("capsule limit reached for current plan")
)

// LimitChecker reports whether the user is allowed to create another capsule.
// Returning false halts the create with ErrCapsuleLimit. nil = unlimited.
type LimitChecker func(ctx context.Context, userID string) (allowed bool, err error)

type Service struct {
	q        *dbgen.Queries
	pool     *pgxpool.Pool
	embedder embed.Embedder
	canCreate LimitChecker
}

// SetLimitChecker wires in tier-based capsule limit enforcement.
func (s *Service) SetLimitChecker(c LimitChecker) { s.canCreate = c }

func NewService(q *dbgen.Queries, pool *pgxpool.Pool, embedder embed.Embedder) *Service {
	if embedder == nil {
		embedder = embed.Noop{}
	}
	return &Service{q: q, pool: pool, embedder: embedder}
}

// embedAsync kicks off a background embed+store. Uses context.Background so
// it survives the originating request finishing. Errors are logged, not
// surfaced — embedding is best-effort.
func (s *Service) embedAsync(userID string, id uuid.UUID, text string) {
	if !s.embedder.Enabled() {
		return
	}
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		vec, err := s.embedder.Embed(ctx, text)
		if err != nil {
			slog.Warn("capsule embed failed", "capsuleId", id, "err", err)
			return
		}
		if err := s.storeEmbedding(ctx, userID, id, vec); err != nil {
			slog.Warn("capsule embed store failed", "capsuleId", id, "err", err)
		}
	}()
}

func (s *Service) Create(ctx context.Context, userID string, in CreateRequest) (Capsule, error) {
	if !in.Source.Valid() {
		return Capsule{}, ErrInvalidSource
	}
	if in.Title == "" {
		return Capsule{}, ErrEmptyTitle
	}
	if in.ID == uuid.Nil {
		return Capsule{}, ErrInvalidID
	}
	if s.canCreate != nil {
		ok, err := s.canCreate(ctx, userID)
		if err != nil {
			return Capsule{}, err
		}
		if !ok {
			return Capsule{}, ErrCapsuleLimit
		}
	}

	msgBytes, err := marshalMessages(in.Messages)
	if err != nil {
		return Capsule{}, fmt.Errorf("marshal messages: %w", err)
	}
	tags := in.Tags
	if tags == nil {
		tags = []string{}
	}

	row, err := s.q.CreateCapsule(ctx, dbgen.CreateCapsuleParams{
		ID:        in.ID,
		UserID:    userID,
		Title:     in.Title,
		Summary:   in.Summary,
		Source:    string(in.Source),
		SourceUrl: in.SourceURL,
		Messages:  msgBytes,
		Tags:      tags,
		Version:   1,
		RootID:    in.ID, // first version: root_id = id
		ParentID:  pgtype.UUID{Valid: false},
	})
	if err != nil {
		return Capsule{}, fmt.Errorf("create capsule: %w", err)
	}
	s.embedAsync(userID, in.ID, embedText(in))
	return toCapsule(row)
}

func (s *Service) Get(ctx context.Context, userID string, id uuid.UUID) (Capsule, error) {
	row, err := s.q.GetCapsule(ctx, dbgen.GetCapsuleParams{ID: id, UserID: userID})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Capsule{}, ErrNotFound
		}
		return Capsule{}, err
	}
	return toCapsule(row)
}

// Share assigns (or returns the existing) public share token for a capsule.
func (s *Service) Share(ctx context.Context, userID string, id uuid.UUID) (string, error) {
	existing, err := s.q.GetCapsule(ctx, dbgen.GetCapsuleParams{ID: id, UserID: userID})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", ErrNotFound
		}
		return "", err
	}
	if existing.ShareToken != nil && *existing.ShareToken != "" {
		return *existing.ShareToken, nil
	}
	token, err := newShareToken()
	if err != nil {
		return "", err
	}
	if _, err := s.q.SetCapsuleShareToken(ctx, dbgen.SetCapsuleShareTokenParams{
		ID: id, UserID: userID, ShareToken: &token,
	}); err != nil {
		return "", err
	}
	return token, nil
}

func (s *Service) Unshare(ctx context.Context, userID string, id uuid.UUID) error {
	return s.q.ClearCapsuleShareToken(ctx, dbgen.ClearCapsuleShareTokenParams{ID: id, UserID: userID})
}

// GetByShareToken loads a capsule via its public share token. Returns ErrNotFound
// if no live capsule has that token.
func (s *Service) GetByShareToken(ctx context.Context, token string) (Capsule, error) {
	if token == "" {
		return Capsule{}, ErrNotFound
	}
	row, err := s.q.GetCapsuleByShareToken(ctx, &token)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Capsule{}, ErrNotFound
		}
		return Capsule{}, err
	}
	return toCapsule(row)
}

type ListFilters struct {
	Tag    string
	Search string
	Limit  int32
}

func (s *Service) List(ctx context.Context, userID string, f ListFilters) ([]Capsule, error) {
	if f.Limit <= 0 || f.Limit > 200 {
		f.Limit = 50
	}
	var rows []dbgen.Capsule
	var err error
	switch {
	case f.Tag != "":
		rows, err = s.q.ListCapsulesByTag(ctx, dbgen.ListCapsulesByTagParams{
			UserID: userID, Column2: f.Tag, Limit: f.Limit,
		})
	case f.Search != "":
		s2 := f.Search
		rows, err = s.q.SearchCapsules(ctx, dbgen.SearchCapsulesParams{
			UserID: userID, Column2: &s2, Limit: f.Limit,
		})
	default:
		rows, err = s.q.ListCapsulesByUser(ctx, dbgen.ListCapsulesByUserParams{
			UserID: userID, Limit: f.Limit,
		})
	}
	if err != nil {
		return nil, err
	}
	out := make([]Capsule, 0, len(rows))
	for _, r := range rows {
		c, err := toCapsule(r)
		if err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, nil
}

func (s *Service) Patch(ctx context.Context, userID string, id uuid.UUID, p PatchRequest) (Capsule, error) {
	current, err := s.Get(ctx, userID, id)
	if err != nil {
		return Capsule{}, err
	}
	title := current.Title
	summary := current.Summary
	tags := current.Tags
	if p.Title != nil {
		title = *p.Title
	}
	if p.Summary != nil {
		summary = *p.Summary
	}
	if p.Tags != nil {
		tags = p.Tags
	}
	row, err := s.q.UpdateCapsuleMeta(ctx, dbgen.UpdateCapsuleMetaParams{
		ID: id, UserID: userID, Title: title, Summary: summary, Tags: tags,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Capsule{}, ErrNotFound
		}
		return Capsule{}, err
	}
	updated, _ := toCapsule(row)
	s.embedAsync(userID, id, embedText(CreateRequest{
		Title:    updated.Title,
		Summary:  updated.Summary,
		Tags:     updated.Tags,
		Messages: updated.Messages,
	}))
	return updated, nil
}

func (s *Service) Delete(ctx context.Context, userID string, id uuid.UUID) error {
	return s.q.SoftDeleteCapsule(ctx, dbgen.SoftDeleteCapsuleParams{ID: id, UserID: userID})
}

// CreateVersion makes a new capsule that supersedes id, sharing root_id.
func (s *Service) CreateVersion(ctx context.Context, userID string, parentID uuid.UUID, in VersionRequest) (Capsule, error) {
	if in.ID == uuid.Nil {
		return Capsule{}, ErrInvalidID
	}
	if in.Title == "" {
		return Capsule{}, ErrEmptyTitle
	}

	parent, err := s.Get(ctx, userID, parentID)
	if err != nil {
		return Capsule{}, err
	}

	maxVer, err := s.q.GetMaxVersionInLineage(ctx, dbgen.GetMaxVersionInLineageParams{
		UserID: userID, RootID: parent.RootID,
	})
	if err != nil {
		return Capsule{}, err
	}

	msgBytes, err := marshalMessages(in.Messages)
	if err != nil {
		return Capsule{}, err
	}
	tags := in.Tags
	if tags == nil {
		tags = []string{}
	}

	row, err := s.q.CreateCapsule(ctx, dbgen.CreateCapsuleParams{
		ID:        in.ID,
		UserID:    userID,
		Title:     in.Title,
		Summary:   in.Summary,
		Source:    string(parent.Source),
		SourceUrl: parent.SourceURL,
		Messages:  msgBytes,
		Tags:      tags,
		Version:   maxVer + 1,
		RootID:    parent.RootID,
		ParentID:  pgtype.UUID{Bytes: parentID, Valid: true},
	})
	if err != nil {
		return Capsule{}, err
	}
	s.embedAsync(userID, in.ID, embedTextFromVersion(in))
	return toCapsule(row)
}

func (s *Service) Lineage(ctx context.Context, userID string, id uuid.UUID) ([]Capsule, error) {
	cap, err := s.Get(ctx, userID, id)
	if err != nil {
		return nil, err
	}
	rows, err := s.q.GetLineage(ctx, dbgen.GetLineageParams{
		UserID: userID, RootID: cap.RootID,
	})
	if err != nil {
		return nil, err
	}
	out := make([]Capsule, 0, len(rows))
	for _, r := range rows {
		c, err := toCapsule(r)
		if err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, nil
}

func toCapsule(row dbgen.Capsule) (Capsule, error) {
	msgs, err := unmarshalMessages(row.Messages)
	if err != nil {
		return Capsule{}, fmt.Errorf("unmarshal messages: %w", err)
	}
	var parent *uuid.UUID
	if row.ParentID.Valid {
		u := uuid.UUID(row.ParentID.Bytes)
		parent = &u
	}
	created := tsToTime(row.CreatedAt)
	updated := tsToTime(row.UpdatedAt)
	return Capsule{
		ID:        row.ID,
		UserID:    row.UserID,
		Title:     row.Title,
		Summary:   row.Summary,
		Source:    Source(row.Source),
		SourceURL: row.SourceUrl,
		Messages:  msgs,
		Tags:      row.Tags,
		Version:   row.Version,
		RootID:     row.RootID,
		ParentID:   parent,
		ShareToken: row.ShareToken,
		CreatedAt:  created,
		UpdatedAt:  updated,
	}, nil
}

func newShareToken() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return strings.ToLower(strings.TrimRight(base32.StdEncoding.EncodeToString(b), "=")), nil
}

func tsToTime(ts pgtype.Timestamptz) time.Time {
	if !ts.Valid {
		return time.Time{}
	}
	return ts.Time
}
