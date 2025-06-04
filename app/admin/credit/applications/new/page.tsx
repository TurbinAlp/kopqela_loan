'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  UserIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../../contexts/LanguageContext'
import Link from 'next/link'

interface Product {
  id: number
  name: string
  category: string
  price: number
  inStock: number
}

interface SelectedProduct {
  productId: number
  name: string
  category: string
  price: number
  quantity: number
  total: number
}

interface ApplicationForm {
  // Customer Information
  customerName: string
  customerEmail: string
  customerPhone: string
  customerId: string
  dateOfBirth: string
  address: string
  occupation: string
  employmentStatus: string
  employer: string
  monthlyIncome: number
  businessType: string
  
  // Selected Products
  selectedProducts: SelectedProduct[]
  
  // Credit Terms
  downPayment: number
  paymentPeriod: number
  hasMonthlyInterest: boolean
  interestRate: number
  
  // Guarantor Information
  guarantorName: string
  guarantorEmail: string
  guarantorPhone: string
  guarantorId: string
  guarantorRelationship: string
  guarantorAddress: string
  guarantorOccupation: string
  guarantorIncome: number
  
  // Additional Information
  notes: string
}

export default function NewCreditApplicationPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const stepsContainerRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<ApplicationForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerId: '',
    dateOfBirth: '',
    address: '',
    occupation: '',
    employmentStatus: 'employed',
    employer: '',
    monthlyIncome: 0,
    businessType: '',
    selectedProducts: [],
    downPayment: 0,
    paymentPeriod: 6,
    hasMonthlyInterest: false,
    interestRate: 8,
    guarantorName: '',
    guarantorEmail: '',
    guarantorPhone: '',
    guarantorId: '',
    guarantorRelationship: '',
    guarantorAddress: '',
    guarantorOccupation: '',
    guarantorIncome: 0,
    notes: ''
  })

  const [availableProducts] = useState<Product[]>([
    { id: 1, name: "Premium Fertilizer NPK 20:20:20", category: "Fertilizers", price: 85000, inStock: 50 },
    { id: 2, name: "Maize Seeds - Hybrid Variety", category: "Seeds", price: 12000, inStock: 200 },
    { id: 3, name: "Solar Panel 300W", category: "Electronics", price: 250000, inStock: 25 },
    { id: 4, name: "Battery 100Ah Deep Cycle", category: "Electronics", price: 180000, inStock: 15 },
    { id: 5, name: "Cooking Gas Cylinder 13kg", category: "Gas Equipment", price: 45000, inStock: 80 },
    { id: 6, name: "Gas Burner 2-Plate", category: "Gas Equipment", price: 25000, inStock: 40 },
    { id: 7, name: "Motorcycle Spare Parts", category: "Automotive", price: 15000, inStock: 100 },
    { id: 8, name: "Motorcycle Tires", category: "Automotive", price: 35000, inStock: 60 },
    { id: 9, name: "Building Cement 50kg", category: "Construction", price: 18000, inStock: 200 },
    { id: 10, name: "Iron Sheets 2.5m", category: "Construction", price: 1200, inStock: 500 }
  ])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Auto-scroll current step to center on mobile
  useEffect(() => {
    if (stepsContainerRef.current && window.innerWidth < 768) {
      const container = stepsContainerRef.current
      const stepWidth = 120 // Width of each step
      const containerWidth = container.clientWidth
      const scrollPosition = (currentStep - 1) * stepWidth - (containerWidth / 2) + (stepWidth / 2)
      
      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      })
    }
  }, [currentStep])

  const translations = {
    en: {
      pageTitle: "New Credit Sales Application",
      pageSubtitle: "Submit a new application for credit sales",
      backToApplications: "Back to Applications",
      
      // Steps
      customerInfo: "Customer Information",
      productSelection: "Product Selection", 
      creditTerms: "Credit Terms",
      guarantorInfo: "Guarantor Information",
      reviewSubmit: "Review & Submit",
      
      // Customer fields
      personalDetails: "Personal Details",
      customerName: "Full Name",
      customerEmail: "Email Address",
      customerPhone: "Phone Number",
      customerId: "ID Number",
      dateOfBirth: "Date of Birth",
      address: "Physical Address",
      
      // Employment fields
      employmentInfo: "Employment Information",
      occupation: "Occupation",
      employmentStatus: "Employment Status",
      employer: "Employer/Business Name",
      monthlyIncome: "Monthly Income",
      businessType: "Business Type",
      
      // Product fields
      availableProducts: "Available Products",
      selectedProducts: "Selected Products",
      productName: "Product Name",
      category: "Category",
      price: "Unit Price",
      quantity: "Quantity",
      total: "Total",
      inStock: "In Stock",
      addProduct: "Add Product",
      removeProduct: "Remove",
      selectProduct: "Select a product...",
      
      // Credit fields
      orderSummary: "Order Summary",
      totalOrderValue: "Total Order Value",
      downPayment: "Down Payment",
      creditAmount: "Credit Amount",
      paymentPeriod: "Payment Period",
      monthlyPayment: "Monthly Payment",
      interestRate: "Interest Rate",
      hasMonthlyInterest: "Apply Monthly Interest",
      noInterest: "No Interest",
      customInterestRate: "Custom Interest Rate",
      
      // Guarantor fields
      guarantorDetails: "Guarantor Details",
      guarantorName: "Guarantor Full Name",
      guarantorEmail: "Guarantor Email",
      guarantorPhone: "Guarantor Phone",
      guarantorId: "Guarantor ID Number",
      guarantorRelationship: "Relationship to Customer",
      guarantorAddress: "Guarantor Address",
      guarantorOccupation: "Guarantor Occupation",
      guarantorIncome: "Guarantor Monthly Income",
      
      // Review fields
      applicationSummary: "Application Summary",
      additionalNotes: "Additional Notes",
      notes: "Notes (Optional)",
      
      // Actions
      nextStep: "Next Step",
      previousStep: "Previous Step",
      submitApplication: "Submit Application",
      save: "Save",
      cancel: "Cancel",
      
      // Validation
      required: "This field is required",
      invalidEmail: "Please enter a valid email",
      invalidPhone: "Please enter a valid phone number",
      minAmount: "Amount must be greater than 0",
      
      // Employment status
      employed: "Employed",
      selfEmployed: "Self-employed",
      unemployed: "Unemployed",
      retired: "Retired",
      
      // Other
      months: "months",
      currency: "TZS",
      perAnnum: "per annum",
      calculatedAutomatically: "Calculated automatically based on terms",
      
      // Success
      applicationSubmitted: "Application submitted successfully!",
      redirecting: "Redirecting to applications list..."
    },
    sw: {
      pageTitle: "Ombi Jipya la Mauzo ya Mkopo",
      pageSubtitle: "Wasilisha ombi jipya la mauzo ya mkopo",
      backToApplications: "Rudi kwenye Maombi",
      
      // Steps
      customerInfo: "Maelezo ya Mteja",
      productSelection: "Uchaguzi wa Bidhaa",
      creditTerms: "Masharti ya Mkopo",
      guarantorInfo: "Maelezo ya Mdhamini",
      reviewSubmit: "Kagua na Wasilisha",
      
      // Customer fields
      personalDetails: "Maelezo ya Kibinafsi",
      customerName: "Jina Kamili",
      customerEmail: "Barua Pepe",
      customerPhone: "Namba ya Simu",
      customerId: "Namba ya Kitambulisho",
      dateOfBirth: "Tarehe ya Kuzaliwa",
      address: "Anwani ya Makazi",
      
      // Employment fields
      employmentInfo: "Maelezo ya Ajira",
      occupation: "Kazi",
      employmentStatus: "Hali ya Ajira",
      employer: "Mwajiri/Jina la Biashara",
      monthlyIncome: "Mapato ya Kila Mwezi",
      businessType: "Aina ya Biashara",
      
      // Product fields
      availableProducts: "Bidhaa Zinazopatikana",
      selectedProducts: "Bidhaa Zilizochaguliwa",
      productName: "Jina la Bidhaa",
      category: "Kategoria",
      price: "Bei ya Kila Moja",
      quantity: "Kiasi",
      total: "Jumla",
      inStock: "Zilizo Hifadhini",
      addProduct: "Ongeza Bidhaa",
      removeProduct: "Ondoa",
      selectProduct: "Chagua bidhaa...",
      
      // Credit fields
      orderSummary: "Muhtasari wa Agizo",
      totalOrderValue: "Jumla ya Thamani ya Agizo",
      downPayment: "Malipo ya Awali",
      creditAmount: "Kiasi cha Mkopo",
      paymentPeriod: "Muda wa Malipo",
      monthlyPayment: "Malipo ya Kila Mwezi",
      interestRate: "Kiwango cha Riba",
      hasMonthlyInterest: "Weka Riba Kila Mwezi",
      noInterest: "Hakuna Riba",
      customInterestRate: "Kiwango cha Riba Ipi",
      
      // Guarantor fields
      guarantorDetails: "Maelezo ya Mdhamini",
      guarantorName: "Jina Kamili la Mdhamini",
      guarantorEmail: "Barua Pepe ya Mdhamini",
      guarantorPhone: "Simu ya Mdhamini",
      guarantorId: "Namba ya Kitambulisho cha Mdhamini",
      guarantorRelationship: "Uhusiano na Mteja",
      guarantorAddress: "Anwani ya Mdhamini",
      guarantorOccupation: "Kazi ya Mdhamini",
      guarantorIncome: "Mapato ya Mdhamini kwa Mwezi",
      
      // Review fields
      applicationSummary: "Muhtasari wa Ombi",
      additionalNotes: "Maelezo ya Ziada",
      notes: "Maelezo (Si Lazima)",
      
      // Actions
      nextStep: "Hatua Ijayo",
      previousStep: "Hatua Iliyotangulia",
      submitApplication: "Wasilisha Ombi",
      save: "Hifadhi",
      cancel: "Ghairi",
      
      // Validation
      required: "Sehemu hii inahitajika",
      invalidEmail: "Tafadhali ingiza barua pepe sahihi",
      invalidPhone: "Tafadhali ingiza namba ya simu sahihi",
      minAmount: "Kiasi lazima kiwe zaidi ya 0",
      
      // Employment status
      employed: "Ana Ajira",
      selfEmployed: "Mwajiri Binafsi",
      unemployed: "Hana Ajira",
      retired: "Amestaafu",
      
      // Other
      months: "miezi",
      currency: "TSh",
      perAnnum: "kwa mwaka",
      calculatedAutomatically: "Inahesabiwa kiotomatiki kulingana na masharti",
      
      // Success
      applicationSubmitted: "Ombi limewasilishwa kwa mafanikio!",
      redirecting: "Inaelekeza kwenye orodha ya maombi..."
    }
  }

  const t = translations[language]

  // Calculations
  const totalOrderValue = formData.selectedProducts.reduce((sum, product) => sum + product.total, 0)
  const creditAmount = totalOrderValue - formData.downPayment
  const effectiveInterestRate = formData.hasMonthlyInterest ? formData.interestRate : 0
  const monthlyPayment = creditAmount > 0 ? (creditAmount * (1 + (effectiveInterestRate / 100))) / formData.paymentPeriod : 0

  const handleInputChange = (field: keyof ApplicationForm, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: [...prev.selectedProducts, {
        productId: 0,
        name: '',
        category: '',
        price: 0,
        quantity: 1,
        total: 0
      }]
    }))
  }

  const updateProduct = (index: number, field: keyof SelectedProduct, value: string | number) => {
    setFormData(prev => {
      const updated = [...prev.selectedProducts]
      updated[index] = { ...updated[index], [field]: value }
      
      if (field === 'productId') {
        const product = availableProducts.find(p => p.id === parseInt(value as string))
        if (product) {
          updated[index] = {
            ...updated[index],
            productId: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            total: product.price * updated[index].quantity
          }
        }
      } else if (field === 'quantity' || field === 'price') {
        updated[index].total = updated[index].price * updated[index].quantity
      }
      
      return { ...prev, selectedProducts: updated }
    })
  }

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    // Here you would typically send the data to your API
    console.log('Submitting application:', formData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Redirect to applications list
    router.push('/admin/credit')
  }

  const steps = [
    { id: 1, title: t.customerInfo, icon: UserIcon },
    { id: 2, title: t.productSelection, icon: ShoppingBagIcon },
    { id: 3, title: t.creditTerms, icon: CurrencyDollarIcon },
    { id: 4, title: t.guarantorInfo, icon: ShieldCheckIcon },
    { id: 5, title: t.reviewSubmit, icon: CheckIcon }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/credit">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t.pageTitle}</h1>
                <p className="text-sm text-gray-500">{t.pageSubtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Steps Navigation */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="overflow-x-auto scrollbar-hide pb-2">
            <div className="flex items-start min-w-max px-4" style={{ width: 'fit-content' }}>
              {steps.map((step, index) => (
                <div key={step.id} className="relative flex flex-col items-center">
                  {/* Step Icon - Centered with label */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step.id <= currentStep 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  
                  {/* Connecting line - positioned to extend from icon */}
                  {index < steps.length - 1 && (
                    <div 
                      className={`absolute top-5 h-1 ${
                        step.id < currentStep ? 'bg-teal-600' : 'bg-gray-200'
                      }`} 
                      style={{ 
                        left: '40px', 
                        width: '120px',
                        transform: 'translateY(-50%)'
                      }}
                    />
                  )}
                  
                  {/* Step Label - Centered below icon */}
                  <div className="mt-2 text-center px-1" style={{ width: '120px' }}>
                    <div className="text-xs text-gray-900 leading-tight font-medium">
                      {step.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 overflow-hidden">
          {/* Step 1: Customer Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{t.customerInfo}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.customerName}</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.customerEmail}</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.customerPhone}</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="+255 XXX XXX XXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.customerId}</label>
                  <input
                    type="text"
                    value={formData.customerId}
                    onChange={(e) => handleInputChange('customerId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="ID Number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.dateOfBirth}</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.occupation}</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="Enter occupation"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.address}</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
                  placeholder="Enter physical address"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.employmentStatus}</label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                  >
                    <option value="employed">{t.employed}</option>
                    <option value="self-employed">{t.selfEmployed}</option>
                    <option value="unemployed">{t.unemployed}</option>
                    <option value="retired">{t.retired}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.employer}</label>
                  <input
                    type="text"
                    value={formData.employer}
                    onChange={(e) => handleInputChange('employer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="Employer/Business name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.monthlyIncome}</label>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.businessType}</label>
                <input
                  type="text"
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="e.g., Hardware Store, Electronics Shop, etc."
                />
              </div>
            </div>
          )}

          {/* Step 2: Product Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{t.productSelection}</h3>
                <button
                  onClick={addProduct}
                  className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>{t.addProduct}</span>
                </button>
              </div>
              
              {formData.selectedProducts.map((product, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="sm:col-span-2 lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.productName}</label>
                      <select
                        value={product.productId}
                        onChange={(e) => updateProduct(index, 'productId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                      >
                        <option value="0">{t.selectProduct}</option>
                        {availableProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - {t.currency} {p.price.toLocaleString()} ({p.inStock} {t.inStock})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.quantity}</label>
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.total}</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm">
                        {t.currency} {product.total.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex justify-center lg:justify-start">
                      <button
                        onClick={() => removeProduct(index)}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <MinusIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">{t.removeProduct}</span>
                        <span className="sm:hidden">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.selectedProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBagIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No products selected yet. Click &quot;Add Product&quot; to start.</p>
                </div>
              )}
              
              {totalOrderValue > 0 && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-teal-800">{t.totalOrderValue}:</span>
                    <span className="text-xl font-bold text-teal-900">{t.currency} {totalOrderValue.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Credit Terms */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{t.creditTerms}</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h4 className="text-md font-medium text-gray-800 mb-4">{t.orderSummary}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.totalOrderValue}:</span>
                    <span className="font-semibold text-gray-900">{t.currency} {totalOrderValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.downPayment}</label>
                  <input
                    type="number"
                    min="0"
                    max={totalOrderValue}
                    value={formData.downPayment}
                    onChange={(e) => handleInputChange('downPayment', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.paymentPeriod}</label>
                  <select
                    value={formData.paymentPeriod}
                    onChange={(e) => handleInputChange('paymentPeriod', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                  >
                    <option value="3">3 {t.months}</option>
                    <option value="6">6 {t.months}</option>
                    <option value="9">9 {t.months}</option>
                    <option value="12">12 {t.months}</option>
                    <option value="18">18 {t.months}</option>
                    <option value="24">24 {t.months}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="hasMonthlyInterest"
                    checked={formData.hasMonthlyInterest}
                    onChange={(e) => handleInputChange('hasMonthlyInterest', e.target.checked)}
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                  />
                  <label htmlFor="hasMonthlyInterest" className="text-sm font-medium text-gray-700">
                    {t.hasMonthlyInterest}
                  </label>
                </div>

                {formData.hasMonthlyInterest && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.customInterestRate} (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.interestRate}
                        onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                        placeholder="8.0"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <h4 className="text-md font-medium text-blue-800 mb-4">Credit Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-700">{t.creditAmount}:</span>
                    <span className="font-semibold text-blue-900">{t.currency} {creditAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">{t.interestRate}:</span>
                    <span className="font-semibold text-blue-900">
                      {formData.hasMonthlyInterest ? `${effectiveInterestRate}% ${t.perAnnum}` : t.noInterest}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">{t.monthlyPayment}:</span>
                    <span className="font-semibold text-blue-900">{t.currency} {Math.round(monthlyPayment).toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-4">{t.calculatedAutomatically}</p>
              </div>
            </div>
          )}

          {/* Step 4: Guarantor Information */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{t.guarantorInfo}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.guarantorName}</label>
                  <input
                    type="text"
                    value={formData.guarantorName}
                    onChange={(e) => handleInputChange('guarantorName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="Enter guarantor full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.guarantorEmail}</label>
                  <input
                    type="email"
                    value={formData.guarantorEmail}
                    onChange={(e) => handleInputChange('guarantorEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="Enter guarantor email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.guarantorPhone}</label>
                  <input
                    type="tel"
                    value={formData.guarantorPhone}
                    onChange={(e) => handleInputChange('guarantorPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="+255 XXX XXX XXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.guarantorId}</label>
                  <input
                    type="text"
                    value={formData.guarantorId}
                    onChange={(e) => handleInputChange('guarantorId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="Guarantor ID Number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.guarantorRelationship}</label>
                  <input
                    type="text"
                    value={formData.guarantorRelationship}
                    onChange={(e) => handleInputChange('guarantorRelationship', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="e.g., Brother, Friend, Business Partner"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.guarantorOccupation}</label>
                  <input
                    type="text"
                    value={formData.guarantorOccupation}
                    onChange={(e) => handleInputChange('guarantorOccupation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="Guarantor occupation"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.guarantorAddress}</label>
                <textarea
                  value={formData.guarantorAddress}
                  onChange={(e) => handleInputChange('guarantorAddress', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
                  placeholder="Enter guarantor address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.guarantorIncome}</label>
                <input
                  type="number"
                  value={formData.guarantorIncome}
                  onChange={(e) => handleInputChange('guarantorIncome', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{t.reviewSubmit}</h3>
              
              {/* Application Summary */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h4 className="text-md font-medium text-gray-800 mb-4">{t.applicationSummary}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Customer Details</h5>
                    <div className="space-y-1 text-sm text-gray-800">
                      <p><span className="font-medium text-gray-900">Name:</span> {formData.customerName}</p>
                      <p><span className="font-medium text-gray-900">Email:</span> {formData.customerEmail}</p>
                      <p><span className="font-medium text-gray-900">Phone:</span> {formData.customerPhone}</p>
                      <p><span className="font-medium text-gray-900">Business:</span> {formData.businessType}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Order Details</h5>
                    <div className="space-y-1 text-sm text-gray-800">
                      <p><span className="font-medium text-gray-900">Products:</span> {formData.selectedProducts.length}</p>
                      <p><span className="font-medium text-gray-900">Total Value:</span> {t.currency} {totalOrderValue.toLocaleString()}</p>
                      <p><span className="font-medium text-gray-900">Down Payment:</span> {t.currency} {formData.downPayment.toLocaleString()}</p>
                      <p><span className="font-medium text-gray-900">Credit Amount:</span> {t.currency} {creditAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.notes}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
                  placeholder="Add any additional notes or requirements..."
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Before submitting:</p>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>Ensure all information is accurate</li>
                      <li>Verify product selection and quantities</li>
                      <li>Confirm guarantor details are correct</li>
                      <li>Review credit terms and payment schedule</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 rounded-lg transition-colors ${
                currentStep === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>{t.previousStep}</span>
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <span>{t.nextStep}</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckIcon className="w-5 h-5" />
                <span>{t.submitApplication}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
} 