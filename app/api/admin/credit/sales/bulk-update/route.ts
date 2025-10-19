import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, handlePrismaError } from '../../../../../lib/prisma'
import { getAuthContext } from '../../../../../lib/rbac/middleware'

const bulkUpdateSchema = z.object({
  saleIds: z.array(z.number()),
  businessId: z.number(),
  status: z.enum(['PAID', 'PARTIAL', 'PENDING'])
})

/**
 * POST /api/admin/credit/sales/bulk-update
 * Bulk update credit sales status (e.g., mark as paid)
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 })
    }

    const body = await request.json()
    const validation = bulkUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      }, { status: 400 })
    }

    const { saleIds, businessId, status } = validation.data

    // Verify all sales belong to the business
    const sales = await prisma.order.findMany({
      where: {
        id: { in: saleIds },
        businessId
      }
    })

    if (sales.length !== saleIds.length) {
      return NextResponse.json({
        success: false,
        message: 'Some sales do not belong to this business'
      }, { status: 403 })
    }

    // Update all sales
    await prisma.order.updateMany({
      where: {
        id: { in: saleIds },
        businessId
      },
      data: {
        paymentStatus: status
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${saleIds.length} sale(s)`,
      data: {
        updatedCount: saleIds.length
      }
    })

  } catch (error) {
    console.error('Error bulk updating sales:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update sales',
      error: handlePrismaError(error)
    }, { status: 500 })
  }
}

