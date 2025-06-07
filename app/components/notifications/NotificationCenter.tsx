'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications, PersistentNotification } from '../../contexts/NotificationContext'
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  ComputerDesktopIcon,
  UserIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid'

interface NotificationCenterProps {
  variant?: 'header' | 'sidebar'
}

export default function NotificationCenter({ variant = 'header' }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return ShoppingBagIcon
      case 'payment':
        return CreditCardIcon
      case 'stock':
        return ExclamationTriangleIcon
      case 'system':
        return ComputerDesktopIcon
      case 'user':
        return UserIcon
      default:
        return BellIcon
    }
  }

  const getNotificationColors = (type: string) => {
    switch (type) {
      case 'order':
        return 'text-blue-600 bg-blue-100'
      case 'payment':
        return 'text-green-600 bg-green-100'
      case 'stock':
        return 'text-orange-600 bg-orange-100'
      case 'system':
        return 'text-purple-600 bg-purple-100'
      case 'user':
        return 'text-indigo-600 bg-indigo-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const handleNotificationClick = (notification: PersistentNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          variant === 'header' 
            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="w-6 h-6" />
        ) : (
          <BellIcon className="w-6 h-6" />
        )}
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${
              variant === 'header' ? 'right-0' : 'left-full ml-2'
            } top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden`}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No notifications yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    We&apos;ll notify you when something happens
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type)
                    const colors = getNotificationColors(notification.type)

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colors} flex items-center justify-center`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-medium ${
                                  !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatTime(notification.createdAt)}
                                </p>
                              </div>

                              {/* Unread Indicator */}
                              {!notification.isRead && (
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 mt-3">
                              {notification.actionUrl && (
                                <Link
                                  href={notification.actionUrl}
                                  onClick={() => handleNotificationClick(notification)}
                                  className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center"
                                >
                                  <EyeIcon className="w-3 h-3 mr-1" />
                                  View
                                </Link>
                              )}
                              
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-gray-600 hover:text-gray-700 font-medium flex items-center"
                                >
                                  <CheckIcon className="w-3 h-3 mr-1" />
                                  Mark read
                                </button>
                              )}
                              
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center"
                              >
                                <TrashIcon className="w-3 h-3 mr-1" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={clearAllNotifications}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all
                  </button>
                  <Link
                    href="/admin/notifications"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}