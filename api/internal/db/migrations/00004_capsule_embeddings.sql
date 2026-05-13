-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE capsules
    ADD COLUMN embedding   vector(1536) NULL,
    ADD COLUMN embedded_at TIMESTAMPTZ  NULL;

-- HNSW for cosine similarity. Partial index — skips soft-deleted and unembedded rows.
CREATE INDEX idx_capsules_embedding_hnsw
    ON capsules
    USING hnsw (embedding vector_cosine_ops)
    WHERE deleted_at IS NULL AND embedding IS NOT NULL;

-- Wider tsvector covering tags as well, kept as a generated column so it
-- stays in sync without trigger upkeep. Drops the old index from 00001.
DROP INDEX IF EXISTS idx_capsules_search;

ALTER TABLE capsules
    ADD COLUMN search_tsv tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce(title, '')),       'A') ||
        setweight(to_tsvector('simple', coalesce(summary, '')),     'B') ||
        setweight(to_tsvector('simple', array_to_string(tags, ' ')), 'C')
    ) STORED;

CREATE INDEX idx_capsules_search_tsv
    ON capsules
    USING GIN (search_tsv)
    WHERE deleted_at IS NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_capsules_search_tsv;
ALTER TABLE capsules DROP COLUMN IF EXISTS search_tsv;
DROP INDEX IF EXISTS idx_capsules_embedding_hnsw;
ALTER TABLE capsules
    DROP COLUMN IF EXISTS embedding,
    DROP COLUMN IF EXISTS embedded_at;
CREATE INDEX idx_capsules_search
    ON capsules USING GIN (to_tsvector('simple', title || ' ' || summary));
-- +goose StatementEnd
