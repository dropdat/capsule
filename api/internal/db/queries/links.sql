-- name: CreateLink :one
INSERT INTO links (id, user_id, folder_id, url, title, note, favicon_url)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetLink :one
SELECT * FROM links
WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL;

-- name: ListLinksByUser :many
SELECT * FROM links
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY updated_at DESC
LIMIT $2;

-- name: ListLinksByFolder :many
SELECT * FROM links
WHERE user_id = $1 AND folder_id = $2 AND deleted_at IS NULL
ORDER BY updated_at DESC
LIMIT $3;

-- name: UpdateLink :one
UPDATE links
SET title = $3, note = $4, folder_id = $5, updated_at = now()
WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteLink :exec
UPDATE links
SET deleted_at = now()
WHERE id = $1 AND user_id = $2;
