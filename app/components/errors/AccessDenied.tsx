'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  ShieldExclamationIcon,
  HomeIcon,
  ArrowLeftIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface AccessDeniedProps {
  message?: string
  requiredRole?: string
  currentRole?: string
  variant?: 'full' | 'compact'
  showActions?: boolean
}

export default function AccessDenied({ 
  message, 
  requiredRole, 
  currentRole,
  variant = 'full',
  showActions = true 
}: AccessDeniedProps) {
  const { language } = useLanguage()

  const translations = {
    en: {
      title: "Access Denied",
      subtitle: "You don't have permission to access this page",
      defaultMessage: "Sorry, you don't have the necessary permissions to view this content.",
      whatToDo: "What you can do:",
      steps: [
        "Contact your administrator for access",
        "Check if you're logged in with the correct account",
        "Return to your dashboard",
        "Request elevated permissions if needed"
      ],
      goHome: "Go to Dashboard",
      goBack: "Go Back",
      contactAdmin: "Contact Administrator",
      login: "Login with Different Account",
      requiredRole: "Required Role",
      currentRole: "Your Role",
      insufficientPermissions: "Insufficient Permissions",
      roles: {
        admin: "Administrator", 
        manager: "Manager", 
        cashier: "Cashier",
        customer: "Customer",
        guest: "Guest"
      }
    },
    sw: {
      title: "Ufikiaji Umekatazwa",
      subtitle: "Huna ruhusa ya kufikia ukurasa huu",
      defaultMessage: "Samahani, huna ruhusa za muhimu za kuona maudhui haya.",
      whatToDo: "Unaweza kufanya nini:",
      steps: [
        "Wasiliana na msimamizi wako kwa ufikiaji",
        "Angalia ikiwa umeingia na akaunti sahihi",
        "Rudi kwenye dashibodi yako",
        "Omba ruhusa za juu ikiwa zinahitajika"
      ],
      goHome: "Rudi Dashibodi",
      goBack: "Rudi Nyuma",
      contactAdmin: "Wasiliana na Msimamizi",
      login: "Ingia na Akaunti Nyingine",
      requiredRole: "Jukumu Linalohitajika",
      currentRole: "Jukumu Lako",
      insufficientPermissions: "Ruhusa Zisizotosha",
      roles: {
        admin: "Msimamizi",
        manager: "Meneja",
        cashier: "Mwajiri",
        customer: "Mteja",
        guest: "Mgeni"
      }
    }
  }

  const t = translations[language]

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'cashier':
        return 'bg-green-100 text-green-800'
      case 'customer':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTranslatedRole = (role?: string) => {
    if (!role) return 'Unknown'
    return t.roles[role.toLowerCase() as keyof typeof t.roles] || role
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-orange-50 border border-orange-200 rounded-lg p-4"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <ShieldExclamationIcon className="w-5 h-5 text-orange-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-orange-800">{t.title}</p>
            <p className="text-sm text-orange-700 mt-1">
              {message || t.defaultMessage}
            </p>
          </div>
          {showActions && (
            <div className="ml-4">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <HomeIcon className="w-4 h-4 mr-1" />
                {t.goHome}
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 text-center">
        {/* Access Denied Icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <ShieldExclamationIcon className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900"
            >
              {t.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600"
            >
              {t.subtitle}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-500"
            >
              {message || t.defaultMessage}
            </motion.p>
          </div>
        </motion.div>

        {/* Role Information */}
        {(requiredRole || currentRole) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg p-6 shadow-md border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t.insufficientPermissions}
            </h3>
            <div className="space-y-3">
              {requiredRole && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.requiredRole}:</span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(requiredRole)}`}>
                    {getTranslatedRole(requiredRole)}
                  </span>
                </div>
              )}
              {currentRole && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.currentRole}:</span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(currentRole)}`}>
                    {getTranslatedRole(currentRole)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                {t.goHome}
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                {t.goBack}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                {t.login}
              </Link>
              
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <CogIcon className="w-4 h-4 mr-2" />
                {t.contactAdmin}
              </Link>
            </div>
          </motion.div>
        )}

        {/* What to do */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg p-6 shadow-md border border-gray-200 text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            {t.whatToDo}
          </h3>
          <ol className="space-y-2 text-sm text-gray-600">
            {t.steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="pt-6 text-center"
        >
          <p className="text-xs text-gray-400">
            Need access? Contact your system administrator for help.
          </p>
        </motion.div>
      </div>
    </div>
  )
}