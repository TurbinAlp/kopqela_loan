'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { useBusiness } from '../../../contexts/BusinessContext'

interface AddServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onServiceAdded: () => void
}

export default function AddServiceModal({
  isOpen,
  onClose,
  onServiceAdded
}: AddServiceModalProps) {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const { currentBusiness } = useBusiness()
  const [addingService, setAddingService] = useState(false)
  
  const [formData, setFormData] = useState({
    serviceType: 'LEASE',
    name: '',
    nameSwahili: '',
    description: ''
  })

  const translations = {
    en: {
      addNewService: "Add New Service",
      serviceNameLabel: "Service Name",
      serviceNamePlaceholder: "e.g., Hotel Room Lease, Car Rental Service",
      serviceNameSwahili: "Service Name (Swahili)",
      serviceNameSwahiliPlaceholder: "e.g., Huduma ya Kukodisha Vyumba",
      selectServiceType: "Select Service Type",
      descriptionLabel: "Description",
      descriptionPlaceholder: "Describe this service...",
      cancel: "Cancel",
      create: "Create Service",
      creating: "Creating...",
      lease: "Lease",
      serviceAdded: "Service Added",
      serviceAddedMessage: "Service has been created successfully."
    },
    sw: {
      addNewService: "Ongeza Huduma Mpya",
      serviceNameLabel: "Jina la Huduma",
      serviceNamePlaceholder: "mf., Huduma ya Kukodisha Vyumba, Huduma ya Kukodisha Magari",
      serviceNameSwahili: "Jina la Huduma (Kiswahili)",
      serviceNameSwahiliPlaceholder: "mf., Huduma ya Kukodisha Vyumba",
      selectServiceType: "Chagua Aina ya Huduma",
      descriptionLabel: "Maelezo",
      descriptionPlaceholder: "Eleza huduma hii...",
      cancel: "Ghairi",
      create: "Tengeneza Huduma",
      creating: "Inaongeza...",
      lease: "Ukodishaji",
      serviceAdded: "Huduma Imeongezwa",
      serviceAddedMessage: "Huduma imeongezwa kwa mafanikio."
    }
  }

  const t = translations[language]

  // Handle add service
  const handleAddService = async () => {
    if (!currentBusiness?.id) return
    if (!formData.name.trim()) {
      showError('Error', 'Service name is required')
      return
    }

    setAddingService(true)
    
    try {
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: currentBusiness.id,
          serviceType: formData.serviceType,
          name: formData.name.trim(),
          nameSwahili: formData.nameSwahili.trim() || null,
          description: formData.description.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create service')
      }

      showSuccess(t.serviceAdded, t.serviceAddedMessage)
      onServiceAdded()
      onClose()
      
      // Reset form
      setFormData({
        serviceType: 'LEASE',
        name: '',
        nameSwahili: '',
        description: ''
      })
    } catch (error: unknown) {
      console.error('Error creating service:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create service'
      showError('Error', errorMessage)
    } finally {
      setAddingService(false)
    }
  }

  // Handle close and reset form
  const handleClose = () => {
    if (!addingService) {
      setFormData({
        serviceType: 'LEASE',
        name: '',
        nameSwahili: '',
        description: ''
      })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{t.addNewService}</h3>
          <button
            onClick={handleClose}
            disabled={addingService}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Service Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.selectServiceType} *
            </label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              disabled={addingService}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
            >
              <option value="LEASE">{t.lease}</option>
            </select>
          </div>

          {/* Service Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.serviceNameLabel} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={addingService}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              placeholder={t.serviceNamePlaceholder}
            />
          </div>

          {/* Service Name Swahili */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.serviceNameSwahili}
            </label>
            <input
              type="text"
              value={formData.nameSwahili}
              onChange={(e) => setFormData({ ...formData, nameSwahili: e.target.value })}
              disabled={addingService}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              placeholder={t.serviceNameSwahiliPlaceholder}
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.descriptionLabel}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={addingService}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              rows={3}
              placeholder={t.descriptionPlaceholder}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={addingService}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleAddService}
            disabled={addingService || !formData.name.trim()}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {addingService && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{addingService ? t.creating : t.create}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
