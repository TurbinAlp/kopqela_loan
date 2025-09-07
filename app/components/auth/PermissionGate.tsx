'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useBusiness } from '../../contexts/BusinessContext'
import { useBusinessPermissions, hasPermissionSync } from '../../hooks/usePermissions'
import { useLanguage } from '../../contexts/LanguageContext'
import { motion } from 'framer-motion'
import { 
  LockClosedIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline'
import Spinner from '../ui/Spinner'

interface PermissionGateProps {
  children: React.ReactNode
  requiredPermission: string
  fallbackUrl?: string
  showAccessDenied?: boolean
}

export default function PermissionGate({ 
  children, 
  requiredPermission, 
  fallbackUrl = '/admin/dashboard',
  showAccessDenied = true 
}: PermissionGateProps) {
  const { data: session, status } = useSession()
  const { currentBusiness } = useBusiness()
  const { permissions: businessPermissions, loading: permissionsLoading } = useBusinessPermissions(currentBusiness?.id)
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
      adminOrManager: "those with specific roles",
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
      adminOrManager: "wale wenye ruhusa husika",
      explanation: "Ukurasa huu unaweza kutumika na"
    }
  }

  const t = translations[language]

  const { userRole: currentUserRole } = useBusinessPermissions(currentBusiness?.id)

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
      
      // Admin or Manager
      'users.read': ['ADMIN', 'MANAGER'],
      'employees.manage': ['ADMIN', 'MANAGER'],
      'business.read': ['ADMIN', 'MANAGER'],
      'business.update': ['ADMIN', 'MANAGER'],
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
    if (status === 'loading' || permissionsLoading) {
      return // Still loading
    }

    if (status === 'unauthenticated') {
      router.replace('/login')
      return
    }

    if (status === 'authenticated' && session && !permissionsLoading) {
      // Check if user has the required permission
      const access = hasPermissionSync(session, requiredPermission, businessPermissions)
      setHasAccess(access)

      // If no access and not showing access denied page, redirect
      if (!access && !showAccessDenied) {
        router.replace(fallbackUrl)
      }
    }
  }, [status, session, businessPermissions, permissionsLoading, requiredPermission, router, fallbackUrl, showAccessDenied])

  // Show loading while checking authentication or permissions
  if (status === 'loading' || permissionsLoading || hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (!hasAccess && showAccessDenied) {
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
