-- name: CreateAttachment :one
INSERT INTO capsule_attachments (id, capsule_id, user_id, filename, content_type, size_bytes, storage_key, content_hash)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: FindAttachmentByHash :one
-- Per-capsule dedupe lookup. Empty hash never matches (we only store hashes
-- for new uploads; legacy rows stay empty).
SELECT * FROM capsule_attachments
WHERE capsule_id = $1 AND user_id = $2 AND content_hash = $3 AND content_hash <> ''
LIMIT 1;

-- name: ListAttachments :many
SELECT * FROM capsule_attachments
WHERE capsule_id = $1 AND user_id = $2
ORDER BY created_at ASC;

-- name: GetAttachment :one
SELECT * FROM capsule_attachments
WHERE id = $1 AND user_id = $2;

-- name: DeleteAttachment :exec
DELETE FROM capsule_attachments
WHERE id = $1 AND user_id = $2;

-- name: SumAttachmentBytesByUser :one
SELECT COALESCE(SUM(size_bytes), 0)::BIGINT FROM capsule_attachments
WHERE user_id = $1;
