// Subscription plan limits and feature constants

export const SUBSCRIPTION_LIMITS = {
  BASIC: {
    max_businesses: 1,
    max_stores_per_business: 1,
    max_users_per_business: 2,
    enable_credit_sales: false,
    enable_advanced_reports: false,
    enable_accounting: false,
    enable_multi_store: false,
  },
  PROFESSIONAL: {
    max_businesses: 3,
    max_stores_per_business: 3,
    max_users_per_business: null, // unlimited
    enable_credit_sales: true,
    enable_advanced_reports: false,
    enable_accounting: false,
    enable_multi_store: true,
  },
  ENTERPRISE: {
    max_businesses: null, // unlimited
    max_stores_per_business: null, // unlimited
    max_users_per_business: null, // unlimited
    enable_credit_sales: true,
    enable_advanced_reports: true,
    enable_accounting: true,
    enable_multi_store: true,
  },
} as const

export type PlanName = keyof typeof SUBSCRIPTION_LIMITS
export type PlanFeature = keyof typeof SUBSCRIPTION_LIMITS.BASIC

/**
 * Get plan limits by plan name
 */
export function getPlanLimits(planName: PlanName) {
  return SUBSCRIPTION_LIMITS[planName] || SUBSCRIPTION_LIMITS.BASIC
}

/**
 * Check if a plan has a specific feature
 */
export function hasFeature(planName: PlanName, feature: PlanFeature): boolean {
  const limits = getPlanLimits(planName)
  return limits[feature] === true
}

/**
 * Get limit value for a specific feature
 */
export function getLimit(planName: PlanName, feature: PlanFeature): number | null {
  const limits = getPlanLimits(planName)
  const value = limits[feature]
  
  if (typeof value === 'number') return value
  if (value === null) return null // unlimited
  if (value === true) return null // unlimited for boolean features
  if (value === false) return 0 // disabled
  
  return 0
}

/**
 * Check if limit is unlimited
 */
export function isUnlimited(planName: PlanName, feature: PlanFeature): boolean {
  return getLimit(planName, feature) === null
}

/**
 * Check if current usage is within limits
 */
export function isWithinLimit(
  currentUsage: number,
  planName: PlanName,
  feature: PlanFeature
): boolean {
  const limit = getLimit(planName, feature)
  
  // If unlimited, always within limit
  if (limit === null) return true
  
  // If disabled (0), not within limit
  if (limit === 0) return false
  
  // Check if usage is within limit
  return currentUsage < limit
}

/**
 * Get percentage of limit used
 */
export function getLimitUsagePercentage(
  currentUsage: number,
  planName: PlanName,
  feature: PlanFeature
): number {
  const limit = getLimit(planName, feature)
  
  // If unlimited, return 0%
  if (limit === null) return 0
  
  // If disabled or no limit, return 100%
  if (limit === 0) return 100
  
  // Calculate percentage
  return Math.min(100, (currentUsage / limit) * 100)
}

/**
 * Check if usage is approaching limit (>= 80%)
 */
export function isApproachingLimit(
  currentUsage: number,
  planName: PlanName,
  feature: PlanFeature
): boolean {
  const percentage = getLimitUsagePercentage(currentUsage, planName, feature)
  return percentage >= 80 && percentage < 100
}

/**
 * Check if limit is reached
 */
export function isLimitReached(
  currentUsage: number,
  planName: PlanName,
  feature: PlanFeature
): boolean {
  const limit = getLimit(planName, feature)
  
  // If unlimited, never reached
  if (limit === null) return false
  
  // If disabled, always reached
  if (limit === 0) return true
  
  // Check if at or over limit
  return currentUsage >= limit
}

