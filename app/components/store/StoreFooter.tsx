'use client'

import Link from 'next/link'
import { useBusiness } from '../../contexts/BusinessContext'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function StoreFooter() {
  const { business } = useBusiness()
  const { language } = useLanguage()

  if (!business) return null

  const translations = {
    en: {
      contactInfo: 'Contact Information',
      businessHours: 'Business Hours',
      followUs: 'Follow Us',
      poweredBy: 'Powered by',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      closed: 'Closed',
      paymentMethods: 'Payment Methods',
      deliveryAreas: 'Delivery Areas'
    },
    sw: {
      contactInfo: 'Maelezo ya Mawasiliano',
      businessHours: 'Masaa ya Kazi',
      followUs: 'Tufuate',
      poweredBy: 'Inatumika na',
      monday: 'Jumatatu',
      tuesday: 'Jumanne',
      wednesday: 'Jumatano',
      thursday: 'Alhamisi',
      friday: 'Ijumaa',
      saturday: 'Jumamosi',
      sunday: 'Jumapili',
      closed: 'Imefungwa',
      paymentMethods: 'Njia za Malipo',
      deliveryAreas: 'Maeneo ya Uwasilishaji'
    }
  }

  const t = translations[language]

  const dayNames = {
    en: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    },
    sw: {
      monday: 'Jumatatu',
      tuesday: 'Jumanne',
      wednesday: 'Jumatano',
      thursday: 'Alhamisi',
      friday: 'Ijumaa',
      saturday: 'Jumamosi',
      sunday: 'Jumapili'
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Business Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{business.name}</h3>
            <p className="text-gray-300 text-sm">{business.description}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span className="text-xs px-2 py-1 bg-gray-700 rounded">{business.businessType}</span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.contactInfo}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <a href={`tel:${business.contactPhone}`} className="text-gray-300 hover:text-white transition-colors">
                  {business.contactPhone}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${business.contactEmail}`} className="text-gray-300 hover:text-white transition-colors">
                  {business.contactEmail}
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-gray-300">{business.address}</span>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <ClockIcon className="w-5 h-5" />
              <span>{t.businessHours}</span>
            </h3>
            <div className="space-y-1 text-sm">
              {Object.entries(business.workingHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <span className="text-gray-300 capitalize">
                    {dayNames[language][day as keyof typeof dayNames.en]}
                  </span>
                  <span className="text-gray-400">
                    {hours.isOpen ? `${formatTime(hours.open)} - ${formatTime(hours.close)}` : t.closed}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods & Delivery */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">{t.paymentMethods}</h4>
              <div className="flex flex-wrap gap-1">
                {business.paymentMethods.map((method) => (
                  <span key={method} className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                    {method}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">{t.deliveryAreas}</h4>
              <div className="flex flex-wrap gap-1">
                {business.deliveryAreas.slice(0, 3).map((area) => (
                  <span key={area} className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                    {area}
                  </span>
                ))}
                {business.deliveryAreas.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                    +{business.deliveryAreas.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Social Media */}
            {Object.keys(business.socialMedia).length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">{t.followUs}</h4>
                <div className="flex space-x-3">
                  {business.socialMedia.whatsapp && (
                    <a
                      href={`https://wa.me/${business.socialMedia.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-green-400 transition-colors"
                    >
                      WhatsApp
                    </a>
                  )}
                  {business.socialMedia.facebook && (
                    <a
                      href={`https://facebook.com/${business.socialMedia.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      Facebook
                    </a>
                  )}
                  {business.socialMedia.instagram && (
                    <a
                      href={`https://instagram.com/${business.socialMedia.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-pink-400 transition-colors"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; 2024 {business.name}. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            {t.poweredBy} <Link href="/" className="text-teal-400 hover:text-teal-300 transition-colors">Kopqela</Link>
          </p>
        </div>
      </div>
    </footer>
  )
} 