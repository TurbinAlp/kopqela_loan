'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline'

interface ErrorMessageProps {
  message?: string
  type?: 'error' | 'warning' | 'info'
  show?: boolean
  icon?: boolean
  className?: string
  onDismiss?: () => void
}

export default function ErrorMessage({ 
  message, 
  type = 'error', 
  show = true, 
  icon = true,
  className = '',
  onDismiss 
}: ErrorMessageProps) {
  if (!message || !show) {
    return null
  }

  const getIcon = () => {
    switch (type) {
      case 'error':
        return XCircleIcon
      case 'warning':
        return ExclamationTriangleIcon
      case 'info':
        return InformationCircleIcon
      default:
        return ExclamationCircleIcon
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-400'
      case 'warning':
        return 'text-yellow-400'
      case 'info':
        return 'text-blue-400'
      default:
        return 'text-red-400'
    }
  }

  const Icon = getIcon()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.2 }}
        className={`border rounded-lg p-3 ${getStyles()} ${className}`}
      >
        <div className="flex items-start">
          {icon && (
            <div className="flex-shrink-0">
              <Icon className={`w-5 h-5 ${getIconColor()}`} />
            </div>
          )}
          <div className={`${icon ? 'ml-3' : ''} flex-1`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
          {onDismiss && (
            <div className="ml-auto">
              <button
                onClick={onDismiss}
                className={`inline-flex ${getIconColor()} hover:${getIconColor().replace('400', '600')} transition-colors duration-200`}
              >
                <span className="sr-only">Dismiss</span>
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Field Error Component for forms
export function FieldError({ 
  error, 
  show = true 
}: { 
  error?: string; 
  show?: boolean 
}) {
  if (!error || !show) {
    return null
  }

  return (
    <motion.p
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="mt-1 text-sm text-red-600"
    >
      {error}
    </motion.p>
  )
}

// Multiple Errors Component
export function ErrorList({ 
  errors, 
  title = "Please fix the following errors:",
  show = true 
}: { 
  errors: string[]; 
  title?: string;
  show?: boolean 
}) {
  if (!errors.length || !show) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-200 rounded-lg p-4"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="w-5 h-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 