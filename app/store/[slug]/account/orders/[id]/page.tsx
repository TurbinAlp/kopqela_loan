'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useBusiness } from '../../../../../contexts/BusinessContext'
import { useLanguage } from '../../../../../contexts/LanguageContext'
import {
  ChevronLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  PrinterIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

interface OrderItem {
  id: number
  name: string
  nameSwahili: string
  quantity: number
  price: number
  image: string
  category: string
}

interface Order {
  id: number
  orderNumber: string
  date: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  paymentMethod: string
  paymentStatus: 'paid' | 'partial' | 'pending'
  amountPaid: number
  amountDue: number
  deliveryAddress?: string
  estimatedDelivery?: string
  actualDelivery?: string
  customerInfo: {
    name: string
    phone: string
    email: string
  }
  specialInstructions?: string
  trackingUpdates: {
    date: string
    status: string
    description: string
  }[]
}

export default function OrderDetailsPage() {
  const params = useParams()
  const orderId = params?.id as string
  const { business } = useBusiness()
  const { language } = useLanguage()
  
  const [activeTab, setActiveTab] = useState('details')

  const translations = {
    en: {
      orderDetails: 'Order Details',
      backToOrders: 'Back to Orders',
      orderNumber: 'Order #',
      orderDate: 'Order Date',
      orderStatus: 'Status',
      paymentStatus: 'Payment Status',
      items: 'Items',
      payment: 'Payment',
      delivery: 'Delivery',
      tracking: 'Tracking',
      orderSummary: 'Order Summary',
      itemsOrdered: 'Items Ordered',
      paymentInformation: 'Payment Information',
      deliveryInformation: 'Delivery Information',
      customerInformation: 'Customer Information',
      trackingInformation: 'Tracking Information',
      subtotal: 'Subtotal',
      deliveryFee: 'Delivery Fee',
      tax: 'Tax',
      total: 'Total',
      amountPaid: 'Amount Paid',
      amountDue: 'Amount Due',
      paymentMethod: 'Payment Method',
      deliveryAddress: 'Delivery Address',
      estimatedDelivery: 'Estimated Delivery',
      actualDelivery: 'Actual Delivery',
      specialInstructions: 'Special Instructions',
      customerName: 'Customer Name',
      phoneNumber: 'Phone Number',
      emailAddress: 'Email Address',
      trackingUpdates: 'Tracking Updates',
      noInstructions: 'No special instructions provided',
      noTracking: 'No tracking updates available',
      downloadReceipt: 'Download Receipt',
      printReceipt: 'Print Receipt',
      shareOrder: 'Share Order',
      reorderItems: 'Reorder Items',
      contactSupport: 'Contact Support',
      cancelOrder: 'Cancel Order',
      quantity: 'Qty',
      price: 'Price',
      lineTotal: 'Line Total',
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      paid: 'Paid',
      partial: 'Partial Payment',
      paymentPending: 'Payment Pending',
      cash: 'Cash',
      card: 'Card',
      mobileMoney: 'Mobile Money',
      credit: 'Credit',
      partialPayment: 'Partial Payment',
      free: 'Free',
      pickup: 'Store Pickup',
      homeDelivery: 'Home Delivery'
    },
    sw: {
      orderDetails: 'Maelezo ya Oda',
      backToOrders: 'Rudi Oda',
      orderNumber: 'Oda #',
      orderDate: 'Tarehe ya Oda',
      orderStatus: 'Hali',
      paymentStatus: 'Hali ya Malipo',
      items: 'Bidhaa',
      payment: 'Malipo',
      delivery: 'Ufikiaji',
      tracking: 'Ufuatiliaji',
      orderSummary: 'Muhtasari wa Oda',
      itemsOrdered: 'Bidhaa Zilizodalilwa',
      paymentInformation: 'Taarifa za Malipo',
      deliveryInformation: 'Taarifa za Ufikiaji',
      customerInformation: 'Taarifa za Mteja',
      trackingInformation: 'Taarifa za Ufuatiliaji',
      subtotal: 'Jumla ya Awali',
      deliveryFee: 'Ada ya Ufikiaji',
      tax: 'Kodi',
      total: 'Jumla',
      amountPaid: 'Kiasi Kilicholipwa',
      amountDue: 'Kiasi Kinachostahili',
      paymentMethod: 'Njia ya Malipo',
      deliveryAddress: 'Anwani ya Ufikiaji',
      estimatedDelivery: 'Mkadiriaji wa Ufikiaji',
      actualDelivery: 'Ufikiaji Halisi',
      specialInstructions: 'Maelezo Maalum',
      customerName: 'Jina la Mteja',
      phoneNumber: 'Nambari ya Simu',
      emailAddress: 'Anwani ya Barua Pepe',
      trackingUpdates: 'Visasisho vya Ufuatiliaji',
      noInstructions: 'Hakuna maelezo maalum yaliyotolewa',
      noTracking: 'Hakuna visasisho vya ufuatiliaji',
      downloadReceipt: 'Pakua Risiti',
      printReceipt: 'Chapisha Risiti',
      shareOrder: 'Shiriki Oda',
      reorderItems: 'Oda Tena',
      contactSupport: 'Wasiliana na Msaada',
      cancelOrder: 'Ghairi Oda',
      quantity: 'Kiwango',
      price: 'Bei',
      lineTotal: 'Jumla ya Mstari',
      pending: 'Inasubiri',
      confirmed: 'Imethibitishwa',
      processing: 'Inachakatwa',
      shipped: 'Imetumwa',
      delivered: 'Imepokelewa',
      cancelled: 'Imeghairiwa',
      paid: 'Imelipwa',
      partial: 'Malipo ya Sehemu',
      paymentPending: 'Malipo Yanasubiri',
      cash: 'Pesa Taslimu',
      card: 'Kadi',
      mobileMoney: 'Pesa za Simu',
      credit: 'Deni',
      partialPayment: 'Malipo ya Sehemu',
      free: 'Bure',
      pickup: 'Kuchukua Dukani',
      homeDelivery: 'Ufikiaji Nyumbani'
    }
  }

  const t = translations[language]

  // Generate sample order based on business type and order ID
  const order: Order | null = useMemo(() => {
    if (!business || !orderId) return null
    
    const generateOrderItems = (businessType: string): OrderItem[] => {
      if (businessType === 'Electronics') {
        return [
          {
            id: 1,
            name: 'iPhone 15 Pro',
            nameSwahili: 'iPhone 15 Pro',
            quantity: 1,
            price: 1200000,
            image: '/images/products/iphone.jpg',
            category: 'Smartphones'
          },
          {
            id: 2,
            name: 'AirPods Pro',
            nameSwahili: 'AirPods Pro',
            quantity: 2,
            price: 280000,
            image: '/images/products/airpods.jpg',
            category: 'Audio'
          },
          {
            id: 3,
            name: 'iPhone Case',
            nameSwahili: 'Kifuniko cha iPhone',
            quantity: 1,
            price: 35000,
            image: '/images/products/case.jpg',
            category: 'Accessories'
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
            image: '/images/products/dress.jpg',
            category: 'Dresses'
          },
          {
            id: 2,
            name: 'Designer Shoes',
            nameSwahili: 'Viatu vya Kisanifu',
            quantity: 1,
            price: 85000,
            image: '/images/products/shoes.jpg',
            category: 'Footwear'
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
            image: '/images/products/rice.jpg',
            category: 'Grains'
          },
          {
            id: 2,
            name: 'Cooking Oil 2L',
            nameSwahili: 'Mafuta ya Kupikia Lita 2',
            quantity: 3,
            price: 8500,
            image: '/images/products/oil.jpg',
            category: 'Cooking'
          },
          {
            id: 3,
            name: 'Sugar 1kg',
            nameSwahili: 'Sukari Kilo 1',
            quantity: 1,
            price: 3500,
            image: '/images/products/sugar.jpg',
            category: 'Sweeteners'
          }
        ]
      }
    }

    const items = generateOrderItems(business.businessType)
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const deliveryFee = orderId === '1' ? 0 : 5000
    const tax = Math.round(subtotal * 0.18)
    const total = subtotal + deliveryFee + tax

    return {
      id: parseInt(orderId),
      orderNumber: `ORD-2024-${orderId.padStart(3, '0')}`,
      date: '2024-01-20',
      status: orderId === '1' ? 'delivered' : orderId === '2' ? 'processing' : 'shipped',
      items,
      subtotal,
      deliveryFee,
      tax,
      total,
      paymentMethod: orderId === '1' ? 'card' : orderId === '2' ? 'partial' : 'cash',
      paymentStatus: orderId === '1' ? 'paid' : orderId === '2' ? 'partial' : 'paid',
      amountPaid: orderId === '2' ? Math.round(total * 0.6) : total,
      amountDue: orderId === '2' ? Math.round(total * 0.4) : 0,
      deliveryAddress: orderId === '1' ? undefined : '123 Market Street, Dar es Salaam, Tanzania',
      estimatedDelivery: '2024-01-25',
      actualDelivery: orderId === '1' ? '2024-01-22' : undefined,
      customerInfo: {
        name: 'John Mwalimu',
        phone: '+255 712 345 678',
        email: 'john.mwalimu@example.com'
      },
      specialInstructions: orderId === '1' ? undefined : 'Please call before delivery. Building has security.',
      trackingUpdates: [
        {
          date: '2024-01-20',
          status: 'Order Confirmed',
          description: 'Your order has been confirmed and is being prepared.'
        },
        {
          date: '2024-01-21',
          status: 'Processing',
          description: 'Items are being packed and prepared for shipment.'
        },
        ...(orderId !== '2' ? [{
          date: '2024-01-22',
          status: 'Shipped',
          description: 'Your order has been shipped and is on the way.'
        }] : []),
        ...(orderId === '1' ? [{
          date: '2024-01-22',
          status: 'Delivered',
          description: 'Order successfully delivered to customer.'
        }] : [])
      ]
    }
  }, [business, orderId])

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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



  if (!business || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your order details.</p>
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
                href={`/store/${business.slug}/account/orders`}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                {t.backToOrders}
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t.orderNumber}{order.orderNumber}
                </h1>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {t[order.status as keyof typeof t]}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {t[order.paymentStatus === 'pending' ? 'paymentPending' : order.paymentStatus as keyof typeof t]}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                {t.downloadReceipt}
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <PrinterIcon className="w-4 h-4 mr-2" />
                {t.printReceipt}
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ShareIcon className="w-4 h-4 mr-2" />
                {t.shareOrder}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'details', label: t.items },
              { id: 'payment', label: t.payment },
              { id: 'delivery', label: t.delivery },
              { id: 'tracking', label: t.tracking }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Tab */}
            {activeTab === 'details' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">{t.itemsOrdered}</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-xs">IMG</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-medium text-gray-900">
                            {language === 'sw' ? item.nameSwahili : item.name}
                          </h4>
                          <p className="text-sm text-gray-600">{item.category}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className="text-gray-600">{t.quantity}: {item.quantity}</span>
                            <span className="text-gray-600">{t.price}: {formatPrice(item.price)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold" style={{ color: business.primaryColor }}>
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-600">{t.lineTotal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">{t.paymentInformation}</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">{t.paymentMethod}</h4>
                      <div className="flex items-center space-x-3">
                        <CreditCardIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">
                          {t[order.paymentMethod as keyof typeof t] || order.paymentMethod}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">{t.paymentStatus}</h4>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {t[order.paymentStatus === 'pending' ? 'paymentPending' : order.paymentStatus as keyof typeof t]}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t.amountPaid}</span>
                        <span className="font-medium text-gray-900">{formatPrice(order.amountPaid)}</span>
                      </div>
                      {order.amountDue > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t.amountDue}</span>
                          <span className="font-medium text-red-600">{formatPrice(order.amountDue)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Tab */}
            {activeTab === 'delivery' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">{t.deliveryInformation}</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {order.deliveryAddress ? (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">{t.deliveryAddress}</h4>
                        <div className="flex items-start space-x-3">
                          <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                          <span className="text-gray-900">{order.deliveryAddress}</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Delivery Method</h4>
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-900">{t.pickup}</span>
                          <span className="text-sm text-gray-600">({t.free})</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">{t.estimatedDelivery}</h4>
                        <div className="flex items-center space-x-3">
                          <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{order.estimatedDelivery ? formatDate(order.estimatedDelivery) : 'TBD'}</span>
                        </div>
                      </div>
                      {order.actualDelivery && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">{t.actualDelivery}</h4>
                          <div className="flex items-center space-x-3">
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                            <span className="text-gray-900">{formatDate(order.actualDelivery)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {order.specialInstructions && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">{t.specialInstructions}</h4>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {order.specialInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tracking Tab */}
            {activeTab === 'tracking' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">{t.trackingInformation}</h3>
                </div>
                <div className="p-6">
                  {order.trackingUpdates.length > 0 ? (
                    <div className="space-y-4">
                      {order.trackingUpdates.map((update, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900">{update.status}</h4>
                              <span className="text-sm text-gray-600">{formatDate(update.date)}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{update.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">{t.noTracking}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">{t.orderSummary}</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.subtotal}</span>
                    <span className="font-medium text-gray-900">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.deliveryFee}</span>
                    <span className="font-medium text-gray-900">
                      {order.deliveryFee === 0 ? t.free : formatPrice(order.deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.tax}</span>
                    <span className="font-medium text-gray-900">{formatPrice(order.tax)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <span className="text-lg font-semibold text-gray-900">{t.total}</span>
                    <span className="text-lg font-bold" style={{ color: business.primaryColor }}>
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">{t.customerInformation}</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {order.customerInfo.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{order.customerInfo.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{order.customerInfo.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{order.customerInfo.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="space-y-3">
                  {order.status === 'delivered' && order.paymentStatus === 'paid' && (
                    <Link
                      href={`/store/${business.slug}/products`}
                      className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: business.primaryColor }}
                    >
                      <ArrowPathIcon className="w-4 h-4 mr-2" />
                      {t.reorderItems}
                    </Link>
                  )}
                  
                  <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    {t.contactSupport}
                  </button>

                  {order.status === 'pending' && (
                    <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                      <XCircleIcon className="w-4 h-4 mr-2" />
                      {t.cancelOrder}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 