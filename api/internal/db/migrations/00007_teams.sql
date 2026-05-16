-- +goose Up
-- +goose StatementBegin
CREATE TABLE teams (
    id              UUID         PRIMARY KEY,
    name            TEXT         NOT NULL,
    owner_user_id   TEXT         NOT NULL,
    join_token      TEXT         NULL UNIQUE,
    join_enabled    BOOLEAN      NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_teams_owner ON teams (owner_user_id);
CREATE INDEX idx_teams_join_token ON teams (join_token) WHERE join_token IS NOT NULL;

CREATE TABLE team_members (
    team_id     UUID         NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id     TEXT         NOT NULL,
    role        TEXT         NOT NULL CHECK (role IN ('owner','admin','member')),
    joined_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (team_id, user_id)
);
CREATE INDEX idx_team_members_user ON team_members (user_id);

ALTER TABLE folders  ADD COLUMN team_id UUID NULL REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE capsules ADD COLUMN team_id UUID NULL REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX idx_folders_team  ON folders  (team_id) WHERE team_id IS NOT NULL;
CREATE INDEX idx_capsules_team ON capsules (team_id) WHERE team_id IS NOT NULL AND deleted_at IS NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_capsules_team;
DROP INDEX IF EXISTS idx_folders_team;
ALTER TABLE capsules DROP COLUMN IF EXISTS team_id;
ALTER TABLE folders  DROP COLUMN IF EXISTS team_id;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
-- +goose StatementEnd
