'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'

interface ServiceItem {
  id: number
  serviceId: number
  itemNumber: string
  name: string
  nameSwahili?: string | null
  description?: string | null
  price: number
  durationValue: number
  durationUnit: string
  status: 'AVAILABLE' | 'RENTED' | 'BOOKED' | 'MAINTENANCE'
  currentRentalStart?: string
  currentRentalEnd?: string
  currentCustomerId?: number
  specifications?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  currentCustomer?: {
    id: number
    fullName: string
    phone: string
    email?: string
  }
}

interface EditServiceItemModalProps {
  isOpen: boolean
  onClose: () => void
  serviceId: number
  item: ServiceItem | null
  onItemUpdated: () => void
}

export default function EditServiceItemModal({
  isOpen,
  onClose,
  serviceId,
  item,
  onItemUpdated
}: EditServiceItemModalProps) {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  
  const [updatingItem, setUpdatingItem] = useState(false)
  const [formData, setFormData] = useState({
    itemNumber: '',
    name: '',
    nameSwahili: '',
    description: '',
    price: '',
    durationValue: '1',
    durationUnit: 'DAYS',
    status: 'AVAILABLE' as ServiceItem['status']
  })

  const translations = {
    en: {
      editItem: "Edit Item",
      itemNumberLabel: "Item Number",
      itemNumberPlaceholder: "e.g., Room-101, T1234ABC",
      nameLabel: "Item Name",
      namePlaceholder: "e.g., Standard Room, Toyota Vitz",
      nameSwahili: "Item Name (Swahili)",
      nameSwahiliPlaceholder: "e.g., Chumba cha Kawaida",
      descriptionLabel: "Description",
      descriptionPlaceholder: "Describe this item...",
      priceLabel: "Price",
      pricePlaceholder: "50000",
      durationLabel: "Duration",
      durationValueLabel: "Value",
      durationUnitLabel: "Unit",
      statusLabel: "Status",
      cancel: "Cancel",
      update: "Update Item",
      updating: "Updating...",
      itemUpdated: "Item Updated",
      itemUpdatedMessage: "Item has been updated successfully.",
      error: "Error",
      currency: "TZS",
      available: "Available",
      rented: "Rented",
      booked: "Booked",
      maintenance: "Maintenance",
      minutes: "Minutes",
      hours: "Hours",
      days: "Days",
      weeks: "Weeks",
      months: "Months",
      years: "Years"
    },
    sw: {
      editItem: "Hariri Kitu",
      itemNumberLabel: "Namba ya Kitu",
      itemNumberPlaceholder: "mf., Room-101, T1234ABC",
      nameLabel: "Jina la Kitu",
      namePlaceholder: "mf., Chumba cha Kawaida, Toyota Vitz",
      nameSwahili: "Jina la Kitu (Kiswahili)",
      nameSwahiliPlaceholder: "mf., Chumba cha Kawaida",
      descriptionLabel: "Maelezo",
      descriptionPlaceholder: "Eleza kitu hiki...",
      priceLabel: "Bei",
      pricePlaceholder: "50000",
      durationLabel: "Muda",
      durationValueLabel: "Kiasi",
      durationUnitLabel: "Kipimo",
      statusLabel: "Hali",
      cancel: "Ghairi",
      update: "Sasisha Kitu",
      updating: "Inasasisha...",
      itemUpdated: "Kitu Kimesasishwa",
      itemUpdatedMessage: "Kitu kimesasishwa kwa mafanikio.",
      error: "Hitilafu",
      currency: "TSh",
      available: "Inapatikana",
      rented: "Imekodishwa",
      booked: "Imehifadhiwa",
      maintenance: "Matengenezo",
      minutes: "Dakika",
      hours: "Masaa",
      days: "Siku",
      weeks: "Wiki",
      months: "Miezi",
      years: "Miaka"
    }
  }

  const t = translations[language]

  // Load item data when modal opens
  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        itemNumber: item.itemNumber,
        name: item.name,
        nameSwahili: item.nameSwahili || '',
        description: item.description || '',
        price: item.price.toString(),
        durationValue: item.durationValue.toString(),
        durationUnit: item.durationUnit,
        status: item.status
      })
    }
  }, [isOpen, item])

  // Handle update item
  const handleUpdateItem = async () => {
    if (!item) return
    if (!formData.itemNumber.trim() || !formData.name.trim() || !formData.price || !formData.durationValue) {
      showError(t.error, 'Item number, name, price, and duration are required')
      return
    }

    setUpdatingItem(true)
    
    try {
      const response = await fetch(`/api/admin/services/${serviceId}/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          durationValue: parseInt(formData.durationValue)
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update item')
      }

      showSuccess(t.itemUpdated, t.itemUpdatedMessage)
      onItemUpdated()
      handleClose()
    } catch (error: unknown) {
      console.error('Error updating item:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item'
      showError(t.error, errorMessage)
    } finally {
      setUpdatingItem(false)
    }
  }

  const handleClose = () => {
    setFormData({
      itemNumber: '',
      name: '',
      nameSwahili: '',
      description: '',
      price: '',
      durationValue: '1',
      durationUnit: 'DAYS',
      status: 'AVAILABLE'
    })
    onClose()
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-xl font-bold text-gray-900">{t.editItem}</h3>
          <button
            onClick={handleClose}
            disabled={updatingItem}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Item Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.itemNumberLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.itemNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, itemNumber: e.target.value }))}
              placeholder={t.itemNumberPlaceholder}
              disabled={updatingItem}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.nameLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t.namePlaceholder}
              disabled={updatingItem}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Item Name Swahili */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.nameSwahili}
            </label>
            <input
              type="text"
              value={formData.nameSwahili}
              onChange={(e) => setFormData(prev => ({ ...prev, nameSwahili: e.target.value }))}
              placeholder={t.nameSwahiliPlaceholder}
              disabled={updatingItem}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
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
              disabled={updatingItem}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.priceLabel} ({t.currency}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder={t.pricePlaceholder}
              disabled={updatingItem}
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.durationLabel} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {t.durationValueLabel}
                </label>
                <input
                  type="number"
                  value={formData.durationValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationValue: e.target.value }))}
                  disabled={updatingItem}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {t.durationUnitLabel}
                </label>
                <select
                  value={formData.durationUnit}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationUnit: e.target.value }))}
                  disabled={updatingItem}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
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
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.statusLabel} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ServiceItem['status'] }))}
              disabled={updatingItem}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="AVAILABLE">{t.available}</option>
              <option value="RENTED">{t.rented}</option>
              <option value="BOOKED">{t.booked}</option>
              <option value="MAINTENANCE">{t.maintenance}</option>
            </select>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={updatingItem}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleUpdateItem}
            disabled={updatingItem || !formData.itemNumber.trim() || !formData.name.trim() || !formData.price || !formData.durationValue}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {updatingItem && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{updatingItem ? t.updating : t.update}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
