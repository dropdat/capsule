package link

import (
	"time"

	"github.com/google/uuid"
)

type Link struct {
	ID         uuid.UUID `json:"id"`
	UserID     string    `json:"userId"`
	FolderID   uuid.UUID `json:"folderId"`
	URL        string    `json:"url"`
	Title      string    `json:"title"`
	Note       string    `json:"note"`
	FaviconURL string    `json:"faviconUrl"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type CreateRequest struct {
	FolderID   *uuid.UUID `json:"folderId,omitempty"`
	URL        string     `json:"url"`
	Title      string     `json:"title,omitempty"`
	Note       string     `json:"note,omitempty"`
	FaviconURL string     `json:"faviconUrl,omitempty"`
}

type PatchRequest struct {
	FolderID *uuid.UUID `json:"folderId,omitempty"`
	Title    *string    `json:"title,omitempty"`
	Note     *string    `json:"note,omitempty"`
}
