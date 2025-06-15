'use client'

import { useParams } from 'next/navigation'
import { useCustomerBusiness } from '../../hooks/useCustomerBusiness'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  CheckCircleIcon, 
  TruckIcon, 
  CreditCardIcon, 
  ShieldCheckIcon,
  StarIcon,
  HeartIcon,
  LightBulbIcon,
  GiftIcon
} from '@heroicons/react/24/outline'

export default function AboutBusiness() {
  const params = useParams()
  const slug = params.slug as string
  const { business, isLoading } = useCustomerBusiness(slug)
  const { language } = useLanguage()

  if (isLoading || !business) return null

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

  // Icon mapping
  const iconMap = {
    CheckCircleIcon,
    TruckIcon,
    CreditCardIcon,
    ShieldCheckIcon,
    StarIcon,
    HeartIcon,
    LightBulbIcon,
    GiftIcon
  }

  // Get features from business settings or use defaults
  const getFeatures = () => {
    const features = []
    
    // Feature 1
    if (business.businessSetting?.feature1Title) {
      features.push({
        icon: iconMap[business.businessSetting.feature1Icon as keyof typeof iconMap] || CheckCircleIcon,
        title: language === 'sw' 
          ? (business.businessSetting.feature1TitleSwahili || business.businessSetting.feature1Title)
          : business.businessSetting.feature1Title,
        description: language === 'sw'
          ? (business.businessSetting.feature1DescriptionSwahili || business.businessSetting.feature1Description)
          : business.businessSetting.feature1Description
      })
    }
    
    // Feature 2
    if (business.businessSetting?.feature2Title) {
      features.push({
        icon: iconMap[business.businessSetting.feature2Icon as keyof typeof iconMap] || TruckIcon,
        title: language === 'sw' 
          ? (business.businessSetting.feature2TitleSwahili || business.businessSetting.feature2Title)
          : business.businessSetting.feature2Title,
        description: language === 'sw'
          ? (business.businessSetting.feature2DescriptionSwahili || business.businessSetting.feature2Description)
          : business.businessSetting.feature2Description
      })
    }
    
    // Feature 3
    if (business.businessSetting?.feature3Title) {
      features.push({
        icon: iconMap[business.businessSetting.feature3Icon as keyof typeof iconMap] || CreditCardIcon,
        title: language === 'sw' 
          ? (business.businessSetting.feature3TitleSwahili || business.businessSetting.feature3Title)
          : business.businessSetting.feature3Title,
        description: language === 'sw'
          ? (business.businessSetting.feature3DescriptionSwahili || business.businessSetting.feature3Description)
          : business.businessSetting.feature3Description
      })
    }
    
    // Feature 4
    if (business.businessSetting?.feature4Title) {
      features.push({
        icon: iconMap[business.businessSetting.feature4Icon as keyof typeof iconMap] || ShieldCheckIcon,
        title: language === 'sw' 
          ? (business.businessSetting.feature4TitleSwahili || business.businessSetting.feature4Title)
          : business.businessSetting.feature4Title,
        description: language === 'sw'
          ? (business.businessSetting.feature4DescriptionSwahili || business.businessSetting.feature4Description)
          : business.businessSetting.feature4Description
      })
    }
    
    // If no custom features, use defaults
    if (features.length === 0) {
      return [
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
    }
    
    return features
  }

  const features = getFeatures()

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* About Content */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t.aboutUs}</h2>
            <p className="text-lg text-gray-600 mb-8">
              {business.businessSetting?.description || 'Welcome to our store'}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: business.businessSetting?.primaryColor || '#059669' }}
                />
                <span className="text-gray-700">Established business in {business.businessSetting?.address || 'Tanzania'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: business.businessSetting?.primaryColor || '#059669' }}
                />
                <span className="text-gray-700">Quality service provider</span>
              </div>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: business.businessSetting?.primaryColor || '#059669' }}
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
                      style={{ backgroundColor: `${business.businessSetting?.primaryColor || '#059669'}20` }}
                    >
                      <Icon 
                        className="w-6 h-6"
                        style={{ color: business.businessSetting?.primaryColor || '#059669' }}
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