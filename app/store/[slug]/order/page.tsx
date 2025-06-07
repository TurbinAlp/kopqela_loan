'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useBusiness } from '../../../contexts/BusinessContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  BanknotesIcon,
  ClockIcon,
  MapPinIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid'

interface OrderItem {
  productId: number
  productName: string
  productNameSwahili: string
  quantity: number
  price: number
  subtotal: number
  inStock: boolean
  stockCount: number
}

interface PaymentMethod {
  id: string
  name: string
  nameSwahili: string
  description: string
  descriptionSwahili: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  available: boolean
  processingTime: string
  processingTimeSwahili: string
}

interface DeliveryOption {
  id: string
  name: string
  nameSwahili: string
  description: string
  descriptionSwahili: string
  cost: number
  estimatedTime: string
  estimatedTimeSwahili: string
  available: boolean
}

export default function OrderRequestPage() {
  const { business } = useBusiness()
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('')
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    specialInstructions: ''
  })
  const [agreesToTerms, setAgreesToTerms] = useState(false)
  const [processedParams, setProcessedParams] = useState<string | null>(null)
  const [creditApplication, setCreditApplication] = useState({
    employerName: '',
    jobTitle: '',
    monthlyIncome: '',
    employmentDuration: '',
    guarantorName: '',
    guarantorPhone: '',
    guarantorRelationship: '',
    guarantorConsent: false,
    creditDuration: '3', // months
    downPayment: 0
  })
  const [partialPayment, setPartialPayment] = useState({
    amountToPay: 0,
    dueDate: '',
    paymentTerms: '30', // days
    agreesToTerms: false
  })

  const translations = {
    en: {
      orderRequest: 'Order Request',
      step: 'Step',
      of: 'of',
      productConfirmation: 'Product Confirmation',
      paymentMethod: 'Payment Method',
      orderDetails: 'Order Details',
      reviewOrder: 'Review Order',
      submitOrder: 'Submit Order',
      previous: 'Previous',
      next: 'Next',
      backToProducts: 'Back to Products',
      
      // Credit Application
      creditDetails: 'Credit Application Details',
      creditTerms: 'Credit Terms & Agreement',
      employmentInfo: 'Employment Information',
      employerName: 'Employer Name',
      jobTitle: 'Job Title/Position',
      monthlyIncome: 'Monthly Income (TZS)',
      employmentDuration: 'Employment Duration (months)',
      guarantorInfo: 'Guarantor Information',
      guarantorName: 'Guarantor Full Name',
      guarantorPhone: 'Guarantor Phone Number',
      guarantorRelationship: 'Relationship to Guarantor',
      guarantorConsent: 'Guarantor has consented to this application',
      creditOptions: 'Credit Terms',
      creditDuration: 'Repayment Period',
      downPayment: 'Down Payment (Optional)',
      creditAmount: 'Credit Amount',
      interestRate: 'Interest Rate',
      monthlyPayment: 'Estimated Monthly Payment',
      creditTermsAgreement: 'I agree to the credit terms and conditions',
      
      // Partial Payment
      partialPaymentSetup: 'Partial Payment Setup', 
      amountToPay: 'Amount to Pay Now',
      remainingBalance: 'Remaining Balance',
      dueDate: 'Due Date for Balance',
      paymentTerms: 'Payment Terms',
      paymentTermsAgreement: 'I agree to the partial payment terms',
      minimumPayment: 'Minimum Payment Required',
      days: 'days',
      
      // Step 1
      selectedProducts: 'Selected Products',
      quantity: 'Quantity',
      price: 'Price',
      subtotal: 'Subtotal',
      total: 'Total',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      updateQuantity: 'Update quantity',
      removeItem: 'Remove item',
      addMoreProducts: 'Add More Products',
      clearAll: 'Clear All',
      
      // Step 2
      choosePaymentMethod: 'Choose Payment Method',
      fullPayment: 'Full Payment',
      fullPaymentDesc: 'Pay the complete amount now',
      partialPayment: 'Partial Payment',
      partialPaymentDesc: 'Pay a portion now, rest later',
      creditSales: 'Credit Sales',
      creditSalesDesc: 'Apply for credit to pay later',
      mobileMoney: 'Mobile Money',
      mobileMoneyDesc: 'Pay via mobile money services',
      bankTransfer: 'Bank Transfer',
      bankTransferDesc: 'Transfer to business bank account',
      cash: 'Cash Payment',
      cashDesc: 'Pay cash on delivery/pickup',
      processingTime: 'Processing Time',
      
      // Step 3
      deliveryOptions: 'Delivery Options',
      customerInformation: 'Customer Information',
      fullName: 'Full Name',
      phoneNumber: 'Phone Number',
      emailAddress: 'Email Address',
      deliveryAddress: 'Delivery Address',
      specialInstructions: 'Special Instructions',
      specialInstructionsPlaceholder: 'Any special requests or delivery instructions...',
      pickup: 'Store Pickup',
      pickupDesc: 'Collect from store location',
      homeDelivery: 'Home Delivery',
      homeDeliveryDesc: 'Delivered to your address',
      estimatedTime: 'Estimated Time',
      free: 'Free',
      
      // Review
      orderSummary: 'Order Summary',
      paymentMethodSelected: 'Payment Method',
      deliveryMethodSelected: 'Delivery Method',
      termsAndConditions: 'Terms & Conditions',
      agreeToTerms: 'I agree to the terms and conditions',
      orderTotal: 'Order Total',
      deliveryFee: 'Delivery Fee',
      grandTotal: 'Grand Total',
      
      // Messages
      noItemsSelected: 'No items selected',
      addItemsMessage: 'Please add items to your order before proceeding',
      selectPaymentMethod: 'Please select a payment method',
      fillRequiredFields: 'Please fill in all required fields',
      orderSubmitted: 'Order Submitted Successfully!',
      orderSubmittedDesc: 'Your order request has been sent to the business. You will be contacted for confirmation.',
      orderNumber: 'Order Number',
      
      // Validation
      nameRequired: 'Full name is required',
      phoneRequired: 'Phone number is required',
      addressRequired: 'Address is required for delivery',
      termsRequired: 'Please accept terms and conditions'
    },
    sw: {
      orderRequest: 'Ombi la Ununuzi',
      step: 'Hatua',
      of: 'ya',
      productConfirmation: 'Uhakikisho wa Bidhaa',
      paymentMethod: 'Njia ya Malipo',
      orderDetails: 'Maelezo ya Oda',
      reviewOrder: 'Hakiki Oda',
      submitOrder: 'Tuma Oda',
      previous: 'Uliopita',
      next: 'Ifuatayo',
      backToProducts: 'Rudi Bidhaa',
      
      // Credit Application
      creditDetails: 'Maelezo ya Mkopo',
      creditTerms: 'Masharti ya Mkopo',
      employmentInfo: 'Taarifa za Kazi',
      employerName: 'Jina la Mwajiri',
      jobTitle: 'Cheo/Nafasi ya Kazi',
      monthlyIncome: 'Mapato ya Kila Mwezi (TZS)',
      employmentDuration: 'Muda wa Kazi (miezi)',
      guarantorInfo: 'Taarifa za Mdhamini',
      guarantorName: 'Jina Kamili la Mdhamini',
      guarantorPhone: 'Nambari ya Simu ya Mdhamini',
      guarantorRelationship: 'Uhusiano na Mdhamini',
      guarantorConsent: 'Mdhamini ameridhia ombi hili',
      creditOptions: 'Masharti ya Mkopo',
      creditDuration: 'Muda wa Kulipa',
      downPayment: 'Malipo ya Awali (Si Lazima)',
      creditAmount: 'Kiasi cha Mkopo',
      interestRate: 'Kiwango cha Riba',
      monthlyPayment: 'Malipo ya Kila Mwezi (Kadirio)',
      creditTermsAgreement: 'Nakubali masharti ya mkopo',
      
      // Partial Payment
      partialPaymentSetup: 'Mpangilio wa Malipo ya Sehemu',
      amountToPay: 'Kiasi cha Kulipa Sasa',
      remainingBalance: 'Salio la Malipo',
      dueDate: 'Tarehe ya Kulipa Salio',
      paymentTerms: 'Masharti ya Malipo',
      paymentTermsAgreement: 'Nakubali masharti ya malipo ya sehemu',
      minimumPayment: 'Malipo ya Chini Yanayohitajika',
      days: 'siku',
      
      // Step 1
      selectedProducts: 'Bidhaa Zilizochaguliwa',
      quantity: 'Idadi',
      price: 'Bei',
      subtotal: 'Jumla Ndogo',
      total: 'Jumla',
      inStock: 'Ipo Stock',
      outOfStock: 'Imekwisha',
      updateQuantity: 'Badilisha idadi',
      removeItem: 'Ondoa bidhaa',
      addMoreProducts: 'Ongeza Bidhaa Zaidi',
      clearAll: 'Futa Vyote',
      
      // Step 2
      choosePaymentMethod: 'Chagua Njia ya Malipo',
      fullPayment: 'Malipo Kamili',
      fullPaymentDesc: 'Lipa kiasi chote sasa',
      partialPayment: 'Malipo ya Sehemu',
      partialPaymentDesc: 'Lipa sehemu sasa, mengine baadaye',
      creditSales: 'Ununuzi kwa Mkopo',
      creditSalesDesc: 'Omba mkopo kulipa baadaye',
      mobileMoney: 'Pesa za Simu',
      mobileMoneyDesc: 'Lipa kwa huduma za pesa za simu',
      bankTransfer: 'Uhamisho wa Benki',
      bankTransferDesc: 'Hamisha kwa akaunti ya benki ya biashara',
      cash: 'Malipo ya Taslimu',
      cashDesc: 'Lipa taslimu wakati wa kupokea',
      processingTime: 'Muda wa Uchakataji',
      
      // Step 3
      deliveryOptions: 'Chaguo la Utoaji',
      customerInformation: 'Taarifa za Mteja',
      fullName: 'Jina Kamili',
      phoneNumber: 'Nambari ya Simu',
      emailAddress: 'Anwani ya Barua Pepe',
      deliveryAddress: 'Anwani ya Utoaji',
      specialInstructions: 'Maagizo Maalum',
      specialInstructionsPlaceholder: 'Maombi au maagizo maalum ya utoaji...',
      pickup: 'Kuchukua Dukani',
      pickupDesc: 'Pokea kutoka duka',
      homeDelivery: 'Utoaji Nyumbani',
      homeDeliveryDesc: 'Tuletewe kwako',
      estimatedTime: 'Muda wa Kadirio',
      free: 'Bure',
      
      // Review
      orderSummary: 'Muhtasari wa Oda',
      paymentMethodSelected: 'Njia ya Malipo',
      deliveryMethodSelected: 'Njia ya Utoaji',
      termsAndConditions: 'Masharti na Viwango',
      agreeToTerms: 'Nakubali masharti na viwango',
      orderTotal: 'Jumla ya Oda',
      deliveryFee: 'Ada ya Utoaji',
      grandTotal: 'Jumla Kuu',
      
      // Messages
      noItemsSelected: 'Hakuna bidhaa zilizochaguliwa',
      addItemsMessage: 'Tafadhali ongeza bidhaa kwenye oda yako kabla ya kuendelea',
      selectPaymentMethod: 'Tafadhali chagua njia ya malipo',
      fillRequiredFields: 'Tafadhali jaza sehemu zote zinazohitajika',
      orderSubmitted: 'Oda Imetumwa Kwa Ufanisi!',
      orderSubmittedDesc: 'Ombi lako la oda limetumwa kwa biashara. Utapigiwa simu kwa uhakikisho.',
      orderNumber: 'Nambari ya Oda',
      
      // Validation
      nameRequired: 'Jina kamili linahitajika',
      phoneRequired: 'Nambari ya simu inahitajika',
      addressRequired: 'Anwani inahitajika kwa utoaji',
      termsRequired: 'Tafadhali kubali masharti na viwango'
    }
  }

  const t = translations[language]

  // Dynamic step calculation based on payment method
  const getTotalSteps = () => {
    if (selectedPaymentMethod === 'credit') return 6
    if (selectedPaymentMethod === 'partial') return 5
    return 4
  }

  const getStepTitle = (step: number) => {
    if (selectedPaymentMethod === 'credit') {
      switch (step) {
        case 1: return t.productConfirmation
        case 2: return t.paymentMethod
        case 3: return t.orderDetails
        case 4: return t.creditDetails
        case 5: return t.creditTerms
        case 6: return t.reviewOrder
        default: return ''
      }
    } else if (selectedPaymentMethod === 'partial') {
      switch (step) {
        case 1: return t.productConfirmation
        case 2: return t.paymentMethod
        case 3: return t.orderDetails
        case 4: return t.partialPaymentSetup
        case 5: return t.reviewOrder
        default: return ''
      }
    } else {
      switch (step) {
        case 1: return t.productConfirmation
        case 2: return t.paymentMethod
        case 3: return t.orderDetails
        case 4: return t.reviewOrder
        default: return ''
      }
    }
  }

  // Generate storage key for this business
  const getStorageKey = () => business ? `orderItems_${business.slug}` : 'orderItems'

  // Load order items from localStorage on mount
  useEffect(() => {
    if (!business) return
    
    const saved = localStorage.getItem(getStorageKey())
    if (saved) {
      try {
        const savedItems = JSON.parse(saved)
        if (Array.isArray(savedItems) && savedItems.length > 0) {
          setOrderItems(savedItems)
          return // Don't initialize from URL if we have saved items
        }
      } catch (error) {
        console.error('Error loading saved order items:', error)
      }
    }
  }, [business]) // Only depend on business, not searchParams

  // Handle URL params separately
  useEffect(() => {
    if (!business) return
    
    const urlProductId = searchParams?.get('productId')
    const urlQuantity = searchParams?.get('quantity')
    const paramString = `${urlProductId}_${urlQuantity}`
    
    // Don't process same params twice
    if (urlProductId && urlQuantity && paramString !== processedParams) {
      setProcessedParams(paramString)
      // Sample product data based on business type
      let sampleProduct = null
      
              if (business.businessType === 'Electronics') {
        sampleProduct = {
          productId: 1,
          productName: 'iPhone 15 Pro',
          productNameSwahili: 'iPhone 15 Pro',
          quantity: parseInt(urlQuantity),
          price: 1200000,
          inStock: true,
          stockCount: 15
        }
      } else if (business.businessType === 'Fashion & Clothing') {
        sampleProduct = {
          productId: 1,
          productName: 'Elegant Dress',
          productNameSwahili: 'Nguo ya Kifahari',
          quantity: parseInt(urlQuantity),
          price: 65000,
          inStock: true,
          stockCount: 12
        }
      } else {
        sampleProduct = {
          productId: 1,
          productName: 'Rice 5kg',
          productNameSwahili: 'Mchele Kilo 5',
          quantity: parseInt(urlQuantity),
          price: 12000,
          inStock: true,
          stockCount: 50
        }
      }
      
      if (sampleProduct) {
        const newItem = {
          ...sampleProduct,
          subtotal: sampleProduct.price * sampleProduct.quantity
        }
        
        // Check if product already exists in order
        setOrderItems(currentItems => {
          const existingItemIndex = currentItems.findIndex(item => item.productId === newItem.productId)
          
          if (existingItemIndex >= 0) {
            // Update existing item quantity
            const updatedItems = [...currentItems]
            updatedItems[existingItemIndex].quantity += newItem.quantity
            updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity
            return updatedItems
          } else {
            // Add new item
            return [...currentItems, newItem]
          }
        })
      }
    }
  }, [business, searchParams, processedParams])

  // Save order items to localStorage whenever they change
  useEffect(() => {
    if (!business || orderItems.length === 0) return
    
    localStorage.setItem(getStorageKey(), JSON.stringify(orderItems))
  }, [business, orderItems])
  
  // Auto-set default partial payment amount when payment method changes
  useEffect(() => {
    if (selectedPaymentMethod === 'partial' && orderItems.length > 0) {
      const total = calculateTotal()
      const defaultAmount = Math.round(total * 0.5) // 50% default
      const minAmount = Math.round(total * 0.3) // 30% minimum
      
      setPartialPayment(prev => ({
        ...prev,
        amountToPay: Math.max(defaultAmount, minAmount)
      }))
    }
  }, [selectedPaymentMethod, orderItems])

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'full',
      name: 'Full Payment',
      nameSwahili: 'Malipo Kamili',
      description: 'Pay the complete amount now',
      descriptionSwahili: 'Lipa kiasi chote sasa',
      icon: CreditCardIcon,
      available: true,
      processingTime: 'Instant',
      processingTimeSwahili: 'Papo hapo'
    },
    {
      id: 'partial',
      name: 'Partial Payment',
      nameSwahili: 'Malipo ya Sehemu',
      description: 'Pay a portion now, rest later',
      descriptionSwahili: 'Lipa sehemu sasa, mengine baadaye',
      icon: ClockIcon,
      available: true,
      processingTime: '1-3 days',
      processingTimeSwahili: 'Siku 1-3'
    },
    {
      id: 'credit',
      name: 'Credit Sales',
      nameSwahili: 'Ununuzi kwa Mkopo',
      description: 'Apply for credit to pay later',
      descriptionSwahili: 'Omba mkopo kulipa baadaye',
      icon: BanknotesIcon,
      available: business?.businessType !== 'Electronics', // Electronics store might not offer credit
      processingTime: '3-5 days',
      processingTimeSwahili: 'Siku 3-5'
    }
  ]

  const deliveryOptions: DeliveryOption[] = [
    {
      id: 'pickup',
      name: 'Store Pickup',
      nameSwahili: 'Kuchukua Dukani',
      description: 'Collect from store location',
      descriptionSwahili: 'Pokea kutoka duka',
      cost: 0,
      estimatedTime: 'Same day',
      estimatedTimeSwahili: 'Siku iyo hiyo',
      available: true
    },
    {
      id: 'delivery',
      name: 'Home Delivery',
      nameSwahili: 'Utoaji Nyumbani',
      description: 'Delivered to your address',
      descriptionSwahili: 'Tuletewe kwako',
      cost: business?.businessType === 'Electronics' ? 5000 : 2000, // Electronics might have higher delivery fee
      estimatedTime: '1-2 days',
      estimatedTimeSwahili: 'Siku 1-2',
      available: true
    }
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.subtotal, 0)
  }

  const getDeliveryFee = () => {
    const option = deliveryOptions.find(opt => opt.id === selectedDeliveryOption)
    return option ? option.cost : 0
  }

  const getGrandTotal = () => {
    return calculateTotal() + getDeliveryFee()
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    setOrderItems(items => 
      items.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity, subtotal: item.price * newQuantity }
          : item
      )
    )
  }

  const removeItem = (productId: number) => {
    const newItems = orderItems.filter(item => item.productId !== productId)
    setOrderItems(newItems)
    
    // Update localStorage
    if (newItems.length === 0) {
      localStorage.removeItem(getStorageKey())
    } else {
      localStorage.setItem(getStorageKey(), JSON.stringify(newItems))
    }
  }

  const clearAllItems = () => {
    setOrderItems([])
    localStorage.removeItem(getStorageKey())
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return orderItems.length > 0
      case 2:
        return selectedPaymentMethod !== ''
      case 3:
        const isDeliverySelected = selectedDeliveryOption !== ''
        const isInfoComplete = customerInfo.fullName && customerInfo.phone && 
          (selectedDeliveryOption === 'pickup' || customerInfo.address)
        return isDeliverySelected && isInfoComplete
      case 4:
        if (selectedPaymentMethod === 'credit') {
          // Credit application validation
          return creditApplication.employerName && 
                 creditApplication.jobTitle && 
                 creditApplication.monthlyIncome && 
                 creditApplication.employmentDuration &&
                 creditApplication.guarantorName && 
                 creditApplication.guarantorPhone && 
                 creditApplication.guarantorRelationship &&
                 creditApplication.guarantorConsent
        } else if (selectedPaymentMethod === 'partial') {
          // Partial payment validation
          return partialPayment.amountToPay > 0 && 
                 partialPayment.dueDate && 
                 partialPayment.agreesToTerms
        } else {
          // Regular order review
          return agreesToTerms
        }
      case 5:
        // Credit terms validation (only for credit sales)
        return selectedPaymentMethod === 'credit' && creditApplication.guarantorConsent
      case 6:
        // Final review for credit orders
        return agreesToTerms
      default:
        return false
    }
  }

  const handleNext = () => {
    const totalSteps = getTotalSteps()
    if (currentStep < totalSteps && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmitOrder = () => {
    if (validateStep(4)) {
      // Generate order number
      const orderNumber = `ORD${Date.now()}`
      
      // Clear order from localStorage
      localStorage.removeItem(getStorageKey())
      
      // Reset order state
      setOrderItems([])
      setCurrentStep(1)
      setSelectedPaymentMethod('')
      setSelectedDeliveryOption('')
      setCustomerInfo({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        specialInstructions: ''
      })
      setAgreesToTerms(false)
      setCreditApplication({
        employerName: '',
        jobTitle: '',
        monthlyIncome: '',
        employmentDuration: '',
        guarantorName: '',
        guarantorPhone: '',
        guarantorRelationship: '',
        guarantorConsent: false,
        creditDuration: '3',
        downPayment: 0
      })
      setPartialPayment({
        amountToPay: 0,
        dueDate: '',
        paymentTerms: '30',
        agreesToTerms: false
      })
      
      alert(`${t.orderSubmitted}\n${t.orderNumber}: ${orderNumber}`)
      // Here you would normally send the order to the backend
    }
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we load the store information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.orderRequest}</h1>
              <p className="text-gray-600 mt-1">
                {t.step} {currentStep} {t.of} {getTotalSteps()}: {getStepTitle(currentStep)}
              </p>
            </div>
            <Link
              href={`/store/${business.slug}/products`}
              className="text-teal-600 hover:text-teal-700 flex items-center"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              {t.backToProducts}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step <= currentStep 
                    ? 'text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`} style={{
                  backgroundColor: step <= currentStep ? business.primaryColor : undefined
                }}>
                  {step < currentStep ? (
                    <CheckIconSolid className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step}</span>
                  )}
                </div>
                {step < getTotalSteps() && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step < currentStep ? 'bg-teal-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Product Confirmation */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{t.selectedProducts}</h2>
                {orderItems.length > 0 && (
                  <button
                    onClick={clearAllItems}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    {t.clearAll}
                  </button>
                )}
              </div>
              
              {orderItems.length === 0 ? (
                <div className="text-center py-8">
                  <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noItemsSelected}</h3>
                  <p className="text-gray-600 mb-4">{t.addItemsMessage}</p>
                  <Link
                    href={`/store/${business.slug}/products`}
                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    {t.addMoreProducts}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {language === 'sw' ? item.productNameSwahili : item.productName}
                        </h3>
                        <p className={`text-sm ${item.inStock ? 'text-green-600' : 'text-red-600'}`}>
                          {item.inStock ? `${t.inStock} (${item.stockCount})` : t.outOfStock}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            className="p-1 border border-gray-300 rounded-l-md hover:bg-gray-50 text-gray-600 font-normal"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-t border-b border-gray-300 bg-gray-50 min-w-[3rem] text-center text-gray-600 font-normal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, Math.min(item.stockCount, item.quantity + 1))}
                            className="p-1 border border-gray-300 rounded-r-md hover:bg-gray-50 text-gray-600 font-normal disabled:text-gray-400"
                            disabled={item.quantity >= item.stockCount}
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                          <p className="font-medium text-gray-900">{formatPrice(item.subtotal)}</p>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-900">{t.total}:</span>
                      <span className="text-xl font-bold" style={{ color: business.primaryColor }}>
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                    <div className="text-center">
                      <Link
                        href={`/store/${business.slug}/products`}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors"
                      >
                        + {t.addMoreProducts}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Payment Method */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.choosePaymentMethod}</h2>
              
              <div className="space-y-4">
                {paymentMethods.filter(method => method.available).map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <method.icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-900">
                          {language === 'sw' ? method.nameSwahili : method.name}
                        </h3>
                        <p className="text-gray-600">
                          {language === 'sw' ? method.descriptionSwahili : method.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t.processingTime}: {language === 'sw' ? method.processingTimeSwahili : method.processingTime}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedPaymentMethod === method.id
                            ? 'border-teal-500 bg-teal-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedPaymentMethod === method.id && (
                            <CheckIconSolid className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Order Details */}
          {currentStep === 3 && (
            <div className="space-y-8">
              {/* Delivery Options */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.deliveryOptions}</h2>
                
                <div className="space-y-4">
                  {deliveryOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedDeliveryOption === option.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedDeliveryOption(option.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MapPinIcon className="w-6 h-6 text-gray-600 mr-4" />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {language === 'sw' ? option.nameSwahili : option.name}
                            </h3>
                            <p className="text-gray-600">
                              {language === 'sw' ? option.descriptionSwahili : option.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {t.estimatedTime}: {language === 'sw' ? option.estimatedTimeSwahili : option.estimatedTime}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {option.cost === 0 ? t.free : formatPrice(option.cost)}
                          </p>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedDeliveryOption === option.id
                              ? 'border-teal-500 bg-teal-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedDeliveryOption === option.id && (
                              <CheckIconSolid className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.customerInformation}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.fullName}
                      onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})}
                      placeholder={language === 'sw' ? 'Ingiza jina lako kamili...' : 'Enter your full name...'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.phoneNumber} *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder={language === 'sw' ? '+255 123 456 789' : '+255 123 456 789'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.emailAddress}
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      placeholder={language === 'sw' ? 'mfano@barua.com' : 'example@email.com'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                    />
                  </div>
                  
                  {selectedDeliveryOption === 'delivery' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.deliveryAddress} *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                        placeholder={language === 'sw' ? 'Ingiza anwani yako ya utoaji...' : 'Enter your delivery address...'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.specialInstructions}
                    </label>
                    <textarea
                      value={customerInfo.specialInstructions}
                      onChange={(e) => setCustomerInfo({...customerInfo, specialInstructions: e.target.value})}
                      placeholder={t.specialInstructionsPlaceholder}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Credit Application Details (Credit Sales Only) */}
          {currentStep === 4 && selectedPaymentMethod === 'credit' && (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-gray-900">{t.creditDetails}</h2>
              
              {/* Employment Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t.employmentInfo}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.employerName} *
                    </label>
                    <input
                      type="text"
                      value={creditApplication.employerName}
                      onChange={(e) => setCreditApplication({...creditApplication, employerName: e.target.value})}
                      placeholder={language === 'sw' ? 'Mfano: Kampuni ya ABC' : 'Example: ABC Company'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.jobTitle} *
                    </label>
                    <input
                      type="text"
                      value={creditApplication.jobTitle}
                      onChange={(e) => setCreditApplication({...creditApplication, jobTitle: e.target.value})}
                      placeholder={language === 'sw' ? 'Mfano: Mkuu wa Uongozi' : 'Example: Manager'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.monthlyIncome} *
                    </label>
                    <input
                      type="number"
                      value={creditApplication.monthlyIncome}
                      onChange={(e) => setCreditApplication({...creditApplication, monthlyIncome: e.target.value})}
                      placeholder={language === 'sw' ? '500000' : '500000'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.employmentDuration} *
                    </label>
                    <input
                      type="number"
                      value={creditApplication.employmentDuration}
                      onChange={(e) => setCreditApplication({...creditApplication, employmentDuration: e.target.value})}
                      placeholder={language === 'sw' ? '12' : '12'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Guarantor Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t.guarantorInfo}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.guarantorName} *
                    </label>
                    <input
                      type="text"
                      value={creditApplication.guarantorName}
                      onChange={(e) => setCreditApplication({...creditApplication, guarantorName: e.target.value})}
                      placeholder={language === 'sw' ? 'Jina kamili la mdhamini...' : 'Full name of guarantor...'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.guarantorPhone} *
                    </label>
                    <input
                      type="tel"
                      value={creditApplication.guarantorPhone}
                      onChange={(e) => setCreditApplication({...creditApplication, guarantorPhone: e.target.value})}
                      placeholder={language === 'sw' ? '+255 987 654 321' : '+255 987 654 321'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.guarantorRelationship} *
                    </label>
                    <select
                      value={creditApplication.guarantorRelationship}
                      onChange={(e) => setCreditApplication({...creditApplication, guarantorRelationship: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal"
                      required
                    >
                      <option value="">Select relationship...</option>
                      <option value="spouse">Spouse/Partner</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Brother/Sister</option>
                      <option value="friend">Friend</option>
                      <option value="colleague">Colleague</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={creditApplication.guarantorConsent}
                        onChange={(e) => setCreditApplication({...creditApplication, guarantorConsent: e.target.checked})}
                        className="mr-2 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">{t.guarantorConsent}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Partial Payment Setup (Partial Payment Only) */}
          {currentStep === 4 && selectedPaymentMethod === 'partial' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">{t.partialPaymentSetup}</h2>
              
              {/* Payment Amount Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.amountToPay} *
                  </label>
                  <input
                    type="number"
                    value={partialPayment.amountToPay}
                    onChange={(e) => setPartialPayment({...partialPayment, amountToPay: parseInt(e.target.value) || 0})}
                    placeholder={language === 'sw' ? 'Kiasi cha kulipa sasa...' : 'Amount to pay now...'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                    min="1"
                    max={calculateTotal() - 1000} // Minimum 1000 remaining
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {t.minimumPayment}: {formatPrice(calculateTotal() * 0.3)} (30%)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.dueDate} *
                  </label>
                  <input
                    type="date"
                    value={partialPayment.dueDate}
                    onChange={(e) => setPartialPayment({...partialPayment, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Tomorrow
                    required
                  />
                </div>
              </div>
              
              {/* Payment Terms Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.paymentTerms}
                </label>
                <select
                  value={partialPayment.paymentTerms}
                  onChange={(e) => setPartialPayment({...partialPayment, paymentTerms: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal"
                >
                  <option value="7">7 {t.days}</option>
                  <option value="14">14 {t.days}</option>
                  <option value="30">30 {t.days}</option>
                  <option value="60">60 {t.days}</option>
                  <option value="90">90 {t.days}</option>
                </select>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.orderTotal}:</span>
                    <span className="font-medium">{formatPrice(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.amountToPay}:</span>
                    <span className="font-medium">{formatPrice(partialPayment.amountToPay)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">{t.remainingBalance}:</span>
                    <span className="font-bold text-lg" style={{ color: business.primaryColor }}>
                      {formatPrice(calculateTotal() - partialPayment.amountToPay)}
                    </span>
                  </div>
                  {partialPayment.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.dueDate}:</span>
                      <span className="font-medium">{new Date(partialPayment.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="border rounded-lg p-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={partialPayment.agreesToTerms}
                    onChange={(e) => setPartialPayment({...partialPayment, agreesToTerms: e.target.checked})}
                    className="mr-3 mt-1 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">{t.paymentTermsAgreement}</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Credit Terms (Credit Sales Only) */}
          {currentStep === 5 && selectedPaymentMethod === 'credit' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">{t.creditTerms}</h2>
              
              {/* Credit Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.creditDuration}
                  </label>
                  <select
                    value={creditApplication.creditDuration}
                    onChange={(e) => setCreditApplication({...creditApplication, creditDuration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.downPayment}
                  </label>
                  <input
                    type="number"
                    value={creditApplication.downPayment}
                    onChange={(e) => setCreditApplication({...creditApplication, downPayment: parseInt(e.target.value) || 0})}
                    placeholder={language === 'sw' ? 'Mfano: 100000' : 'Example: 100000'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                    min="0"
                    max={calculateTotal()}
                  />
                </div>
              </div>

              {/* Credit Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t.creditOptions}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.orderTotal}:</span>
                    <span className="font-medium">{formatPrice(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.downPayment}:</span>
                    <span className="font-medium">{formatPrice(creditApplication.downPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.creditAmount}:</span>
                    <span className="font-medium">{formatPrice(calculateTotal() - creditApplication.downPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.interestRate}:</span>
                    <span className="font-medium">15% per year</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">{t.monthlyPayment}:</span>
                    <span className="font-bold text-lg" style={{ color: business.primaryColor }}>
                      {formatPrice(((calculateTotal() - creditApplication.downPayment) * 1.15) / parseInt(creditApplication.creditDuration))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="border rounded-lg p-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={creditApplication.guarantorConsent}
                    onChange={(e) => setCreditApplication({...creditApplication, guarantorConsent: e.target.checked})}
                    className="mr-3 mt-1 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">{t.creditTermsAgreement}</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 4/5/6: Review Order */}
          {((currentStep === 4 && selectedPaymentMethod !== 'credit' && selectedPaymentMethod !== 'partial') || 
            (currentStep === 5 && selectedPaymentMethod === 'partial') || 
            (currentStep === 6 && selectedPaymentMethod === 'credit')) && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">{t.orderSummary}</h2>
              
              {/* Order Items */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">{t.selectedProducts}</h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <span>{language === 'sw' ? item.productNameSwahili : item.productName} × {item.quantity}</span>
                      <span>{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{t.paymentMethodSelected}</h3>
                <p className="text-gray-600">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.[language === 'sw' ? 'nameSwahili' : 'name']}
                </p>
                
                {/* Partial Payment Details */}
                {selectedPaymentMethod === 'partial' && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t.amountToPay}:</span>
                        <span className="font-medium">{formatPrice(partialPayment.amountToPay)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t.remainingBalance}:</span>
                        <span className="font-medium">{formatPrice(calculateTotal() - partialPayment.amountToPay)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t.dueDate}:</span>
                        <span className="font-medium">{new Date(partialPayment.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Delivery Method */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{t.deliveryMethodSelected}</h3>
                <p className="text-gray-600">
                  {deliveryOptions.find(d => d.id === selectedDeliveryOption)?.[language === 'sw' ? 'nameSwahili' : 'name']}
                </p>
                {customerInfo.address && (
                  <p className="text-sm text-gray-500 mt-1">{customerInfo.address}</p>
                )}
              </div>
              
              {/* Total */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t.orderTotal}:</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.deliveryFee}:</span>
                    <span>{getDeliveryFee() === 0 ? t.free : formatPrice(getDeliveryFee())}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>{t.grandTotal}:</span>
                    <span style={{ color: business.primaryColor }}>{formatPrice(getGrandTotal())}</span>
                  </div>
                </div>
              </div>
              
              {/* Terms */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreesToTerms}
                  onChange={(e) => setAgreesToTerms(e.target.checked)}
                  className="mr-2 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  {t.agreeToTerms}
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center px-4 py-2 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-800"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            {t.previous}
          </button>
          
          {currentStep < getTotalSteps() ? (
            <button
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="flex items-center px-6 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: business.primaryColor }}
            >
              {t.next}
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmitOrder}
              disabled={!validateStep(getTotalSteps())}
              className="flex items-center px-6 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: business.primaryColor }}
            >
              {t.submitOrder}
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 