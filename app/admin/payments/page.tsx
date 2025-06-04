'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PrinterIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'

interface OutstandingBalance {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  originalAmount: number
  outstandingAmount: number
  dueDate: string
  daysOverdue: number
  isOverdue: boolean
  orderId: string
  orderDate: string
}

interface PaymentEntry {
  customerId: string
  customerName: string
  outstandingAmount: number
  paymentAmount: number
  paymentMethod: 'cash' | 'card' | 'mobile_money' | 'bank_transfer'
  paymentDate: string
  notes: string
  reference: string
}

export default function PaymentCollection() {
  const { language } = useLanguage()
  const [selectedCustomer, setSelectedCustomer] = useState<OutstandingBalance | null>(null)
  const [paymentEntry, setPaymentEntry] = useState<PaymentEntry>({
    customerId: '',
    customerName: '',
    outstandingAmount: 0,
    paymentAmount: 0,
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
    reference: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [receiptGenerated, setReceiptGenerated] = useState(false)

  const translations = {
    en: {
      title: "Payment Collection",
      searchPlaceholder: "Search customer by name or phone...",
      outstandingBalances: "Outstanding Balances",
      paymentEntry: "Payment Entry",
      paymentProcessing: "Payment Processing",
      
      // Outstanding balances
      customer: "Customer",
      originalAmount: "Original Amount",
      outstanding: "Outstanding",
      dueDate: "Due Date",
      overdue: "Overdue",
      days: "days",
      selectCustomer: "Select Customer",
      
      // Payment entry
      customerName: "Customer Name",
      outstandingAmount: "Outstanding Amount",
      paymentAmount: "Payment Amount",
      paymentMethod: "Payment Method",
      paymentDate: "Payment Date",
      notes: "Notes/Reference",
      reference: "Reference Number",
      
      // Payment methods
      cash: "Cash",
      card: "Card",
      mobileMoney: "Mobile Money",
      bankTransfer: "Bank Transfer",
      
      // Actions
      processPayment: "Process Payment",
      processing: "Processing...",
      clearForm: "Clear Form",
      
      // Receipt
      receiptGenerated: "Payment Receipt Generated",
      printReceipt: "Print Receipt",
      emailReceipt: "Email Receipt",
      smsReceipt: "SMS Receipt",
      newPayment: "New Payment",
      
      // Status
      paid: "Paid",
      partial: "Partial",
      
      // Currency
      currency: "TZS",
      
      // Validation
      enterAmount: "Please enter payment amount",
      amountTooHigh: "Payment amount exceeds outstanding balance",
      invalidAmount: "Please enter a valid amount",
      
      // Success messages
      paymentSuccess: "Payment processed successfully",
      balanceUpdated: "Customer balance updated",
      receiptReady: "Receipt is ready for printing"
    },
    sw: {
      title: "Ukusanyaji wa Malipo",
      searchPlaceholder: "Tafuta mteja kwa jina au simu...",
      outstandingBalances: "Madeni Yasiyolipwa",
      paymentEntry: "Kuingiza Malipo",
      paymentProcessing: "Kuchakata Malipo",
      
      // Outstanding balances
      customer: "Mteja",
      originalAmount: "Kiasi cha Awali",
      outstanding: "Kilichobaki",
      dueDate: "Tarehe ya Kulipa",
      overdue: "Kimechelewa",
      days: "siku",
      selectCustomer: "Chagua Mteja",
      
      // Payment entry
      customerName: "Jina la Mteja",
      outstandingAmount: "Kiasi Kilichobaki",
      paymentAmount: "Kiasi cha Malipo",
      paymentMethod: "Njia ya Malipo",
      paymentDate: "Tarehe ya Malipo",
      notes: "Maelezo/Rejea",
      reference: "Nambari ya Rejea",
      
      // Payment methods
      cash: "Fedha Taslimu",
      card: "Kadi",
      mobileMoney: "Pesa za Simu",
      bankTransfer: "Uhamisho wa Benki",
      
      // Actions
      processPayment: "Chakata Malipo",
      processing: "Inachakata...",
      clearForm: "Futa Fomu",
      
      // Receipt
      receiptGenerated: "Risiti ya Malipo Imetengenezwa",
      printReceipt: "Chapisha Risiti",
      emailReceipt: "Tuma Risiti kwa Barua Pepe",
      smsReceipt: "Tuma Risiti kwa SMS",
      newPayment: "Malipo Mapya",
      
      // Status
      paid: "Amelipa",
      partial: "Sehemu",
      
      // Currency
      currency: "TSh",
      
      // Validation
      enterAmount: "Tafadhali ingiza kiasi cha malipo",
      amountTooHigh: "Kiasi cha malipo kimezidi kilichobaki",
      invalidAmount: "Tafadhali ingiza kiasi sahihi",
      
      // Success messages
      paymentSuccess: "Malipo yamechakatwa kikamilifu",
      balanceUpdated: "Salio la mteja limesasishwa",
      receiptReady: "Risiti iko tayari kuchapishwa"
    }
  }

  const t = translations[language]

  // Sample outstanding balances
  const outstandingBalances: OutstandingBalance[] = [
    {
      id: "BAL-001",
      customerId: "CUST-001",
      customerName: "Maria Mwangi",
      customerPhone: "+255 741 234 567",
      originalAmount: 150000,
      outstandingAmount: 85000,
      dueDate: "2024-01-10",
      daysOverdue: 5,
      isOverdue: true,
      orderId: "ORD-045",
      orderDate: "2023-12-25"
    },
    {
      id: "BAL-002",
      customerId: "CUST-002",
      customerName: "Grace Moshi",
      customerPhone: "+255 743 456 789",
      originalAmount: 200000,
      outstandingAmount: 180000,
      dueDate: "2024-01-20",
      daysOverdue: 0,
      isOverdue: false,
      orderId: "ORD-052",
      orderDate: "2024-01-05"
    },
    {
      id: "BAL-003",
      customerId: "CUST-003",
      customerName: "Peter Mlay",
      customerPhone: "+255 744 567 890",
      originalAmount: 75000,
      outstandingAmount: 35000,
      dueDate: "2024-01-08",
      daysOverdue: 7,
      isOverdue: true,
      orderId: "ORD-041",
      orderDate: "2023-12-20"
    }
  ]

  const filteredBalances = outstandingBalances.filter(balance => 
    balance.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    balance.customerPhone.includes(searchQuery)
  )

  const handleCustomerSelect = (balance: OutstandingBalance) => {
    setSelectedCustomer(balance)
    setPaymentEntry({
      ...paymentEntry,
      customerId: balance.customerId,
      customerName: balance.customerName,
      outstandingAmount: balance.outstandingAmount,
      paymentAmount: balance.outstandingAmount // Default to full payment
    })
    setReceiptGenerated(false)
  }

  const handlePaymentAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0
    setPaymentEntry({
      ...paymentEntry,
      paymentAmount: amount
    })
  }

  const validatePayment = (): string | null => {
    if (paymentEntry.paymentAmount <= 0) return t.enterAmount
    if (paymentEntry.paymentAmount > paymentEntry.outstandingAmount) return t.amountTooHigh
    return null
  }

  const processPayment = async () => {
    const validation = validatePayment()
    if (validation) {
      alert(validation)
      return
    }

    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setReceiptGenerated(true)
      
      // Update outstanding balance
      if (selectedCustomer) {
        const newOutstanding = selectedCustomer.outstandingAmount - paymentEntry.paymentAmount
        selectedCustomer.outstandingAmount = newOutstanding
      }
    }, 2000)
  }

  const clearForm = () => {
    setSelectedCustomer(null)
    setPaymentEntry({
      customerId: '',
      customerName: '',
      outstandingAmount: 0,
      paymentAmount: 0,
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: '',
      reference: ''
    })
    setReceiptGenerated(false)
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return BanknotesIcon
      case 'card': return CreditCardIcon
      case 'mobile_money': return DevicePhoneMobileIcon
      case 'bank_transfer': return BuildingLibraryIcon
      default: return CurrencyDollarIcon
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outstanding Balances */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.outstandingBalances}</h2>
            
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredBalances.map((balance) => (
              <motion.div
                key={balance.id}
                whileHover={{ backgroundColor: '#f0fdfa' }}
                onClick={() => handleCustomerSelect(balance)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                  selectedCustomer?.id === balance.id ? 'bg-teal-50 border-teal-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{balance.customerName}</h3>
                    <p className="text-sm text-gray-600">{balance.customerPhone}</p>
                    <p className="text-xs text-gray-500">Order: {balance.orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {t.currency} {balance.outstandingAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t.dueDate}: {balance.dueDate}
                    </p>
                    {balance.isOverdue && (
                      <div className="flex items-center text-red-600 text-xs mt-1">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        {balance.daysOverdue} {t.days} {t.overdue}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Payment Entry */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{t.paymentEntry}</h2>
          </div>

          <div className="p-6">
            {!selectedCustomer ? (
              <div className="text-center py-12 text-gray-500">
                <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">{t.selectCustomer}</p>
              </div>
            ) : receiptGenerated ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.receiptGenerated}</h3>
                <p className="text-gray-600 mb-6">{t.paymentSuccess}</p>
                
                <div className="space-y-3">
                  <button className="w-full bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
                    <PrinterIcon className="w-5 h-5" />
                    <span>{t.printReceipt}</span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <EnvelopeIcon className="w-5 h-5" />
                      <span>{t.emailReceipt}</span>
                    </button>
                    
                    <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <DevicePhoneMobileIcon className="w-5 h-5" />
                      <span>{t.smsReceipt}</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={clearForm}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors"
                  >
                    {t.newPayment}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{paymentEntry.customerName}</h4>
                  <p className="text-sm text-gray-600">
                    {t.outstandingAmount}: {t.currency} {paymentEntry.outstandingAmount.toLocaleString()}
                  </p>
                </div>

                {/* Payment Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.paymentAmount} *
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={paymentEntry.paymentAmount || ''}
                      onChange={(e) => handlePaymentAmountChange(e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.paymentMethod}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'cash', label: t.cash },
                      { key: 'card', label: t.card },
                      { key: 'mobile_money', label: t.mobileMoney },
                      { key: 'bank_transfer', label: t.bankTransfer }
                    ].map((method) => {
                      const IconComponent = getPaymentMethodIcon(method.key)
                      return (
                        <button
                          key={method.key}
                          onClick={() => setPaymentEntry({ ...paymentEntry, paymentMethod: method.key as PaymentEntry['paymentMethod'] })}
                          className={`p-3 border rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                            paymentEntry.paymentMethod === method.key
                              ? 'border-teal-500 bg-teal-50 text-teal-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className="text-sm">{method.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.paymentDate}
                  </label>
                  <div className="relative">
                    <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={paymentEntry.paymentDate}
                      onChange={(e) => setPaymentEntry({ ...paymentEntry, paymentDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Notes/Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.notes}
                  </label>
                  <textarea
                    value={paymentEntry.notes}
                    onChange={(e) => setPaymentEntry({ ...paymentEntry, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Optional notes or reference number"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={processPayment}
                    disabled={isProcessing}
                    className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white p-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>{t.processing}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>{t.processPayment}</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={clearForm}
                    className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t.clearForm}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 