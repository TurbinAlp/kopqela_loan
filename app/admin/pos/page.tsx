'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBusiness } from '../../contexts/BusinessContext'
import { useNotifications } from '../../contexts/NotificationContext'
import PermissionGate from '../../components/auth/PermissionGate'
import PaymentSection from '../../components/admin/pos/PaymentSection'
import ProductsSection from '../../components/admin/pos/ProductsSection'
import ServicesSection from '../../components/admin/pos/ServicesSection'
import CustomerSection from '../../components/admin/pos/CustomerSection'
import CartSection from '../../components/admin/pos/CartSection'
import AddCustomerModal from '../../components/AddCustomerModal'
import Receipt from '../../components/Receipt'

interface Product {
  id: number
  name: string
  nameSwahili?: string
  price: number
  wholesalePrice?: number
  category?: string
  image?: string
  stock: number
  barcode?: string
  unit?: string
}

interface CartItem extends Product {
  quantity: number
  subtotal: number
  itemType?: 'PRODUCT' | 'SERVICE'  // Distinguish between products and services
  serviceItemId?: number             // For service items
  durationValue?: number             // For service items
  durationUnit?: string              // For service items
}

interface Customer {
  id: number
  name: string
  phone: string
  email?: string
  creditLimit?: number
  outstandingBalance?: number
}

interface ApiProduct {
  id: number
  name: string
  nameSwahili?: string
  price: number
  wholesalePrice?: number
  category?: { name: string }
  images?: { url: string }[]
  inventory?: { quantity: number }
  barcode?: string
  unit?: string
}

interface ApiCustomer {
  id: number
  name: string
  phone?: string
  email?: string
  creditLimit?: number
  outstandingBalance?: number
}

interface ApiCategory {
  id: number
  name: string
  nameSwahili?: string
  description?: string
  productCount?: number
}

interface Category {
  id: number
  name: string
  nameSwahili?: string
  description?: string
  productCount?: number
}

interface ServiceItem {
  id: number
  serviceId: number
  itemNumber: string
  name: string
  nameSwahili?: string
  description?: string
  price: number
  durationValue: number
  durationUnit: string
  status: 'AVAILABLE' | 'RENTED' | 'BOOKED' | 'MAINTENANCE'
  serviceName: string
  serviceType: string
}

interface Service {
  id: number
  name: string
  nameSwahili?: string
  serviceType: string
  description?: string
  isActive: boolean
  items: ServiceItem[]
}

interface Transaction {
  id: string
  items: CartItem[]
  customer: string
  total: number
  originalTotal?: number
  paymentMethod: string
  paymentPlan?: 'full' | 'partial' | 'credit'
  cashReceived: number
  change: number
  date: string
  businessId: number
  partialPercentage?: number
  dueDate?: string
  creditPlan?: string
}

interface ApiErrorData {
  message?: string
  details?: string
  errorType?: string
  productName?: string
  available?: number
  requested?: number
}

interface EnhancedError extends Error {
  apiData?: ApiErrorData
}

function POSSystemContent() {
  const { language } = useLanguage()
  const { currentBusiness } = useBusiness()
  const { showSuccess, showError } = useNotifications()
  const { data: session, status } = useSession()
  
  // State management
  const [saleMode, setSaleMode] = useState<'PRODUCT' | 'SERVICE'>('PRODUCT')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedServiceType, setSelectedServiceType] = useState('all')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerMode, setCustomerMode] = useState<'WALKIN' | 'SAVED'>('WALKIN')
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'partial' | 'credit'>('full')
  const [actualPaymentMethod, setActualPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'bank'>('cash')
  const [partialPaymentMethod, setPartialPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'bank'>('cash')

  const [partialAmount, setPartialAmount] = useState('')
  const [partialPercentage, setPartialPercentage] = useState(50)
  const [dueDate, setDueDate] = useState('')
  const [creditPlan, setCreditPlan] = useState('6') // months
  const [isProcessing, setIsProcessing] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [includeTax, setIncludeTax] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [orderType, setOrderType] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL')
  const businessType = String(currentBusiness?.businessType || 'RETAIL').toUpperCase()
  const allowOrderTypeSwitch = businessType === 'BOTH'

  // Sync order type with selected business type
  useEffect(() => {
    if (!allowOrderTypeSwitch) {
      const enforcedType = (businessType === 'WHOLESALE' ? 'WHOLESALE' : 'RETAIL') as 'RETAIL' | 'WHOLESALE'
      setOrderType(enforcedType)
    }
  }, [businessType, allowOrderTypeSwitch])
  
  const translations = {
    en: {
      pageTitle: "Point of Sale",
      saleMode: "Sale Mode",
      products: "Products",
      services: "Services",
      productSearch: "Search products...",
      serviceSearch: "Search services...",
      customerSearch: "Search customer...",
      selectCustomer: "Select Customer",
      walkInCustomer: "Walk-in Customer",
      addToCart: "Add to Cart",
      cart: "Shopping Cart",
      total: "Total",
      subtotal: "Subtotal",
      tax: "Tax",
      discount: "Discount",
      paymentPlan: "Payment Plan",
      paymentMethod: "Payment Method",
      fullPayment: "Full Payment",
      fullPaymentDesc: "Pay complete amount now",
      partialPayment: "Partial Payment", 
      partialPaymentDesc: "Pay part now, rest later",
      creditSale: "Credit Sale",
      creditSaleDesc: "Apply for credit terms",
      actualPaymentMethod: "Payment Method",
      cash: "Cash",
      card: "Card", 
      mobile: "Mobile Money",
      bank: "Bank Transfer",

      change: "Change",
      processPayment: "Process Payment",
      printReceipt: "Print Receipt",
      newSale: "New Sale",
      quantity: "Qty",
      price: "Price",
      remove: "Remove",
      categories: "Categories",
      all: "All",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      customer: "Customer",
      receipt: "Receipt",
      transactionComplete: "Transaction completed successfully!",
      paymentSuccessful: "Payment processed successfully",
      currency: "TZS",
      addCustomer: "Add New Customer",
      noBusinessSelected: "No business selected",
      authRequired: "Authentication Required",
      loginToViewReceipt: "Please login to view receipt",
      paymentFailed: "Payment Failed",
      paymentError: "Payment could not be processed. Please try again.",
      saleComplete: "Sale Complete",
      cartEmpty: "Please add items to cart before processing payment",
      customerRequired: "Please select a customer",
      orderType: "Order Type",
      retail: "Retail Sale",
      wholesale: "Wholesale",
      productNotInRetail: "Product not available in retail store. Transfer from main store first.",
      insufficientStock: "Insufficient stock in retail store. Available: {available}, Requested: {requested}. Transfer more from main store."
    },
    sw: {
      pageTitle: "Mfumo wa Mauzo",
      saleMode: "Aina ya Mauzo",
      products: "Bidhaa",
      services: "Huduma",
      productSearch: "Tafuta bidhaa...",
      serviceSearch: "Tafuta huduma...",
      customerSearch: "Tafuta mteja...",
      selectCustomer: "Chagua Mteja",
      walkInCustomer: "Mteja wa Kawaida",
      addToCart: "Ongeza Kwenye Kart",
      cart: "Kart ya Ununuzi",
      total: "Jumla",
      subtotal: "Jumla Ndogo",
      tax: "Kodi",
      discount: "Punguzo",
      paymentPlan: "Mpango wa Malipo",
      paymentMethod: "Njia ya Malipo",
      fullPayment: "Malipo Kamili",
      fullPaymentDesc: "Lipa kiasi chote sasa",
      partialPayment: "Malipo ya Sehemu",
      partialPaymentDesc: "Lipa sehemu sasa, mengine baadaye",
      creditSale: "Ununuzi kwa Mkopo",
      creditSaleDesc: "Omba masharti ya mkopo",
      actualPaymentMethod: "Njia ya Malipo",
      cash: "Fedha Taslimu",
      card: "Kadi",
      mobile: "Fedha za Simu", 
      bank: "Uhamisho wa Benki",

      change: "Chenji",
      processPayment: "Shughulika Malipo",
      printReceipt: "Chapisha Risiti",
      newSale: "Uuzi Mpya",
      quantity: "Idadi",
      price: "Bei",
      remove: "Ondoa",
      categories: "Makundi",
      all: "Yote",
      inStock: "Ipo Hifadhini",
      outOfStock: "Haijapapo",
      customer: "Mteja",
      receipt: "Risiti",
      transactionComplete: "Muamala umekamilika kikamilifu!",
      paymentSuccessful: "Malipo yameshughulikiwa kikamilifu",
      currency: "TSh",
      addCustomer: "Ongeza Mteja Mpya",
      noBusinessSelected: "Hakuna biashara iliyochaguliwa",
      authRequired: "Uhakikishaji Unahitajika",
      loginToViewReceipt: "Tafadhali ingia ili kuona risiti",
      paymentFailed: "Malipo Yameshindwa",
      paymentError: "Malipo hayawezi kushughulikiwa. Tafadhali jaribu tena.",
      saleComplete: "Uuzi Umekamilika",
      cartEmpty: "Tafadhali ongeza bidhaa kwenye kart kabla ya kuchakua malipo",
      customerRequired: "Tafadhali chagua mteja",
      orderType: "Aina ya Agizo",
      retail: "Uuzaji wa Reja Reja",
      wholesale: "Uuzaji wa Jumla",
      productNotInRetail: "Bidhaa haipo dukani. Hamisha kwanza kutoka hifadhi kuu.",
      insufficientStock: "Hisa haitoshi dukani. Inapatikana: {available}, Inahitajika: {requested}. Hamisha zaidi kutoka hifadhi kuu."
    }
  }

  const t = translations[language]

  useEffect(() => {
    const fetchData = async () => {
      if (!currentBusiness?.id) return

      setIsLoadingData(true)
      try {
        // ==============Fetch products from API=====================
        // TODO: Add pagination
        const productsResponse = await fetch(`/api/admin/products?businessId=${currentBusiness.id}&limit=100`)
        const productsResult = await productsResponse.json()
        
        if (productsResult.success) {
          // Transform API data to match POS interface
          const transformedProducts: Product[] = productsResult.data.products.map((product: ApiProduct) => ({
            id: product.id,
            name: product.name,
            nameSwahili: product.nameSwahili,
            price: Number(product.price) || 0, // Ensure price is a number
            wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : undefined,
            category: product.category?.name || 'General',
            image: product.images?.[0]?.url,
            stock: product.inventory?.quantity || 0,
            barcode: product.barcode,
            unit: product.unit
          }))
          setProducts(transformedProducts)
        }

        // ==============Fetch customers from API=====================
        // TODO: Add pagination
        const customersResponse = await fetch(`/api/admin/customers?businessId=${currentBusiness.id}&limit=100`)
        const customersResult = await customersResponse.json()
        
        if (customersResult.success) {
          // Transform API data to match POS interface
          const transformedCustomers: Customer[] = customersResult.data.customers.map((customer: ApiCustomer) => ({
            id: customer.id,
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email,
            creditLimit: customer.creditLimit || 0,
            outstandingBalance: customer.outstandingBalance || 0
          }))
          setCustomers(transformedCustomers)
        }

        // ==============Fetch categories from API=====================
        const categoriesResponse = await fetch(`/api/admin/categories?businessId=${currentBusiness.id}`)
        const categoriesResult = await categoriesResponse.json()
        
        if (categoriesResult.success) {
          // Transform API data to match POS interface
          const transformedCategories: Category[] = categoriesResult.data.categories.map((category: ApiCategory) => ({
            id: category.id,
            name: category.name,
            nameSwahili: category.nameSwahili,
            description: category.description,
            productCount: category.productCount || 0
          }))
          setCategories(transformedCategories)
        }

        // ==============Fetch services from API=====================
        const servicesResponse = await fetch(`/api/admin/services?businessId=${currentBusiness.id}&includeItems=true`)
        const servicesResult = await servicesResponse.json()
        
        if (servicesResult.success) {
          // Transform API data to match POS interface (data is array when includeItems=true)
          const servicesList = Array.isArray(servicesResult.data) ? servicesResult.data : []
          const transformedServices: Service[] = servicesList.map((service: Service & { serviceItems?: ServiceItem[] }) => ({
            id: service.id,
            name: service.name,
            nameSwahili: service.nameSwahili,
            serviceType: service.serviceType,
            description: service.description,
            isActive: service.isActive,
            items: (service.serviceItems || []).map((item: ServiceItem) => ({
              ...item,
              serviceName: service.name,
              serviceType: service.serviceType
            }))
          }))
          setServices(transformedServices)
        }
      } catch (error) {
        console.error('Error fetching POS data:', error)
        showError('Data Loading Error', 'Failed to load products, customers, and services')
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [currentBusiness?.id, showError])

  // Ensure or create a Walk-in Customer (per business) lazily
  const ensureWalkInCustomer = async (): Promise<Customer | null> => {
    if (!currentBusiness?.id) return null
    try {
      // Try to find by phone token first
      const token = '0000000000'
      const res = await fetch(`/api/admin/customers?businessId=${currentBusiness.id}&search=${encodeURIComponent(token)}&limit=1`)
      const data = await res.json()
      const existing: Customer | undefined = data?.data?.customers?.[0]
      if (existing) return existing

      // Create minimal Walk-in customer
      const createRes = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: currentBusiness.id,
          name: language === 'sw' ? 'Mteja wa Kawaida' : 'Walk-in Customer',
          phone: token,
          status: 'active'
        })
      })
      const created = await createRes.json()
      if (created?.success && created?.data) {
        return {
          id: created.data.id,
          name: created.data.name,
          phone: created.data.phone,
          email: created.data.email,
          creditLimit: created.data.creditLimit,
          outstandingBalance: created.data.outstandingBalance
        } as Customer
      }
    } catch (e) {
      console.error('Ensure Walk-in failed', e)
    }
    return null
  }


  // Check if business is selected
  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">{t.noBusinessSelected}</p>
        </div>
      </div>
    )
  }

  // Show loading state while fetching data
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          {/* <p className="text-xl text-gray-600">Loading products and customers...</p> */}
        </div>
      </div>
    )
  }

  // Cart functions
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id && item.itemType !== 'SERVICE')

    // Get the correct price based on order type
    const itemPrice = orderType === 'WHOLESALE' && product.wholesalePrice
      ? product.wholesalePrice
      : product.price

    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1)
    } else {
      const cartItem: CartItem = {
        ...product,
        quantity: 1,
        subtotal: Number(itemPrice), // Ensure subtotal is a number
        itemType: 'PRODUCT'
      }
      setCart([...cart, cartItem])
    }
  }

  const addServiceToCart = (serviceItem: ServiceItem, customDuration?: number, customUnit?: string) => {
    // Calculate custom price if duration is provided
    let finalPrice = Number(serviceItem.price)
    let finalDurationValue = serviceItem.durationValue
    let finalDurationUnit = serviceItem.durationUnit

    if (customDuration && customUnit) {
      // Convert everything to hours for calculation
      const getHours = (value: number, unit: string) => {
        switch (unit) {
          case 'MINUTES': return value / 60
          case 'HOURS': return value
          case 'DAYS': return value * 24
          case 'WEEKS': return value * 24 * 7
          case 'MONTHS': return value * 24 * 30
          case 'YEARS': return value * 24 * 365
          default: return value
        }
      }

      const baseHours = getHours(serviceItem.durationValue, serviceItem.durationUnit)
      const customHours = getHours(customDuration, customUnit)
      
      // Calculate price per hour
      const pricePerHour = Number(serviceItem.price) / baseHours
      
      // Calculate final price
      finalPrice = Math.round(pricePerHour * customHours)
      finalDurationValue = customDuration
      finalDurationUnit = customUnit
    }

    // For services, check if item already exists in cart with same duration
    const existingItem = cart.find(item => 
      item.itemType === 'SERVICE' && 
      item.serviceItemId === serviceItem.id &&
      item.durationValue === finalDurationValue &&
      item.durationUnit === finalDurationUnit
    )

    if (existingItem) {
      // Service items typically rented once, but allow multiple
      updateQuantity(existingItem.id, existingItem.quantity + 1)
    } else {
      const cartItem: CartItem = {
        id: Date.now(), // Use timestamp to ensure uniqueness for different durations
        name: serviceItem.name,
        nameSwahili: serviceItem.nameSwahili,
        price: finalPrice,
        category: serviceItem.serviceName || 'Service',
        stock: 1, // Services don't have stock concept
        quantity: 1,
        subtotal: finalPrice,
        itemType: 'SERVICE',
        serviceItemId: serviceItem.id,
        durationValue: finalDurationValue,
        durationUnit: finalDurationUnit
      }
      setCart([...cart, cartItem])
    }
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(cart.map(item => {
      // Get the correct price based on order type
      const itemPrice = orderType === 'WHOLESALE' && item.wholesalePrice
        ? item.wholesalePrice
        : item.price

      return item.id === productId
        ? { ...item, quantity: newQuantity, subtotal: Number(itemPrice) * newQuantity }
        : item
    }))
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
  }

  // Customer functions
  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerSearch('')
  }



  // Calculations
  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const taxAmount = includeTax ? cartTotal * 0.18 : 0 // 18% VAT
  const baseTotal = cartTotal + taxAmount
  const partialCalculatedAmount = baseTotal * (partialPercentage / 100)
  const finalTotal = paymentMethod === 'partial' ? partialCalculatedAmount : baseTotal

  // Payment processing
  const processPayment = async () => {
    if (cart.length === 0) {
      showError(t.paymentFailed, t.cartEmpty)
      return
    }

    // Require customer only when in Saved mode
    if (customerMode === 'SAVED' && !selectedCustomer) {
      showError(t.paymentFailed, t.customerRequired)
      return
    }

    if (paymentMethod === 'partial' && partialPercentage < 30) {
      showError(t.paymentFailed, language === 'sw' ? 'Malipo ya sehemu lazima yawe angalau 30% ya jumla' : 'Partial payment must be at least 30% of total')
      return
    }

    if (paymentMethod === 'partial' && !dueDate) {
      showError(t.paymentFailed, language === 'sw' ? 'Tafadhali chagua tarehe ya kumaliza malipo' : 'Please select a due date for the remaining balance')
      return
    }

    setIsProcessing(true)

    try {
      // Resolve customer for Walk-in mode
      let resolvedCustomer = selectedCustomer
      if (customerMode === 'WALKIN' && !resolvedCustomer) {
        const walkIn = await ensureWalkInCustomer()
        if (!walkIn) {
          showError(t.paymentFailed, language === 'sw' ? 'Imeshindwa kupata mteja wa kawaida' : 'Failed to resolve walk-in customer')
          setIsProcessing(false)
          return
        }
        resolvedCustomer = walkIn
        setSelectedCustomer(walkIn)
      }
      // Store payment plan before clearing states
      const currentPaymentPlan = paymentMethod
      const currentDueDate = dueDate
      const currentPartialPercentage = partialPercentage
      const currentCreditPlan = creditPlan
      
      // Prepare API data
      const saleData = {
        businessId: currentBusiness.id,
        customerId: (resolvedCustomer as Customer).id,
        items: cart.map(item => ({
          ...(item.itemType === 'SERVICE' 
            ? { serviceItemId: item.serviceItemId }
            : { productId: item.id }
          ),
          quantity: item.quantity,
          unitPrice: Number(item.price),
          totalPrice: Number(item.subtotal)
        })),
        paymentMethod: paymentMethod === 'full' ? (
          actualPaymentMethod === 'cash' ? 'CASH' :
          actualPaymentMethod === 'card' ? 'CARD' :
          actualPaymentMethod === 'mobile' ? 'MOBILE_MONEY' :
          actualPaymentMethod === 'bank' ? 'BANK_TRANSFER' : 'CASH'
        ) : paymentMethod === 'partial' ? (
          partialPaymentMethod === 'cash' ? 'CASH' :
          partialPaymentMethod === 'card' ? 'CARD' :
          partialPaymentMethod === 'mobile' ? 'MOBILE_MONEY' :
          partialPaymentMethod === 'bank' ? 'BANK_TRANSFER' : 'CASH'
        ) : 'CREDIT',
        paymentPlan: currentPaymentPlan.toUpperCase(),
        subtotal: cartTotal,
        taxAmount: taxAmount,
        discountAmount: 0,
        totalAmount: baseTotal,
        cashReceived: paymentMethod === 'partial' ? partialCalculatedAmount : finalTotal,
        changeAmount: 0,
        ...(paymentMethod === 'partial' && {
          partialPayment: {
            amountPaid: partialCalculatedAmount,
            dueDate: currentDueDate,
            percentage: currentPartialPercentage
          }
        }),
        ...(paymentMethod === 'credit' && {
          creditSale: {
            creditPlan: currentCreditPlan,
            interestRate: currentCreditPlan === '3' ? 5 : currentCreditPlan === '6' ? 8 : currentCreditPlan === '12' ? 12 : 15,
            termMonths: parseInt(currentCreditPlan)
          }
        }),
        transactionId: `TXN-${Date.now()}`,
        notes: paymentMethod === 'partial' ? `Partial payment: ${currentPartialPercentage}%` : undefined,
        includeTax: includeTax,
        orderType: orderType
      }

      // Call POS Sales API
      const response = await fetch('/api/admin/pos/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        // Create enhanced error with API response data
        const enhancedError = new Error(result.message || 'Failed to process payment') as EnhancedError
        enhancedError.apiData = result
        throw enhancedError
      }
      
      // Create transaction object for receipt
      const transaction: Transaction = {
        id: result.data.transactionId,
        items: cart,
        customer: selectedCustomer?.name || 'Walk-in Customer',
        total: finalTotal,
        originalTotal: baseTotal,
        paymentMethod: paymentMethod === 'full' ? actualPaymentMethod : 
                      paymentMethod === 'partial' ? partialPaymentMethod : 'credit',
        paymentPlan: currentPaymentPlan,
        cashReceived: paymentMethod === 'partial' ? partialCalculatedAmount : finalTotal,
        change: result.data.changeAmount || 0,
        date: new Date().toLocaleString(),
        businessId: currentBusiness.id,
        partialPercentage: currentPaymentPlan === 'partial' ? currentPartialPercentage : undefined,
        dueDate: currentPaymentPlan === 'partial' ? currentDueDate : undefined,
        creditPlan: currentPaymentPlan === 'credit' ? currentCreditPlan : undefined
      }
      
      setLastTransaction(transaction)
      
      // Check authentication before showing receipt
      if (status !== 'authenticated' || !session?.user) {
        showError(t.authRequired, t.loginToViewReceipt)
        return
      }
      
      setShowReceipt(true)
      showSuccess(t.saleComplete, `${t.paymentSuccessful} - Order #${result.data.orderNumber}`)
      clearCart()
      
    } catch (error) {
      // console.error('POS - Payment processing error:', error)
      
      // Handle API error responses with custom messages
      if (error instanceof Error && (error as EnhancedError).apiData) {
        const apiData = (error as EnhancedError).apiData!
        
        // Handle specific error types from our API
        if (apiData.errorType === 'PRODUCT_NOT_IN_RETAIL') {
          const message = `${apiData.productName || 'Unknown'}: ${t.productNotInRetail}`
          showError(t.paymentFailed, message)
          return
        }
        
        if (apiData.errorType === 'INSUFFICIENT_STOCK') {
          const message = t.insufficientStock
            .replace('{available}', (apiData.available || 0).toString())
            .replace('{requested}', (apiData.requested || 0).toString())
          showError(t.paymentFailed, `${apiData.productName || 'Unknown'}: ${message}`)
          return
        }
        
        // Generic API error message
        showError(t.paymentFailed, apiData.message || apiData.details || t.paymentError)
        return
      }
      
      // Generic error message
      showError(t.paymentFailed, t.paymentError)
    } finally {
      setIsProcessing(false)
    }
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.pageTitle}</h1>
          <p className="text-gray-600">
            {currentBusiness.name} - Process sales transactions quickly and efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products/Services Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode Selector */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3 text-gray-900">{t.saleMode}</h3>
              <div className="flex gap-2">
                {[
                  { value: 'PRODUCT' as const, label: t.products, icon: '📦' },
                  { value: 'SERVICE' as const, label: t.services, icon: '🛠️' }
                ].map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => {
                      setSaleMode(mode.value)
                      setSearchQuery('')
                      setSelectedCategory('all')
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg border text-center transition-all ${
                      saleMode === mode.value
                        ? 'border-teal-500 bg-teal-50 text-teal-800'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-xl">{mode.icon}</span>
                      <span className="font-medium">{mode.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {saleMode === 'PRODUCT' ? (
              <ProductsSection
                products={products}
                categories={categories}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onAddToCart={addToCart}
                businessType={allowOrderTypeSwitch ? 'BOTH' : (orderType as 'RETAIL' | 'WHOLESALE')}
                orderType={orderType}
              />
            ) : (
              <ServicesSection
                services={services}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedServiceType={selectedServiceType}
                setSelectedServiceType={setSelectedServiceType}
                onAddToCart={addServiceToCart}
              />
            )}
          </div>

          {/* Cart and Payment Section */}
          <div className="space-y-6">
            <CustomerSection
              selectedCustomer={selectedCustomer}
              customers={customers}
              customerSearch={customerSearch}
              setCustomerSearch={setCustomerSearch}
              onSelectCustomer={selectCustomer}
              onAddCustomerClick={() => setShowCustomerModal(true)}
              mode={customerMode}
              onModeChange={setCustomerMode}
            />

            {/* Order Type Selection - Show only when business supports BOTH */}
            {allowOrderTypeSwitch && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center text-gray-900">
                  <svg className="w-5 h-5 mr-2 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t.orderType}
                </h3>
                <div className="flex gap-2">
                  {[
                    { value: 'RETAIL', label: t.retail, icon: '🏪' },
                    { value: 'WHOLESALE', label: t.wholesale, icon: '🏭' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setOrderType(type.value as 'RETAIL' | 'WHOLESALE')}
                      className={`flex-1 px-3 py-2 rounded-lg border text-center transition-all text-xs ${
                        orderType === type.value
                          ? 'border-teal-500 bg-teal-50 text-teal-800'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span className="text-sm">{type.icon}</span>
                        <span className="font-medium">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <CartSection
              cart={cart}
              orderType={orderType}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
            />

            {/* Payment Summary */}
            <PaymentSection
              cart={cart}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              actualPaymentMethod={actualPaymentMethod}
              setActualPaymentMethod={setActualPaymentMethod}
              partialPaymentMethod={partialPaymentMethod}
              setPartialPaymentMethod={setPartialPaymentMethod}
              partialAmount={partialAmount}
              setPartialAmount={setPartialAmount}
              partialPercentage={partialPercentage}
              setPartialPercentage={setPartialPercentage}
              dueDate={dueDate}
              setDueDate={setDueDate}
              creditPlan={creditPlan}
              setCreditPlan={setCreditPlan}
              isProcessing={isProcessing}
              processPayment={processPayment}
              includeTax={includeTax}
              setIncludeTax={setIncludeTax}
              taxRate={currentBusiness?.businessSetting?.taxRate || 18}
              paymentMethods={currentBusiness?.businessSetting?.paymentMethods || [
                { value: 'cash', label: 'Cash', labelSwahili: 'Fedha Taslimu', icon: 'BanknotesIcon' },
                { value: 'card', label: 'Card', labelSwahili: 'Kadi', icon: 'CreditCardIcon' },
                { value: 'mobile', label: 'Mobile Money', labelSwahili: 'Fedha za Simu', icon: 'DevicePhoneMobileIcon' },
                { value: 'bank', label: 'Bank Transfer', labelSwahili: 'Uhamisho wa Benki', icon: 'BuildingLibraryIcon' }
              ]}
            />
          </div>
        </div>

        {/* Add Customer Modal */}
        {showCustomerModal && (
          <AddCustomerModal
            isOpen={showCustomerModal}
            onClose={() => setShowCustomerModal(false)}
            onCustomerAdded={(newCustomer) => {
              // Convert customer to match POS interface
              const posCustomer = {
                ...newCustomer,
                email: newCustomer.email || undefined,
                creditLimit: 0,
                outstandingBalance: 0,
                creditScore: 'fair' as const
              }
              setCustomers([...customers, posCustomer])
              setSelectedCustomer(posCustomer)
              setShowCustomerModal(false)
            }}
          />
        )}

        {/* Receipt Modal - Only show if authenticated */}
        <AnimatePresence>
          {showReceipt && lastTransaction && status === 'authenticated' && session?.user && (
            <Receipt
              isOpen={showReceipt}
              onClose={() => setShowReceipt(false)}
                              receiptData={{
                transactionId: lastTransaction.id,
                businessName: currentBusiness?.name || 'Business Name',
                businessPhone: currentBusiness?.businessSetting?.phone,
                businessEmail: currentBusiness?.businessSetting?.email,
                businessAddress: currentBusiness?.businessSetting?.address,
                customerName: lastTransaction.customer,
                customerPhone: selectedCustomer?.phone,
                customerEmail: selectedCustomer?.email,
                items: lastTransaction.items.map(item => ({
                  id: item.id,
                  name: item.name,
                  nameSwahili: item.nameSwahili,
                  quantity: item.quantity,
                  price: item.price,
                  subtotal: item.subtotal,
                  unit: item.unit
                })),
                subtotal: lastTransaction.items.reduce((sum, item) => sum + Number(item.subtotal), 0),
                taxAmount: includeTax ? lastTransaction.items.reduce((sum, item) => sum + Number(item.subtotal), 0) * ((currentBusiness?.businessSetting?.taxRate || 18) / 100) : 0,
                taxRate: currentBusiness?.businessSetting?.taxRate || 18,
                interestAmount: lastTransaction.paymentPlan === 'credit' ? 
                   lastTransaction.items.reduce((sum, item) => sum + Number(item.subtotal), 0) * 
                   (lastTransaction.creditPlan === '3' ? 0.05 : lastTransaction.creditPlan === '6' ? 0.08 : lastTransaction.creditPlan === '12' ? 0.12 : lastTransaction.creditPlan === '24' ? 0.15 : 0.08) : 0,
                interestRate: lastTransaction.paymentPlan === 'credit' ? 
                   (lastTransaction.creditPlan === '3' ? 5 : lastTransaction.creditPlan === '6' ? 8 : lastTransaction.creditPlan === '12' ? 12 : lastTransaction.creditPlan === '24' ? 15 : 8) : 0,
                finalTotal: lastTransaction.originalTotal || lastTransaction.total,
                paymentMethod: lastTransaction.paymentMethod,
                paymentPlan: lastTransaction.paymentPlan,
                partialAmount: lastTransaction.paymentPlan === 'partial' ? lastTransaction.cashReceived : undefined,
                balanceDue: lastTransaction.paymentPlan === 'partial' ? ((lastTransaction.originalTotal || lastTransaction.total) - lastTransaction.cashReceived) : undefined,
                dueDate: lastTransaction.paymentPlan === 'partial' ? lastTransaction.dueDate : undefined,
                creditPlan: lastTransaction.paymentPlan === 'credit' ? lastTransaction.creditPlan : undefined,
                transactionDate: lastTransaction.date,
                cashierName: session?.user ? `${session.user.firstName} ${session.user.lastName}` : 'Cashier'
              }}
              onNewTransaction={() => {
                setShowReceipt(false)
                clearCart()
                setSelectedCustomer(null)
                setPaymentMethod('full')
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function POSSystem() {
  return (
    <PermissionGate requiredPermission="pos.create">
      <POSSystemContent />
    </PermissionGate>
  )
} 