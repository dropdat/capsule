-- +goose Up
-- +goose StatementBegin
CREATE TABLE folders (
    id          UUID         PRIMARY KEY,
    user_id     TEXT         NOT NULL,
    name        TEXT         NOT NULL,
    is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ  NULL
);

CREATE UNIQUE INDEX idx_folders_user_name ON folders (user_id, lower(name)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_folders_user_default ON folders (user_id) WHERE is_default AND deleted_at IS NULL;
CREATE INDEX idx_folders_user_updated ON folders (user_id, updated_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE links (
    id          UUID         PRIMARY KEY,
    user_id     TEXT         NOT NULL,
    folder_id   UUID         NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    url         TEXT         NOT NULL,
    title       TEXT         NOT NULL DEFAULT '',
    note        TEXT         NOT NULL DEFAULT '',
    favicon_url TEXT         NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ  NULL
);

CREATE INDEX idx_links_user_updated ON links (user_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_links_folder ON links (folder_id, updated_at DESC) WHERE deleted_at IS NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS links;
DROP TABLE IF EXISTS folders;
-- +goose StatementEnd
