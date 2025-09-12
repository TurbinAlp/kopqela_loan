import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'

interface Permission {
  id: number
  name: string
  resource: string
  action: string
  description?: string
}

interface UserPermissions {
  rolePermissions: Permission[]
  userPermissions: Permission[]
  allPermissions: string[]
  loading: boolean
  error: string | null
}

interface PermissionCheckResult {
  hasPermission: boolean
  loading: boolean
  error: string | null
}

/**
 * Hook to get current user's permissions
 */
export function usePermissions(): UserPermissions {
  const { data: session } = useSession()
  const [permissions, setPermissions] = useState<UserPermissions>({
    rolePermissions: [],
    userPermissions: [],
    allPermissions: [],
    loading: true,
    error: null
  })

  useEffect(() => {
    if (!session?.user) {
      setPermissions(prev => ({ ...prev, loading: false }))
      return
    }

    fetchPermissions()
  }, [session])

  const fetchPermissions = async () => {
    try {
      setPermissions(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/rbac/permissions')
      
      if (!response.ok) {
        throw new Error('Failed to fetch permissions')
      }

      const result = await response.json()
      
      if (result.success) {
        setPermissions({
          rolePermissions: result.data.rolePermissions,
          userPermissions: result.data.userPermissions,
          allPermissions: result.data.allPermissions,
          loading: false,
          error: null
        })
      } else {
        throw new Error(result.error || 'Failed to fetch permissions')
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      setPermissions(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }

  return permissions
}

/**
 * Hook to check if user has a specific permission
 */
export function usePermissionCheck(permission: string, businessId?: number): PermissionCheckResult {
  const { data: session } = useSession()
  const [result, setResult] = useState<PermissionCheckResult>({
    hasPermission: false,
    loading: true,
    error: null
  })

  const checkPermission = useCallback(async () => {
    try {
      setResult(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/rbac/permissions/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permission, businessId })
      })

      if (!response.ok) {
        throw new Error('Failed to check permission')
      }

      const responseData = await response.json()
      
      if (responseData.success) {
        setResult({
          hasPermission: responseData.data.hasPermission,
          loading: false,
          error: null
        })
      } else {
        throw new Error(responseData.error || 'Failed to check permission')
      }
    } catch (error) {
      console.error('Error checking permission:', error)
      setResult({
        hasPermission: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [permission, businessId])

  useEffect(() => {
    if (!session?.user || !permission) {
      setResult({ hasPermission: false, loading: false, error: null })
      return
    }

    checkPermission()
  }, [session, permission, businessId, checkPermission])

  return result
}

// Cache for business permissions to avoid duplicate API calls
const businessPermissionsCache = new Map<string, {
  permissions: string[]
  userRole: string | null
  businessType: string | null
  timestamp: number
}>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Function to clear business permissions cache
export function clearBusinessPermissionsCache(userId?: string, businessId?: number) {
  if (userId && businessId) {
    // Clear specific cache entry
    const cacheKey = `${userId}-${businessId}`
    businessPermissionsCache.delete(cacheKey)
  } else if (userId) {
    // Clear all cache entries for a specific user
    for (const [key] of businessPermissionsCache) {
      if (key.startsWith(`${userId}-`)) {
        businessPermissionsCache.delete(key)
      }
    }
  } else {
    // Clear all cache
    businessPermissionsCache.clear()
  }
}

/**
 * Hook to get business-specific permissions for current user
 */
export function useBusinessPermissions(businessId?: number) {
  const { data: session } = useSession()

  const [permissions, setPermissions] = useState<{
    permissions: string[]
    userRole: string | null
    businessType: string | null
    loading: boolean
    error: string | null
  }>({
    permissions: [],
    userRole: null,
    businessType: null,
    loading: true,
    error: null
  })

  const fetchBusinessPermissions = useCallback(async () => {
    if (!session?.user || !businessId) {
      setPermissions({
        permissions: [],
        userRole: null,
        businessType: null,
        loading: false,
        error: null
      })
      return
    }

    const cacheKey = `${session.user.id}-${businessId}`
    const cached = businessPermissionsCache.get(cacheKey)

    // Use cached data if it's still fresh
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      setPermissions({
        permissions: cached.permissions,
        userRole: cached.userRole,
        businessType: cached.businessType,
        loading: false,
        error: null
      })
      return
    }

    try {
      setPermissions(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch(`/api/rbac/permissions/business?businessId=${businessId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch business permissions')
      }

      const result = await response.json()

      if (result.success) {
        const newData = {
          permissions: result.data.permissions,
          userRole: result.data.userRole,
          businessType: result.data.businessType || null,
          loading: false,
          error: null
        }

        // Cache the result
        businessPermissionsCache.set(cacheKey, {
          permissions: result.data.permissions,
          userRole: result.data.userRole,
          businessType: result.data.businessType || null,
          timestamp: Date.now()
        })

        setPermissions(newData)
      } else {
        throw new Error(result.error || 'Failed to fetch permissions')
      }
    } catch (error) {
      console.error('Error fetching business permissions:', error)
      setPermissions({
        permissions: [],
        userRole: null,
        businessType: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [session, businessId])

  // Effect to update state when session or businessId changes
  useEffect(() => {
    const getCurrentState = () => {
      if (!session?.user || !businessId) {
        return {
          permissions: [],
          userRole: null,
          businessType: null,
          loading: false,
          error: null
        }
      }

      const cacheKey = `${session.user.id}-${businessId}`
      const cached = businessPermissionsCache.get(cacheKey)

      // Use cached data if it's still fresh
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return {
          permissions: cached.permissions,
          userRole: cached.userRole,
          businessType: cached.businessType,
          loading: false,
          error: null
        }
      }

      return {
        permissions: [],
        userRole: null,
        businessType: null,
        loading: true,
        error: null
      }
    }

    const currentState = getCurrentState()
    setPermissions(currentState)

    // Only fetch if we don't have cached data
    if (currentState.loading) {
      fetchBusinessPermissions()
    }
  }, [session?.user?.id, session?.user, businessId, fetchBusinessPermissions])

  return permissions
}

/**
 * Helper function to check if business permissions are cached
 */
export function hasCachedBusinessPermissions(userId: string, businessId: number): boolean {
  const cacheKey = `${userId}-${businessId}`
  const cached = businessPermissionsCache.get(cacheKey)
  return Boolean(cached && (Date.now() - cached.timestamp) < CACHE_DURATION)
}

/**
 * Hook to check multiple permissions at once
 */
export function useMultiplePermissionCheck(permissions: string[]) {
  const { allPermissions } = usePermissions()
  
  const checkPermissions = (permissionList: string[]) => {
    return permissionList.map(permission => ({
      permission,
      hasPermission: allPermissions.includes(permission)
    }))
  }

  const hasAllPermissions = (permissionList: string[]) => {
    return permissionList.every(permission => allPermissions.includes(permission))
  }

  const hasAnyPermission = (permissionList: string[]) => {
    return permissionList.some(permission => allPermissions.includes(permission))
  }

  return {
    checkPermissions: () => checkPermissions(permissions),
    hasAllPermissions: () => hasAllPermissions(permissions),
    hasAnyPermission: () => hasAnyPermission(permissions),
    allPermissions
  }
}



/**
 * Helper function to check permission synchronously using session data
 */
export function hasPermissionSync(
  session: Session | null, 
  permission: string, 
  businessPermissions: string[] = [],
  userPermissions: string[] = []
): boolean {
  if (!session?.user) return false

  // If business permissions are provided, use them (business-specific)
  if (businessPermissions.length > 0) {
    const allPermissions = [...businessPermissions, ...userPermissions]
    return allPermissions.includes(permission)
  }

  // Use permissions directly from session if available (all businesses combined)
  const sessionPermissions = session.user.permissions || []
  if (sessionPermissions.length > 0) {
    const allUserPermissions = [...sessionPermissions, ...userPermissions]
    return allUserPermissions.includes(permission)
  }

  // Fallback to role-based checking if permissions not loaded
  const role = 'ADMIN' 

  // Basic role-based permission mapping
  const rolePermissions = {
    ADMIN: [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'employees.manage', 'customers.read', 'customers.update',
      'business.read', 'business.update', 'business_settings.manage',
      'products.create', 'products.read', 'products.update', 'products.delete',
      'categories.manage', 'inventory.read', 'inventory.update',
      'orders.create', 'orders.read', 'orders.update', 'orders.delete',
      'sales.read', 'sales.export', 'pos.create', 'pos.read',
      'payments.create', 'payments.read', 'payments.process_payment', 'payments.refund',
      'credit_applications.read', 'credit_applications.create', 'credit_applications.approve', 'credit_applications.reject',
      'credit_assessment.assess_credit', 'reports.read', 'reports.export',
      'analytics.read', 'dashboard.read', 'dashboard.admin_view', 'audit_logs.read', 'settings.manage'
    ],
    MANAGER: [
      'users.read', 'employees.manage', 'customers.read', 'customers.update',
      'business.read', 'products.create', 'products.read', 'products.update',
      'categories.manage', 'inventory.read', 'inventory.update',
      'orders.create', 'orders.read', 'orders.update',
      'sales.read', 'sales.export', 'pos.create', 'pos.read',
      'payments.create', 'payments.read', 'payments.process_payment',
      'credit_applications.read', 'credit_applications.approve', 'credit_applications.reject',
      'credit_assessment.assess_credit', 'reports.read', 'reports.export',
      'analytics.read', 'dashboard.read'
    ],
    CASHIER: [
      'customers.read', 'products.read', 'inventory.read',
      'orders.create', 'orders.read', 'orders.update',
      'sales.read', 'pos.create', 'pos.read',
      'payments.create', 'payments.read', 'payments.process_payment',
      'credit_applications.create', 'credit_applications.read',
      'dashboard.read'
    ],
    CUSTOMER: [
      'orders.read', 'payments.read',
      'credit_applications.create', 'credit_applications.read'
    ]
  }

  const rolePerms = rolePermissions[role as keyof typeof rolePermissions] || []
  return rolePerms.includes(permission) || userPermissions.includes(permission)
}

/**
 * Component wrapper for conditional rendering based on permissions
 */
export function WithPermission({ 
  permission, 
  children, 
  fallback = null,
  businessId 
}: {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
  businessId?: number
}) {
  const { hasPermission } = usePermissionCheck(permission, businessId)
  
  return hasPermission ? children : fallback
}

/**
 * Component wrapper for conditional rendering based on role
 */
export function WithRole({ 
  roles, 
  children, 
  fallback = null 
}: {
  roles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  // For now, we'll use CASHIER as default since we don't have role in session
  const userRole = 'CASHIER'
  
  const hasRole = userRole && roles.includes(userRole)
  
  return hasRole ? children : fallback
} 