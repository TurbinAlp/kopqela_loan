'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../../contexts/NotificationContext'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function ToastContainer() {
  const { toasts, removeToast } = useNotifications()

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircleIcon
      case 'error':
        return XCircleIcon
      case 'warning':
        return ExclamationTriangleIcon
      case 'info':
        return InformationCircleIcon
      default:
        return InformationCircleIcon
    }
  }

  const getToastColors = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-400',
          title: 'text-green-800',
          message: 'text-green-700',
          button: 'text-green-500 hover:text-green-600'
        }
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'text-red-500 hover:text-red-600'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'text-yellow-500 hover:text-yellow-600'
        }
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'text-blue-500 hover:text-blue-600'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-400',
          title: 'text-gray-800',
          message: 'text-gray-700',
          button: 'text-gray-500 hover:text-gray-600'
        }
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = getToastIcon(toast.type)
          const colors = getToastColors(toast.type)

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.3 }}
              transition={{ 
                type: 'spring',
                stiffness: 500,
                damping: 30
              }}
              className={`${colors.bg} ${colors.border} border rounded-lg shadow-lg p-4 max-w-sm`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <div className="ml-3 flex-1">
                  <p className={`text-sm font-semibold ${colors.title}`}>
                    {toast.title}
                  </p>
                  <p className={`mt-1 text-sm ${colors.message}`}>
                    {toast.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className={`inline-flex ${colors.button} transition-colors focus:outline-none`}
                    onClick={() => removeToast(toast.id)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Progress bar for auto-dismiss */}
              {!toast.persistent && toast.duration && (
                <motion.div
                  className={`mt-3 h-1 bg-gray-200 rounded-full overflow-hidden`}
                >
                  <motion.div
                    className={`h-full ${
                      toast.type === 'success' ? 'bg-green-400' :
                      toast.type === 'error' ? 'bg-red-400' :
                      toast.type === 'warning' ? 'bg-yellow-400' :
                      'bg-blue-400'
                    }`}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ 
                      duration: toast.duration / 1000,
                      ease: 'linear'
                    }}
                  />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
} 