'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  EyeIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  ClockIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline'
import { exportOrdersToExcel, type ExcelOrder } from '../../utils/excelExport'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBusiness } from '../../contexts/BusinessContext'
import { useNotifications } from '../../contexts/NotificationContext'
import PermissionGate from '../../components/auth/PermissionGate'
import Receipt from '../../components/Receipt'
// removed session usage; cashier name comes from API

interface Order {
  id: number
  orderNumber: string
  customer: {
    id: number
    fullName: string
    phone: string
  }
  orderItems: Array<{
    id: number
    quantity: number
    unitPrice: number
    totalPrice: number
    product?: {
      id: number
      name: string
      nameSwahili?: string
    }
    serviceItem?: {
      id: number
      name: string
      nameSwahili?: string
      durationValue: number
      durationUnit: string
      currentRentalStart?: string
      currentRentalEnd?: string
    }
  }>
  subtotal: number
  taxAmount: number
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIAL' | 'FAILED' | 'REFUNDED'
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CREDIT' | 'PARTIAL'
  paymentPlan: 'FULL' | 'PARTIAL' | 'CREDIT'
  orderDate: string
  payments: Array<{
    id: number
    amount: number
    paymentMethod: string
    paymentStatus: string
    paidAt: string | null
  }>
  createdBy?: number
  cashierName?: string | null
}

interface Customer {
  id: number
  fullName: string
  phone: string
  email?: string
}



interface Analytics {
  todaysSales: number
  todaysOrders: number
  averageOrder: number
  pendingPayments: number
}

function SalesManagementPageContent() {
  const { language } = useLanguage()
  const { currentBusiness } = useBusiness()
  const { showError } = useNotifications()
  
  const [isVisible, setIsVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('all')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState('all')
  const [dateRange, setDateRange] = useState('today') // Default to today
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // API Data states
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [analytics, setAnalytics] = useState<Analytics>({
    todaysSales: 0,
    todaysOrders: 0,
    averageOrder: 0,
    pendingPayments: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null)

  // Get date range for API calls
  const getDateRange = useCallback(() => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    switch (dateRange) {
      case 'today':
        const todayStr = today.toISOString().split('T')[0]
        return {
          dateFrom: todayStr + 'T00:00:00.000Z',
          dateTo: todayStr + 'T23:59:59.999Z'
        }
      case 'yesterday':
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        return {
          dateFrom: yesterdayStr + 'T00:00:00.000Z',
          dateTo: yesterdayStr + 'T23:59:59.999Z'
        }
      case 'last7days':
        const last7Days = new Date(today)
        last7Days.setDate(last7Days.getDate() - 7)
        return {
          dateFrom: last7Days.toISOString().split('T')[0] + 'T00:00:00.000Z',
          dateTo: today.toISOString().split('T')[0] + 'T23:59:59.999Z'
        }
      case 'last30days':
        const last30Days = new Date(today)
        last30Days.setDate(last30Days.getDate() - 30)
        return {
          dateFrom: last30Days.toISOString().split('T')[0],
          dateTo: today.toISOString().split('T')[0]
        }
      case 'thismonth':
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        return {
          dateFrom: thisMonthStart.toISOString().split('T')[0],
          dateTo: today.toISOString().split('T')[0]
        }
      case 'lastmonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
        return {
          dateFrom: lastMonthStart.toISOString().split('T')[0],
          dateTo: lastMonthEnd.toISOString().split('T')[0]
        }
      case 'custom':
        return {
          dateFrom: customDateFrom,
          dateTo: customDateTo
        }
      case 'all':
        return {} // No date filtering - get all data
      default:
        return {}
    }
  }, [dateRange, customDateFrom, customDateTo])

  // Fetch sales data from API
  const fetchSalesData = useCallback(async () => {
    if (!currentBusiness?.id) return

    setIsLoading(true)
    try {
      const { dateFrom, dateTo } = getDateRange()
      const offset = (currentPage - 1) * itemsPerPage
      
      // Build API URL with filters
      const params = new URLSearchParams({
        businessId: currentBusiness.id.toString(),
        limit: itemsPerPage.toString(),
        offset: offset.toString()
      })
      
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)
      
      const response = await fetch(`/api/admin/pos/sales?${params}`)
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch sales data')
      }
      
      setOrders(result.data.sales)
      setTotalCount(result.data.pagination.total)
      
    } catch (error) {
      showError('Error Loading Sales', `Failed to load sales data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setOrders([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [currentBusiness?.id, currentPage, itemsPerPage, showError, getDateRange])

  // Fetch customers for filter dropdown
  const fetchCustomers = useCallback(async () => {
    if (!currentBusiness?.id) return

    try {
      const response = await fetch(`/api/admin/customers?businessId=${currentBusiness.id}&limit=100`)
      const result = await response.json()
      
      if (response.ok && result.success) {
        setCustomers(result.data.customers || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomers([])
    }
  }, [currentBusiness?.id])

  // Calculate analytics from current data
  const calculateAnalytics = useCallback(() => {
    setIsLoadingAnalytics(true)
    
    const today = new Date().toISOString().split('T')[0]
    const todaysOrders = orders.filter(order => 
      order.orderDate.startsWith(today)
    )
    
    const paidTodaysOrders = todaysOrders.filter(order => 
      order.paymentStatus === 'PAID'
    )
    
    const pendingOrders = orders.filter(order => 
      order.paymentStatus === 'PENDING' || order.paymentStatus === 'PARTIAL'
    )
    
    const todaysSales = paidTodaysOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
    const todaysOrdersCount = todaysOrders.length
    const averageOrder = todaysOrdersCount > 0 ? todaysSales / todaysOrdersCount : 0
    const pendingPayments = pendingOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
    
    setAnalytics({
      todaysSales,
      todaysOrders: todaysOrdersCount,
      averageOrder,
      pendingPayments
    })
    
    setIsLoadingAnalytics(false)
  }, [orders])

  // Initial load and business change
  useEffect(() => {
    setIsVisible(true)
    if (currentBusiness?.id) {
      fetchCustomers()
      fetchSalesData()
    }
  }, [currentBusiness?.id, fetchCustomers, fetchSalesData])

  // Refetch when filters change
  useEffect(() => {
    if (currentBusiness?.id) {
      setCurrentPage(1) // Reset to first page
      fetchSalesData()
    }
  }, [dateRange, customDateFrom, customDateTo, currentBusiness?.id, fetchSalesData])

  // Refetch when page changes
  useEffect(() => {
    if (currentBusiness?.id) {
      fetchSalesData()
    }
  }, [currentPage, currentBusiness?.id, fetchSalesData])

  // Recalculate analytics when orders change
  useEffect(() => {
    calculateAnalytics()
  }, [orders, calculateAnalytics])

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
      confirmed: "Confirmed", 
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      
      // Payment statuses
      allPayments: "All Payments",
      paid: "Paid",
      partial: "Partial",
      failed: "Failed",
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
      exportExcel: "Export to Excel",
      
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
      confirmed: "Imethibitishwa",
      processing: "Inashughulikiwa",
      shipped: "Imetumwa",
      delivered: "Imefika",
      cancelled: "Imeghairiwa",
      
      // Payment statuses
      allPayments: "Malipo Yote",
      paid: "Amelipa",
      partial: "Nusu",
      failed: "Imeshindwa",
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
      exportExcel: "Hamisha kwenye Excel",
      
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

  // Check if business is selected
  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">No business selected</p>
          <p className="text-sm text-gray-500 mt-2">Please select a business to view sales data</p>
        </div>
      </div>
    )
  }


  // Dropdown options
  const orderStatuses = [
    { value: 'all', label: t.allOrders },
    { value: 'PENDING', label: t.pending },
    { value: 'CONFIRMED', label: t.confirmed },
    { value: 'PROCESSING', label: t.processing },
    { value: 'SHIPPED', label: t.shipped },
    { value: 'DELIVERED', label: t.delivered },
    { value: 'CANCELLED', label: t.cancelled }
  ]

  const paymentStatuses = [
    { value: 'all', label: t.allPayments },
    { value: 'PENDING', label: t.pending },
    { value: 'PARTIAL', label: t.partial },
    { value: 'PAID', label: t.paid },
    { value: 'FAILED', label: t.failed },
    { value: 'REFUNDED', label: t.refunded }
  ]

  const dateRanges = [
    { value: 'today', label: t.today },
    { value: 'yesterday', label: t.yesterday },
    { value: 'last7days', label: t.last7Days },
    { value: 'last30days', label: t.last30Days },
    { value: 'thismonth', label: t.thisMonth },
    { value: 'lastmonth', label: t.lastMonth },
    { value: 'all', label: t.all },
    { value: 'custom', label: t.custom }
  ]

  // Build customer dropdown options
  const customerOptions = [
    { value: 'all', label: t.allCustomers },
    ...customers.map(customer => ({
      value: customer.id.toString(),
      label: customer.fullName
    }))
  ]

  // Frontend filtering (additional to API filtering)
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesOrderStatus = selectedOrderStatus === 'all' || order.status === selectedOrderStatus
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus
    const matchesCustomer = selectedCustomer === 'all' || order.customer.id.toString() === selectedCustomer
    
    return matchesSearch && matchesOrderStatus && matchesPaymentStatus && matchesCustomer
  })

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(startIndex + orders.length - 1, totalCount)

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-600 bg-green-100'
      case 'CONFIRMED': return 'text-green-600 bg-green-100'
      case 'PROCESSING': return 'text-blue-600 bg-blue-100'
      case 'SHIPPED': return 'text-blue-600 bg-blue-100'
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'CANCELLED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-600 bg-green-100'
      case 'PARTIAL': return 'text-yellow-600 bg-yellow-100'
      case 'PENDING': return 'text-red-600 bg-red-100'
      case 'FAILED': return 'text-red-600 bg-red-100'
      case 'REFUNDED': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'CASH': return t.cash
      case 'CARD': return t.card
      case 'MOBILE_MONEY': return t.mobile
      case 'BANK_TRANSFER': return 'Bank Transfer'
      case 'CREDIT': return t.credit
      default: return method
    }
  }

  const openReceipt = (order: Order) => {
    setReceiptOrder(order)
    setShowReceipt(true)
  }


  

  const downloadOrder = (order: Order) => {
    const a = document.createElement('a')
    a.href = `/api/admin/pos/sales/${order.id}/pdf?download=1`
    a.target = '_blank'
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const exportToExcel = () => {
    exportOrdersToExcel(filteredOrders as unknown as ExcelOrder[], t, 'Orders_Export')
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
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
              <p className="text-gray-600">{t.pageSubtitle}</p>
            </div>
            
            {/* Export to Excel Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportToExcel}
              className="flex items-center space-x-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 hover:text-white transition-colors font-medium text-sm"
            >
              <TableCellsIcon className="w-4 h-4 text-white" />
              <span className="text-white">{t.exportExcel}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-full mx-auto">

      {/* Sales Analytics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.todaysSales}</p>
              {isLoadingAnalytics ? (
                <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-xl lg:text-2xl font-bold text-gray-800">{t.currency} {analytics.todaysSales.toLocaleString()}</p>
              )}
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
              {isLoadingAnalytics ? (
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-xl lg:text-2xl font-bold text-gray-800">{analytics.todaysOrders}</p>
              )}
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
              {isLoadingAnalytics ? (
                <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-xl lg:text-2xl font-bold text-gray-800">{t.currency} {Math.round(analytics.averageOrder).toLocaleString()}</p>
              )}
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
              {isLoadingAnalytics ? (
                <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-xl lg:text-2xl font-bold text-gray-800">{t.currency} {analytics.pendingPayments.toLocaleString()}</p>
              )}
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
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white text-sm"
            />
          </div>

          {/* Filters Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900 text-sm"
          >
            <FunnelIcon className="w-4 h-4 text-gray-600" />
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white text-sm"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white text-sm"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white text-sm"
                >
                  {customerOptions.map((customer) => (
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white text-sm"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value} className="text-gray-900">
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Date Range Inputs */}
            {dateRange === 'custom' && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white text-sm"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Orders Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-teal-600 border-b border-teal-700">
              <tr>
                <th className="text-left py-3 px-4 font-bold text-white text-sm">{t.orderNumber}</th>
                <th className="text-left py-3 px-4 font-bold text-white text-sm">{t.customerName}</th>
                <th className="text-left py-3 px-4 font-bold text-white text-sm">{t.items}</th>
                <th className="text-left py-3 px-4 font-bold text-white text-sm">{t.total}</th>
                <th className="text-left py-3 px-4 font-bold text-white text-sm">{t.status}</th>
                <th className="text-left py-3 px-4 font-bold text-white text-sm">{t.payment}</th>
                <th className="text-left py-3 px-4 font-bold text-white text-sm">{t.date}</th>
                <th className="text-center py-3 px-4 font-bold text-white text-sm">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Loading skeleton rows
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <ShoppingCartIcon className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-600">No sales found</p>
                      <p className="text-sm text-gray-500">Try adjusting your filters or date range</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-default"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-medium text-gray-800">{order.orderNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <span className="text-gray-800 font-medium">{order.customer.fullName}</span>
                          <div className="text-xs text-gray-500">{order.customer.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-700 text-sm">{order.orderItems.length}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-800 text-sm">{t.currency} {Number(order.totalAmount).toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getOrderStatusColor(order.status)}`}>
                        {t[order.status.toLowerCase() as keyof typeof t] || order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {t[order.paymentStatus.toLowerCase() as keyof typeof t] || order.paymentStatus}
                        </span>
                        <span className="text-xs text-gray-500">{getPaymentMethodDisplay(order.paymentMethod)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-700">{new Date(order.orderDate).toLocaleDateString()}</span>
                      {order.paymentPlan === 'PARTIAL' && order.payments.some(p => p.paymentStatus === 'PENDING') && (
                        <div className="text-xs text-red-600">Partial Payment</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); openReceipt(order) }}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t.view}
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                        </motion.button>
                        {order.paymentStatus !== 'PAID' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation() }}
                            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title={t.processPayment}
                          >
                            <CreditCardIcon className="w-3.5 h-3.5" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); downloadOrder(order) }}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t.exportData}
                        >
                          <DocumentArrowDownIcon className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && receiptOrder && (
          <Receipt
            isOpen={showReceipt}
            onClose={() => setShowReceipt(false)}
            receiptData={{
              transactionId: `ORD-${receiptOrder.id}`,
              orderNumber: receiptOrder.orderNumber,
              businessName: currentBusiness?.name || 'Business',
              businessPhone: currentBusiness?.businessSetting?.phone,
              businessEmail: currentBusiness?.businessSetting?.email,
              businessAddress: currentBusiness?.businessSetting?.address,
              customerName: receiptOrder.customer.fullName,
              customerPhone: receiptOrder.customer.phone,
              items: receiptOrder.orderItems.map((oi) => ({
                id: oi.id,
                name: oi.product?.name || oi.serviceItem?.name || 'Unknown Item',
                nameSwahili: oi.product?.nameSwahili || oi.serviceItem?.nameSwahili,
                quantity: oi.quantity,
                price: Number(oi.unitPrice),
                subtotal: Number(oi.totalPrice),
                unit: oi.product ? 'pcs' : undefined,
                itemType: oi.product ? 'PRODUCT' : 'SERVICE',
                serviceItem: oi.serviceItem ? {
                  durationValue: oi.serviceItem.durationValue,
                  durationUnit: oi.serviceItem.durationUnit,
                  currentRentalStart: oi.serviceItem.currentRentalStart,
                  currentRentalEnd: oi.serviceItem.currentRentalEnd
                } : undefined
              })),
              subtotal: Number(receiptOrder.subtotal),
              taxAmount: Number(receiptOrder.taxAmount || 0),
              taxRate: Number(currentBusiness?.businessSetting?.taxRate || 18),
              finalTotal: Number(receiptOrder.totalAmount),
              paymentMethod: (receiptOrder.paymentMethod === 'BANK_TRANSFER' ? 'bank' : receiptOrder.paymentMethod === 'MOBILE_MONEY' ? 'mobile' : receiptOrder.paymentMethod.toLowerCase()),
              paymentPlan: receiptOrder.paymentPlan.toLowerCase() as 'full' | 'partial' | 'credit',
              transactionDate: new Date(receiptOrder.orderDate).toLocaleString(),
              cashierName: receiptOrder.cashierName || undefined
            }}
          />
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="mt-6 lg:mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {t.showing} {startIndex}-{endIndex} {t.of} {totalCount} {t.results}
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
      </div>
    </motion.div>
  )
}

export default function SalesManagementPage() {
  return (
    <PermissionGate requiredPermission="sales.read">
      <SalesManagementPageContent />
    </PermissionGate>
  )
} 