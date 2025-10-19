'use client'

import { 
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  ReceiptPercentIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { type PaymentMethod } from '../../../contexts/BusinessContext'

interface CartItem {
  id: number
  name: string
  nameSwahili?: string
  price: number
  quantity: number
  subtotal: number
}

interface CreditSalesTerm {
  duration: string
  label: string
  labelSw: string
  interestRate: number
  isPopular: boolean
  enabled: boolean
}

interface PaymentSectionProps {
  cart: CartItem[]
  paymentMethod: 'full' | 'partial' | 'credit'
  setPaymentMethod: (method: 'full' | 'partial' | 'credit') => void
  onPaymentMethodChange?: (method: 'full' | 'partial' | 'credit') => void
  actualPaymentMethod: 'cash' | 'card' | 'mobile' | 'bank'
  setActualPaymentMethod: (method: 'cash' | 'card' | 'mobile' | 'bank') => void
  partialPaymentMethod: 'cash' | 'card' | 'mobile' | 'bank'
  setPartialPaymentMethod: (method: 'cash' | 'card' | 'mobile' | 'bank') => void
  partialAmount: string
  setPartialAmount: (amount: string) => void
  partialPercentage: number
  setPartialPercentage: (percentage: number) => void
  dueDate: string
  setDueDate: (date: string) => void
  creditPlan: string
  setCreditPlan: (plan: string) => void
  isProcessing: boolean
  processPayment: () => void
  includeTax: boolean
  setIncludeTax: (include: boolean) => void
  taxRate: number
  paymentMethods: (PaymentMethod | string)[]
  applyInterest: boolean
  setApplyInterest: (apply: boolean) => void
  creditSalesTerms: CreditSalesTerm[]
}

export default function PaymentSection({
  cart,
  paymentMethod,
  setPaymentMethod,
  onPaymentMethodChange,
  actualPaymentMethod,
  setActualPaymentMethod,
  partialPaymentMethod,
  setPartialPaymentMethod,
  partialPercentage,
  setPartialPercentage,
  dueDate,
  setDueDate,
  creditPlan,
  setCreditPlan,
  isProcessing,
  processPayment,
  includeTax,
  setIncludeTax,
  taxRate,
  paymentMethods,
  applyInterest,
  setApplyInterest,
  creditSalesTerms
}: PaymentSectionProps) {
  const { language } = useLanguage()

  // Convert string-based payment methods to object format
  const normalizedPaymentMethods = paymentMethods?.map((method) => {
    // If method is already an object, return it as is
    if (typeof method === 'object' && method.value) {
      return method
    }
    
    // If method is a string, convert to object format
    if (typeof method === 'string') {
      const methodMap: { [key: string]: { value: string, label: string, labelSwahili: string, icon: string } } = {
        'CASH': { value: 'cash', label: 'Cash', labelSwahili: 'Fedha Taslimu', icon: 'BanknotesIcon' },
        'CARD': { value: 'card', label: 'Card', labelSwahili: 'Kadi', icon: 'CreditCardIcon' },
        'CREDIT_CARD': { value: 'card', label: 'Card', labelSwahili: 'Kadi', icon: 'CreditCardIcon' },
        'MOBILE_MONEY': { value: 'mobile', label: 'Mobile Money', labelSwahili: 'Fedha za Simu', icon: 'DevicePhoneMobileIcon' },
        'MOBILE MONEY': { value: 'mobile', label: 'Mobile Money', labelSwahili: 'Fedha za Simu', icon: 'DevicePhoneMobileIcon' },
        'BANK_TRANSFER': { value: 'bank', label: 'Bank Transfer', labelSwahili: 'Uhamisho wa Benki', icon: 'BuildingLibraryIcon' },
        'BANK TRANSFER': { value: 'bank', label: 'Bank Transfer', labelSwahili: 'Uhamisho wa Benki', icon: 'BuildingLibraryIcon' }
      }
      
      return methodMap[method] || { 
        value: (method as string).toLowerCase().replace(/\s+/g, '_'), 
        label: method as string, 
        labelSwahili: method as string, 
        icon: 'BanknotesIcon' 
      }
    }
    
    // Fallback
    return { value: 'cash', label: 'Cash', labelSwahili: 'Fedha Taslimu', icon: 'BanknotesIcon' }
  }) || [
    { value: 'cash', label: 'Cash', labelSwahili: 'Fedha Taslimu', icon: 'BanknotesIcon' },
    { value: 'card', label: 'Card', labelSwahili: 'Kadi', icon: 'CreditCardIcon' },
    { value: 'mobile', label: 'Mobile Money', labelSwahili: 'Fedha za Simu', icon: 'DevicePhoneMobileIcon' },
    { value: 'bank', label: 'Bank Transfer', labelSwahili: 'Uhamisho wa Benki', icon: 'BuildingLibraryIcon' }
  ]

  
  // Filter only enabled credit sales terms
  const enabledCreditSalesTerms = creditSalesTerms.filter(term => term.enabled)

  const translations = {
    en: {
      paymentPlan: "Payment Plan",
      paymentMethod: "Payment Method",
      fullPayment: "Full Payment",
      fullPaymentDesc: "Pay complete amount now",
      partialPayment: "Partial Payment", 
      partialPaymentDesc: "Pay part now, rest later",
      creditSale: "Credit Sale",
      creditSaleDesc: "Pay later with flexible terms",
      actualPaymentMethod: "Payment Method",
      cash: "Cash",
      card: "Card", 
      mobile: "Mobile Money",
      bank: "Bank Transfer",
      processPayment: "Process Payment",
      subtotal: "Subtotal",
      tax: "Tax",
      interest: "Interest",
      total: "Total",
      currency: "TZS",
      creditDuration: "Payment Duration",
      applyInterest: "Apply Interest & Fees (Optional)",
      applyInterestDesc: "If unchecked, customer pays exact amount without extra charges",
      noInterest: "No Interest",
      creditSummary: "Credit Summary",
      amountToBorrow: "Amount to Borrow",
      totalToPay: "Total to Pay",
      amountToPay: "Amount to Pay",
      dueDate: "Due Date"
    },
    sw: {
      paymentPlan: "Mpango wa Malipo",
      paymentMethod: "Njia ya Malipo",
      fullPayment: "Malipo Kamili",
      fullPaymentDesc: "Lipa kiasi chote sasa",
      partialPayment: "Malipo ya Sehemu",
      partialPaymentDesc: "Lipa sehemu sasa, mengine baadaye",
      creditSale: "Ununuzi kwa Mkopo",
      creditSaleDesc: "Lipa baadaye kwa masharti rahisi",
      actualPaymentMethod: "Njia ya Malipo",
      cash: "Fedha Taslimu",
      card: "Kadi",
      mobile: "Fedha za Simu", 
      bank: "Uhamisho wa Benki",
      processPayment: "Shughulika Malipo",
      subtotal: "Jumla Ndogo",
      tax: "Kodi",
      interest: "Riba",
      total: "Jumla",
      currency: "TSh",
      creditDuration: "Muda wa Kulipa",
      applyInterest: "Tumia Riba na Ada (Hiari)",
      applyInterestDesc: "Kama hautatick, mteja atalipa kiasi kile kile tu bila kuongeza",
      noInterest: "Hakuna Riba",
      creditSummary: "Muhtasari wa Mkopo",
      amountToBorrow: "Kiasi cha Kukopa",
      totalToPay: "Jumla ya Kulipa",
      amountToPay: "Kiasi cha Kulipa",
      dueDate: "Tarehe ya Kulipa"
    }
  }

  const t = translations[language]

  // Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'BanknotesIcon': return BanknotesIcon
      case 'CreditCardIcon': return CreditCardIcon
      case 'DevicePhoneMobileIcon': return DevicePhoneMobileIcon
      case 'BuildingLibraryIcon': return BuildingLibraryIcon
      default: return BanknotesIcon
    }
  }

  // Calculations
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.subtotal), 0)
  const taxAmount = includeTax ? cartTotal * (taxRate / 100) : 0 // Dynamic tax rate
  
  // Credit interest calculation - CONDITIONAL based on applyInterest
  const getInterestRate = () => {
    if (paymentMethod !== 'credit' || !applyInterest) return 0  // No interest if not checked
    
    const option = enabledCreditSalesTerms.find(opt => opt.duration === creditPlan)
    return option ? option.interestRate / 100 : 0
  }
  
  const interestAmount = getInterestRate() * (cartTotal + taxAmount)
  
  // Helper function to calculate due date based on duration
  const calculateDueDate = (duration: string): string => {
    const now = new Date()
    const match = duration.match(/^(\d+)([hdwm])$/)
    
    if (!match) return now.toLocaleDateString()
    
    const value = parseInt(match[1])
    const unit = match[2]
    
    switch (unit) {
      case 'h': // hours
        now.setHours(now.getHours() + value)
        break
      case 'd': // days
        now.setDate(now.getDate() + value)
        break
      case 'w': // weeks
        now.setDate(now.getDate() + (value * 7))
        break
      case 'm': // months
        now.setMonth(now.getMonth() + value)
        break
    }
    
    return now.toLocaleString(language === 'sw' ? 'sw-TZ' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Partial payment calculation
  const baseTotal = cartTotal + taxAmount + interestAmount
  const calculatedPartialAmount = paymentMethod === 'partial' ? baseTotal * (partialPercentage / 100) : 0
  const finalTotal = paymentMethod === 'partial' ? calculatedPartialAmount : baseTotal

  if (cart.length === 0) return null

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4">{t.paymentPlan}</h3>
      
      {/* Payment Plans */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {[
          { value: 'full', label: t.fullPayment, description: t.fullPaymentDesc, icon: CreditCardIcon },
          { value: 'partial', label: t.partialPayment, description: t.partialPaymentDesc, icon: ClockIcon },
          { value: 'credit', label: t.creditSale, description: t.creditSaleDesc, icon: ReceiptPercentIcon }
        ].map(method => (
          <button
            key={method.value}
            onClick={() => {
              if (onPaymentMethodChange) {
                onPaymentMethodChange(method.value as 'full' | 'partial' | 'credit')
              } else {
                setPaymentMethod(method.value as 'full' | 'partial' | 'credit')
              }
            }}
            className={`p-4 rounded-lg border-2 transition-colors text-left ${
              paymentMethod === method.value
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <method.icon className={`w-5 h-5 mr-3 ${
                paymentMethod === method.value ? 'text-teal-600' : 'text-gray-600'
              }`} />
              <div>
                                  <div className={`font-medium text-sm ${
                    paymentMethod === method.value ? 'text-teal-600' : 'text-gray-900'
                  }`}>
                  {method.label}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {method.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Actual Payment Method - show for full payment */}
      {paymentMethod === 'full' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.actualPaymentMethod}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {normalizedPaymentMethods.map((method) => {
              const IconComponent = getIconComponent(method.icon)
              return (
                <button
                  key={method.value}
                  onClick={() => setActualPaymentMethod(method.value as 'cash' | 'card' | 'mobile' | 'bank')}
                  className={`p-3 rounded-lg border transition-colors flex flex-col items-center ${
                    actualPaymentMethod === method.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 mb-2 ${
                    actualPaymentMethod === method.value ? 'text-teal-600' : 'text-gray-600'
                  }`} />
                  <span className={`text-xs font-medium text-center leading-tight ${
                    actualPaymentMethod === method.value ? 'text-teal-700' : 'text-gray-800'
                  }`}>
                    {language === 'sw' && method.labelSwahili ? method.labelSwahili : method.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Partial Payment Input */}
              {paymentMethod === 'partial' && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Percentage *
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={partialPercentage}
                  onChange={(e) => setPartialPercentage(Number(e.target.value))}
                  className="flex-1"
                />
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="30"
                    max="90"
                    value={partialPercentage}
                    onChange={(e) => setPartialPercentage(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                  <span className="text-sm text-gray-600">%</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Amount: {t.currency} {calculatedPartialAmount.toLocaleString()}
              </p>
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.paymentMethod} *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {normalizedPaymentMethods.map((method) => {
                const IconComponent = getIconComponent(method.icon)
                return (
                  <button
                    key={method.value}
                    onClick={() => setPartialPaymentMethod(method.value as 'cash' | 'card' | 'mobile' | 'bank')}
                    className={`p-3 rounded-lg border transition-colors flex flex-col items-center ${
                      partialPaymentMethod === method.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 mb-2 ${
                      partialPaymentMethod === method.value ? 'text-teal-600' : 'text-gray-600'
                    }`} />
                    <span className={`text-xs font-medium text-center leading-tight ${
                      partialPaymentMethod === method.value ? 'text-teal-700' : 'text-gray-800'
                    }`}>
                      {language === 'sw' && method.labelSwahili ? method.labelSwahili : method.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date for Balance *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
                                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      )}

      {/* Credit Sale Input */}
      {paymentMethod === 'credit' && (
        <div className="space-y-4 mb-4">
          {/* Credit Duration Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.creditDuration} *
            </label>
            <select
              value={creditPlan}
              onChange={(e) => setCreditPlan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
            >
              {enabledCreditSalesTerms.map((option) => (
                <option key={option.duration} value={option.duration}>
                  {language === 'sw' ? option.labelSw : option.label}
                  {applyInterest && ` - ${option.interestRate}% ${language === 'sw' ? 'riba' : 'interest'}`}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Interest Toggle */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={applyInterest}
                onChange={(e) => setApplyInterest(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 block">
                  {t.applyInterest}
                </span>
                <p className="text-xs text-gray-600 mt-1">
                  {t.applyInterestDesc}
                </p>
              </div>
            </label>
          </div>

          {/* Credit Summary Card */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <h4 className="font-semibold text-teal-900 mb-3 text-sm">
              {t.creditSummary}
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">
                  {t.amountToBorrow}
                </span>
                <span className="font-medium text-gray-900">
                  {t.currency} {(cartTotal + taxAmount).toLocaleString()}
                </span>
              </div>
              
              {/* Interest (conditional) */}
              {applyInterest ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      {t.interest} ({(getInterestRate() * 100).toFixed(1)}%)
                    </span>
                    <span className="font-medium text-orange-600">
                      + {t.currency} {interestAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-teal-300">
                    <span className="font-bold text-gray-900">
                      {t.totalToPay}
                    </span>
                    <span className="font-bold text-lg text-teal-900">
                      {t.currency} {(cartTotal + taxAmount + interestAmount).toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      {t.noInterest}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-teal-300">
                    <span className="font-bold text-gray-900">
                      {t.amountToPay}
                    </span>
                    <span className="font-bold text-lg text-teal-900">
                      {t.currency} {(cartTotal + taxAmount).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
              
              {/* Due Date */}
              <div className="flex justify-between pt-2 border-t border-teal-200">
                <span className="text-gray-700">
                  {t.dueDate}
                </span>
                <span className="font-medium text-gray-900 text-xs">
                  {calculateDueDate(creditPlan)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary - Only show for non-credit payments */}
      {paymentMethod !== 'credit' && (
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span>{t.subtotal}</span>
            <span>{t.currency} {cartTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeTax"
                checked={includeTax}
                onChange={(e) => setIncludeTax(e.target.checked)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="includeTax" className="text-gray-900">{t.tax} ({taxRate}%)</label>
            </div>
            <span className="text-gray-900">{t.currency} {taxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span className="text-gray-900">{t.total}</span>
            <span className="text-gray-900">{t.currency} {finalTotal.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Process Payment Button */}
      <button
        onClick={processPayment}
        disabled={isProcessing}
        className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? 'Processing...' : t.processPayment}
      </button>
    </div>
  )
} 