'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'

interface Service {
  id: number
  businessId: number
  serviceType: string
  name: string
  nameSwahili?: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    serviceItems: number
  }
}

interface EditServiceModalProps {
  isOpen: boolean
  onClose: () => void
  service: Service | null
  onServiceUpdated: () => void
}

export default function EditServiceModal({
  isOpen,
  onClose,
  service,
  onServiceUpdated
}: EditServiceModalProps) {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const [updatingService, setUpdatingService] = useState(false)
  
  const [formData, setFormData] = useState({
    serviceType: 'LEASE',
    name: '',
    nameSwahili: '',
    description: ''
  })

  const translations = {
    en: {
      editService: "Edit Service",
      serviceNameLabel: "Service Name",
      serviceNamePlaceholder: "e.g., Hotel Room Lease, Car Rental Service",
      serviceNameSwahili: "Service Name (Swahili)",
      serviceNameSwahiliPlaceholder: "e.g., Huduma ya Kukodisha Vyumba",
      selectServiceType: "Select Service Type",
      descriptionLabel: "Description",
      descriptionPlaceholder: "Describe this service...",
      cancel: "Cancel",
      updateService: "Update Service",
      updating: "Updating...",
      lease: "Lease",
      serviceUpdated: "Service Updated",
      serviceUpdatedMessage: "Service has been updated successfully."
    },
    sw: {
      editService: "Hariri Huduma",
      serviceNameLabel: "Jina la Huduma",
      serviceNamePlaceholder: "mf., Huduma ya Kukodisha Vyumba, Huduma ya Kukodisha Magari",
      serviceNameSwahili: "Jina la Huduma (Kiswahili)",
      serviceNameSwahiliPlaceholder: "mf., Huduma ya Kukodisha Vyumba",
      selectServiceType: "Chagua Aina ya Huduma",
      descriptionLabel: "Maelezo",
      descriptionPlaceholder: "Eleza huduma hii...",
      cancel: "Ghairi",
      updateService: "Sasisha Huduma",
      updating: "Inasasisha...",
      lease: "Ukodishaji",
      serviceUpdated: "Huduma Imesasishwa",
      serviceUpdatedMessage: "Huduma imesasishwa kwa mafanikio."
    }
  }

  const t = translations[language]

  // Update form data when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        serviceType: service.serviceType,
        name: service.name,
        nameSwahili: service.nameSwahili || '',
        description: service.description || ''
      })
    }
  }, [service])

  // Handle update service
  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!service) return

    setUpdatingService(true)
    
    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceType: formData.serviceType,
          name: formData.name.trim(),
          nameSwahili: formData.nameSwahili.trim() || null,
          description: formData.description.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update service')
      }

      showSuccess(t.serviceUpdated, t.serviceUpdatedMessage)
      onServiceUpdated()
      onClose()
    } catch (error: unknown) {
      console.error('Error updating service:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update service'
      showError('Error', errorMessage)
    } finally {
      setUpdatingService(false)
    }
  }

  if (!isOpen || !service) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{t.editService}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleUpdateService} className="px-6 py-4 space-y-4">
          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.selectServiceType}
            </label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="LEASE">{t.lease}</option>
            </select>
          </div>

          {/* Service Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.serviceNameLabel} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t.serviceNamePlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Service Name Swahili */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.serviceNameSwahili}
            </label>
            <input
              type="text"
              value={formData.nameSwahili}
              onChange={(e) => setFormData(prev => ({ ...prev, nameSwahili: e.target.value }))}
              placeholder={t.serviceNameSwahiliPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.descriptionLabel}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t.descriptionPlaceholder}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={updatingService}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleUpdateService}
            disabled={updatingService || !formData.name.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {updatingService && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{updatingService ? t.updating : t.updateService}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
