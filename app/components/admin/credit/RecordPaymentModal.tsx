'use client'

import { useState } from 'react'
import { XMarkIcon, BanknotesIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { motion, AnimatePresence } from 'framer-motion'

interface CreditSale {
  id: number
  saleNumber: string
  customerName: string
  customerId?: number
  totalAmount: number
  amountPaid: number
  outstandingBalance: number
}

interface RecordPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  sale: CreditSale | null
  businessId: number
  onPaymentRecorded: () => void
}

export default function RecordPaymentModal({
  isOpen,
  onClose,
  sale,
  businessId,
  onPaymentRecorded
}: RecordPaymentModalProps) {
  const { language } = useLanguage()
  const { showSuccess, showError } = useNotifications()

  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const translations = {
    en: {
      title: 'Record Payment',
      saleNumber: 'Sale Number',
      customer: 'Customer',
      outstanding: 'Outstanding Balance',
      amount: 'Payment Amount',
      amountPlaceholder: 'Enter amount',
      paymentMethod: 'Payment Method',
      reference: 'Reference Number',
      referencePlaceholder: 'Optional reference',
      notes: 'Notes',
      notesPlaceholder: 'Optional notes',
      cancel: 'Cancel',
      submit: 'Record Payment',
      submitting: 'Recording...',
      currency: 'TZS',
      success: 'Payment Recorded',
      successMessage: 'Payment has been recorded successfully',
      error: 'Error',
      errorMessage: 'Failed to record payment',
      invalidAmount: 'Please enter a valid amount',
      exceedsBalance: 'Amount exceeds outstanding balance',
      cash: 'Cash',
      mpesa: 'M-Pesa',
      tigopesa: 'Tigo Pesa',
      airtel: 'Airtel Money',
      bank: 'Bank Transfer',
      card: 'Card'
    },
    sw: {
      title: 'Rekodi Malipo',
      saleNumber: 'Namba ya Uuzaji',
      customer: 'Mteja',
      outstanding: 'Salio Linalobaki',
      amount: 'Kiasi cha Malipo',
      amountPlaceholder: 'Weka kiasi',
      paymentMethod: 'Njia ya Malipo',
      reference: 'Namba ya Kumbukumbu',
      referencePlaceholder: 'Kumbukumbu ya hiari',
      notes: 'Maelezo',
      notesPlaceholder: 'Maelezo ya hiari',
      cancel: 'Ghairi',
      submit: 'Rekodi Malipo',
      submitting: 'Inarekodi...',
      currency: 'TSh',
      success: 'Malipo Yamerekodiwa',
      successMessage: 'Malipo yamerekodiwa kwa mafanikio',
      error: 'Hitilafu',
      errorMessage: 'Kushindwa kurekodi malipo',
      invalidAmount: 'Tafadhali weka kiasi halali',
      exceedsBalance: 'Kiasi kinazidi salio linalobaki',
      cash: 'Taslimu',
      mpesa: 'M-Pesa',
      tigopesa: 'Tigo Pesa',
      airtel: 'Airtel Money',
      bank: 'Uhamisho wa Benki',
      card: 'Kadi'
    }
  }

  const t = translations[language]

  const paymentMethods = [
    { value: 'CASH', label: t.cash },
    { value: 'MPESA', label: t.mpesa },
    { value: 'TIGOPESA', label: t.tigopesa },
    { value: 'AIRTEL', label: t.airtel },
    { value: 'BANK_TRANSFER', label: t.bank },
    { value: 'CARD', label: t.card }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sale) return

    const paymentAmount = parseFloat(amount)

    // Validation
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      showError(t.error, t.invalidAmount)
      return
    }

    if (paymentAmount > sale.outstandingBalance) {
      showError(t.error, t.exceedsBalance)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/credit/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: sale.id,
          customerId: sale.customerId,
          businessId,
          amount: paymentAmount,
          paymentMethod,
          reference: reference || undefined,
          notes: notes || undefined
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to record payment')
      }

      showSuccess(t.success, t.successMessage)
      
      // Reset form
      setAmount('')
      setPaymentMethod('CASH')
      setReference('')
      setNotes('')
      
      onPaymentRecorded()
      onClose()
    } catch (error) {
      console.error('Error recording payment:', error)
      showError(
        t.error,
        error instanceof Error ? error.message : t.errorMessage
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!sale) return null

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
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{sale.customerName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Sale Summary */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t.saleNumber}</p>
                  <p className="font-mono font-semibold text-gray-900">{sale.saleNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t.outstanding}</p>
                  <p className="text-2xl font-bold text-red-600">
                    {t.currency} {sale.outstandingBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.amount} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BanknotesIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={t.amountPlaceholder}
                    min="0"
                    step="0.01"
                    max={sale.outstandingBalance}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.paymentMethod} <span className="text-red-500">*</span>
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white"
                  required
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value} className="text-gray-900">
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Number */}
              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.reference}
                </label>
                <input
                  type="text"
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={t.referencePlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.notes}
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 resize-none"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t.submitting : t.submit}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

