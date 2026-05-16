-- +goose Up
-- +goose StatementBegin
CREATE TABLE subscriptions (
    user_id                       TEXT          PRIMARY KEY,
    tier                          TEXT          NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic','pro','premium','ultimate','enterprise')),
    status                        TEXT          NOT NULL DEFAULT 'inactive',
    dodopayments_customer_id      TEXT          NULL,
    dodopayments_subscription_id  TEXT          NULL,
    product_id                    TEXT          NULL,
    current_period_start          TIMESTAMPTZ   NULL,
    current_period_end            TIMESTAMPTZ   NULL,
    created_at                    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at                    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_dodo_sub ON subscriptions (dodopayments_subscription_id) WHERE dodopayments_subscription_id IS NOT NULL;

ALTER TABLE api_keys ADD COLUMN scopes TEXT[] NOT NULL DEFAULT '{}';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE api_keys DROP COLUMN IF EXISTS scopes;
DROP TABLE IF EXISTS subscriptions;
-- +goose StatementEnd
