'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  UserIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  BellIcon,
  EyeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import Link from 'next/link'
import { useBusiness } from '../../../contexts/BusinessContext'
import Spinner from '../../../components/ui/Spinner'

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  status: 'active' | 'inactive' | 'suspended'
  registrationDate: string
  lastOrderDate?: string
  totalOrders: number
  totalSpent: number
  creditLimit: number
  outstandingBalance: number
  creditScore: 'excellent' | 'good' | 'fair' | 'poor'
  idNumber?: string
  dateOfBirth?: string
  occupation?: string
  customerNotes?: string
}

interface Order {
  id: number
  orderNumber: string
  date: string
  items: number
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded'
  paymentMethod: 'cash' | 'card' | 'mobile' | 'credit'
  dueDate?: string
}

interface Payment {
  id: number
  date: string
  amount: number
  method: 'cash' | 'card' | 'mobile'
  orderNumber: string
  status: 'completed' | 'pending' | 'failed'
}

interface CreditHistory {
  id: number
  date: string
  type: 'loan_granted' | 'payment' | 'late_payment' | 'limit_increase' | 'limit_decrease'
  amount: number
  description: string
  balance: number
}

// Add API response interface
interface CustomerDetailsApiResponse {
  success: boolean
  data: {
    customer: Customer
    orders: Order[]
    payments: Payment[]
    creditHistory: CreditHistory[]
  }
}

export default function CustomerDetailsPage() {
  const { language } = useLanguage()
  const params = useParams()
  const { currentBusiness, isLoading: businessLoading } = useBusiness()
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [customerNotes, setCustomerNotes] = useState('')
  
  // Dynamic data states
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [creditHistory, setCreditHistory] = useState<CreditHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch customer details
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!params.id || !currentBusiness?.id) return

      setLoading(true)
      try {
        const response = await fetch(`/api/admin/customers/${params.id}`)
        const result: CustomerDetailsApiResponse = await response.json()

        if (result.success) {
          setCustomer(result.data.customer)
          setOrders(result.data.orders)
          setPayments(result.data.payments)
          setCreditHistory(result.data.creditHistory)
          setCustomerNotes(result.data.customer.customerNotes || '')
        } else {
          setError('Failed to load customer details')
        }
      } catch (error) {
        console.error('Error fetching customer details:', error)
        setError('Network error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (!businessLoading) {
      fetchCustomerDetails()
    }
  }, [params.id, currentBusiness?.id, businessLoading])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const translations = {
    en: {
      pageTitle: "Customer Details",
      backToCustomers: "Back to Customers",
      
      // Tabs
      overview: "Overview",
      orders: "Order History",
      payments: "Payment History",
      creditTab: "Credit History",
      
      // Personal Information
      personalInfo: "Personal Information",
      contactInfo: "Contact Information",
      customerStatus: "Customer Status",
      registrationDate: "Registration Date",
      lastOrder: "Last Order",
      idNumber: "ID Number",
      dateOfBirth: "Date of Birth",
      occupation: "Occupation",
      
      // Status
      active: "Active",
      inactive: "Inactive",
      suspended: "Suspended",
      
      // Credit Info
      creditInformation: "Credit Information",
      creditLimit: "Credit Limit",
      outstandingBalance: "Outstanding Balance",
      availableCredit: "Available Credit",
      creditScore: "Credit Score",
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      poor: "Poor",
      
      // Summary Cards
      totalOrders: "Total Orders",
      totalSpent: "Total Spent",
      pendingPayments: "Pending Payments",
      completedOrders: "Completed Orders",
      
      // Actions
      editCustomer: "Edit Customer",
      createOrder: "Create New Order",
      sendReminder: "Send Reminder",
      updateCreditLimit: "Update Credit Limit",
      addNote: "Add Note",
      
      // Order History
      orderHistory: "Order History",
      orderNumber: "Order #",
      date: "Date",
      items: "Items",
      total: "Total",
      status: "Status",
      paymentStatus: "Payment",
      actions: "Actions",
      
      // Order statuses
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      cancelled: "Cancelled",
      
      // Payment statuses
      paid: "Paid",
      partial: "Partial",
      refunded: "Refunded",
      
      // Payment methods
      cash: "Cash",
      card: "Card",
      mobile: "Mobile Money",
      creditPayment: "Credit/Loan",
      
      // Payment History
      paymentHistory: "Payment History",
      amount: "Amount",
      method: "Method",
      reference: "Reference",
      
      // Credit History
      creditHistory: "Credit History",
      type: "Type",
      description: "Description",
      balance: "Balance After",
      
      // Credit types
      loan_granted: "Loan Granted",
      paymentMade: "Payment Made",
      late_payment: "Late Payment",
      limit_increase: "Credit Limit Increased",
      limit_decrease: "Credit Limit Decreased",
      
      // Customer Notes
      customerNotes: "Customer Notes",
      addNoteText: "Add a note about this customer...",
      saveNote: "Save Note",
      noNotes: "No notes available",
      
      // Actions
      view: "View",
      print: "Print",
      
      // Pagination
      showing: "Showing",
      of: "of",
      results: "results",
      previous: "Previous",
      next: "Next",
      
      currency: "TZS",
      never: "Never",
      noEmail: "No email",
      noPhone: "No phone",
      noAddress: "No address"
    },
    sw: {
      pageTitle: "Maelezo ya Mteja",
      backToCustomers: "Rudi kwa Wateja",
      
      // Tabs
      overview: "Muhtasari",
      orders: "Historia ya Maagizo",
      payments: "Historia ya Malipo",
      creditTab: "Historia ya Mkopo",
      
      // Personal Information
      personalInfo: "Taarifa za Kibinafsi",
      contactInfo: "Taarifa za Mawasiliano",
      customerStatus: "Hali ya Mteja",
      registrationDate: "Tarehe ya Usajili",
      lastOrder: "Agizo la Mwisho",
      idNumber: "Namba ya Kitambulisho",
      dateOfBirth: "Tarehe ya Kuzaliwa",
      occupation: "Kazi",
      
      // Status
      active: "Hai",
      inactive: "Hajai",
      suspended: "Amesimamishwa",
      
      // Credit Info
      creditInformation: "Taarifa za Mkopo",
      creditLimit: "Kikomo cha Mkopo",
      outstandingBalance: "Deni Lisilolipwa",
      availableCredit: "Mkopo Unaosalia",
      creditScore: "Alama za Mkopo",
      excellent: "Bora Sana",
      good: "Nzuri",
      fair: "Wastani",
      poor: "Mbaya",
      
      // Summary Cards
      totalOrders: "Maagizo Yote",
      totalSpent: "Jumla Aliyotumia",
      pendingPayments: "Malipo Yanayosubiri",
      completedOrders: "Maagizo Yaliyokamilika",
      
      // Actions
      editCustomer: "Hariri Mteja",
      createOrder: "Unda Agizo Jipya",
      sendReminder: "Tuma Ukumbusho",
      updateCreditLimit: "Sasisha Kikomo cha Mkopo",
      addNote: "Ongeza Maelezo",
      
      // Order History
      orderHistory: "Historia ya Maagizo",
      orderNumber: "Agizo #",
      date: "Tarehe",
      items: "Bidhaa",
      total: "Jumla",
      status: "Hali",
      paymentStatus: "Malipo",
      actions: "Vitendo",
      
      // Order statuses
      pending: "Inasubiri",
      processing: "Inashughulikiwa",
      completed: "Imekamilika",
      cancelled: "Imeghairiwa",
      
      // Payment statuses
      paid: "Amelipa",
      partial: "Nusu",
      refunded: "Imerudishwa",
      
      // Payment methods
      cash: "Fedha Taslimu",
      card: "Kadi",
      mobile: "Fedha za Simu",
      creditPayment: "Mkopo",
      
      // Payment History
      paymentHistory: "Historia ya Malipo",
      amount: "Kiasi",
      method: "Njia",
      reference: "Marejeo",
      
      // Credit History
      creditHistory: "Historia ya Mkopo",
      type: "Aina",
      description: "Maelezo",
      balance: "Salio Baada",
      
      // Credit types
      loan_granted: "Mkopo Uliopewa",
      paymentMade: "Malipo Yalifanywa",
      late_payment: "Malipo ya Kuchelewa",
      limit_increase: "Kikomo cha Mkopo Kilineongezeka",
      limit_decrease: "Kikomo cha Mkopo Kilimepunguzwa",
      
      // Customer Notes
      customerNotes: "Maelezo ya Mteja",
      addNoteText: "Ongeza maelezo kuhusu mteja huyu...",
      saveNote: "Hifadhi Maelezo",
      noNotes: "Hakuna maelezo",
      
      // Actions
      view: "Angalia",
      print: "Chapisha",
      
      // Pagination
      showing: "Inaonyesha",
      of: "ya",
      results: "matokeo",
      previous: "Iliyotangulia",
      next: "Ifuatayo",
      
      currency: "TSh",
      never: "Kamwe",
      noEmail: "Hakuna barua pepe",
      noPhone: "Hakuna simu",
      noAddress: "Hakuna anwani"
    }
  }

  const t = translations[language]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-gray-600 bg-gray-100'
      case 'suspended': return 'text-red-600 bg-red-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      case 'paid': return 'text-green-600 bg-green-100'
      case 'partial': return 'text-yellow-600 bg-yellow-100'
      case 'refunded': return 'text-gray-600 bg-gray-100'
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const completedOrders = orders.filter(order => order.status === 'completed').length
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pendingPayments = orders
    .filter(order => order.paymentStatus === 'pending' || order.paymentStatus === 'partial')
    .reduce((sum, order) => sum + order.total, 0)

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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading customer details...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Not Found</h2>
          <p className="text-gray-600">{error || 'The customer you\'re looking for doesn\'t exist.'}</p>
          <Link href="/admin/customers" className="mt-4 text-teal-600 hover:text-teal-700">
            Back to Customers
          </Link>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/customers"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>{t.backToCustomers}</span>
            </Link>
            <div className="w-px h-6 bg-gray-300"></div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">{t.pageTitle}</h2>
              <p className="text-gray-600">{customer.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <BellIcon className="w-5 h-5" />
              <span>{t.sendReminder}</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
              <PencilIcon className="w-5 h-5" />
              <span>{t.editCustomer}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Customer Profile Header */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {customer.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{customer.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>{customer.email || t.noEmail}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="w-4 h-4" />
                  <span>{customer.phone || t.noPhone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>{t.registrationDate}: {customer.registrationDate}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <span className={`px-4 py-2 text-sm rounded-full font-medium ${getStatusColor(customer.status)}`}>
              {t[customer.status as keyof typeof t]}
            </span>
            <span className={`px-4 py-2 text-sm rounded-full font-medium ${getCreditScoreColor(customer.creditScore)}`}>
              {t[customer.creditScore as keyof typeof t]} {t.creditScore}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.totalOrders}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{customer.totalOrders}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingCartIcon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.totalSpent}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{t.currency} {customer.totalSpent.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.outstandingBalance}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{t.currency} {customer.outstandingBalance.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.availableCredit}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{t.currency} {(customer.creditLimit - customer.outstandingBalance).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <CreditCardIcon className="w-5 h-5 lg:w-6 lg:h-6 text-teal-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: t.overview, icon: UserIcon },
              { id: 'orders', label: t.orders, icon: ShoppingCartIcon },
              { id: 'payments', label: t.payments, icon: CreditCardIcon },
              { id: 'credit', label: t.creditTab, icon: BanknotesIcon }
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

        <div className="p-6 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">{t.personalInfo}</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">{t.idNumber}:</span>
                      <span className="text-gray-800 font-medium">{customer.idNumber || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">{t.dateOfBirth}:</span>
                      <span className="text-gray-800 font-medium">{customer.dateOfBirth || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">{t.occupation}:</span>
                      <span className="text-gray-800 font-medium">{customer.occupation || '-'}</span>
                    </div>
                    <div className="flex items-start justify-between py-3">
                      <span className="text-gray-600">{t.contactInfo}:</span>
                      <div className="text-right">
                        <div className="text-gray-800 font-medium">{customer.address || t.noAddress}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">{t.creditInformation}</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">{t.creditLimit}:</span>
                      <span className="text-gray-800 font-medium">{t.currency} {customer.creditLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">{t.outstandingBalance}:</span>
                      <span className={`font-medium ${customer.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {t.currency} {customer.outstandingBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">{t.availableCredit}:</span>
                      <span className="text-gray-800 font-medium">{t.currency} {(customer.creditLimit - customer.outstandingBalance).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-600">{t.creditScore}:</span>
                      <span className={`px-3 py-1 text-sm rounded-full font-medium ${getCreditScoreColor(customer.creditScore)}`}>
                        {t[customer.creditScore as keyof typeof t]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">{t.customerNotes}</h4>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{customer.customerNotes || t.noNotes}</p>
                  </div>
                  <div>
                    <textarea
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder={t.addNoteText}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 bg-white"
                    />
                    <button className="mt-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                      {t.saveNote}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800">{t.orderHistory}</h4>
                <button className="flex items-center space-x-2 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors">
                  <PlusIcon className="w-5 h-5" />
                  <span>{t.createOrder}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.orderNumber}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.date}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.items}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.total}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.status}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.paymentStatus}</th>
                      <th className="text-center py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 lg:px-6">
                          <span className="font-mono text-sm font-medium text-gray-800">{order.orderNumber}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="text-gray-700">{order.date}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="text-gray-700">{order.items}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="font-semibold text-gray-800">{t.currency} {order.total.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(order.status)}`}>
                            {t[order.status as keyof typeof t]}
                          </span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="space-y-1">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(order.paymentStatus)}`}>
                              {t[order.paymentStatus as keyof typeof t]}
                            </span>
                            <div className="text-xs text-gray-500">{order.paymentMethod === 'credit' ? t.creditPayment : t[order.paymentMethod as keyof typeof t]}</div>
                          </div>
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
                              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title={t.print}
                            >
                              <PrinterIcon className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h4 className="text-lg font-semibold text-gray-800">{t.paymentHistory}</h4>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.date}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.amount}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.method}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.reference}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 lg:px-6">
                          <span className="text-gray-700">{payment.date}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="font-semibold text-gray-800">{t.currency} {payment.amount.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="text-gray-700">{t[payment.method as keyof typeof t]}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="font-mono text-sm text-gray-600">{payment.orderNumber}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status === 'completed' ? t.paid : t[payment.status as keyof typeof t]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Credit History Tab */}
          {activeTab === 'credit' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800">{t.creditHistory}</h4>
                <button className="flex items-center space-x-2 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors">
                  <PencilIcon className="w-5 h-5" />
                  <span>{t.updateCreditLimit}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.date}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.type}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.amount}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.description}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.balance}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditHistory.map((credit) => (
                      <tr key={credit.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 lg:px-6">
                          <span className="text-gray-700">{credit.date}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="text-gray-700">{credit.type === 'payment' ? t.paymentMade : t[credit.type as keyof typeof t]}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className={`font-semibold ${credit.type === 'payment' ? 'text-green-600' : 'text-gray-800'}`}>
                            {t.currency} {credit.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="text-gray-700">{credit.description}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="font-semibold text-gray-800">{t.currency} {credit.balance.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
} 