'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import ServiceDurationModal from './ServiceDurationModal'

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

interface Service {
  id: number
  name: string
  nameSwahili?: string
  serviceType: string
  description?: string
  isActive: boolean
  items: ServiceItem[]
}

interface ServicesSectionProps {
  services: Service[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedServiceType: string
  setSelectedServiceType: (type: string) => void
  onAddToCart: (item: ServiceItem, customDuration?: number, customUnit?: string) => void
}

export default function ServicesSection({
  services,
  searchQuery,
  setSearchQuery,
  selectedServiceType,
  setSelectedServiceType,
  onAddToCart
}: ServicesSectionProps) {
  const { language } = useLanguage()
  const { showSuccess, showError } = useNotifications()
  const [showDurationModal, setShowDurationModal] = useState(false)
  const [selectedServiceItem, setSelectedServiceItem] = useState<ServiceItem | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  
  const translations = {
    en: {
      serviceSearch: "Search services...",
      serviceTypes: "Service Types",
      all: "All",
      available: "Available",
      rented: "Rented",
      booked: "Booked",
      maintenance: "Maintenance",
      currency: "TZS",
      for: "for",
      minutes: "Minutes",
      hours: "Hours",
      days: "Days",
      weeks: "Weeks",
      months: "Months",
      years: "Years",
      lease: "Lease",
      markAvailable: "Mark Available",
      statusUpdated: "Status Updated",
      statusUpdateSuccess: "Service item status updated successfully"
    },
    sw: {
      serviceSearch: "Tafuta huduma...",
      serviceTypes: "Aina za Huduma",
      all: "Yote",
      available: "Inapatikana",
      rented: "Imekodishwa",
      booked: "Imehifadhiwa",
      maintenance: "Inatengezwa",
      currency: "TSh",
      for: "kwa",
      minutes: "Dakika",
      hours: "Masaa",
      days: "Siku",
      weeks: "Wiki",
      months: "Miezi",
      years: "Miaka",
      lease: "Kukodisha",
      markAvailable: "Weka Inapatikana",
      statusUpdated: "Hali Imebadilishwa",
      statusUpdateSuccess: "Hali ya huduma imebadilishwa kikamilifu"
    }
  }

  const t = translations[language]

  // Handle service item selection
  const handleServiceItemClick = (item: ServiceItem) => {
    if (item.status === 'AVAILABLE') {
      setSelectedServiceItem(item)
      setShowDurationModal(true)
    }
  }

  // Handle duration confirmation
  const handleDurationConfirm = (serviceItem: ServiceItem, customDuration: number, customUnit: string) => {
    onAddToCart(serviceItem, customDuration, customUnit)
    setShowDurationModal(false)
    setSelectedServiceItem(null)
  }

  // Handle status change for service items
  const handleStatusChange = async (itemId: number, newStatus: string) => {
    setUpdatingStatus(itemId)
    try {
      // Get service ID from the item
      const serviceId = allItems.find(item => item.id === itemId)?.serviceId
      
      if (!serviceId) {
        throw new Error('Service ID not found')
      }
      
      const response = await fetch(`/api/admin/services/${serviceId}/items/${itemId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      await response.json()
      showSuccess(t.statusUpdated, t.statusUpdateSuccess)
      
      // Refresh the page to show updated status
      window.location.reload()
      
    } catch (error) {
      console.error('Status update error:', error)
      showError('Error', `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Get duration unit label
  const getDurationLabel = (unit: string) => {
    const unitMap: Record<string, string> = {
      'MINUTES': t.minutes,
      'HOURS': t.hours,
      'DAYS': t.days,
      'WEEKS': t.weeks,
      'MONTHS': t.months,
      'YEARS': t.years
    }
    return unitMap[unit] || unit
  }

  // Get all items from all services
  const allItems = services.flatMap(service => 
    service.items.map(item => ({
      ...item,
      serviceName: service.name,
      serviceType: service.serviceType
    }))
  )

  // Filter by service type
  const serviceTypeOptions = [
    { value: 'all', label: t.all },
    { value: 'LEASE', label: t.lease }
  ]

  // Filter items
  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.nameSwahili && item.nameSwahili.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         item.itemNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedServiceType === 'all' || item.serviceType === selectedServiceType
    return matchesSearch && matchesType 
  })


  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, class: string }> = {
      'AVAILABLE': { label: t.available, class: 'bg-green-100 text-green-800' },
      'RENTED': { label: t.rented, class: 'bg-blue-100 text-blue-800' },
      'BOOKED': { label: t.booked, class: 'bg-yellow-100 text-yellow-800' },
      'MAINTENANCE': { label: t.maintenance, class: 'bg-gray-100 text-gray-800' }
    }
    return statusMap[status] || statusMap['AVAILABLE']
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.serviceSearch}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
          />
        </div>

        {/* Service Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.serviceTypes}
          </label>
          <select
            value={selectedServiceType}
            onChange={(e) => setSelectedServiceType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
          >
            {serviceTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Service Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
        {filteredItems.map((item) => {
          const statusBadge = getStatusBadge(item.status)
          return (
            <motion.div
              key={item.id}
              whileHover={item.status === 'AVAILABLE' ? { scale: 1.02 } : undefined}
              whileTap={item.status === 'AVAILABLE' ? { scale: 0.98 } : undefined}
              className={`p-4 rounded-lg border-2 text-left transition-all relative ${
                item.status === 'AVAILABLE'
                  ? 'border-gray-200 hover:border-teal-500 hover:shadow-md cursor-pointer'
                  : 'border-gray-100 bg-gray-50'
              }`}
              onClick={item.status === 'AVAILABLE' ? () => handleServiceItemClick(item) : undefined}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-teal-600" />
                  <span className="text-xs font-medium text-gray-500">
                    {item.itemNumber}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge.class}`}>
                  {statusBadge.label}
                </span>
              </div>

              <div className="mb-2">
                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                {item.nameSwahili && (
                  <p className="text-xs text-gray-500">{item.nameSwahili}</p>
                )}
                <p className="text-xs text-gray-600 mt-1">{item.serviceName}</p>
              </div>

              {item.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
              )}

              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-teal-600">
                      {t.currency} {Number(item.price).toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-500">
                      {t.for} {item.durationValue} {getDurationLabel(item.durationUnit)}
                    </p>
                  </div>
                  
                  {/* Quick Status Change for Rented Items */}
                  {item.status === 'RENTED' && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusChange(item.id, 'AVAILABLE')
                      }}
                      disabled={updatingStatus === item.id}
                      whileHover={updatingStatus !== item.id ? { scale: 1.05 } : undefined}
                      whileTap={updatingStatus !== item.id ? { scale: 0.95 } : undefined}
                      className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
                        updatingStatus === item.id
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      style={{ zIndex: 999, position: 'relative' }}
                    >
                      {updatingStatus === item.id ? '...' : t.markAvailable}
                    </motion.button>
                  )}

                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <WrenchScrewdriverIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No services found</p>
          <p className="text-sm">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Service Duration Modal */}
      <ServiceDurationModal
        isOpen={showDurationModal}
        onClose={() => {
          setShowDurationModal(false)
          setSelectedServiceItem(null)
        }}
        serviceItem={selectedServiceItem}
        onConfirm={handleDurationConfirm}
      />
    </div>
  )
}
