-- +goose Up
-- +goose StatementBegin
ALTER TABLE capsules DROP CONSTRAINT IF EXISTS capsules_source_check;
ALTER TABLE capsules ADD CONSTRAINT capsules_source_check
    CHECK (source IN ('chatgpt', 'claude', 'gemini', 'mobile'));
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE capsules DROP CONSTRAINT IF EXISTS capsules_source_check;
ALTER TABLE capsules ADD CONSTRAINT capsules_source_check
    CHECK (source IN ('chatgpt', 'claude', 'gemini'));
-- +goose StatementEnd
