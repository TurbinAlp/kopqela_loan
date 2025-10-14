import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth-config'
import { activateSubscription } from '@/app/lib/subscription/manager'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { businessId, planId, billingCycle } = body

    if (!businessId || !planId) {
      return NextResponse.json(
        { success: false, error: 'Business ID and Plan ID are required' },
        { status: 400 }
      )
    }

    // Validate billing cycle
    const validBillingCycle = billingCycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY'

    // Activate subscription
    const result = await activateSubscription(businessId, planId, validBillingCycle)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.subscription,
      message: 'Subscription activated successfully',
    })
  } catch (error) {
    console.error('Error activating subscription:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to activate subscription',
      },
      { status: 500 }
    )
  }
}

