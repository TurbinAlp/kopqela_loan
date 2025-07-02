'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  PrinterIcon,
  CheckIcon,
  XMarkIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../contexts/LanguageContext'

interface ReceiptItem {
  id: number
  name: string
  nameSwahili?: string
  quantity: number
  price: number
  subtotal: number
  unit?: string
}

interface ReceiptData {
  transactionId: string
  orderNumber?: string
  businessName: string
  businessPhone?: string
  businessEmail?: string
  businessAddress?: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  items: ReceiptItem[]
  subtotal: number
  taxAmount: number
  taxRate: number
  discountAmount?: number
  interestAmount?: number
  interestRate?: number
  finalTotal: number
  paymentMethod: string
  paymentPlan?: 'full' | 'partial' | 'credit'
  partialAmount?: number
  balanceDue?: number
  dueDate?: string
  creditPlan?: string
  transactionDate: string
  cashierName?: string
  notes?: string
}

interface ReceiptProps {
  isOpen: boolean
  onClose: () => void
  receiptData: ReceiptData
  onPrint?: () => void
  onEmailReceipt?: () => void
  onSMSReceipt?: () => void
  onNewTransaction?: () => void
}

export default function Receipt({
  isOpen,
  onClose,
  receiptData,
  onPrint,
  onEmailReceipt,
  onSMSReceipt,
  onNewTransaction
}: ReceiptProps) {
  const { language } = useLanguage()

  const translations = {
    en: {
      receipt: "Receipt",
      transactionComplete: "Transaction Completed Successfully!",
      transactionId: "Transaction ID",
      orderNumber: "Order Number", 
      date: "Date",
      customer: "Customer",
      phone: "Phone",
      email: "Email",
      items: "Items",
      itemName: "Item",
      quantity: "Qty",
      price: "Price",
      total: "Total",
      subtotal: "Subtotal",
      tax: "Tax",
      discount: "Discount",
      interest: "Interest",
      finalTotal: "Final Total",
      grandTotal: "Grand Total",
      paymentMethod: "Payment Method",
      paymentPlan: "Payment Plan",
      fullPayment: "Full Payment",
      partialPayment: "Partial Payment",
      creditSale: "Credit Sale",
      amountPaid: "Amount Paid",
      balanceDue: "Balance Due",
      dueDate: "Due Date",
      creditPlan: "Credit Plan",
      cashier: "Cashier",
      notes: "Notes",
      currency: "TZS",
      printReceipt: "Print Receipt",
      emailReceipt: "Email Receipt",
      smsReceipt: "SMS Receipt",
      newTransaction: "New Transaction",
      close: "Close",
      thankYou: "Thank you for your business!",
      months: "months",
      interestRate: "interest"
    },
    sw: {
      receipt: "Risiti",
      transactionComplete: "Muamala Umekamilika Kikamilifu!",
      transactionId: "Nambari ya Muamala",
      orderNumber: "Nambari ya Agizo",
      date: "Tarehe",
      customer: "Mteja",
      phone: "Simu",
      email: "Barua Pepe",
      items: "Bidhaa",
      itemName: "Bidhaa",
      quantity: "Idadi",
      price: "Bei",
      total: "Jumla",
      subtotal: "Jumla Ndogo",
      tax: "Kodi",
      discount: "Punguzo",
      interest: "Riba",
      finalTotal: "Jumla ya Mwisho",
      grandTotal: "Jumla Kubwa",
      paymentMethod: "Njia ya Malipo",
      paymentPlan: "Mpango wa Malipo",
      fullPayment: "Malipo Kamili",
      partialPayment: "Malipo ya Sehemu",
      creditSale: "Ununuzi kwa Mkopo",
      amountPaid: "Kiasi Kilicholipwa",
      balanceDue: "Salio",
      dueDate: "Tarehe ya Kulipa",
      creditPlan: "Mpango wa Mkopo",
      cashier: "Karani",
      notes: "Maelezo",
      currency: "TSh",
      printReceipt: "Chapisha Risiti",
      emailReceipt: "Tuma kwa Barua Pepe",
      smsReceipt: "Tuma kwa SMS",
      newTransaction: "Muamala Mpya",
      close: "Funga",
      thankYou: "Asante kwa biashara yako!",
      months: "miezi",
      interestRate: "riba"
    }
  }

  const t = translations[language]

  const formatCurrency = (amount: number) => {
    return `${t.currency} ${amount.toLocaleString()}`
  }

  const getPaymentMethodDisplay = () => {
    const methodMap: { [key: string]: { en: string; sw: string } } = {
      'cash': { en: 'Cash', sw: 'Fedha Taslimu' },
      'card': { en: 'Card', sw: 'Kadi' },
      'mobile': { en: 'Mobile Money', sw: 'Fedha za Simu' },
      'bank': { en: 'Bank Transfer', sw: 'Uhamisho wa Benki' },
      'credit': { en: 'Credit', sw: 'Mkopo' }
    }
    return methodMap[receiptData.paymentMethod]?.[language] || receiptData.paymentMethod
  }

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t.transactionComplete}</h2>
                <p className="text-gray-600">{t.receipt}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-6">
          {/* Business Information */}
          <div className="text-center border-b border-gray-200 pb-4">
            <div className="flex items-center justify-center mb-2">
              <BuildingStorefrontIcon className="w-6 h-6 text-teal-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-900">{receiptData.businessName}</h3>
            </div>
            {receiptData.businessPhone && (
              <p className="text-gray-600">{t.phone}: {receiptData.businessPhone}</p>
            )}
            {receiptData.businessEmail && (
              <p className="text-gray-600">{t.email}: {receiptData.businessEmail}</p>
            )}
            {receiptData.businessAddress && (
              <p className="text-gray-600">{receiptData.businessAddress}</p>
            )}
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">{t.transactionId}:</p>
              <p className="font-medium text-gray-900">{receiptData.transactionId}</p>
            </div>
            {receiptData.orderNumber && (
              <div>
                <p className="text-gray-600">{t.orderNumber}:</p>
                <p className="font-medium text-gray-900">{receiptData.orderNumber}</p>
              </div>
            )}
            <div>
              <p className="text-gray-600">{t.date}:</p>
              <p className="font-medium text-gray-900">{receiptData.transactionDate}</p>
            </div>
            {receiptData.cashierName && (
              <div>
                <p className="text-gray-600">{t.cashier}:</p>
                <p className="font-medium text-gray-900">{receiptData.cashierName}</p>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-2">{t.customer}</h4>
            <div className="text-sm space-y-1">
              <p className="font-medium text-gray-900">{receiptData.customerName}</p>
              {receiptData.customerPhone && (
                <p className="text-gray-600">{t.phone}: {receiptData.customerPhone}</p>
              )}
              {receiptData.customerEmail && (
                <p className="text-gray-600">{t.email}: {receiptData.customerEmail}</p>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-3">{t.items}</h4>
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 border-b border-gray-200 pb-2">
                <div className="col-span-5">{t.itemName}</div>
                <div className="col-span-2 text-center">{t.quantity}</div>
                <div className="col-span-2 text-right">{t.price}</div>
                <div className="col-span-3 text-right">{t.total}</div>
              </div>
              
              {/* Items */}
              {receiptData.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 text-sm border-b border-gray-100 pb-2">
                  <div className="col-span-5">
                    <p className="font-medium text-gray-900">
                      {language === 'sw' && item.nameSwahili ? item.nameSwahili : item.name}
                    </p>
                    {item.unit && (
                      <p className="text-xs text-gray-500">Unit: {item.unit}</p>
                    )}
                  </div>
                  <div className="col-span-2 text-center text-gray-900">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right text-gray-900">
                    {formatCurrency(item.price)}
                  </div>
                  <div className="col-span-3 text-right font-medium text-gray-900">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t.subtotal}:</span>
                <span className="text-gray-900">{formatCurrency(receiptData.subtotal)}</span>
              </div>
              
              {receiptData.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.tax} ({receiptData.taxRate}%):</span>
                  <span className="text-gray-900">{formatCurrency(receiptData.taxAmount)}</span>
                </div>
              )}
              
              {receiptData.discountAmount && receiptData.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.discount}:</span>
                  <span className="text-red-600">-{formatCurrency(receiptData.discountAmount)}</span>
                </div>
              )}
              
              {receiptData.interestAmount && receiptData.interestAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t.interest} ({receiptData.interestRate}% {t.interestRate}):
                  </span>
                  <span className="text-gray-900">{formatCurrency(receiptData.interestAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                <span className="text-gray-900">{t.grandTotal}:</span>
                <span className="text-gray-900">{formatCurrency(receiptData.finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-2">{t.paymentMethod}</h4>
            <div className="text-sm space-y-1">
              <p className="text-gray-900">
                <span className="font-medium">{t.paymentPlan}:</span> {
                  receiptData.paymentPlan === 'full' ? t.fullPayment :
                  receiptData.paymentPlan === 'partial' ? t.partialPayment :
                  receiptData.paymentPlan === 'credit' ? t.creditSale :
                  t.fullPayment
                }
              </p>
              <p className="text-gray-900">
                <span className="font-medium">{t.paymentMethod}:</span> {getPaymentMethodDisplay()}
              </p>
              
              {receiptData.paymentPlan === 'partial' && (
                <>
                  <p className="text-gray-900">
                    <span className="font-medium">{t.amountPaid}:</span> {formatCurrency(receiptData.partialAmount || 0)}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-medium">{t.balanceDue}:</span> {formatCurrency(receiptData.balanceDue || 0)}
                  </p>
                  {receiptData.dueDate && (
                    <p className="text-gray-900">
                      <span className="font-medium">{t.dueDate}:</span> {new Date(receiptData.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </>
              )}
              
              {receiptData.paymentPlan === 'credit' && receiptData.creditPlan && (
                <p className="text-gray-900">
                  <span className="font-medium">{t.creditPlan}:</span> {receiptData.creditPlan} {t.months}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          {receiptData.notes && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-2">{t.notes}</h4>
              <p className="text-sm text-gray-600">{receiptData.notes}</p>
            </div>
          )}

          {/* Thank You Message */}
          <div className="text-center border-t border-gray-200 pt-4">
            <p className="text-gray-600 italic">{t.thankYou}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button
              onClick={handlePrint}
              className="bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
            >
              <PrinterIcon className="w-4 h-4 mr-2" />
              {t.printReceipt}
            </button>
            
            {onEmailReceipt && (
              <button
                onClick={onEmailReceipt}
                className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.emailReceipt}
              </button>
            )}
            
            {onSMSReceipt && (
              <button
                onClick={onSMSReceipt}
                className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                {t.smsReceipt}
              </button>
            )}
            
            {onNewTransaction ? (
              <button
                onClick={onNewTransaction}
                className="bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t.newTransaction}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t.close}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
} 