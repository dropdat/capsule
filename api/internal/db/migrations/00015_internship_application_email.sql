-- +goose Up
-- +goose StatementBegin
ALTER TABLE internship_applications
ADD COLUMN email TEXT NOT NULL DEFAULT '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE internship_applications DROP COLUMN email;
-- +goose StatementEnd
