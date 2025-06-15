'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCustomerBusiness } from '../../hooks/useCustomerBusiness'
import { useLanguage } from '../../contexts/LanguageContext'
import { ShoppingBagIcon, CreditCardIcon } from '@heroicons/react/24/outline'

export default function CustomerHero() {
  const params = useParams()
  const slug = params.slug as string
  const { business, isLoading } = useCustomerBusiness(slug)
  const { language } = useLanguage()

  if (isLoading || !business) return null

  const translations = {
    en: {
      welcome: 'Welcome to',
      description: 'Your trusted partner for quality products and excellent service',
      shopNow: 'Shop Now',
      applyCredit: 'Apply for Credit',
      openNow: 'Open Now',
      closedNow: 'Closed',
      deliveryAvailable: 'Delivery Available'
    },
    sw: {
      welcome: 'Karibu',
      description: 'Mshirika wako wa kuaminika kwa bidhaa bora na huduma nzuri',
      shopNow: 'Nunua Sasa',
      applyCredit: 'Omba Mkopo',
      openNow: 'Tumefunguka',
      closedNow: 'Tumefungwa',
      deliveryAvailable: 'Uwasilishaji Unapatikana'
    }
  }

  const t = translations[language]

  const primaryColor = business.businessSetting?.primaryColor || '#059669'
  const secondaryColor = business.businessSetting?.secondaryColor || '#10b981'

  return (
    <div 
      className="relative bg-gradient-to-br text-white overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}dd 0%, ${secondaryColor}aa 50%, ${primaryColor}dd 100%)`
      }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {t.welcome}
            <span className="block text-yellow-300">{business.name}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            {t.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/store/${business.slug}/products`}
              className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 transition-all"
            >
              <ShoppingBagIcon className="w-6 h-6 mr-2" />
              {t.shopNow}
            </Link>

            {business.businessSetting?.enableCreditSales && (
              <Link
                href={`/store/${business.slug}/credit`}
                className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-gray-900 transition-all"
              >
                <CreditCardIcon className="w-6 h-6 mr-2" />
                {t.applyCredit}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}