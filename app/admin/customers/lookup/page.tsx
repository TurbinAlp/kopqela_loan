'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  EyeIcon,
  BanknotesIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'

interface Customer {
  id: string
  name: string
  phone: string
  email: string
  registrationDate: string
  status: 'active' | 'inactive' | 'blocked'
  totalOrders: number
  totalSpent: number
  outstandingBalance: number
  creditLimit: number
  lastOrderDate?: string
}

interface Order {
  id: string
  date: string
  amount: number
  status: 'completed' | 'pending' | 'cancelled'
  items: number
}

export default function CustomerLookup() {
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'name' | 'phone' | 'email'>('name')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Customer[]>([])

  const translations = {
    en: {
      title: "Customer Lookup",
      searchPlaceholder: "Search customer by name, phone, or email...",
      searchBy: "Search by",
      name: "Name",
      phone: "Phone",
      email: "Email",
      searching: "Searching...",
      noResults: "No customers found",
      tryDifferent: "Try a different search term",
      
      // Customer info
      customerDetails: "Customer Details",
      personalInfo: "Personal Information",
      registrationDate: "Registration Date",
      status: "Status",
      contactInfo: "Contact Information",
      
      // Financial info
      financialInfo: "Financial Information",
      totalOrders: "Total Orders",
      totalSpent: "Total Spent",
      outstandingBalance: "Outstanding Balance",
      creditLimit: "Credit Limit",
      lastOrder: "Last Order",
      
      // Order history
      orderHistory: "Order History",
      recentOrders: "Recent Orders",
      amount: "Amount",
      date: "Date",
      items: "Items",
      
      // Status values
      active: "Active",
      inactive: "Inactive",
      blocked: "Blocked",
      completed: "Completed",
      pending: "Pending",
      cancelled: "Cancelled",
      
      // Quick actions
      quickActions: "Quick Actions",
      createOrder: "Create New Order",
      collectPayment: "Collect Payment",
      viewHistory: "View Full History",
      updateInfo: "Update Information",
      
      // Currency
      currency: "TZS",
      
      // Alerts
      creditWarning: "Credit limit exceeded",
      noCredit: "No credit available",
      goodStanding: "Good standing"
    },
    sw: {
      title: "Utafutaji wa Wateja",
      searchPlaceholder: "Tafuta mteja kwa jina, simu, au barua pepe...",
      searchBy: "Tafuta kwa",
      name: "Jina",
      phone: "Simu",
      email: "Barua Pepe",
      searching: "Inatafuta...",
      noResults: "Hakuna wateja waliopatikana",
      tryDifferent: "Jaribu neno lingine la utafutaji",
      
      // Customer info
      customerDetails: "Maelezo ya Mteja",
      personalInfo: "Taarifa za Kibinafsi",
      registrationDate: "Tarehe ya Usajili",
      status: "Hali",
      contactInfo: "Taarifa za Mawasiliano",
      
      // Financial info
      financialInfo: "Taarifa za Kifedha",
      totalOrders: "Jumla ya Maombi",
      totalSpent: "Jumla Aliyotumia",
      outstandingBalance: "Deni Bado",
      creditLimit: "Kikomo cha Mkopo",
      lastOrder: "Ombi la Mwisho",
      
      // Order history
      orderHistory: "Historia ya Maombi",
      recentOrders: "Maombi ya Hivi Karibuni",
      amount: "Kiasi",
      date: "Tarehe",
      items: "Bidhaa",
      
      // Status values
      active: "Hai",
      inactive: "Kimya",
      blocked: "Imezuiliwa",
      completed: "Imekamilika",
      pending: "Inasubiri",
      cancelled: "Imeghairiwa",
      
      // Quick actions
      quickActions: "Vitendo vya Haraka",
      createOrder: "Unda Ombi Jipya",
      collectPayment: "Kusanya Malipo",
      viewHistory: "Ona Historia Kamili",
      updateInfo: "Sasisha Taarifa",
      
      // Currency
      currency: "TSh",
      
      // Alerts
      creditWarning: "Kikomo cha mkopo kimepitwa",
      noCredit: "Hakuna mkopo unapatikana",
      goodStanding: "Hali nzuri"
    }
  }

  const t = translations[language]

  // Sample customers data
  const sampleCustomers: Customer[] = [
    {
      id: "CUST-001",
      name: "Maria Mwangi",
      phone: "+255 741 234 567",
      email: "maria.mwangi@email.com",
      registrationDate: "2023-05-15",
      status: "active",
      totalOrders: 24,
      totalSpent: 1250000,
      outstandingBalance: 85000,
      creditLimit: 500000,
      lastOrderDate: "2024-01-10"
    },
    {
      id: "CUST-002",
      name: "John Kimani",
      phone: "+255 742 345 678",
      email: "john.kimani@email.com",
      registrationDate: "2023-08-20",
      status: "active",
      totalOrders: 15,
      totalSpent: 750000,
      outstandingBalance: 0,
      creditLimit: 300000,
      lastOrderDate: "2024-01-12"
    },
    {
      id: "CUST-003",
      name: "Grace Moshi",
      phone: "+255 743 456 789",
      email: "grace.moshi@email.com",
      registrationDate: "2023-11-02",
      status: "blocked",
      totalOrders: 8,
      totalSpent: 320000,
      outstandingBalance: 180000,
      creditLimit: 200000,
      lastOrderDate: "2023-12-15"
    }
  ]

  const sampleOrders: Order[] = [
    { id: "ORD-101", date: "2024-01-10", amount: 45000, status: "completed", items: 3 },
    { id: "ORD-099", date: "2024-01-05", amount: 32000, status: "completed", items: 2 },
    { id: "ORD-095", date: "2023-12-28", amount: 67000, status: "pending", items: 4 },
    { id: "ORD-092", date: "2023-12-20", amount: 28000, status: "completed", items: 1 }
  ]

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    // Simulate API call
    setTimeout(() => {
      const filtered = sampleCustomers.filter(customer => {
        const searchLower = query.toLowerCase()
        switch (searchType) {
          case 'name':
            return customer.name.toLowerCase().includes(searchLower)
          case 'phone':
            return customer.phone.includes(query)
          case 'email':
            return customer.email.toLowerCase().includes(searchLower)
          default:
            return false
        }
      })
      setSearchResults(filtered)
      setIsSearching(false)
    }, 500)
  }

  useEffect(() => {
    handleSearch(searchQuery)
  }, [searchQuery, searchType])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-yellow-600 bg-yellow-100'
      case 'blocked': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCreditStatus = (customer: Customer) => {
    if (customer.status === 'blocked') return { status: 'blocked', message: t.creditWarning }
    if (customer.outstandingBalance >= customer.creditLimit) return { status: 'warning', message: t.creditWarning }
    if (customer.creditLimit - customer.outstandingBalance < 50000) return { status: 'caution', message: t.noCredit }
    return { status: 'good', message: t.goodStanding }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          {/* Search Type Selector */}
          <div className="flex space-x-2">
            <span className="text-sm font-medium text-gray-700 self-center">{t.searchBy}:</span>
            {(['name', 'phone', 'email'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  searchType === type
                    ? 'bg-teal-100 text-teal-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t[type]}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="mt-4">
              {isSearching ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t.searching}</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((customer) => (
                    <motion.div
                      key={customer.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedCustomer(customer)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{customer.name}</h3>
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(customer.status)}`}>
                            {t[customer.status as keyof typeof t]}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            {t.outstandingBalance}: {t.currency} {customer.outstandingBalance.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">{t.noResults}</p>
                  <p className="text-sm">{t.tryDifferent}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Customer Details */}
      {selectedCustomer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          {/* Customer Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                <p className="text-gray-600">{selectedCustomer.id}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedCustomer.status)}`}>
                  {t[selectedCustomer.status as keyof typeof t]}
                </span>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Customer Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.personalInfo}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">{t.phone}</p>
                      <p className="font-medium text-gray-900">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">{t.email}</p>
                      <p className="font-medium text-gray-900">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">{t.registrationDate}</p>
                      <p className="font-medium text-gray-900">{selectedCustomer.registrationDate}</p>
                    </div>
                  </div>
                  {selectedCustomer.lastOrderDate && (
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">{t.lastOrder}</p>
                        <p className="font-medium text-gray-900">{selectedCustomer.lastOrderDate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.financialInfo}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">{t.totalOrders}</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedCustomer.totalOrders}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">{t.totalSpent}</p>
                    <p className="text-lg font-bold text-green-900">
                      {t.currency} {selectedCustomer.totalSpent.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium">{t.outstandingBalance}</p>
                    <p className="text-lg font-bold text-orange-900">
                      {t.currency} {selectedCustomer.outstandingBalance.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">{t.creditLimit}</p>
                    <p className="text-lg font-bold text-purple-900">
                      {t.currency} {selectedCustomer.creditLimit.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Credit Status Alert */}
                {(() => {
                  const creditStatus = getCreditStatus(selectedCustomer)
                  if (creditStatus.status !== 'good') {
                    return (
                      <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${
                        creditStatus.status === 'blocked' || creditStatus.status === 'warning' 
                          ? 'bg-red-50 text-red-700' 
                          : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        <ExclamationTriangleIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{creditStatus.message}</span>
                      </div>
                    )
                  }
                  return (
                    <div className="mt-4 p-3 rounded-lg flex items-center space-x-2 bg-green-50 text-green-700">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">{creditStatus.message}</span>
                    </div>
                  )
                })()}
              </div>

              {/* Recent Orders */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.recentOrders}</h3>
                <div className="space-y-3">
                  {sampleOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{order.id}</p>
                        <p className="text-sm text-gray-600">{order.date} • {order.items} {t.items}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{t.currency} {order.amount.toLocaleString()}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getOrderStatusColor(order.status)}`}>
                          {t[order.status as keyof typeof t]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.quickActions}</h3>
              <div className="space-y-3">
                <button className="w-full bg-teal-500 hover:bg-teal-600 text-white p-4 rounded-lg transition-colors flex items-center space-x-3">
                  <PlusIcon className="w-5 h-5" />
                  <span>{t.createOrder}</span>
                </button>
                
                {selectedCustomer.outstandingBalance > 0 && (
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors flex items-center space-x-3">
                    <BanknotesIcon className="w-5 h-5" />
                    <span>{t.collectPayment}</span>
                  </button>
                )}
                
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors flex items-center space-x-3">
                  <EyeIcon className="w-5 h-5" />
                  <span>{t.viewHistory}</span>
                </button>
                
                <button className="w-full bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-lg transition-colors flex items-center space-x-3">
                  <UserIcon className="w-5 h-5" />
                  <span>{t.updateInfo}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
} 