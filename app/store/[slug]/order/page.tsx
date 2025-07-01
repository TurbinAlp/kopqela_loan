'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useParams } from 'next/navigation'
import { useCustomerBusiness } from '../../../hooks/useCustomerBusiness'
import { useLanguage } from '../../../contexts/LanguageContext'
import FullPaymentFlow from '../../../components/store/FullPaymentFlow'
import PartialPaymentFlow from '../../../components/store/PartialPaymentFlow'
import CreditPurchaseFlow from '../../../components/store/CreditPurchaseFlow'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  BanknotesIcon,
  ClockIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid'

interface OrderItem {
  productId: number
  name: string
  nameSwahili: string
  quantity: number
  price: number
  subtotal: number
  image?: string
  category?: string
  unit?: string
  inStock?: boolean
  stockCount?: number
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
  const params = useParams()
  const slug = params.slug as string
  const { business, isLoading: businessLoading } = useCustomerBusiness(slug)
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [selectedActualPaymentMethod, setSelectedActualPaymentMethod] = useState('')
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
  const [customerType, setCustomerType] = useState('individual') // 'individual' | 'business'
  const [creditApplication, setCreditApplication] = useState({
    // Individual fields
    employerName: '',
    jobTitle: '',
    monthlyIncome: '',
    employmentDuration: '',
    
    // Business fields
    businessName: '',
    businessRegistrationNumber: '',
    businessType: '',
    monthlyRevenue: '',
    businessAge: '', // months in operation
    businessAddress: '',
    
    // Common fields
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
  const [selectedCreditPlan, setSelectedCreditPlan] = useState('6') // Default to 6 months
  const [verificationData, setVerificationData] = useState({
    fullName: '',
    phone: '',
    idNumber: '',
    monthlyIncome: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const translations = {
    en: {
      orderRequest: 'Order Request',
      step: 'Step',
      of: 'of',
      productConfirmation: 'Product Confirmation',
      paymentPlan: 'Payment Plan',
      paymentMethod: 'Payment Method',
      orderDetails: 'Order Details',
      reviewOrder: 'Review Order',
      submitOrder: 'Submit Order',
      previous: 'Previous',
      next: 'Next',
      backToProducts: 'Back to Products',
      
      // Credit Purchase
      creditDetails: 'Credit Purchase Information',
      creditTerms: 'Credit Purchase Terms & Agreement',
      customerType: 'Customer Type',
      individualCustomer: 'Individual Customer',
      businessCustomer: 'Business Customer',
      employmentInfo: 'Employment Information',
      businessInfo: 'Business Information',
      employerName: 'Employer Name',
      jobTitle: 'Job Title/Position',
      monthlyIncome: 'Monthly Income (TZS)',
      employmentDuration: 'Employment Duration (months)',
      businessName: 'Business Name',
      businessRegistrationNumber: 'Business Registration Number',
      businessType: 'Business Type',
      monthlyRevenue: 'Monthly Business Revenue (TZS)',
      businessAge: 'Business Age (months)',
      businessAddress: 'Business Address',
      guarantorInfo: 'Guarantor Information',
      guarantorName: 'Guarantor Full Name',
      guarantorPhone: 'Guarantor Phone Number',
      guarantorRelationship: 'Relationship to Guarantor',
      guarantorConsent: 'Guarantor has consented to this application',
      creditOptions: 'Credit Terms',
      creditDuration: 'Repayment Period',
      downPayment: 'Down Payment (Optional)',
      creditAmount: 'Total Amount to be Paid on Credit',
      interestRate: 'Interest Rate',
      monthlyPayment: 'Estimated Monthly Payment',
      creditTermsAgreement: 'I agree to purchase these products on credit terms',
      
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
      choosePaymentPlan: 'Choose Payment Plan',
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
      creditCard: 'Credit/Debit Card',
      creditCardDesc: 'Pay with your card',
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
      paymentPlan: 'Mpango wa Malipo',
      paymentMethod: 'Njia ya Malipo',
      orderDetails: 'Maelezo ya Oda',
      reviewOrder: 'Hakiki Oda',
      submitOrder: 'Tuma Oda',
      previous: 'Uliopita',
      next: 'Ifuatayo',
      backToProducts: 'Rudi Bidhaa',
      
      // Credit Purchase
      creditDetails: 'Taarifa za Ununuzi kwa Mkopo',
      creditTerms: 'Masharti ya Ununuzi kwa Mkopo',
      customerType: 'Aina ya Mteja',
      individualCustomer: 'Mteja Binafsi',
      businessCustomer: 'Mteja wa Biashara',
      employmentInfo: 'Taarifa za Kazi',
      businessInfo: 'Taarifa za Biashara',
      employerName: 'Jina la Mwajiri',
      jobTitle: 'Cheo/Nafasi ya Kazi',
      monthlyIncome: 'Mapato ya Kila Mwezi (TZS)',
      employmentDuration: 'Muda wa Kazi (miezi)',
      businessName: 'Jina la Biashara',
      businessRegistrationNumber: 'Nambari ya Usajili wa Biashara',
      businessType: 'Aina ya Biashara',
      monthlyRevenue: 'Mapato ya Kila Mwezi ya Biashara (TZS)',
      businessAge: 'Umri wa Biashara (miezi)',
      businessAddress: 'Anwani ya Biashara',
      guarantorInfo: 'Taarifa za Mdhamini',
      guarantorName: 'Jina Kamili la Mdhamini',
      guarantorPhone: 'Nambari ya Simu ya Mdhamini',
      guarantorRelationship: 'Uhusiano na Mdhamini',
      guarantorConsent: 'Mdhamini ameridhia ombi hili',
      creditOptions: 'Masharti ya Mkopo',
      creditDuration: 'Muda wa Kulipa',
      downPayment: 'Malipo ya Awali (Si Lazima)',
      creditAmount: 'Jumla ya Kiasi cha Ununuzi kwa Mkopo',
      interestRate: 'Kiwango cha Riba',
      monthlyPayment: 'Malipo ya Kila Mwezi (Kadirio)',
      creditTermsAgreement: 'Nakubali kununua bidhaa hizi kwa masharti ya mkopo',
      
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
      choosePaymentPlan: 'Chagua Mpango wa Malipo',
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
      creditCard: 'Kadi ya Mkopo',
      creditCardDesc: 'Lipa kwa kadi yako',
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
        case 2: return t.paymentPlan
        case 3: return t.orderDetails
        case 4: return t.creditDetails
        case 5: return t.creditTerms
        case 6: return t.reviewOrder
        default: return ''
      }
    } else if (selectedPaymentMethod === 'partial') {
      switch (step) {
        case 1: return t.productConfirmation
        case 2: return t.paymentPlan
        case 3: return t.orderDetails
        case 4: return t.partialPaymentSetup
        case 5: return t.reviewOrder
        default: return ''
      }
    } else {
      switch (step) {
        case 1: return t.productConfirmation
        case 2: return t.paymentPlan
        case 3: return t.orderDetails
        case 4: return t.reviewOrder
        default: return ''
      }
    }
  }

  // Generate storage key for this business
  const getStorageKey = useCallback(() => business ? `orderItems_${business.slug}` : 'orderItems', [business])

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
  }, [business, getStorageKey]) // Only depend on business, not searchParams

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
          name: 'iPhone 15 Pro',
          nameSwahili: 'iPhone 15 Pro',
          quantity: parseInt(urlQuantity),
          price: 1200000,
          inStock: true,
          stockCount: 15
        }
      } else if (business.businessType === 'Fashion & Clothing') {
        sampleProduct = {
          productId: 1,
          name: 'Elegant Dress',
          nameSwahili: 'Nguo ya Kifahari',
          quantity: parseInt(urlQuantity),
          price: 65000,
          inStock: true,
          stockCount: 12
        }
      } else {
        sampleProduct = {
          productId: 1,
          name: 'Rice 5kg',
          nameSwahili: 'Mchele Kilo 5',
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
  }, [business, orderItems, getStorageKey])
  
  const calculateTotal = useCallback(() => {
    return orderItems.reduce((total, item) => total + item.subtotal, 0)
  }, [orderItems])

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
  }, [selectedPaymentMethod, orderItems, calculateTotal])

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
      available: business?.businessSetting?.enableCreditSales || false,
      processingTime: '3-5 days',
      processingTimeSwahili: 'Siku 3-5'
    }
  ]

  const actualPaymentMethods = [
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      nameSwahili: 'Pesa za Simu',
      description: 'Pay via mobile money services',
      descriptionSwahili: 'Lipa kwa huduma za pesa za simu',
      icon: CreditCardIcon,
      available: true,
      processingTime: 'Instant',
      processingTimeSwahili: 'Papo hapo'
    },
    {
      id: 'cash',
      name: 'Cash Payment',
      nameSwahili: 'Malipo ya Taslimu',
      description: 'Pay cash on delivery/pickup',
      descriptionSwahili: 'Lipa taslimu wakati wa kupokea',
      icon: BanknotesIcon,
      available: true,
      processingTime: 'On delivery',
      processingTimeSwahili: 'Wakati wa utoaji'
    },
    {
      id: 'credit_card',
      name: 'Credit/Debit Card',
      nameSwahili: 'Kadi ya Mkopo',
      description: 'Pay with your card',
      descriptionSwahili: 'Lipa kwa kadi yako',
      icon: CreditCardIcon,
      available: true,
      processingTime: 'Instant',
      processingTimeSwahili: 'Papo hapo'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      nameSwahili: 'Uhamisho wa Benki',
      description: 'Transfer to business bank account',
      descriptionSwahili: 'Hamisha kwa akaunti ya benki ya biashara',
      icon: BanknotesIcon,
      available: true,
      processingTime: '1-2 days',
      processingTimeSwahili: 'Siku 1-2'
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
        return selectedPaymentMethod !== '' && selectedActualPaymentMethod !== ''
      case 3:
        const isDeliverySelected = selectedDeliveryOption !== ''
        const isInfoComplete = customerInfo.fullName && customerInfo.phone && 
          (selectedDeliveryOption === 'pickup' || customerInfo.address)
        return isDeliverySelected && isInfoComplete
      case 4:
        if (selectedPaymentMethod === 'credit') {
          return selectedCreditPlan !== '' // Hakikisha plan imechaguliwa
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
        if (selectedPaymentMethod === 'credit') {
          // Step 5 for credit: Validate employment/business information
          if (customerType === 'individual') {
            return verificationData.fullName && 
                   verificationData.phone && 
                   verificationData.idNumber && 
                   verificationData.monthlyIncome
          } else {
            return creditApplication.businessName && 
                   creditApplication.businessType && 
                   creditApplication.monthlyRevenue && 
                   creditApplication.businessAge
          }
        } else if (selectedPaymentMethod === 'partial') {
          // Partial payment review
          return partialPayment.agreesToTerms
        } else {
          // Should not reach here for non-credit/partial payments
          return agreesToTerms
        }
      case 6:
        if (selectedPaymentMethod === 'credit') {
          // Step 6 for credit: Only validate terms agreement (guarantor removed)
          return agreesToTerms
        } else {
          // Final review for other payment methods
          return agreesToTerms
        }
      case 7:
        // Final review step (for credit purchases)
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

  const handleSubmitOrder = async () => {
    if (!validateStep(getTotalSteps()) || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Prepare order data for submission
      const orderData = {
        customerInfo,
        orderItems: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.price),
          subtotal: Number(item.subtotal)
        })),
        paymentMethod: selectedPaymentMethod,
        actualPaymentMethod: selectedActualPaymentMethod,
        deliveryOption: selectedDeliveryOption,
        deliveryFee: getDeliveryFee(),
        subtotal: calculateTotal(),
        taxAmount: 0, // Can be calculated based on business tax rate
        totalAmount: calculateTotal(),
        ...(selectedPaymentMethod === 'partial' && partialPayment && {
          partialPayment: {
            amountToPay: partialPayment.amountToPay,
            dueDate: partialPayment.dueDate,
            paymentTerms: partialPayment.paymentTerms
          }
        }),
        ...(selectedPaymentMethod === 'credit' && {
          creditPurchase: {
            selectedPlan: selectedCreditPlan,
            verificationData,
            customerType: 'individual' // For now, always individual
          }
        })
      }

      // Submit order to backend
      console.log('Sending order data:', orderData)
      const response = await fetch(`/api/businesses/${business?.slug}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()
      console.log('Order submission result:', result)

      if (result.success) {
      // Clear order from localStorage
      localStorage.removeItem(getStorageKey())
      
      // Reset order state
      setOrderItems([])
      setCurrentStep(1)
      setSelectedPaymentMethod('')
      setSelectedActualPaymentMethod('')
      setSelectedDeliveryOption('')
      setCustomerInfo({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        specialInstructions: ''
      })
      setAgreesToTerms(false)
      setCustomerType('individual')
      setCreditApplication({
        employerName: '',
        jobTitle: '',
        monthlyIncome: '',
        employmentDuration: '',
        businessName: '',
        businessRegistrationNumber: '',
        businessType: '',
        monthlyRevenue: '',
        businessAge: '',
        businessAddress: '',
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
        setSelectedCreditPlan('6')
        setVerificationData({
          fullName: '',
          phone: '',
          idNumber: '',
          monthlyIncome: ''
        })
        
        // Show success message with order details
        let successMessage = `${t.orderSubmitted}\n${t.orderNumber}: ${result.data.orderNumber}`
        
        if (selectedPaymentMethod === 'credit') {
          successMessage += `\n\n${language === 'sw' ? 'Ombi la mkopo limejazwa kwa ukaguzi.' : 'Credit application submitted for review.'}`
        } else if (selectedPaymentMethod === 'partial') {
          successMessage += `\n\n${language === 'sw' ? 'Malipo ya sehemu' : 'Partial Payment'}: TSh ${result.data.partialPaymentAmount?.toLocaleString()}`
          successMessage += `\n${language === 'sw' ? 'Salio' : 'Balance'}: TSh ${result.data.balanceDue?.toLocaleString()}`
        }
        
        alert(successMessage)
        
        // Optionally redirect to order confirmation page
        // window.location.href = `/store/${business?.slug}/order/confirmation/${result.data.orderNumber}`
      } else {
        alert(`${language === 'sw' ? 'Hitilafu' : 'Error'}: ${result.message}`)
      }
         } catch (error) {
       console.error('Error submitting order:', error)
       alert(`${language === 'sw' ? 'Hitilafu ya mtandao. Jaribu tena.' : 'Network error. Please try again.'}`)
     } finally {
       setIsSubmitting(false)
    }
  }

  // Show loading while loading business data
  if (businessLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we load the store information.</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h2>
          <p className="text-gray-600">The store you&apos;re looking for doesn&apos;t exist.</p>
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
                  backgroundColor: step <= currentStep ? '#14b8a6' : undefined
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
                          {language === 'sw' ? item.nameSwahili : item.name}
                        </h3>
                        <p className={`text-sm ${item.inStock ? 'text-green-600' : 'text-red-600'}`}>
                          {item.inStock ? `${t.inStock} (${item.stockCount || 0})` : t.outOfStock}
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
                            onClick={() => updateQuantity(item.productId, Math.min(item.stockCount || 999, item.quantity + 1))}
                            className="p-1 border border-gray-300 rounded-r-md hover:bg-gray-50 text-gray-600 font-normal disabled:text-gray-400"
                            disabled={item.quantity >= (item.stockCount || 999)}
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
                      <span className="text-xl font-bold" style={{ color: '#14b8a6' }}>
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

          {/* Step 2: Payment Plan */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.choosePaymentPlan}</h2>
              
              <div className="space-y-4 mb-8">
                {paymentMethods.filter(method => method.available).map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedPaymentMethod(method.id)
                      setSelectedActualPaymentMethod('') // Reset payment method when plan changes
                    }}
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

              {/* Show Payment Methods after selecting a payment plan */}
              {selectedPaymentMethod && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.choosePaymentMethod}</h3>
                  
                  {/* Payment method context messages */}
                  {selectedPaymentMethod === 'partial' && (
                    <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-700">
                        {language === 'sw' 
                          ? 'Chagua njia ya kulipa kiasi cha sasa na pia ya kulipa salio baadaye.'
                          : 'Choose payment method for your current payment and future balance payment.'}
                      </p>
                    </div>
                  )}
                  
                  {selectedPaymentMethod === 'credit' && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        {language === 'sw' 
                          ? 'Chagua njia ya malipo utakayotumia kulipa mkopo baada ya kukubaliwa.'
                          : 'Choose payment method you will use to pay the credit after approval.'}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {actualPaymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedActualPaymentMethod === method.id
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedActualPaymentMethod(method.id)}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <method.icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="ml-3 flex-1">
                            <h4 className="font-medium text-gray-900">
                              {language === 'sw' ? method.nameSwahili : method.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {language === 'sw' ? method.descriptionSwahili : method.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t.processingTime}: {language === 'sw' ? method.processingTimeSwahili : method.processingTime}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              selectedActualPaymentMethod === method.id
                                ? 'border-teal-500 bg-teal-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedActualPaymentMethod === method.id && (
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
            </div>
          )}

          {/* Step 3: Delivery & Customer Information (Improved UX) */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-gray-900">{t.orderDetails}</h2>
              
              {/* Progress indicator for this step */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      {language === 'sw' 
                        ? 'Hatua hii: Chagua jinsi ya kupokea bidhaa na ongeza taarifa zako muhimu tu.' 
                        : 'This step: Choose how to receive your products and add your essential details only.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Options */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t.deliveryOptions}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deliveryOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedDeliveryOption === option.id
                          ? 'border-teal-500 bg-teal-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedDeliveryOption(option.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            selectedDeliveryOption === option.id
                              ? 'border-teal-500 bg-teal-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedDeliveryOption === option.id && (
                              <CheckIconSolid className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {language === 'sw' ? option.nameSwahili : option.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {language === 'sw' ? option.descriptionSwahili : option.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t.estimatedTime}: {language === 'sw' ? option.estimatedTimeSwahili : option.estimatedTime}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {option.cost === 0 ? t.free : formatPrice(option.cost)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Essential Customer Information Only */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t.customerInformation}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {language === 'sw' 
                    ? 'Taarifa muhimu tu zinazohitajika ili kuweza kuwasilisha oda yako.' 
                    : 'Only essential information needed to process your order.'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.fullName}
                      onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})}
                      placeholder={language === 'sw' ? 'Jina lako kamili...' : 'Your full name...'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700"
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
                      placeholder="+255 123 456 789"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700"
                      required
                    />
                  </div>
                  
                  {selectedDeliveryOption === 'delivery' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.deliveryAddress} *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                        placeholder={language === 'sw' ? 'Anwani ya utoaji...' : 'Delivery address...'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700"
                        required
                      />
                    </div>
                  )}
                  
                  {/* Optional email with clear indication */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.emailAddress} <span className="text-gray-500 font-normal">({language === 'sw' ? 'Si lazima' : 'Optional'})</span>
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      placeholder={language === 'sw' ? 'barua@mfano.com' : 'email@example.com'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'sw' 
                        ? 'Kwa kupokea taarifa za oda na gharama za ziada tu' 
                        : 'For order updates and cost notifications only'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review Order - REFACTORED */}
          {currentStep === 4 && selectedPaymentMethod === 'full' && (
            <FullPaymentFlow
              orderItems={orderItems}
              deliveryOptions={deliveryOptions}
              selectedDeliveryOption={selectedDeliveryOption}
              customerInfo={customerInfo}
              agreesToTerms={agreesToTerms}
              setAgreesToTerms={setAgreesToTerms}
              language={language}
              onSubmitOrder={handleSubmitOrder}
              isSubmitting={isSubmitting}
              formatPrice={formatPrice}
              calculateTotal={calculateTotal}
              getDeliveryFee={getDeliveryFee}
              getGrandTotal={getGrandTotal}
            />
          )}

          {/* Credit Purchase Steps 4, 5, 6 - REFACTORED */}
          {((currentStep === 4 && selectedPaymentMethod === 'credit') || 
            (currentStep === 5 && selectedPaymentMethod === 'credit') || 
            (currentStep === 6 && selectedPaymentMethod === 'credit')) && (
            <CreditPurchaseFlow
              currentStep={currentStep}
              orderItems={orderItems}
              deliveryOptions={deliveryOptions}
              selectedDeliveryOption={selectedDeliveryOption}
              customerInfo={customerInfo}
              selectedCreditPlan={selectedCreditPlan}
              setSelectedCreditPlan={setSelectedCreditPlan}
              verificationData={verificationData}
              setVerificationData={setVerificationData}
              agreesToTerms={agreesToTerms}
              setAgreesToTerms={setAgreesToTerms}
              language={language}
              business={business}
              isSubmitting={isSubmitting}
              calculateTotal={calculateTotal}
              getDeliveryFee={getDeliveryFee}
              getGrandTotal={getGrandTotal}
            />
          )}

          {/* Step 5: Review Order - Partial Payment */}
          {currentStep === 5 && selectedPaymentMethod === 'partial' && (
            <PartialPaymentFlow
              currentStep={currentStep}
              orderItems={orderItems}
              deliveryOptions={deliveryOptions}
              selectedDeliveryOption={selectedDeliveryOption}
              customerInfo={customerInfo}
              partialPayment={partialPayment}
              setPartialPayment={setPartialPayment}
              agreesToTerms={agreesToTerms}
              setAgreesToTerms={setAgreesToTerms}
              language={language}
              isSubmitting={isSubmitting}
              formatPrice={formatPrice}
              calculateTotal={calculateTotal}
              getDeliveryFee={getDeliveryFee}
              getGrandTotal={getGrandTotal}
            />
          )}



          {/* Step 4: Partial Payment Setup - REFACTORED */}
          {currentStep === 4 && selectedPaymentMethod === 'partial' && (
            <PartialPaymentFlow
              currentStep={currentStep}
              orderItems={orderItems}
              deliveryOptions={deliveryOptions}
              selectedDeliveryOption={selectedDeliveryOption}
              customerInfo={customerInfo}
              partialPayment={partialPayment}
              setPartialPayment={setPartialPayment}
              agreesToTerms={agreesToTerms}
              setAgreesToTerms={setAgreesToTerms}
              language={language}
              isSubmitting={isSubmitting}
              formatPrice={formatPrice}
              calculateTotal={calculateTotal}
              getDeliveryFee={getDeliveryFee}
              getGrandTotal={getGrandTotal}
            />
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
              style={{ backgroundColor: '#14b8a6' }}
            >
              {t.next}
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmitOrder}
              disabled={!validateStep(getTotalSteps()) || isSubmitting}
              className="flex items-center px-6 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: '#14b8a6' }}
            >
              {isSubmitting ? (
                language === 'sw' ? 'Inatuma...' : 'Submitting...'
              ) : (
                t.submitOrder
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}