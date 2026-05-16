// Package billing maps dodopayments products to internal tiers and exposes
// the limits + API key scopes each tier grants.
package billing

import "os"

// Tier identifiers stored on subscriptions.tier.
const (
	TierBasic      = "basic"
	TierPro        = "pro"
	TierPremium    = "premium"
	TierUltimate   = "ultimate"
	TierEnterprise = "enterprise"
)

// Scope identifiers stored on api_keys.scopes.
const (
	ScopeCapsulesRead   = "capsules:read"
	ScopeCapsulesWrite  = "capsules:write"
	ScopeMCP            = "mcp"
	ScopeAttachments    = "attachments"
	ScopeDynamicContext = "dynamic_context"
	ScopeTeams          = "teams"
	ScopeTeamsCreate    = "teams:create"
	ScopeVersioning     = "versioning"
	ScopeShare          = "share"
)

// Limits describe per-tier quotas. CapsuleLimit == -1 means unlimited.
type Limits struct {
	CapsuleLimit int64
	Scopes       []string
}

// TierLimits returns the limits + max scopes for a tier. Unknown tiers fall back to basic.
func TierLimits(tier string) Limits {
	switch tier {
	case TierPro:
		return Limits{
			CapsuleLimit: 15,
			Scopes: []string{
				ScopeCapsulesRead, ScopeCapsulesWrite,
				ScopeVersioning,
				ScopeTeams, ScopeTeamsCreate,
			},
		}
	case TierPremium:
		return Limits{
			CapsuleLimit: 50,
			Scopes: []string{
				ScopeCapsulesRead, ScopeCapsulesWrite,
				ScopeMCP, ScopeAttachments, ScopeDynamicContext, ScopeVersioning,
				ScopeTeams, ScopeTeamsCreate,
			},
		}
	case TierUltimate, TierEnterprise:
		return Limits{
			CapsuleLimit: -1,
			Scopes: []string{
				ScopeCapsulesRead, ScopeCapsulesWrite,
				ScopeMCP, ScopeAttachments, ScopeDynamicContext, ScopeVersioning,
				ScopeTeams, ScopeTeamsCreate, ScopeShare,
			},
		}
	default:
		return Limits{
			CapsuleLimit: 5,
			Scopes: []string{
				ScopeCapsulesRead, ScopeCapsulesWrite,
			},
		}
	}
}

// TierForProductID resolves a dodopayments product id to an internal tier name.
// Mapping is configured via env so dev/prod product ids stay out of code.
func TierForProductID(productID string) string {
	if productID == "" {
		return TierBasic
	}
	switch productID {
	case os.Getenv("DODO_PRO_MONTHLY_PRODUCT_ID"), os.Getenv("DODO_PRO_ANNUAL_PRODUCT_ID"):
		return TierPro
	case os.Getenv("DODO_PREMIUM_MONTHLY_PRODUCT_ID"), os.Getenv("DODO_PREMIUM_ANNUAL_PRODUCT_ID"):
		return TierPremium
	case os.Getenv("DODO_ULTIMATE_MONTHLY_PRODUCT_ID"), os.Getenv("DODO_ULTIMATE_ANNUAL_PRODUCT_ID"):
		return TierUltimate
	}
	return TierBasic
}

// ProductIDForPlan returns the configured dodopayments product id for a (plan, interval).
// interval is "monthly" or "annual".
func ProductIDForPlan(plan, interval string) string {
	annual := interval == "annual"
	switch plan {
	case TierPro:
		if annual {
			return os.Getenv("DODO_PRO_ANNUAL_PRODUCT_ID")
		}
		return os.Getenv("DODO_PRO_MONTHLY_PRODUCT_ID")
	case TierPremium:
		if annual {
			return os.Getenv("DODO_PREMIUM_ANNUAL_PRODUCT_ID")
		}
		return os.Getenv("DODO_PREMIUM_MONTHLY_PRODUCT_ID")
	case TierUltimate:
		if annual {
			return os.Getenv("DODO_ULTIMATE_ANNUAL_PRODUCT_ID")
		}
		return os.Getenv("DODO_ULTIMATE_MONTHLY_PRODUCT_ID")
	}
	return ""
}
