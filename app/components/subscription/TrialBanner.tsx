'use client'

import { useState } from 'react'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface TrialBannerProps {
  daysRemaining: number
  onActivateClick: () => void
  onDismiss?: () => void
}

export default function TrialBanner({
  daysRemaining,
  onActivateClick,
  onDismiss
}: TrialBannerProps) {
  const { language } = useLanguage()
  const [isDismissed, setIsDismissed] = useState(false)

  const translations = {
    en: {
      trialEnding: 'Your free trial ends in',
      days: 'days',
      day: 'day',
      activateNow: 'Activate Plan',
      message: 'Choose a plan to continue using all features',
    },
    sw: {
      trialEnding: 'Kipindi cha majaribio kinaisha baada ya',
      days: 'siku',
      day: 'siku',
      activateNow: 'Washa Mpango',
      message: 'Chagua mpango kuendelea kutumia huduma zote',
    },
  }

  const t = translations[language]

  const handleDismiss = () => {
    setIsDismissed(true)
    if (onDismiss) onDismiss()
  }

  if (isDismissed) return null

  // Determine color based on days remaining
  let bgColor = 'bg-blue-50'
  let borderColor = 'border-blue-200'
  let textColor = 'text-blue-900'
  let buttonColor = 'bg-blue-600 hover:bg-blue-700'

  if (daysRemaining <= 3) {
    bgColor = 'bg-red-50'
    borderColor = 'border-red-200'
    textColor = 'text-red-900'
    buttonColor = 'bg-red-600 hover:bg-red-700'
  } else if (daysRemaining <= 7) {
    bgColor = 'bg-yellow-50'
    borderColor = 'border-yellow-200'
    textColor = 'text-yellow-900'
    buttonColor = 'bg-yellow-600 hover:bg-yellow-700'
  }

  return (
    <div className={`${bgColor} ${borderColor} border-l-4 p-4 relative`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SparklesIcon className={`w-6 h-6 ${textColor}`} />
          <div>
            <p className={`font-semibold ${textColor}`}>
              {t.trialEnding} {daysRemaining} {daysRemaining === 1 ? t.day : t.days}
            </p>
            <p className="text-sm text-gray-600 mt-1">{t.message}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onActivateClick}
            className={`${buttonColor} text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors`}
          >
            {t.activateNow}
          </button>

          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 bg-white rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            daysRemaining <= 3
              ? 'bg-red-600'
              : daysRemaining <= 7
              ? 'bg-yellow-600'
              : 'bg-blue-600'
          }`}
          style={{ width: `${Math.min(100, (daysRemaining / 30) * 100)}%` }}
        />
      </div>
    </div>
  )
}

