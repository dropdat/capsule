package capsule

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/google/uuid"
)

// vectorLiteral renders a Postgres `vector` literal: `[0.1,-0.2,...]`.
// Passed alongside `$1::vector` so pgx can ship it as plain text.
func vectorLiteral(vec []float32) string {
	if len(vec) == 0 {
		return "[]"
	}
	var b strings.Builder
	b.Grow(len(vec) * 12)
	b.WriteByte('[')
	for i, v := range vec {
		if i > 0 {
			b.WriteByte(',')
		}
		b.WriteString(strconv.FormatFloat(float64(v), 'f', -1, 32))
	}
	b.WriteByte(']')
	return b.String()
}

// storeEmbedding persists a vector for a capsule. Runs raw because sqlc
// has no native pgvector type.
func (s *Service) storeEmbedding(ctx context.Context, userID string, id uuid.UUID, vec []float32) error {
	if s.pool == nil {
		return fmt.Errorf("capsule: pool not configured")
	}
	_, err := s.pool.Exec(ctx, `
		UPDATE capsules
		SET embedding = $1::vector,
		    embedded_at = now()
		WHERE id = $2 AND user_id = $3
	`, vectorLiteral(vec), id, userID)
	return err
}

// embedText assembles the input we send to the embedder for a capsule:
// title + summary + tags + every message body, separated by newlines.
// Truncation is the embedder's job.
func embedText(c CreateRequest) string {
	var b strings.Builder
	b.WriteString(c.Title)
	b.WriteByte('\n')
	if c.Summary != "" {
		b.WriteString(c.Summary)
		b.WriteByte('\n')
	}
	if len(c.Tags) > 0 {
		b.WriteString(strings.Join(c.Tags, " "))
		b.WriteByte('\n')
	}
	for _, m := range c.Messages {
		b.WriteString(string(m.Role))
		b.WriteString(": ")
		b.WriteString(m.Content)
		b.WriteByte('\n')
	}
	return b.String()
}

func embedTextFromVersion(v VersionRequest) string {
	return embedText(CreateRequest{
		Title:    v.Title,
		Summary:  v.Summary,
		Tags:     v.Tags,
		Messages: v.Messages,
	})
}
