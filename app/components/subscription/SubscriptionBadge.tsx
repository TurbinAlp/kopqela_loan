'use client'

import { useLanguage } from '@/app/contexts/LanguageContext'

interface SubscriptionBadgeProps {
  planName: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  daysRemaining?: number
  compact?: boolean
}

export default function SubscriptionBadge({
  planName,
  status,
  daysRemaining,
  compact = false
}: SubscriptionBadgeProps) {
  const { language } = useLanguage()

  const translations = {
    en: {
      BASIC: 'Basic',
      PROFESSIONAL: 'Professional',
      ENTERPRISE: 'Enterprise',
      TRIAL: 'Trial',
      ACTIVE: 'Active',
      EXPIRED: 'Expired',
      CANCELLED: 'Cancelled',
      daysLeft: 'days left',
    },
    sw: {
      BASIC: 'Msingi',
      PROFESSIONAL: 'Kitaaluma',
      ENTERPRISE: 'Biashara Kubwa',
      TRIAL: 'Majaribio',
      ACTIVE: 'Inatumika',
      EXPIRED: 'Imeisha',
      CANCELLED: 'Imesitishwa',
      daysLeft: 'siku zimebaki',
    },
  }

  const t = translations[language]

  // Color schemes for different plans
  const planColors = {
    BASIC: 'bg-gray-100 text-gray-700 border-gray-300',
    PROFESSIONAL: 'bg-blue-100 text-blue-700 border-blue-300',
    ENTERPRISE: 'bg-purple-100 text-purple-700 border-purple-300',
  }

  // Color schemes for status
  const statusColors = {
    TRIAL: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    ACTIVE: 'bg-green-100 text-green-700 border-green-300',
    EXPIRED: 'bg-red-100 text-red-700 border-red-300',
    CANCELLED: 'bg-orange-100 text-orange-700 border-orange-300',
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-md border ${planColors[planName]}`}
        >
          {t[planName]}
        </span>
        {status === 'TRIAL' && daysRemaining !== undefined && (
          <span className="text-xs text-gray-600">
            {daysRemaining} {t.daysLeft}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span
          className={`px-3 py-1.5 text-sm font-semibold rounded-lg border ${planColors[planName]}`}
        >
          {t[planName]}
        </span>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-md border ${statusColors[status]}`}
        >
          {t[status]}
        </span>
      </div>
      {status === 'TRIAL' && daysRemaining !== undefined && (
        <p className="text-xs text-gray-600">
          {daysRemaining} {t.daysLeft}
        </p>
      )}
    </div>
  )
}

