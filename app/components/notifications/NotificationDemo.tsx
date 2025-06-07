'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useNotifications } from '../../contexts/NotificationContext'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  ExclamationTriangleIcon as WarningIcon,
  ComputerDesktopIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function NotificationDemo() {
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo, 
    addNotification,
    clearAllToasts,
    clearAllNotifications,
    notifications,
    toasts
  } = useNotifications()
  const { language } = useLanguage()

  const translations = {
    en: {
      title: "Notification System Demo",
      subtitle: "Test all notification features",
      
      // Toast Section
      toastTitle: "Toast Notifications",
      toastDesc: "Temporary notifications that auto-dismiss",
      successToast: "Success Toast",
      errorToast: "Error Toast", 
      warningToast: "Warning Toast",
      infoToast: "Info Toast",
      clearToasts: "Clear All Toasts",
      
      // Persistent Section
      persistentTitle: "Persistent Notifications",
      persistentDesc: "Notifications that stay in notification center",
      addOrder: "Add Order Notification",
      addPayment: "Add Payment Notification",
      addStock: "Add Stock Alert",
      addSystem: "Add System Notification",
      addUser: "Add User Notification",
      clearNotifications: "Clear All Notifications",
      
      // Status
      status: "Current Status",
      activeToasts: "Active Toasts",
      totalNotifications: "Total Notifications",
      unreadCount: "Unread Count",
      
      // Sample messages
      successMsg: "Operation completed successfully!",
      errorMsg: "An error occurred while processing your request.",
      warningMsg: "Please check your input before proceeding.",
      infoMsg: "New feature available - check it out!",
      
      orderMsg: "New order #ORD-{id} received from {customer} for TZS {amount:,}",
      paymentMsg: "Payment of TZS {amount:,} received for order #ORD-{id}",
      stockMsg: "{product} is running low on stock. Only {count} units remaining.",
      systemMsg: "System maintenance scheduled for tonight at 2:00 AM",
      userMsg: "New customer {name} has registered and completed profile verification"
    },
    sw: {
      title: "Jaribio la Mfumo wa Arifa",
      subtitle: "Jaribu vipengele vyote vya arifa",
      
      // Toast Section
      toastTitle: "Arifa za Muda Mfupi",
      toastDesc: "Arifa za muda ambazo zinazima kiotomatiki",
      successToast: "Arifa ya Mafanikio",
      errorToast: "Arifa ya Kosa",
      warningToast: "Arifa ya Onyo",
      infoToast: "Arifa ya Habari",
      clearToasts: "Futa Arifa Zote za Muda",
      
      // Persistent Section
      persistentTitle: "Arifa za Kudumu",
      persistentDesc: "Arifa zinazobaki katika kituo cha arifa",
      addOrder: "Ongeza Arifa ya Agizo",
      addPayment: "Ongeza Arifa ya Malipo",
      addStock: "Ongeza Tahadhari ya Hisa",
      addSystem: "Ongeza Arifa ya Mfumo",
      addUser: "Ongeza Arifa ya Mtumiaji",
      clearNotifications: "Futa Arifa Zote",
      
      // Status
      status: "Hali ya Sasa",
      activeToasts: "Arifa za Muda Zinazofanya Kazi",
      totalNotifications: "Jumla ya Arifa",
      unreadCount: "Idadi ya Zisizosomwa",
      
      // Sample messages
      successMsg: "Uendeshaji umekamilika kwa mafanikio!",
      errorMsg: "Kosa limetokea wakati wa kuchakata ombi lako.",
      warningMsg: "Tafadhali angalia uingizaji wako kabla ya kuendelea.",
      infoMsg: "Kipengele kipya kinapatikana - kiangalie!",
      
      orderMsg: "Agizo jipya #ORD-{id} limepokewa kutoka {customer} kwa TSh {amount:,}",
      paymentMsg: "Malipo ya TSh {amount:,} yamepokewa kwa agizo #ORD-{id}",
      stockMsg: "{product} hisa zinakaribia kuisha. Zinabakia vitengo {count} tu.",
      systemMsg: "Matengenezo ya mfumo yamepangwa usiku wa leo saa 2:00 asubuhi",
      userMsg: "Mteja mpya {name} amesajiliwa na kukamilisha uthibitisho wa profaili"
    }
  }

  const t = translations[language]

  const generateRandomData = () => {
    const customers = ['John Doe', 'Mary Smith', 'Peter Johnson', 'Sarah Wilson', 'David Brown']
    const products = ['iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Pro', 'Dell Laptop', 'HP Printer']
    const orderIds = ['2024001', '2024002', '2024003', '2024004', '2024005']
    
    return {
      customer: customers[Math.floor(Math.random() * customers.length)],
      product: products[Math.floor(Math.random() * products.length)],
      orderId: orderIds[Math.floor(Math.random() * orderIds.length)],
      amount: Math.floor(Math.random() * 2000000) + 500000,
      count: Math.floor(Math.random() * 10) + 1,
      name: customers[Math.floor(Math.random() * customers.length)]
    }
  }

  const handleToastDemo = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: t.successMsg,
      error: t.errorMsg,
      warning: t.warningMsg,
      info: t.infoMsg
    }

    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning', 
      info: 'Information'
    }

    switch (type) {
      case 'success':
        showSuccess(titles.success, messages.success)
        break
      case 'error':
        showError(titles.error, messages.error)
        break
      case 'warning':
        showWarning(titles.warning, messages.warning)
        break
      case 'info':
        showInfo(titles.info, messages.info)
        break
    }
  }

  const handlePersistentDemo = (type: 'order' | 'payment' | 'stock' | 'system' | 'user') => {
    const data = generateRandomData()
    
    const notifications = {
      order: {
        type: 'order' as const,
        title: 'New Order Received',
        message: t.orderMsg
          .replace('{id}', data.orderId)
          .replace('{customer}', data.customer)
          .replace('{amount:,}', data.amount.toLocaleString()),
        actionUrl: '/admin/sales',
        metadata: { orderId: `ORD-${data.orderId}`, customerId: '1', amount: data.amount }
      },
      payment: {
        type: 'payment' as const,
        title: 'Payment Received',
        message: t.paymentMsg
          .replace('{amount:,}', data.amount.toLocaleString())
          .replace('{id}', data.orderId),
        actionUrl: '/admin/payments',
        metadata: { orderId: `ORD-${data.orderId}`, amount: data.amount }
      },
      stock: {
        type: 'stock' as const,
        title: 'Low Stock Alert',
        message: t.stockMsg
          .replace('{product}', data.product)
          .replace('{count}', data.count.toString()),
        actionUrl: '/admin/products',
        metadata: { productId: '1' }
      },
      system: {
        type: 'system' as const,
        title: 'System Notification',
        message: t.systemMsg,
        actionUrl: '/admin/dashboard'
      },
      user: {
        type: 'user' as const,
        title: 'New User Registration',
        message: t.userMsg.replace('{name}', data.name),
        actionUrl: '/admin/customers',
        metadata: { customerId: '5' }
      }
    }

    addNotification(notifications[type])
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.status}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t.activeToasts}:</span>
              <span className="font-medium text-blue-600">{toasts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t.totalNotifications}:</span>
              <span className="font-medium text-green-600">{notifications.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t.unreadCount}:</span>
              <span className="font-medium text-red-600">
                {notifications.filter(n => !n.isRead).length}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast Notifications Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t.toastTitle}</h2>
          <p className="text-gray-600">{t.toastDesc}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToastDemo('success')}
            className="flex items-center justify-center space-x-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100"
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{t.successToast}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToastDemo('error')}
            className="flex items-center justify-center space-x-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100"
          >
            <XCircleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{t.errorToast}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToastDemo('warning')}
            className="flex items-center justify-center space-x-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200 hover:bg-yellow-100"
          >
            <WarningIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{t.warningToast}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToastDemo('info')}
            className="flex items-center justify-center space-x-2 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100"
          >
            <InformationCircleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{t.infoToast}</span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={clearAllToasts}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-200 text-sm font-medium"
        >
          {t.clearToasts}
        </motion.button>
      </div>

      {/* Persistent Notifications Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t.persistentTitle}</h2>
          <p className="text-gray-600">{t.persistentDesc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePersistentDemo('order')}
            className="flex items-center justify-center space-x-2 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100"
          >
            <ShoppingBagIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{t.addOrder}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePersistentDemo('payment')}
            className="flex items-center justify-center space-x-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100"
          >
            <CreditCardIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{t.addPayment}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePersistentDemo('stock')}
            className="flex items-center justify-center space-x-2 p-3 bg-orange-50 text-orange-700 rounded-lg border border-orange-200 hover:bg-orange-100"
          >
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{t.addStock}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePersistentDemo('system')}
            className="flex items-center justify-center space-x-2 p-3 bg-purple-50 text-purple-700 rounded-lg border border-purple-200 hover:bg-purple-100"
          >
            <ComputerDesktopIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{t.addSystem}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePersistentDemo('user')}
            className="flex items-center justify-center space-x-2 p-3 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100"
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{t.addUser}</span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={clearAllNotifications}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-200 text-sm font-medium"
        >
          {t.clearNotifications}
        </motion.button>
      </div>
    </div>
  )
}