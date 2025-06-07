'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  persistent?: boolean
  createdAt: Date
}

export interface PersistentNotification {
  id: string
  type: 'system' | 'order' | 'payment' | 'stock' | 'user'
  title: string
  message: string
  createdAt: Date
  isRead: boolean
  actionUrl?: string
  metadata?: {
    orderId?: string
    customerId?: string
    productId?: string
    amount?: number
  }
}

interface NotificationContextType {
  // Toast Notifications
  toasts: ToastNotification[]
  showToast: (notification: Omit<ToastNotification, 'id' | 'createdAt'>) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
  
  // Persistent Notifications
  notifications: PersistentNotification[]
  unreadCount: number
  addNotification: (notification: Omit<PersistentNotification, 'id' | 'createdAt' | 'isRead'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  
  // Quick notification methods
  showSuccess: (title: string, message: string) => void
  showError: (title: string, message: string) => void
  showWarning: (title: string, message: string) => void
  showInfo: (title: string, message: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const [notifications, setNotifications] = useState<PersistentNotification[]>([])

  // Generate unique ID
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }, [])

  // Toast notification methods
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((notification: Omit<ToastNotification, 'id' | 'createdAt'>) => {
    const newToast: ToastNotification = {
      ...notification,
      id: generateId(),
      createdAt: new Date(),
      duration: notification.duration || 5000
    }
    
    setToasts(prev => [...prev, newToast])

    // Auto remove toast after duration (unless persistent)
    if (!notification.persistent) {
      setTimeout(() => {
        removeToast(newToast.id)
      }, newToast.duration)
    }
  }, [generateId, removeToast])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Persistent notification methods
  const addNotification = useCallback((notification: Omit<PersistentNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: PersistentNotification = {
      ...notification,
      id: generateId(),
      createdAt: new Date(),
      isRead: false
    }
    
    setNotifications(prev => [newNotification, ...prev])
  }, [generateId])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    )
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Quick notification methods
  const showSuccess = useCallback((title: string, message: string) => {
    showToast({ type: 'success', title, message })
  }, [showToast])

  const showError = useCallback((title: string, message: string) => {
    showToast({ type: 'error', title, message, duration: 7000 })
  }, [showToast])

  const showWarning = useCallback((title: string, message: string) => {
    showToast({ type: 'warning', title, message, duration: 6000 })
  }, [showToast])

  const showInfo = useCallback((title: string, message: string) => {
    showToast({ type: 'info', title, message })
  }, [showToast])

  // Calculate unread count
  const unreadCount = notifications.filter(notif => !notif.isRead).length

  // Load sample notifications on mount (simulate real data)
  useEffect(() => {
    const sampleNotifications: Omit<PersistentNotification, 'id' | 'createdAt' | 'isRead'>[] = [
      {
        type: 'order',
        title: 'New Order Received',
        message: 'Order #ORD-2024-001 has been placed by John Doe for TZS 1,480,000',
        actionUrl: '/admin/sales',
        metadata: { orderId: 'ORD-2024-001', customerId: '1', amount: 1480000 }
      },
      {
        type: 'stock',
        title: 'Low Stock Alert',
        message: 'iPhone 15 Pro is running low on stock. Only 3 units remaining.',
        actionUrl: '/admin/products',
        metadata: { productId: '1' }
      },
      {
        type: 'payment',
        title: 'Payment Received',
        message: 'Payment of TZS 750,000 received for Order #ORD-2024-002',
        actionUrl: '/admin/payments',
        metadata: { orderId: 'ORD-2024-002', amount: 750000 }
      },
      {
        type: 'system',
        title: 'System Update',
        message: 'System maintenance completed successfully. All features are now available.',
        actionUrl: '/admin/dashboard'
      },
      {
        type: 'user',
        title: 'New User Registration',
        message: 'Sarah Johnson has registered as a new customer.',
        actionUrl: '/admin/customers',
        metadata: { customerId: '5' }
      }
    ]

    // Add sample notifications with delay
    const timeouts = sampleNotifications.map((notif, index) => 
      setTimeout(() => addNotification(notif), index * 1000)
    )

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [addNotification])

  const value: NotificationContextType = {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
} 