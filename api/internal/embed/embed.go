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

// NewFromEnv picks an embedder based on env, preferring Voyage AI when
// available (free 50M-token monthly tier) and falling back to OpenAI on
// per-request errors so a Voyage outage doesn't drop captures on the floor.
//
//   - VOYAGE_API_KEY set + OPENAI_API_KEY set → Chain{Voyage, OpenAI}
//   - VOYAGE_API_KEY set                       → Voyage only
//   - OPENAI_API_KEY set                       → OpenAI only
//   - neither                                  → Noop (BM25-only search)
//
// Model overrides: VOYAGE_EMBED_MODEL (default voyage-3.5),
// OPENAI_EMBED_MODEL (default text-embedding-3-small).
//
// Note on dimensions: the schema is fixed at Dim=1536. Voyage returns 1024;
// VoyageEmbedder zero-pads to 1536 so a single HNSW index serves both
// providers. Cross-provider cosine is meaningless, but providers don't mix
// in a healthy deployment — fallback only triggers on transient Voyage
// errors and affects at most a few rows.
func NewFromEnv() Embedder {
	httpClient := &http.Client{Timeout: 30 * time.Second}

	var voyage *VoyageEmbedder
	if k := os.Getenv("VOYAGE_API_KEY"); k != "" {
		model := os.Getenv("VOYAGE_EMBED_MODEL")
		if model == "" {
			model = "voyage-3.5"
		}
		voyage = &VoyageEmbedder{apiKey: k, model: model, http: httpClient}
	}

	var openai *OpenAIEmbedder
	if k := os.Getenv("OPENAI_API_KEY"); k != "" {
		model := os.Getenv("OPENAI_EMBED_MODEL")
		if model == "" {
			model = "text-embedding-3-small"
		}
		openai = &OpenAIEmbedder{apiKey: k, model: model, http: httpClient}
	}

	switch {
	case voyage != nil && openai != nil:
		slog.Info("embed: Voyage AI primary, OpenAI fallback")
		return &Chain{Primary: voyage, Fallback: openai}
	case voyage != nil:
		slog.Info("embed: Voyage AI only")
		return voyage
	case openai != nil:
		slog.Info("embed: OpenAI only")
		return openai
	default:
		slog.Warn("embed: no provider configured — capsule embedding disabled (semantic search will degrade to BM25)")
		return Noop{}
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

// VoyageEmbedder calls api.voyageai.com. Returns Dim-wide vectors by
// zero-padding Voyage's native 1024-dim output up to 1536. Cosine similarity
// is preserved under zero-padding, so within-Voyage nearest-neighbour stays
// correct on the existing HNSW index.
type VoyageEmbedder struct {
	apiKey string
	model  string
	http   *http.Client
}

func (e *VoyageEmbedder) Enabled() bool { return true }

func (e *VoyageEmbedder) Embed(ctx context.Context, text string) ([]float32, error) {
	if text == "" {
		return nil, errors.New("embed: empty input")
	}
	// voyage-3.5 accepts up to 32k tokens; same byte cap as OpenAI path.
	const maxBytes = 24_000
	if len(text) > maxBytes {
		text = text[:maxBytes]
	}

	body, _ := json.Marshal(map[string]any{
		"model":            e.model,
		"input":            []string{text},
		"output_dimension": 1024,
		"input_type":       "document",
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		"https://api.voyageai.com/v1/embeddings", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+e.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := e.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("embed: voyage http: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("embed: voyage %d: %s", resp.StatusCode, string(b))
	}

	var out struct {
		Data []struct {
			Embedding []float32 `json:"embedding"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, fmt.Errorf("embed: voyage decode: %w", err)
	}
	if len(out.Data) == 0 || len(out.Data[0].Embedding) == 0 {
		return nil, errors.New("embed: voyage empty response")
	}
	v := out.Data[0].Embedding
	if len(v) > Dim {
		return v[:Dim], nil
	}
	if len(v) < Dim {
		padded := make([]float32, Dim)
		copy(padded, v)
		return padded, nil
	}
	return v, nil
}

// Chain tries Primary, then Fallback on error. Both Enabled() must be true
// for Chain itself to report Enabled().
type Chain struct {
	Primary  Embedder
	Fallback Embedder
}

func (c *Chain) Enabled() bool { return c.Primary.Enabled() || c.Fallback.Enabled() }

func (c *Chain) Embed(ctx context.Context, text string) ([]float32, error) {
	if c.Primary != nil && c.Primary.Enabled() {
		v, err := c.Primary.Embed(ctx, text)
		if err == nil {
			return v, nil
		}
		slog.Warn("embed: primary failed, falling back", "err", err)
	}
	if c.Fallback == nil || !c.Fallback.Enabled() {
		return nil, errors.New("embed: primary failed and no fallback configured")
	}
	return c.Fallback.Embed(ctx, text)
}
