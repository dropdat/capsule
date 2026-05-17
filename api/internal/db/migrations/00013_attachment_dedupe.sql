-- +goose Up
-- +goose StatementBegin
ALTER TABLE capsule_attachments
  ADD COLUMN IF NOT EXISTS content_hash TEXT NOT NULL DEFAULT '';

-- Per-capsule dedupe: at most one row per (capsule_id, content_hash) when
-- the hash is set. Empty hash (legacy rows) is excluded so existing data
-- isn't constrained retroactively.
CREATE UNIQUE INDEX IF NOT EXISTS capsule_attachments_dedupe_idx
  ON capsule_attachments (capsule_id, content_hash)
  WHERE content_hash <> '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS capsule_attachments_dedupe_idx;
ALTER TABLE capsule_attachments DROP COLUMN IF EXISTS content_hash;
-- +goose StatementEnd
