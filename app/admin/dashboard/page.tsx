'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArchiveBoxXMarkIcon,
  XMarkIcon,
  BellIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  CreditCardIcon,
  BanknotesIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'

// TODO: Create useAuth hook for role management
const useAuth = () => {
  // This should be implemented with actual authentication
  // For now, returning mock data
  // 
  // IMPORTANT: ADMIN sees EVERYTHING in the system
  // - All admin dashboard components
  // - All cashier dashboard components  
  // - All quick actions (POS, Customer Lookup, Payment Collection, etc.)
  // - All navigation items
  // - All data views and analytics
  // 
  // Other roles will have restricted access defined later
  return {
    userRole: 'admin' // This will be dynamic based on logged-in user
    // Future: 'cashier', 'manager', etc. with specific permissions
  }
}

export default function BusinessDashboard() {
  const { language } = useLanguage()
  const { userRole } = useAuth()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const translations = {
    en: {
      welcome: "Welcome back",
      adminName: "John Admin",
      cashierName: "Mary Cashier",
      businessSummary: "Here's what's happening with your business today.",
      todaySummary: "Here's your sales summary for today.",
      
      // Admin Dashboard Stats
      totalSales: "Total Sales",
      pendingCreditApps: "Pending Credit Apps",
      lowStock: "Low Stock Items",
      outstandingDebt: "Outstanding Debt",
      
      // Cashier Dashboard Stats
      todaysSales: "Today's Sales",
      salesCount: "Sales Count",
      cashPayments: "Cash Payments",
      creditSales: "Credit Sales",
      pendingPayments: "Pending Payments",
      
      // Quick Actions (Cashier)
      newSale: "New Sale",
      customerLookup: "Customer Lookup",
      productSearch: "Product Search",
      collectPayment: "Collect Payment",
      
      // Charts
      salesTrend: "Sales Trend",
      paymentMethods: "Payment Methods",
      
      // Recent Activity
      recentOrders: "Recent Orders",
      recentTransactions: "Recent Transactions",
      systemNotifications: "System Notifications",
      viewAll: "View All",
      
      // Status values
      completed: "Completed",
      pending: "Pending",
      processing: "Processing",
      
      // Notifications
      lowStockAlert: "Low stock alert for Product XYZ",
      newCreditApp: "New credit application received",
      paymentOverdue: "Payment overdue reminder",
      systemUpdate: "System update completed",
      
      // Time periods
      thisWeek: "This Week",
      thisMonth: "This Month",
      today: "Today",
      
      // Currency
      currency: "TZS",
      
      // Transaction types
      sale: "Sale",
      payment: "Payment",
      refund: "Refund"
    },
    sw: {
      welcome: "Karibu tena",
      adminName: "John Msimamizi",
      cashierName: "Mary Mwajiri",
      businessSummary: "Hapa kuna yaliyoendelea na biashara yako leo.",
      todaySummary: "Hapa ni muhtasari wa mauzo yako ya leo.",
      
      // Admin Dashboard Stats
      totalSales: "Jumla ya Mauzo",
      pendingCreditApps: "Mikopo Inayosubiri",
      lowStock: "Bidhaa za Hisa Ndogo",
      outstandingDebt: "Madeni Yasiyolipwa",
      
      // Cashier Dashboard Stats
      todaysSales: "Mauzo ya Leo",
      salesCount: "Idadi ya Mauzo",
      cashPayments: "Malipo ya Fedha Taslimu",
      creditSales: "Mauzo ya Mikopo",
      pendingPayments: "Malipo Yanayosubiri",
      
      // Quick Actions (Cashier)
      newSale: "Mauzo Mapya",
      customerLookup: "Tafuta Mteja",
      productSearch: "Tafuta Bidhaa",
      collectPayment: "Kusanya Malipo",
      
      // Charts
      salesTrend: "Mwelekeo wa Mauzo",
      paymentMethods: "Njia za Malipo",
      
      // Recent Activity
      recentOrders: "Maombi ya Hivi Karibuni",
      recentTransactions: "Miamala ya Hivi Karibuni",
      systemNotifications: "Arifa za Mfumo",
      viewAll: "Ona Yote",
      
      // Status values
      completed: "Imekamilika",
      pending: "Inasubiri",
      processing: "Inachakatwa",
      
      // Notifications
      lowStockAlert: "Onyo la hisa ndogo kwa Bidhaa XYZ",
      newCreditApp: "Ombi jipya la mkopo limepokewa",
      paymentOverdue: "Ukumbusho wa malipo yaliyochelewa",
      systemUpdate: "Usasisho wa mfumo umekamilika",
      
      // Time periods
      thisWeek: "Wiki Hii",
      thisMonth: "Mwezi Huu",
      today: "Leo",
      
      // Currency
      currency: "TSh",
      
      // Transaction types
      sale: "Mauzo",
      payment: "Malipo",
      refund: "Urudishaji"
    }
  }

  const t = translations[language]

  // Admin Dashboard Data
  const adminDashboardStats = [
    {
      title: t.totalSales,
      value: "2,450,000",
      currency: t.currency,
      change: "+12.5%",
      trend: "up",
      icon: CurrencyDollarIcon,
      color: "teal"
    },
    {
      title: t.pendingCreditApps,
      value: "15",
      change: "+3",
      trend: "up",
      icon: ClockIcon,
      color: "yellow"
    },
    {
      title: t.lowStock,
      value: "8",
      change: "-2",
      trend: "down",
      icon: ArchiveBoxXMarkIcon,
      color: "red"
    },
    {
      title: t.outstandingDebt,
      value: "890,000",
      currency: t.currency,
      change: "-5.2%",
      trend: "down",
      icon: ExclamationTriangleIcon,
      color: "orange"
    }
  ]

  // Cashier Dashboard Data
  const cashierDashboardStats = [
    {
      title: t.todaysSales,
      value: "245,000",
      currency: t.currency,
      change: "+8.2%",
      trend: "up",
      icon: CurrencyDollarIcon,
      color: "teal"
    },
    {
      title: t.salesCount,
      value: "23",
      change: "+5",
      trend: "up",
      icon: ShoppingCartIcon,
      color: "blue"
    },
    {
      title: t.cashPayments,
      value: "180,000",
      currency: t.currency,
      change: "+15%",
      trend: "up",
      icon: BanknotesIcon,
      color: "green"
    },
    {
      title: t.creditSales,
      value: "65,000",
      currency: t.currency,
      change: "-2%",
      trend: "down",
      icon: CreditCardIcon,
      color: "purple"
    }
  ]

  // Quick Actions for Cashier
  const quickActions = [
    {
      title: t.newSale,
      icon: PlusIcon,
      color: "bg-teal-500 hover:bg-teal-600",
      href: "/cashier/pos"
    },
    {
      title: t.customerLookup,
      icon: UserGroupIcon,
      color: "bg-blue-500 hover:bg-blue-600",
      href: "/admin/customers"
    },
    {
      title: t.productSearch,
      icon: ArchiveBoxXMarkIcon,
      color: "bg-purple-500 hover:bg-purple-600",
      href: "/admin/products"
    },
    {
      title: t.collectPayment,
      icon: BanknotesIcon,
      color: "bg-green-500 hover:bg-green-600",
      href: "/admin/payments"
    }
  ]

  const recentOrders = [
    { id: "ORD-001", customer: "Maria Mwangi", amount: 150000, status: "completed", date: "2024-01-15" },
    { id: "ORD-002", customer: "John Kimani", amount: 75000, status: "pending", date: "2024-01-15" },
    { id: "ORD-003", customer: "Grace Moshi", amount: 200000, status: "processing", date: "2024-01-14" },
    { id: "ORD-004", customer: "Peter Mlay", amount: 125000, status: "completed", date: "2024-01-14" }
  ]

  const recentTransactions = [
    { id: "TXN-001", type: "sale", customer: "Maria Mwangi", amount: 25000, time: "10:30 AM" },
    { id: "TXN-002", type: "payment", customer: "John Kimani", amount: 15000, time: "11:15 AM" },
    { id: "TXN-003", type: "sale", customer: "Grace Moshi", amount: 35000, time: "12:45 PM" },
    { id: "TXN-004", type: "refund", customer: "Peter Mlay", amount: -5000, time: "1:20 PM" }
  ]

  const systemNotifications = [
    { id: 1, message: t.lowStockAlert, time: "2 min ago", type: "warning" },
    { id: 2, message: t.newCreditApp, time: "1 hour ago", type: "info" },
    { id: 3, message: t.paymentOverdue, time: "3 hours ago", type: "error" },
    { id: 4, message: t.systemUpdate, time: "1 day ago", type: "success" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'text-green-600 bg-green-100'
      case 'payment': return 'text-blue-600 bg-blue-100'
      case 'refund': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return ExclamationTriangleIcon
      case 'error': return XMarkIcon
      case 'success': return CheckCircleIcon
      default: return BellIcon
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const currentStats = userRole === 'admin' ? adminDashboardStats : cashierDashboardStats

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t.welcome}, {userRole === 'admin' ? t.adminName : t.cashierName}!
        </h2>
        <p className="text-gray-600">
          {userRole === 'admin' ? t.businessSummary : t.todaySummary}
        </p>
      </motion.div>

      {/* Quick Actions for Cashier */}
      {userRole === 'cashier' && (
        <motion.div variants={itemVariants} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <motion.a
                key={action.title}
                href={action.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${action.color} text-white p-6 rounded-xl shadow-sm transition-all duration-200 block`}
              >
                <action.icon className="w-8 h-8 mb-3" />
                <h4 className="font-medium text-sm">{action.title}</h4>
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Admin sees EVERYTHING - Quick Actions for Admin (includes all cashier actions) */}
      {userRole === 'admin' && (
        <motion.div variants={itemVariants} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <motion.a
                key={action.title}
                href={action.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${action.color} text-white p-6 rounded-xl shadow-sm transition-all duration-200 block`}
              >
                <action.icon className="w-8 h-8 mb-3" />
                <h4 className="font-medium text-sm">{action.title}</h4>
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Dashboard Stats - Admin sees ALL stats (both admin and cashier) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {currentStats.map((stat) => (
          <motion.div
            key={stat.title}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.currency && <span className="text-sm text-gray-500">{stat.currency} </span>}
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.color === 'teal' ? 'bg-teal-100' :
                stat.color === 'yellow' ? 'bg-yellow-100' :
                stat.color === 'red' ? 'bg-red-100' :
                stat.color === 'orange' ? 'bg-orange-100' :
                stat.color === 'blue' ? 'bg-blue-100' :
                stat.color === 'green' ? 'bg-green-100' :
                stat.color === 'purple' ? 'bg-purple-100' :
                'bg-gray-100'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.color === 'teal' ? 'text-teal-600' :
                  stat.color === 'yellow' ? 'text-yellow-600' :
                  stat.color === 'red' ? 'text-red-600' :
                  stat.color === 'orange' ? 'text-orange-600' :
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  'text-gray-600'
                }`} />
              </div>
            </div>
            {stat.change && (
              <div className="flex items-center mt-4">
                {stat.trend === 'up' ? (
                  <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {userRole === 'admin' ? t.thisMonth : t.today}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Admin sees BOTH today's and monthly stats */}
      {userRole === 'admin' && (
        <motion.div variants={itemVariants} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today&apos;s Performance (Cashier View)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cashierDashboardStats.map((stat) => (
              <motion.div
                key={`cashier-${stat.title}`}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.currency && <span className="text-sm text-gray-500">{stat.currency} </span>}
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.color === 'teal' ? 'bg-teal-100' :
                    stat.color === 'yellow' ? 'bg-yellow-100' :
                    stat.color === 'red' ? 'bg-red-100' :
                    stat.color === 'orange' ? 'bg-orange-100' :
                    stat.color === 'blue' ? 'bg-blue-100' :
                    stat.color === 'green' ? 'bg-green-100' :
                    stat.color === 'purple' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    <stat.icon className={`w-6 h-6 ${
                      stat.color === 'teal' ? 'text-teal-600' :
                      stat.color === 'yellow' ? 'text-yellow-600' :
                      stat.color === 'red' ? 'text-red-600' :
                      stat.color === 'orange' ? 'text-orange-600' :
                      stat.color === 'blue' ? 'text-blue-600' :
                      stat.color === 'green' ? 'text-green-600' :
                      stat.color === 'purple' ? 'text-purple-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                </div>
                {stat.change && (
                  <div className="flex items-center mt-4">
                    {stat.trend === 'up' ? (
                      <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">{t.today}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts Section - Admin sees EVERYTHING */}
      {userRole === 'admin' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.salesTrend}</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart placeholder - {t.salesTrend}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.paymentMethods}</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart placeholder - {t.paymentMethods}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Activity - Admin sees BOTH admin and cashier views */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders/Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {userRole === 'admin' ? t.recentOrders : t.recentTransactions}
              </h3>
              <a href="#" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                {t.viewAll}
              </a>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {(userRole === 'admin' ? recentOrders : recentTransactions).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.id}</p>
                    <p className="text-sm text-gray-600">{item.customer}</p>
                    {userRole === 'cashier' && 'time' in item && (
                      <p className="text-xs text-gray-500">{item.time}</p>
                    )}
                    {userRole === 'admin' && 'date' in item && (
                      <p className="text-xs text-gray-500">{item.date}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {t.currency} {Math.abs(item.amount).toLocaleString()}
                    </p>
                    {userRole === 'admin' && 'status' in item ? (
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                        {item.status === 'completed' ? t.completed : 
                         item.status === 'pending' ? t.pending : t.processing}
                      </span>
                    ) : userRole === 'cashier' && 'type' in item && (
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTransactionTypeColor(item.type)}`}>
                        {item.type === 'sale' ? t.sale : 
                         item.type === 'payment' ? t.payment : t.refund}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">{t.systemNotifications}</h3>
              <a href="#" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                {t.viewAll}
              </a>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type)
                return (
                  <div key={notification.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      notification.type === 'warning' ? 'bg-yellow-100' :
                      notification.type === 'error' ? 'bg-red-100' :
                      notification.type === 'success' ? 'bg-green-100' :
                      'bg-blue-100'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        notification.type === 'warning' ? 'text-yellow-600' :
                        notification.type === 'error' ? 'text-red-600' :
                        notification.type === 'success' ? 'text-green-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Admin ONLY - Recent Transactions (Cashier View) */}
      {userRole === 'admin' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">{t.recentTransactions}</h3>
                <a href="#" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  {t.viewAll}
                </a>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentTransactions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.id}</p>
                      <p className="text-sm text-gray-600">{item.customer}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {t.currency} {Math.abs(item.amount).toLocaleString()}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTransactionTypeColor(item.type)}`}>
                        {item.type === 'sale' ? t.sale : 
                         item.type === 'payment' ? t.payment : t.refund}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Admin Analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Admin Overview</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                  <div>
                    <p className="font-medium text-teal-900">Total Active Users</p>
                    <p className="text-sm text-teal-600">System users online</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-teal-900">8</p>
                    <p className="text-sm text-teal-600">+2 today</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">System Performance</p>
                    <p className="text-sm text-blue-600">All systems operational</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-900">99.9%</p>
                    <p className="text-sm text-blue-600">Uptime</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900">Database Health</p>
                    <p className="text-sm text-green-600">All connections stable</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-900">✓</p>
                    <p className="text-sm text-green-600">Healthy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
} 