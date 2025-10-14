'use client'

import { useLanguage } from '@/app/contexts/LanguageContext'

interface UsageIndicatorProps {
  label: string
  current: number
  limit: number | null
  showUpgradePrompt?: boolean
  onUpgradeClick?: () => void
}

export default function UsageIndicator({
  label,
  current,
  limit,
  showUpgradePrompt = true,
  onUpgradeClick
}: UsageIndicatorProps) {
  const { language } = useLanguage()

  const translations = {
    en: {
      unlimited: 'Unlimited',
      upgrade: 'Upgrade for more',
      atLimit: 'Limit reached',
    },
    sw: {
      unlimited: 'Bila Kikomo',
      upgrade: 'Panda kwa zaidi',
      atLimit: 'Kikomo kimefikiwa',
    },
  }

  const t = translations[language]

  // Calculate percentage
  const percentage = limit === null ? 0 : Math.min(100, (current / limit) * 100)
  const isAtLimit = limit !== null && current >= limit
  const isApproaching = limit !== null && percentage >= 80 && percentage < 100

  // Determine color based on usage
  let progressColor = 'bg-teal-600'
  let bgColor = 'bg-gray-200'
  let textColor = 'text-gray-700'

  if (isAtLimit) {
    progressColor = 'bg-red-600'
    textColor = 'text-red-700'
  } else if (isApproaching) {
    progressColor = 'bg-yellow-600'
    textColor = 'text-yellow-700'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-semibold ${textColor}`}>
          {current} / {limit === null ? t.unlimited : limit}
        </span>
      </div>

      {/* Progress bar */}
      <div className={`w-full ${bgColor} rounded-full h-2.5`}>
        <div
          className={`${progressColor} h-2.5 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Upgrade prompt */}
      {showUpgradePrompt && isAtLimit && onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          {t.upgrade}
        </button>
      )}

      {isAtLimit && !onUpgradeClick && (
        <p className="text-xs text-red-600 font-medium">{t.atLimit}</p>
      )}
    </div>
  )
}

