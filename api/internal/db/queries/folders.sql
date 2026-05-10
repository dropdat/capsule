-- name: CreateFolder :one
INSERT INTO folders (id, user_id, name, is_default)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetFolder :one
SELECT * FROM folders
WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL;

-- name: GetDefaultFolder :one
SELECT * FROM folders
WHERE user_id = $1 AND is_default = TRUE AND deleted_at IS NULL
LIMIT 1;

-- name: ListFoldersByUser :many
SELECT * FROM folders
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY is_default DESC, lower(name) ASC;

-- name: RenameFolder :one
UPDATE folders
SET name = $3, updated_at = now()
WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
RETURNING *;

-- name: SetDefaultFolderClear :exec
UPDATE folders
SET is_default = FALSE, updated_at = now()
WHERE user_id = $1 AND is_default = TRUE AND deleted_at IS NULL;

-- name: SetDefaultFolder :one
UPDATE folders
SET is_default = TRUE, updated_at = now()
WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteFolder :exec
UPDATE folders
SET deleted_at = now()
WHERE id = $1 AND user_id = $2 AND is_default = FALSE;
