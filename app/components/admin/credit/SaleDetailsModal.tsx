'use client'

import { Fragment } from 'react'
import { XMarkIcon, BanknotesIcon, CalendarIcon, UserIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  name: string
  category: string
  price: number
  quantity: number
  total: number
}

interface CreditSale {
  id: number
  saleNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  products: Product[]
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

interface SaleDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  sale: CreditSale | null
}

export default function SaleDetailsModal({ isOpen, onClose, sale }: SaleDetailsModalProps) {
  const { language } = useLanguage()

  const translations = {
    en: {
      title: 'Sale Details',
      saleNumber: 'Sale Number',
      customer: 'Customer Information',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      products: 'Products',
      product: 'Product',
      quantity: 'Quantity',
      unitPrice: 'Unit Price',
      total: 'Total',
      payment: 'Payment Information',
      totalAmount: 'Total Amount',
      amountPaid: 'Amount Paid',
      outstanding: 'Outstanding Balance',
      paymentPlan: 'Payment Plan',
      paymentMethod: 'Payment Method',
      saleDate: 'Sale Date',
      dueDate: 'Due Date',
      lastPayment: 'Last Payment',
      nextPayment: 'Next Payment',
      status: 'Status',
      close: 'Close',
      currency: 'TZS',
      pending: 'Pending Payment',
      partial: 'Partially Paid',
      paid: 'Fully Paid',
      overdue: 'Overdue',
      defaulted: 'Defaulted'
    },
    sw: {
      title: 'Maelezo ya Uuzaji',
      saleNumber: 'Namba ya Uuzaji',
      customer: 'Taarifa za Mteja',
      name: 'Jina',
      phone: 'Simu',
      email: 'Barua Pepe',
      products: 'Bidhaa',
      product: 'Bidhaa',
      quantity: 'Idadi',
      unitPrice: 'Bei ya Kipande',
      total: 'Jumla',
      payment: 'Taarifa za Malipo',
      totalAmount: 'Jumla ya Kiasi',
      amountPaid: 'Kiasi Kilicholipwa',
      outstanding: 'Salio Linalobaki',
      paymentPlan: 'Mpango wa Malipo',
      paymentMethod: 'Njia ya Malipo',
      saleDate: 'Tarehe ya Uuzaji',
      dueDate: 'Tarehe ya Mwisho',
      lastPayment: 'Malipo ya Mwisho',
      nextPayment: 'Malipo Yajayo',
      status: 'Hali',
      close: 'Funga',
      currency: 'TSh',
      pending: 'Inasubiri',
      partial: 'Imelipwa Sehemu',
      paid: 'Imelipwa Kamili',
      overdue: 'Imepitisha',
      defaulted: 'Haijalipi'
    }
  }

  const t = translations[language]

  if (!sale) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'partial': return 'text-blue-700 bg-blue-100'
      case 'paid': return 'text-green-700 bg-green-100'
      case 'overdue': return 'text-orange-700 bg-orange-100'
      case 'defaulted': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
                <p className="text-sm text-gray-600 mt-1 font-mono">{sale.saleNumber}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer Information */}
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <UserIcon className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{t.customer}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t.name}</p>
                    <p className="font-medium text-gray-900">{sale.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t.phone}</p>
                    <p className="font-medium text-gray-900">{sale.customerPhone}</p>
                  </div>
                  {sale.customerEmail && (
                    <div>
                      <p className="text-sm text-gray-600">{t.email}</p>
                      <p className="font-medium text-gray-900">{sale.customerEmail}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ShoppingBagIcon className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">{t.products}</h3>
                </div>
                <div className="space-y-3">
                  {sale.products.map((product, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm text-gray-600">
                            {product.quantity} × {t.currency} {product.price.toLocaleString()}
                          </p>
                          <p className="font-semibold text-gray-900">
                            {t.currency} {product.total.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <BanknotesIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{t.payment}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">{t.totalAmount}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {t.currency} {sale.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">{t.amountPaid}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {t.currency} {sale.amountPaid.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">{t.outstanding}</p>
                    <p className="text-2xl font-bold text-red-600">
                      {t.currency} {sale.outstandingBalance.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">{t.status}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sale.status)}`}>
                      {t[sale.status as keyof typeof t]}
                    </span>
                  </div>
                </div>

                {/* Dates and Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">{t.paymentPlan}</p>
                    <p className="font-medium text-gray-900">{sale.paymentPlan}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">{t.paymentMethod}</p>
                    <p className="font-medium text-gray-900">{sale.paymentMethod}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">{t.saleDate}</p>
                    <p className="font-medium text-gray-900">{sale.saleDate}</p>
                  </div>
                  {sale.dueDate && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">{t.dueDate}</p>
                      <p className="font-medium text-gray-900">{sale.dueDate}</p>
                    </div>
                  )}
                  {sale.lastPaymentDate && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">{t.lastPayment}</p>
                      <p className="font-medium text-gray-900">{sale.lastPaymentDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={onClose}
                className="w-full md:w-auto px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                {t.close}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

