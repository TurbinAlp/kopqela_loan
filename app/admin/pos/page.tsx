'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PrinterIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBusiness } from '../../contexts/BusinessContext'
import { useNotifications } from '../../contexts/NotificationContext'
import PaymentSection from '../../components/admin/pos/PaymentSection'
import ProductsSection from '../../components/admin/pos/ProductsSection'
import CustomerSection from '../../components/admin/pos/CustomerSection'
import CartSection from '../../components/admin/pos/CartSection'
import AddCustomerModal from '../../components/AddCustomerModal'

interface Product {
  id: number
  name: string
  nameSwahili?: string
  price: number
  category?: string
  image?: string
  stock: number
  barcode?: string
  unit?: string
}

interface CartItem extends Product {
  quantity: number
  subtotal: number
}

interface Customer {
  id: number
  name: string
  phone: string
  email?: string
  creditLimit?: number
  outstandingBalance?: number
}

interface Transaction {
  id: string
  items: CartItem[]
  customer: string
  total: number
  paymentMethod: string
  cashReceived: number
  change: number
  date: string
  businessId: number
}

export default function POSSystem() {
  const { language } = useLanguage()
  const { currentBusiness } = useBusiness()
  const { showSuccess, showError } = useNotifications()
  
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
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
  
  const translations = {
    en: {
      pageTitle: "Point of Sale",
      productSearch: "Search products...",
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
      noBusinessSelected: "No business selected"
    },
    sw: {
      pageTitle: "Mfumo wa Mauzo",
      productSearch: "Tafuta bidhaa...",
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
      noBusinessSelected: "Hakuna biashara iliyochaguliwa"
    }
  }

  const t = translations[language]

  useEffect(() => {
    // Load products and customers when business is selected
    if (currentBusiness) {
      // Sample data - replace with API calls
      const sampleProducts: Product[] = [
        { id: 1, name: "Rice 25kg", nameSwahili: "Mchele 25kg", price: 45000, category: "Food", stock: 50, unit: "bag" },
        { id: 2, name: "Sugar 2kg", nameSwahili: "Sukari 2kg", price: 4500, category: "Food", stock: 100, unit: "packet" },
        { id: 3, name: "Cooking Oil 1L", nameSwahili: "Mafuta ya Kupikia 1L", price: 3200, category: "Food", stock: 75, unit: "bottle" },
        { id: 4, name: "Cement 50kg", nameSwahili: "Saruji 50kg", price: 18000, category: "Construction", stock: 200, unit: "bag" },
        { id: 5, name: "Iron Sheets", nameSwahili: "Mabati", price: 1200, category: "Construction", stock: 150, unit: "piece" },
      ]

      const sampleCustomers: Customer[] = [
        { id: 1, name: "John Mwangi", phone: "+255701234567", email: "john@example.com", creditLimit: 500000, outstandingBalance: 0 },
        { id: 2, name: "Mary Wanjiku", phone: "+255712345678", email: "mary@example.com", creditLimit: 300000, outstandingBalance: 25000 },
        { id: 3, name: "Peter Kamau", phone: "+255723456789", email: "peter@example.com", creditLimit: 1000000, outstandingBalance: 150000 },
      ]

      setProducts(sampleProducts)
      setCustomers(sampleCustomers)
    }
  }, [currentBusiness])

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

  // Cart functions
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1)
    } else {
      const cartItem: CartItem = {
        ...product,
        quantity: 1,
        subtotal: product.price
      }
      setCart([...cart, cartItem])
    }
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity, subtotal: item.price * newQuantity }
        : item
    ))
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
      showError('Cart Empty', 'Please add items to cart before processing payment')
      return
    }


    if (!selectedCustomer){
      showError('Customer Required', 'Please select a customer before processing payment')
      return
    }

    if (paymentMethod === 'partial' && partialPercentage < 30) {
      showError('Minimum Percentage Required', 'Partial payment must be at least 30% of total')
      return
    }

    if (paymentMethod === 'partial' && !dueDate) {
      showError('Due Date Required', 'Please select a due date for the remaining balance')
      return
    }

    setIsProcessing(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const transaction: Transaction = {
        id: `TXN-${Date.now()}`,
        items: cart,
        customer: selectedCustomer?.name || 'Walk-in Customer',
        total: finalTotal,
        paymentMethod: paymentMethod === 'full' ? actualPaymentMethod : 
                      paymentMethod === 'partial' ? partialPaymentMethod : 'credit',
        cashReceived: paymentMethod === 'partial' ? partialCalculatedAmount : finalTotal,
        change: 0,
        date: new Date().toLocaleString(),
        businessId: currentBusiness.id
      }
      
      setLastTransaction(transaction)
      setShowReceipt(true)
      showSuccess('Payment Successful', t.paymentSuccessful)
      clearCart()
      
    } catch {
      showError('Payment Failed', 'Payment could not be processed. Please try again.')
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
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            <ProductsSection
              products={products}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onAddToCart={addToCart}
            />
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
            />

            <CartSection
              cart={cart}
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

        {/* Receipt Modal */}
        <AnimatePresence>
          {showReceipt && lastTransaction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{t.transactionComplete}</h3>
                  <p className="text-gray-600">Transaction ID: {lastTransaction.id}</p>
                </div>

                {/* Receipt Details */}
                <div className="border-t border-b border-gray-200 py-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-900">Customer:</span>
                      <span className="text-gray-900">{lastTransaction.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900">Date:</span>
                      <span className="text-gray-900">{lastTransaction.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900">Payment:</span>
                      <span className="text-gray-900">{lastTransaction.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReceipt(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
                  >
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    {t.printReceipt}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 