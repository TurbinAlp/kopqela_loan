'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { useBusiness } from '@/app/contexts/BusinessContext'
import SubscriptionBadge from '@/app/components/subscription/SubscriptionBadge'
import PlanCard from '@/app/components/subscription/PlanCard'
import UsageIndicator from '@/app/components/subscription/UsageIndicator'
import { useNotifications } from '@/app/contexts/NotificationContext'

interface Plan {
  id: number
  name: string
  displayName: string
  displayNameSwahili?: string
  priceMonthly: number
  features: {
    max_businesses: number | null
    max_stores_per_business: number | null
    max_users_per_business: number | null
    enable_credit_sales: boolean
    enable_advanced_reports: boolean
    enable_accounting: boolean
  }
}

interface SubscriptionData {
  hasSubscription: boolean
  subscription: {
    id: number
    status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
    planName: string
    planDisplayName: string
    planDisplayNameSwahili?: string
    priceMonthly: number
    billingCycle: 'MONTHLY' | 'YEARLY'
    currentPeriodEnd: string
    trialEndsAt?: string
    features: Record<string, unknown>
  } | null
  status: {
    isActive: boolean
    isTrial: boolean
    isExpired: boolean
    isCancelled: boolean
    daysRemaining: number
  } | null
  usage: {
    businesses: number
    stores: number
    users: number
  } | null
  limits: {
    max_businesses: number | null
    max_stores_per_business: number | null
    max_users_per_business: number | null
  } | null
}

export default function SubscriptionPage() {
  const { language } = useLanguage()
  const { currentBusiness } = useBusiness()
  const { showSuccess, showError } = useNotifications()
  
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)

  const translations = {
    en: {
      title: 'Subscription & Billing',
      currentPlan: 'Current Plan',
      usage: 'Usage',
      availablePlans: 'Available Plans',
      loading: 'Loading...',
      businesses: 'Businesses',
      stores: 'Stores',
      users: 'Users',
      activatePlan: 'Activate This Plan',
      trialEndsIn: 'Trial ends in',
      days: 'days',
      expired: 'Your subscription has expired',
      cancelled: 'Subscription cancelled',
      activePlan: 'Active plan',
      selectPlanPrompt: 'Select a plan below to activate your subscription',
      confirmActivation: 'Are you sure you want to activate',
      thisWillCharge: 'This will be charged immediately',
      perMonth: '/month',
      cancel: 'Cancel',
      confirm: 'Confirm Activation',
      activationSuccess: 'Plan activated successfully!',
      activationError: 'Failed to activate plan',
      noSubscription: 'No active subscription',
    },
    sw: {
      title: 'Usajili & Malipo',
      currentPlan: 'Mpango wa Sasa',
      usage: 'Matumizi',
      availablePlans: 'Mipango Inayopatikana',
      loading: 'Inapakia...',
      businesses: 'Biashara',
      stores: 'Maduka',
      users: 'Watumiaji',
      activatePlan: 'Washa Mpango Huu',
      trialEndsIn: 'Majaribio yanaisha baada ya',
      days: 'siku',
      expired: 'Usajili wako umeisha',
      cancelled: 'Usajili umesitishwa',
      activePlan: 'Mpango unaotumika',
      selectPlanPrompt: 'Chagua mpango hapa chini kuwasha usajili wako',
      confirmActivation: 'Una uhakika unataka kuwasha',
      thisWillCharge: 'Hii italipishwa mara moja',
      perMonth: '/mwezi',
      cancel: 'Ghairi',
      confirm: 'Thibitisha Kuwasha',
      activationSuccess: 'Mpango umewashwa kwa mafanikio!',
      activationError: 'Imeshindwa kuwasha mpango',
      noSubscription: 'Hakuna usajili unaotumika',
    },
  }

  const t = translations[language]

  // Fetch subscription data
  useEffect(() => {
    if (!currentBusiness) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch current subscription
        const subResponse = await fetch(
          `/api/admin/subscription/current?businessId=${currentBusiness.id}`
        )
        const subData = await subResponse.json()

        if (subData.success) {
          setSubscriptionData(subData.data)
        }

        // Fetch available plans
        const plansResponse = await fetch('/api/subscription/plans')
        const plansData = await plansResponse.json()

        if (plansData.success) {
          setPlans(plansData.data)
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error)
        showError('Error', 'Failed to load subscription data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentBusiness, showError])

  const handleActivatePlan = async (planId: number, planName: string) => {
    if (!currentBusiness) return

    const confirmed = window.confirm(
      `${t.confirmActivation} ${planName}?\n\n${t.thisWillCharge}`
    )

    if (!confirmed) return

    try {
      setActivating(true)

      const response = await fetch('/api/admin/subscription/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: currentBusiness.id,
          planId,
          billingCycle: 'MONTHLY',
        }),
      })

      const data = await response.json()

      if (data.success) {
        showSuccess('Success', t.activationSuccess)
        
        // Reload page to refresh subscription data in layout
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        showError('Error', data.error || t.activationError)
      }
    } catch (error) {
      console.error('Error activating plan:', error)
      showError('Error', t.activationError)
    } finally {
      setActivating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>

      {/* Expired Subscription Warning */}
      {subscriptionData?.status?.isExpired && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                {language === 'en' ? 'Subscription Expired' : 'Usajili Umeisha'}
              </h3>
              <p className="text-sm text-red-700 mb-3">
                {language === 'en' 
                  ? 'Your free trial has ended. Please activate a plan below to continue using the system.' 
                  : 'Kipindi cha majaribio kimeisha. Tafadhali chagua na washa mpango ili kuendelea kutumia mfumo.'}
              </p>
              <div className="flex items-center gap-2 text-sm text-red-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">
                  {language === 'en' ? 'Select a plan below to activate' : 'Chagua mpango hapo chini kuwasha'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription Card */}
      {subscriptionData?.hasSubscription && subscriptionData.subscription ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t.currentPlan}
          </h2>

          <div className="flex items-start justify-between mb-6">
            <div>
              <SubscriptionBadge
                planName={subscriptionData.subscription.planName as 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'}
                status={subscriptionData.subscription.status}
                daysRemaining={subscriptionData.status?.daysRemaining}
              />
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptionData.subscription.priceMonthly.toLocaleString('en-TZ')} TZS
                  <span className="text-sm font-normal text-gray-600">
                    {t.perMonth}
                  </span>
                </p>
              </div>
            </div>

            {subscriptionData.status?.isTrial && (
              <div className="text-right">
                <p className="text-sm text-yellow-600 font-medium">
                  {t.trialEndsIn} {subscriptionData.status.daysRemaining} {t.days}
                </p>
              </div>
            )}
          </div>

          {/* Usage Stats */}
          {subscriptionData.usage && subscriptionData.limits && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {t.usage}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <UsageIndicator
                  label={t.businesses}
                  current={subscriptionData.usage.businesses}
                  limit={subscriptionData.limits.max_businesses}
                  showUpgradePrompt={false}
                />
                <UsageIndicator
                  label={t.stores}
                  current={subscriptionData.usage.stores}
                  limit={subscriptionData.limits.max_stores_per_business}
                  showUpgradePrompt={false}
                />
                <UsageIndicator
                  label={t.users}
                  current={subscriptionData.usage.users}
                  limit={subscriptionData.limits.max_users_per_business}
                  showUpgradePrompt={false}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">{t.noSubscription}</p>
          <p className="text-sm text-yellow-600 mt-1">
            {t.selectPlanPrompt}
          </p>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t.availablePlans}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              displayName={plan.displayName}
              displayNameSwahili={plan.displayNameSwahili}
              price={Number(plan.priceMonthly)}
              features={plan.features}
              isCurrentPlan={
                subscriptionData?.subscription?.planName === plan.name &&
                subscriptionData?.status?.isActive === true
              }
              isPopular={index === 1} // Make middle plan popular
              onSelect={() => handleActivatePlan(plan.id, plan.displayName)}
              disabled={activating}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

