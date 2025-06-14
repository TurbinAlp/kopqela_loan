import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

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

interface SessionUser {
  role: string
  id: number
  email: string
}

interface SessionData {
  user: SessionUser
}

/**
 * Helper function to check permission synchronously using session data
 */
export function hasPermissionSync(
  session: SessionData | null, 
  permission: string, 
  userPermissions: string[] = []
): boolean {
  if (!session?.user) return false

  // For now, we'll use role-based checking until we have real-time permissions
  const role = session.user.role

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
      'analytics.read', 'dashboard.read', 'audit_logs.read', 'settings.manage'
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
  const { data: session } = useSession()
  const userRole = session?.user?.role
  
  const hasRole = userRole && roles.includes(userRole)
  
  return hasRole ? children : fallback
} 