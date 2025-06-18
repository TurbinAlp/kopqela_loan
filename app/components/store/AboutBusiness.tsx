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
  GiftIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  BuildingOfficeIcon
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
      businessInfo: 'Business Information',
      location: 'Our Location',
      businessType: 'Business Type',
      established: 'Established Business',
      qualityService: 'Quality Service Provider',
      contactUs: 'Contact Us',
      // Default features
      qualityProducts: '',
      qualityDesc: '',
      fastDelivery: '',
      deliveryDesc: '',
      securePayments: '',
      paymentsDesc: '',
      trustedService: '',
      serviceDesc: '',
      businessHours: '',
      paymentMethods: '',
      delivery: ''
    },
    sw: {
      aboutUs: 'Kuhusu Sisi',
      whyChooseUs: 'Kwa Nini Utuchague',
      businessInfo: 'Taarifa za Biashara',
      location: 'Mahali Tulipo',
      businessType: 'Aina ya Biashara',
      established: 'Biashara Iliyoanzishwa',
      qualityService: 'Mtoa Huduma Bora',
      contactUs: 'Wasiliana Nasi',
      // Default features
      qualityProducts: '',
      qualityDesc: '',
      fastDelivery: '',
      deliveryDesc: '',
      securePayments: '',
      paymentsDesc: '',
      trustedService: '',
      serviceDesc: '',
      businessHours: '',
      paymentMethods: '',
      delivery: ''
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

  // Business description - prioritize custom description, then use default based on business type
  const getBusinessDescription = () => {
    if (business.businessSetting?.description) {
      return business.businessSetting.description
    }
    
    // Default descriptions based on business type
    const defaultDescriptions = {
      en: {
        'Electronics': `Welcome to ${business.name}, your trusted electronics store. We specialize in providing high-quality electronic products and accessories to meet all your technology needs.`,
        'Fashion & Clothing': `Welcome to ${business.name}, your premier fashion destination. We offer the latest trends and timeless styles for every occasion and personal taste.`,
        'Food & Beverages': `Welcome to ${business.name}, where quality meets taste. We provide fresh, delicious food and beverages to satisfy your culinary desires.`,
        'Healthcare': `Welcome to ${business.name}, your healthcare partner. We are committed to providing quality healthcare products and services for your wellbeing.`,
        'default': `Welcome to ${business.name}. We are a trusted business committed to providing excellent products and services to our valued customers.`
      },
      sw: {
        'Electronics': `Karibu ${business.name}, duka lako la kuaminika la elektroniki. Tunahusika na kutoa bidhaa za elektroniki za hali ya juu na vifaa vya ziada kukidhi mahitaji yako yote ya teknolojia.`,
        'Fashion & Clothing': `Karibu ${business.name}, makao yako makuu ya mitindo. Tunatoa mitindo ya hivi karibuni na mitindo ya kila wakati kwa kila tukio na ladha ya kibinafsi.`,
        'Food & Beverages': `Karibu ${business.name}, ambapo ubora unakutana na ladha. Tunatoa chakula na vinywaji vya ubora wa juu kukidhi mahitaji yako ya kiutamaduni.`,
        'Healthcare': `Karibu ${business.name}, mshirika wako wa afya. Tumejitolea kutoa bidhaa na huduma za afya za ubora kwa ustawi wako.`,
        'default': `Karibu ${business.name}. Sisi ni biashara ya kuaminika iliyojitolea kutoa bidhaa na huduma bora kwa wateja wetu wa thamani.`
      }
    }
    
    const descriptions = defaultDescriptions[language as 'en' | 'sw'] || defaultDescriptions.en
    return descriptions[business.businessType as keyof typeof descriptions] || descriptions.default
  }

  // Get business hours data from database
  const businessHours = business.businessSetting?.businessHours || []

  // Get payment methods from database
  const paymentMethods = business.businessSetting?.paymentMethods || ['']

  // Get delivery info from database
  const deliveryAreas = business.businessSetting?.deliveryAreas || ['']
  const deliveryFee = business.businessSetting?.deliveryFee || 0
  const freeDeliveryMinimum = business.businessSetting?.freeDeliveryMinimum || 0
  const estimatedDeliveryTime = business.businessSetting?.estimatedDeliveryTime || ''

  // Today's business hours
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todayHours = businessHours.find(h => h.day === today)
  const isOpenToday = todayHours?.isOpen && todayHours.open && todayHours.close

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* About Content */}
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t.aboutUs}</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {getBusinessDescription()}
            </p>
          </div>
          
          {/* Business Details */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <BuildingOfficeIcon className="w-6 h-6 mr-3 text-teal-600" />
              {t.businessInfo}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div 
                  className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: business.businessSetting?.primaryColor || '#059669' }}
                />
                <div>
                  <span className="font-medium text-gray-900">{t.businessType}:</span>
                  <span className="text-gray-700 ml-2">{business.businessType}</span>
                </div>
              </div>
              
              {business.businessSetting?.address && (
                <div className="flex items-start space-x-4">
                  <MapPinIcon className="w-4 h-4 mt-1 text-gray-500 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">{t.location}:</span>
                    <span className="text-gray-700 ml-2">{business.businessSetting.address}</span>
                    {business.businessSetting?.city && (
                      <span className="text-gray-700">, {business.businessSetting.city}</span>
                    )}
                  </div>
                </div>
              )}
              
              {business.businessSetting?.phone && (
                <div className="flex items-center space-x-4">
                  <PhoneIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">{t.contactUs}:</span>
                    <a 
                      href={`tel:${business.businessSetting.phone}`}
                      className="text-teal-600 hover:text-teal-700 ml-2 font-medium"
                    >
                      {business.businessSetting.phone}
                    </a>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-4">
                <ClockIcon className="w-4 h-4 mt-1 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{t.businessHours}:</span>
                  <div className="text-gray-700 ml-2 space-y-1">
                    {businessHours.slice(0, 3).map((hours) => (
                      <div key={hours.day} className="text-sm">
                        <span className="font-medium">{hours.day.slice(0, 3)}:</span> {
                          hours.isOpen 
                            ? `${hours.open} - ${hours.close}`
                            : 'Closed'
                        }
                      </div>
                    ))}
                    {businessHours.length > 3 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {isOpenToday ? '✅ Open today' : '❌ Closed today'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex items-start space-x-4">
                <CreditCardIcon className="w-4 h-4 mt-1 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{t.paymentMethods}:</span>
                  <div className="text-gray-700 ml-2">
                    {paymentMethods.join(', ')}
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="flex items-start space-x-4">
                <TruckIcon className="w-4 h-4 mt-1 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{t.delivery}:</span>
                  <div className="text-gray-700 ml-2 space-y-1">
                    <div className="text-sm">
                      Areas: {deliveryAreas.slice(0, 3).join(', ')}
                      {deliveryAreas.length > 3 && ` +${deliveryAreas.length - 3} more`}
                    </div>
                    <div className="text-sm">
                      Fee: TZS {deliveryFee.toLocaleString()} 
                      {freeDeliveryMinimum && (
                        <span className="text-green-600"> (Free over TZS {freeDeliveryMinimum.toLocaleString()})</span>
                      )}
                    </div>
                    <div className="text-sm">Time: {estimatedDeliveryTime}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Features */}
        <div className="space-y-8">
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">{t.whyChooseUs}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div 
                    key={feature.title} 
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div 
                      className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${business.businessSetting?.primaryColor || '#059669'}15` }}
                    >
                      <Icon 
                        className="w-8 h-8"
                        style={{ color: business.businessSetting?.primaryColor || '#059669' }}
                      />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-3 text-center">{feature.title}</h4>
                    <p className="text-sm text-gray-600 text-center leading-relaxed">{feature.description}</p>
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