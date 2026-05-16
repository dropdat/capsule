-- +goose Up
-- +goose StatementBegin
CREATE TABLE context_packs (
    id          UUID         PRIMARY KEY,
    user_id     TEXT         NOT NULL,
    name        TEXT         NOT NULL,
    goal        TEXT         NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_context_packs_user ON context_packs (user_id, updated_at DESC);

CREATE TABLE context_pack_items (
    pack_id    UUID         NOT NULL REFERENCES context_packs(id) ON DELETE CASCADE,
    capsule_id UUID         NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
    position   INTEGER      NOT NULL DEFAULT 0,
    added_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (pack_id, capsule_id)
);
CREATE INDEX idx_context_pack_items_capsule ON context_pack_items (capsule_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS context_pack_items;
DROP TABLE IF EXISTS context_packs;
-- +goose StatementEnd
