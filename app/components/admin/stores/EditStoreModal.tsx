'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { useBusiness } from '../../../contexts/BusinessContext'

interface Store {
  id: number
  name: string
  nameSwahili?: string
  storeType: string
  address?: string
  city?: string
  region?: string
  phone?: string
  email?: string
  managerId?: number
  isActive: boolean
}

interface BusinessUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
}

interface EditStoreModalProps {
  isOpen: boolean
  onClose: () => void
  onStoreUpdated: () => void
  store: Store | null
  businessUsers: BusinessUser[]
}

export default function EditStoreModal({
  isOpen,
  onClose,
  onStoreUpdated,
  store,
  businessUsers
}: EditStoreModalProps) {
  const { language } = useLanguage()
  const { showSuccess, showError } = useNotifications()
  const { currentBusiness } = useBusiness()

  const [formData, setFormData] = useState({
    name: '',
    nameSwahili: '',
    storeType: 'main_store' as 'main_store' | 'warehouse',
    address: '',
    city: '',
    region: '',
    phone: '',
    email: '',
    managerId: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load store data when modal opens
  useEffect(() => {
    if (isOpen && store) {
      setFormData({
        name: store.name || '',
        nameSwahili: store.nameSwahili || '',
        storeType: store.storeType as 'main_store' | 'warehouse',
        address: store.address || '',
        city: store.city || '',
        region: store.region || '',
        phone: store.phone || '',
        email: store.email || '',
        managerId: store.managerId?.toString() || ''
      })
      setErrors({})
    }
  }, [isOpen, store])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        nameSwahili: '',
        storeType: 'main_store',
        address: '',
        city: '',
        region: '',
        phone: '',
        email: '',
        managerId: ''
      })
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = language === 'en' ? 'Store name is required' : 'Jina la duka linahitajika'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'en' ? 'Invalid email format' : 'Muundo wa barua pepe si sahihi'
    }

    if (formData.phone && !/^[+]?[\d\s\-()]{7,}$/.test(formData.phone)) {
      newErrors.phone = language === 'en' ? 'Invalid phone number' : 'Nambari ya simu si sahihi'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !currentBusiness || !store) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/stores/${store.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          businessId: currentBusiness.id,
          name: formData.name.trim(),
          nameSwahili: formData.nameSwahili.trim() || undefined,
          storeType: formData.storeType,
          address: formData.address.trim() || undefined,
          city: formData.city.trim() || undefined,
          region: formData.region.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          managerId: formData.managerId ? parseInt(formData.managerId) : undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        showSuccess(
          language === 'en' ? 'Store Updated' : 'Duka Limesasishwa',
          language === 'en' ? 'Store updated successfully' : 'Duka limesasishwa kikamilifu'
        )
        onStoreUpdated()
        onClose()
      } else {
        showError(
          language === 'en' ? 'Update Failed' : 'Kusasisha Kumeshindwa',
          data.message || (language === 'en' ? 'Failed to update store' : 'Imeshindwa kusasisha duka')
        )
      }
    } catch (error) {
      console.error('Error updating store:', error)
      showError(
        language === 'en' ? 'Update Failed' : 'Kusasisha imeshindikana',
        language === 'en' ? 'An error occurred while updating the store' : 'Hitilafu imetokea wakati wa kusasisha duka'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const t = {
    en: {
      editStore: 'Edit Store',
      updateStore: 'Update Store',
      cancel: 'Cancel',
      updating: 'Updating...',
      
      // Form fields
      storeName: 'Store Name',
      storeNameEn: 'Store Name (English)',
      storeNameSw: 'Store Name (Swahili)',
      storeType: 'Store Type',
      mainStore: 'Main Store',
      retailStore: 'Retail Store',
      warehouse: 'Warehouse',
      
      // Contact info
      contactInfo: 'Contact Information',
      address: 'Address',
      city: 'City',
      region: 'Region',
      phone: 'Phone Number',
      email: 'Email Address',
      
      // Manager
      manager: 'Store Manager',
      selectManager: 'Select Manager',
      noManager: 'No Manager Assigned',
      
      // Placeholders
      enterStoreName: 'Enter store name',
      enterStoreNameSw: 'Enter Swahili name (optional)',
      enterAddress: 'Enter store address',
      enterCity: 'Enter city',
      enterRegion: 'Enter region',
      enterPhone: 'Enter phone number',
      enterEmail: 'Enter email address'
    },
    sw: {
      editStore: 'Hariri Duka',
      updateStore: 'Sasisha Duka',
      cancel: 'Ghairi',
      updating: 'Inasasisha...',
      
      // Form fields
      storeName: 'Jina la Duka',
      storeNameEn: 'Jina la Duka (Kiingereza)',
      storeNameSw: 'Jina la Duka (Kiswahili)',
      storeType: 'Aina ya Duka',
      mainStore: 'Duka Kuu',
      retailStore: 'Duka la Rejareja',
      warehouse: 'Ghala',
      
      // Contact info
      contactInfo: 'Taarifa za Mawasiliano',
      address: 'Anwani',
      city: 'Jiji',
      region: 'Mkoa',
      phone: 'Nambari ya Simu',
      email: 'Barua Pepe',
      
      // Manager
      manager: 'Meneja wa Duka',
      selectManager: 'Chagua Meneja',
      noManager: 'Hakuna Meneja',
      
      // Placeholders
      enterStoreName: 'Ingiza jina la duka',
      enterStoreNameSw: 'Ingiza jina la Kiswahili (si lazima)',
      enterAddress: 'Ingiza anwani ya duka',
      enterCity: 'Ingiza jiji',
      enterRegion: 'Ingiza mkoa',
      enterPhone: 'Ingiza nambari ya simu',
      enterEmail: 'Ingiza barua pepe'
    }
  }[language]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BuildingStorefrontIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{t.editStore}</h2>
                <p className="text-sm text-gray-600">{store?.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Store Name */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.storeNameEn} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder={t.enterStoreName}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.storeNameSw}
                </label>
                <input
                  type="text"
                  value={formData.nameSwahili}
                  onChange={(e) => handleInputChange('nameSwahili', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t.enterStoreNameSw}
                />
              </div>
            </div>

            {/* Store Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.storeType} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.storeType}
                onChange={(e) => handleInputChange('storeType', e.target.value as 'main_store' | 'warehouse')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="main_store">{t.mainStore}</option>
                <option value="warehouse">{t.warehouse}</option>
              </select>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-gray-600" />
                {t.contactInfo}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.address}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t.enterAddress}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.city}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t.enterCity}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.region}
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t.enterRegion}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder={t.enterPhone}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder={t.enterEmail}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Manager */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                {t.manager}
              </label>
              <select
                value={formData.managerId}
                onChange={(e) => handleInputChange('managerId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t.noManager}</option>
                {businessUsers.map(user => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t.updating}</span>
                  </>
                ) : (
                  <span>{t.updateStore}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
