import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth-config'
import { upgradePlan, downgradePlan } from '@/app/lib/subscription/manager'
import prisma from '@/app/lib/prisma'

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
    const { businessId, planId } = body

    if (!businessId || !planId) {
      return NextResponse.json(
        { success: false, error: 'Business ID and Plan ID are required' },
        { status: 400 }
      )
    }

    // Get current subscription to determine if upgrade or downgrade
    const currentSubscription = await prisma.businessSubscription.findUnique({
      where: { businessId },
      include: { plan: true },
    })

    if (!currentSubscription) {
      return NextResponse.json(
        { success: false, error: 'No subscription found' },
        { status: 404 }
      )
    }

    // Get new plan
    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    })

    if (!newPlan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Determine if upgrade or downgrade
    const isUpgrade = Number(newPlan.priceMonthly) > Number(currentSubscription.plan.priceMonthly)

    // Change plan
    const result = isUpgrade 
      ? await upgradePlan(businessId, planId)
      : await downgradePlan(businessId, planId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.subscription,
      message: `Plan ${isUpgrade ? 'upgraded' : 'downgraded'} successfully`,
    })
  } catch (error) {
    console.error('Error changing plan:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change plan',
      },
      { status: 500 }
    )
  }
}

