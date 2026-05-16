-- +goose Up
-- +goose StatementBegin
ALTER TABLE capsules ADD COLUMN share_token TEXT NULL UNIQUE;
CREATE INDEX idx_capsules_share_token ON capsules (share_token) WHERE share_token IS NOT NULL AND deleted_at IS NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_capsules_share_token;
ALTER TABLE capsules DROP COLUMN IF EXISTS share_token;
-- +goose StatementEnd
