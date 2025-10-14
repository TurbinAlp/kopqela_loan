import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { createTrialSubscription } from '@/app/lib/subscription/manager'

// One-time migration endpoint to assign trials to existing businesses
export async function POST(req: NextRequest) {
  try {
    // Add authentication check - only allow admin/super-admin
    const authHeader = req.headers.get('authorization')
    const migrationSecret = process.env.MIGRATION_SECRET || 'kopqela-migration-2024'

    if (authHeader !== `Bearer ${migrationSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid migration secret' },
        { status: 401 }
      )
    }

    // Find all businesses without subscriptions
    const businessesWithoutSubs = await prisma.business.findMany({
      where: {
        subscription: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    console.log(`Found ${businessesWithoutSubs.length} businesses without subscriptions`)

    const results = {
      total: businessesWithoutSubs.length,
      success: 0,
      failed: 0,
      errors: [] as { businessId: number; businessName: string; error: string }[],
    }

    // Create trial subscriptions for each business
    for (const business of businessesWithoutSubs) {
      try {
        const result = await createTrialSubscription(business.id)

        if (result.success) {
          results.success++
          console.log(`✅ Created trial for business: ${business.name} (ID: ${business.id})`)

          // TODO: Send email to business owner about the new subscription system
          // await sendTrialWelcome(business.owner, business)
        } else {
          results.failed++
          results.errors.push({
            businessId: business.id,
            businessName: business.name,
            error: result.error || 'Unknown error',
          })
          console.error(`❌ Failed to create trial for business: ${business.name} (ID: ${business.id})`)
        }
      } catch (error) {
        results.failed++
        results.errors.push({
          businessId: business.id,
          businessName: business.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        console.error(`❌ Error creating trial for business ${business.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `Migration completed. ${results.success} successful, ${results.failed} failed.`,
    })
  } catch (error) {
    console.error('Error during migration:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to migrate existing businesses',
      },
      { status: 500 }
    )
  }
}

