package capsule

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// SearchRequest is the POST /capsules/search body.
type SearchRequest struct {
	Query string `json:"query"`
	Tag   string `json:"tag,omitempty"`
	Limit int    `json:"limit,omitempty"`
}

// SearchHit is one result. Score is a combined RRF rank; higher = better.
type SearchHit struct {
	ID         uuid.UUID `json:"id"`
	Title      string    `json:"title"`
	Summary    string    `json:"summary"`
	Source     Source    `json:"source"`
	SourceURL  string    `json:"sourceUrl"`
	Tags       []string  `json:"tags"`
	UpdatedAt  time.Time `json:"updatedAt"`
	Score      float64   `json:"score"`
	VectorRank *int      `json:"vectorRank,omitempty"`
	TextRank   *int      `json:"textRank,omitempty"`
}

// Search performs a hybrid lookup:
//   - vector cosine ranking against the query embedding (if embedder available)
//   - BM25-style ranking against the stored tsvector
//   - results fused with Reciprocal Rank Fusion (k=60)
//
// Capsules with no embedding still surface via the text leg, so the system
// degrades gracefully when OPENAI_API_KEY is missing or a row hasn't been
// backfilled yet.
func (s *Service) Search(ctx context.Context, userID string, in SearchRequest) ([]SearchHit, error) {
	if in.Query == "" {
		return nil, fmt.Errorf("query required")
	}
	limit := in.Limit
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	var qvec []float32
	if s.embedder.Enabled() {
		v, err := s.embedder.Embed(ctx, in.Query)
		if err == nil {
			qvec = v
		}
	}
	haveVec := qvec != nil
	vecArg := "[" + zeroVec() + "]"
	if haveVec {
		vecArg = vectorLiteral(qvec)
	}

	const candidateK = 50
	const rrfK = 60.0

	// Args:
	//  $1 user_id  $2 query  $3 tag (empty = no filter)
	//  $4 candidate_k  $5 rrf_k  $6 vector literal  $7 have_vec  $8 limit
	sql := `
WITH vec_hits AS (
    SELECT id,
           ROW_NUMBER() OVER (ORDER BY embedding <=> $6::vector) AS rnk
    FROM capsules
    WHERE user_id = $1
      AND deleted_at IS NULL
      AND embedding IS NOT NULL
      AND ($3 = '' OR tags @> ARRAY[$3]::text[])
      AND $7::bool
    ORDER BY embedding <=> $6::vector
    LIMIT $4
),
txt_hits AS (
    SELECT id,
           ROW_NUMBER() OVER (
               ORDER BY ts_rank_cd(search_tsv, plainto_tsquery('simple', $2)) DESC
           ) AS rnk
    FROM capsules
    WHERE user_id = $1
      AND deleted_at IS NULL
      AND search_tsv @@ plainto_tsquery('simple', $2)
      AND ($3 = '' OR tags @> ARRAY[$3]::text[])
    ORDER BY ts_rank_cd(search_tsv, plainto_tsquery('simple', $2)) DESC
    LIMIT $4
),
fused AS (
    SELECT COALESCE(v.id, t.id)                                    AS id,
           v.rnk                                                    AS v_rnk,
           t.rnk                                                    AS t_rnk,
           COALESCE(1.0 / ($5 + v.rnk), 0)
         + COALESCE(1.0 / ($5 + t.rnk), 0)                          AS score
    FROM vec_hits v
    FULL OUTER JOIN txt_hits t ON v.id = t.id
)
SELECT c.id, c.title, c.summary, c.source, c.source_url, c.tags, c.updated_at,
       f.score, f.v_rnk, f.t_rnk
FROM fused f
JOIN capsules c ON c.id = f.id
ORDER BY f.score DESC
LIMIT $8;
`

	rows, err := s.pool.Query(ctx, sql,
		userID, in.Query, in.Tag,
		candidateK, rrfK,
		vecArg, haveVec, limit,
	)
	if err != nil {
		return nil, fmt.Errorf("search query: %w", err)
	}
	defer rows.Close()

	out := make([]SearchHit, 0, limit)
	for rows.Next() {
		var (
			h     SearchHit
			vRank *int64
			tRank *int64
		)
		if err := rows.Scan(&h.ID, &h.Title, &h.Summary, &h.Source, &h.SourceURL, &h.Tags, &h.UpdatedAt, &h.Score, &vRank, &tRank); err != nil {
			return nil, fmt.Errorf("search scan: %w", err)
		}
		if vRank != nil {
			i := int(*vRank)
			h.VectorRank = &i
		}
		if tRank != nil {
			i := int(*tRank)
			h.TextRank = &i
		}
		out = append(out, h)
	}
	return out, rows.Err()
}

// zeroVec returns a 1536-zero vector body (no brackets), used as a harmless
// placeholder when the vector leg is gated off via $7=false.
func zeroVec() string {
	if cachedZeroVec != "" {
		return cachedZeroVec
	}
	buf := make([]byte, 0, 1536*2)
	for i := 0; i < 1536; i++ {
		if i > 0 {
			buf = append(buf, ',')
		}
		buf = append(buf, '0')
	}
	cachedZeroVec = string(buf)
	return cachedZeroVec
}

var cachedZeroVec string
