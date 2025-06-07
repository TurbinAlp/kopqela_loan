'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useBusiness } from '../../../contexts/BusinessContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import {
  UserCircleIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { UserCircleIcon as UserCircleIconSolid } from '@heroicons/react/24/solid'

interface CustomerProfile {
  id: number
  name: string
  email: string
  phone: string
  address: string
  joinDate: string
  avatar?: string
}

interface Order {
  id: number
  orderNumber: string
  date: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: Array<{
    id: number
    name: string
    nameSwahili: string
    quantity: number
    price: number
    image: string
  }>
  total: number
  paymentMethod: string
}

interface Payment {
  id: number
  date: string
  amount: number
  method: string
  reference: string
  orderId: number
  status: 'completed' | 'pending' | 'failed'
}

interface OutstandingBalance {
  id: number
  orderNumber: string
  originalAmount: number
  paidAmount: number
  remainingAmount: number
  dueDate: string
  status: 'current' | 'overdue'
  paymentMethod: string
}

export default function CustomerAccountPage() {
  const { business } = useBusiness()
  const { language } = useLanguage()
  
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'payments' | 'balances'>('profile')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState<CustomerProfile>({
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+255 123 456 789',
    address: '123 Market Street, Dar es Salaam',
    joinDate: '2024-01-15'
  })

  const translations = {
    en: {
      customerAccount: 'My Account',
      profile: 'Profile',
      orders: 'Order History',
      payments: 'Payment History',
      balances: 'Outstanding Balances',
      editProfile: 'Edit Profile',
      saveProfile: 'Save Changes',
      cancelEdit: 'Cancel',
      personalInfo: 'Personal Information',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      address: 'Address',
      memberSince: 'Member Since',
      noOrders: 'No Orders Yet',
      noOrdersDesc: 'You haven\'t placed any orders with this store yet.',
      browseProducts: 'Browse Products',
      orderNumber: 'Order #',
      orderDate: 'Order Date',
      orderStatus: 'Status',
      orderTotal: 'Total',
      viewOrder: 'View Details',
      reorder: 'Reorder',
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      items: 'items',
      noPayments: 'No Payment History',
      noPaymentsDesc: 'No payment records found for this store.',
      paymentDate: 'Payment Date',
      amount: 'Amount',
      method: 'Method',
      reference: 'Reference',
      status: 'Status',
      downloadReceipt: 'Download Receipt',
      completed: 'Completed',
      failed: 'Failed',
      cash: 'Cash',
      card: 'Card',
      mobileMoney: 'Mobile Money',
      credit: 'Credit',
      partial: 'Partial Payment',
      noBalances: 'No Outstanding Balances',
      noBalancesDesc: 'You have no outstanding balances with this store.',
      originalAmount: 'Original Amount',
      paidAmount: 'Paid Amount',
      remainingAmount: 'Remaining Amount',
      dueDate: 'Due Date',
      payNow: 'Pay Now',
      current: 'Current',
      overdue: 'Overdue',
      downloadStatement: 'Download Statement',
      enterName: 'Enter your full name',
      enterEmail: 'Enter your email address',
      enterPhone: 'Enter your phone number',
      enterAddress: 'Enter your address'
    },
    sw: {
      customerAccount: 'Akaunti Yangu',
      profile: 'Wasifu',
      orders: 'Historia ya Oda',
      payments: 'Historia ya Malipo',
      balances: 'Deni Lililobaki',
      editProfile: 'Hariri Wasifu',
      saveProfile: 'Hifadhi Mabadiliko',
      cancelEdit: 'Ghairi',
      personalInfo: 'Taarifa za Binafsi',
      name: 'Jina Kamili',
      email: 'Barua Pepe',
      phone: 'Nambari ya Simu',
      address: 'Anwani',
      memberSince: 'Mwanachama Tangu',
      noOrders: 'Hakuna Oda Bado',
      noOrdersDesc: 'Bado hujaweka oda yoyote katika duka hili.',
      browseProducts: 'Tazama Bidhaa',
      orderNumber: 'Oda #',
      orderDate: 'Tarehe ya Oda',
      orderStatus: 'Hali',
      orderTotal: 'Jumla',
      viewOrder: 'Ona Maelezo',
      reorder: 'Oda Tena',
      pending: 'Inasubiri',
      confirmed: 'Imethibitishwa',
      processing: 'Inachakatwa',
      shipped: 'Imetumwa',
      delivered: 'Imepokelewa',
      cancelled: 'Imeghairiwa',
      items: 'bidhaa',
      noPayments: 'Hakuna Historia ya Malipo',
      noPaymentsDesc: 'Hakuna rekodi za malipo zilizopatikana kwa duka hili.',
      paymentDate: 'Tarehe ya Malipo',
      amount: 'Kiasi',
      method: 'Njia',
      reference: 'Rejea',
      status: 'Hali',
      downloadReceipt: 'Pakua Risiti',
      completed: 'Imekamilika',
      failed: 'Imeshindwa',
      cash: 'Pesa Taslimu',
      card: 'Kadi',
      mobileMoney: 'Pesa za Simu',
      credit: 'Deni',
      partial: 'Malipo ya Sehemu',
      noBalances: 'Hakuna Deni Lililobaki',
      noBalancesDesc: 'Huna deni lolote lililobaki na duka hili.',
      originalAmount: 'Kiasi cha Asili',
      paidAmount: 'Kiasi Kilicholipwa',
      remainingAmount: 'Kiasi Kilichobaki',
      dueDate: 'Tarehe ya Mwisho',
      payNow: 'Lipa Sasa',
      current: 'Sasa',
      overdue: 'Kimechelewa',
      downloadStatement: 'Pakua Taarifa',
      enterName: 'Ingiza jina lako kamili',
      enterEmail: 'Ingiza barua pepe yako',
      enterPhone: 'Ingiza nambari yako ya simu',
      enterAddress: 'Ingiza anwani yako'
    }
  }

  const t = translations[language]

  // Sample data generation based on business type
  const sampleOrders: Order[] = useMemo(() => {
    if (!business) return []
    
    const baseOrders = [
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        date: '2024-01-20',
        status: 'delivered' as const,
        total: business.businessType === 'Electronics' ? 1200000 : business.businessType === 'Fashion & Clothing' ? 85000 : 25000,
        paymentMethod: 'card'
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-002',
        date: '2024-01-18',
        status: 'processing' as const,
        total: business.businessType === 'Electronics' ? 280000 : business.businessType === 'Fashion & Clothing' ? 65000 : 15000,
        paymentMethod: 'partial'
      },
      {
        id: 3,
        orderNumber: 'ORD-2024-003',
        date: '2024-01-15',
        status: 'cancelled' as const,
        total: business.businessType === 'Electronics' ? 950000 : business.businessType === 'Fashion & Clothing' ? 45000 : 35000,
        paymentMethod: 'credit'
      }
    ]

    return baseOrders.map(order => ({
      ...order,
      items: generateOrderItems(business.businessType)
    }))
  }, [business])

  const samplePayments: Payment[] = useMemo(() => [
    {
      id: 1,
      date: '2024-01-20',
      amount: sampleOrders[0]?.total || 100000,
      method: 'card',
      reference: 'TXN-001-2024',
      orderId: 1,
      status: 'completed'
    },
    {
      id: 2,
      date: '2024-01-18',
      amount: (sampleOrders[1]?.total || 100000) * 0.5,
      method: 'cash',
      reference: 'TXN-002-2024',
      orderId: 2,
      status: 'completed'
    }
  ], [sampleOrders])

  const sampleBalances: OutstandingBalance[] = useMemo(() => [
    {
      id: 1,
      orderNumber: 'ORD-2024-002',
      originalAmount: sampleOrders[1]?.total || 100000,
      paidAmount: (sampleOrders[1]?.total || 100000) * 0.5,
      remainingAmount: (sampleOrders[1]?.total || 100000) * 0.5,
      dueDate: '2024-02-18',
      status: 'current',
      paymentMethod: 'partial'
    }
  ], [sampleOrders])

  function generateOrderItems(businessType: string) {
    if (businessType === 'Electronics') {
      return [
        {
          id: 1,
          name: 'iPhone 15 Pro',
          nameSwahili: 'iPhone 15 Pro',
          quantity: 1,
          price: 1200000,
          image: '/images/products/iphone.jpg'
        }
      ]
    } else if (businessType === 'Fashion & Clothing') {
      return [
        {
          id: 1,
          name: 'Elegant Dress',
          nameSwahili: 'Nguo ya Kifahari',
          quantity: 1,
          price: 65000,
          image: '/images/products/dress.jpg'
        }
      ]
    } else {
      return [
        {
          id: 1,
          name: 'Rice 5kg',
          nameSwahili: 'Mchele Kilo 5',
          quantity: 2,
          price: 12000,
          image: '/images/products/rice.jpg'
        }
      ]
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-TZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
      case 'current':
        return 'bg-green-100 text-green-800'
      case 'processing':
      case 'confirmed':
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'overdue':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleProfileSave = () => {
    // In a real app, this would save to backend
    setEditingProfile(false)
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your account information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.customerAccount}</h1>
              <p className="text-gray-600">
                Manage your profile and view your activity with {business.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/store/${business.slug}`}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center mb-6">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <UserCircleIconSolid className="w-16 h-16 text-gray-400" />
                )}
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{profileData.name}</h3>
                  <p className="text-sm text-gray-600">{profileData.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'profile', label: t.profile, icon: UserCircleIcon },
                  { id: 'orders', label: t.orders, icon: ShoppingBagIcon },
                  { id: 'payments', label: t.payments, icon: CreditCardIcon },
                  { id: 'balances', label: t.balances, icon: ExclamationTriangleIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'profile' | 'orders' | 'payments' | 'balances')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: activeTab === tab.id ? business.primaryColor : undefined
                    }}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">{t.personalInfo}</h2>
                  {!editingProfile ? (
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: business.primaryColor }}
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      {t.editProfile}
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleProfileSave}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: business.primaryColor }}
                      >
                        {t.saveProfile}
                      </button>
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {t.cancelEdit}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.name}
                    </label>
                    {editingProfile ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder={t.enterName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-600 font-normal">{profileData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.email}
                    </label>
                    {editingProfile ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        placeholder={t.enterEmail}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-600 font-normal">{profileData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.phone}
                    </label>
                    {editingProfile ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder={t.enterPhone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-600 font-normal">{profileData.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.memberSince}
                    </label>
                    <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-600 font-normal">{formatDate(profileData.joinDate)}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.address}
                    </label>
                    {editingProfile ? (
                      <textarea
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        placeholder={t.enterAddress}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-600 font-normal">{profileData.address}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.orders}</h2>
                
                {sampleOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noOrders}</h3>
                    <p className="text-gray-600 mb-6">{t.noOrdersDesc}</p>
                    <Link
                      href={`/store/${business.slug}/products`}
                      className="inline-flex items-center px-6 py-3 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: business.primaryColor }}
                    >
                      {t.browseProducts}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sampleOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {t.orderNumber}{order.orderNumber}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(order.date)} • {order.items.length} {t.items}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold" style={{ color: business.primaryColor }}>
                              {formatPrice(order.total)}
                            </p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {t[order.status as keyof typeof t] || order.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                              Payment: {t[order.paymentMethod as keyof typeof t] || order.paymentMethod}
                            </span>
                          </div>
                          <div className="flex space-x-3">
                            <button className="flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                              <EyeIcon className="w-4 h-4 mr-2" />
                              {t.viewOrder}
                            </button>
                            {order.status === 'delivered' && (
                              <button
                                className="flex items-center px-3 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: business.primaryColor }}
                              >
                                {t.reorder}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">{t.payments}</h2>
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    {t.downloadStatement}
                  </button>
                </div>

                {samplePayments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noPayments}</h3>
                    <p className="text-gray-600">{t.noPaymentsDesc}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">{t.paymentDate}</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">{t.amount}</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">{t.method}</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">{t.reference}</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">{t.status}</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {samplePayments.map((payment) => (
                          <tr key={payment.id} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-gray-600 font-normal">{formatDate(payment.date)}</td>
                            <td className="py-3 px-4 text-gray-900 font-semibold">{formatPrice(payment.amount)}</td>
                            <td className="py-3 px-4 text-gray-600 font-normal">{t[payment.method as keyof typeof t] || payment.method}</td>
                            <td className="py-3 px-4 text-gray-600 font-normal">{payment.reference}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                {t[payment.status as keyof typeof t] || payment.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button className="flex items-center px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                                <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                                {t.downloadReceipt}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'balances' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.balances}</h2>

                {sampleBalances.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noBalances}</h3>
                    <p className="text-gray-600">{t.noBalancesDesc}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sampleBalances.map((balance) => (
                      <div key={balance.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {t.orderNumber}{balance.orderNumber}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {t.dueDate}: {formatDate(balance.dueDate)}
                            </p>
                          </div>
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(balance.status)}`}>
                            {t[balance.status as keyof typeof t] || balance.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">{t.originalAmount}</p>
                            <p className="text-lg font-semibold text-gray-900">{formatPrice(balance.originalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{t.paidAmount}</p>
                            <p className="text-lg font-semibold text-green-600">{formatPrice(balance.paidAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{t.remainingAmount}</p>
                            <p className="text-xl font-bold text-red-600">{formatPrice(balance.remainingAmount)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Payment Method: {t[balance.paymentMethod as keyof typeof t] || balance.paymentMethod}
                          </span>
                          <button
                            className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: business.primaryColor }}
                          >
                            {t.payNow}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 