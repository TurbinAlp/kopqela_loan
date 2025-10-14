import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth-config'
import { getSubscriptionUsage, getBusinessSubscription } from '@/app/lib/subscription/middleware'
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

    // Get subscription
    const subscription = await getBusinessSubscription(businessIdNum)

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No subscription found' },
        { status: 404 }
      )
    }

    // Get usage statistics
    const usage = await getSubscriptionUsage(businessIdNum)

    // Get limits
    const planName = subscription.plan.name as 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
    const limits = {
      businesses: getLimit(planName, 'max_businesses'),
      stores: getLimit(planName, 'max_stores_per_business'),
      users: getLimit(planName, 'max_users_per_business'),
    }

    return NextResponse.json({
      success: true,
      data: {
        usage,
        limits,
        planName,
      },
    })
  } catch (error) {
    console.error('Error getting subscription usage:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get usage',
      },
      { status: 500 }
    )
  }
}

