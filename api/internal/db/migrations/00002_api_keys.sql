-- +goose Up
-- +goose StatementBegin
CREATE TABLE api_keys (
    id           UUID          PRIMARY KEY,
    user_id      TEXT          NOT NULL,
    name         TEXT          NOT NULL,
    token_hash   TEXT          NOT NULL UNIQUE,
    prefix       TEXT          NOT NULL,
    last_used_at TIMESTAMPTZ   NULL,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
    revoked_at   TIMESTAMPTZ   NULL
);

CREATE INDEX idx_api_keys_user ON api_keys (user_id, created_at DESC) WHERE revoked_at IS NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS api_keys;
-- +goose StatementEnd
