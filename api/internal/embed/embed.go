// Package embed produces vector embeddings for capsule text. The Embedder
// interface keeps the provider swappable; OpenAI is the default. If no
// provider is configured, NewFromEnv returns a Noop that skips embedding
// (search still works for capsules that already have vectors, falls back
// to BM25 for everything else).
package embed

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"time"
)

// Dim is the vector dimensionality the schema (and HNSW index) is built for.
// Changing this requires a schema migration — keep providers pinned to it.
const Dim = 1536

type Embedder interface {
	// Embed returns a Dim-length vector. Implementations may truncate long
	// input internally; callers should pre-trim if they care about cost.
	Embed(ctx context.Context, text string) ([]float32, error)
	// Enabled reports whether the embedder will actually call out. A Noop
	// returns false so callers can skip work entirely.
	Enabled() bool
}

// NewFromEnv picks an embedder based on env:
//   - OPENAI_API_KEY set → OpenAIEmbedder
//   - else                → Noop (logs a warning once)
//
// Model overridable via OPENAI_EMBED_MODEL (default text-embedding-3-small).
func NewFromEnv() Embedder {
	key := os.Getenv("OPENAI_API_KEY")
	if key == "" {
		slog.Warn("embed: OPENAI_API_KEY not set — capsule embedding disabled (semantic search will degrade to BM25)")
		return Noop{}
	}
	model := os.Getenv("OPENAI_EMBED_MODEL")
	if model == "" {
		model = "text-embedding-3-small"
	}
	return &OpenAIEmbedder{
		apiKey: key,
		model:  model,
		http:   &http.Client{Timeout: 30 * time.Second},
	}
}

type Noop struct{}

func (Noop) Embed(context.Context, string) ([]float32, error) { return nil, ErrDisabled }
func (Noop) Enabled() bool                                    { return false }

var ErrDisabled = errors.New("embed: provider disabled")

type OpenAIEmbedder struct {
	apiKey string
	model  string
	http   *http.Client
}

func (e *OpenAIEmbedder) Enabled() bool { return true }

func (e *OpenAIEmbedder) Embed(ctx context.Context, text string) ([]float32, error) {
	if text == "" {
		return nil, errors.New("embed: empty input")
	}
	// text-embedding-3-small accepts up to ~8191 tokens. Cap input bytes as a
	// cheap proxy — we'd rather truncate than 400 on long capsules.
	const maxBytes = 24_000
	if len(text) > maxBytes {
		text = text[:maxBytes]
	}

	body, _ := json.Marshal(map[string]any{
		"model":      e.model,
		"input":      text,
		"dimensions": Dim,
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.openai.com/v1/embeddings", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+e.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := e.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("embed: http: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("embed: openai %d: %s", resp.StatusCode, string(b))
	}

	var out struct {
		Data []struct {
			Embedding []float32 `json:"embedding"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, fmt.Errorf("embed: decode: %w", err)
	}
	if len(out.Data) == 0 || len(out.Data[0].Embedding) != Dim {
		return nil, fmt.Errorf("embed: unexpected response (len=%d)", len(out.Data))
	}
	return out.Data[0].Embedding, nil
}
