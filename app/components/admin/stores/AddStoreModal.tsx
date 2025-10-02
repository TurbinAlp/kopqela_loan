'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { useBusiness } from '../../../contexts/BusinessContext'

interface AddStoreModalProps {
  isOpen: boolean
  onClose: () => void
  onStoreAdded: () => void
  businessUsers?: Array<{
    id: number
    user: {
      id: number
      firstName: string
      lastName: string
      email: string
    }
    role: string
  }>
}

interface StoreFormData {
  name: string
  nameSwahili: string
  storeType: 'main_store' | 'retail_store' | 'warehouse'
  address: string
  city: string
  region: string
  phone: string
  email: string
  managerId: number | null
}

export default function AddStoreModal({
  isOpen,
  onClose,
  onStoreAdded,
  businessUsers = []
}: AddStoreModalProps) {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const { currentBusiness } = useBusiness()

  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    nameSwahili: '',
    storeType: 'retail_store',
    address: '',
    city: '',
    region: '',
    phone: '',
    email: '',
    managerId: null
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const translations = {
    en: {
      title: 'Add New Store',
      subtitle: 'Create a new store location for your business',
      basicInfo: 'Basic Information',
      storeName: 'Store Name',
      storeNameSwahili: 'Store Name (Swahili)',
      storeType: 'Store Type',
      mainStore: 'Main Store',
      retailStore: 'Retail Store',
      warehouse: 'Warehouse',
      locationInfo: 'Location Information',
      address: 'Address',
      city: 'City',
      region: 'Region',
      contactInfo: 'Contact Information',
      phone: 'Phone Number',
      email: 'Email Address',
      management: 'Management',
      manager: 'Store Manager',
      selectManager: 'Select a manager',
      noManager: 'No manager assigned',
      cancel: 'Cancel',
      addStore: 'Add Store',
      adding: 'Adding...',
      storeAdded: 'Store added successfully',
      errorAdding: 'Failed to add store',
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address'
    },
    sw: {
      title: 'Ongeza Duka Jipya',
      subtitle: 'Unda mahali mapya pa duka kwa biashara yako',
      basicInfo: 'Taarifa za Msingi',
      storeName: 'Jina la Duka',
      storeNameSwahili: 'Jina la Duka (Kiswahili)',
      storeType: 'Aina ya Duka',
      mainStore: 'Duka Kuu',
      retailStore: 'Duka la Rejareja',
      warehouse: 'Ghala',
      locationInfo: 'Taarifa za Mahali',
      address: 'Anwani',
      city: 'Jiji',
      region: 'Mkoa',
      contactInfo: 'Taarifa za Mawasiliano',
      phone: 'Namba ya Simu',
      email: 'Barua Pepe',
      management: 'Uongozi',
      manager: 'Meneja wa Duka',
      selectManager: 'Chagua meneja',
      noManager: 'Hakuna meneja',
      cancel: 'Ghairi',
      addStore: 'Ongeza Duka',
      adding: 'Inaongeza...',
      storeAdded: 'Duka limeongezwa kikamilifu',
      errorAdding: 'Imeshindwa kuongeza duka',
      required: 'Sehemu hii inahitajika',
      invalidEmail: 'Tafadhali ingiza barua pepe sahihi'
    }
  }

  const t = translations[language]

  const handleInputChange = (field: keyof StoreFormData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showError(t.title, t.required)
      return false
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showError(t.title, t.invalidEmail)
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !currentBusiness) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: currentBusiness.id,
          ...formData,
          managerId: formData.managerId || undefined
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        showSuccess(t.title, t.storeAdded)
        onStoreAdded()
        onClose()
        // Reset form
        setFormData({
          name: '',
          nameSwahili: '',
          storeType: 'retail_store',
          address: '',
          city: '',
          region: '',
          phone: '',
          email: '',
          managerId: null
        })
      } else {
        throw new Error(result.message || t.errorAdding)
      }
    } catch (error) {
      console.error('Error adding store:', error)
      showError(t.title, error instanceof Error ? error.message : t.errorAdding)
    } finally {
      setIsSubmitting(false)
    }
  }

  const storeTypeOptions = [
    { value: 'main_store', label: t.mainStore },
    { value: 'retail_store', label: t.retailStore },
    { value: 'warehouse', label: t.warehouse }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{t.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{t.subtitle}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <BuildingStorefrontIcon className="w-5 h-5 mr-2 text-teal-600" />
                  {t.basicInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.storeName} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter store name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.storeNameSwahili}
                    </label>
                    <input
                      type="text"
                      value={formData.nameSwahili}
                      onChange={(e) => handleInputChange('nameSwahili', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Ingiza jina la duka"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.storeType}
                    </label>
                    <select
                      value={formData.storeType}
                      onChange={(e) => handleInputChange('storeType', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {storeTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2 text-teal-600" />
                  {t.locationInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.address}
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter store address"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter city"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter region"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-2 text-teal-600" />
                  {t.contactInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.phone}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="+255 XXX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="store@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Management */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-teal-600" />
                  {t.management}
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.manager}
                  </label>
                  <select
                    value={formData.managerId || ''}
                    onChange={(e) => handleInputChange('managerId', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">{t.noManager}</option>
                    {businessUsers
                      .filter(bu => ['ADMIN', 'MANAGER', 'CASHIER'].includes(bu.role))
                      .map(businessUser => (
                        <option key={businessUser.user.id} value={businessUser.user.id}>
                          {businessUser.user.firstName} {businessUser.user.lastName} ({businessUser.role})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t.adding}
                    </>
                  ) : (
                    t.addStore
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
