-- +goose Up
-- +goose StatementBegin
CREATE TABLE capsules (
    id          UUID         PRIMARY KEY,
    user_id     TEXT         NOT NULL,
    title       TEXT         NOT NULL,
    summary     TEXT         NOT NULL DEFAULT '',
    source      TEXT         NOT NULL CHECK (source IN ('chatgpt', 'claude', 'gemini')),
    source_url  TEXT         NOT NULL DEFAULT '',
    messages    JSONB        NOT NULL DEFAULT '[]'::jsonb,
    tags        TEXT[]       NOT NULL DEFAULT '{}',
    version     INTEGER      NOT NULL DEFAULT 1,
    root_id     UUID         NOT NULL,
    parent_id   UUID         NULL REFERENCES capsules(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ  NULL
);

CREATE INDEX idx_capsules_user_updated   ON capsules (user_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_capsules_user_root_ver  ON capsules (user_id, root_id, version);
CREATE INDEX idx_capsules_tags           ON capsules USING GIN (tags);
CREATE INDEX idx_capsules_search         ON capsules USING GIN (to_tsvector('simple', title || ' ' || summary));
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS capsules;
-- +goose StatementEnd
