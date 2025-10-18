'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/contexts/LanguageContext'

interface PaymentHistoryProps {
  businessId: number
}

interface Transaction {
  id: number
  reference: string
  planName: string
  planNameSwahili?: string
  amount: number
  currency: string
  provider: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED'
  phoneNumber: string
  initiatedAt: string
  completedAt?: string
  failureReason?: string
}

export default function PaymentHistory({ businessId }: PaymentHistoryProps) {
  const { language } = useLanguage()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const translations = {
    en: {
      title: 'Payment History',
      noTransactions: 'No payment transactions yet',
      filter: 'Filter',
      all: 'All',
      success: 'Successful',
      pending: 'Pending',
      failed: 'Failed',
      date: 'Date',
      plan: 'Plan',
      amount: 'Amount',
      provider: 'Provider',
      status: 'Status',
      loading: 'Loading...',
    },
    sw: {
      title: 'Historia ya Malipo',
      noTransactions: 'Hakuna malipo bado',
      filter: 'Chuja',
      all: 'Yote',
      success: 'Yamefanikiwa',
      pending: 'Yanasubiri',
      failed: 'Yameshindikana',
      date: 'Tarehe',
      plan: 'Mpango',
      amount: 'Kiasi',
      provider: 'Mtoa Huduma',
      status: 'Hali',
      loading: 'Inapakia...',
    },
  }

  const t = translations[language]

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const statusParam = filter !== 'all' ? `&status=${filter.toUpperCase()}` : ''
        const response = await fetch(
          `/api/payments/transactions?businessId=${businessId}${statusParam}`
        )
        const data = await response.json()

        if (data.success) {
          setTransactions(data.data.transactions)
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [businessId, filter])

  const getStatusBadge = (status: string) => {
    const badges = {
      SUCCESS: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      FAILED: 'bg-red-100 text-red-800 border-red-200',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
      EXPIRED: 'bg-orange-100 text-orange-800 border-orange-200',
    }

    const statusText = {
      SUCCESS: language === 'en' ? 'Success' : 'Imefanikiwa',
      PENDING: language === 'en' ? 'Pending' : 'Inasubiri',
      FAILED: language === 'en' ? 'Failed' : 'Imeshindikana',
      CANCELLED: language === 'en' ? 'Cancelled' : 'Imesitishwa',
      EXPIRED: language === 'en' ? 'Expired' : 'Imeisha',
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
          badges[status as keyof typeof badges] || badges.PENDING
        }`}
      >
        {statusText[status as keyof typeof statusText] || status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'sw-TZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.title}</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{t.title}</h2>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">{t.filter}:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">{t.all}</option>
            <option value="success">{t.success}</option>
            <option value="pending">{t.pending}</option>
            <option value="failed">{t.failed}</option>
          </select>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t.noTransactions}</h3>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.date}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.plan}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.amount}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.provider}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.status}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(transaction.initiatedAt)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {language === 'sw' && transaction.planNameSwahili
                      ? transaction.planNameSwahili
                      : transaction.planName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {transaction.amount.toLocaleString('en-TZ')} {transaction.currency}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {transaction.provider}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(transaction.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


