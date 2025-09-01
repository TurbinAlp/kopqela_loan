'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BuildingOfficeIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'

interface BusinessFormData {
  // Business Basic Info
  name: string
  businessType: string
  slug: string
  
  // Business Settings
  description: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  region: string
  country: string
  postalCode: string
  registrationNumber: string
  
  // Financial Settings
  currency: string
  wholesaleMargin: number
  retailMargin: number
  taxRate: number
  
  // Feature Toggles
  enableTaxCalculation: boolean
  enableInventoryTracking: boolean
  enableCreditSales: boolean
  enableLoyaltyProgram: boolean
}

export default function AddBusinessPage() {
  const { language } = useLanguage()
  const { showSuccess, showError } = useNotifications()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const progressNavRef = useRef<HTMLDivElement>(null)
  
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    businessType: '',
    slug: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    region: '',
    country: 'Tanzania',
    postalCode: '',
    registrationNumber: '',
    currency: 'TZS',
    wholesaleMargin: 30,
    retailMargin: 50,
    taxRate: 18,
    enableTaxCalculation: true,
    enableInventoryTracking: true,
    enableCreditSales: false,
    enableLoyaltyProgram: false
  })

  const translations = {
    en: {
      
      // Steps
      step1: 'Basic Information',
      step2: 'Business Details',
      step3: 'Financial Settings',
      
      // Basic Info
      businessName: 'Business Name',
      businessType: 'Business Type',
      businessSlug: 'Business Slug',
      slugHelper: 'URL-friendly identifier (auto-generated from name)',
      
      // Business Details  
      description: 'Business Description',
      email: 'Business Email',
      phone: 'Business Phone',
      website: 'Website',
      address: 'Street Address',
      city: 'City',
      region: 'Region/State',
      country: 'Country',
      postalCode: 'Postal Code',
      registrationNumber: 'Registration Number',
      
      // Financial
      currency: 'Currency',
      wholesaleMargin: 'Wholesale Margin (%)',
      retailMargin: 'Retail Margin (%)',
      taxRate: 'Tax Rate (%)',
      
      // Features
      enableTaxCalculation: 'Enable Tax Calculation',
      enableInventoryTracking: 'Enable Inventory Tracking',
      enableCreditSales: 'Enable Credit Sales',
      enableLoyaltyProgram: 'Enable Loyalty Program',
      
      // Actions
      nextStep: 'Next Step',
      previousStep: 'Previous Step',
      createBusiness: 'Create Business',
      creating: 'Creating...',
      
      // Messages
      businessCreated: 'Business created successfully',
      businessError: 'Failed to create business'
    },
    sw: {
      
      // Steps
      step1: 'Taarifa za Msingi',
      step2: 'Maelezo ya Biashara',
      step3: 'Mipangilio ya Kifedha',
      
      // Basic Info
      businessName: 'Jina la Biashara',
      businessType: 'Aina ya Biashara',
      businessSlug: 'Kitambulisho cha Biashara',
      slugHelper: 'Kitambulisho cha URL (kinaundwa kiotomatiki kutoka jina)',
      
      // Business Details
      description: 'Maelezo ya Biashara',
      email: 'Barua Pepe ya Biashara',
      phone: 'Simu ya Biashara',
      website: 'Tovuti',
      address: 'Anwani ya Mtaa',
      city: 'Jiji',
      region: 'Mkoa',
      country: 'Nchi',
      postalCode: 'Nambari ya Posta',
      registrationNumber: 'Nambari ya Usajili',
      
      // Financial
      currency: 'Sarafu',
      wholesaleMargin: 'Faida ya Jumla (%)',
      retailMargin: 'Faida ya Rejareja (%)',
      taxRate: 'Kiwango cha Ushuru (%)',
      
      // Features
      enableTaxCalculation: 'Wezesha Hesabu ya Ushuru',
      enableInventoryTracking: 'Wezesha Ufuatiliaji wa Hisa',
      enableCreditSales: 'Wezesha Mauzo ya Mikopo',
      enableLoyaltyProgram: 'Wezesha Mpango wa Uongozi',
      
      // Actions
      nextStep: 'Hatua Ijayo',
      previousStep: 'Hatua Iliyopita',
      createBusiness: 'Unda Biashara',
      creating: 'Inaunda...',
      
      // Messages
      businessCreated: 'Biashara imeundwa',
      businessError: 'Imeshindwa kuunda biashara'
    }
  }

  const t = translations[language]

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50)
  }

  const scrollStepIntoView = (stepNumber: number) => {
    if (progressNavRef.current) {
      const activeStep = progressNavRef.current.querySelector(`[data-step="${stepNumber}"]`)
      if (activeStep) {
        activeStep.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }

  const handleInputChange = (field: keyof BusinessFormData, value: string | number | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-generate slug when name changes
      if (field === 'name' && typeof value === 'string') {
        updated.slug = generateSlug(value)
      }
      
      return updated
    })
  }

  const handleNextStep = () => {
    if (currentStep < 3) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      setTimeout(() => scrollStepIntoView(newStep), 100)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      setTimeout(() => scrollStepIntoView(newStep), 100)
    }
  }

  const handleStepClick = (stepNumber: number) => {
    // Allow navigation to any step
    setCurrentStep(stepNumber)
    setTimeout(() => scrollStepIntoView(stepNumber), 100)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      console.log('Submitting form data:', formData)
      
      // Here you would call your API to create the business
      const response = await fetch('/api/admin/business/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      console.log('API Response:', data)
      
      if (data.success) {
        showSuccess(t.businessCreated, '')
        // Redirect to business list or dashboard
        window.location.href = '/admin/business'
      } else {
        console.error('API Error:', data)
        showError(t.businessError, data.message || 'Unknown error')
      }
    } catch (error) {
      console.error('Network Error:', error)
      showError(t.businessError, 'Network error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: t.step1 },
    { number: 2, title: t.step2 },
    { number: 3, title: t.step3 }
  ]

  // Auto-scroll to current step when component loads or step changes
  useEffect(() => {
    scrollStepIntoView(currentStep)
  }, [currentStep])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
    >


      {/* Progress Steps */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav 
            ref={progressNavRef}
            aria-label="Progress"
            className="flex overflow-x-auto scrollbar-hide space-x-6 sm:space-x-8 pb-2 sm:pb-0 snap-x snap-mandatory"
            style={{ 
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {steps.map((step, stepIdx) => (
              <button
                key={step.number}
                data-step={step.number}
                onClick={() => handleStepClick(step.number)}
                className="flex items-center justify-center space-x-3 py-4 px-3 sm:px-1 whitespace-nowrap flex-shrink-0 min-w-max snap-start transition-colors hover:bg-gray-50 rounded-lg"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0 ${
                  step.number === currentStep
                    ? 'border-teal-600 bg-teal-600 text-white'
                    : step.number < currentStep
                    ? 'border-teal-600 bg-teal-600 text-white'
                    : 'border-gray-300 bg-white text-gray-500'
                }`}>
                  {step.number < currentStep ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  step.number <= currentStep ? 'text-teal-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {stepIdx !== steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step.number < currentStep ? 'bg-teal-600' : 'bg-gray-300'
                  }`} />
                )}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Mobile progress indicator */}
        <div className="flex justify-center mt-2 sm:hidden">
          <div className="flex space-x-1">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`w-2 h-2 rounded-full transition-colors ${
                  step.number === currentStep ? 'bg-teal-500' : 
                  step.number < currentStep ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.businessName} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                placeholder="Enter business name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.businessType} *
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                required
              >
                <option value="">Select business type</option>
                <option value="Retail">Retail</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Services">Services</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.businessSlug}
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                placeholder="business-slug"
              />
              <p className="text-sm text-gray-500 mt-1">{t.slugHelper}</p>
            </div>
          </div>
        )}

        {/* Step 2: Business Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.description}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                placeholder="Brief description of your business"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.phone}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.website}
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.address}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.city}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.region}
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.country}
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                >
                  <option value="Tanzania">Tanzania</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Uganda">Uganda</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.postalCode}
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.registrationNumber}
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Financial Settings */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.currency}
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                >
                  <option value="TZS">Tanzanian Shilling (TZS)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.taxRate}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.taxRate}
                  onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.wholesaleMargin}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.wholesaleMargin}
                  onChange={(e) => handleInputChange('wholesaleMargin', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.retailMargin}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.retailMargin}
                  onChange={(e) => handleInputChange('retailMargin', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Feature Settings</h3>
              
              {[
                { key: 'enableTaxCalculation', label: t.enableTaxCalculation },
                { key: 'enableInventoryTracking', label: t.enableInventoryTracking },
                { key: 'enableCreditSales', label: t.enableCreditSales },
                { key: 'enableLoyaltyProgram', label: t.enableLoyaltyProgram }
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[feature.key as keyof BusinessFormData] as boolean}
                      onChange={(e) => handleInputChange(feature.key as keyof BusinessFormData, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-1.5 px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>{t.previousStep}</span>
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNextStep}
              className="flex items-center space-x-1.5 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              <span>{t.nextStep}</span>
              <ArrowLeftIcon className="w-4 h-4 transform rotate-180" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t.creating}</span>
                </>
              ) : (
                <>
                  <BuildingOfficeIcon className="w-4 h-4" />
                  <span>{t.createBusiness}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
} 