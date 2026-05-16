-- name: CreateCapsule :one
INSERT INTO capsules (
    id, user_id, title, summary, source, source_url, messages, tags,
    version, root_id, parent_id
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
)
RETURNING *;

-- name: GetCapsule :one
SELECT * FROM capsules
WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL;

-- name: ListCapsulesByUser :many
SELECT * FROM capsules
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY updated_at DESC
LIMIT $2;

-- name: SearchCapsules :many
SELECT * FROM capsules
WHERE user_id = $1
  AND deleted_at IS NULL
  AND (title ILIKE '%' || $2 || '%' OR summary ILIKE '%' || $2 || '%')
ORDER BY updated_at DESC
LIMIT $3;

-- name: ListCapsulesByTag :many
SELECT * FROM capsules
WHERE user_id = $1
  AND deleted_at IS NULL
  AND tags @> ARRAY[$2::text]
ORDER BY updated_at DESC
LIMIT $3;

-- name: UpdateCapsuleMeta :one
UPDATE capsules
SET title = $3, summary = $4, tags = $5, updated_at = now()
WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteCapsule :exec
UPDATE capsules
SET deleted_at = now()
WHERE id = $1 AND user_id = $2;

-- name: GetLineage :many
SELECT * FROM capsules
WHERE user_id = $1 AND root_id = $2 AND deleted_at IS NULL
ORDER BY version ASC;

-- name: GetMaxVersionInLineage :one
SELECT COALESCE(MAX(version), 0)::int AS max_version FROM capsules
WHERE user_id = $1 AND root_id = $2;

-- name: SetCapsuleShareToken :one
UPDATE capsules SET share_token = $3, updated_at = now()
WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
RETURNING *;

-- name: ClearCapsuleShareToken :exec
UPDATE capsules SET share_token = NULL, updated_at = now()
WHERE id = $1 AND user_id = $2;

-- name: GetCapsuleByShareToken :one
SELECT * FROM capsules
WHERE share_token = $1 AND deleted_at IS NULL;
