-- +goose Up
-- +goose StatementBegin
CREATE TABLE capsule_attachments (
    id            UUID         PRIMARY KEY,
    capsule_id    UUID         NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
    user_id       TEXT         NOT NULL,
    filename      TEXT         NOT NULL,
    content_type  TEXT         NOT NULL DEFAULT '',
    size_bytes    BIGINT       NOT NULL DEFAULT 0,
    storage_key   TEXT         NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX capsule_attachments_capsule_idx ON capsule_attachments (capsule_id);
CREATE INDEX capsule_attachments_user_idx   ON capsule_attachments (user_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS capsule_attachments;
-- +goose StatementEnd
