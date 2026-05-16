-- name: CreateAPIKey :one
INSERT INTO api_keys (id, user_id, name, token_hash, prefix, scopes)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: ListAPIKeysByUser :many
SELECT id, user_id, name, prefix, scopes, last_used_at, created_at, revoked_at
FROM api_keys
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: GetAPIKeyByHash :one
SELECT * FROM api_keys
WHERE token_hash = $1 AND revoked_at IS NULL;

-- name: TouchAPIKey :exec
UPDATE api_keys SET last_used_at = now() WHERE id = $1;

-- name: RevokeAPIKey :exec
UPDATE api_keys SET revoked_at = now()
WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL;
