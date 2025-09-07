'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  ClockIcon,
  BanknotesIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellIcon,
  FunnelIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  ShieldExclamationIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBusiness } from '../../contexts/BusinessContext'
import { useNotifications } from '../../contexts/NotificationContext'
import PermissionGate from '../../components/auth/PermissionGate'

interface CreditSale {
  id: number
  saleNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  products: {
    name: string
    category: string
    price: number
    quantity: number
    total: number
  }[]
  totalAmount: number
  amountPaid: number
  outstandingBalance: number
  paymentPlan: 'PARTIAL' | 'CREDIT'
  paymentMethod: string
  saleDate: string
  dueDate?: string
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'defaulted'
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'
  lastPaymentDate?: string
  nextPaymentDate?: string
}

interface PaymentHistory {
  id: number
  saleId: number
  saleNumber: string
  customerName: string
  paymentDate: string
  amount: number
  paymentMethod: string
  paymentType: 'DOWN_PAYMENT' | 'INSTALLMENT' | 'FULL_PAYMENT'
  balanceAfter: number
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
  reference?: string
  notes?: string
}

function CreditSalesManagementPageContent() {
  const { language } = useLanguage()
  const { currentBusiness } = useBusiness()
  const { showError } = useNotifications()
  
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('activeSales')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSales, setSelectedSales] = useState<number[]>([])
  
  // API Data states
  const [creditSales, setCreditSales] = useState<CreditSale[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [analytics, setAnalytics] = useState({
    activeCreditSalesCount: 0,
    totalActiveSales: 0,
    totalOutstanding: 0,
    overdueSalesCount: 0,
    averageSaleAmount: 0,
    collectionRate: 0,
    paymentSuccessRate: 85.2,
    defaultRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)

  // Fetch active credit sales from API
  const fetchCreditSales = useCallback(async () => {
    if (!currentBusiness?.id) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        businessId: currentBusiness.id.toString(),
        limit: '50',
        offset: '0'
      })

      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus.toUpperCase())
      }

      const response = await fetch(`/api/admin/credit/sales?${params}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch credit sales')
      }

      setCreditSales(result.data.sales)
    } catch (error) {
      showError('Error Loading Credit Sales', `Failed to load credit sales: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setCreditSales([])
    } finally {
      setIsLoading(false)
    }
  }, [currentBusiness?.id, selectedStatus, showError])

  // Fetch payment history from API
  const fetchPaymentHistory = useCallback(async () => {
    if (!currentBusiness?.id) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        businessId: currentBusiness.id.toString(),
        limit: '50',
        offset: '0'
      })

      const response = await fetch(`/api/admin/credit/payments?${params}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch payment history')
      }

      setPaymentHistory(result.data.payments)
    } catch (error) {
      showError('Error Loading Payment History', `Failed to load payment history: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setPaymentHistory([])
    } finally {
      setIsLoading(false)
    }
  }, [currentBusiness?.id, showError])

  // Fetch analytics from API
  const fetchAnalytics = useCallback(async () => {
    if (!currentBusiness?.id) return

    setIsLoadingAnalytics(true)
    try {
      const response = await fetch('/api/admin/credit/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: currentBusiness.id
        })
      })
      
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch analytics')
      }

      setAnalytics(result.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Use default analytics on error
    } finally {
      setIsLoadingAnalytics(false)
    }
  }, [currentBusiness?.id])

  // Initial load and business change
  useEffect(() => {
    setIsVisible(true)
    if (currentBusiness?.id) {
      fetchCreditSales()
      fetchPaymentHistory()
      fetchAnalytics()
    }
  }, [currentBusiness?.id, fetchCreditSales, fetchPaymentHistory, fetchAnalytics])

  // Refetch when filters change
  useEffect(() => {
    if (currentBusiness?.id) {
      if (activeTab === 'activeSales' || activeTab === 'overdueSales') {
        fetchCreditSales()
      } else if (activeTab === 'paymentHistory') {
        fetchPaymentHistory()
      }
    }
  }, [activeTab, selectedStatus, currentBusiness?.id, fetchCreditSales, fetchPaymentHistory])

  const translations = {
    en: {
      pageTitle: "Credit Sales Management",
      pageSubtitle: "Manage active credit sales, payment tracking, and sales analytics",
      
      // Tabs
      activeSales: "Active Credit Sales",
      paymentHistory: "Payment History", 
      overdueSales: "Overdue Sales",
      analytics: "Analytics",
      
      // Actions
      viewSaleDetails: "View Sale Details",
      recordPayment: "Record Payment",
      sendReminder: "Send Payment Reminder",
      viewDetails: "View Details",
      markPaid: "Mark as Paid",
      adjustBalance: "Adjust Balance",
      
      // Sale/Payment statuses
      pending: "Pending Payment",
      partial: "Partially Paid", 
      paid: "Fully Paid",
      overdue: "Overdue",
      
      // Payment statuses
      current: "Current",
      late: "Late Payment", 
      defaulted: "Defaulted",
      
      // Credit scores
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      poor: "Poor",
      
      // Risk levels
      low: "Low Risk",
      medium: "Medium Risk",
      high: "High Risk",
      
      // Summary cards
      activeCreditSales: "Active Credit Sales",
      totalActiveSales: "Total Active Sales",
      totalOutstanding: "Total Outstanding",
      averageSaleAmount: "Average Sale Value",
      collectionRate: "Collection Rate",
      paymentSuccess: "Payment Success Rate",
      averageLoanAmount: "Average Credit Amount",
      defaultRate: "Default Rate",
      
      // Table headers
      customer: "Customer",
      saleAmount: "Sale Amount",
      outstandingBalance: "Outstanding Balance",
      saleDate: "Sale Date",
      status: "Status",
      paymentPlan: "Payment Plan",
      actions: "Actions",
      saleNumber: "Sale Number",
      totalAmount: "Total Amount",
      amountPaid: "Amount Paid",
      nextPayment: "Next Payment",
      paymentStatus: "Payment Status",
      products: "Products",
      
      // Filters
      allStatuses: "All Statuses",
      filters: "Filters",
      searchSales: "Search credit sales...",
      searchPayments: "Search payments...",
      
      // Analytics
      loanPortfolioOverview: "Credit Sales Portfolio",
      riskAssessment: "Risk Assessment",
      performanceMetrics: "Performance Metrics",
      monthlyDisbursements: "Monthly Sales",
      
      // Other
      months: "months",
      currency: "TZS",
      noLoans: "No active credit sales found",
      selectAll: "Select All",
      selected: "selected",
      
      // Pagination
      showing: "Showing",
      of: "of",
      results: "results",
      previous: "Previous",
      next: "Next"
    },
    sw: {
      pageTitle: "Usimamizi wa Mauzo ya Mkopo",
      pageSubtitle: "Simamia mauzo ya mkopo hai, ufuatiliaji wa malipo, na takwimu za mauzo",
      
      // Tabs
      activeSales: "Mauzo ya Mkopo Hai",
      paymentHistory: "Historia ya Malipo",
      overdueSales: "Mauzo Yaliyopitisha",
      analytics: "Takwimu",
      
      // Actions
      sendReminder: "Tuma Ukumbusho wa Malipo",
      viewDetails: "Angalia Maelezo",
      viewSaleDetails: "Angalia Maelezo ya Uuzaji",
      recordPayment: "Rekodi Malipo",
      markPaid: "Andika Imelipwa",
      
      // Sale statuses
      pending: "Inasubiri",
      partial: "Imelipwa Sehemu",
      paid: "Imelipwa Kamili",
      
      // Payment statuses
      current: "Hai", 
      late: "Imechelewa",
      overdue: "Imepitisha",
      defaulted: "Haijalipi",
      
      // Credit scores
      excellent: "Bora Sana",
      good: "Nzuri",
      fair: "Wastani",
      poor: "Mbaya",
      
      // Risk levels
      low: "Hatari Ndogo",
      medium: "Hatari ya Kati",
      high: "Hatari Kubwa",
      
      // Summary cards
      totalActiveSales: "Mauzo ya Mkopo Hai",
      totalOutstanding: "Jumla ya Deni",
      averageLoanAmount: "Wastani wa Kiasi cha Mkopo",
      defaultRate: "Kiwango cha Kutolipa", 
      collectionRate: "Kiwango cha Ukusanyaji",
      averageSaleAmount: "Wastani wa Thamani ya Agizo",
      
      // Table headers
      status: "Hali",
      actions: "Vitendo",
      nextPayment: "Malipo Yajayo",
      paymentStatus: "Hali ya Malipo",
      products: "Bidhaa",
      customer: "Mteja",
      saleNumber: "Namba ya Uuzaji",
      totalAmount: "Jumla ya Kiasi",
      outstandingBalance: "Salio Linalobaki",
      saleDate: "Tarehe ya Uuzaji",
      
      // Filters
      allStatuses: "Hali Zote",
      filters: "Vichujio",
      searchSales: "Tafuta mauzo ya mkopo...",
      searchPayments: "Tafuta malipo...",
      
      // Analytics
      loanPortfolioOverview: "Mkoba wa Mauzo ya Mkopo",
      riskAssessment: "Tathmini ya Hatari",
      performanceMetrics: "Vipimo vya Utendaji",
      monthlyDisbursements: "Mauzo ya Mwezi",
      
      // Other
      months: "miezi",
      currency: "TSh",
      noLoans: "Hakuna mauzo ya mkopo hai",
      selectAll: "Chagua Yote",
      selected: "imechaguliwa",
      
      // Pagination
      showing: "Inaonyesha",
      of: "ya",
      results: "matokeo",
      previous: "Iliyotangulia",
      next: "Ifuatayo"
    }
  }

  const t = translations[language] 

  // Check if business is selected
  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">No business selected</p>
          <p className="text-sm text-gray-500 mt-2">Please select a business to view credit sales data</p>
        </div>
      </div>
    )
  }

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'approved': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'under_review': return 'text-blue-600 bg-blue-100'
      case 'current': return 'text-green-600 bg-green-100'
      case 'late': return 'text-yellow-600 bg-yellow-100'
      case 'overdue': return 'text-orange-600 bg-orange-100'
      case 'defaulted': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }



  // Filter data based on search and status (client-side filtering on already fetched data)
  const filteredCreditSales = creditSales.filter(sale => {
    const matchesSearch = searchQuery === '' || 
      sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sale.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sale.customerPhone.includes(searchQuery)
    return matchesSearch
  })

  const filteredPaymentHistory = paymentHistory.filter(payment => {
    const matchesSearch = searchQuery === '' ||
      payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.saleNumber.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Get overdue sales (subset of credit sales)
  const overdueSales = filteredCreditSales.filter(sale => 
    sale.status === 'overdue' || sale.paymentStatus === 'OVERDUE'
  )

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
      <motion.div variants={itemVariants} className="bg-white shadow-sm border-b border-gray-200 mb-6 rounded-2xl">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
              <p className="text-gray-600">{t.pageSubtitle}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <DocumentArrowDownIcon className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-0 ">

      {/* Tabs Navigation */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'activeSales', label: t.activeSales, icon: BanknotesIcon },
              { id: 'paymentHistory', label: t.paymentHistory, icon: ClockIcon },
              { id: 'overdueSales', label: t.overdueSales, icon: ShieldExclamationIcon },
              { id: 'analytics', label: t.analytics, icon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeTab === 'paymentHistory' ? t.searchPayments : t.searchSales}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
            >
              <FunnelIcon className="w-5 h-5 text-gray-600" />
              <span>{t.filters}</span>
              <ChevronDownIcon className="w-4 h-4" />
            </motion.button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                  >
                    <option value="all" className="text-gray-900">{t.allStatuses}</option>
                    {activeTab === 'activeSales' || activeTab === 'overdueSales' ? (
                      <>
                        <option value="pending" className="text-gray-900">{t.pending}</option>
                        <option value="partial" className="text-gray-900">{t.partial}</option>
                        <option value="paid" className="text-gray-900">{t.paid}</option>
                        <option value="overdue" className="text-gray-900">{t.overdue}</option>
                      </>
                    ) : activeTab === 'paymentHistory' ? (
                      <>
                        <option value="completed" className="text-gray-900">Completed</option>
                        <option value="pending" className="text-gray-900">{t.pending}</option>
                        <option value="failed" className="text-gray-900">Failed</option>
                      </>
                    ) : (
                      <>
                        <option value="current" className="text-gray-900">{t.current}</option>
                        <option value="late" className="text-gray-900">{t.late}</option>
                        <option value="overdue" className="text-gray-900">{t.overdue}</option>
                        <option value="defaulted" className="text-gray-900">{t.defaulted}</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6 lg:p-8">
          {/* Active Credit Sales Tab */}
          {activeTab === 'activeSales' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Bulk Actions */}
              {selectedSales.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700">
                    {selectedSales.length} {t.selected}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      <CheckIcon className="w-4 h-4" />
                      <span>{t.markPaid}</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                      <BellIcon className="w-4 h-4" />
                      <span>{t.sendReminder}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-4 lg:px-6">
                        <input
                          type="checkbox"
                          checked={selectedSales.length === filteredCreditSales.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSales(filteredCreditSales.map(sale => sale.id))
                            } else {
                              setSelectedSales([])
                            }
                          }}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.saleNumber}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.customer}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.totalAmount}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.outstandingBalance}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.saleDate}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.status}</th>
                      <th className="text-center py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      // Loading skeleton rows
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                              <div>
                                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="flex items-center justify-center space-x-1">
                              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : filteredCreditSales.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <BanknotesIcon className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-600">No credit sales found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCreditSales.map((sale, index) => (
                        <motion.tr
                        key={sale.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4 lg:px-6">
                          <input
                            type="checkbox"
                            checked={selectedSales.includes(sale.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSales([...selectedSales, sale.id])
                              } else {
                                setSelectedSales(selectedSales.filter(id => id !== sale.id))
                              }
                            }}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="font-mono text-sm font-medium text-gray-800">{sale.saleNumber}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {sale.customerName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{sale.customerName}</p>
                              <p className="text-sm text-gray-500">{sale.customerPhone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div>
                            <div className="font-semibold text-gray-800">
                              {t.currency} {sale.totalAmount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {sale.products.length} {sale.products.length === 1 ? 'product' : 'products'}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div>
                            <div className="font-semibold text-red-600">
                              {t.currency} {sale.outstandingBalance.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Paid: {t.currency} {sale.amountPaid.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="text-gray-700">{sale.saleDate}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(sale.status)}`}>
                            {t[sale.status as keyof typeof t]}
                          </span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="flex items-center justify-center space-x-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title={t.viewSaleDetails}
                            >
                              <EyeIcon className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title={t.recordPayment}
                            >
                              <CheckIcon className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title={t.sendReminder}
                            >
                              <BellIcon className="w-4 h-4" />
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
          )}

          {/* Payment History Tab */}
          {activeTab === 'paymentHistory' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.saleNumber}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.customer}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">Payment Date</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">Amount</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">Method</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.status}</th>
                      <th className="text-center py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      // Loading skeleton rows
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                              <div>
                                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="flex items-center justify-center space-x-1">
                              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : filteredPaymentHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <ClockIcon className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-600">No payment history found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPaymentHistory.map((payment, index) => (
                        <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4 lg:px-6">
                          <span className="font-mono text-sm font-medium text-gray-800">{payment.saleNumber}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {payment.customerName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{payment.customerName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="text-gray-700">{payment.paymentDate}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="space-y-1">
                            <span className="font-semibold text-gray-800">{t.currency} {payment.amount.toLocaleString()}</span>
                            <div className="text-xs text-gray-500">
                              Balance: {t.currency} {payment.balanceAfter.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="text-gray-700">{payment.paymentMethod}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(payment.status.toLowerCase())}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="flex items-center justify-center space-x-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Payment Details"
                            >
                              <EyeIcon className="w-4 h-4" />
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
          )}

          {/* Overdue Sales Tab */}
          {activeTab === 'overdueSales' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.saleNumber}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.customer}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.totalAmount}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.outstandingBalance}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">Days Overdue</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.status}</th>
                      <th className="text-center py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="flex items-center justify-center space-x-1">
                              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : overdueSales.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <ShieldExclamationIcon className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-600">No overdue sales found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      overdueSales.map((sale, index) => (
                        <motion.tr
                          key={sale.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4 lg:px-6">
                            <span className="font-mono text-sm font-medium text-gray-800">{sale.saleNumber}</span>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {sale.customerName.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{sale.customerName}</p>
                                <p className="text-sm text-gray-500">{sale.customerPhone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <span className="font-semibold text-gray-800">{t.currency} {sale.totalAmount.toLocaleString()}</span>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="font-semibold text-red-600">
                              {t.currency} {sale.outstandingBalance.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <span className="text-red-600 font-medium">
                              {Math.floor((new Date().getTime() - new Date(sale.dueDate || sale.saleDate).getTime()) / (1000 * 60 * 60 * 24))} days
                            </span>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(sale.status)}`}>
                              {t[sale.status as keyof typeof t]}
                            </span>
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="flex items-center justify-center space-x-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={t.viewSaleDetails}
                              >
                                <EyeIcon className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title={t.sendReminder}
                              >
                                <BellIcon className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title={t.recordPayment}
                              >
                                <CheckIcon className="w-4 h-4" />
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
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">{t.performanceMetrics}</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t.averageLoanAmount}:</span>
                      {isLoadingAnalytics ? (
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <span className="font-semibold text-gray-800">{t.currency} {Math.round(analytics.averageSaleAmount).toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t.defaultRate}:</span>
                      {isLoadingAnalytics ? (
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                      <div className="flex items-center space-x-2">
                          <span className="font-semibold text-red-600">{analytics.defaultRate.toFixed(1)}%</span>
                        <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                      </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t.collectionRate}:</span>
                      {isLoadingAnalytics ? (
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                      <div className="flex items-center space-x-2">
                          <span className="font-semibold text-green-600">{analytics.collectionRate}%</span>
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                      </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Status Breakdown</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-green-600">Fully Paid:</span>
                                            {isLoading ? (
                        <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <span className="font-semibold">
                          {creditSales.filter(sale => sale.status === 'paid').length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-600">Partial Payments:</span>
                      {isLoading ? (
                        <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <span className="font-semibold">
                          {creditSales.filter(sale => sale.status === 'partial').length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-red-600">Overdue Sales:</span>
                      {isLoading ? (
                        <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <span className="font-semibold">
                          {creditSales.filter(sale => sale.status === 'overdue').length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Overview */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">{t.loanPortfolioOverview}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <UserGroupIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    {isLoadingAnalytics ? (
                      <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-800">{analytics.totalActiveSales}</div>
                    )}
                    <div className="text-sm text-gray-600">Active Customers</div>
                  </div>
                  <div className="text-center">
                    <BanknotesIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    {isLoadingAnalytics ? (
                      <div className="w-24 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-800">{t.currency} {analytics.totalOutstanding.toLocaleString()}</div>
                    )}
                    <div className="text-sm text-gray-600">Total Outstanding</div>
                  </div>
                  <div className="text-center">
                    <ShieldExclamationIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    {isLoadingAnalytics ? (
                      <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-800">{analytics.overdueSalesCount}</div>
                    )}
                    <div className="text-sm text-gray-600">Overdue Payments</div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      </div>
    </motion.div>
  )
}

export default function CreditSalesManagementPage() {
  return (
    <PermissionGate requiredPermission="credit_applications.read">
      <CreditSalesManagementPageContent />
    </PermissionGate>
  )
} 