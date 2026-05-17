-- name: TouchUserActivity :exec
INSERT INTO user_activity (user_id, last_seen_at, last_path, request_count)
VALUES ($1, now(), $2, 1)
ON CONFLICT (user_id) DO UPDATE
  SET last_seen_at  = now(),
      last_path     = EXCLUDED.last_path,
      request_count = user_activity.request_count + 1;

-- name: GetUserOverride :one
SELECT * FROM user_overrides WHERE user_id = $1;

-- name: SetUserBan :exec
INSERT INTO user_overrides (user_id, banned_at, banned_reason, updated_at)
VALUES ($1, now(), $2, now())
ON CONFLICT (user_id) DO UPDATE
  SET banned_at = now(), banned_reason = EXCLUDED.banned_reason, updated_at = now();

-- name: ClearUserBan :exec
UPDATE user_overrides
SET banned_at = NULL, banned_reason = '', updated_at = now()
WHERE user_id = $1;

-- name: AdminStats :one
SELECT
  (SELECT COUNT(*)::BIGINT FROM user_activity)                                     AS total_users,
  (SELECT COUNT(*)::BIGINT FROM user_activity WHERE last_seen_at > now() - interval '5 minutes')  AS live_users,
  (SELECT COUNT(*)::BIGINT FROM user_activity WHERE last_seen_at > now() - interval '24 hours')   AS active_24h,
  (SELECT COUNT(*)::BIGINT FROM capsules WHERE deleted_at IS NULL)                AS total_capsules,
  (SELECT COUNT(*)::BIGINT FROM context_packs)                                    AS total_packs,
  (SELECT COUNT(*)::BIGINT FROM capsule_attachments)                              AS total_attachments,
  (SELECT COALESCE(SUM(size_bytes), 0)::BIGINT FROM capsule_attachments)          AS attachment_bytes,
  (SELECT COUNT(*)::BIGINT FROM user_overrides WHERE banned_at IS NOT NULL)       AS banned_users;

-- name: AdminTierBreakdown :many
SELECT tier, COUNT(*)::BIGINT AS users
FROM subscriptions
GROUP BY tier
ORDER BY users DESC;

-- name: AdminUsersList :many
SELECT
  a.user_id,
  a.last_seen_at,
  a.last_path,
  a.request_count,
  COALESCE(s.tier, 'basic')         AS tier,
  COALESCE(s.status, '')            AS subscription_status,
  (SELECT COUNT(*) FROM capsules c WHERE c.user_id = a.user_id AND c.deleted_at IS NULL)::BIGINT AS capsule_count,
  o.banned_at,
  COALESCE(o.banned_reason, '')     AS banned_reason
FROM user_activity a
LEFT JOIN subscriptions   s ON s.user_id = a.user_id
LEFT JOIN user_overrides  o ON o.user_id = a.user_id
ORDER BY a.last_seen_at DESC
LIMIT $1;
