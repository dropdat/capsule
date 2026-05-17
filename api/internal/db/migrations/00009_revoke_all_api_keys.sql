-- +goose Up
-- +goose StatementBegin
UPDATE api_keys SET revoked_at = now() WHERE revoked_at IS NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- One-shot revocation; intentionally non-reversible.
-- +goose StatementEnd
