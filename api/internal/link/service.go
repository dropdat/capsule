package link

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/yusii/dropdat/api/internal/db/dbgen"
	"github.com/yusii/dropdat/api/internal/folder"
)

var (
	ErrNotFound = errors.New("link not found")
	ErrEmptyURL = errors.New("url required")
	ErrBadFolder = errors.New("folder not found")
)

type Service struct {
	q       *dbgen.Queries
	folders *folder.Service
}

func NewService(q *dbgen.Queries, f *folder.Service) *Service {
	return &Service{q: q, folders: f}
}

func (s *Service) Create(ctx context.Context, userID string, in CreateRequest) (Link, error) {
	url := strings.TrimSpace(in.URL)
	if url == "" {
		return Link{}, ErrEmptyURL
	}

	var folderID uuid.UUID
	if in.FolderID != nil {
		f, err := s.folders.Get(ctx, userID, *in.FolderID)
		if err != nil {
			return Link{}, ErrBadFolder
		}
		folderID = f.ID
	} else {
		def, err := s.folders.EnsureDefault(ctx, userID)
		if err != nil {
			return Link{}, err
		}
		folderID = def.ID
	}

	row, err := s.q.CreateLink(ctx, dbgen.CreateLinkParams{
		ID:         uuid.New(),
		UserID:     userID,
		FolderID:   folderID,
		Url:        url,
		Title:      in.Title,
		Note:       in.Note,
		FaviconUrl: in.FaviconURL,
	})
	if err != nil {
		return Link{}, err
	}
	return toLink(row), nil
}

func (s *Service) List(ctx context.Context, userID string, folderID *uuid.UUID, limit int32) ([]Link, error) {
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	var rows []dbgen.Link
	var err error
	if folderID != nil {
		rows, err = s.q.ListLinksByFolder(ctx, dbgen.ListLinksByFolderParams{
			UserID: userID, FolderID: *folderID, Limit: limit,
		})
	} else {
		rows, err = s.q.ListLinksByUser(ctx, dbgen.ListLinksByUserParams{
			UserID: userID, Limit: limit,
		})
	}
	if err != nil {
		return nil, err
	}
	out := make([]Link, 0, len(rows))
	for _, r := range rows {
		out = append(out, toLink(r))
	}
	return out, nil
}

func (s *Service) Patch(ctx context.Context, userID string, id uuid.UUID, p PatchRequest) (Link, error) {
	current, err := s.q.GetLink(ctx, dbgen.GetLinkParams{ID: id, UserID: userID})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Link{}, ErrNotFound
		}
		return Link{}, err
	}
	title := current.Title
	note := current.Note
	folderID := current.FolderID
	if p.Title != nil {
		title = *p.Title
	}
	if p.Note != nil {
		note = *p.Note
	}
	if p.FolderID != nil {
		f, err := s.folders.Get(ctx, userID, *p.FolderID)
		if err != nil {
			return Link{}, ErrBadFolder
		}
		folderID = f.ID
	}
	row, err := s.q.UpdateLink(ctx, dbgen.UpdateLinkParams{
		ID: id, UserID: userID, Title: title, Note: note, FolderID: folderID,
	})
	if err != nil {
		return Link{}, err
	}
	return toLink(row), nil
}

func (s *Service) Delete(ctx context.Context, userID string, id uuid.UUID) error {
	return s.q.SoftDeleteLink(ctx, dbgen.SoftDeleteLinkParams{ID: id, UserID: userID})
}

func toLink(r dbgen.Link) Link {
	return Link{
		ID:         r.ID,
		UserID:     r.UserID,
		FolderID:   r.FolderID,
		URL:        r.Url,
		Title:      r.Title,
		Note:       r.Note,
		FaviconURL: r.FaviconUrl,
		CreatedAt:  tsToTime(r.CreatedAt),
		UpdatedAt:  tsToTime(r.UpdatedAt),
	}
}

func tsToTime(ts pgtype.Timestamptz) time.Time {
	if !ts.Valid {
		return time.Time{}
	}
	return ts.Time
}
