'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/app/contexts/LanguageContext'

interface PaymentStatusModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: number
  onSuccess: () => void
}

interface TransactionStatus {
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED'
  amount: number
  currency: string
  provider: string
  planName: string
  failureReason?: string
}

export default function PaymentStatusModal({
  isOpen,
  onClose,
  transactionId,
  onSuccess,
}: PaymentStatusModalProps) {
  const { language } = useLanguage()
  const [status, setStatus] = useState<TransactionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [pollingCount, setPollingCount] = useState(0)
  const MAX_POLLING_ATTEMPTS = 60 // Poll for 5 minutes (60 * 5 seconds)

  const translations = {
    en: {
      pending: 'Payment Pending',
      success: 'Payment Successful!',
      failed: 'Payment Failed',
      cancelled: 'Payment Cancelled',
      expired: 'Payment Expired',
      pendingMessage: 'Please check your phone and enter your PIN to complete the payment.',
      successMessage: 'Your subscription has been activated successfully!',
      failedMessage: 'The payment could not be processed.',
      cancelledMessage: 'The payment was cancelled.',
      expiredMessage: 'The payment request has expired.',
      checkingStatus: 'Checking payment status...',
      close: 'Close',
      tryAgain: 'Try Again',
      reason: 'Reason',
      amount: 'Amount',
      provider: 'Provider',
      plan: 'Plan',
      redirecting: 'Redirecting...',
    },
    sw: {
      pending: 'Malipo Yanasubiri',
      success: 'Malipo Yamefanikiwa!',
      failed: 'Malipo Yameshindikana',
      cancelled: 'Malipo Yamesitishwa',
      expired: 'Malipo Yameisha Muda',
      pendingMessage: 'Tafadhali angalia simu yako na weka PIN yako kukamilisha malipo.',
      successMessage: 'Usajili wako umewashwa kwa mafanikio!',
      failedMessage: 'Malipo hayakuweza kuchakatwa.',
      cancelledMessage: 'Malipo yalisitishwa.',
      expiredMessage: 'Ombi la malipo limeisha muda.',
      checkingStatus: 'Inaangalia hali ya malipo...',
      close: 'Funga',
      tryAgain: 'Jaribu Tena',
      reason: 'Sababu',
      amount: 'Kiasi',
      provider: 'Mtoa Huduma',
      plan: 'Mpango',
      redirecting: 'Inaelekeza...',
    },
  }

  const t = translations[language]

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/payments/azampay/status/${transactionId}`)
      const data = await response.json()

      if (data.success && data.data) {
        setStatus(data.data)
        setLoading(false)

        // If successful, trigger success callback after a short delay
        if (data.data.status === 'SUCCESS') {
          setTimeout(() => {
            onSuccess()
          }, 2000)
        }

        // Stop polling if status is final
        if (['SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(data.data.status)) {
          return true // Stop polling
        }
      }
      return false // Continue polling
    } catch (error) {
      console.error('Error checking payment status:', error)
      return false // Continue polling on error
    }
  }, [transactionId, onSuccess])

  useEffect(() => {
    if (!isOpen || !transactionId) return

    // Initial check
    checkStatus()

    // Poll every 5 seconds
    const interval = setInterval(async () => {
      setPollingCount((prev) => prev + 1)
      
      const shouldStop = await checkStatus()
      
      if (shouldStop || pollingCount >= MAX_POLLING_ATTEMPTS) {
        clearInterval(interval)
        
        // If we reached max attempts and still pending, mark as expired
        if (pollingCount >= MAX_POLLING_ATTEMPTS && status?.status === 'PENDING') {
          setStatus((prev) => (prev ? { ...prev, status: 'EXPIRED' } : null))
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isOpen, transactionId, checkStatus, pollingCount, status?.status])

  if (!isOpen) return null

  const getStatusIcon = () => {
    if (loading || status?.status === 'PENDING') {
      return (
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto" />
      )
    }

    switch (status?.status) {
      case 'SUCCESS':
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'FAILED':
      case 'EXPIRED':
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      case 'CANCELLED':
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
            <svg className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  const getStatusTitle = () => {
    if (loading) return t.checkingStatus
    
    switch (status?.status) {
      case 'PENDING':
        return t.pending
      case 'SUCCESS':
        return t.success
      case 'FAILED':
        return t.failed
      case 'CANCELLED':
        return t.cancelled
      case 'EXPIRED':
        return t.expired
      default:
        return ''
    }
  }

  const getStatusMessage = () => {
    switch (status?.status) {
      case 'PENDING':
        return t.pendingMessage
      case 'SUCCESS':
        return t.successMessage
      case 'FAILED':
        return t.failedMessage
      case 'CANCELLED':
        return t.cancelledMessage
      case 'EXPIRED':
        return t.expiredMessage
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    switch (status?.status) {
      case 'SUCCESS':
        return 'bg-green-50 border-green-200'
      case 'FAILED':
      case 'EXPIRED':
        return 'bg-red-50 border-red-200'
      case 'CANCELLED':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm" />

        {/* Modal panel */}
        <div className="relative z-10 inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="text-center">
            {/* Icon */}
            <div className="mb-4">{getStatusIcon()}</div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{getStatusTitle()}</h3>

            {/* Message */}
            <p className="text-gray-600 mb-6">{getStatusMessage()}</p>

            {/* Transaction Details */}
            {status && (
              <div className={`border-2 rounded-lg p-4 mb-6 ${getStatusColor()}`}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">{t.plan}:</span>
                    <span className="font-semibold text-gray-900">{status.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">{t.amount}:</span>
                    <span className="font-semibold text-gray-900">
                      {status.amount.toLocaleString('en-TZ')} {status.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">{t.provider}:</span>
                    <span className="font-semibold text-gray-900">{status.provider}</span>
                  </div>
                  {status.failureReason && (
                    <div className="pt-2 border-t border-gray-300">
                      <span className="font-medium text-gray-600">{t.reason}:</span>
                      <p className="text-red-600 mt-1">{status.failureReason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {status?.status === 'SUCCESS' ? (
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  {t.close}
                </button>
              ) : status?.status === 'PENDING' ? (
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  {t.close}
                </button>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    {t.close}
                  </button>
                  <button
                    onClick={() => {
                      onClose()
                      // Parent should handle showing PaymentModal again
                    }}
                    className="flex-1 px-4 py-3 text-white bg-teal-600 rounded-lg hover:bg-teal-700 font-medium transition-colors"
                  >
                    {t.tryAgain}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


