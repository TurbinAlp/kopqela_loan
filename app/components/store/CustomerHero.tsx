'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCustomerBusiness } from '../../hooks/useCustomerBusiness'
import { useLanguage } from '../../contexts/LanguageContext'
import { ShoppingBagIcon, StarIcon } from '@heroicons/react/24/outline'

export default function CustomerHero() {
  const params = useParams()
  const slug = params.slug as string
  const { business, isLoading } = useCustomerBusiness(slug)
  const { language } = useLanguage()

  if (isLoading || !business) return null

  const translations = {
    en: {
      welcome: '',
      description: '',
      shopNow: '',
      trustedBy: '',
      deliveryAvailable: '',
      qualityGuaranteed: ''
    },
    sw: {
      welcome: '',
      description: '',
      shopNow: '',
      trustedBy: '',
      deliveryAvailable: '',
      qualityGuaranteed: ''
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
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-white animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-white animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t.welcome}
            <span className="block text-yellow-300 mt-2">{business.name}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t.description}
          </p>

          {/* Primary CTA */}
          <div className="mb-12">
            <Link
              href={`/store/${business.slug}/products`}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-yellow-500 hover:bg-yellow-600 transition-all shadow-2xl hover:shadow-yellow-500/25 hover:scale-105 transform"
            >
              <ShoppingBagIcon className="w-6 h-6 mr-3" />
              {t.shopNow}
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <div className="flex text-yellow-300">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-sm font-medium">{t.trustedBy}</span>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">{t.deliveryAvailable}</span>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-sm font-medium">{t.qualityGuaranteed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}