'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  EyeIcon,
  PencilIcon,
  CreditCardIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  ClockIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'

interface Order {
  id: number
  orderNumber: string
  customerName: string
  customerId: number
  items: number
  total: number
  orderStatus: 'pending' | 'processing' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded'
  paymentMethod: 'cash' | 'card' | 'mobile' | 'credit'
  orderDate: string
  dueDate?: string
}

export default function SalesManagementPage() {
  const { language } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('all')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const translations = {
    en: {
      pageTitle: "Sales Management",
      pageSubtitle: "Track orders, payments, and sales performance",
      
      // Search & Filters
      searchOrders: "Search orders or customers...",
      filters: "Filters",
      orderStatus: "Order Status",
      paymentStatus: "Payment Status",
      customer: "Customer",
      dateRange: "Date Range",
      
      // Date ranges
      today: "Today",
      yesterday: "Yesterday",
      last7Days: "Last 7 Days",
      last30Days: "Last 30 Days",
      thisMonth: "This Month",
      lastMonth: "Last Month",
      custom: "Custom Range",
      all: "All Time",
      
      // Order statuses
      allOrders: "All Orders",
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      cancelled: "Cancelled",
      
      // Payment statuses
      allPayments: "All Payments",
      paid: "Paid",
      partial: "Partial",
      refunded: "Refunded",
      
      // Table headers
      orderNumber: "Order #",
      customerName: "Customer",
      items: "Items",
      total: "Total",
      status: "Status",
      payment: "Payment",
      date: "Date",
      actions: "Actions",
      
      // Actions
      view: "View Details",
      edit: "Edit Order",
      processPayment: "Process Payment",
      printReceipt: "Print Receipt",
      refund: "Refund",
      
      // Analytics
      salesAnalytics: "Sales Analytics",
      dailySummary: "Today's Summary",
      totalSales: "Total Sales",
      ordersCount: "Orders",
      averageOrder: "Average Order",
      pendingPayments: "Pending Payments",
      
      // Payment methods
      cash: "Cash",
      card: "Card",
      mobile: "Mobile Money",
      credit: "Credit/Loan",
      
      // Summary cards
      todaysSales: "Today's Sales",
      weeklyRevenue: "Weekly Revenue",
      monthlyRevenue: "Monthly Revenue",
      paymentMethods: "Payment Methods",
      
      // Actions
      exportData: "Export Data",
      exportCSV: "Export CSV",
      exportExcel: "Export Excel",
      exportPDF: "Export PDF",
      
      // Pagination
      showing: "Showing",
      of: "of",
      results: "results",
      previous: "Previous",
      next: "Next",
      
      currency: "TZS",
      allCustomers: "All Customers"
    },
    sw: {
      pageTitle: "Usimamizi wa Mauzo",
      pageSubtitle: "Fuatilia maagizo, malipo, na utendaji wa mauzo",
      
      // Search & Filters
      searchOrders: "Tafuta maagizo au wateja...",
      filters: "Vichujio",
      orderStatus: "Hali ya Agizo",
      paymentStatus: "Hali ya Malipo",
      customer: "Mteja",
      dateRange: "Muda",
      
      // Date ranges
      today: "Leo",
      yesterday: "Jana",
      last7Days: "Siku 7 Zilizopita",
      last30Days: "Siku 30 Zilizopita",
      thisMonth: "Mwezi Huu",
      lastMonth: "Mwezi Uliopita",
      custom: "Muda Maalum",
      all: "Wakati Wote",
      
      // Order statuses
      allOrders: "Maagizo Yote",
      pending: "Inasubiri",
      processing: "Inashughulikiwa",
      completed: "Imekamilika",
      cancelled: "Imeghairiwa",
      
      // Payment statuses
      allPayments: "Malipo Yote",
      paid: "Amelipa",
      partial: "Nusu",
      refunded: "Imerudishwa",
      
      // Table headers
      orderNumber: "Agizo #",
      customerName: "Mteja",
      items: "Bidhaa",
      total: "Jumla",
      status: "Hali",
      payment: "Malipo",
      date: "Tarehe",
      actions: "Vitendo",
      
      // Actions
      view: "Angalia Maelezo",
      edit: "Hariri Agizo",
      processPayment: "Shughulika Malipo",
      printReceipt: "Chapisha Risiti",
      refund: "Rudisha",
      
      // Analytics
      salesAnalytics: "Uchambuzi wa Mauzo",
      dailySummary: "Muhtasari wa Leo",
      totalSales: "Mauzo Yote",
      ordersCount: "Maagizo",
      averageOrder: "Wastani wa Agizo",
      pendingPayments: "Malipo Yanayosubiri",
      
      // Payment methods
      cash: "Fedha Taslimu",
      card: "Kadi",
      mobile: "Fedha za Simu",
      credit: "Mkopo",
      
      // Summary cards
      todaysSales: "Mauzo ya Leo",
      weeklyRevenue: "Mapato ya Wiki",
      monthlyRevenue: "Mapato ya Mwezi",
      paymentMethods: "Njia za Malipo",
      
      // Actions
      exportData: "Hamisha Data",
      exportCSV: "Hamisha CSV",
      exportExcel: "Hamisha Excel",
      exportPDF: "Hamisha PDF",
      
      // Pagination
      showing: "Inaonyesha",
      of: "ya",
      results: "matokeo",
      previous: "Iliyotangulia",
      next: "Ifuatayo",
      
      currency: "TSh",
      allCustomers: "Wateja Wote"
    }
  }

  const t = translations[language]

  // Sample orders data
  const allOrders: Order[] = [
    {
      id: 1,
      orderNumber: "ORD-2024-001",
      customerName: "John Mwangi",
      customerId: 1,
      items: 3,
      total: 450000,
      orderStatus: "completed",
      paymentStatus: "paid",
      paymentMethod: "cash",
      orderDate: "2024-01-15",
    },
    {
      id: 2,
      orderNumber: "ORD-2024-002",
      customerName: "Mary Wanjiku",
      customerId: 2,
      items: 1,
      total: 85000,
      orderStatus: "processing",
      paymentStatus: "partial",
      paymentMethod: "mobile",
      orderDate: "2024-01-15",
      dueDate: "2024-01-20"
    },
    {
      id: 3,
      orderNumber: "ORD-2024-003",
      customerName: "Peter Kamau",
      customerId: 3,
      items: 5,
      total: 1200000,
      orderStatus: "pending",
      paymentStatus: "pending",
      paymentMethod: "credit",
      orderDate: "2024-01-14",
      dueDate: "2024-02-14"
    },
    {
      id: 4,
      orderNumber: "ORD-2024-004",
      customerName: "Grace Achieng",
      customerId: 4,
      items: 2,
      total: 320000,
      orderStatus: "completed",
      paymentStatus: "paid",
      paymentMethod: "card",
      orderDate: "2024-01-14",
    },
    {
      id: 5,
      orderNumber: "ORD-2024-005",
      customerName: "James Ochieng",
      customerId: 5,
      items: 1,
      total: 75000,
      orderStatus: "cancelled",
      paymentStatus: "refunded",
      paymentMethod: "mobile",
      orderDate: "2024-01-13",
    },
    {
      id: 6,
      orderNumber: "ORD-2024-006",
      customerName: "Sarah Njeri",
      customerId: 6,
      items: 4,
      total: 680000,
      orderStatus: "processing",
      paymentStatus: "paid",
      paymentMethod: "cash",
      orderDate: "2024-01-13",
    }
  ]

  const orderStatuses = [
    { value: 'all', label: t.allOrders },
    { value: 'pending', label: t.pending },
    { value: 'processing', label: t.processing },
    { value: 'completed', label: t.completed },
    { value: 'cancelled', label: t.cancelled }
  ]

  const paymentStatuses = [
    { value: 'all', label: t.allPayments },
    { value: 'pending', label: t.pending },
    { value: 'partial', label: t.partial },
    { value: 'paid', label: t.paid },
    { value: 'refunded', label: t.refunded }
  ]

  const dateRanges = [
    { value: 'all', label: t.all },
    { value: 'today', label: t.today },
    { value: 'yesterday', label: t.yesterday },
    { value: 'last7days', label: t.last7Days },
    { value: 'last30days', label: t.last30Days },
    { value: 'thismonth', label: t.thisMonth },
    { value: 'lastmonth', label: t.lastMonth }
  ]

  const customers = [
    { value: 'all', label: t.allCustomers },
    { value: '1', label: 'John Mwangi' },
    { value: '2', label: 'Mary Wanjiku' },
    { value: '3', label: 'Peter Kamau' },
    { value: '4', label: 'Grace Achieng' },
    { value: '5', label: 'James Ochieng' },
    { value: '6', label: 'Sarah Njeri' }
  ]

  // Filter orders
  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesOrderStatus = selectedOrderStatus === 'all' || order.orderStatus === selectedOrderStatus
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus
    const matchesCustomer = selectedCustomer === 'all' || order.customerId.toString() === selectedCustomer
    
    return matchesSearch && matchesOrderStatus && matchesPaymentStatus && matchesCustomer
  })

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  // Analytics data
  const todaysSales = allOrders
    .filter(order => order.orderDate === "2024-01-15" && order.paymentStatus === 'paid')
    .reduce((sum, order) => sum + order.total, 0)

  const todaysOrders = allOrders.filter(order => order.orderDate === "2024-01-15").length

  const averageOrder = todaysSales / (todaysOrders || 1)

  const pendingPayments = allOrders
    .filter(order => order.paymentStatus === 'pending' || order.paymentStatus === 'partial')
    .reduce((sum, order) => sum + order.total, 0)

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100'
      case 'partial': return 'text-yellow-600 bg-yellow-100'
      case 'pending': return 'text-red-600 bg-red-100'
      case 'refunded': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleExport = (format: string) => {
    console.log('Exporting data as:', format)
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">{t.pageTitle}</h2>
            <p className="text-gray-600">{t.pageSubtitle}</p>
          </div>
          
          {/* Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>{t.exportData}</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg text-gray-900 hover:text-gray-900"
              >
                {t.exportCSV}
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-900 hover:text-gray-900"
              >
                {t.exportExcel}
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 last:rounded-b-lg text-gray-900 hover:text-gray-900"
              >
                {t.exportPDF}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sales Analytics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.todaysSales}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{t.currency} {todaysSales.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.ordersCount}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{todaysOrders}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingCartIcon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.averageOrder}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{t.currency} {Math.round(averageOrder).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <CreditCardIcon className="w-5 h-5 lg:w-6 lg:h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.pendingPayments}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{t.currency} {pendingPayments.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchOrders}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
            />
          </div>

          {/* Filters Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
          >
            <FunnelIcon className="w-5 h-5 text-gray-600" />
            <span>{t.filters}</span>
          </motion.button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Order Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.orderStatus}</label>
                <select
                  value={selectedOrderStatus}
                  onChange={(e) => setSelectedOrderStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                >
                  {orderStatuses.map((status) => (
                    <option key={status.value} value={status.value} className="text-gray-900">
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.paymentStatus}</label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                >
                  {paymentStatuses.map((status) => (
                    <option key={status.value} value={status.value} className="text-gray-900">
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.customer}</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                >
                  {customers.map((customer) => (
                    <option key={customer.value} value={customer.value} className="text-gray-900">
                      {customer.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.dateRange}</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value} className="text-gray-900">
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Orders Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.orderNumber}</th>
                <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.customerName}</th>
                <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.items}</th>
                <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.total}</th>
                <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.status}</th>
                <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.payment}</th>
                <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.date}</th>
                <th className="text-center py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4 lg:px-6">
                    <span className="font-mono text-sm font-medium text-gray-800">{order.orderNumber}</span>
                  </td>
                  <td className="py-4 px-4 lg:px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="text-gray-800">{order.customerName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 lg:px-6">
                    <span className="text-gray-700">{order.items}</span>
                  </td>
                  <td className="py-4 px-4 lg:px-6">
                    <span className="font-semibold text-gray-800">{t.currency} {order.total.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4 lg:px-6">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getOrderStatusColor(order.orderStatus)}`}>
                      {t[order.orderStatus as keyof typeof t]}
                    </span>
                  </td>
                  <td className="py-4 px-4 lg:px-6">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {t[order.paymentStatus as keyof typeof t]}
                      </span>
                      <span className="text-xs text-gray-500">{t[order.paymentMethod as keyof typeof t]}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 lg:px-6">
                    <span className="text-sm text-gray-700">{order.orderDate}</span>
                    {order.dueDate && (
                      <div className="text-xs text-red-600">Due: {order.dueDate}</div>
                    )}
                  </td>
                  <td className="py-4 px-4 lg:px-6">
                    <div className="flex items-center justify-center space-x-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t.view}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title={t.processPayment}
                      >
                        <CreditCardIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title={t.printReceipt}
                      >
                        <PrinterIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title={t.edit}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="mt-6 lg:mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {t.showing} {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} {t.of} {filteredOrders.length} {t.results}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 hover:text-gray-900"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>{t.previous}</span>
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-teal-500 text-white hover:bg-teal-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 hover:text-gray-900"
            >
              <span>{t.next}</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
} 