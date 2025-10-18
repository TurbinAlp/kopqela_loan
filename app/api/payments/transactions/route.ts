import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth-config'
import prisma from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const businessId = searchParams.get('businessId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      )
    }

    // Verify user has access to this business
    const business = await prisma.business.findUnique({
      where: { id: parseInt(businessId) },
    })

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }

    if (business.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Build where clause
    const where: {
      businessId: number
      status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED'
    } = {
      businessId: parseInt(businessId),
    }

    if (status && ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(status)) {
      where.status = status as 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED'
    }

    // Get transactions
    const [transactions, total] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where,
        include: {
          plan: {
            select: {
              name: true,
              displayName: true,
              displayNameSwahili: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.paymentTransaction.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactions.map((t) => ({
          id: t.id,
          reference: t.reference,
          planName: t.plan.displayName,
          planNameSwahili: t.plan.displayNameSwahili,
          amount: t.amount,
          currency: t.currency,
          provider: t.provider,
          status: t.status,
          phoneNumber: t.phoneNumber,
          initiatedAt: t.initiatedAt,
          completedAt: t.completedAt,
          failureReason: t.failureReason,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching payment transactions:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}


