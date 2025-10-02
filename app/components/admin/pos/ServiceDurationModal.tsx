'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'

interface ServiceItem {
  id: number
  serviceId: number
  itemNumber: string
  name: string
  nameSwahili?: string
  description?: string
  price: number
  durationValue: number
  durationUnit: string
  status: 'AVAILABLE' | 'RENTED' | 'BOOKED' | 'MAINTENANCE'
  serviceName: string
  serviceType: string
}

interface ServiceDurationModalProps {
  isOpen: boolean
  onClose: () => void
  serviceItem: ServiceItem | null
  onConfirm: (serviceItem: ServiceItem, customDuration: number, customUnit: string) => void
}

export default function ServiceDurationModal({
  isOpen,
  onClose,
  serviceItem,
  onConfirm
}: ServiceDurationModalProps) {
  const { language } = useLanguage()
  const [customDuration, setCustomDuration] = useState(1)
  const [customUnit, setCustomUnit] = useState('DAYS')

  // Update default values when service item changes
  useEffect(() => {
    if (serviceItem) {
      setCustomDuration(serviceItem.durationValue)
      setCustomUnit(serviceItem.durationUnit)
    }
  }, [serviceItem])

  const translations = {
    en: {
      rentalDuration: "Lease Duration",
      howLongStay: "How long do you need this service?",
      duration: "Duration",
      durationUnit: "Duration Unit",
      minutes: "Minutes",
      hours: "Hours", 
      days: "Days",
      weeks: "Weeks",
      months: "Months",
      years: "Years",
      basePrice: "Base Price",
      totalPrice: "Total Price",
      currency: "TZS",
      for: "for",
      cancel: "Cancel",
      addToCart: "Add to Cart",
      priceCalculation: "Price Calculation",
      perUnit: "per"
    },
    sw: {
      rentalDuration: "Muda wa Kukodisha",
      howLongStay: "Utahitaji huduma hii kwa muda gani?",
      duration: "Muda",
      durationUnit: "Kipimo cha Muda",
      minutes: "Dakika",
      hours: "Masaa",
      days: "Siku", 
      weeks: "Wiki",
      months: "Miezi",
      years: "Miaka",
      basePrice: "Bei ya Msingi",
      totalPrice: "Bei ya Jumla",
      currency: "TSh",
      for: "kwa",
      cancel: "Ghairi",
      addToCart: "Ongeza kwenye Mkoba",
      priceCalculation: "Hesabu ya Bei",
      perUnit: "kwa"
    }
  }

  const t = translations[language]

  // Calculate total price based on custom duration
  const calculateTotalPrice = () => {
    if (!serviceItem) return 0

    const basePrice = serviceItem.price
    const baseDuration = serviceItem.durationValue
    const baseUnit = serviceItem.durationUnit

    // Convert everything to hours for calculation
    const getHours = (value: number, unit: string) => {
      switch (unit) {
        case 'MINUTES': return value / 60
        case 'HOURS': return value
        case 'DAYS': return value * 24
        case 'WEEKS': return value * 24 * 7
        case 'MONTHS': return value * 24 * 30
        case 'YEARS': return value * 24 * 365
        default: return value
      }
    }

    const baseHours = getHours(baseDuration, baseUnit)
    const customHours = getHours(customDuration, customUnit)
    
    // Calculate price per hour
    const pricePerHour = basePrice / baseHours
    
    // Calculate total price
    return Math.round(pricePerHour * customHours)
  }

  const handleConfirm = () => {
    if (serviceItem) {
      onConfirm(serviceItem, customDuration, customUnit)
      onClose()
      // Reset to service item defaults
      setCustomDuration(serviceItem.durationValue)
      setCustomUnit(serviceItem.durationUnit)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset to service item defaults if available
    if (serviceItem) {
      setCustomDuration(serviceItem.durationValue)
      setCustomUnit(serviceItem.durationUnit)
    } else {
      setCustomDuration(1)
      setCustomUnit('DAYS')
    }
  }

  if (!isOpen || !serviceItem) return null

  const totalPrice = calculateTotalPrice()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{t.rentalDuration}</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4">
          {/* Service Item Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-1">
              {language === 'sw' && serviceItem.nameSwahili ? serviceItem.nameSwahili : serviceItem.name}
            </h4>
            <p className="text-sm text-gray-600">
              {serviceItem.serviceName} • {serviceItem.itemNumber}
            </p>
          </div>

          <p className="text-gray-600 mb-4">{t.howLongStay}</p>

          {/* Duration Input */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.duration}
              </label>
              <input
                type="number"
                min="1"
                value={customDuration}
                onChange={(e) => setCustomDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.durationUnit}
              </label>
              <select
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="MINUTES">{t.minutes}</option>
                <option value="HOURS">{t.hours}</option>
                <option value="DAYS">{t.days}</option>
                <option value="WEEKS">{t.weeks}</option>
                <option value="MONTHS">{t.months}</option>
                <option value="YEARS">{t.years}</option>
              </select>
            </div>
          </div>

          {/* Price Calculation */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h5 className="font-medium text-gray-900 mb-2">{t.priceCalculation}</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t.basePrice} ({serviceItem.durationValue} {serviceItem.durationUnit.toLowerCase()}):
                </span>
                <span className="font-medium">
                  {language === 'sw' ? t.currency : t.currency} {serviceItem.price.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t.for} {customDuration} {customUnit.toLowerCase()}:
                </span>
                <span className="font-medium">
                  {language === 'sw' ? t.currency : t.currency} {totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">{t.totalPrice}:</span>
                  <span className="font-bold text-blue-600">
                    {language === 'sw' ? t.currency : t.currency} {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3 rounded-b-2xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>{t.addToCart}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
