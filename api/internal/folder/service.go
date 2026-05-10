package folder

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/yusii/dropdat/api/internal/db/dbgen"
)

var (
	ErrNotFound    = errors.New("folder not found")
	ErrEmptyName   = errors.New("folder name required")
	ErrCannotDelete = errors.New("cannot delete default folder")
)

const DefaultFolderName = "links"

type Service struct {
	q *dbgen.Queries
}

func NewService(q *dbgen.Queries) *Service { return &Service{q: q} }

// EnsureDefault returns the user's default folder, creating "links" if missing.
func (s *Service) EnsureDefault(ctx context.Context, userID string) (Folder, error) {
	row, err := s.q.GetDefaultFolder(ctx, userID)
	if err == nil {
		return toFolder(row), nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return Folder{}, err
	}
	created, err := s.q.CreateFolder(ctx, dbgen.CreateFolderParams{
		ID:        uuid.New(),
		UserID:    userID,
		Name:      DefaultFolderName,
		IsDefault: true,
	})
	if err != nil {
		return Folder{}, err
	}
	return toFolder(created), nil
}

func (s *Service) Create(ctx context.Context, userID string, in CreateRequest) (Folder, error) {
	name := strings.TrimSpace(in.Name)
	if name == "" {
		return Folder{}, ErrEmptyName
	}
	if in.IsDefault {
		if err := s.q.SetDefaultFolderClear(ctx, userID); err != nil {
			return Folder{}, err
		}
	}
	row, err := s.q.CreateFolder(ctx, dbgen.CreateFolderParams{
		ID:        uuid.New(),
		UserID:    userID,
		Name:      name,
		IsDefault: in.IsDefault,
	})
	if err != nil {
		return Folder{}, err
	}
	return toFolder(row), nil
}

func (s *Service) List(ctx context.Context, userID string) ([]Folder, error) {
	if _, err := s.EnsureDefault(ctx, userID); err != nil {
		return nil, err
	}
	rows, err := s.q.ListFoldersByUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	out := make([]Folder, 0, len(rows))
	for _, r := range rows {
		out = append(out, toFolder(r))
	}
	return out, nil
}

func (s *Service) Get(ctx context.Context, userID string, id uuid.UUID) (Folder, error) {
	row, err := s.q.GetFolder(ctx, dbgen.GetFolderParams{ID: id, UserID: userID})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Folder{}, ErrNotFound
		}
		return Folder{}, err
	}
	return toFolder(row), nil
}

func (s *Service) Patch(ctx context.Context, userID string, id uuid.UUID, p PatchRequest) (Folder, error) {
	current, err := s.Get(ctx, userID, id)
	if err != nil {
		return Folder{}, err
	}
	if p.Name != nil {
		name := strings.TrimSpace(*p.Name)
		if name == "" {
			return Folder{}, ErrEmptyName
		}
		row, err := s.q.RenameFolder(ctx, dbgen.RenameFolderParams{ID: id, UserID: userID, Name: name})
		if err != nil {
			return Folder{}, err
		}
		current = toFolder(row)
	}
	if p.IsDefault != nil && *p.IsDefault && !current.IsDefault {
		if err := s.q.SetDefaultFolderClear(ctx, userID); err != nil {
			return Folder{}, err
		}
		row, err := s.q.SetDefaultFolder(ctx, dbgen.SetDefaultFolderParams{ID: id, UserID: userID})
		if err != nil {
			return Folder{}, err
		}
		current = toFolder(row)
	}
	return current, nil
}

func (s *Service) Delete(ctx context.Context, userID string, id uuid.UUID) error {
	current, err := s.Get(ctx, userID, id)
	if err != nil {
		return err
	}
	if current.IsDefault {
		return ErrCannotDelete
	}
	return s.q.SoftDeleteFolder(ctx, dbgen.SoftDeleteFolderParams{ID: id, UserID: userID})
}

func toFolder(r dbgen.Folder) Folder {
	return Folder{
		ID:        r.ID,
		UserID:    r.UserID,
		Name:      r.Name,
		IsDefault: r.IsDefault,
		CreatedAt: tsToTime(r.CreatedAt),
		UpdatedAt: tsToTime(r.UpdatedAt),
	}
}

func tsToTime(ts pgtype.Timestamptz) time.Time {
	if !ts.Valid {
		return time.Time{}
	}
	return ts.Time
}
