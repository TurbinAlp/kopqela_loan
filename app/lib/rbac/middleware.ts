import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../prisma'
import { Resource, Action, getPermissionName, getPermissionsForRole, isBusinessSpecificPermission } from './permissions'
import { UserRole } from '../../generated/prisma'

export interface AuthContext {
  userId: number
  role: UserRole
  permissions: string[]
  sessionId?: string
}

// Enhanced JWT token interface
interface EnhancedJWTToken {
  sub: string
  userId: number
  role: UserRole
  email?: string
  name?: string
  sessionId?: string
}

/**
 * Get authentication context from request
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    }) as EnhancedJWTToken | null

    if (!token?.userId) {
      return null
    }

    // Get user permissions from database
    const userPermissions = await getUserPermissions(token.userId)

    return {
      userId: token.userId,
      role: token.role,
      permissions: userPermissions,
      sessionId: token.sessionId
    }
  } catch (error) {
    console.error('Error getting auth context:', error)
    return null
  }
}

/**
 * Get all permissions for a user (role-based + explicit permissions)
 */
export async function getUserPermissions(userId: number): Promise<string[]> {
  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user) return []

    // Get role-based permissions
    const rolePermissions = getPermissionsForRole(user.role as keyof typeof getPermissionsForRole)

    // Get explicit user permissions from database (business-agnostic)
    const userPermissions = await prisma.userPermission.findMany({
      where: {
        userId,
        isActive: true,
        granted: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        permission: true
      }
    })

    const explicitPermissions = userPermissions.map(up => up.permission.name)

    // Combine role-based and explicit permissions
    const allPermissions = [...new Set([...rolePermissions, ...explicitPermissions])]

    return allPermissions
  } catch (error) {
    console.error('Error getting user permissions:', error)
    return []
  }
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  authContext: AuthContext,
  resource: Resource,
  action: Action,
  businessId?: number
): Promise<boolean> {
  const permissionName = getPermissionName(resource, action)
  
  // Check if permission exists in user's permissions
  if (!authContext.permissions.includes(permissionName)) {
    return false
  }

  // For business-specific permissions, verify user owns the business
  if (isBusinessSpecificPermission(permissionName) && businessId) {
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: authContext.userId
      }
    })
    
    if (!business) {
      return false
    }
  }

  return true
}

/**
 * Middleware factory for protecting API routes
 */
export function requirePermission(resource: Resource, action: Action, options?: {
  requireBusinessContext?: boolean
  allowSameUser?: boolean
}) {
  return async function middleware(req: NextRequest, context?: { params: Record<string, string> }) {
    const authContext = await getAuthContext(req)

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract business ID from URL params if needed
    let businessId: number | undefined
    if (context?.params?.businessId) {
      businessId = parseInt(context.params.businessId)
    }
    if (context?.params?.slug) {
      // Get business ID from slug
      const business = await prisma.business.findUnique({
        where: { slug: context.params.slug },
        select: { id: true }
      })
      businessId = business?.id
    }

    // Check business context requirement
    if (options?.requireBusinessContext && !businessId) {
      return NextResponse.json({ error: 'Business context required' }, { status: 400 })
    }

    // Check permission
    const hasAccess = await hasPermission(authContext, resource, action, businessId)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Add auth context to request headers for downstream use
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-auth-user-id', authContext.userId.toString())
    requestHeaders.set('x-auth-role', authContext.role)
    if (businessId) {
      requestHeaders.set('x-auth-business-id', businessId.toString())
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }
}

/**
 * Role-based middleware factory
 */
export function requireRole(allowedRoles: UserRole[]) {
  return async function middleware(req: NextRequest) {
    const authContext = await getAuthContext(req)

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!allowedRoles.includes(authContext.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Add auth context to request headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-auth-user-id', authContext.userId.toString())
    requestHeaders.set('x-auth-role', authContext.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }
}

/**
 * Business context middleware - ensures user belongs to the business
 */
export function requireBusinessAccess() {
  return async function middleware(req: NextRequest, context?: { params: Record<string, string> }) {
    const authContext = await getAuthContext(req)

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let businessId: number | undefined

    // Extract business ID from URL params
    if (context?.params?.businessId) {
      businessId = parseInt(context.params.businessId)
    } else if (context?.params?.slug) {
      const business = await prisma.business.findUnique({
        where: { slug: context.params.slug },
        select: { id: true }
      })
      businessId = business?.id
    }

    if (!businessId) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check if user owns this business or is admin
    if (authContext.role !== 'ADMIN') {
      const business = await prisma.business.findFirst({
        where: {
          id: businessId,
          ownerId: authContext.userId
        }
      })
      
      if (!business) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Add business ID to request headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-auth-user-id', authContext.userId.toString())
    requestHeaders.set('x-auth-role', authContext.role)
    requestHeaders.set('x-auth-business-id', businessId.toString())

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }
}

/**
 * Extract auth context from request headers (for API routes)
 */
export function getAuthFromHeaders(req: NextRequest): Partial<AuthContext> {
  const userId = req.headers.get('x-auth-user-id')
  const role = req.headers.get('x-auth-role') as UserRole

  return {
    userId: userId ? parseInt(userId) : undefined,
    role
  }
}

/**
 * Session management functions
 */
export async function createUserSession(
  userId: number, 
  sessionToken: string,
  deviceInfo?: unknown,
  ipAddress?: string,
  userAgent?: string
) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

  return await prisma.userSession.create({
    data: {
      userId,
      sessionToken,
      deviceInfo: deviceInfo || undefined,
      ipAddress,
      userAgent,
      expiresAt
    }
  })
}



export async function revokeSession(sessionToken: string) {
  await prisma.userSession.update({
    where: { sessionToken },
    data: { isActive: false }
  })
}

export async function revokeAllUserSessions(userId: number) {
  await prisma.userSession.updateMany({
    where: { userId },
    data: { isActive: false }
  })
} 