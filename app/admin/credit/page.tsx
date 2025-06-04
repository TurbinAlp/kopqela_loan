'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  BanknotesIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  BellIcon,
  FunnelIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  ShieldExclamationIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import Link from 'next/link'

interface CreditSalesApplication {
  id: number
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  products: {
    name: string
    category: string
    price: number
    quantity: number
    total: number
  }[]
  totalOrderValue: number
  downPayment: number
  creditAmount: number
  paymentPeriod: number
  monthlyPayment: number
  guarantorName: string
  guarantorPhone: string
  applicationDate: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  creditScore: 'excellent' | 'good' | 'fair' | 'poor'
  riskLevel: 'low' | 'medium' | 'high'
  businessType: string
}

interface ActiveCreditSale {
  id: number
  saleNumber: string
  customerName: string
  customerPhone: string
  products: {
    name: string
    category: string
    price: number
    quantity: number
  }[]
  totalOrderValue: number
  downPaymentMade: number
  remainingBalance: number
  monthlyPayment: number
  nextPaymentDate: string
  startDate: string
  endDate: string
  interestRate: number
  status: 'current' | 'late' | 'overdue' | 'defaulted'
  paymentsRemaining: number
  totalPayments: number
}

export default function CreditSalesManagementPage() {
  const { language } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('applications')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedApplications, setSelectedApplications] = useState<number[]>([])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const translations = {
    en: {
      pageTitle: "Credit Sales Management",
      pageSubtitle: "Manage credit sales applications, active credit sales, and sales analytics",
      
      // Tabs
      applications: "Credit Sales Applications",
      activeLoans: "Active Credit Sales",
      analytics: "Analytics",
      
      // Actions
      reviewApplication: "Review Application",
      approveSelected: "Approve Selected",
      rejectSelected: "Reject Selected",
      sendReminder: "Send Payment Reminder",
      viewDetails: "View Details",
      approve: "Approve",
      reject: "Reject",
      
      // Application statuses
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      under_review: "Under Review",
      
      // Payment statuses
      current: "Current",
      late: "Late",
      overdue: "Overdue",
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
      pendingApplications: "Pending Credit Apps",
      totalActiveLoans: "Active Credit Sales",
      totalOutstanding: "Total Outstanding",
      overdueLoans: "Overdue Payments",
      averageLoanAmount: "Average Order Value",
      defaultRate: "Default Rate",
      collectionRate: "Collection Rate",
      
      // Table headers
      applicant: "Customer",
      loanAmount: "Order Value",
      duration: "Payment Period",
      applicationDate: "Application Date",
      status: "Status",
      riskLevel: "Risk Level",
      actions: "Actions",
      loanNumber: "Sale Number",
      borrower: "Customer",
      currentBalance: "Outstanding Balance",
      nextPayment: "Next Payment",
      paymentStatus: "Payment Status",
      products: "Products",
      
      // Filters
      allStatuses: "All Statuses",
      filters: "Filters",
      searchApplications: "Search credit applications...",
      searchLoans: "Search credit sales...",
      
      // Analytics
      loanPortfolioOverview: "Credit Sales Portfolio",
      riskAssessment: "Risk Assessment",
      performanceMetrics: "Performance Metrics",
      monthlyDisbursements: "Monthly Sales",
      
      // Other
      months: "months",
      currency: "TZS",
      noApplications: "No applications found",
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
      pageSubtitle: "Simamia maombi ya mauzo ya mkopo, mauzo hai, na takwimu za mauzo",
      
      // Tabs
      applications: "Maombi ya Mauzo ya Mkopo",
      activeLoans: "Mauzo ya Mkopo Hai",
      analytics: "Takwimu",
      
      // Actions
      reviewApplication: "Kagua Ombi",
      approveSelected: "Idhinisha Zilizochaguliwa",
      rejectSelected: "Kataa Zilizochaguliwa",
      sendReminder: "Tuma Ukumbusho wa Malipo",
      viewDetails: "Angalia Maelezo",
      approve: "Idhinisha",
      reject: "Kataa",
      
      // Application statuses
      pending: "Inasubiri",
      approved: "Imeidhinishwa",
      rejected: "Imekataliwa",
      under_review: "Inakaguliwa",
      
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
      pendingApplications: "Maombi Yanayosubiri",
      totalActiveLoans: "Mauzo ya Mkopo Hai",
      totalOutstanding: "Jumla ya Deni",
      overdueLoans: "Malipo Yaliyopitisha",
      averageLoanAmount: "Wastani wa Thamani ya Agizo",
      defaultRate: "Kiwango cha Kutolipa",
      collectionRate: "Kiwango cha Ukusanyaji",
      
      // Table headers
      applicant: "Mteja",
      loanAmount: "Thamani ya Agizo",
      duration: "Muda wa Malipo",
      applicationDate: "Tarehe ya Ombi",
      status: "Hali",
      riskLevel: "Kiwango cha Hatari",
      actions: "Vitendo",
      loanNumber: "Namba ya Uuzaji",
      borrower: "Mteja",
      currentBalance: "Salio Linalobaki",
      nextPayment: "Malipo Yajayo",
      paymentStatus: "Hali ya Malipo",
      products: "Bidhaa",
      
      // Filters
      allStatuses: "Hali Zote",
      filters: "Vichujio",
      searchApplications: "Tafuta maombi ya mkopo...",
      searchLoans: "Tafuta mauzo ya mkopo...",
      
      // Analytics
      loanPortfolioOverview: "Mkoba wa Mauzo ya Mkopo",
      riskAssessment: "Tathmini ya Hatari",
      performanceMetrics: "Vipimo vya Utendaji",
      monthlyDisbursements: "Mauzo ya Mwezi",
      
      // Other
      months: "miezi",
      currency: "TSh",
      noApplications: "Hakuna maombi",
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

  // Sample credit sales applications data
  const allApplications: CreditSalesApplication[] = [
    {
      id: 1,
      applicantName: "Grace Mwangi Wanjiku",
      applicantEmail: "grace.mwangi@email.com",
      applicantPhone: "+255 712 345 678",
      products: [
        { name: "Premium Fertilizer NPK", category: "Fertilizers", price: 85000, quantity: 10, total: 850000 },
        { name: "Maize Seeds", category: "Seeds", price: 12000, quantity: 5, total: 60000 }
      ],
      totalOrderValue: 910000,
      downPayment: 200000,
      creditAmount: 710000,
      paymentPeriod: 6,
      monthlyPayment: 125000,
      guarantorName: "John Mwangi",
      guarantorPhone: "+255 723 456 789",
      applicationDate: "2024-01-20",
      status: "pending",
      creditScore: "good",
      riskLevel: "medium",
      businessType: "Hardware Store"
    },
    {
      id: 2,
      applicantName: "Peter Kimani Njoroge",
      applicantEmail: "peter.kimani@email.com",
      applicantPhone: "+255 745 678 901",
      products: [
        { name: "Solar Panels 300W", category: "Electronics", price: 250000, quantity: 4, total: 1000000 },
        { name: "Battery 100Ah", category: "Electronics", price: 180000, quantity: 2, total: 360000 }
      ],
      totalOrderValue: 1360000,
      downPayment: 300000,
      creditAmount: 1060000,
      paymentPeriod: 12,
      monthlyPayment: 95000,
      guarantorName: "Sarah Wanjiku",
      guarantorPhone: "+255 756 789 012",
      applicationDate: "2024-01-19",
      status: "under_review",
      creditScore: "excellent",
      riskLevel: "low",
      businessType: "Electronics Shop"
    },
    {
      id: 3,
      applicantName: "Mary Achieng Ochieng",
      applicantEmail: "mary.achieng@email.com",
      applicantPhone: "+255 734 567 890",
      products: [
        { name: "Cooking Gas Cylinders", category: "Gas Equipment", price: 45000, quantity: 20, total: 900000 },
        { name: "Gas Burners", category: "Gas Equipment", price: 25000, quantity: 15, total: 375000 }
      ],
      totalOrderValue: 1275000,
      downPayment: 250000,
      creditAmount: 1025000,
      paymentPeriod: 8,
      monthlyPayment: 140000,
      guarantorName: "James Ochieng",
      guarantorPhone: "+255 767 890 123",
      applicationDate: "2024-01-18",
      status: "pending",
      creditScore: "fair",
      riskLevel: "high",
      businessType: "Gas Supply Business"
    },
    {
      id: 4,
      applicantName: "David Mwaura Kamau",
      applicantEmail: "david.mwaura@email.com",
      applicantPhone: "+255 789 012 345",
      products: [
        { name: "Motorcycle Spare Parts", category: "Automotive", price: 15000, quantity: 30, total: 450000 },
        { name: "Motorcycle Tires", category: "Automotive", price: 35000, quantity: 10, total: 350000 }
      ],
      totalOrderValue: 800000,
      downPayment: 150000,
      creditAmount: 650000,
      paymentPeriod: 10,
      monthlyPayment: 70000,
      guarantorName: "Elizabeth Njeri",
      guarantorPhone: "+255 778 901 234",
      applicationDate: "2024-01-17",
      status: "approved",
      creditScore: "good",
      riskLevel: "medium",
      businessType: "Motorcycle Parts Shop"
    }
  ]

  // Sample active credit sales data
  const allLoans: ActiveCreditSale[] = [
    {
      id: 1,
      saleNumber: "CS-2023-001",
      customerName: "Alice Mutua Kioko",
      customerPhone: "+255 701 234 567",
      products: [
        { name: "Building Materials - Cement", category: "Construction", price: 18000, quantity: 40 },
        { name: "Iron Sheets", category: "Construction", price: 1200, quantity: 50 }
      ],
      totalOrderValue: 780000,
      downPaymentMade: 150000,
      remainingBalance: 450000,
      monthlyPayment: 75000,
      nextPaymentDate: "2024-02-05",
      startDate: "2023-08-15",
      endDate: "2024-08-15",
      interestRate: 8,
      status: "current",
      paymentsRemaining: 6,
      totalPayments: 12
    },
    {
      id: 2,
      saleNumber: "CS-2023-002",
      customerName: "Robert Kiprotich Koech",
      customerPhone: "+255 712 345 678",
      products: [
        { name: "Agricultural Equipment", category: "Agriculture", price: 180000, quantity: 3 },
        { name: "Irrigation Pipes", category: "Agriculture", price: 8000, quantity: 100 }
      ],
      totalOrderValue: 1340000,
      downPaymentMade: 300000,
      remainingBalance: 780000,
      monthlyPayment: 65000,
      nextPaymentDate: "2024-01-28",
      startDate: "2023-06-10",
      endDate: "2025-06-10",
      interestRate: 10,
      status: "overdue",
      paymentsRemaining: 12,
      totalPayments: 24
    },
    {
      id: 3,
      saleNumber: "CS-2023-003",
      customerName: "Susan Wanjiku Mwangi",
      customerPhone: "+255 723 456 789",
      products: [
        { name: "Restaurant Equipment", category: "Hospitality", price: 120000, quantity: 5 },
        { name: "Kitchen Appliances", category: "Hospitality", price: 45000, quantity: 8 }
      ],
      totalOrderValue: 960000,
      downPaymentMade: 200000,
      remainingBalance: 380000,
      monthlyPayment: 95000,
      nextPaymentDate: "2024-02-10",
      startDate: "2023-10-01",
      endDate: "2024-10-01",
      interestRate: 6,
      status: "current",
      paymentsRemaining: 4,
      totalPayments: 12
    },
    {
      id: 4,
      saleNumber: "CS-2023-004",
      customerName: "Michael Otieno Odhiambo",
      customerPhone: "+255 734 567 890",
      products: [
        { name: "Computer Hardware", category: "Technology", price: 85000, quantity: 12 },
        { name: "Software Licenses", category: "Technology", price: 25000, quantity: 20 }
      ],
      totalOrderValue: 1520000,
      downPaymentMade: 300000,
      remainingBalance: 1050000,
      monthlyPayment: 110000,
      nextPaymentDate: "2024-01-25",
      startDate: "2024-01-01",
      endDate: "2024-12-01",
      interestRate: 12,
      status: "late",
      paymentsRemaining: 10,
      totalPayments: 11
    }
  ]

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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Filter data based on search and status
  const filteredApplications = allApplications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.applicantPhone.includes(searchQuery)
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const filteredSales = allLoans.filter(sale => {
    const matchesSearch = sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sale.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sale.customerPhone.includes(searchQuery)
    const matchesStatus = selectedStatus === 'all' || sale.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  // Analytics calculations for credit sales
  const pendingApplicationsCount = allApplications.filter(app => app.status === 'pending').length
  const totalActiveSalesCount = allLoans.length
  const totalOutstanding = allLoans.reduce((sum, sale) => sum + sale.remainingBalance, 0)
  const overdueSalesCount = allLoans.filter(sale => sale.status === 'overdue' || sale.status === 'defaulted').length
  const averageOrderValue = allApplications.reduce((sum, app) => sum + app.totalOrderValue, 0) / allApplications.length || 0
  const defaultRate = (allLoans.filter(sale => sale.status === 'defaulted').length / allLoans.length * 100) || 0
  const collectionRate = 85.2 // This would be calculated based on actual payment data

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
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>Export</span>
            </button>
            <Link
              href="/admin/credit/applications/new"
              className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Credit Application</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'applications', label: t.applications, icon: DocumentCheckIcon },
              { id: 'activeLoans', label: t.activeLoans, icon: BanknotesIcon },
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
                placeholder={activeTab === 'applications' ? t.searchApplications : t.searchLoans}
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
                    {activeTab === 'applications' ? (
                      <>
                        <option value="pending" className="text-gray-900">{t.pending}</option>
                        <option value="under_review" className="text-gray-900">{t.under_review}</option>
                        <option value="approved" className="text-gray-900">{t.approved}</option>
                        <option value="rejected" className="text-gray-900">{t.rejected}</option>
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
          {/* Credit Sales Applications Tab */}
          {activeTab === 'applications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Bulk Actions */}
              {selectedApplications.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700">
                    {selectedApplications.length} {t.selected}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      <CheckIcon className="w-4 h-4" />
                      <span>{t.approveSelected}</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                      <XMarkIcon className="w-4 h-4" />
                      <span>{t.rejectSelected}</span>
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
                          checked={selectedApplications.length === filteredApplications.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedApplications(filteredApplications.map(app => app.id))
                            } else {
                              setSelectedApplications([])
                            }
                          }}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.applicant}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.loanAmount}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.duration}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.applicationDate}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.status}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.riskLevel}</th>
                      <th className="text-center py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((application, index) => (
                      <motion.tr
                        key={application.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4 lg:px-6">
                          <input
                            type="checkbox"
                            checked={selectedApplications.includes(application.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedApplications([...selectedApplications, application.id])
                              } else {
                                setSelectedApplications(selectedApplications.filter(id => id !== application.id))
                              }
                            }}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {application.applicantName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{application.applicantName}</p>
                              <p className="text-sm text-gray-500">{application.applicantPhone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div>
                            <div className="font-semibold text-gray-800">
                              {t.currency} {application.totalOrderValue.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {application.products.length} {application.products.length === 1 ? 'product' : 'products'}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="text-gray-700">{application.paymentPeriod} {t.months}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="text-gray-700">{application.applicationDate}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(application.status)}`}>
                            {t[application.status as keyof typeof t]}
                          </span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getRiskColor(application.riskLevel)}`}>
                            {t[application.riskLevel as keyof typeof t]}
                          </span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="flex items-center justify-center space-x-1">
                            <Link
                              href={`/admin/credit/applications/${application.id}`}
                            >
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={t.viewDetails}
                              >
                                <EyeIcon className="w-4 h-4" />
                              </motion.button>
                            </Link>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title={t.approve}
                            >
                              <CheckIcon className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t.reject}
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Active Credit Sales Tab */}
          {activeTab === 'activeLoans' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.loanNumber}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.borrower}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.currentBalance}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.nextPayment}</th>
                      <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.paymentStatus}</th>
                      <th className="text-center py-4 px-4 lg:px-6 font-semibold text-gray-800">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale, index) => (
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
                          <div className="space-y-1">
                            <span className="font-semibold text-gray-800">{t.currency} {sale.remainingBalance.toLocaleString()}</span>
                            <div className="text-xs text-gray-500">
                              {sale.paymentsRemaining}/{sale.totalPayments} payments left
                            </div>
                            <div className="text-xs text-blue-600">
                              {sale.products.length} product categories
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="space-y-1">
                            <span className="text-gray-700">{sale.nextPaymentDate}</span>
                            <div className="text-xs text-gray-500">{t.currency} {sale.monthlyPayment.toLocaleString()}</div>
                          </div>
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
                              title={t.viewDetails}
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
                          </div>
                        </td>
                      </motion.tr>
                    ))}
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
                      <span className="font-semibold text-gray-800">{t.currency} {Math.round(averageOrderValue).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t.defaultRate}:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-red-600">{defaultRate.toFixed(1)}%</span>
                        <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t.collectionRate}:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-green-600">{collectionRate}%</span>
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">{t.riskAssessment}</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-green-600">Low Risk:</span>
                      <span className="font-semibold">
                        {allApplications.filter(app => app.riskLevel === 'low').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-600">Medium Risk:</span>
                      <span className="font-semibold">
                        {allApplications.filter(app => app.riskLevel === 'medium').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-red-600">High Risk:</span>
                      <span className="font-semibold">
                        {allApplications.filter(app => app.riskLevel === 'high').length}
                      </span>
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
                    <div className="text-2xl font-bold text-gray-800">{totalActiveSalesCount}</div>
                    <div className="text-sm text-gray-600">Active Customers</div>
                  </div>
                  <div className="text-center">
                    <BanknotesIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{t.currency} {totalOutstanding.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Outstanding</div>
                  </div>
                  <div className="text-center">
                    <ShieldExclamationIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{overdueSalesCount}</div>
                    <div className="text-sm text-gray-600">Overdue Payments</div>
                  </div>
                  <div className="text-center">
                    <ClockIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{pendingApplicationsCount}</div>
                    <div className="text-sm text-gray-600">Pending Credit Apps</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
} 