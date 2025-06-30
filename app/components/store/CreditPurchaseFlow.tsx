'use client'

import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid'

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

interface VerificationData {
  fullName: string
  phone: string
  idNumber: string
  monthlyIncome: string
}

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

interface CreditPurchaseFlowProps {
  currentStep: number
  orderItems: OrderItem[]
  deliveryOptions: DeliveryOption[]
  selectedDeliveryOption: string
  customerInfo: CustomerInfo
  selectedCreditPlan: string
  setSelectedCreditPlan: (plan: string) => void
  verificationData: VerificationData
  setVerificationData: (data: VerificationData) => void
  agreesToTerms: boolean
  setAgreesToTerms: (value: boolean) => void
  language: 'en' | 'sw'
  calculateTotal: () => number
  getDeliveryFee: () => number
  getGrandTotal: () => number
}

const CreditPurchaseFlow: React.FC<CreditPurchaseFlowProps> = ({
  currentStep,
  orderItems,
  deliveryOptions,
  selectedDeliveryOption,
  customerInfo,
  selectedCreditPlan,
  setSelectedCreditPlan,
  verificationData,
  setVerificationData,
  agreesToTerms,
  setAgreesToTerms,
  language,
  calculateTotal,
  getDeliveryFee,
  getGrandTotal
}) => {
  const translations = {
    en: {
      // Step 4 - Credit Plan Selection
      chooseCreditPlan: 'Choose Credit Plan',
      chooseCreditPlanDesc: 'Choose how long you want to pay back your credit. Each plan has different interest rates and payments.',
      creditPurchaseProcess: 'Credit Purchase Process',
      choosePlan: 'Choose Plan',
      verify: 'Verify',
      acceptTerms: 'Accept Terms',
      complete: 'Complete',
      orderSummary: 'Order Summary',
      productTotal: 'Product Total',
      deliveryFee: 'Delivery Fee',
      grandTotal: 'Grand Total',
      chooseRepaymentPeriod: 'Choose Repayment Period',
      months: 'Months',
      interest: 'Interest',
      monthlyPayment: 'Monthly Payment',
      totalToPay: 'Total to Pay',
      popular: 'POPULAR',
      creditBenefits: 'Credit Benefits',
      
      // Step 5 - Verification
      customerVerification: 'Customer Verification',
      customerVerificationDesc: 'We need to verify your identity for credit security purposes.',
      basicInformation: 'Basic Information',
      fullName: 'Full Name',
      phoneNumber: 'Phone Number',
      idNumber: 'ID Number',
      monthlyIncome: 'Monthly Income',
      selectRange: 'Select range',
      below500k: 'Below TSh 500,000',
      above2m: 'Above TSh 2,000,000',
      
      // Step 6 - Completion
      completeCreditPurchase: 'Complete Credit Purchase',
      completeCreditPurchaseDesc: 'Review your details and accept the credit terms to complete your purchase.',
      creditApproved: 'Credit Approved!',
      creditApprovedDesc: 'You\'ve been approved for credit on these products. You\'ll receive them immediately after accepting terms.',
      creditPurchaseSummary: 'Credit Purchase Summary',
      paymentPlan: 'Payment Plan',
      paymentPeriod: 'Payment Period',
      interestRate: 'Interest Rate',
      deliveryContact: 'Delivery & Contact',
      deliveryMethod: 'Delivery Method',
      name: 'Name',
      phone: 'Phone',
      address: 'Address',
      creditPurchaseTerms: 'Credit Purchase Terms',
      whatHappensNext: 'What Happens Next',
      agreeToTerms: 'I agree to all credit purchase terms'
    },
    sw: {
      // Step 4 - Credit Plan Selection
      chooseCreditPlan: 'Chagua Mpango wa Mkopo',
      chooseCreditPlanDesc: 'Chagua muda unaotaka kulipa mkopo wako. Kila mpango una riba na malipo tofauti.',
      creditPurchaseProcess: 'Hatua za Ununuzi kwa Mkopo',
      choosePlan: 'Chagua Mpango',
      verify: 'Thibitisha',
      acceptTerms: 'Kubali Masharti',
      complete: 'Maliza',
      orderSummary: 'Muhtasari wa Oda',
      productTotal: 'Jumla ya Bidhaa',
      deliveryFee: 'Ada ya Utoaji',
      grandTotal: 'Jumla Kuu',
      chooseRepaymentPeriod: 'Chagua Muda wa Kulipa',
      months: 'Miezi',
      interest: 'Riba',
      monthlyPayment: 'Malipo ya Kila Mwezi',
      totalToPay: 'Jumla ya Kulipa',
      popular: 'MAARUFU',
      creditBenefits: 'Faida za Mkopo',
      
      // Step 5 - Verification
      customerVerification: 'Uthibitisho wa Mteja',
      customerVerificationDesc: 'Tutahitaji kuthibitisha utambulisho wako kwa usalama wa mkopo.',
      basicInformation: 'Taarifa za Kimsingi',
      fullName: 'Jina Kamili',
      phoneNumber: 'Nambari ya Simu',
      idNumber: 'Nambari ya Kitambulisho',
      monthlyIncome: 'Mapato ya Kila Mwezi',
      selectRange: 'Chagua kiwango',
      below500k: 'Chini ya TSh 500,000',
      above2m: 'Zaidi ya TSh 2,000,000',
      
      // Step 6 - Completion
      completeCreditPurchase: 'Kukamilisha Ununuzi kwa Mkopo',
      completeCreditPurchaseDesc: 'Hakiki maelezo yako na ukubali masharti ya ununuzi kwa mkopo ili kukamilisha.',
      creditApproved: 'Mkopo Umeidhinishwa!',
      creditApprovedDesc: 'Umeidhinishwa kupata mkopo wa bidhaa hizi. Utazipokea mara moja baada ya kukubali masharti.',
      creditPurchaseSummary: 'Muhtasari wa Ununuzi kwa Mkopo',
      paymentPlan: 'Mpango wa Malipo',
      paymentPeriod: 'Muda wa Malipo',
      interestRate: 'Kiwango cha Riba',
      deliveryContact: 'Utoaji na Mawasiliano',
      deliveryMethod: 'Njia ya Utoaji',
      name: 'Jina',
      phone: 'Simu',
      address: 'Anwani',
      creditPurchaseTerms: 'Masharti ya Ununuzi kwa Mkopo',
      whatHappensNext: 'Hatua Zinazofuata',
      agreeToTerms: 'Nakubali masharti yote ya ununuzi kwa mkopo'
    }
  }

  const t = translations[language]

  // Step 4: Credit Plan Selection
  if (currentStep === 4) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {t.chooseCreditPlan}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.chooseCreditPlanDesc}
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t.creditPurchaseProcess}
            </h3>
            <span className="text-sm text-gray-500">
              {language === 'sw' ? 'Hatua 1 ya 4' : 'Step 1 of 4'}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: '#14b8a6', 
                width: '25%' 
              }}
            ></div>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-sm">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center mb-2 font-semibold">1</div>
              <span className="text-teal-600 font-medium">{t.choosePlan}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center mb-2 font-semibold">2</div>
              <span className="text-gray-500">{t.verify}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center mb-2 font-semibold">3</div>
              <span className="text-gray-500">{t.acceptTerms}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center mb-2 font-semibold">4</div>
              <span className="text-gray-500">{t.complete}</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-4">{t.orderSummary}</h4>
          
          {/* Selected Products */}
          <div className="mb-4">
            <h5 className="font-medium text-blue-900 mb-3">
              {language === 'sw' ? 'Bidhaa Zilizochaguliwa' : 'Selected Products'}
            </h5>
            <div className="space-y-2">
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
          <div className="border-t border-blue-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">{t.productTotal}:</span>
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

        {/* Credit Plan Options */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-6">{t.chooseRepaymentPeriod}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 3 Month Plan */}
            <div 
              className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${
                selectedCreditPlan === '3' 
                  ? 'border-teal-500 bg-teal-50' 
                  : 'border-gray-200 hover:border-teal-500'
              }`}
              onClick={() => setSelectedCreditPlan('3')}
            >
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-2">3 {t.months}</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">{t.interest}:</span>
                    <p className="text-lg font-semibold text-gray-900">5%</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">{t.monthlyPayment}:</span>
                    <p className="text-lg font-bold text-gray-900">
                      TSh {Math.ceil(getGrandTotal() * 1.05 / 3).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">{t.totalToPay}:</span>
                    <p className="text-xl font-bold text-teal-600">
                      TSh {Math.ceil(getGrandTotal() * 1.05).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6 Month Plan - Popular */}
            <div 
              className={`border-2 rounded-lg p-6 cursor-pointer transition-colors relative ${
                selectedCreditPlan === '6' 
                  ? 'border-teal-500 bg-teal-50' 
                  : 'border-gray-200 hover:border-teal-500'
              }`}
              onClick={() => setSelectedCreditPlan('6')}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {t.popular}
                </span>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-2">6 {t.months}</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">{t.interest}:</span>
                    <p className="text-lg font-semibold text-gray-900">8%</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">{t.monthlyPayment}:</span>
                    <p className="text-lg font-bold text-gray-900">
                      TSh {Math.ceil(getGrandTotal() * 1.08 / 6).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">{t.totalToPay}:</span>
                    <p className="text-xl font-bold text-teal-600">
                      TSh {Math.ceil(getGrandTotal() * 1.08).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 12 Month Plan */}
            <div 
              className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${
                selectedCreditPlan === '12' 
                  ? 'border-teal-500 bg-teal-50' 
                  : 'border-gray-200 hover:border-teal-500'
              }`}
              onClick={() => setSelectedCreditPlan('12')}
            >
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-2">12 {t.months}</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">{t.interest}:</span>
                    <p className="text-lg font-semibold text-gray-900">12%</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">{t.monthlyPayment}:</span>
                    <p className="text-lg font-bold text-gray-900">
                      TSh {Math.ceil(getGrandTotal() * 1.12 / 12).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">{t.totalToPay}:</span>
                    <p className="text-xl font-bold text-teal-600">
                      TSh {Math.ceil(getGrandTotal() * 1.12).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Benefits */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-medium text-yellow-800 mb-4">{t.creditBenefits}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
            <div className="flex items-start">
              <span className="font-medium mr-2">✓</span>
              <span>
                {language === 'sw' 
                  ? 'Pokea bidhaa mara moja kabla ya kulipa'
                  : 'Receive products immediately before paying'}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">✓</span>
              <span>
                {language === 'sw' 
                  ? 'Malipo ya kila mwezi yanafikika'
                  : 'Affordable monthly payments'}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">✓</span>
              <span>
                {language === 'sw' 
                  ? 'Hakuna ada za ziada kwa malipo ya mapema'
                  : 'No extra fees for early payment'}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">✓</span>
              <span>
                {language === 'sw' 
                  ? 'Ongeza historia ya mkopo mzuri'
                  : 'Build good credit history'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 5: Customer Verification
  if (currentStep === 5) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {t.customerVerification}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.customerVerificationDesc}
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t.creditPurchaseProcess}
            </h3>
            <span className="text-sm text-gray-500">
              {language === 'sw' ? 'Hatua 2 ya 4' : 'Step 2 of 4'}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: '#14b8a6', 
                width: '50%' 
              }}
            ></div>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-sm">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center mb-2 font-semibold">✓</div>
              <span className="text-teal-600 font-medium">
                {language === 'sw' ? 'Mpango Umechaguliwa' : 'Plan Selected'}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center mb-2 font-semibold">2</div>
              <span className="text-teal-600 font-medium">{t.verify}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center mb-2 font-semibold">3</div>
              <span className="text-gray-500">{t.acceptTerms}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center mb-2 font-semibold">4</div>
              <span className="text-gray-500">{t.complete}</span>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-6">{t.basicInformation}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.fullName} *
              </label>
              <input
                type="text"
                value={verificationData.fullName}
                onChange={(e) => setVerificationData({...verificationData, fullName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700"
                placeholder={language === 'sw' ? 'Jina lako kamili' : 'Your full name'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.phoneNumber} *
              </label>
              <input
                type="tel"
                value={verificationData.phone}
                onChange={(e) => setVerificationData({...verificationData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700"
                placeholder="+255 7XX XXX XXX"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.idNumber} *
              </label>
              <input
                type="text"
                value={verificationData.idNumber}
                onChange={(e) => setVerificationData({...verificationData, idNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700"
                placeholder={language === 'sw' ? 'Nambari ya kitambulisho' : 'ID number'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.monthlyIncome} *
              </label>
              <select 
                value={verificationData.monthlyIncome}
                onChange={(e) => setVerificationData({...verificationData, monthlyIncome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700"
              >
                <option value="">{t.selectRange}</option>
                <option value="below-500k">{t.below500k}</option>
                <option value="500k-1m">TSh 500,000 - 1,000,000</option>
                <option value="1m-2m">TSh 1,000,000 - 2,000,000</option>
                <option value="above-2m">{t.above2m}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 6: Credit Purchase Completion
  if (currentStep === 6) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {t.completeCreditPurchase}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.completeCreditPurchaseDesc}
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t.creditPurchaseProcess}
            </h3>
            <span className="text-sm text-gray-500">
              {language === 'sw' ? 'Hatua 4 ya 4' : 'Step 4 of 4'}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: '#14b8a6', 
                width: '100%' 
              }}
            ></div>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-sm">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center mb-2 font-semibold">✓</div>
              <span className="text-teal-600 font-medium">
                {language === 'sw' ? 'Mpango' : 'Plan'}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center mb-2 font-semibold">✓</div>
              <span className="text-teal-600 font-medium">
                {language === 'sw' ? 'Uthibitisho' : 'Verification'}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center mb-2 font-semibold">✓</div>
              <span className="text-teal-600 font-medium">
                {language === 'sw' ? 'Masharti' : 'Terms'}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center mb-2 font-semibold">4</div>
              <span className="text-teal-600 font-medium">{t.complete}</span>
            </div>
          </div>
        </div>

        {/* Credit Approval Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <CheckIconSolid className="w-6 h-6 text-green-500 mr-3" />
            <div>
              <h4 className="font-medium text-green-900">{t.creditApproved}</h4>
              <p className="text-sm text-green-700">{t.creditApprovedDesc}</p>
            </div>
          </div>
        </div>

        {/* Credit Purchase Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">{t.creditPurchaseSummary}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Plan Details */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">{t.paymentPlan}</h5>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.paymentPeriod}:</span>
                  <span className="font-medium text-gray-900">
                    {selectedCreditPlan} {language === 'sw' ? 'miezi' : 'months'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.monthlyPayment}:</span>
                  <span className="font-medium text-gray-900">
                    TSh {Math.ceil(getGrandTotal() * (selectedCreditPlan === '3' ? 1.05 : selectedCreditPlan === '6' ? 1.08 : 1.12) / parseInt(selectedCreditPlan)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.interestRate}:</span>
                  <span className="font-medium text-gray-900">
                    {selectedCreditPlan === '3' ? '5%' : selectedCreditPlan === '6' ? '8%' : '12%'}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-600 font-medium">{t.totalToPay}:</span>
                  <span className="font-bold text-gray-900">
                    TSh {Math.ceil(getGrandTotal() * (selectedCreditPlan === '3' ? 1.05 : selectedCreditPlan === '6' ? 1.08 : 1.12)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery & Contact */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">{t.deliveryContact}</h5>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-gray-600 text-sm">{t.deliveryMethod}:</span>
                  <p className="font-medium text-gray-900">
                    {deliveryOptions.find(d => d.id === selectedDeliveryOption)?.[language === 'sw' ? 'nameSwahili' : 'name']}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">{t.name}:</span>
                  <p className="font-medium text-gray-900">{verificationData.fullName}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">{t.phone}:</span>
                  <p className="font-medium text-gray-900">{verificationData.phone}</p>
                </div>
                {selectedDeliveryOption === 'delivery' && customerInfo.address && (
                  <div>
                    <span className="text-gray-600 text-sm">{t.address}:</span>
                    <p className="font-medium text-gray-900">{customerInfo.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Credit Terms Agreement */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-medium text-yellow-800 mb-4">{t.creditPurchaseTerms}</h4>
          
          <div className="space-y-3 text-sm text-yellow-700 mb-4">
            <div className="flex items-start">
              <span className="font-medium mr-2">1.</span>
              <span>
                {language === 'sw' 
                  ? 'Utapokea bidhaa mara moja baada ya kukubali masharti haya.'
                  : 'You will receive products immediately after accepting these terms.'}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">2.</span>
              <span>
                {language === 'sw' 
                  ? `Utalipa TSh ${Math.ceil(getGrandTotal() * (selectedCreditPlan === '3' ? 1.05 : selectedCreditPlan === '6' ? 1.08 : 1.12) / parseInt(selectedCreditPlan)).toLocaleString()} kila mwezi kwa miezi ${selectedCreditPlan}.`
                  : `You will pay TSh ${Math.ceil(getGrandTotal() * (selectedCreditPlan === '3' ? 1.05 : selectedCreditPlan === '6' ? 1.08 : 1.12) / parseInt(selectedCreditPlan)).toLocaleString()} monthly for ${selectedCreditPlan} months.`}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">3.</span>
              <span>
                {language === 'sw' 
                  ? 'Malipo ya kuchelewa yatalipa faini ya 2% kwa siku.'
                  : 'Late payments will incur a 2% daily penalty fee.'}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">4.</span>
              <span>
                {language === 'sw' 
                  ? 'Unaweza kulipa mapema bila ada za ziada.'
                  : 'You can pay early without additional fees.'}
              </span>
            </div>
          </div>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={agreesToTerms}
              onChange={(e) => setAgreesToTerms(e.target.checked)}
              className="mr-3 mt-1 text-teal-600 focus:ring-teal-500"
              required
            />
            <span className="text-sm text-yellow-800">
              <strong>{t.agreeToTerms}</strong>
              <br />
              <span className="text-xs">
                {language === 'sw' 
                  ? 'Kwa kubonyeza hapa, unakubali kulipa kwa ratiba iliyoonyeshwa na masharti yote.'
                  : 'By checking this, you agree to pay according to the schedule shown and all terms.'}
              </span>
            </span>
          </label>
        </div>

        {/* Next Steps Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-3">{t.whatHappensNext}</h4>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xs">1</div>
              <span>
                {language === 'sw' 
                  ? 'Bidhaa zitaandaliwa na kutumwa/kuhifadhiwa'
                  : 'Products will be prepared and shipped/stored'}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xs">2</div>
              <span>
                {language === 'sw' 
                  ? 'Utapokea ujumbe wa uhakikisho wa oda'
                  : 'You\'ll receive order confirmation message'}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xs">3</div>
              <span>
                {language === 'sw' 
                  ? 'Malipo ya kwanza yataanza mwezi ujao'
                  : 'First payment will start next month'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default CreditPurchaseFlow 