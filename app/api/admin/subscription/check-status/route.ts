import { NextRequest, NextResponse } from 'next/server'
import { checkAndUpdateExpiredSubscriptions } from '@/app/lib/subscription/manager'

// This endpoint can be called by a cron job or manually to check for expired subscriptions
export async function POST(req: NextRequest) {
  try {
    // Optional: Add authentication for cron jobs (e.g., secret token)
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check and update expired subscriptions
    const result = await checkAndUpdateExpiredSubscriptions()

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        expiredTrials: result.expiredTrials,
        expiredActive: result.expiredActive,
        totalExpired: (result.expiredTrials || 0) + (result.expiredActive || 0),
      },
      message: 'Subscription status checked successfully',
    })
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check subscription status',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Allow GET for manual triggering
  return POST(req)
}

