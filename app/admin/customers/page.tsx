'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  BanknotesIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  FunnelIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  ArchiveBoxArrowDownIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useRequireAdminAuth } from '../../hooks/useRequireAuth'
import { useBusiness } from '../../contexts/BusinessContext'
import Spinner from '../../components/ui/Spinner'
import Link from 'next/link'
import AddCustomerModal from '../../components/AddCustomerModal'
import EditCustomerModal from '../../components/EditCustomerModal'

interface Customer {
  id: number
  name: string
  email: string | null
  phone: string
  address: string | null
  idNumber: string | null
  dateOfBirth: string | null
  occupation: string | null
  customerNotes: string | null
  status: 'active' | 'inactive' | 'suspended'
  registrationDate: string
  lastOrderDate?: string
  totalOrders: number
  totalSpent: number
  creditLimit: number
  outstandingBalance: number
  creditScore: 'excellent' | 'good' | 'fair' | 'poor'
}

interface CustomersApiResponse {
  success: boolean
  data: {
    customers: Customer[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
    }
    summary: {
      totalCustomers: number
      activeCustomers: number
      totalOutstanding: number
      averageSpent: number
    }
  }
}

export default function CustomerManagementPage() {
  const { language } = useLanguage()
  const { isLoading: authLoading } = useRequireAdminAuth()
  const { currentBusiness, isLoading: businessLoading } = useBusiness()
  const [isVisible, setIsVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalOutstanding: 0,
    averageSpent: 0
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const fetchCustomers = useCallback(async () => {
    if (!currentBusiness?.id) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        businessId: currentBusiness.id.toString(),
        search: searchQuery,
        status: selectedStatus,
        sortBy: sortBy,
        sortOrder: sortOrder,
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      })

      const response = await fetch(`/api/admin/customers?${params}`)
      const result: CustomersApiResponse = await response.json()

      if (result.success) {
        setCustomers(result.data.customers)
        setSummary(result.data.summary)
        setPagination(result.data.pagination)
      } else {
        console.error('Failed to fetch customers:', result)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }, [currentBusiness?.id, searchQuery, selectedStatus, sortBy, sortOrder, currentPage, itemsPerPage])

  // Initial load and when dependencies change
  useEffect(() => {
    if (currentBusiness?.id && !businessLoading) {
      fetchCustomers()
    }
  }, [currentBusiness?.id, businessLoading, fetchCustomers])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const translations = {
    en: {
      pageTitle: "Customer Management",
      pageSubtitle: "Manage customers, credit history, and outstanding balances",
      
      // Actions
      addCustomer: "Add Customer",
      searchCustomers: "Search customers...",
      filters: "Filters",
      exportData: "Export Data",
      exportCSV: "Export CSV",
      exportExcel: "Export Excel",
      exportPDF: "Export PDF",
      
      // Filters & Sort
      customerStatus: "Customer Status",
      sortBy: "Sort By",
      sortOrder: "Sort Order",
      ascending: "Ascending",
      descending: "Descending",
      
      // Status
      allStatuses: "All Statuses",
      active: "Active",
      inactive: "Inactive",
      suspended: "Suspended",
      
      // Sort options
      name: "Name",
      registrationDate: "Registration Date",
      lastOrder: "Last Order",
      totalSpent: "Total Spent",
      outstandingBalance: "Outstanding Balance",
      
      // Table headers
      customer: "Customer",
      contact: "Contact",
      status: "Status",
      orders: "Orders",
      spent: "Total Spent",
      credit: "Credit Info",
      lastOrderDate: "Last Order",
      actions: "Actions",
      
      // Customer actions
      view: "View Details",
      edit: "Edit Customer",
      creditHistory: "Credit History",
      outstandingBalances: "Outstanding Balances",
      
      // Customer info
      registeredOn: "Registered",
      totalOrdersCount: "Total Orders",
      creditLimitLabel: "Credit Limit",
      availableCredit: "Available Credit",
      
      // Credit scores
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      poor: "Poor",
      
      // Summary cards
      totalCustomers: "Total Customers",
      activeCustomers: "Active Customers",
      totalOutstanding: "Total Outstanding",
      averageSpent: "Average Spent",
      
      // Pagination
      showing: "Showing",
      of: "of",
      results: "results",
      previous: "Previous",
      next: "Next",
      
      currency: "TZS",
      noEmail: "No email",
      noPhone: "No phone",
      noAddress: "No address",
      never: "Never"
    },
    sw: {
      pageTitle: "Usimamizi wa Wateja",
      pageSubtitle: "Simamia wateja, historia ya mkopo, na deni lisilolipwa",
      
      // Actions
      addCustomer: "Ongeza Mteja",
      searchCustomers: "Tafuta wateja...",
      filters: "Vichujio",
      exportData: "Hamisha Data",
      exportCSV: "Hamisha CSV",
      exportExcel: "Hamisha Excel",
      exportPDF: "Hamisha PDF",
      
      // Filters & Sort
      customerStatus: "Hali ya Mteja",
      sortBy: "Panga kwa",
      sortOrder: "Mpangilio",
      ascending: "Kupanda",
      descending: "Kushuka",
      
      // Status
      allStatuses: "Hali Zote",
      active: "Hai",
      inactive: "Hajai",
      suspended: "Amesimamishwa",
      
      // Sort options
      name: "Jina",
      registrationDate: "Tarehe ya Usajili",
      lastOrder: "Agizo la Mwisho",
      totalSpent: "Jumla Aliyotumia",
      outstandingBalance: "Deni",
      
      // Table headers
      customer: "Mteja",
      contact: "Mawasiliano",
      status: "Hali",
      orders: "Maagizo",
      spent: "Jumla Aliyotumia",
      credit: "Taarifa za Mkopo",
      lastOrderDate: "Agizo la Mwisho",
      actions: "Vitendo",
      
      // Customer actions
      view: "Angalia Maelezo",
      edit: "Hariri Mteja",
      creditHistory: "Historia ya Mkopo",
      outstandingBalances: "Deni Lisilolipwa",
      
      // Customer info
      registeredOn: "Alisajiliwa",
      totalOrdersCount: "Jumla ya Maagizo",
      creditLimitLabel: "Kikomo cha Mkopo",
      availableCredit: "Mkopo Unaosalia",
      
      // Credit scores
      excellent: "Bora Sana",
      good: "Nzuri",
      fair: "Wastani",
      poor: "Mbaya",
      
      // Summary cards
      totalCustomers: "Wateja Wote",
      activeCustomers: "Wateja Hai",
      totalOutstanding: "Jumla ya Deni",
      averageSpent: "Wastani Waliyotumia",
      
      // Pagination
      showing: "Inaonyesha",
      of: "ya",
      results: "matokeo",
      previous: "Iliyotangulia",
      next: "Ifuatayo",
      
      currency: "TSh",
      noEmail: "Hakuna barua pepe",
      noPhone: "Hakuna simu",
      noAddress: "Hakuna anwani",
      never: "Kamwe"
    }
  }

  const t = translations[language]

  const statusOptions = [
    { value: 'all', label: t.allStatuses },
    { value: 'active', label: t.active },
    { value: 'inactive', label: t.inactive },
    { value: 'suspended', label: t.suspended }
  ]

  const sortOptions = [
    { value: 'name', label: t.name },
    { value: 'registrationDate', label: t.registrationDate },
    { value: 'lastOrderDate', label: t.lastOrder },
    { value: 'totalSpent', label: t.totalSpent },
    { value: 'outstandingBalance', label: t.outstandingBalance }
  ]

  // Use customers directly from API (already filtered and )
  const currentCustomers = customers

  // Use summary and pagination data directly from API
  const totalCustomers = summary.totalCustomers
  const activeCustomers = summary.activeCustomers
  const totalOutstanding = summary.totalOutstanding
  const averageSpent = summary.averageSpent

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-gray-600 bg-gray-100'
      case 'suspended': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCreditScoreColor = (score: string) => {
    switch (score) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleExport = (format: string) => {
    console.log('Exporting customers data as:', format)
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCustomerAdded = (_newCustomer: Customer) => {
    fetchCustomers()
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsEditModalOpen(true)
  }

  const handleCustomerUpdated = () => {
    fetchCustomers()
    setIsEditModalOpen(false)
    setEditingCustomer(null)
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
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
          
          <div className="flex items-center space-x-3">
            {/* Export Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
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

            {/* Add Customer Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="w-5 h-5" />
              <span>{t.addCustomer}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.totalCustomers}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{totalCustomers}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <UserIcon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.activeCustomers}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{activeCustomers}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.totalOutstanding}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{t.currency} {totalOutstanding.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.averageSpent}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{t.currency} {Math.round(averageSpent).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 lg:w-6 lg:h-6 text-teal-600" />
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
              placeholder={t.searchCustomers}
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
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.customerStatus}</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value} className="text-gray-900">
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.sortBy}</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value} className="text-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.sortOrder}</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                >
                  <option value="asc" className="text-gray-900">{t.ascending}</option>
                  <option value="desc" className="text-gray-900">{t.descending}</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Customers Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Loading customers...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.customer}</th>
                  <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.contact}</th>
                  <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.status}</th>
                  <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.orders}</th>
                  <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.spent}</th>
                  <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.credit}</th>
                  <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.lastOrderDate}</th>
                  <th className="text-center py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4 lg:px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{customer.name}</p>
                        <p className="text-sm text-gray-500">{t.registeredOn}: {customer.registrationDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 lg:px-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{customer.email || t.noEmail}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{customer.phone || t.noPhone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 lg:px-6">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(customer.status)}`}>
                      {t[customer.status as keyof typeof t]}
                    </span>
                  </td>
                  <td className="py-4 px-4 lg:px-6">
                    <div className="flex items-center space-x-2">
                      <ArchiveBoxArrowDownIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{customer.totalOrders}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 lg:px-6">
                    <span className="font-semibold text-gray-800">{t.currency} {customer.totalSpent.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4 lg:px-6">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{t.creditLimitLabel}:</span>
                        <span className="text-xs font-medium">{t.currency} {customer.creditLimit.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Outstanding:</span>
                        <span className={`text-xs font-medium ${customer.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {t.currency} {customer.outstandingBalance.toLocaleString()}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getCreditScoreColor(customer.creditScore)}`}>
                        {t[customer.creditScore as keyof typeof t]}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 lg:px-6">
                    <div className="flex items-center space-x-2">
                      <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{customer.lastOrderDate || t.never}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 lg:px-6">
                    <div className="flex items-center justify-center space-x-1">
                      <Link href={`/admin/customers/${customer.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t.view}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </motion.button>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditCustomer(customer)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title={t.edit}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title={t.creditHistory}
                      >
                        <CreditCardIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title={t.outstandingBalances}
                      >
                        <ClockIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
                              ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <motion.div variants={itemVariants} className="mt-6 lg:mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {t.showing} {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} {t.of} {pagination.totalItems} {t.results}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={pagination.currentPage === 1}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 hover:text-gray-900"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>{t.previous}</span>
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    pagination.currentPage === page
                      ? 'bg-teal-500 text-white hover:bg-teal-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 hover:text-gray-900"
            >
              <span>{t.next}</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <AddCustomerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCustomerAdded={handleCustomerAdded}
        />
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && editingCustomer && (
        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingCustomer(null)
          }}
          customer={editingCustomer}
          onCustomerUpdated={handleCustomerUpdated}
        />
      )}
    </motion.div>
  )
} 