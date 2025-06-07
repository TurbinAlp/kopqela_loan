'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useBusiness } from '../../../../contexts/BusinessContext'
import { useLanguage } from '../../../../contexts/LanguageContext'
import {
  ShoppingBagIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface OrderItem {
  id: number
  name: string
  nameSwahili: string
  quantity: number
  price: number
  image: string
}

interface Order {
  id: number
  orderNumber: string
  date: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  total: number
  paymentMethod: string
  paymentStatus: 'paid' | 'partial' | 'pending'
  deliveryAddress?: string
  estimatedDelivery?: string
}

export default function OrderHistoryPage() {
  const { business } = useBusiness()
  const { language } = useLanguage()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  const translations = {
    en: {
      orderHistory: 'Order History',
      backToAccount: 'Back to Account',
      searchPlaceholder: 'Search orders by number or items...',
      filters: 'Filters',
      clearFilters: 'Clear All',
      allOrders: 'All Orders',
      orderStatus: 'Order Status',
      paymentStatus: 'Payment Status',
      dateRange: 'Date Range',
      from: 'From',
      to: 'To',
      sortBy: 'Sort By',
      newest: 'Newest First',
      oldest: 'Oldest First',
      highestAmount: 'Highest Amount',
      lowestAmount: 'Lowest Amount',
      ordersFound: 'orders found',
      noOrders: 'No Orders Found',
      noOrdersDesc: 'No orders match your current filters.',
      adjustFilters: 'Try adjusting your filters or search terms.',
      orderNumber: 'Order #',
      orderDate: 'Order Date',
      orderTotal: 'Total',
      items: 'items',
      viewDetails: 'View Details',
      reorder: 'Reorder',
      downloadReceipt: 'Download Receipt',
      trackOrder: 'Track Order',
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      paid: 'Paid',
      partial: 'Partial',
      paymentPending: 'Payment Pending',
      cash: 'Cash',
      card: 'Card',
      mobileMoney: 'Mobile Money',
      credit: 'Credit',
      partialPayment: 'Partial Payment',
      estimatedDelivery: 'Estimated Delivery',
      deliveryAddress: 'Delivery Address',
      allStatuses: 'All Statuses',
      allPayments: 'All Payments'
    },
    sw: {
      orderHistory: 'Historia ya Oda',
      backToAccount: 'Rudi Akaunti',
      searchPlaceholder: 'Tafuta oda kwa nambari au bidhaa...',
      filters: 'Vichujio',
      clearFilters: 'Futa Vyote',
      allOrders: 'Oda Zote',
      orderStatus: 'Hali ya Oda',
      paymentStatus: 'Hali ya Malipo',
      dateRange: 'Muda',
      from: 'Kutoka',
      to: 'Hadi',
      sortBy: 'Panga Kwa',
      newest: 'Mpya Kwanza',
      oldest: 'Za Zamani Kwanza',
      highestAmount: 'Kiasi Kikubwa',
      lowestAmount: 'Kiasi Kidogo',
      ordersFound: 'oda zimepatikana',
      noOrders: 'Hakuna Oda Zilizopatikana',
      noOrdersDesc: 'Hakuna oda zinazolingana na vichujio vyako.',
      adjustFilters: 'Jaribu kubadilisha vichujio au masharti ya utafutaji.',
      orderNumber: 'Oda #',
      orderDate: 'Tarehe ya Oda',
      orderTotal: 'Jumla',
      items: 'bidhaa',
      viewDetails: 'Ona Maelezo',
      reorder: 'Oda Tena',
      downloadReceipt: 'Pakua Risiti',
      trackOrder: 'Fuatilia Oda',
      pending: 'Inasubiri',
      confirmed: 'Imethibitishwa',
      processing: 'Inachakatwa',
      shipped: 'Imetumwa',
      delivered: 'Imepokelewa',
      cancelled: 'Imeghairiwa',
      paid: 'Imelipwa',
      partial: 'Sehemu',
      paymentPending: 'Malipo Yanasubiri',
      cash: 'Pesa Taslimu',
      card: 'Kadi',
      mobileMoney: 'Pesa za Simu',
      credit: 'Deni',
      partialPayment: 'Malipo ya Sehemu',
      estimatedDelivery: 'Mkadiriaji wa Ufikiaji',
      deliveryAddress: 'Anwani ya Ufikiaji',
      allStatuses: 'Hali Zote',
      allPayments: 'Malipo Yote'
    }
  }

  const t = translations[language]

  // Generate sample orders based on business type
  const sampleOrders: Order[] = useMemo(() => {
    if (!business) return []
    
    const generateOrderItems = (businessType: string, orderId: number): OrderItem[] => {
      if (businessType === 'Electronics') {
        return [
          {
            id: 1,
            name: 'iPhone 15 Pro',
            nameSwahili: 'iPhone 15 Pro',
            quantity: 1,
            price: 1200000,
            image: '/images/products/iphone.jpg'
          },
          {
            id: 2,
            name: 'AirPods Pro',
            nameSwahili: 'AirPods Pro',
            quantity: orderId === 1 ? 2 : 1,
            price: 280000,
            image: '/images/products/airpods.jpg'
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
          },
          {
            id: 2,
            name: 'Designer Shoes',
            nameSwahili: 'Viatu vya Kisanifu',
            quantity: 1,
            price: 85000,
            image: '/images/products/shoes.jpg'
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
          },
          {
            id: 2,
            name: 'Cooking Oil 2L',
            nameSwahili: 'Mafuta ya Kupikia Lita 2',
            quantity: 3,
            price: 8500,
            image: '/images/products/oil.jpg'
          }
        ]
      }
    }

    const baseOrders = [
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        date: '2024-01-20',
        status: 'delivered' as const,
        paymentMethod: 'card',
        paymentStatus: 'paid' as const,
        deliveryAddress: '123 Market Street, Dar es Salaam',
        estimatedDelivery: '2024-01-22'
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-002',
        date: '2024-01-18',
        status: 'processing' as const,
        paymentMethod: 'partial',
        paymentStatus: 'partial' as const,
        deliveryAddress: '456 Uhuru Street, Dar es Salaam',
        estimatedDelivery: '2024-01-25'
      },
      {
        id: 3,
        orderNumber: 'ORD-2024-003',
        date: '2024-01-15',
        status: 'cancelled' as const,
        paymentMethod: 'credit',
        paymentStatus: 'pending' as const
      },
      {
        id: 4,
        orderNumber: 'ORD-2024-004',
        date: '2024-01-12',
        status: 'shipped' as const,
        paymentMethod: 'cash',
        paymentStatus: 'paid' as const,
        deliveryAddress: '789 Independence Ave, Dar es Salaam',
        estimatedDelivery: '2024-01-20'
      },
      {
        id: 5,
        orderNumber: 'ORD-2024-005',
        date: '2024-01-10',
        status: 'confirmed' as const,
        paymentMethod: 'mobileMoney',
        paymentStatus: 'paid' as const,
        deliveryAddress: '321 Mwenge Road, Dar es Salaam',
        estimatedDelivery: '2024-01-18'
      }
    ]

    return baseOrders.map(order => {
      const items = generateOrderItems(business.businessType, order.id)
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        ...order,
        items,
        total
      }
    })
  }, [business])

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    const filtered = sampleOrders.filter(order => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesNumber = order.orderNumber.toLowerCase().includes(searchLower)
        const matchesItems = order.items.some(item => 
          item.name.toLowerCase().includes(searchLower) ||
          item.nameSwahili.toLowerCase().includes(searchLower)
        )
        if (!matchesNumber && !matchesItems) return false
      }

      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) return false

      // Payment filter
      if (paymentFilter !== 'all' && order.paymentStatus !== paymentFilter) return false

      // Date range filter
      if (dateRange.from && new Date(order.date) < new Date(dateRange.from)) return false
      if (dateRange.to && new Date(order.date) > new Date(dateRange.to)) return false

      return true
    })

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'highestAmount':
          return b.total - a.total
        case 'lowestAmount':
          return a.total - b.total
        case 'newest':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })

    return filtered
  }, [sampleOrders, searchQuery, statusFilter, paymentFilter, dateRange, sortBy])

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
        return 'bg-green-100 text-green-800'
      case 'processing':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return CheckCircleIcon
      case 'processing':
      case 'confirmed':
        return ClockIcon
      case 'shipped':
        return TruckIcon
      case 'cancelled':
        return XCircleIcon
      default:
        return ClockIcon
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPaymentFilter('all')
    setDateRange({ from: '', to: '' })
    setSortBy('newest')
  }

  const canReorder = (order: Order) => {
    return order.status === 'delivered' && order.paymentStatus === 'paid'
  }

  const canTrack = (order: Order) => {
    return ['confirmed', 'processing', 'shipped'].includes(order.status)
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your order history.</p>
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
            <div className="flex items-center">
              <Link
                href={`/store/${business.slug}/account`}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                {t.backToAccount}
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.orderHistory}</h1>
                <p className="text-gray-600">
                  {filteredAndSortedOrders.length} {t.ordersFound}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t.filters}</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  {t.clearFilters}
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Orders
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Order Status Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.orderStatus}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal"
                >
                  <option value="all">{t.allStatuses}</option>
                  <option value="pending">{t.pending}</option>
                  <option value="confirmed">{t.confirmed}</option>
                  <option value="processing">{t.processing}</option>
                  <option value="shipped">{t.shipped}</option>
                  <option value="delivered">{t.delivered}</option>
                  <option value="cancelled">{t.cancelled}</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.paymentStatus}
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal"
                >
                  <option value="all">{t.allPayments}</option>
                  <option value="paid">{t.paid}</option>
                  <option value="partial">{t.partial}</option>
                  <option value="pending">{t.paymentPending}</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.dateRange}
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    placeholder={t.from}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal"
                  />
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    placeholder={t.to}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.sortBy}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal"
                >
                  <option value="newest">{t.newest}</option>
                  <option value="oldest">{t.oldest}</option>
                  <option value="highestAmount">{t.highestAmount}</option>
                  <option value="lowestAmount">{t.lowestAmount}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="w-5 h-5 mr-2" />
                {t.filters}
              </button>
            </div>

            {filteredAndSortedOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noOrders}</h3>
                <p className="text-gray-600 mb-4">{t.noOrdersDesc}</p>
                <p className="text-sm text-gray-500">{t.adjustFilters}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredAndSortedOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status)
                  
                  return (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      {/* Order Header */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-center mb-4 lg:mb-0">
                            <div className="flex items-center">
                              <StatusIcon className="w-6 h-6 text-gray-400 mr-3" />
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {t.orderNumber}{order.orderNumber}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {formatDate(order.date)} • {order.items.length} {t.items}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col lg:items-end space-y-2">
                            <div className="text-right">
                              <p className="text-2xl font-bold" style={{ color: business.primaryColor }}>
                                {formatPrice(order.total)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {t[order.paymentMethod as keyof typeof t] || order.paymentMethod}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                {t[order.status as keyof typeof t]}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                                {t[order.paymentStatus === 'pending' ? 'paymentPending' : order.paymentStatus as keyof typeof t]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-500 text-xs">IMG</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {language === 'sw' ? item.nameSwahili : item.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Qty: {item.quantity} • {formatPrice(item.price)}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="flex items-center justify-center text-sm text-gray-500">
                              +{order.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery Info */}
                      {order.deliveryAddress && (
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">{t.deliveryAddress}:</span>
                              <p className="text-gray-600 mt-1">{order.deliveryAddress}</p>
                            </div>
                            {order.estimatedDelivery && (
                              <div>
                                <span className="font-medium text-gray-700">{t.estimatedDelivery}:</span>
                                <p className="text-gray-600 mt-1">{formatDate(order.estimatedDelivery)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Order Actions */}
                      <div className="p-6">
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`/store/${business.slug}/account/orders/${order.id}`}
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <EyeIcon className="w-4 h-4 mr-2" />
                            {t.viewDetails}
                          </Link>

                          {canTrack(order) && (
                            <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                              <TruckIcon className="w-4 h-4 mr-2" />
                              {t.trackOrder}
                            </button>
                          )}

                          {canReorder(order) && (
                            <Link
                              href={`/store/${business.slug}/products`}
                              className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: business.primaryColor }}
                            >
                              <ArrowPathIcon className="w-4 h-4 mr-2" />
                              {t.reorder}
                            </Link>
                          )}

                          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                            {t.downloadReceipt}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 