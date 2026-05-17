-- +goose Up
-- +goose StatementBegin
CREATE TABLE user_overrides (
    user_id        TEXT         PRIMARY KEY,
    banned_at      TIMESTAMPTZ,
    banned_reason  TEXT         NOT NULL DEFAULT '',
    notes          TEXT         NOT NULL DEFAULT '',
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE user_activity (
    user_id       TEXT         PRIMARY KEY,
    last_seen_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    last_path     TEXT         NOT NULL DEFAULT '',
    request_count BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX user_activity_last_seen_idx ON user_activity (last_seen_at DESC);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS user_activity;
DROP TABLE IF EXISTS user_overrides;
-- +goose StatementEnd
