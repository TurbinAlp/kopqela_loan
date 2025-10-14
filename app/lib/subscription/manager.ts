import prisma from '../prisma'
import { PlanName } from './limits'

/**
 * Assign a plan to a business (manual activation)
 */
export async function assignPlan(
  businessId: number,
  planId: number,
  billingCycle: 'MONTHLY' | 'YEARLY' = 'MONTHLY'
) {
  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      throw new Error('Plan not found')
    }

    const now = new Date()
    const periodEnd = new Date(now)
    
    // Set period end based on billing cycle
    if (billingCycle === 'MONTHLY') {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.businessSubscription.findUnique({
      where: { businessId },
    })

    if (existingSubscription) {
      // Update existing subscription
      const subscription = await prisma.businessSubscription.update({
        where: { businessId },
        data: {
          planId,
          status: 'ACTIVE',
          billingCycle,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          trialEndsAt: null, // Remove trial when activating
          cancelledAt: null,
        },
        include: {
          plan: true,
        },
      })

      return {
        success: true,
        subscription,
      }
    } else {
      // Create new subscription
      const subscription = await prisma.businessSubscription.create({
        data: {
          businessId,
          planId,
          status: 'ACTIVE',
          billingCycle,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
        include: {
          plan: true,
        },
      })

      return {
        success: true,
        subscription,
      }
    }
  } catch (error) {
    console.error('Error assigning plan:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign plan',
    }
  }
}

/**
 * Upgrade business to a new plan
 */
export async function upgradePlan(businessId: number, newPlanId: number) {
  return assignPlan(businessId, newPlanId, 'MONTHLY')
}

/**
 * Downgrade business to a new plan
 */
export async function downgradePlan(businessId: number, newPlanId: number) {
  return assignPlan(businessId, newPlanId, 'MONTHLY')
}

/**
 * Cancel subscription (expires at period end)
 */
export async function cancelSubscription(businessId: number) {
  try {
    const subscription = await prisma.businessSubscription.update({
      where: { businessId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      include: {
        plan: true,
      },
    })

    return {
      success: true,
      subscription,
      message: `Subscription will expire on ${subscription.currentPeriodEnd.toLocaleDateString()}`,
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel subscription',
    }
  }
}

/**
 * Renew subscription for another period
 */
export async function renewSubscription(businessId: number) {
  try {
    const subscription = await prisma.businessSubscription.findUnique({
      where: { businessId },
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    const now = new Date()
    const periodEnd = new Date(now)
    
    // Set period end based on billing cycle
    if (subscription.billingCycle === 'MONTHLY') {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    }

    const renewed = await prisma.businessSubscription.update({
      where: { businessId },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelledAt: null,
      },
      include: {
        plan: true,
      },
    })

    return {
      success: true,
      subscription: renewed,
    }
  } catch (error) {
    console.error('Error renewing subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to renew subscription',
    }
  }
}

/**
 * Extend trial period
 */
export async function extendTrial(businessId: number, days: number) {
  try {
    const subscription = await prisma.businessSubscription.findUnique({
      where: { businessId },
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    if (subscription.status !== 'TRIAL') {
      throw new Error('Subscription is not in trial period')
    }

    const currentTrialEnd = subscription.trialEndsAt || subscription.currentPeriodEnd
    const newTrialEnd = new Date(currentTrialEnd)
    newTrialEnd.setDate(newTrialEnd.getDate() + days)

    const extended = await prisma.businessSubscription.update({
      where: { businessId },
      data: {
        trialEndsAt: newTrialEnd,
        currentPeriodEnd: newTrialEnd,
      },
      include: {
        plan: true,
      },
    })

    return {
      success: true,
      subscription: extended,
      message: `Trial extended by ${days} days`,
    }
  } catch (error) {
    console.error('Error extending trial:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extend trial',
    }
  }
}

/**
 * Activate subscription from trial
 */
export async function activateSubscription(
  businessId: number,
  planId: number,
  billingCycle: 'MONTHLY' | 'YEARLY' = 'MONTHLY'
) {
  return assignPlan(businessId, planId, billingCycle)
}

/**
 * Create trial subscription for new business
 */
export async function createTrialSubscription(businessId: number) {
  try {
    // Get BASIC plan
    const basicPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: 'BASIC' },
    })

    if (!basicPlan) {
      throw new Error('BASIC plan not found')
    }

    const now = new Date()
    const trialEnd = new Date(now)
    trialEnd.setDate(trialEnd.getDate() + 30) // 30 days trial

    const subscription = await prisma.businessSubscription.create({
      data: {
        businessId,
        planId: basicPlan.id,
        status: 'TRIAL',
        billingCycle: 'MONTHLY',
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        trialEndsAt: trialEnd,
      },
      include: {
        plan: true,
      },
    })

    return {
      success: true,
      subscription,
      message: 'Trial subscription created successfully',
    }
  } catch (error) {
    console.error('Error creating trial subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create trial subscription',
    }
  }
}

/**
 * Check and update expired subscriptions
 */
export async function checkAndUpdateExpiredSubscriptions() {
  try {
    const now = new Date()

    // Find all TRIAL subscriptions where trial has ended
    const expiredTrials = await prisma.businessSubscription.findMany({
      where: {
        status: 'TRIAL',
        trialEndsAt: {
          lt: now,
        },
      },
    })

    // Find all ACTIVE subscriptions where period has ended
    const expiredActive = await prisma.businessSubscription.findMany({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: {
          lt: now,
        },
      },
    })

    // Update trials to EXPIRED
    for (const subscription of expiredTrials) {
      await prisma.businessSubscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      })
    }

    // Update active to EXPIRED
    for (const subscription of expiredActive) {
      await prisma.businessSubscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      })
    }

    return {
      success: true,
      expiredTrials: expiredTrials.length,
      expiredActive: expiredActive.length,
    }
  } catch (error) {
    console.error('Error checking expired subscriptions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check expired subscriptions',
    }
  }
}

