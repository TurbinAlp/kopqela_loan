'use client'

import { useState } from 'react'
import { XMarkIcon, BellIcon, EnvelopeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { motion, AnimatePresence } from 'framer-motion'

interface CreditSale {
  id: number
  saleNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  outstandingBalance: number
  dueDate?: string
}

interface SendReminderModalProps {
  isOpen: boolean
  onClose: () => void
  sales: CreditSale[] // Can send to single or multiple sales
  businessId: number
}

export default function SendReminderModal({
  isOpen,
  onClose,
  sales,
  businessId
}: SendReminderModalProps) {
  const { language } = useLanguage()
  const { showSuccess, showError } = useNotifications()

  const [channel, setChannel] = useState<'SMS' | 'EMAIL' | 'BOTH'>('SMS')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const translations = {
    en: {
      title: 'Send Payment Reminder',
      titleMultiple: 'Send Payment Reminders',
      customer: 'Customer',
      customers: 'Customers',
      outstanding: 'Outstanding',
      channel: 'Channel',
      sms: 'SMS',
      email: 'Email',
      both: 'Both SMS & Email',
      message: 'Message',
      messagePlaceholder: 'Enter reminder message...',
      preview: 'Message Preview',
      variables: 'Available Variables',
      variableCustomer: '{{customer}} - Customer name',
      variableAmount: '{{amount}} - Outstanding amount',
      variableDue: '{{dueDate}} - Due date',
      variableBusiness: '{{business}} - Business name',
      cancel: 'Cancel',
      send: 'Send Reminder',
      sendMultiple: 'Send Reminders',
      sending: 'Sending...',
      success: 'Reminder Sent',
      successMessage: 'Payment reminder has been sent successfully',
      successMultiple: 'Reminders sent successfully to {{count}} customers',
      error: 'Error',
      errorMessage: 'Failed to send reminder',
      emptyMessage: 'Please enter a message',
      defaultMessage: 'Hello {{customer}}, this is a friendly reminder that you have an outstanding balance of TSh {{amount}} from {{business}}. Please make your payment at your earliest convenience. Thank you!',
      currency: 'TZS'
    },
    sw: {
      title: 'Tuma Ukumbusho wa Malipo',
      titleMultiple: 'Tuma Vikumbusho vya Malipo',
      customer: 'Mteja',
      customers: 'Wateja',
      outstanding: 'Salio',
      channel: 'Njia',
      sms: 'SMS',
      email: 'Barua Pepe',
      both: 'SMS na Barua Pepe',
      message: 'Ujumbe',
      messagePlaceholder: 'Andika ujumbe wa ukumbusho...',
      preview: 'Onyesho la Ujumbe',
      variables: 'Vigeuzi Vinavyopatikana',
      variableCustomer: '{{customer}} - Jina la mteja',
      variableAmount: '{{amount}} - Kiasi kinachobaki',
      variableDue: '{{dueDate}} - Tarehe ya mwisho',
      variableBusiness: '{{business}} - Jina la biashara',
      cancel: 'Ghairi',
      send: 'Tuma Ukumbusho',
      sendMultiple: 'Tuma Vikumbusho',
      sending: 'Inatuma...',
      success: 'Ukumbusho Umetumwa',
      successMessage: 'Ukumbusho wa malipo umetumwa kwa mafanikio',
      successMultiple: 'Vikumbusho vimetumwa kwa mafanikio kwa wateja {{count}}',
      error: 'Hitilafu',
      errorMessage: 'Kushindwa kutuma ukumbusho',
      emptyMessage: 'Tafadhali andika ujumbe',
      defaultMessage: 'Habari {{customer}}, huu ni ukumbusho wa kirafiki kuwa una salio la TSh {{amount}} kutoka {{business}}. Tafadhali fanya malipo yako haraka iwezekanavyo. Asante!',
      currency: 'TSh'
    }
  }

  const t = translations[language]

  const defaultMessage = t.defaultMessage

  // Set default message on mount
  useState(() => {
    if (!message) {
      setMessage(defaultMessage)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      showError(t.error, t.emptyMessage)
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Implement actual reminder API endpoint
      // For now, simulating the API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const response = await fetch('/api/admin/credit/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId,
          saleIds: sales.map(s => s.id),
          channel,
          message
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send reminder')
      }

      const successMsg = sales.length > 1 
        ? t.successMultiple.replace('{{count}}', sales.length.toString())
        : t.successMessage

      showSuccess(t.success, successMsg)
      
      // Reset form
      setMessage(defaultMessage)
      setChannel('SMS')
      
      onClose()
    } catch (error) {
      console.error('Error sending reminder:', error)
      showError(
        t.error,
        error instanceof Error ? error.message : t.errorMessage
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sales.length === 0) return null

  const previewMessage = sales.length === 1 
    ? message
        .replace('{{customer}}', sales[0].customerName)
        .replace('{{amount}}', sales[0].outstandingBalance.toLocaleString())
        .replace('{{dueDate}}', sales[0].dueDate || 'N/A')
        .replace('{{business}}', 'Your Business')
    : message

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
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {sales.length > 1 ? t.titleMultiple : t.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {sales.length === 1 
                    ? sales[0].customerName
                    : `${sales.length} ${t.customers}`
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Customer Summary */}
            {sales.length === 1 && (
              <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t.customer}</p>
                    <p className="font-semibold text-gray-900">{sales[0].customerName}</p>
                    <p className="text-sm text-gray-600">{sales[0].customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t.outstanding}</p>
                    <p className="text-2xl font-bold text-red-600">
                      {t.currency} {sales[0].outstandingBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Channel Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.channel} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setChannel('SMS')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      channel === 'SMS'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    <DevicePhoneMobileIcon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{t.sms}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('EMAIL')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      channel === 'EMAIL'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    <EnvelopeIcon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{t.email}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('BOTH')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      channel === 'BOTH'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    <BellIcon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{t.both}</span>
                  </button>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.message} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.messagePlaceholder}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 resize-none"
                  required
                />
                
                {/* Available Variables */}
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">{t.variables}:</p>
                  <div className="text-xs text-blue-800 space-y-1">
                    <p>• {t.variableCustomer}</p>
                    <p>• {t.variableAmount}</p>
                    <p>• {t.variableDue}</p>
                    <p>• {t.variableBusiness}</p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {sales.length === 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.preview}</label>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{previewMessage}</p>
                  </div>
                </div>
              )}
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
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <BellIcon className="w-5 h-5" />
                <span>{isSubmitting ? t.sending : (sales.length > 1 ? t.sendMultiple : t.send)}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

