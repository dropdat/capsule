package capsule

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Source string

const (
	SourceChatGPT Source = "chatgpt"
	SourceClaude  Source = "claude"
	SourceGemini  Source = "gemini"
)

func (s Source) Valid() bool {
	switch s {
	case SourceChatGPT, SourceClaude, SourceGemini:
		return true
	}
	return false
}

type Role string

const (
	RoleUser      Role = "user"
	RoleAssistant Role = "assistant"
	RoleSystem    Role = "system"
)

type Message struct {
	Role       Role      `json:"role"`
	Content    string    `json:"content"`
	CapturedAt time.Time `json:"capturedAt"`
}

// Capsule is the API/JSON representation. Maps 1:1 to dbgen.Capsule.
type Capsule struct {
	ID        uuid.UUID  `json:"id"`
	UserID    string     `json:"userId"`
	Title     string     `json:"title"`
	Summary   string     `json:"summary"`
	Source    Source     `json:"source"`
	SourceURL string     `json:"sourceUrl"`
	Messages  []Message  `json:"messages"`
	Tags      []string   `json:"tags"`
	Version   int32      `json:"version"`
	RootID    uuid.UUID  `json:"rootId"`
	ParentID  *uuid.UUID `json:"parentId"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}

// CreateRequest body shape for POST /capsules. Client provides id (uuid v7).
type CreateRequest struct {
	ID        uuid.UUID `json:"id"`
	Title     string    `json:"title"`
	Summary   string    `json:"summary"`
	Source    Source    `json:"source"`
	SourceURL string    `json:"sourceUrl"`
	Messages  []Message `json:"messages"`
	Tags      []string  `json:"tags"`
}

// PatchRequest body for PATCH /capsules/:id. Pointer fields = "only update if set".
type PatchRequest struct {
	Title   *string  `json:"title,omitempty"`
	Summary *string  `json:"summary,omitempty"`
	Tags    []string `json:"tags,omitempty"`
}

// VersionRequest body for POST /capsules/:id/versions.
// New version inherits root_id; client supplies new id (uuid v7) and new content.
type VersionRequest struct {
	ID        uuid.UUID `json:"id"`
	Title     string    `json:"title"`
	Summary   string    `json:"summary"`
	Messages  []Message `json:"messages"`
	Tags      []string  `json:"tags"`
}

// marshalMessages helper so handlers stay simple.
func marshalMessages(m []Message) ([]byte, error) {
	if m == nil {
		m = []Message{}
	}
	return json.Marshal(m)
}

func unmarshalMessages(b []byte) ([]Message, error) {
	if len(b) == 0 {
		return []Message{}, nil
	}
	var out []Message
	if err := json.Unmarshal(b, &out); err != nil {
		return nil, err
	}
	return out, nil
}
