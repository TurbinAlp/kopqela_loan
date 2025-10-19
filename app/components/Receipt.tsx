'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  PrinterIcon,
  XMarkIcon
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
  itemType?: 'PRODUCT' | 'SERVICE'
  serviceItem?: {
    durationValue: number
    durationUnit: string
    currentRentalStart?: string
    currentRentalEnd?: string
  }
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
  // Optional: omitted in simplified UI
  // onEmailReceipt?: () => void
  // onSMSReceipt?: () => void
  onNewTransaction?: () => void
}

export default function Receipt({
  isOpen,
  onClose,
  receiptData,
  onPrint,
  // onEmailReceipt,
  // onSMSReceipt,
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
      itemName: "Item/Service",
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
      interestRate: "interest",
      // Service-related translations
      leaseFor: "Lease for",
      rentalPeriod: "Rental Period",
      from: "From",
      to: "To",
      duration: "Duration",
      minutes: "min",
      hours: "hrs",
      days: "days",
      weeks: "weeks",
      years: "years"
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
      itemName: "Bidhaa/Huduma",
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
      interestRate: "riba",
      // Service-related translations
      leaseFor: "Kukodisha kwa",
      rentalPeriod: "Muda wa Kukodisha",
      from: "Kuanzia",
      to: "Hadi",
      duration: "Muda",
      minutes: "dak",
      hours: "saa",
      days: "siku",
      weeks: "wiki",
      years: "miaka"
    }
  }

  const t = translations[language]

  const formatCurrency = (amount: number) => {
    return `${t.currency} ${amount.toLocaleString()}`
  }

  const formatDuration = (value: number, unit: string) => {
    const unitMap: { [key: string]: string } = {
      'MINUTES': t.minutes,
      'HOURS': t.hours,
      'DAYS': t.days,
      'WEEKS': t.weeks,
      'MONTHS': t.months,
      'YEARS': t.years
    }
    return `${value} ${unitMap[unit] || unit.toLowerCase()}`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString(language === 'sw' ? 'sw-TZ' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl max-w-lg w-full shadow-lg max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900">{t.receipt}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          {/* Business Information */}
          <div className="text-center border-b border-gray-200 pb-3">
            <h3 className="text-base font-semibold text-gray-900">{receiptData.businessName}</h3>
            <div className="text-xs text-gray-600 space-x-2">
              {receiptData.businessPhone && (<span>{receiptData.businessPhone}</span>)}
              {receiptData.businessEmail && (<span>{receiptData.businessEmail}</span>)}
            </div>
            {receiptData.businessAddress && (
              <p className="text-xs text-gray-600 mt-1">{receiptData.businessAddress}</p>
            )}
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
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
          <div className="border-t border-gray-200 pt-3">
            <h4 className="font-medium text-gray-900 mb-2">{t.items}</h4>
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-[11px] font-medium text-gray-600 border-b border-gray-200 pb-2">
                <div className="col-span-5">{t.itemName}</div>
                <div className="col-span-2 text-center">{t.quantity}</div>
                <div className="col-span-2 text-right">{t.price}</div>
                <div className="col-span-3 text-right">{t.total}</div>
              </div>
              
              {/* Items */}
              {receiptData.items.map((item) => (
                <div key={item.id} className="border-b border-gray-100 pb-3 mb-3">
                  {/* Main item row */}
                  <div className="grid grid-cols-12 gap-2 text-xs">
                    <div className="col-span-5">
                      <p className="font-medium text-gray-900">
                        {language === 'sw' && item.nameSwahili ? item.nameSwahili : item.name}
                      </p>
                      {item.itemType === 'SERVICE' && (
                        <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                          [{item.itemType === 'SERVICE' ? (language === 'sw' ? 'HUDUMA' : 'SERVICE') : (language === 'sw' ? 'BIDHAA' : 'PRODUCT')}]
                        </p>
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
                  
                  {/* Service-specific information - Full width */}
                  {item.itemType === 'SERVICE' && item.serviceItem && (
                    <div className="mt-2 bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-blue-800">{t.leaseFor}:</span>
                          <span className="text-xs font-bold text-blue-900">
                            {formatDuration(item.serviceItem.durationValue, item.serviceItem.durationUnit)}
                          </span>
                        </div>
                        
                        {(() => {
                          // Calculate rental period if not provided
                          const startDate = item.serviceItem.currentRentalStart 
                            ? new Date(item.serviceItem.currentRentalStart)
                            : new Date() // Use current date if not provided
                          
                          const endDate = item.serviceItem.currentRentalEnd 
                            ? new Date(item.serviceItem.currentRentalEnd)
                            : (() => {
                                const end = new Date(startDate)
                                const duration = item.serviceItem.durationValue
                                const unit = item.serviceItem.durationUnit
                                
                                switch (unit) {
                                  case 'MINUTES':
                                    end.setMinutes(end.getMinutes() + duration)
                                    break
                                  case 'HOURS':
                                    end.setHours(end.getHours() + duration)
                                    break
                                  case 'DAYS':
                                    end.setDate(end.getDate() + duration)
                                    break
                                  case 'WEEKS':
                                    end.setDate(end.getDate() + (duration * 7))
                                    break
                                  case 'MONTHS':
                                    end.setMonth(end.getMonth() + duration)
                                    break
                                  case 'YEARS':
                                    end.setFullYear(end.getFullYear() + duration)
                                    break
                                  default:
                                    end.setDate(end.getDate() + duration)
                                }
                                return end
                              })()
                          
                          return (
                            <div className="bg-white p-2 rounded border border-blue-200">
                              <p className="text-xs font-medium text-blue-800 mb-2 text-center">{t.rentalPeriod}</p>
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="text-center">
                                  <p className="font-medium text-blue-700">{t.from}:</p>
                                  <p className="text-blue-600">{formatDateTime(startDate.toISOString())}</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-medium text-blue-700">{t.to}:</p>
                                  <p className="text-blue-600">{formatDateTime(endDate.toISOString())}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border-t border-gray-200 pt-3">
            <div className="space-y-1.5 text-sm">
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
              
              <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2">
                <span className="text-gray-900">{t.grandTotal}:</span>
                <span className="text-gray-900">{formatCurrency(receiptData.finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="border-t border-gray-200 pt-3">
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
            <div className="border-t border-gray-200 pt-3">
              <h4 className="font-medium text-gray-900 mb-2">{t.notes}</h4>
              <p className="text-sm text-gray-600">{receiptData.notes}</p>
            </div>
          )}

          {/* Thank You Message */}
          <div className="text-center border-t border-gray-200 pt-3">
            <p className="text-gray-600 italic">{t.thankYou}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-4 rounded-b-xl flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="bg-teal-600 text-white py-2.5 px-4 rounded-lg hover:bg-teal-700 transition-colors flex items-center"
          >
            <PrinterIcon className="w-4 h-4 mr-2" />
            {t.printReceipt}
          </button>
          {onNewTransaction ? (
            <button onClick={onNewTransaction} className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              {t.newTransaction}
            </button>
          ) : (
            <button onClick={onClose} className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              {t.close}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
} 