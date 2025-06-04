'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BriefcaseIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  ChatBubbleLeftRightIcon,
  PrinterIcon,
  CubeIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../../contexts/LanguageContext'
import Link from 'next/link'

interface ProductItem {
  id: number
  name: string
  category: string
  price: number
  quantity: number
  total: number
  inStock: number
}

interface CreditSalesApplicationDetails {
  id: number
  applicationNumber: string
  applicationDate: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  
  // Customer Information
  customer: {
    fullName: string
    email: string
    phone: string
    idNumber: string
    dateOfBirth: string
    address: string
    occupation: string
    employmentStatus: 'employed' | 'self-employed' | 'unemployed' | 'student'
    employer: string
    monthlyIncome: number
    employmentDuration: string
    creditScore: 'excellent' | 'good' | 'fair' | 'poor'
    creditHistory: string[]
  }
  
  // Selected Products
  products: ProductItem[]
  
  // Credit Terms
  creditTerms: {
    totalOrderValue: number
    downPayment: number
    creditAmount: number
    paymentPeriod: number
    monthlyPayment: number
    interestRate: number
    totalPayment: number
    dueDate: string
  }
  
  // Guarantor Information
  guarantor: {
    fullName: string
    email: string
    phone: string
    idNumber: string
    relationship: string
    address: string
    occupation: string
    monthlyIncome: number
    isVerified: boolean
    verificationDate?: string
  }
  
  // Risk Assessment
  riskAssessment: {
    level: 'low' | 'medium' | 'high'
    score: number
    factors: string[]
    recommendation: string
  }
  
  // Application History
  history: {
    date: string
    action: string
    performer: string
    notes?: string
  }[]
}

export default function CreditSalesApplicationDetailsPage() {
  const { language } = useLanguage()
  const params = useParams()
  const [isVisible, setIsVisible] = useState(false)
  const [activeSection, setActiveSection] = useState('customer')
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const translations = {
    en: {
      // Page headers
      pageTitle: "Credit Sales Application Details",
      backToApplications: "Back to Applications",
      applicationNumber: "Application #",
      
      // Sections
      customerInfo: "Customer Information",
      productDetails: "Selected Products",
      creditTerms: "Credit Terms",
      guarantorInfo: "Guarantor Information", 
      riskAssessment: "Risk Assessment",
      applicationHistory: "Application History",
      
      // Customer fields
      personalDetails: "Personal Details",
      fullName: "Full Name",
      email: "Email",
      phone: "Phone",
      idNumber: "ID Number",
      dateOfBirth: "Date of Birth",
      address: "Address",
      
      // Employment fields
      employmentInfo: "Employment Information",
      occupation: "Occupation",
      employmentStatus: "Employment Status",
      employer: "Employer",
      monthlyIncome: "Monthly Income",
      employmentDuration: "Employment Duration",
      
      // Financial fields
      financialStatus: "Financial Status",
      creditScore: "Credit Score",
      creditHistory: "Credit History",
      
      // Product fields
      productName: "Product Name",
      category: "Category",
      price: "Price",
      quantity: "Quantity",
      total: "Total",
      inStock: "In Stock",
      totalOrderValue: "Total Order Value",
      
      // Credit fields
      downPayment: "Down Payment",
      creditAmount: "Credit Amount",
      paymentPeriod: "Payment Period",
      monthlyPayment: "Monthly Payment",
      interestRate: "Interest Rate",
      totalPayment: "Total Payment",
      dueDate: "First Payment Due",
      
      // Guarantor fields
      guarantorDetails: "Guarantor Details",
      relationship: "Relationship",
      verificationStatus: "Verification Status",
      verified: "Verified",
      notVerified: "Not Verified",
      verifiedOn: "Verified on",
      
      // Risk assessment
      riskLevel: "Risk Level",
      riskScore: "Risk Score",
      riskFactors: "Risk Factors",
      recommendation: "Recommendation",
      
      // Actions
      approve: "Approve Credit Sale",
      reject: "Reject Application",
      requestInfo: "Request More Info",
      setConditions: "Set Conditions",
      print: "Print Application",
      sendMessage: "Send Message",
      
      // Status
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      under_review: "Under Review",
      
      // Employment status
      employed: "Employed",
      self_employed: "Self-employed",
      unemployed: "Unemployed",
      student: "Student",
      
      // Credit scores
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      poor: "Poor",
      
      // Risk levels
      low: "Low Risk",
      medium: "Medium Risk",
      high: "High Risk",
      
      // Dialog content
      approvalTitle: "Approve Credit Sale Application",
      approvalMessage: "Are you sure you want to approve this credit sale application?",
      rejectionTitle: "Reject Credit Sale Application",
      rejectionMessage: "Please provide a reason for rejecting this application:",
      cancel: "Cancel",
      confirm: "Confirm",
      reasonRequired: "Reason is required",
      notes: "Notes",
      addNotes: "Add your notes here...",
      
      // Other
      months: "months",
      currency: "TZS",
      perAnnum: "per annum",
      noHistory: "No history available",
      applicationSubmitted: "Application submitted",
      underReview: "Application under review",
      
      // Success messages
      approvalSuccess: "Application approved successfully",
      rejectionSuccess: "Application rejected successfully",
      messageSuccess: "Message sent successfully"
    },
    sw: {
      // Page headers
      pageTitle: "Maelezo ya Ombi la Mkopo wa Bidhaa",
      backToApplications: "Rudi kwenye Maombi",
      applicationNumber: "Ombi #",
      
      // Sections
      customerInfo: "Maelezo ya Mteja",
      productDetails: "Bidhaa Zilizochaguliwa",
      creditTerms: "Masharti ya Mkopo",
      guarantorInfo: "Maelezo ya Mdhamini",
      riskAssessment: "Tathmini ya Hatari",
      applicationHistory: "Historia ya Ombi",
      
      // Customer fields
      personalDetails: "Maelezo ya Kibinafsi",
      fullName: "Jina Kamili",
      email: "Barua Pepe",
      phone: "Simu",
      idNumber: "Namba ya Kitambulisho",
      dateOfBirth: "Tarehe ya Kuzaliwa",
      address: "Anwani",
      
      // Employment fields
      employmentInfo: "Maelezo ya Ajira",
      occupation: "Kazi",
      employmentStatus: "Hali ya Ajira",
      employer: "Mwajiri",
      monthlyIncome: "Mapato ya Kila Mwezi",
      employmentDuration: "Muda wa Ajira",
      
      // Financial fields
      financialStatus: "Hali ya Kifedha",
      creditScore: "Alama za Mikopo",
      creditHistory: "Historia ya Mikopo",
      
      // Product fields
      productName: "Jina la Bidhaa",
      category: "Kategoria",
      price: "Bei",
      quantity: "Kiasi",
      total: "Jumla",
      inStock: "Zilizo Hifadhini",
      totalOrderValue: "Thamani ya Agizo",
      
      // Credit fields
      downPayment: "Malipo ya Awali",
      creditAmount: "Kiasi cha Mkopo",
      paymentPeriod: "Muda wa Malipo",
      monthlyPayment: "Malipo ya Kila Mwezi",
      interestRate: "Kiwango cha Riba",
      totalPayment: "Jumla ya Malipo",
      dueDate: "Malipo ya Kwanza",
      
      // Guarantor fields
      guarantorDetails: "Maelezo ya Mdhamini",
      relationship: "Uhusiano",
      verificationStatus: "Hali ya Uthibitisho",
      verified: "Imethibitishwa",
      notVerified: "Haijathibitishwa",
      verifiedOn: "Ilithibitishwa tarehe",
      
      // Risk assessment
      riskLevel: "Kiwango cha Hatari",
      riskScore: "Alama za Hatari",
      riskFactors: "Mambo ya Hatari",
      recommendation: "Mapendekezo",
      
      // Actions
      approve: "Idhinisha Mkopo",
      reject: "Kataa Ombi",
      requestInfo: "Omba Maelezo Zaidi",
      setConditions: "Weka Masharti",
      print: "Chapisha Ombi",
      sendMessage: "Tuma Ujumbe",
      
      // Status
      pending: "Inasubiri",
      approved: "Imeidhinishwa",
      rejected: "Imekataliwa",
      under_review: "Inakaguliwa",
      
      // Employment status
      employed: "Ana Ajira",
      self_employed: "Mwajiri Binafsi",
      unemployed: "Hana Ajira",
      student: "Mwanafunzi",
      
      // Credit scores
      excellent: "Bora Sana",
      good: "Nzuri",
      fair: "Wastani",
      poor: "Mbaya",
      
      // Risk levels
      low: "Hatari Ndogo",
      medium: "Hatari ya Kati",
      high: "Hatari Kubwa",
      
      // Dialog content
      approvalTitle: "Idhinisha Ombi la Mkopo",
      approvalMessage: "Je, una uhakika unataka kuidhinisha ombi hili?",
      rejectionTitle: "Kataa Ombi la Mkopo",
      rejectionMessage: "Tafadhali toa sababu ya kukataa ombi hili:",
      cancel: "Ghairi",
      confirm: "Thibitisha",
      reasonRequired: "Sababu inahitajika",
      notes: "Maelezo",
      addNotes: "Ongeza maelezo yako hapa...",
      
      // Other
      months: "miezi",
      currency: "TSh",
      perAnnum: "kwa mwaka",
      noHistory: "Hakuna historia",
      applicationSubmitted: "Ombi limewasilishwa",
      underReview: "Ombi linakaguliwa",
      
      // Success messages
      approvalSuccess: "Ombi limeidhinishwa kwa mafanikio",
      rejectionSuccess: "Ombi limekataliwa kwa mafanikio",
      messageSuccess: "Ujumbe umetumwa kwa mafanikio"
    }
  }

  const t = translations[language]

  // Sample credit sales application data
  const applicationData: CreditSalesApplicationDetails = {
    id: parseInt(params.id as string) || 1,
    applicationNumber: "CSA-2024-001",
    applicationDate: "2024-01-20",
    status: "pending",
    
    customer: {
      fullName: "Grace Mwangi Wanjiku",
      email: "grace.mwangi@email.com",
      phone: "+255 712 345 678",
      idNumber: "34567890123456789",
      dateOfBirth: "1985-03-15",
      address: "123 Uhuru Street, Dar es Salaam",
      occupation: "Shop Owner",
      employmentStatus: "self-employed",
      employer: "Mwangi Hardware Store",
      monthlyIncome: 600000,
      employmentDuration: "3 years",
      creditScore: "good",
      creditHistory: [
        "Successfully completed previous credit purchase of TSh 300K in 2023",
        "No defaults in the last 2 years",
        "Good payment history with local suppliers",
        "Active member of local business group"
      ]
    },
    
    products: [
      {
        id: 1,
        name: "Premium Fertilizer - NPK 20:20:20",
        category: "Fertilizers",
        price: 85000,
        quantity: 10,
        total: 850000,
        inStock: 50
      },
      {
        id: 2,
        name: "Maize Seeds - Hybrid Variety",
        category: "Seeds",
        price: 12000,
        quantity: 5,
        total: 60000,
        inStock: 200
      },
      {
        id: 3,
        name: "Pesticide - Insecticide 500ml",
        category: "Pesticides",
        price: 25000,
        quantity: 4,
        total: 100000,
        inStock: 30
      }
    ],
    
    creditTerms: {
      totalOrderValue: 1010000,
      downPayment: 200000,
      creditAmount: 810000,
      paymentPeriod: 6,
      monthlyPayment: 145000,
      interestRate: 8,
      totalPayment: 870000,
      dueDate: "2024-02-20"
    },
    
    guarantor: {
      fullName: "John Mwangi Kamau",
      email: "john.mwangi@email.com",
      phone: "+255 723 456 789",
      idNumber: "45678901234567890",
      relationship: "Brother",
      address: "456 Kenyatta Road, Dar es Salaam",
      occupation: "Teacher",
      monthlyIncome: 800000,
      isVerified: true,
      verificationDate: "2024-01-22"
    },
    
    riskAssessment: {
      level: "medium",
      score: 65,
      factors: [
        "Self-employed status increases risk",
        "Good credit history with local suppliers",
        "Strong guarantor with stable income",
        "Products are agricultural inputs with seasonal demand",
        "Customer has been in business for 3+ years"
      ],
      recommendation: "Approve with standard terms. Request quarterly payment reports during agricultural season."
    },
    
    history: [
      {
        date: "2024-01-20",
        action: "Credit application submitted",
        performer: "Grace Mwangi",
        notes: "Customer submitted application for agricultural supplies for the upcoming season"
      },
      {
        date: "2024-01-21",
        action: "Product availability verified",
        performer: "Mary Njeri (Inventory Officer)",
        notes: "All requested products are in stock. Reserved quantities for application"
      },
      {
        date: "2024-01-22",
        action: "Guarantor verification completed",
        performer: "David Kimani (Verification Officer)",
        notes: "Guarantor verified and approved. Income documents confirmed"
      },
      {
        date: "2024-01-23",
        action: "Credit check completed",
        performer: "System",
        notes: "Credit score: Good (65/100). Previous credit performance satisfactory."
      }
    ]
  }

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'approved': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'under_review': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-TZ')
  }

  const handleApproval = () => {
    // Handle approval logic
    setShowApprovalDialog(false)
    // Show success message, etc.
  }

  const handleRejection = () => {
    if (!notes.trim()) {
      alert(t.reasonRequired)
      return
    }
    // Handle rejection logic
    setShowRejectionDialog(false)
    setNotes('')
    // Show success message, etc.
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

  const sectionItems = [
    { id: 'customer', label: t.customerInfo, icon: UserIcon },
    { id: 'products', label: t.productDetails, icon: ShoppingBagIcon },
    { id: 'credit', label: t.creditTerms, icon: CurrencyDollarIcon },
    { id: 'guarantor', label: t.guarantorInfo, icon: ShieldCheckIcon },
    { id: 'risk', label: t.riskAssessment, icon: ExclamationTriangleIcon },
    { id: 'history', label: t.applicationHistory, icon: ClockIcon }
  ]

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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/credit">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
                <p className="text-sm text-gray-500">
                  {t.applicationNumber}{applicationData.applicationNumber} • {formatDate(applicationData.applicationDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicationData.status)}`}>
                {t[applicationData.status as keyof typeof t]}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-gray-100"
                title={t.print}
              >
                <PrinterIcon className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-4 sm:px-6 lg:px-8">
        {/* Tabs Navigation */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200 px-6">
            <div className="flex space-x-8 overflow-x-auto">
              {sectionItems.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeSection === tab.id
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

          {/* Tab Content */}
          <div className="p-6 lg:p-8">
            {/* Customer Information Section */}
            {activeSection === 'customer' && (
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <UserIcon className="w-6 h-6 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{t.customerInfo}</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                      <InformationCircleIcon className="w-5 h-5 text-gray-600" />
                      <span>{t.personalDetails}</span>
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.fullName}</label>
                        <p className="text-gray-900">{applicationData.customer.fullName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.email}</label>
                        <div className="flex items-center space-x-2">
                          <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{applicationData.customer.email}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.phone}</label>
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{applicationData.customer.phone}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.idNumber}</label>
                        <p className="text-gray-900">{applicationData.customer.idNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.dateOfBirth}</label>
                        <div className="flex items-center space-x-2">
                          <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{formatDate(applicationData.customer.dateOfBirth)}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.address}</label>
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{applicationData.customer.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Employment Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                      <BriefcaseIcon className="w-5 h-5 text-gray-600" />
                      <span>{t.employmentInfo}</span>
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.occupation}</label>
                        <p className="text-gray-900">{applicationData.customer.occupation}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.employmentStatus}</label>
                        <p className="text-gray-900">{t[applicationData.customer.employmentStatus as keyof typeof t]}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.employer}</label>
                        <p className="text-gray-900">{applicationData.customer.employer}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.monthlyIncome}</label>
                        <p className="text-gray-900">{t.currency} {formatCurrency(applicationData.customer.monthlyIncome)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.employmentDuration}</label>
                        <p className="text-gray-900">{applicationData.customer.employmentDuration}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Status */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t.financialStatus}</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t.creditScore}</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCreditScoreColor(applicationData.customer.creditScore)}`}>
                        {t[applicationData.customer.creditScore as keyof typeof t]}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t.creditHistory}</label>
                      <ul className="mt-2 space-y-1">
                        {applicationData.customer.creditHistory.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                            <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Section */}
            {activeSection === 'products' && (
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <ShoppingBagIcon className="w-6 h-6 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{t.productDetails}</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.productName}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.category}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.price}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.quantity}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.total}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.inStock}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applicationData.products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <CubeIcon className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{product.category}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{t.currency} {formatCurrency(product.price)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{product.quantity}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{t.currency} {formatCurrency(product.total)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm ${product.inStock >= product.quantity ? 'text-green-600' : 'text-red-600'}`}>
                              {product.inStock}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">{t.totalOrderValue}</div>
                    <div className="text-xl font-bold text-gray-900">
                      {t.currency} {formatCurrency(applicationData.creditTerms.totalOrderValue)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Credit Terms Section */}
            {activeSection === 'credit' && (
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <CurrencyDollarIcon className="w-6 h-6 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{t.creditTerms}</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-700">{t.totalOrderValue}</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {t.currency} {formatCurrency(applicationData.creditTerms.totalOrderValue)}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-700">{t.downPayment}</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {t.currency} {formatCurrency(applicationData.creditTerms.downPayment)}
                      </p>
                    </div>
                    
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-teal-700">{t.creditAmount}</label>
                      <p className="text-lg font-semibold text-teal-900">
                        {t.currency} {formatCurrency(applicationData.creditTerms.creditAmount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-700">{t.paymentPeriod}</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {applicationData.creditTerms.paymentPeriod} {t.months}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-700">{t.interestRate}</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {applicationData.creditTerms.interestRate}% {t.perAnnum}
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-blue-700">{t.monthlyPayment}</label>
                      <p className="text-lg font-semibold text-blue-900">
                        {t.currency} {formatCurrency(applicationData.creditTerms.monthlyPayment)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-yellow-700">{t.totalPayment}</label>
                    <p className="text-lg font-semibold text-yellow-900">
                      {t.currency} {formatCurrency(applicationData.creditTerms.totalPayment)}
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-orange-700">{t.dueDate}</label>
                    <div className="flex items-center space-x-2">
                      <CalendarDaysIcon className="w-4 h-4 text-orange-600" />
                      <p className="text-lg font-semibold text-orange-900">
                        {formatDate(applicationData.creditTerms.dueDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Guarantor Section */}
            {activeSection === 'guarantor' && (
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <ShieldCheckIcon className="w-6 h-6 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{t.guarantorInfo}</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">{t.guarantorDetails}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.fullName}</label>
                        <p className="text-gray-900">{applicationData.guarantor.fullName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.email}</label>
                        <div className="flex items-center space-x-2">
                          <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{applicationData.guarantor.email}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.phone}</label>
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{applicationData.guarantor.phone}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.idNumber}</label>
                        <p className="text-gray-900">{applicationData.guarantor.idNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.relationship}</label>
                        <p className="text-gray-900">{applicationData.guarantor.relationship}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">{t.verificationStatus}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.verificationStatus}</label>
                        <div className="flex items-center space-x-2">
                          {applicationData.guarantor.isVerified ? (
                            <>
                              <CheckIcon className="w-5 h-5 text-green-500" />
                              <span className="text-green-600 font-medium">{t.verified}</span>
                            </>
                          ) : (
                            <>
                              <XMarkIcon className="w-5 h-5 text-red-500" />
                              <span className="text-red-600 font-medium">{t.notVerified}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {applicationData.guarantor.verificationDate && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t.verifiedOn}</label>
                          <p className="text-gray-900">{formatDate(applicationData.guarantor.verificationDate)}</p>
                        </div>
                      )}
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.address}</label>
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{applicationData.guarantor.address}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.occupation}</label>
                        <p className="text-gray-900">{applicationData.guarantor.occupation}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t.monthlyIncome}</label>
                        <p className="text-gray-900">{t.currency} {formatCurrency(applicationData.guarantor.monthlyIncome)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Assessment Section */}
            {activeSection === 'risk' && (
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <ExclamationTriangleIcon className="w-6 h-6 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{t.riskAssessment}</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-700">{t.riskLevel}</label>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(applicationData.riskAssessment.level)}`}>
                          {t[applicationData.riskAssessment.level as keyof typeof t]}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-700">{t.riskScore}</label>
                      <div className="flex items-center space-x-2 mt-2">
                        <CalculatorIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-lg font-semibold text-gray-900">
                          {applicationData.riskAssessment.score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">{t.riskFactors}</label>
                      <ul className="space-y-2">
                        {applicationData.riskAssessment.factors.map((factor, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                            <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">{t.recommendation}</label>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-900">{applicationData.riskAssessment.recommendation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Application History Section */}
            {activeSection === 'history' && (
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <ClockIcon className="w-6 h-6 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{t.applicationHistory}</h2>
                </div>
                
                <div className="space-y-4">
                  {applicationData.history.map((entry, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                          <DocumentTextIcon className="w-4 h-4 text-teal-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                          <p className="text-xs text-gray-500">{formatDate(entry.date)}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{entry.performer}</p>
                        {entry.notes && (
                          <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded border">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        {applicationData.status === 'pending' && (
          <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-4 justify-center lg:justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRejectionDialog(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
              <span>{t.reject}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>{t.requestInfo}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowApprovalDialog(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckIcon className="w-5 h-5" />
              <span>{t.approve}</span>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Approval Dialog */}
      {showApprovalDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.approvalTitle}</h3>
            <p className="text-gray-600 mb-6">{t.approvalMessage}</p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowApprovalDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleApproval}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {t.confirm}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Rejection Dialog */}
      {showRejectionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.rejectionTitle}</h3>
            <p className="text-gray-600 mb-4">{t.rejectionMessage}</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.addNotes}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex space-x-3 justify-end mt-4">
              <button
                onClick={() => setShowRejectionDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleRejection}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t.confirm}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
} 