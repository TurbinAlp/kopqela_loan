'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  PaintBrushIcon,
  CogIcon,
  PhotoIcon,
  TrashIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { useBusiness } from '../../../contexts/BusinessContext'
import Link from 'next/link'
import Image from 'next/image'

interface BusinessSettings {
  // Basic Business Info
  name: string
  businessType: string
  
  // Company Information
  description: string
  email: string
  phone: string
  website: string
  registrationNumber: string
  
  // Address Information
  address: string
  city: string
  region: string
  country: string
  postalCode: string
  
  // Visual/Branding Settings
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  
  // Operational Settings
  timezone: string
  language: string
  defaultPaymentMethod: string
  invoicePrefix: string
  orderPrefix: string
  receiptFooterMessage: string
  
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
  enableMultiCurrency: boolean
  enableMultiLocation: boolean
  
  // Why Choose Us Features
  feature1Title: string
  feature1TitleSwahili: string
  feature1Description: string
  feature1DescriptionSwahili: string
  feature1Icon: string
  feature2Title: string
  feature2TitleSwahili: string
  feature2Description: string
  feature2DescriptionSwahili: string
  feature2Icon: string
  feature3Title: string
  feature3TitleSwahili: string
  feature3Description: string
  feature3DescriptionSwahili: string
  feature3Icon: string
  feature4Title: string
  feature4TitleSwahili: string
  feature4Description: string
  feature4DescriptionSwahili: string
  feature4Icon: string
  
  // Credit Terms Settings
  creditTerms: Array<{
    months: number
    interestRate: number
    isPopular: boolean
    enabled: boolean
  }>
  
  // Business Operations
  businessHours: Array<{day: string, open: string, close: string, isOpen: boolean}>
  paymentMethods: string[]
  deliveryAreas: string[]
  deliveryFee: number
  freeDeliveryMinimum: number
  estimatedDeliveryTime: string
  // Display Settings
  showAboutSection: boolean
}

export default function EditBusinessPage() {
  const { language } = useLanguage()
  const { showSuccess, showError } = useNotifications()
  const { currentBusiness } = useBusiness()
  const [activeTab, setActiveTab] = useState('company')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [settings, setSettings] = useState<BusinessSettings>({
    name: '',
    businessType: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    registrationNumber: '',
    address: '',
    city: '',
    region: '',
    country: 'Tanzania',
    postalCode: '',
    logoUrl: '',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    timezone: 'Africa/Dar_es_Salaam',
    language: 'en',
    defaultPaymentMethod: 'CASH',
    invoicePrefix: 'INV',
    orderPrefix: 'ORD',
    receiptFooterMessage: '',
    currency: 'TZS',
    taxRate: 18.0,
    wholesaleMargin: 30.0,
    retailMargin: 50.0,
    financialYearStart: '01-01',
    enableInventoryTracking: true,
    enableCreditSales: false,
    enableLoyaltyProgram: false,
    enableTaxCalculation: true,
    enableMultiCurrency: false,
    enableMultiLocation: false,
    // Why Choose Us Features
    feature1Title: '',
    feature1TitleSwahili: '',
    feature1Description: '',
    feature1DescriptionSwahili: '',
    feature1Icon: 'CheckCircleIcon',
    feature2Title: '',
    feature2TitleSwahili: '',
    feature2Description: '',
    feature2DescriptionSwahili: '',
    feature2Icon: 'TruckIcon',
    feature3Title: '',
    feature3TitleSwahili: '',
    feature3Description: '',
    feature3DescriptionSwahili: '',
    feature3Icon: 'CreditCardIcon',
    feature4Title: '',
    feature4TitleSwahili: '',
    feature4Description: '',
    feature4DescriptionSwahili: '',
    feature4Icon: 'ShieldCheckIcon',
          // Business Operations
      businessHours: [
        { day: 'Monday', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Tuesday', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Wednesday', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Thursday', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Friday', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Saturday', open: '09:00', close: '17:00', isOpen: true },
        { day: 'Sunday', open: '10:00', close: '16:00', isOpen: false }
      ],
    paymentMethods: ['Cash', 'Mobile Money', 'Bank Transfer'],
    deliveryAreas: ['Dar es Salaam', 'Mwanza', 'Arusha'],
          deliveryFee: 3000,
      freeDeliveryMinimum: 50000,
      estimatedDeliveryTime: '1-3 business days',
      // Display Settings
      showAboutSection: false,
      
      // Credit Terms Settings
      creditTerms: [
        { months: 3, interestRate: 5, isPopular: false, enabled: true },
        { months: 6, interestRate: 8, isPopular: true, enabled: true },
        { months: 12, interestRate: 12, isPopular: false, enabled: true }
      ]
  })

  const translations = {
    en: {
      pageTitle: 'Edit Business',
      backToBusiness: 'Back to Business',
      companyInfo: 'Company Information',
      businessDetails: 'Business Details',
      brandingSettings: 'Branding & Visual',
      operationalSettings: 'Operational Settings',
      storeFeatures: 'Store Features',
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
      registrationNumber: 'Registration Number',
      
      // Address
      address: 'Street Address',
      city: 'City',
      region: 'Region/State',
      country: 'Country',
      postalCode: 'Postal Code',
      
      // Visual/Branding
      logoUrl: 'Business Logo',
      primaryColor: 'Primary Color',
      secondaryColor: 'Secondary Color',
      
      // Operational
      timezone: 'Timezone',
      language: 'Default Language',
      defaultPaymentMethod: 'Default Payment Method',
      invoicePrefix: 'Invoice Prefix',
      orderPrefix: 'Order Prefix',
      receiptFooterMessage: 'Receipt Footer Message',
      
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
      enableMultiCurrency: 'Enable Multi-Currency',
      enableMultiLocation: 'Enable Multi-Location',
      
      // Messages
      businessSaved: 'Business updated successfully',
      businessError: 'Failed to update business',
      
      // Logo Upload
      currentLogo: 'Current Logo',
      clickToChange: 'Click "Remove" to change',
      remove: 'Remove',
      uploadLogo: 'Upload Logo',
      changeLogo: 'Change Logo',
      uploading: 'Uploading...',
      dragDropText: 'PNG, JPG, JPEG up to 5MB',
      
      // Store Features
      whyChooseUsTitle: 'Why Choose Us Features',
      whyChooseUsDesc: 'Customize the features that make your business unique',
      feature: 'Feature',
      titleEn: 'Title (English)',
      titleSw: 'Title (Swahili)',
      descriptionEn: 'Description (English)',
      descriptionSw: 'Description (Swahili)',
      icon: 'Icon',
      selectIcon: 'Select Icon',
      
      // Business Operations
      businessHours: 'Business Hours',
      day: 'Day',
      openTime: 'Open Time',
      closeTime: 'Close Time',
      isOpen: 'Open',
      paymentMethods: 'Payment Methods',
      addPaymentMethod: 'Add Payment Method',
      deliverySettings: 'Delivery Settings',
      deliveryAreas: 'Delivery Areas',
      addArea: 'Add Area',
      deliveryFee: 'Delivery Fee (TZS)',
      freeDeliveryMinimum: 'Free Delivery Minimum (TZS)',
      estimatedTime: 'Estimated Delivery Time',
      // Display Settings
      displaySettings: 'Display Settings',
      showAboutSection: 'Show About Section'
    },
    sw: {
      pageTitle: 'Hariri Biashara',
      backToBusiness: 'Rudi kwa Biashara',
      companyInfo: 'Taarifa za Kampuni',
      businessDetails: 'Maelezo ya Biashara',
      brandingSettings: 'Chapa na Muonekano',
      operationalSettings: 'Mipangilio ya Uendeshaji',
      storeFeatures: 'Vipengele vya Duka',
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
      registrationNumber: 'Nambari ya Usajili',
      
      // Address
      address: 'Anwani ya Mtaa',
      city: 'Jiji',
      region: 'Mkoa',
      country: 'Nchi',
      postalCode: 'Nambari ya Posta',
      
      // Visual/Branding
      logoUrl: 'Logo ya Biashara',
      primaryColor: 'Rangi ya Msingi',
      secondaryColor: 'Rangi ya Pili',
      
      // Operational
      timezone: 'Saa za Eneo',
      language: 'Lugha ya Msingi',
      defaultPaymentMethod: 'Njia ya Malipo ya Kawaida',
      invoicePrefix: 'Kiambishi cha Ankara',
      orderPrefix: 'Kiambishi cha Agizo',
      receiptFooterMessage: 'Ujumbe wa Mwisho wa Risiti',
      
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
      enableMultiCurrency: 'Wezesha Sarafu Nyingi',
      enableMultiLocation: 'Wezesha Maeneo Mengi',
      
      // Messages
      businessSaved: 'Biashara imesasishwa',
      businessError: 'Imeshindwa kusasisha biashara',
      
      // Logo Upload
      currentLogo: 'Logo ya Sasa',
      clickToChange: 'Bofya "Ondoa" ili kubadilisha',
      remove: 'Ondoa',
      uploadLogo: 'Pakia Logo',
      changeLogo: 'Badilisha Logo',
      uploading: 'Inapakia...',
      dragDropText: 'PNG, JPG, JPEG hadi MB 5',
      
      // Store Features
      whyChooseUsTitle: 'Vipengele vya "Kwa Nini Utuchague"',
      whyChooseUsDesc: 'Badilisha vipengele vinavyofanya biashara yako kuwa ya kipekee',
      feature: 'Kipengele',
      titleEn: 'Kichwa (Kiingereza)',
      titleSw: 'Kichwa (Kiswahili)',
      descriptionEn: 'Maelezo (Kiingereza)',
      descriptionSw: 'Maelezo (Kiswahili)',
      icon: 'Ikoni',
      selectIcon: 'Chagua Ikoni',
      
      // Business Operations
      businessHours: 'Masaa ya Biashara',
      day: 'Siku',
      openTime: 'Muda wa Kufungua',
      closeTime: 'Muda wa Kufunga',
      isOpen: 'Inafunguka',
      paymentMethods: 'Njia za Malipo',
      addPaymentMethod: 'Ongeza Njia ya Malipo',
      deliverySettings: 'Mipangilio ya Uwasilishaji',
      deliveryAreas: 'Maeneo ya Uwasilishaji',
      addArea: 'Ongeza Eneo',
      deliveryFee: 'Ada ya Uwasilishaji (TZS)',
      freeDeliveryMinimum: 'Ukomo wa Uwasilishaji Bure (TZS)',
      estimatedTime: 'Muda wa Uwasilishaji',
      // Display Settings
      displaySettings: 'Mipangilio ya Onyesho',
      showAboutSection: 'Onyesha Sehemu ya Kuhusu'
    }
  }

  const t = translations[language]

  const tabs = [
    { id: 'company', label: t.companyInfo, icon: BuildingOfficeIcon },
    { id: 'details', label: t.businessDetails, icon: MapPinIcon },
    { id: 'branding', label: t.brandingSettings, icon: PaintBrushIcon },
    { id: 'operational', label: t.operationalSettings, icon: CogIcon },
    { id: 'features', label: t.storeFeatures, icon: StarIcon },
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
          name: business.name,
          businessType: business.businessType,
          description: business.description,
          email: business.email,
          phone: business.phone,
          website: business.website,
          registrationNumber: business.registrationNumber,
          address: business.address,
          city: business.city,
          region: business.region,
          country: business.country,
          postalCode: business.postalCode,
          logoUrl: business.logoUrl,
          primaryColor: business.primaryColor,
          secondaryColor: business.secondaryColor,
          timezone: business.timezone,
          language: business.language,
          defaultPaymentMethod: business.defaultPaymentMethod,
          invoicePrefix: business.invoicePrefix,
          orderPrefix: business.orderPrefix,
          receiptFooterMessage: business.receiptFooterMessage,
          currency: business.currency,
          taxRate: business.taxRate,
          wholesaleMargin: business.wholesaleMargin,
          retailMargin: business.retailMargin,
          financialYearStart: business.financialYearStart,
          enableInventoryTracking: business.enableInventoryTracking ?? true,
          enableCreditSales: business.enableCreditSales ?? false,
          enableLoyaltyProgram: business.enableLoyaltyProgram ?? false,
          enableTaxCalculation: business.enableTaxCalculation ?? true,
          enableMultiCurrency: business.enableMultiCurrency ?? false,
          enableMultiLocation: business.enableMultiLocation ?? false,
          // Why Choose Us Features
          feature1Title: business.feature1Title,
          feature1TitleSwahili: business.feature1TitleSwahili,
          feature1Description: business.feature1Description,
          feature1DescriptionSwahili: business.feature1DescriptionSwahili,
          feature1Icon: business.feature1Icon,
          feature2Title: business.feature2Title,
          feature2TitleSwahili: business.feature2TitleSwahili,
          feature2Description: business.feature2Description ,
          feature2DescriptionSwahili: business.feature2DescriptionSwahili ,
          feature2Icon: business.feature2Icon,
          feature3Title: business.feature3Title ,
          feature3TitleSwahili: business.feature3TitleSwahili,
          feature3Description: business.feature3Description,
          feature3DescriptionSwahili: business.feature3DescriptionSwahili,
          feature3Icon: business.feature3Icon,
          feature4Title: business.feature4Title,
          feature4TitleSwahili: business.feature4TitleSwahili,
          feature4Description: business.feature4Description,
          feature4DescriptionSwahili: business.feature4DescriptionSwahili,
          feature4Icon: business.feature4Icon,
          // Business Operations
          businessHours: business.businessHours,
          paymentMethods: business.paymentMethods ,
          deliveryAreas: business.deliveryAreas,
                     deliveryFee: business.deliveryFee ,
           freeDeliveryMinimum: business.freeDeliveryMinimum ,
           estimatedDeliveryTime: business.estimatedDeliveryTime,
           // Display Settings
           showAboutSection: business.showAboutSection ?? false,
           // Credit Terms Settings
           creditTerms: business.creditTerms ?? [
             { months: 3, interestRate: 5, isPopular: false, enabled: true },
             { months: 6, interestRate: 8, isPopular: true, enabled: true },
             { months: 12, interestRate: 12, isPopular: false, enabled: true }
           ]
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

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentBusiness) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError(
        language === 'sw' ? 'Chagua picha tu (PNG, JPG, JPEG)' : 'Please select image files only (PNG, JPG, JPEG)',
        ''
      )
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError(
        language === 'sw' ? 'Ukubwa wa picha haupaswi kuzidi MB 5' : 'Image size should not exceed 5MB',
        ''
      )
      return
    }

    try {
      setIsUploadingLogo(true)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('businessId', currentBusiness.id.toString())
      
      const response = await fetch('/api/admin/business/upload-logo', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSettings(prev => ({ ...prev, logoUrl: data.logoUrl }))
        showSuccess(
          language === 'sw' ? 'Logo imepakiwa' : 'Logo uploaded successfully',
          ''
        )
      } else {
        showError(
          language === 'sw' ? 'Imeshindwa kupakia logo' : 'Failed to upload logo',
          data.message || ''
        )
      }
    } catch (error) {
      console.error('Logo upload error:', error)
      showError(
        language === 'sw' ? 'Imeshindwa kupakia logo' : 'Failed to upload logo',
        ''
      )
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleLogoRemove = () => {
    setSettings(prev => ({ ...prev, logoUrl: '' }))
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
      className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8"
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.registrationNumber}
              </label>
              <input
                type="text"
                value={settings.registrationNumber}
                onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
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

        {/* Branding Settings Tab */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.logoUrl}
              </label>
              
              {/* Logo Preview */}
              {settings.logoUrl && (
                <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={settings.logoUrl}
                        alt="Business Logo"
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                                             <div>
                         <p className="text-sm font-medium text-gray-900">{t.currentLogo}</p>
                         <p className="text-xs text-gray-500">{t.clickToChange}</p>
                       </div>
                    </div>
                                         <button
                       type="button"
                       onClick={handleLogoRemove}
                       className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                     >
                       <TrashIcon className="w-4 h-4" />
                       <span>{t.remove}</span>
                     </button>
                  </div>
                </div>
              )}
              
              {/* Logo Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isUploadingLogo}
                />
                <label
                  htmlFor="logo-upload"
                  className={`cursor-pointer ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center">
                    {isUploadingLogo ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-3"></div>
                    ) : (
                      <PhotoIcon className="w-8 h-8 text-gray-400 mb-3" />
                    )}
                                         <p className="text-sm font-medium text-gray-900 mb-1">
                       {isUploadingLogo ? t.uploading : settings.logoUrl ? t.changeLogo : t.uploadLogo}
                     </p>
                     <p className="text-xs text-gray-500">
                       {t.dragDropText}
                     </p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.primaryColor}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    placeholder="#059669"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.secondaryColor}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    placeholder="#10b981"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Operational Settings Tab */}
        {activeTab === 'operational' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.timezone}
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                >
                  <option value="Africa/Dar_es_Salaam">Africa/Dar es Salaam</option>
                  <option value="Africa/Nairobi">Africa/Nairobi</option>
                  <option value="Africa/Kampala">Africa/Kampala</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.language}
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                >
                  <option value="en">English</option>
                  <option value="sw">Kiswahili</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.defaultPaymentMethod}
                </label>
                <select
                  value={settings.defaultPaymentMethod}
                  onChange={(e) => handleInputChange('defaultPaymentMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                >
                  <option value="CASH">Cash</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Card</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.invoicePrefix}
                </label>
                <input
                  type="text"
                  value={settings.invoicePrefix}
                  onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  placeholder="INV"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.orderPrefix}
                </label>
                <input
                  type="text"
                  value={settings.orderPrefix}
                  onChange={(e) => handleInputChange('orderPrefix', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  placeholder="ORD"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.receiptFooterMessage}
              </label>
              <textarea
                value={settings.receiptFooterMessage}
                onChange={(e) => handleInputChange('receiptFooterMessage', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                placeholder="Thank you for your business!"
              />
            </div>

            {/* Business Hours Section */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">{t.businessHours}</h4>
              <div className="space-y-3">
                {(settings.businessHours || []).map((hour, index) => (
                  <div key={hour.day} className="grid grid-cols-5 gap-4 items-center">
                    <div className="font-medium text-gray-700">{hour.day}</div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hour.isOpen}
                        onChange={(e) => {
                          const newHours = [...settings.businessHours]
                          newHours[index].isOpen = e.target.checked
                          setSettings(prev => ({ ...prev, businessHours: newHours }))
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{t.isOpen}</span>
                    </div>
                    <input
                      type="time"
                      value={hour.open}
                      onChange={(e) => {
                        const newHours = [...settings.businessHours]
                        newHours[index].open = e.target.value
                        setSettings(prev => ({ ...prev, businessHours: newHours }))
                      }}
                      disabled={!hour.isOpen}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 disabled:bg-gray-100"
                    />
                    <input
                      type="time"
                      value={hour.close}
                      onChange={(e) => {
                        const newHours = [...settings.businessHours]
                        newHours[index].close = e.target.value
                        setSettings(prev => ({ ...prev, businessHours: newHours }))
                      }}
                      disabled={!hour.isOpen}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 disabled:bg-gray-100"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods Section */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">{t.paymentMethods}</h4>
              <div className="space-y-3">
                {(settings.paymentMethods || []).map((method, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={method}
                      onChange={(e) => {
                        const newMethods = [...settings.paymentMethods]
                        newMethods[index] = e.target.value
                        setSettings(prev => ({ ...prev, paymentMethods: newMethods }))
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                      placeholder="Payment method"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newMethods = settings.paymentMethods.filter((_, i) => i !== index)
                        setSettings(prev => ({ ...prev, paymentMethods: newMethods }))
                      }}
                      className="px-3 py-2 text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSettings(prev => ({ 
                      ...prev, 
                      paymentMethods: [...(prev.paymentMethods || []), ''] 
                    }))
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
                >
                  {t.addPaymentMethod}
                </button>
              </div>
            </div>

            {/* Delivery Settings Section */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">{t.deliverySettings}</h4>
              
              {/* Delivery Areas */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">{t.deliveryAreas}</label>
                <div className="space-y-3">
                  {(settings.deliveryAreas || []).map((area, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => {
                          const newAreas = [...settings.deliveryAreas]
                          newAreas[index] = e.target.value
                          setSettings(prev => ({ ...prev, deliveryAreas: newAreas }))
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                        placeholder="Delivery area"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newAreas = settings.deliveryAreas.filter((_, i) => i !== index)
                          setSettings(prev => ({ ...prev, deliveryAreas: newAreas }))
                        }}
                        className="px-3 py-2 text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSettings(prev => ({ 
                        ...prev, 
                        deliveryAreas: [...(prev.deliveryAreas || []), ''] 
                      }))
                    }}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
                  >
                    {t.addArea}
                  </button>
                </div>
              </div>

              {/* Delivery Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.deliveryFee}
                  </label>
                  <input
                    type="number"
                    value={settings.deliveryFee}
                    onChange={(e) => handleInputChange('deliveryFee', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    placeholder="3000"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.freeDeliveryMinimum}
                  </label>
                  <input
                    type="number"
                    value={settings.freeDeliveryMinimum}
                    onChange={(e) => handleInputChange('freeDeliveryMinimum', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    placeholder="50000"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.estimatedTime}
                  </label>
                  <input
                    type="text"
                    value={settings.estimatedDeliveryTime}
                    onChange={(e) => handleInputChange('estimatedDeliveryTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    placeholder="1-3 business days"
                  />
                </div>
              </div>
            </div>

            {/* Display Settings Section */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">{t.displaySettings}</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="showAboutSection"
                    checked={settings.showAboutSection}
                    onChange={(e) => handleInputChange('showAboutSection', e.target.checked)}
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="showAboutSection" className="text-sm font-medium text-gray-700">
                    {t.showAboutSection}
                  </label>
                </div>
                <p className="text-sm text-gray-500 ml-7">
                  {language === 'sw' 
                    ? 'Kama imeunganishwa, sehemu ya "Kuhusu Sisi" itaonekana kwenye ukurasa wa duka la wateja'
                    : 'When enabled, the "About Us" section will be displayed on the customer store page'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Store Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.whyChooseUsTitle}</h3>
              <p className="text-sm text-gray-600">{t.whyChooseUsDesc}</p>
            </div>
            
            {/* Feature 1 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">{t.feature} 1</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.titleEn}
                  </label>
                  <input
                    type="text"
                    value={settings.feature1Title}
                    onChange={(e) => handleInputChange('feature1Title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.titleSw}
                  </label>
                  <input
                    type="text"
                    value={settings.feature1TitleSwahili}
                    onChange={(e) => handleInputChange('feature1TitleSwahili', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.descriptionEn}
                  </label>
                  <textarea
                    value={settings.feature1Description}
                    onChange={(e) => handleInputChange('feature1Description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.descriptionSw}
                  </label>
                  <textarea
                    value={settings.feature1DescriptionSwahili}
                    onChange={(e) => handleInputChange('feature1DescriptionSwahili', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.icon}
                  </label>
                  <select
                    value={settings.feature1Icon}
                    onChange={(e) => handleInputChange('feature1Icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  >
                    <option value="CheckCircleIcon">✓ Check Circle</option>
                    <option value="TruckIcon">🚚 Truck</option>
                    <option value="CreditCardIcon">💳 Credit Card</option>
                    <option value="ShieldCheckIcon">🛡️ Shield Check</option>
                    <option value="StarIcon">⭐ Star</option>
                    <option value="HeartIcon">❤️ Heart</option>
                    <option value="LightBulbIcon">💡 Light Bulb</option>
                    <option value="GiftIcon">🎁 Gift</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">{t.feature} 2</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.titleEn}
                  </label>
                  <input
                    type="text"
                    value={settings.feature2Title}
                    onChange={(e) => handleInputChange('feature2Title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.titleSw}
                  </label>
                  <input
                    type="text"
                    value={settings.feature2TitleSwahili}
                    onChange={(e) => handleInputChange('feature2TitleSwahili', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.descriptionEn}
                  </label>
                  <textarea
                    value={settings.feature2Description}
                    onChange={(e) => handleInputChange('feature2Description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.descriptionSw}
                  </label>
                  <textarea
                    value={settings.feature2DescriptionSwahili}
                    onChange={(e) => handleInputChange('feature2DescriptionSwahili', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.icon}
                  </label>
                  <select
                    value={settings.feature2Icon}
                    onChange={(e) => handleInputChange('feature2Icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  >
                    <option value="CheckCircleIcon">✓ Check Circle</option>
                    <option value="TruckIcon">🚚 Truck</option>
                    <option value="CreditCardIcon">💳 Credit Card</option>
                    <option value="ShieldCheckIcon">🛡️ Shield Check</option>
                    <option value="StarIcon">⭐ Star</option>
                    <option value="HeartIcon">❤️ Heart</option>
                    <option value="LightBulbIcon">💡 Light Bulb</option>
                    <option value="GiftIcon">🎁 Gift</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">{t.feature} 3</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.titleEn}
                  </label>
                  <input
                    type="text"
                    value={settings.feature3Title}
                    onChange={(e) => handleInputChange('feature3Title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.titleSw}
                  </label>
                  <input
                    type="text"
                    value={settings.feature3TitleSwahili}
                    onChange={(e) => handleInputChange('feature3TitleSwahili', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.descriptionEn}
                  </label>
                  <textarea
                    value={settings.feature3Description}
                    onChange={(e) => handleInputChange('feature3Description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.descriptionSw}
                  </label>
                  <textarea
                    value={settings.feature3DescriptionSwahili}
                    onChange={(e) => handleInputChange('feature3DescriptionSwahili', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.icon}
                  </label>
                  <select
                    value={settings.feature3Icon}
                    onChange={(e) => handleInputChange('feature3Icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  >
                    <option value="CheckCircleIcon">✓ Check Circle</option>
                    <option value="TruckIcon">🚚 Truck</option>
                    <option value="CreditCardIcon">💳 Credit Card</option>
                    <option value="ShieldCheckIcon">🛡️ Shield Check</option>
                    <option value="StarIcon">⭐ Star</option>
                    <option value="HeartIcon">❤️ Heart</option>
                    <option value="LightBulbIcon">💡 Light Bulb</option>
                    <option value="GiftIcon">🎁 Gift</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">{t.feature} 4</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.titleEn}
                  </label>
                  <input
                    type="text"
                    value={settings.feature4Title}
                    onChange={(e) => handleInputChange('feature4Title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.titleSw}
                  </label>
                  <input
                    type="text"
                    value={settings.feature4TitleSwahili}
                    onChange={(e) => handleInputChange('feature4TitleSwahili', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.descriptionEn}
                  </label>
                  <textarea
                    value={settings.feature4Description}
                    onChange={(e) => handleInputChange('feature4Description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.descriptionSw}
                  </label>
                  <textarea
                    value={settings.feature4DescriptionSwahili}
                    onChange={(e) => handleInputChange('feature4DescriptionSwahili', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.icon}
                  </label>
                  <select
                    value={settings.feature4Icon}
                    onChange={(e) => handleInputChange('feature4Icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  >
                    <option value="CheckCircleIcon">✓ Check Circle</option>
                    <option value="TruckIcon">🚚 Truck</option>
                    <option value="CreditCardIcon">💳 Credit Card</option>
                    <option value="ShieldCheckIcon">🛡️ Shield Check</option>
                    <option value="StarIcon">⭐ Star</option>
                    <option value="HeartIcon">❤️ Heart</option>
                    <option value="LightBulbIcon">💡 Light Bulb</option>
                    <option value="GiftIcon">🎁 Gift</option>
                  </select>
                </div>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.financialYearStart}
                </label>
                <input
                  type="text"
                  value={settings.financialYearStart}
                  onChange={(e) => handleInputChange('financialYearStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  placeholder="01-01"
                />
              </div>
            </div>
            
            {/* Feature Toggles */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-medium text-gray-900">Feature Settings</h3>
              
              {[
                { key: 'enableInventoryTracking', label: t.enableInventoryTracking },
                { key: 'enableCreditSales', label: t.enableCreditSales },
                { key: 'enableLoyaltyProgram', label: t.enableLoyaltyProgram },
                { key: 'enableTaxCalculation', label: t.enableTaxCalculation },
                { key: 'enableMultiCurrency', label: t.enableMultiCurrency },
                { key: 'enableMultiLocation', label: t.enableMultiLocation }
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

            {/* Credit Terms Settings */}
            {settings.enableCreditSales && (
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {language === 'sw' ? 'Mipangilio ya Masharti ya Mkopo' : 'Credit Terms Settings'}
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {language === 'sw' 
                    ? 'Weka muda wa kulipa na viwango vya riba kwa wateja wanaotaka ununuzi kwa mkopo.'
                    : 'Configure repayment periods and interest rates for customers who want to purchase on credit.'}
                </p>

                <div className="space-y-4">
                  {settings.creditTerms.map((term, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === 'sw' ? 'Miezi' : 'Months'}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={term.months}
                            onChange={(e) => {
                              const newTerms = [...settings.creditTerms]
                              newTerms[index].months = parseInt(e.target.value)
                              setSettings(prev => ({ ...prev, creditTerms: newTerms }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === 'sw' ? 'Riba (%)' : 'Interest Rate (%)'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={term.interestRate}
                            onChange={(e) => {
                              const newTerms = [...settings.creditTerms]
                              newTerms[index].interestRate = parseFloat(e.target.value)
                              setSettings(prev => ({ ...prev, creditTerms: newTerms }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                          />
                        </div>

                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={term.isPopular}
                              onChange={(e) => {
                                const newTerms = [...settings.creditTerms]
                                newTerms[index].isPopular = e.target.checked
                                setSettings(prev => ({ ...prev, creditTerms: newTerms }))
                              }}
                              className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {language === 'sw' ? 'Maarufu' : 'Popular'}
                            </span>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={term.enabled}
                              onChange={(e) => {
                                const newTerms = [...settings.creditTerms]
                                newTerms[index].enabled = e.target.checked
                                setSettings(prev => ({ ...prev, creditTerms: newTerms }))
                              }}
                              className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {language === 'sw' ? 'Imeamilishwa' : 'Enabled'}
                            </span>
                          </label>
                          
                          {settings.creditTerms.length > 1 && (
                            <button
                              onClick={() => {
                                const newTerms = settings.creditTerms.filter((_, i) => i !== index)
                                setSettings(prev => ({ ...prev, creditTerms: newTerms }))
                              }}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              {language === 'sw' ? 'Ondoa' : 'Remove'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newTerms = [...settings.creditTerms, {
                        months: 6,
                        interestRate: 10,
                        isPopular: false,
                        enabled: true
                      }]
                      setSettings(prev => ({ ...prev, creditTerms: newTerms }))
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    + {language === 'sw' ? 'Ongeza Muda wa Malipo' : 'Add Payment Period'}
                  </button>
                </div>
              </div>
            )}
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