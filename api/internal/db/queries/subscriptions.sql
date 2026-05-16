-- name: GetSubscription :one
SELECT * FROM subscriptions WHERE user_id = $1;

-- name: UpsertSubscription :one
INSERT INTO subscriptions (
    user_id, tier, status,
    dodopayments_customer_id, dodopayments_subscription_id, product_id,
    current_period_start, current_period_end
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (user_id) DO UPDATE SET
    tier                         = EXCLUDED.tier,
    status                       = EXCLUDED.status,
    dodopayments_customer_id     = COALESCE(EXCLUDED.dodopayments_customer_id, subscriptions.dodopayments_customer_id),
    dodopayments_subscription_id = COALESCE(EXCLUDED.dodopayments_subscription_id, subscriptions.dodopayments_subscription_id),
    product_id                   = EXCLUDED.product_id,
    current_period_start         = EXCLUDED.current_period_start,
    current_period_end           = EXCLUDED.current_period_end,
    updated_at                   = now()
RETURNING *;

-- name: UpdateSubscriptionStatus :exec
UPDATE subscriptions SET status = $2, updated_at = now() WHERE user_id = $1;

-- name: SetSubscriptionTier :exec
UPDATE subscriptions SET tier = $2, updated_at = now() WHERE user_id = $1;

-- name: CountUserCapsulesActive :one
SELECT COUNT(*) AS c FROM capsules WHERE user_id = $1 AND deleted_at IS NULL;
