'use client'

import { useBusiness } from '../../contexts/BusinessContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { CheckCircleIcon, TruckIcon, CreditCardIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function AboutBusiness() {
  const { business } = useBusiness()
  const { language } = useLanguage()

  if (!business) return null

  const translations = {
    en: {
      aboutUs: 'About Us',
      whyChooseUs: 'Why Choose Us',
      qualityProducts: 'Quality Products',
      qualityDesc: 'We source only the best products for our customers',
      fastDelivery: 'Fast Delivery',
      deliveryDesc: 'Quick and reliable delivery to your doorstep',
      securePayments: 'Secure Payments',
      paymentsDesc: 'Multiple payment options for your convenience',
      trustedService: 'Trusted Service',
      serviceDesc: 'Years of experience serving our community'
    },
    sw: {
      aboutUs: 'Kuhusu Sisi',
      whyChooseUs: 'Kwa Nini Utuchague',
      qualityProducts: 'Bidhaa Bora',
      qualityDesc: 'Tunachagua bidhaa bora tu kwa wateja wetu',
      fastDelivery: 'Uwasilishaji wa Haraka',
      deliveryDesc: 'Uwasilishaji wa haraka na wa kuaminika',
      securePayments: 'Malipo Salama',
      paymentsDesc: 'Njia nyingi za malipo kwa urahisi wako',
      trustedService: 'Huduma ya Kuaminika',
      serviceDesc: 'Miaka ya uzoefu wa kutumikia jamii yetu'
    }
  }

  const t = translations[language]

  const features = [
    {
      icon: CheckCircleIcon,
      title: t.qualityProducts,
      description: t.qualityDesc
    },
    {
      icon: TruckIcon,
      title: t.fastDelivery,
      description: t.deliveryDesc
    },
    {
      icon: CreditCardIcon,
      title: t.securePayments,
      description: t.paymentsDesc
    },
    {
      icon: ShieldCheckIcon,
      title: t.trustedService,
      description: t.serviceDesc
    }
  ]

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* About Content */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t.aboutUs}</h2>
            <p className="text-lg text-gray-600 mb-8">
              {business.description}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: business.primaryColor }}
                />
                <span className="text-gray-700">Established business in {business.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: business.primaryColor }}
                />
                <span className="text-gray-700">Serving {business.deliveryAreas.length}+ areas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: business.primaryColor }}
                />
                <span className="text-gray-700">Specialized in {business.businessType}</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">{t.whyChooseUs}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="text-center p-4">
                    <div 
                      className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: `${business.primaryColor}20` }}
                    >
                      <Icon 
                        className="w-6 h-6"
                        style={{ color: business.primaryColor }}
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 