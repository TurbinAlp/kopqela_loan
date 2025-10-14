import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth-config'
import { extendTrial } from '@/app/lib/subscription/manager'

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
    const { businessId, days } = body

    if (!businessId || !days) {
      return NextResponse.json(
        { success: false, error: 'Business ID and days are required' },
        { status: 400 }
      )
    }

    if (days < 1 || days > 365) {
      return NextResponse.json(
        { success: false, error: 'Days must be between 1 and 365' },
        { status: 400 }
      )
    }

    // Extend trial
    const result = await extendTrial(businessId, days)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.subscription,
      message: result.message,
    })
  } catch (error) {
    console.error('Error extending trial:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extend trial',
      },
      { status: 500 }
    )
  }
}

