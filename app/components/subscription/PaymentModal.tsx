'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { useNotifications } from '@/app/contexts/NotificationContext'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  planId: number
  planName: string
  planNameSwahili?: string
  amount: number
  businessId: number
  onPaymentInitiated: (transactionId: number) => void
}

const PROVIDERS = [
  { id: 'AZAMPESA', name: 'AzamPesa', logo: '/payments_icons/azampay.png', color: 'bg-blue-50 border-blue-300' },
  { id: 'TIGOPESA', name: 'YAS', logo: '/payments_icons/yas.svg', color: 'bg-blue-50 border-blue-400' },
  { id: 'AIRTEL', name: 'Airtel Money', logo: '/payments_icons/airtel.png', color: 'bg-red-50 border-red-300' },
  { id: 'HALOPESA', name: 'HaloPesa', logo: '/payments_icons/halopesa.jpg', color: 'bg-purple-50 border-purple-300' },
]

export default function PaymentModal({
  isOpen,
  onClose,
  planId,
  planName,
  planNameSwahili,
  amount,
  businessId,
  onPaymentInitiated,
}: PaymentModalProps) {
  const { language } = useLanguage()
  const { showError } = useNotifications()
  
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const translations = {
    en: {
      title: 'Complete Payment',
      selectProvider: 'Select Mobile Money Provider',
      phoneNumber: 'Phone Number',
      phonePlaceholder: '0712345678 or 255712345678',
      amount: 'Amount',
      plan: 'Plan',
      payNow: 'Pay Now',
      cancel: 'Cancel',
      processing: 'Processing...',
      selectProviderError: 'Please select a payment provider',
      phoneNumberError: 'Please enter a valid phone number',
      paymentInstructions: 'You will receive a prompt on your phone to complete the payment',
    },
    sw: {
      title: 'Maliza Malipo',
      selectProvider: 'Chagua Mtoa Huduma wa Pesa',
      phoneNumber: 'Nambari ya Simu',
      phonePlaceholder: '0712345678 au 255712345678',
      amount: 'Kiasi',
      plan: 'Mpango',
      payNow: 'Lipa Sasa',
      cancel: 'Ghairi',
      processing: 'Inachakata...',
      selectProviderError: 'Tafadhali chagua mtoa huduma wa malipo',
      phoneNumberError: 'Tafadhali weka nambari sahihi ya simu',
      paymentInstructions: 'Utapokea ujumbe kwenye simu yako kukamilisha malipo',
    },
  }

  const t = translations[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProvider) {
      showError('Error', t.selectProviderError)
      return
    }

    if (!phoneNumber.trim()) {
      showError('Error', t.phoneNumberError)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/payments/azampay/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          planId,
          phoneNumber: phoneNumber.trim(),
          provider: selectedProvider,
        }),
      })

      const data = await response.json()

      if (data.success && data.data.transactionId) {
        onPaymentInitiated(data.data.transactionId)
        onClose()
      } else {
        showError('Error', data.error || 'Failed to initiate payment')
      }
    } catch (error) {
      console.error('Error initiating payment:', error)
      showError('Error', 'Failed to initiate payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative z-10 inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-900">{t.title}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Plan Details */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">{t.plan}:</span>
                <span className="text-lg font-bold text-gray-900">
                  {language === 'sw' && planNameSwahili ? planNameSwahili : planName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">{t.amount}:</span>
                <span className="text-2xl font-bold text-teal-600">
                  {amount.toLocaleString('en-TZ')} TZS
                </span>
              </div>
            </div>

            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t.selectProvider}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                      selectedProvider === provider.id
                        ? `${provider.color} ring-2 ring-offset-2 ring-teal-500`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <Image
                        src={provider.logo}
                        alt={provider.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <span className="font-medium text-sm text-center">{provider.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                {t.phoneNumber}
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t.phonePlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                ℹ️ {t.paymentInstructions}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                disabled={loading}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 text-white bg-teal-600 rounded-lg hover:bg-teal-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? t.processing : t.payNow}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


