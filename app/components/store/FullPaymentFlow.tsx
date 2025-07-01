'use client'

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

interface FullPaymentFlowProps {
  orderItems: OrderItem[]
  deliveryOptions: DeliveryOption[]
  selectedDeliveryOption: string
  customerInfo: CustomerInfo
  agreesToTerms: boolean
  setAgreesToTerms: (value: boolean) => void
  language: 'en' | 'sw'
  onSubmitOrder: () => void
  isSubmitting?: boolean
  formatPrice: (price: number) => string
  calculateTotal: () => number
  getDeliveryFee: () => number
  getGrandTotal: () => number
}

const FullPaymentFlow: React.FC<FullPaymentFlowProps> = ({
  orderItems,
  deliveryOptions,
  selectedDeliveryOption,
  customerInfo,
  agreesToTerms,
  setAgreesToTerms,
  language,
//   onSubmitOrder,
  formatPrice,
  calculateTotal,
  getDeliveryFee,
  getGrandTotal
}) => {
  const translations = {
    en: {
      orderSummary: 'Order Summary',
      selectedProducts: 'Selected Products',
      paymentMethodSelected: 'Payment Method',
      deliveryMethodSelected: 'Delivery Method',
      orderTotal: 'Order Total',
      deliveryFee: 'Delivery Fee',
      grandTotal: 'Grand Total',
      agreeToTerms: 'I agree to the terms and conditions',
      fullPayment: 'Full Payment',
      free: 'Free'
    },
    sw: {
      orderSummary: 'Muhtasari wa Oda',
      selectedProducts: 'Bidhaa Zilizochaguliwa',
      paymentMethodSelected: 'Njia ya Malipo',
      deliveryMethodSelected: 'Njia ya Utoaji',
      orderTotal: 'Jumla ya Oda',
      deliveryFee: 'Ada ya Utoaji',
      grandTotal: 'Jumla Kuu',
      agreeToTerms: 'Nakubali masharti na viwango',
      fullPayment: 'Malipo Kamili',
      free: 'Bure'
    }
  }

  const t = translations[language]

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
        <p className="text-gray-600">{t.fullPayment}</p>
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center text-green-600">
            <CheckIconSolid className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {language === 'sw' 
                ? 'Lipa kiasi chote sasa - hakuna malipo ya ziada'
                : 'Pay full amount now - no additional payments required'}
            </span>
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

      {/* Payment Summary for Full Payment */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-3">
          {language === 'sw' ? 'Muhtasari wa Malipo' : 'Payment Summary'}
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-green-700">
              {language === 'sw' ? 'Kiasi cha Kulipa Sasa:' : 'Amount to Pay Now:'}
            </span>
            <span className="font-bold text-green-900">{formatPrice(getGrandTotal())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">
              {language === 'sw' ? 'Malipo ya Baadaye:' : 'Future Payments:'}
            </span>
            <span className="font-medium text-green-900">
              {language === 'sw' ? 'Hakuna' : 'None'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Terms and Conditions */}
      <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
        <h4 className="font-medium text-yellow-800 mb-3">
          {language === 'sw' ? 'Masharti ya Malipo Kamili' : 'Full Payment Terms'}
        </h4>
        <div className="space-y-2 text-sm text-yellow-700 mb-4">
          <div className="flex items-start">
            <span className="font-medium mr-2">1.</span>
            <span>
              {language === 'sw' 
                ? 'Malipo yamekamilika na hakuna malipo ya ziada yanayohitajika.'
                : 'Payment is complete with no additional payments required.'}
            </span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2">2.</span>
            <span>
              {language === 'sw' 
                ? 'Bidhaa zitaandaliwa na kutumwa mara moja baada ya malipo.'
                : 'Products will be prepared and shipped immediately after payment.'}
            </span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2">3.</span>
            <span>
              {language === 'sw' 
                ? 'Utapokea risiti ya malipo na taarifa za ufuatiliaji.'
                : 'You will receive payment receipt and tracking information.'}
            </span>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="fullPaymentTerms"
            checked={agreesToTerms}
            onChange={(e) => setAgreesToTerms(e.target.checked)}
            className="mr-2 text-teal-600 focus:ring-teal-500"
          />
          <label htmlFor="fullPaymentTerms" className="text-sm text-yellow-800">
            <strong>{t.agreeToTerms}</strong>
          </label>
        </div>
      </div>
    </div>
  )
}

export default FullPaymentFlow 