-- +goose Up
-- +goose StatementBegin
CREATE TABLE internship_applications (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                 TEXT NOT NULL,
    college              TEXT NOT NULL,
    branch               TEXT NOT NULL,
    cgpa                 TEXT NOT NULL,
    resume_filename      TEXT NOT NULL,
    resume_content_type  TEXT NOT NULL,
    resume_bytes         BYTEA NOT NULL,
    unpaid_acknowledged  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX internship_applications_created_idx ON internship_applications (created_at DESC);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS internship_applications;
-- +goose StatementEnd
