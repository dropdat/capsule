package folder

import (
	"time"

	"github.com/google/uuid"
)

type Folder struct {
	ID        uuid.UUID `json:"id"`
	UserID    string    `json:"userId"`
	Name      string    `json:"name"`
	IsDefault bool      `json:"isDefault"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CreateRequest struct {
	Name      string `json:"name"`
	IsDefault bool   `json:"isDefault,omitempty"`
}

type PatchRequest struct {
	Name      *string `json:"name,omitempty"`
	IsDefault *bool   `json:"isDefault,omitempty"`
}
