'use client'

import { useLanguage } from '@/app/contexts/LanguageContext'
import { CheckIcon } from '@heroicons/react/24/outline'

interface PlanFeatures {
  max_businesses: number | null
  max_stores_per_business: number | null
  max_users_per_business: number | null
  enable_credit_sales: boolean
  enable_advanced_reports: boolean
  enable_accounting: boolean
}

interface PlanCardProps {
  name: string
  displayName: string
  displayNameSwahili?: string
  price: number
  features: PlanFeatures
  isCurrentPlan?: boolean
  isPopular?: boolean
  onSelect?: () => void
  disabled?: boolean
}

export default function PlanCard({
  name,
  displayName,
  displayNameSwahili,
  price,
  features,
  isCurrentPlan = false,
  isPopular = false,
  onSelect,
  disabled = false
}: PlanCardProps) {
  const { language } = useLanguage()

  const translations = {
    en: {
      currentPlan: 'Current Plan',
      selectPlan: 'Select Plan',
      upgrade: 'Upgrade',
      downgrade: 'Downgrade',
      popular: 'Most Popular',
      perMonth: '/month',
      businesses: 'business',
      businessesPlural: 'businesses',
      stores: 'store per business',
      storesPlural: 'stores per business',
      users: 'user',
      usersPlural: 'users',
      unlimited: 'Unlimited',
      creditSales: 'Credit Sales',
      advancedReports: 'Advanced Reports',
      accounting: 'Accounting System',
      basicFeatures: 'Basic Features',
      included: 'Included',
      notIncluded: 'Not Included',
    },
    sw: {
      currentPlan: 'Mpango wa Sasa',
      selectPlan: 'Chagua Mpango',
      upgrade: 'Panda',
      downgrade: 'Shuka',
      popular: 'Maarufu Zaidi',
      perMonth: '/mwezi',
      businesses: 'biashara',
      businessesPlural: 'biashara',
      stores: 'duka kwa biashara',
      storesPlural: 'maduka kwa biashara',
      users: 'mtumiaji',
      usersPlural: 'watumiaji',
      unlimited: 'Bila Kikomo',
      creditSales: 'Mauzo ya Mikopo',
      advancedReports: 'Ripoti za Kina',
      accounting: 'Mfumo wa Uhasibu',
      basicFeatures: 'Vipengele vya Msingi',
      included: 'Inajumuishwa',
      notIncluded: 'Haijumuishwi',
    },
  }

  const t = translations[language]
  const planDisplayName = language === 'sw' && displayNameSwahili ? displayNameSwahili : displayName

  const formatNumber = (num: number | null, singular: string, plural: string) => {
    if (num === null) return t.unlimited
    return `${num} ${num === 1 ? singular : plural}`
  }

  const featuresList = [
    {
      label: formatNumber(features.max_businesses, t.businesses, t.businessesPlural),
      included: true,
    },
    {
      label: formatNumber(features.max_stores_per_business, t.stores, t.storesPlural),
      included: true,
    },
    {
      label: formatNumber(features.max_users_per_business, t.users, t.usersPlural),
      included: true,
    },
    {
      label: t.creditSales,
      included: features.enable_credit_sales,
    },
    {
      label: t.advancedReports,
      included: features.enable_advanced_reports,
    },
    {
      label: t.accounting,
      included: features.enable_accounting,
    },
  ]

  return (
    <div
      className={`relative rounded-xl border-2 p-6 transition-all ${
        isCurrentPlan
          ? 'border-teal-600 bg-teal-50'
          : isPopular
          ? 'border-blue-600 shadow-lg'
          : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
      }`}
    >
      {/* Popular badge */}
      {isPopular && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {t.popular}
          </span>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {t.currentPlan}
          </span>
        </div>
      )}

      {/* Plan name */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">{planDisplayName}</h3>
      </div>

      {/* Pricing */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-bold text-gray-900">
            {price.toLocaleString('en-TZ')}
          </span>
          <span className="text-gray-600 font-medium">TZS</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{t.perMonth}</p>
      </div>

      {/* Features list */}
      <ul className="space-y-3 mb-6">
        {featuresList.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckIcon
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                feature.included ? 'text-teal-600' : 'text-gray-300'
              }`}
            />
            <span
              className={`text-sm ${
                feature.included ? 'text-gray-700' : 'text-gray-400 line-through'
              }`}
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      {/* Action button */}
      <button
        onClick={onSelect}
        disabled={disabled || isCurrentPlan}
        className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors ${
          isCurrentPlan
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : isPopular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-teal-600 text-white hover:bg-teal-700'
        } ${disabled && !isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isCurrentPlan ? t.currentPlan : t.selectPlan}
      </button>
    </div>
  )
}

