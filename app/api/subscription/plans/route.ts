import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

/**
 * GET /api/subscription/plans
 * Public endpoint - Get all active subscription plans (no auth required)
 * Used during registration flow
 */
export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        priceMonthly: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: plans,
    })
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscription plans',
      },
      { status: 500 }
    )
  }
}

