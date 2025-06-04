'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  QrCodeIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  UserIcon,
  CreditCardIcon,
  BanknotesIcon,
  PrinterIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ShoppingCartIcon,
  XMarkIcon,
  CheckIcon,
  DocumentIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import AddCustomerModal from '../../components/AddCustomerModal'

// Sample data
const sampleProducts = [
  { id: 1, name: 'Coca Cola 500ml', nameSwahili: 'Coca Cola 500ml', price: 2500, category: 'Beverages', stock: 50, image: '/images/coca-cola.jpg', barcode: '123456789' },
  { id: 2, name: 'White Bread', nameSwahili: 'Mkate Mweupe', price: 1500, category: 'Bakery', stock: 30, image: '/images/bread.jpg', barcode: '123456790' },
  { id: 3, name: 'Rice 2kg', nameSwahili: 'Mchele 2kg', price: 8000, category: 'Grains', stock: 25, image: '/images/rice.jpg', barcode: '123456791' },
  { id: 4, name: 'Cooking Oil 1L', nameSwahili: 'Mafuta ya Kupikia 1L', price: 4500, category: 'Cooking', stock: 20, image: '/images/oil.jpg', barcode: '123456792' },
  { id: 5, name: 'Sugar 1kg', nameSwahili: 'Sukari 1kg', price: 3000, category: 'Cooking', stock: 40, image: '/images/sugar.jpg', barcode: '123456793' },
  { id: 6, name: 'Milk 1L', nameSwahili: 'Maziwa 1L', price: 3500, category: 'Dairy', stock: 15, image: '/images/milk.jpg', barcode: '123456794' }
]

const sampleCustomers = [
  { id: 1, name: 'John Mwangi', phone: '+255 123 456 789', email: 'john@example.com', creditLimit: 50000, outstandingBalance: 15000 },
  { id: 2, name: 'Mary Kiprotich', phone: '+255 234 567 890', email: 'mary@example.com', creditLimit: 30000, outstandingBalance: 8000 },
  { id: 3, name: 'Peter Msoka', phone: '+255 345 678 901', email: 'peter@example.com', creditLimit: 75000, outstandingBalance: 0 }
]

const categories = ['All', 'Beverages', 'Bakery', 'Grains', 'Cooking', 'Dairy', 'Snacks', 'Cleaning']

interface CartItem {
  product: typeof sampleProducts[0]
  quantity: number
  subtotal: number
}

interface Customer {
  id: number
  name: string
  phone: string
  email: string | null
  creditLimit: number
  outstandingBalance: number
}

interface Sale {
  id: string
  date: string
  time: string
  items: CartItem[]
  customer: Customer | null
  paymentMethod: 'cash' | 'card' | 'credit' | 'partial'
  subtotal: number
  tax: number
  total: number
  cashReceived: number
  change: number
  // Partial payment fields
  partialAmount?: number
  remainingBalance?: number
  dueDate?: string
  paymentTermsAccepted?: boolean
}

export default function POSScreen() {
  const { language } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [barcode, setBarcode] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit' | 'partial'>('cash')
  const [cashReceived, setCashReceived] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSale, setLastSale] = useState<Sale | null>(null)

  // Partial Payment states
  const [partialAmount, setPartialAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [paymentTermsAccepted, setPaymentTermsAccepted] = useState(false)
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const translations = {
    en: {
      pageTitle: "Point of Sale",
      pageSubtitle: "Process sales and manage transactions",
      
      // Product Search
      searchProducts: "Search products...",
      scanBarcode: "Scan barcode",
      categories: "Categories",
      allCategories: "All Categories",
      addToCart: "Add to Cart",
      outOfStock: "Out of Stock",
      inStock: "In Stock",
      
      // Shopping Cart
      shoppingCart: "Shopping Cart",
      item: "Item",
      qty: "Qty",
      price: "Price",
      subtotal: "Subtotal",
      remove: "Remove",
      cartEmpty: "Cart is empty",
      totalItems: "Total Items",
      subtotalAmount: "Subtotal",
      taxAmount: "Tax (18%)",
      totalAmount: "Total Amount",
      
      // Customer Section
      customer: "Customer",
      selectCustomer: "Select Customer",
      searchCustomer: "Search customer...",
      addNewCustomer: "Add New Customer",
      customerDetails: "Customer Details",
      creditLimit: "Credit Limit",
      outstandingBalance: "Outstanding Balance",
      availableCredit: "Available Credit",
      
      // Payment
      paymentMethod: "Payment Method",
      cash: "Cash",
      card: "Card",
      credit: "Credit",
      partial: "Partial Payment",
      cashReceived: "Cash Received",
      change: "Change",
      processSale: "Process Sale",
      processing: "Processing...",
      
      // Receipt
      receipt: "Receipt",
      printReceipt: "Print Receipt",
      emailReceipt: "Email Receipt",
      smsReceipt: "SMS Receipt",
      newSale: "New Sale",
      receiptNumber: "Receipt #",
      date: "Date",
      time: "Time",
      cashier: "Cashier",
      paymentType: "Payment Type",
      
      // Messages
      saleCompleted: "Sale completed successfully!",
      insufficientStock: "Insufficient stock",
      customerRequired: "Please select a customer for credit sales",
      creditLimitExceeded: "Credit limit exceeded",
      invalidAmount: "Please enter valid amount",
      
      // Partial Payment
      partialPayment: "Partial Payment",
      amountToPay: "Amount to Pay Now",
      dueDate: "Due Date",
      remainingBalance: "Remaining Balance",
      paymentTerms: "Payment Terms",
      iAgreeToTerms: "I agree to the payment terms",
      customerAgreement: "Customer Agreement Required"
    },
    sw: {
      pageTitle: "Mfumo wa Mauzo",
      pageSubtitle: "Fanya mauzo na simamia miamala",
      
      // Product Search
      searchProducts: "Tafuta bidhaa...",
      scanBarcode: "Changanua barcode",
      categories: "Makundi",
      allCategories: "Makundi Yote",
      addToCart: "Ongeza kwenye Kikapu",
      outOfStock: "Haina Stock",
      inStock: "Ina Stock",
      
      // Shopping Cart
      shoppingCart: "Kikapu cha Ununuzi",
      item: "Bidhaa",
      qty: "Idadi",
      price: "Bei",
      subtotal: "Jumla Ndogo",
      remove: "Ondoa",
      cartEmpty: "Kikapu ni tupu",
      totalItems: "Jumla ya Bidhaa",
      subtotalAmount: "Jumla Ndogo",
      taxAmount: "Kodi (18%)",
      totalAmount: "Jumla ya Malipo",
      
      // Customer Section
      customer: "Mteja",
      selectCustomer: "Chagua Mteja",
      searchCustomer: "Tafuta mteja...",
      addNewCustomer: "Ongeza Mteja Mpya",
      customerDetails: "Maelezo ya Mteja",
      creditLimit: "Kikomo cha Mkopo",
      outstandingBalance: "Deni la Sasa",
      availableCredit: "Mkopo Unapatikana",
      
      // Payment
      paymentMethod: "Njia ya Malipo",
      cash: "Fedha Taslimu",
      card: "Kadi",
      credit: "Mkopo",
      partial: "Mkopo Kiasi",
      cashReceived: "Fedha Zilizopokelewa",
      change: "Chenji",
      processSale: "Fanya Mauzo",
      processing: "Inachakata...",
      
      // Receipt
      receipt: "Risiti",
      printReceipt: "Chapisha Risiti",
      emailReceipt: "Tuma Risiti kwa Barua Pepe",
      smsReceipt: "Tuma Risiti kwa SMS",
      newSale: "Mauzo Mapya",
      receiptNumber: "Namba ya Risiti",
      date: "Tarehe",
      time: "Muda",
      cashier: "Mwajiri",
      paymentType: "Aina ya Malipo",
      
      // Messages
      saleCompleted: "Mauzo yamekamilika!",
      insufficientStock: "Stock haitoshi",
      customerRequired: "Tafadhali chagua mteja kwa mauzo ya mkopo",
      creditLimitExceeded: "Kikomo cha mkopo kimezidishwa",
      invalidAmount: "Tafadhali ingiza kiasi sahihi",
      
      // Partial Payment
      partialPayment: "Mkopo Kiasi",
      amountToPay: "Kiasi Kilelwekwa Sasa",
      dueDate: "Tarehe ya Kupungua",
      remainingBalance: "Deni la Sasa",
      paymentTerms: "Mauzo ya Mteja",
      iAgreeToTerms: "Ninaamini mauzo ya mteja",
      customerAgreement: "Mauzo ya Mteja Kawaida"
    }
  }

  const t = translations[language]

  // Filter products based on search and category
  const filteredProducts = sampleProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.nameSwahili.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm)
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Filter customers based on search
  const filteredCustomers = sampleCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch) ||
    customer.email?.toLowerCase().includes(customerSearch.toLowerCase())
  )

  // Add product to cart
  const addToCart = (product: typeof sampleProducts[0]) => {
    if (product.stock <= 0) return

    const existingItem = cart.find(item => item.product.id === product.id)
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        updateQuantity(product.id, existingItem.quantity + 1)
      }
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        subtotal: product.price
      }
      setCart([...cart, newItem])
    }
  }

  // Update item quantity
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity, subtotal: item.product.price * newQuantity }
        : item
    ))
  }

  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  // Calculate totals
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const taxAmount = cartSubtotal * 0.18
  const totalAmount = cartSubtotal + taxAmount
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Calculate change and partial payment values
  const cashAmount = parseFloat(cashReceived) || 0
  const partialAmountValue = parseFloat(partialAmount) || 0
  const remainingBalance = totalAmount - partialAmountValue
  const change = cashAmount - totalAmount

  // Validation checks
  const isCashPaymentValid = paymentMethod !== 'cash' || cashAmount >= totalAmount
  const isPartialPaymentValid = paymentMethod !== 'partial' || (
    selectedCustomer !== null &&
    partialAmountValue > 0 &&
    partialAmountValue < totalAmount &&
    dueDate !== '' &&
    paymentTermsAccepted === true
  )
  const canProcessSale = !isProcessing && isCashPaymentValid && isPartialPaymentValid

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) return

    if (paymentMethod === 'credit' && !selectedCustomer) {
      alert(t.customerRequired)
      return
    }

    if (paymentMethod === 'credit' && selectedCustomer) {
      const availableCredit = selectedCustomer.creditLimit - selectedCustomer.outstandingBalance
      if (totalAmount > availableCredit) {
        alert(t.creditLimitExceeded)
        return
      }
    }

    if (paymentMethod === 'cash' && cashAmount < totalAmount) {
      alert(t.invalidAmount)
      return
    }

    if (paymentMethod === 'partial') {
      if (!selectedCustomer) {
        alert(t.customerRequired)
        return
      }
      if (partialAmountValue <= 0 || partialAmountValue >= totalAmount) {
        alert("Partial payment amount must be greater than 0 and less than total")
        return
      }
      if (!dueDate) {
        alert("Please select a due date for remaining balance")
        return
      }
      if (!paymentTermsAccepted) {
        alert(t.customerAgreement)
        return
      }
    }

    setIsProcessing(true)

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Create receipt data
    const sale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      items: cart,
      customer: selectedCustomer,
      paymentMethod,
      subtotal: cartSubtotal,
      tax: taxAmount,
      total: totalAmount,
      cashReceived: paymentMethod === 'cash' ? cashAmount : totalAmount,
      change: paymentMethod === 'cash' ? change : 0,
      // Partial payment fields
      partialAmount: paymentMethod === 'partial' ? partialAmountValue : undefined,
      remainingBalance: paymentMethod === 'partial' ? remainingBalance : undefined,
      dueDate: paymentMethod === 'partial' ? dueDate : undefined,
      paymentTermsAccepted: paymentMethod === 'partial' ? paymentTermsAccepted : undefined
    }

    setLastSale(sale)
    setShowReceipt(true)
    setIsProcessing(false)
    
    // Clear cart and reset
    setCart([])
    setSelectedCustomer(null)
    setCashReceived('')
    setPaymentMethod('cash')
  }

  // Start new sale
  const startNewSale = () => {
    setCart([])
    setSelectedCustomer(null)
    setCustomerSearch('')
    setPaymentMethod('cash')
    setCashReceived('')
    setPartialAmount('')
    setDueDate('')
    setPaymentTermsAccepted(false)
    setShowReceipt(false)
    setLastSale(null)
    setIsProcessing(false)
  }

  const handleCustomerAdded = (newCustomer: Customer) => {
    // In a real app, you would add the customer to your data source
    // For now, we'll just select the new customer
    setSelectedCustomer({
      id: newCustomer.id,
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email || null,
      creditLimit: newCustomer.creditLimit,
      outstandingBalance: newCustomer.outstandingBalance
    })
    setCustomerSearch('')
  }

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

  if (showReceipt && lastSale) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-gray-50 p-4"
      >
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.receipt}</h2>
            <p className="text-gray-600">{t.receiptNumber}: {lastSale.id}</p>
          </div>

          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.date}:</span>
              <span className="text-gray-600">{lastSale.date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.time}:</span>
              <span className="text-gray-600">{lastSale.time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.cashier}:</span>
              <span className="text-gray-600">Current User</span>
            </div>
            {lastSale.customer && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t.customer}:</span>
                <span className="text-gray-600">{lastSale.customer.name}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 mb-4">
            {lastSale.items.map((item: CartItem) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <div>
                  <div className="font-medium">{language === 'sw' ? item.product.nameSwahili : item.product.name}</div>
                  <div className="text-gray-600">{item.quantity} x {item.product.price.toLocaleString()}</div>
                </div>
                <div className="font-medium">{item.subtotal.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">{t.subtotalAmount}:</span>
              <span className="text-gray-900">{lastSale.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">{t.taxAmount}:</span>
              <span className="text-gray-900">{lastSale.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span className="text-gray-900">{t.totalAmount}:</span>
              <span className="text-gray-900">TZS {lastSale.total.toLocaleString()}</span>
            </div>
            {lastSale.paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-700">{t.cashReceived}:</span>
                  <span className="text-gray-900">{lastSale.cashReceived.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">{t.change}:</span>
                  <span className="text-gray-900">{lastSale.change.toLocaleString()}</span>
                </div>
              </>
            )}
            {lastSale.paymentMethod === 'partial' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-700">{t.amountToPay}:</span>
                  <span className="text-orange-600">TZS {lastSale.partialAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">{t.remainingBalance}:</span>
                  <span className="text-orange-600">TZS {lastSale.remainingBalance?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">{t.dueDate}:</span>
                  <span className="text-gray-900">{lastSale.dueDate}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-700">{t.paymentType}:</span>
              <span className="capitalize text-gray-900">{lastSale.paymentMethod}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs">
                <PrinterIcon className="w-4 h-4" />
                <span>{t.printReceipt}</span>
              </button>
              <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs">
                <EnvelopeIcon className="w-4 h-4" />
                <span>{t.emailReceipt}</span>
              </button>
              <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs">
                <DevicePhoneMobileIcon className="w-4 h-4" />
                <span>{t.smsReceipt}</span>
              </button>
            </div>
            
            <button
              onClick={startNewSale}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <CheckIcon className="w-5 h-5" />
              <span>{t.newSale}</span>
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Search */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-teal-200 p-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder={t.searchProducts}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>

                {/* Barcode Scanner */}
                <div className="relative">
                  <QrCodeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder={t.scanBarcode}
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>

                {/* Category Filters */}
                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-3">{t.categories}</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          selectedCategory === category
                            ? 'bg-teal-100 text-teal-800 border border-teal-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-teal-200 p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border border-teal-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-teal-50 rounded-lg mb-3 flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg text-gray-700"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder.jpg'
                        }}
                      />
                    </div>
                    <h4 className="font-medium text-blue-900 text-sm mb-1">
                      {language === 'sw' ? product.nameSwahili : product.name}
                    </h4>
                    <p className="text-teal-600 font-bold text-sm mb-2">TZS {product.price.toLocaleString()}</p>
                    <p className={`text-xs mb-3 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${t.inStock} (${product.stock})` : t.outOfStock}
                    </p>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                      className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors text-xs"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>{t.addToCart}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Cart and Checkout */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Customer Section */}
            <div className="bg-white rounded-xl shadow-sm border border-teal-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.customer}</h3>
              
              {selectedCustomer ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-5 h-5 text-gray-500 border border-teal-200 rounded-lg" />
                      <span className="font-medium text-gray-900">{selectedCustomer.name}</span>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>{selectedCustomer.phone}</p>
                    <p>{selectedCustomer.email}</p>
                  </div>
                  <div className="text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-800">{t.creditLimit}:</span>
                      <span className="font-medium text-gray-900">TZS {selectedCustomer.creditLimit.toLocaleString()}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-800">{t.outstandingBalance}:</span>
                      <span className="font-medium text-red-600">TZS {selectedCustomer.outstandingBalance.toLocaleString()}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-800">{t.availableCredit}:</span>
                      <span className="font-medium text-green-600">TZS {(selectedCustomer.creditLimit - selectedCustomer.outstandingBalance).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder={t.searchCustomer}
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 text-sm"
                    />
                  </div>
                  
                  {customerSearch && (
                    <div className="max-h-40 overflow-y-auto border border-teal-200 rounded-lg">
                      {filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setCustomerSearch('')
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 text-sm">{customer.name}</div>
                          <div className="text-xs text-gray-600">{customer.phone}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={() => setIsAddCustomerModalOpen(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors text-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>{t.addNewCustomer}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Cart */}
            <div className="bg-white rounded-xl shadow-sm border border-teal-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingCartIcon className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-900">{t.shoppingCart}</h3>
                <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">{totalItems}</span>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-teal-200 rounded-lg">
                  <ShoppingCartIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t.cartEmpty}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {language === 'sw' ? item.product.nameSwahili : item.product.name}
                          </h4>
                          <p className="text-teal-600 text-sm">TZS {item.product.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="border-t border-teal-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{t.subtotalAmount}:</span>
                      <span className="text-gray-900">TZS {cartSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{t.taxAmount}:</span>
                      <span className="text-gray-900">TZS {taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">{t.totalAmount}:</span>
                      <span className="text-gray-900">TZS {totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="border-t border-teal-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">{t.paymentMethod}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex flex-col items-center bg-gray-50 text-gray-700 space-y-1 p-3 border rounded-lg transition-colors ${
                          paymentMethod === 'cash'
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <BanknotesIcon className="w-5 h-5" />
                        <span className="text-xs">{t.cash}</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`flex flex-col items-center bg-gray-50 text-gray-700 space-y-1 p-3 border rounded-lg transition-colors ${
                          paymentMethod === 'card'
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <CreditCardIcon className="w-5 h-5" />
                        <span className="text-xs">{t.card}</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('credit')}
                        className={`flex flex-col items-center bg-gray-50 text-gray-700 space-y-1 p-3 border rounded-lg transition-colors ${
                          paymentMethod === 'credit'
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <DocumentIcon className="w-5 h-5" />
                        <span className="text-xs">{t.credit}</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('partial')}
                        className={`flex flex-col items-center bg-gray-50 text-gray-700     space-y-1 p-3 border rounded-lg transition-colors ${
                          paymentMethod === 'partial'
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <ClockIcon className="w-5 h-5" />
                        <span className="text-xs">{t.partial}</span>
                      </button>
                    </div>
                  </div>

                  {/* Cash Payment Input */}
                  {paymentMethod === 'cash' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">{t.cashReceived}</label>
                        <input
                          type="number"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                        />
                      </div>
                      {cashReceived && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">{t.change}:</span>
                          <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                            TZS {change.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Partial Payment Configuration */}
                  {paymentMethod === 'partial' && (
                    <div className="space-y-4 border-t border-gray-200 pt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">{t.amountToPay}</label>
                        <input
                          type="number"
                          value={partialAmount}
                          onChange={(e) => setPartialAmount(e.target.value)}
                          placeholder="0"
                          max={totalAmount}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                        />
                      </div>
                      
                      {partialAmountValue > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">{t.remainingBalance}:</span>
                          <span className="font-medium text-orange-600">
                            TZS {remainingBalance.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">{t.dueDate}</label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                        />
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <h5 className="font-medium text-yellow-800 mb-2">{t.paymentTerms}</h5>
                        <div className="text-sm text-yellow-700 space-y-1">
                          <p>• Customer agrees to pay remaining balance by due date</p>
                          <p>• Late payment may incur additional charges</p>
                          <p>• Outstanding balance will be tracked in customer account</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="terms-agreement"
                          checked={paymentTermsAccepted}
                          onChange={(e) => setPaymentTermsAccepted(e.target.checked)}
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="terms-agreement" className="text-sm text-gray-800">
                          {t.iAgreeToTerms}
                        </label>
                      </div>

                      {/* Debug Info - Validation Status */}
                      {paymentMethod === 'partial' && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <h6 className="font-medium text-gray-800 mb-2">Validation Status:</h6>
                          <div className="text-xs text-gray-700 space-y-1">
                            <p>• Customer Selected: {selectedCustomer ? '✅' : '❌'}</p>
                            <p>• Partial Amount: {partialAmountValue > 0 ? `✅ (${partialAmountValue})` : '❌'}</p>
                            <p>• Amount &lt; Total: {partialAmountValue < totalAmount ? '✅' : '❌'}</p>
                            <p>• Due Date: {dueDate ? `✅ (${dueDate})` : '❌'}</p>
                            <p>• Terms Accepted: {paymentTermsAccepted ? '✅' : '❌'}</p>
                            <p>• <strong>Button Enabled: {canProcessSale ? '✅' : '❌'}</strong></p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Process Sale Button */}
                  <button
                    onClick={processSale}
                    disabled={!canProcessSale}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>{t.processing}</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-5 h-5" />
                        <span>{t.processSale}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onCustomerAdded={handleCustomerAdded}
      />
    </>
  )
} 