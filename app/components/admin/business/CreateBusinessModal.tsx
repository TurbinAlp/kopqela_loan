'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import { BuildingOfficeIcon, CheckIcon, GlobeAltIcon, LinkIcon, MapPinIcon, PhoneIcon, InboxIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'

interface CreateBusinessModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (businessId: number) => void
}

interface SubscriptionPlan {
  id: number
  name: string
  displayName: string
  displayNameSwahili?: string
  description?: string
  descriptionSwahili?: string
  priceMonthly: number
  features: {
    max_businesses?: number
    max_stores_per_business?: number
    max_users_per_business?: number
    enable_credit_sales?: boolean
    advanced_reports?: boolean
  }
}

type BusinessTypeOption = {
  label: string
  value: string
  labelSw: string
}

const BUSINESS_TYPES: BusinessTypeOption[] = [
  { value: 'RETAIL', label: 'Retail', labelSw: 'Rejareja' },
  { value: 'WHOLESALE', label: 'Wholesale', labelSw: 'Jumla' },
  { value: 'BOTH', label: 'Both (Wholesale & Retail)', labelSw: 'Zote (Jumla & Rejareja)' }
]

type BusinessCategoryOption = {
  value: string
  label: string
  labelSw: string
}

const BUSINESS_CATEGORIES: BusinessCategoryOption[] = [
  { value: 'GROCERY', label: 'Grocery', labelSw: 'Vyakula & Mboga' },
  { value: 'ELECTRONICS', label: 'Electronics', labelSw: 'Vifaa vya Umeme' },
  { value: 'FASHION', label: 'Fashion', labelSw: 'Nguo & Mitindo' },
  { value: 'PHARMACY', label: 'Pharmacy', labelSw: 'Duka la Dawa' },
  { value: 'RESTAURANT', label: 'Restaurant', labelSw: 'Mgahawa' },
  { value: 'SERVICE', label: 'Service', labelSw: 'Huduma' },
  { value: 'OTHER', label: 'Other', labelSw: 'Nyingine' }
]

export default function CreateBusinessModal({ isOpen, onClose, onCreated }: CreateBusinessModalProps) {
  const { language } = useLanguage()
  const { showSuccess, showError } = useNotifications()

  const t = useMemo(() => ({
    en: {
      title: 'Create your business',
      subtitle: 'Add basic details to get started. You can change settings later.',
      businessName: 'Business name',
      businessType: 'Business type',
      businessCategory: 'Business category (optional)',
      slug: 'Business slug',
      email: 'Email (optional)',
      phone: 'Phone (optional)',
      address: 'Address (optional)',
      city: 'City (optional)',
      website: 'Website (optional)',
      cancel: 'Cancel',
      create: 'Create Business',
      creating: 'Creating...',
      nameRequired: 'Business name is required',
      typeRequired: 'Business type is required',
      slugRequired: 'Slug is required',
      slugHint: 'Used in the store URL. Only letters, numbers, and hyphens.',
      successTitle: 'Success',
      successBody: 'Business created successfully',
      slugExists: 'Business slug already exists, choose another',
      namePlaceholder: 'e.g. Koppela Mini Mart',
      slugPlaceholder: 'e.g. koppela-mini-mart',
      selectOption: 'Select...'
    },
    sw: {
      title: 'Tengeneza biashara yako',
      subtitle: 'Ongeza taarifa za msingi uanze. Unaweza kubadilisha baadaye.',
      businessName: 'Jina la biashara',
      businessType: 'Aina ya biashara',
      businessCategory: 'Kundi la biashara (hiari)',
      slug: 'Slug ya biashara',
      email: 'Barua pepe (hiari)',
      phone: 'Simu (hiari)',
      address: 'Anuani (hiari)',
      city: 'Jiji/Mji (hiari)',
      website: 'Tovuti (hiari)',
      cancel: 'Ghairi',
      create: 'Tengeneza Biashara',
      creating: 'Inatengeneza...',
      nameRequired: 'Jina la biashara linahitajika',
      typeRequired: 'Aina ya biashara inahitajika',
      slugRequired: 'Slug inahitajika',
      slugHint: 'Hutumika kwenye URL. Herufi, namba na alama ya kiungo (-) tu.',
      successTitle: 'Imefanikiwa',
      successBody: 'Biashara imetengenezwa ipasavyo',
      slugExists: 'Slug ya biashara tayari ipo, chagua nyingine',
      namePlaceholder: 'mf. Koppela Mini Mart',
      slugPlaceholder: 'mf. koppela-mini-mart',
      selectOption: 'Chagua...'
    }
  })[language], [language])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Multi-step wizard state
  const [currentStep, setCurrentStep] = useState(1) // 1 = plan selection, 2 = business details
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)

  const [name, setName] = useState('')
  const [businessType, setBusinessType] = useState<string>('RETAIL')
  const [businessCategory, setBusinessCategory] = useState<string>('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [website, setWebsite] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Fetch available plans
      const fetchPlans = async () => {
        setLoadingPlans(true)
        try {
          const response = await fetch('/api/subscription/plans')
          const data = await response.json()
          if (data.success) {
            setPlans(data.data)
            // DO NOT pre-select - user MUST choose
            setSelectedPlanId(null)
          }
        } catch (error) {
          console.error('Error fetching plans:', error)
        } finally {
          setLoadingPlans(false)
        }
      }
      fetchPlans()
    } else {
      // Reset all state including step
      setCurrentStep(1)
      setSelectedPlanId(null)
      setPlans([])
    }
    
    if (!isOpen) {
      // Reset form when closed
      setIsSubmitting(false)
      setErrors({})
      setName('')
      setBusinessType('RETAIL')
      setBusinessCategory('')
      setSlug('')
      setSlugManuallyEdited(false)
      setEmail('')
      setPhone('')
      setAddress('')
      setCity('')
      setWebsite('')
    }
  }, [isOpen])

  useEffect(() => {
    // Auto-generate slug from name in real-time until user edits slug manually
    if (!slugManuallyEdited) {
      setSlug(autoSlug(name))
    }
  }, [name, slugManuallyEdited])

  const autoSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = t.nameRequired
    if (!businessType.trim()) newErrors.businessType = t.typeRequired
    if (!slug.trim()) newErrors.slug = t.slugRequired
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/business/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          businessType: businessType.trim(),
          businessCategory: businessCategory || undefined,
          slug: slug.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          website: website.trim() || undefined,
          planId: selectedPlanId // NEW: Send selected plan
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        const message = data?.message || 'Failed to create business'
        if (message.toLowerCase().includes('slug') && message.toLowerCase().includes('exists')) {
          setErrors(prev => ({ ...prev, slug: t.slugExists }))
        }
        showError(t.successTitle, message)
        return
      }

      showSuccess(t.successTitle, t.successBody)
      const createdId: number = data.data?.business?.id
      onCreated(createdId)
      onClose()
    } catch (error) {
      console.error('Error creating business:', error)
      showError(t.successTitle, 'Failed to create business')
    } finally {
      setIsSubmitting(false)
    }
  }

  const typeOptions = BUSINESS_TYPES.map(opt => (
    <option key={opt.value} value={opt.value}>
      {language === 'sw' ? opt.labelSw : opt.label}
    </option>
  ))
  const categoryOptions = BUSINESS_CATEGORIES.map(opt => (
    <option key={opt.value} value={opt.value}>
      {language === 'sw' ? opt.labelSw : opt.label}
    </option>
  ))

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => { /* Block close to force creation */ }}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden bg-white text-left align-middle shadow-xl transition-all rounded-2xl">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-8 text-white rounded-t-2xl">
                  {/* Close disabled to enforce creation */}
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <BuildingOfficeIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-2xl font-bold">
                        {t.title}
                      </Dialog.Title>
                      <p className="text-teal-100 mt-1">{t.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center space-x-4 px-6 pt-6 pb-2">
                  <div className={`flex items-center ${currentStep >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>
                      1
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {language === 'en' ? 'Choose Plan' : 'Chagua Mpango'}
                    </span>
                  </div>
                  <div className={`h-0.5 w-12 ${currentStep >= 2 ? 'bg-teal-600' : 'bg-gray-300'}`} />
                  <div className={`flex items-center ${currentStep >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>
                      2
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {language === 'en' ? 'Business Details' : 'Taarifa za Biashara'}
                    </span>
                  </div>
                </div>

                {/* Step 1: Plan Selection */}
                {currentStep === 1 && (
                  <div className="px-6 py-6 space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {language === 'en' ? 'Choose Your Plan' : 'Chagua Mpango Wako'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {language === 'en' 
                          ? 'Select a plan to start your 30-day free trial. You can upgrade or downgrade anytime.'
                          : 'Chagua mpango kuanza majaribio ya siku 30 bure. Unaweza kubadilisha wakati wowote.'}
                      </p>
                    </div>

                    {loadingPlans ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
                      </div>
                    ) : (
                      <div className="grid gap-4 max-h-96 overflow-y-auto">
                        {plans.map((plan) => (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`relative p-4 border-2 rounded-lg text-left transition-all ${
                              selectedPlanId === plan.id
                                ? 'border-teal-600 bg-teal-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {selectedPlanId === plan.id && (
                              <div className="absolute top-4 right-4">
                                <CheckIcon className="w-6 h-6 text-teal-600" />
                              </div>
                            )}
                            <div className="pr-10">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {language === 'en' ? plan.displayName : (plan.displayNameSwahili || plan.displayName)}
                              </h4>
                              <p className="text-2xl font-bold text-teal-600 mt-1">
                                {plan.priceMonthly.toLocaleString('en-TZ')} TZS
                                <span className="text-sm font-normal text-gray-600">
                                  {language === 'en' ? '/month' : '/mwezi'}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600 mt-2">
                                {language === 'en' ? plan.description : (plan.descriptionSwahili || plan.description)}
                              </p>
                              
                              {/* Key Features */}
                              <div className="mt-3 space-y-1">
                                {plan.features?.max_businesses && (
                                  <div className="text-xs text-gray-700">
                                    • {plan.features.max_businesses} {language === 'en' ? 'business(es)' : 'biashara'}
                                  </div>
                                )}
                                {plan.features?.max_stores_per_business && (
                                  <div className="text-xs text-gray-700">
                                    • {plan.features.max_stores_per_business} {language === 'en' ? 'store(s) per business' : 'duka kwa biashara'}
                                  </div>
                                )}
                                {plan.features?.max_users_per_business && (
                                  <div className="text-xs text-gray-700">
                                    • {plan.features.max_users_per_business === 999 ? (language === 'en' ? 'Unlimited users' : 'Watumiaji wasiojulikana') : `${plan.features.max_users_per_business} ${language === 'en' ? 'users' : 'watumiaji'}`}
                                  </div>
                                )}
                                {plan.features?.enable_credit_sales && (
                                  <div className="text-xs text-gray-700">
                                    • {language === 'en' ? 'Credit sales' : 'Mauzo ya mkopo'}
                                  </div>
                                )}
                                {plan.features?.advanced_reports && (
                                  <div className="text-xs text-gray-700">
                                    • {language === 'en' ? 'Advanced reports' : 'Ripoti za kina'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        disabled={!selectedPlanId}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {language === 'en' ? 'Next' : 'Endelea'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Business Details */}
                {currentStep === 2 && (
                <form onSubmit={handleCreate} className="px-6 py-6 max-h-96 overflow-y-auto space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left column */}
                    <div className="space-y-4">
                      {/* Business name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.businessName} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.namePlaceholder}
                            className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-900 placeholder-gray-500 bg-white ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                            disabled={isSubmitting}
                          />
                          {name.trim() && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                              <CheckIcon className="w-5 h-5 text-green-500" />
                            </motion.div>
                          )}
                        </div>
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      {/* Business type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.businessType} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                          disabled={isSubmitting}
                        >
                          {typeOptions}
                        </select>
                        {errors.businessType && (
                          <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>
                        )}
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                      {/* Business category (optional) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.businessCategory}</label>
                        <select
                          value={businessCategory}
                          onChange={(e) => setBusinessCategory(e.target.value)}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                          disabled={isSubmitting}
                        >
                          <option value="">{t.selectOption}</option>
                          {categoryOptions}
                        </select>
                      </div>
                      {/* Slug */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.slug} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={slug}
                            onChange={(e) => { 
                              setSlugManuallyEdited(true); 
                              if (errors.slug) {
                                const nextErrors = { ...errors }
                                delete nextErrors.slug
                                setErrors(nextErrors)
                              }
                              setSlug(autoSlug(e.target.value)) 
                            }}
                            placeholder={t.slugPlaceholder}
                            className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-900 placeholder-gray-500 bg-white ${errors.slug ? 'border-red-300' : 'border-gray-300'}`}
                            disabled={isSubmitting}
                          />
                          <LinkIcon className="w-5 h-5 text-gray-400 absolute right-10 top-1/2 -translate-y-1/2" />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{t.slugHint}</p>
                        {errors.slug && (
                          <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional basics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                        <div className="relative">
                          <InboxIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone}</label>
                        <div className="relative">
                          <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.address}</label>
                        <div className="relative">
                          <MapPinIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.city}</label>
                        <div className="relative">
                          <GlobeAltIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      {language === 'en' ? 'Back' : 'Rudi'}
                    </button>
                    <div className="flex space-x-3">
                      <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                      >
                        {isSubmitting ? t.creating : t.create}
                      </button>
                    </div>
                  </div>
                </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}


