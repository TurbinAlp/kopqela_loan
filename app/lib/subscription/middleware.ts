import prisma from '../prisma'
import { PlanName, getLimit, hasFeature } from './limits'

/**
 * Get business subscription with plan details
 */
export async function getBusinessSubscription(businessId: number) {
  try {
    const subscription = await prisma.businessSubscription.findUnique({
      where: { businessId },
      include: {
        plan: true,
        business: true,
      },
    })

    return subscription
  } catch (error) {
    console.error('Error getting business subscription:', error)
    return null
  }
}

/**
 * Check if subscription is active (TRIAL or ACTIVE status)
 */
export async function isSubscriptionActive(businessId: number): Promise<boolean> {
  const subscription = await getBusinessSubscription(businessId)
  
  if (!subscription) return false
  
  return subscription.status === 'TRIAL' || subscription.status === 'ACTIVE'
}

/**
 * Check subscription status and return detailed info
 */
export async function checkSubscriptionStatus(businessId: number) {
  const subscription = await getBusinessSubscription(businessId)
  
  if (!subscription) {
    return {
      hasSubscription: false,
      isActive: false,
      isTrial: false,
      isExpired: true,
      status: 'EXPIRED' as const,
      planName: null,
      daysRemaining: 0,
    }
  }

  const now = new Date()
  const isTrial = subscription.status === 'TRIAL'
  const isActive = subscription.status === 'ACTIVE'
  const isExpired = subscription.status === 'EXPIRED'
  const isCancelled = subscription.status === 'CANCELLED'

  let daysRemaining = 0
  if (isTrial && subscription.trialEndsAt) {
    const diff = subscription.trialEndsAt.getTime() - now.getTime()
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  } else if (isActive) {
    const diff = subscription.currentPeriodEnd.getTime() - now.getTime()
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  return {
    hasSubscription: true,
    isActive: isActive || isTrial,
    isTrial,
    isExpired,
    isCancelled,
    status: subscription.status,
    planName: subscription.plan.name as PlanName,
    plan: subscription.plan,
    daysRemaining,
    currentPeriodEnd: subscription.currentPeriodEnd,
    trialEndsAt: subscription.trialEndsAt,
  }
}

/**
 * Get subscription usage statistics
 */
export async function getSubscriptionUsage(businessId: number) {
  const subscription = await getBusinessSubscription(businessId)
  
  if (!subscription) {
    return {
      businesses: 0,
      stores: 0,
      users: 0,
      products: 0,
      orders: 0,
    }
  }

  // Get owner ID from business
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { ownerId: true },
  })

  if (!business?.ownerId) {
    return {
      businesses: 0,
      stores: 0,
      users: 0,
      products: 0,
      orders: 0,
    }
  }

  // Count businesses owned by user
  const businessCount = await prisma.business.count({
    where: { ownerId: business.ownerId },
  })

  // Count stores for this business
  const storeCount = await prisma.store.count({
    where: { businessId, isActive: true },
  })

  // Count active users (employees) for this business
  const userCount = await prisma.businessUser.count({
    where: {
      businessId,
      isActive: true,
      isDeleted: false,
    },
  })

  // Count products for this business
  const productCount = await prisma.product.count({
    where: { businessId, isActive: true },
  })

  // Count orders for current month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const orderCount = await prisma.order.count({
    where: {
      businessId,
      orderDate: {
        gte: startOfMonth,
      },
    },
  })

  return {
    businesses: businessCount,
    stores: storeCount,
    users: userCount,
    products: productCount,
    orders: orderCount,
  }
}

/**
 * Check if user can create more businesses
 */
export async function canCreateBusiness(userId: number): Promise<{
  allowed: boolean
  reason?: string
  currentCount: number
  limit: number | null
  planName?: string
}> {
  // Get all businesses owned by user
  const businesses = await prisma.business.findMany({
    where: { ownerId: userId },
    include: {
      subscription: {
        include: { plan: true },
      },
    },
  })

  const currentCount = businesses.length

  // If user has no businesses yet, allow (they'll get trial)
  if (currentCount === 0) {
    return {
      allowed: true,
      currentCount: 0,
      limit: 1,
      planName: 'BASIC',
    }
  }

  // Get the subscription of the first business (we'll use this to check limits)
  const firstBusinessSubscription = businesses[0]?.subscription
  
  if (!firstBusinessSubscription) {
    // No subscription found, allow creating first business
    return {
      allowed: true,
      currentCount,
      limit: 1,
    }
  }

  const planName = firstBusinessSubscription.plan.name as PlanName
  const limit = getLimit(planName, 'max_businesses')

  // If unlimited, always allow
  if (limit === null) {
    return {
      allowed: true,
      currentCount,
      limit: null,
      planName,
    }
  }

  // Check if within limit
  const allowed = currentCount < limit

  return {
    allowed,
    reason: allowed ? undefined : `You've reached the maximum of ${limit} business(es) for your ${planName} plan`,
    currentCount,
    limit,
    planName,
  }
}

/**
 * Check if business can create more stores
 */
export async function canCreateStore(businessId: number): Promise<{
  allowed: boolean
  reason?: string
  currentCount: number
  limit: number | null
  planName?: string
}> {
  const subscription = await getBusinessSubscription(businessId)
  
  if (!subscription) {
    return {
      allowed: false,
      reason: 'No active subscription found',
      currentCount: 0,
      limit: 0,
    }
  }

  const planName = subscription.plan.name as PlanName
  const limit = getLimit(planName, 'max_stores_per_business')

  // Count active stores
  const currentCount = await prisma.store.count({
    where: { businessId, isActive: true },
  })

  // If unlimited, always allow
  if (limit === null) {
    return {
      allowed: true,
      currentCount,
      limit: null,
      planName,
    }
  }

  // Check if within limit
  const allowed = currentCount < limit

  return {
    allowed,
    reason: allowed ? undefined : `You've reached the maximum of ${limit} store(s) for your ${planName} plan`,
    currentCount,
    limit,
    planName,
  }
}

/**
 * Check if business can add more users
 */
export async function canAddUser(businessId: number): Promise<{
  allowed: boolean
  reason?: string
  currentCount: number
  limit: number | null
  planName?: string
}> {
  const subscription = await getBusinessSubscription(businessId)
  
  if (!subscription) {
    return {
      allowed: false,
      reason: 'No active subscription found',
      currentCount: 0,
      limit: 0,
    }
  }

  const planName = subscription.plan.name as PlanName
  const limit = getLimit(planName, 'max_users_per_business')

  // Count active users
  const currentCount = await prisma.businessUser.count({
    where: {
      businessId,
      isActive: true,
      isDeleted: false,
    },
  })

  // If unlimited, always allow
  if (limit === null) {
    return {
      allowed: true,
      currentCount,
      limit: null,
      planName,
    }
  }

  // Check if within limit
  const allowed = currentCount < limit

  return {
    allowed,
    reason: allowed ? undefined : `You've reached the maximum of ${limit} user(s) for your ${planName} plan`,
    currentCount,
    limit,
    planName,
  }
}

/**
 * Check if business has access to a specific feature
 */
export async function checkFeatureAccess(
  businessId: number,
  feature: 'enable_credit_sales' | 'enable_advanced_reports' | 'enable_accounting' | 'enable_multi_store'
): Promise<{
  allowed: boolean
  reason?: string
  planName?: string
  requiredPlan?: string
}> {
  const subscription = await getBusinessSubscription(businessId)
  
  if (!subscription) {
    return {
      allowed: false,
      reason: 'No active subscription found',
    }
  }

  const planName = subscription.plan.name as PlanName
  const allowed = hasFeature(planName, feature)

  // Determine which plan is required for this feature
  let requiredPlan = 'PROFESSIONAL'
  if (feature === 'enable_advanced_reports' || feature === 'enable_accounting') {
    requiredPlan = 'ENTERPRISE'
  }

  return {
    allowed,
    reason: allowed ? undefined : `This feature requires ${requiredPlan} plan or higher`,
    planName,
    requiredPlan: allowed ? undefined : requiredPlan,
  }
}

