-- name: CreateContextPack :one
INSERT INTO context_packs (id, user_id, name, goal)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetContextPack :one
SELECT * FROM context_packs WHERE id = $1 AND user_id = $2;

-- name: ListContextPacks :many
SELECT * FROM context_packs
WHERE user_id = $1
ORDER BY updated_at DESC;

-- name: UpdateContextPack :one
UPDATE context_packs SET name = $3, goal = $4, updated_at = now()
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: DeleteContextPack :exec
DELETE FROM context_packs WHERE id = $1 AND user_id = $2;

-- name: AddPackItem :exec
INSERT INTO context_pack_items (pack_id, capsule_id, position)
VALUES ($1, $2, $3)
ON CONFLICT (pack_id, capsule_id) DO UPDATE SET position = EXCLUDED.position;

-- name: RemovePackItem :exec
DELETE FROM context_pack_items WHERE pack_id = $1 AND capsule_id = $2;

-- name: ListPackItems :many
SELECT c.*, cpi.position
FROM context_pack_items cpi
JOIN capsules c ON c.id = cpi.capsule_id
WHERE cpi.pack_id = $1 AND c.deleted_at IS NULL
ORDER BY cpi.position ASC, cpi.added_at ASC;

-- name: CountPackItems :one
SELECT COUNT(*) AS c FROM context_pack_items WHERE pack_id = $1;

-- name: GetCapsuleEmbedding :one
SELECT embedding FROM capsules
WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL AND embedding IS NOT NULL;

-- name: ListRelatedCapsules :many
SELECT c.*, (1 - (c.embedding <=> $2::vector))::float AS similarity
FROM capsules c
WHERE c.user_id = $1
  AND c.deleted_at IS NULL
  AND c.embedding IS NOT NULL
  AND c.id <> $3
ORDER BY c.embedding <=> $2::vector
LIMIT $4;
