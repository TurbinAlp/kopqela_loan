'use client'

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

interface CustomerInfo {
  fullName: string
  phone: string
  email: string
  address: string
  specialInstructions: string
}

interface PartialPayment {
  amountToPay: number
  dueDate: string
  paymentTerms: string
  agreesToTerms: boolean
}

interface PartialPaymentFlowProps {
  currentStep: number
  orderItems: OrderItem[]
  deliveryOptions: DeliveryOption[]
  selectedDeliveryOption: string
  customerInfo: CustomerInfo
  partialPayment: PartialPayment
  setPartialPayment: (payment: PartialPayment) => void
  agreesToTerms: boolean
  setAgreesToTerms: (value: boolean) => void
  language: 'en' | 'sw'
  isSubmitting?: boolean
  formatPrice: (price: number) => string
  calculateTotal: () => number
  getDeliveryFee: () => number
  getGrandTotal: () => number
}

const PartialPaymentFlow: React.FC<PartialPaymentFlowProps> = ({
  currentStep,
  orderItems,
  deliveryOptions,
  selectedDeliveryOption,
  customerInfo,
  partialPayment,
  setPartialPayment,
  agreesToTerms,
  setAgreesToTerms,
  language,
  formatPrice,
  calculateTotal,
  getDeliveryFee,
  getGrandTotal
}) => {
  const translations = {
    en: {
      // Step 4 translations
      partialPaymentSetup: 'Partial Payment Setup',
      amountToPay: 'Amount to Pay Now',
      remainingBalance: 'Remaining Balance',
      dueDate: 'Due Date for Balance',
      paymentTerms: 'Payment Terms',
      paymentTermsAgreement: 'I agree to the partial payment terms',
      minimumPayment: 'Minimum Payment Required',
      days: 'days',
      orderTotal: 'Order Total',
      deliveryFee: 'Delivery Fee',
      grandTotal: 'Grand Total',
      
      // Step 5 (Review) translations
      orderSummary: 'Order Summary',
      selectedProducts: 'Selected Products',
      paymentMethodSelected: 'Payment Method',
      deliveryMethodSelected: 'Delivery Method',
      agreeToTerms: 'I agree to the terms and conditions',
      partialPayment: 'Partial Payment',
      free: 'Free'
    },
    sw: {
      // Step 4 translations
      partialPaymentSetup: 'Mpangilio wa Malipo ya Sehemu',
      amountToPay: 'Kiasi cha Kulipa Sasa',
      remainingBalance: 'Salio la Malipo',
      dueDate: 'Tarehe ya Kulipa Salio',
      paymentTerms: 'Masharti ya Malipo',
      paymentTermsAgreement: 'Nakubali masharti ya malipo ya sehemu',
      minimumPayment: 'Malipo ya Chini Yanayohitajika',
      days: 'siku',
      orderTotal: 'Jumla ya Oda',
      deliveryFee: 'Ada ya Utoaji',
      grandTotal: 'Jumla Kuu',
      
      // Step 5 (Review) translations
      orderSummary: 'Muhtasari wa Oda',
      selectedProducts: 'Bidhaa Zilizochaguliwa',
      paymentMethodSelected: 'Njia ya Malipo',
      deliveryMethodSelected: 'Njia ya Utoaji',
      agreeToTerms: 'Nakubali masharti na viwango',
      partialPayment: 'Malipo ya Sehemu',
      free: 'Bure'
    }
  }

  const t = translations[language]

  // Step 4: Partial Payment Setup
  if (currentStep === 4) {
    return (
      <div className="space-y-8">
        <h2 className="text-xl font-semibold text-gray-900">{t.partialPaymentSetup}</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-4">
            {language === 'sw' ? 'Muhtasari wa Oda' : 'Order Summary'}
          </h4>
          
          {/* Selected Products */}
          <div className="mb-4 pb-3 border-b border-blue-200">
            <h5 className="text-sm font-medium text-blue-900 mb-2">
              {language === 'sw' ? 'Bidhaa Zilizochaguliwa' : 'Selected Products'}:
            </h5>
            <div className="space-y-1">
              {orderItems.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-blue-700">
                    {language === 'sw' ? item.nameSwahili : item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-blue-900">TSh {item.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">{t.orderTotal}:</span>
              <span className="font-medium text-blue-900">TSh {calculateTotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">{t.deliveryFee}:</span>
              <span className="font-medium text-blue-900">TSh {getDeliveryFee().toLocaleString()}</span>
            </div>
            <div className="border-t border-blue-200 pt-2 flex justify-between">
              <span className="text-blue-700 font-medium">{t.grandTotal}:</span>
              <span className="font-bold text-blue-900">TSh {getGrandTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.amountToPay} *
            </label>
            <input
              type="number"
              value={partialPayment.amountToPay}
              onChange={(e) => setPartialPayment({...partialPayment, amountToPay: parseInt(e.target.value) || 0})}
              min={Math.round(getGrandTotal() * 0.3)}
              max={getGrandTotal()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t.minimumPayment}: TSh {Math.round(getGrandTotal() * 0.3).toLocaleString()}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.remainingBalance}
            </label>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
              TSh {(getGrandTotal() - partialPayment.amountToPay).toLocaleString()}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.dueDate} *
            </label>
            <input
              type="date"
              value={partialPayment.dueDate}
              onChange={(e) => setPartialPayment({...partialPayment, dueDate: e.target.value})}
              min={new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.paymentTerms}
            </label>
            <select
              value={partialPayment.paymentTerms}
              onChange={(e) => setPartialPayment({...partialPayment, paymentTerms: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700"
            >
              <option value="7">7 {t.days}</option>
              <option value="15">15 {t.days}</option>
              <option value="30">30 {t.days}</option>
            </select>
          </div>
        </div>

        {/* Partial Payment Benefits */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-medium text-yellow-800 mb-4">
            {language === 'sw' ? 'Faida za Malipo ya Sehemu' : 'Partial Payment Benefits'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
            <div className="flex items-start">
              <span className="font-medium mr-2">✓</span>
              <span>
                {language === 'sw' 
                  ? 'Pokea bidhaa haraka kwa malipo ya awali tu'
                  : 'Get products quickly with just initial payment'}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">✓</span>
              <span>
                {language === 'sw' 
                  ? 'Hakuna riba ya ziada kwa salio'
                  : 'No extra interest on remaining balance'}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">✓</span>
              <span>
                {language === 'sw' 
                  ? 'Muda maalum wa kulipa salio'
                  : 'Flexible timeline for balance payment'}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">✓</span>
              <span>
                {language === 'sw' 
                  ? 'Unaweza kulipa mapema bila ada'
                  : 'Early payment without penalties'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={partialPayment.agreesToTerms}
            onChange={(e) => setPartialPayment({...partialPayment, agreesToTerms: e.target.checked})}
            className="mr-2 text-teal-600 focus:ring-teal-500"
          />
          <label className="text-sm text-gray-700">
            {t.paymentTermsAgreement}
          </label>
        </div>
      </div>
    )
  }

  // Step 5: Review Order for Partial Payment
  if (currentStep === 5) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">{t.orderSummary}</h2>
        
        {/* Order Items */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">{t.selectedProducts}</h3>
          <div className="space-y-2">
            {orderItems.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <span className='text-gray-700'>
                  {language === 'sw' ? item.nameSwahili : item.name} × {item.quantity}
                </span>
                <span className='text-gray-700'>{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Payment Method */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">{t.paymentMethodSelected}</h3>
          <p className="text-gray-600">{t.partialPayment}</p>
          
          {/* Partial Payment Details */}
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
        
        {/* Total Breakdown */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className='text-gray-700'>{t.orderTotal}:</span>
              <span className='text-gray-700'>{formatPrice(calculateTotal())}</span>
            </div>
            <div className="flex justify-between">
              <span className='text-gray-700'>{t.deliveryFee}:</span>
              <span className='text-gray-700'>
                {getDeliveryFee() === 0 ? t.free : formatPrice(getDeliveryFee())}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span className='text-gray-700'>{t.grandTotal}:</span>
              <span className='text-gray-700' style={{ color: '#14b8a6' }}>
                {formatPrice(getGrandTotal())}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Summary for Partial Payment */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-3">
            {language === 'sw' ? 'Muhtasari wa Malipo ya Sehemu' : 'Partial Payment Summary'}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-orange-700">
                {language === 'sw' ? 'Kulipa Sasa:' : 'Pay Now:'}
              </span>
              <span className="font-bold text-orange-900">{formatPrice(partialPayment.amountToPay)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-700">
                {language === 'sw' ? 'Kulipa Baadaye:' : 'Pay Later:'}
              </span>
              <span className="font-medium text-orange-900">
                {formatPrice(getGrandTotal() - partialPayment.amountToPay)}
              </span>
            </div>
            <div className="flex justify-between border-t border-orange-200 pt-2">
              <span className="text-orange-700">
                {language === 'sw' ? 'Tarehe ya Mwisho:' : 'Due Date:'}
              </span>
              <span className="font-medium text-orange-900">
                {new Date(partialPayment.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-3">
            {language === 'sw' ? 'Masharti ya Malipo ya Sehemu' : 'Partial Payment Terms'}
          </h4>
          <div className="space-y-2 text-sm text-yellow-700 mb-4">
            <div className="flex items-start">
              <span className="font-medium mr-2">1.</span>
              <span>
                {language === 'sw' 
                  ? `Utapokea bidhaa baada ya kulipa TSh ${partialPayment.amountToPay.toLocaleString()}.`
                  : `You will receive products after paying TSh ${partialPayment.amountToPay.toLocaleString()}.`}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">2.</span>
              <span>
                {language === 'sw' 
                  ? `Salio la TSh ${(getGrandTotal() - partialPayment.amountToPay).toLocaleString()} litakuwa na due tarehe ${new Date(partialPayment.dueDate).toLocaleDateString()}.`
                  : `Balance of TSh ${(getGrandTotal() - partialPayment.amountToPay).toLocaleString()} will be due on ${new Date(partialPayment.dueDate).toLocaleDateString()}.`}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">3.</span>
              <span>
                {language === 'sw' 
                  ? 'Malipo ya kuchelewa yatalipa faini ya 1% kwa siku.'
                  : 'Late payments will incur a 1% daily penalty fee.'}
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="partialPaymentTerms"
              checked={agreesToTerms}
              onChange={(e) => setAgreesToTerms(e.target.checked)}
              className="mr-2 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="partialPaymentTerms" className="text-sm text-yellow-800">
              <strong>{t.agreeToTerms}</strong>
            </label>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default PartialPaymentFlow 