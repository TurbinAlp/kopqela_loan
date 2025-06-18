'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCustomerBusiness } from '../../hooks/useCustomerBusiness'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

export default function QuickActions() {
  const params = useParams()
  const slug = params.slug as string
  const { business, isLoading } = useCustomerBusiness(slug)
  const { language } = useLanguage()

  if (isLoading || !business) return null

  const translations = {
    en: {
      getInTouch: 'Get In Touch',
      contactUs: 'Contact Us',
      getDirections: 'Get Directions',
      businessHours: 'Business Hours',
      sendMessage: 'Send Message',
      callNow: 'Call Now',
      findUs: 'Find Us'
    },
    sw: {
      getInTouch: 'Wasiliana Nasi',
      contactUs: 'Wasiliana Nasi',
      getDirections: 'Pata Muelekeo',
      businessHours: 'Masaa ya Kazi',
      sendMessage: 'Tuma Ujumbe',
      callNow: 'Piga Simu Sasa',
      findUs: 'Tupatee'
    }
  }

  const t = translations[language]

  const actions = []

  if (business.businessSetting?.phone) {
    actions.push({
      name: t.callNow,
      href: `tel:${business.businessSetting.phone}`,
      icon: PhoneIcon,
      color: '#10b981',
      description: `Call us at ${business.businessSetting.phone}`
    })
  }

  if (business.businessSetting?.email) {
    actions.push({
      name: t.sendMessage,
      href: `mailto:${business.businessSetting.email}`,
      icon: EnvelopeIcon,
      color: '#3b82f6',
      description: 'Send us an email'
    })
  }

  if (business.businessSetting?.address) {
    actions.push({
      name: t.findUs,
      href: `https://maps.google.com/?q=${encodeURIComponent(business.businessSetting.address)}`,
      icon: MapPinIcon,
      color: '#ef4444',
      description: business.businessSetting.address
    })
  }

  // Don't show this section if no contact methods are available
  if (actions.length === 0) return null

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.getInTouch}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ready to shop or have questions? We&apos;re here to help you every step of the way.
          </p>
        </div>
        
        {/* Contact Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.name}
                href={action.href}
                className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                target={action.href.startsWith('http') ? '_blank' : undefined}
              >
                <div className="text-center">
                  <div 
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg"
                    style={{ backgroundColor: action.color }}
                  >
                    <Icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700">
                    {action.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{action.description}</p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Business Hours Section */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <ClockIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">{t.businessHours}</h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">Monday - Friday</span>
                  <span className="text-green-600 font-semibold">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">Saturday</span>
                  <span className="text-green-600 font-semibold">9:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Sunday</span>
                  <span className="text-red-500 font-semibold">Closed</span>
                </div>
              </div>
              <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Currently Open
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 