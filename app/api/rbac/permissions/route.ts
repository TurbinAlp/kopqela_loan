import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '../../../lib/rbac/middleware'
import { getUserAllPermissions } from '../../../lib/rbac/seed-permissions'

/**
 * GET /api/rbac/permissions
 * Get current user's permissions
 */
export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthContext(req)
    
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's permissions
    const userPermissions = await getUserAllPermissions(
      authContext.userId, 
      authContext.businessId
    )

    return NextResponse.json({
      success: true,
      data: {
        userId: authContext.userId,
        role: authContext.role,
        businessId: authContext.businessId,
        rolePermissions: userPermissions.rolePermissions,
        userPermissions: userPermissions.userPermissions,
        allPermissions: userPermissions.allPermissions.map(p => p.name)
      }
    })
  } catch (error) {
    console.error('Error getting permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

/**
 * POST /api/rbac/permissions/check
 * Check if user has specific permission
 */
export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthContext(req)
    
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { permission, businessId } = await req.json()

    if (!permission) {
      return NextResponse.json(
        { error: 'Permission name is required' }, 
        { status: 400 }
      )
    }

    // Check if user has the permission
    const hasPermission = authContext.permissions.includes(permission)

    return NextResponse.json({
      success: true,
      data: {
        hasPermission,
        permission,
        userId: authContext.userId,
        businessId: businessId || authContext.businessId
      }
    })
  } catch (error) {
    console.error('Error checking permission:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 