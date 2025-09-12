'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useBusiness } from '../../contexts/BusinessContext'
import { useBusinessPermissions, hasPermissionSync, hasCachedBusinessPermissions } from '../../hooks/usePermissions'
import { useLanguage } from '../../contexts/LanguageContext'
import { motion } from 'framer-motion'
import { 
  LockClosedIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline'

interface PermissionGateProps {
  children: React.ReactNode
  requiredPermission: string
  fallbackUrl?: string
  showAccessDenied?: boolean
  businessId?: number 
}

export default function PermissionGate({
  children,
  requiredPermission,
  fallbackUrl = '/admin/dashboard',
  showAccessDenied = true,
  businessId
}: PermissionGateProps) {
  const { data: session, status } = useSession()
  const { currentBusiness, isLoading } = useBusiness()
  // Use specific businessId if provided, otherwise use current business
  const targetBusinessId = businessId || currentBusiness?.id
  const { permissions: businessPermissions, loading: permissionsLoading, userRole: currentUserRole } = useBusinessPermissions(targetBusinessId)
  const { language } = useLanguage()
  const router = useRouter()

  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  const translations = {
    en: {
      accessDenied: "Access Denied",
      noPermission: "You don't have permission to access this page.",
      currentRole: "Your current role",
      requiredRole: "Required role",
      contactAdmin: "Please contact your administrator if you believe this is an error.",
      goBack: "Go Back to Dashboard",
      loading: "Checking permissions...",
      business: "Business Context",
      adminRole: "Admin",
      managerRole: "Manager", 
      cashierRole: "Cashier",
      adminOrManager: "Admin or Manager",
      explanation: "This page is only accessible to"
    },
    sw: {
      accessDenied: "Hauruhusiwi",
      noPermission: "Huna ruhusa ya kutumia ukurasa huu.",
      currentRole: "Jukumu lako la sasa",
      requiredRole: "Jukumu linaloitajika",
      contactAdmin: "Tafadhali wasiliana na msimamizi kama unadhani hii ni makosa.",
      goBack: "Rudi kwenye Dashboard",
      loading: "Inaangalia ruhusa...",
      business: "Mazingira ya Biashara",
      adminRole: "Msimamizi",
      managerRole: "Meneja",
      cashierRole: "Mhudumu",
      adminOrManager: "Msimamizi au Meneja",
      explanation: "Ukurasa huu unaweza kutumika na"
    }
  }

  const t = translations[language]

  const getRoleName = (role: string | null) => {
    if (!role) return t.cashierRole
    
    switch (role.toUpperCase()) {
      case 'ADMIN': return t.adminRole
      case 'MANAGER': return t.managerRole
      case 'CASHIER': return t.cashierRole
      default: return role
    }
  }

  const getRequiredRoles = (permission: string): string => {
    const permissionRoleMap: { [key: string]: string[] } = {
       // Admin only
       'users.create': ['ADMIN'],
       'users.update': ['ADMIN'],
       'users.delete': ['ADMIN'],
       'settings.manage': ['ADMIN'],
       'audit_logs.read': ['ADMIN'],
       'business_settings.manage': ['ADMIN'],
       'business.update': ['ADMIN'],
       'business.delete': ['ADMIN'],
       
       // Admin or Manager
       'users.read': ['ADMIN', 'MANAGER'],
       'employees.manage': ['ADMIN', 'MANAGER'],
      'products.create': ['ADMIN', 'MANAGER'],
      'products.update': ['ADMIN', 'MANAGER'],
      'products.delete': ['ADMIN', 'MANAGER'],
      'categories.manage': ['ADMIN', 'MANAGER'],
      'inventory.read': ['ADMIN', 'MANAGER'],
      'inventory.update': ['ADMIN', 'MANAGER'],
      'sales.read': ['ADMIN', 'MANAGER'],
      'sales.export': ['ADMIN', 'MANAGER'],
      'reports.read': ['ADMIN', 'MANAGER'],
      'reports.export': ['ADMIN', 'MANAGER'],
      'analytics.read': ['ADMIN', 'MANAGER'],
      'credit_applications.approve': ['ADMIN', 'MANAGER'],
      'credit_applications.reject': ['ADMIN', 'MANAGER'],
      'credit_assessment.assess_credit': ['ADMIN', 'MANAGER'],
      
       // All roles (Admin, Manager, Cashier)
       'business.create': ['ADMIN', 'MANAGER', 'CASHIER'],
       'business.read': ['ADMIN', 'MANAGER', 'CASHIER'],
       'dashboard.read': ['ADMIN', 'MANAGER', 'CASHIER'],
       'products.read': ['ADMIN', 'MANAGER', 'CASHIER'],
       'customers.read': ['ADMIN', 'MANAGER', 'CASHIER'],
       'pos.create': ['ADMIN', 'MANAGER', 'CASHIER'],
       'pos.read': ['ADMIN', 'MANAGER', 'CASHIER'],
       'payments.create': ['ADMIN', 'MANAGER', 'CASHIER'],
       'payments.read': ['ADMIN', 'MANAGER', 'CASHIER'],
       'payments.process_payment': ['ADMIN', 'MANAGER', 'CASHIER'],
       'credit_applications.read': ['ADMIN', 'MANAGER', 'CASHIER'],
       'credit_applications.create': ['ADMIN', 'MANAGER', 'CASHIER']
    }

    const requiredRoles = permissionRoleMap[permission] || ['ADMIN']
    
    if (requiredRoles.includes('ADMIN') && requiredRoles.includes('MANAGER') && requiredRoles.includes('CASHIER')) {
      return `${t.adminRole}, ${t.managerRole}, ${t.cashierRole}`
    } else if (requiredRoles.includes('ADMIN') && requiredRoles.includes('MANAGER')) {
      return t.adminOrManager
    } else if (requiredRoles.includes('ADMIN')) {
      return t.adminRole
    } else {
      return requiredRoles.map(role => getRoleName(role)).join(', ')
    }
  }

  useEffect(() => {
    // Only run when necessary dependencies change
    if (status === 'loading') {
      setHasAccess(null)
      return
    }

    if (status === 'unauthenticated') {
      router.replace('/login')
      return
    }

    // If authenticated but business context is still loading, don't decide yet
    if (status === 'authenticated' && session && !targetBusinessId) {
      if (isLoading) {
        setHasAccess(null)
        return
      }
      // No business selected/available; keep null to avoid flicker
      setHasAccess(null)
      return
    }

    if (status === 'authenticated' && session && targetBusinessId) {
      // Check permissions synchronously if available
      if (businessPermissions.length > 0 && !permissionsLoading) {
        const access = hasPermissionSync(session, requiredPermission, businessPermissions)
        setHasAccess(access)

        // Redirect immediately if no access and not showing denied page
        if (!access && !showAccessDenied) {
          router.replace(fallbackUrl)
        }
      } else if (!permissionsLoading && businessPermissions.length === 0) {
        // No permissions available, deny access
        setHasAccess(false)
        if (!showAccessDenied) {
          router.replace(fallbackUrl)
        }
      }
      // If permissionsLoading is true, hasAccess remains null and loading shows
    }
  }, [status, session, targetBusinessId, businessPermissions, permissionsLoading, requiredPermission, router, fallbackUrl, showAccessDenied, isLoading])

  // Show loading while checking authentication or permissions
  // Only show loading if we truly need to wait for permissions
  const shouldShowLoading =
    status === 'loading' ||
    (status === 'authenticated' && session && (
      // Still loading business context
      isLoading ||
      // Or loading permissions for the selected business
      (targetBusinessId && permissionsLoading && hasAccess === null &&
        !hasCachedBusinessPermissions(String(session.user.id), targetBusinessId))
    ))

  if (shouldShowLoading) {
    // Global loader in layout handles the visual loading; avoid local loaders to prevent UX flicker
    return null
  }

  if (hasAccess === false && showAccessDenied) {
    return (
      <div className="max-w-screen-full mx-auto flex items-center justify-center bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-4"
        >
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <LockClosedIcon className="h-8 w-8 text-red-600" />
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.accessDenied}</h2>
            <p className="text-gray-600 mb-6">{t.noPermission}</p>

            {/* Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.business}:</span>
                  <span className="font-medium text-gray-900">{currentBusiness?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.currentRole}:</span>
                  <span className="font-medium text-red-600">{getRoleName(currentUserRole)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.requiredRole}:</span>
                  <span className="font-medium text-green-600">{getRequiredRoles(requiredPermission)}</span>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>{t.explanation}</strong> {getRequiredRoles(requiredPermission)}.
              </p>
            </div>

            <p className="text-sm text-gray-500 mb-6">{t.contactAdmin}</p>

            {/* Actions */}
            <button
              onClick={() => router.push(fallbackUrl)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2 text-white" />
              <span className="text-white">{t.goBack}</span>
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // If user has permission, render children
  if (hasAccess) {
    return <>{children}</>
  }

  // Fallback (should not reach here)
  return null
}
