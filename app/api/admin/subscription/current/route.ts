import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth-config'
import { getBusinessSubscription, checkSubscriptionStatus, getSubscriptionUsage } from '@/app/lib/subscription/middleware'
import { getLimit } from '@/app/lib/subscription/limits'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get businessId from query params
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      )
    }

    const businessIdNum = parseInt(businessId)

    // Get subscription details
    const subscription = await getBusinessSubscription(businessIdNum)

    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: {
          hasSubscription: false,
          subscription: null,
          status: null,
          usage: null,
          limits: null,
        },
      })
    }

    // Get subscription status with days remaining
    const status = await checkSubscriptionStatus(businessIdNum)

    // Get usage statistics
    const usage = await getSubscriptionUsage(businessIdNum)

    // Get limits based on plan
    const planName = subscription.plan.name as 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
    const limits = {
      max_businesses: getLimit(planName, 'max_businesses'),
      max_stores_per_business: getLimit(planName, 'max_stores_per_business'),
      max_users_per_business: getLimit(planName, 'max_users_per_business'),
    }

    return NextResponse.json({
      success: true,
      data: {
        hasSubscription: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          planName: subscription.plan.name,
          planDisplayName: subscription.plan.displayName,
          planDisplayNameSwahili: subscription.plan.displayNameSwahili,
          priceMonthly: subscription.plan.priceMonthly,
          billingCycle: subscription.billingCycle,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEndsAt: subscription.trialEndsAt,
          features: subscription.plan.features,
        },
        status: {
          isActive: status.isActive,
          isTrial: status.isTrial,
          isExpired: status.isExpired,
          isCancelled: status.isCancelled,
          daysRemaining: status.daysRemaining,
        },
        usage,
        limits,
      },
    })
  } catch (error) {
    console.error('Error getting current subscription:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get subscription',
      },
      { status: 500 }
    )
  }
}

