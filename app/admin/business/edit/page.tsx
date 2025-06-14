'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { useBusiness } from '../../../contexts/BusinessContext'
import Link from 'next/link'

interface BusinessSettings {
  // Basic Business Info
  name: string
  businessType: string
  
  // Company Information
  description: string
  email: string
  phone: string
  website: string
  
  // Address Information
  address: string
  city: string
  region: string
  country: string
  postalCode: string
  
  // Financial Settings
  currency: string
  taxRate: number
  wholesaleMargin: number
  retailMargin: number
  financialYearStart: string
  
  // Feature Toggles
  enableInventoryTracking: boolean
  enableCreditSales: boolean
  enableLoyaltyProgram: boolean
  enableTaxCalculation: boolean
}

export default function EditBusinessPage() {
  const { language } = useLanguage()
  const { showSuccess, showError } = useNotifications()
  const { currentBusiness } = useBusiness()
  const [activeTab, setActiveTab] = useState('company')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<BusinessSettings>({
    name: '',
    businessType: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    region: '',
    country: 'Tanzania',
    postalCode: '',
    currency: 'TZS',
    taxRate: 18.0,
    wholesaleMargin: 30.0,
    retailMargin: 50.0,
    financialYearStart: '01-01',
    enableInventoryTracking: true,
    enableCreditSales: false,
    enableLoyaltyProgram: false,
    enableTaxCalculation: true
  })

  const translations = {
    en: {
      pageTitle: 'Edit Business',
      backToBusiness: 'Back to Business',
      companyInfo: 'Company Information',
      businessDetails: 'Business Details',
      financialSettings: 'Financial Settings',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      
      // Basic Info
      businessName: 'Business Name',
      businessType: 'Business Type',
      
      // Company Info
      description: 'Business Description',
      email: 'Business Email',
      phone: 'Business Phone',
      website: 'Website URL',
      
      // Address
      address: 'Street Address',
      city: 'City',
      region: 'Region/State',
      country: 'Country',
      postalCode: 'Postal Code',
      
      // Financial
      currency: 'Currency',
      taxRate: 'Tax Rate (%)',
      wholesaleMargin: 'Wholesale Margin (%)',
      retailMargin: 'Retail Margin (%)',
      financialYearStart: 'Financial Year Start',
      
      // Features
      enableInventoryTracking: 'Enable Inventory Tracking',
      enableCreditSales: 'Enable Credit Sales',
      enableLoyaltyProgram: 'Enable Loyalty Program',
      enableTaxCalculation: 'Enable Tax Calculation',
      
      // Messages
      businessSaved: 'Business updated successfully',
      businessError: 'Failed to update business'
    },
    sw: {
      pageTitle: 'Hariri Biashara',
      backToBusiness: 'Rudi kwa Biashara',
      companyInfo: 'Taarifa za Kampuni',
      businessDetails: 'Maelezo ya Biashara',
      financialSettings: 'Mipangilio ya Kifedha',
      saveChanges: 'Hifadhi Mabadiliko',
      saving: 'Inahifadhi...',
      
      // Basic Info
      businessName: 'Jina la Biashara',
      businessType: 'Aina ya Biashara',
      
      // Company Info
      description: 'Maelezo ya Biashara',
      email: 'Barua Pepe ya Biashara',
      phone: 'Simu ya Biashara',
      website: 'Tovuti',
      
      // Address
      address: 'Anwani ya Mtaa',
      city: 'Jiji',
      region: 'Mkoa',
      country: 'Nchi',
      postalCode: 'Nambari ya Posta',
      
      // Financial
      currency: 'Sarafu',
      taxRate: 'Kiwango cha Ushuru (%)',
      wholesaleMargin: 'Faida ya Jumla (%)',
      retailMargin: 'Faida ya Rejareja (%)',
      financialYearStart: 'Mwanzo wa Mwaka wa Kifedha',
      
      // Features
      enableInventoryTracking: 'Wezesha Ufuatiliaji wa Hisa',
      enableCreditSales: 'Wezesha Mauzo ya Mikopo',
      enableLoyaltyProgram: 'Wezesha Mpango wa Uongozi',
      enableTaxCalculation: 'Wezesha Hesabu ya Ushuru',
      
      // Messages
      businessSaved: 'Biashara imesasishwa',
      businessError: 'Imeshindwa kusasisha biashara'
    }
  }

  const t = translations[language]

  const tabs = [
    { id: 'company', label: t.companyInfo, icon: BuildingOfficeIcon },
    { id: 'details', label: t.businessDetails, icon: MapPinIcon },
    { id: 'financial', label: t.financialSettings, icon: CurrencyDollarIcon }
  ]

  const loadSettings = useCallback(async () => {
    if (!currentBusiness) return
    
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/business?businessId=${currentBusiness.id}`)
      const data = await res.json()
      
      if (data.success && data.data) {
        const business = data.data.business
        setSettings({
          name: business.name || '',
          businessType: business.businessType || '',
          description: business.description || '',
          email: business.email || '',
          phone: business.phone || '',
          website: business.website || '',
          address: business.address || '',
          city: business.city || '',
          region: business.region || '',
          country: business.country || 'Tanzania',
          postalCode: business.postalCode || '',
          currency: business.currency || 'TZS',
          taxRate: business.taxRate || 18.0,
          wholesaleMargin: business.wholesaleMargin || 30.0,
          retailMargin: business.retailMargin || 50.0,
          financialYearStart: business.financialYearStart || '01-01',
          enableInventoryTracking: business.enableInventoryTracking ?? true,
          enableCreditSales: business.enableCreditSales ?? false,
          enableLoyaltyProgram: business.enableLoyaltyProgram ?? false,
          enableTaxCalculation: business.enableTaxCalculation ?? true
        })
      }
    } catch (error) {
      console.error('Failed to load business data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentBusiness])

  const saveSettings = async () => {
    if (!currentBusiness) return
    
    try {
      setIsSaving(true)
      const res = await fetch('/api/admin/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: currentBusiness.id,
          ...settings
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        showSuccess(t.businessSaved, '')
      } else {
        showError(t.businessError, '')
      }
    } catch {
      showError(t.businessError, '')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof BusinessSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    if (currentBusiness) {
      loadSettings()
    }
  }, [currentBusiness, loadSettings])

  if (isLoading || !currentBusiness) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link 
            href="/admin/business"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← {t.backToBusiness}
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{t.pageTitle}</h1>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Company Information Tab */}
        {activeTab === 'company' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.businessName}
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.businessType}
              </label>
              <input
                type="text"
                value={settings.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.description}
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email}
                </label>
                <input
                  type="email"
                  value={settings.email}
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
                  value={settings.phone}
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
                  value={settings.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Business Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.address}
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.city}
                </label>
                <input
                  type="text"
                  value={settings.city}
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
                  value={settings.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.country}
                </label>
                <select
                  value={settings.country}
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
                  value={settings.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Financial Settings Tab */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.currency}
                </label>
                <select
                  value={settings.currency}
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
                  value={settings.taxRate}
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
                  value={settings.wholesaleMargin}
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
                  value={settings.retailMargin}
                  onChange={(e) => handleInputChange('retailMargin', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>
            </div>
            
            {/* Feature Toggles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Feature Settings</h3>
              
              {[
                { key: 'enableInventoryTracking', label: t.enableInventoryTracking },
                { key: 'enableCreditSales', label: t.enableCreditSales },
                { key: 'enableLoyaltyProgram', label: t.enableLoyaltyProgram },
                { key: 'enableTaxCalculation', label: t.enableTaxCalculation }
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[feature.key as keyof BusinessSettings] as boolean}
                      onChange={(e) => handleInputChange(feature.key as keyof BusinessSettings, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{t.saving}</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                <span>{t.saveChanges}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
} 