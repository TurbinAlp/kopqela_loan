import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, getUserPermissions, getUserRoleForBusiness } from '../../../../lib/rbac/middleware'
import { prisma } from '../../../../lib/prisma'

/**
 * GET /api/rbac/permissions/business?businessId=123
 * Get user permissions for a specific business
 */
export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthContext(req)
    if (!authContext) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({
        success: false,
        error: 'Business ID is required'
      }, { status: 400 })
    }

    const businessIdNum = parseInt(businessId)

    // Get permissions for specific business
    const businessPermissions = await getUserPermissions(authContext.userId, businessIdNum)
    
    // Get user role for this business
    const userRole = await getUserRoleForBusiness(authContext.userId, businessIdNum)

    // Get business type
    const business = await prisma.business.findUnique({
      where: { id: businessIdNum },
      select: { businessType: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        businessId: businessIdNum,
        userRole,
        permissions: businessPermissions,
        userId: authContext.userId,
        businessType: business?.businessType || null
      }
    })

  } catch (error) {
    console.error('Error fetching business permissions:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
