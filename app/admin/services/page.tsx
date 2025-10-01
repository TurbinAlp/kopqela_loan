'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBusiness } from '../../contexts/BusinessContext'
import { useRequireAdminAuth } from '../../hooks/useRequireAuth'
import { hasPermissionSync, useBusinessPermissions } from '../../hooks/usePermissions'
import { useSession } from 'next-auth/react'
import Spinner from '../../components/ui/Spinner'
import { useNotifications } from '../../contexts/NotificationContext'
import LoadingLink from '../../components/ui/LoadingLink'

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

export default function ServicesPage() {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const { isLoading: authLoading } = useRequireAdminAuth()
  const { currentBusiness } = useBusiness()
  const { data: session } = useSession()
  
  const { permissions: businessPermissions } = useBusinessPermissions(currentBusiness?.id)
  
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addingService, setAddingService] = useState(false)
  
  // Service form
  const [formData, setFormData] = useState({
    serviceType: 'LEASE',
    name: '',
    nameSwahili: '',
    description: ''
  })

  const translations = {
    en: {
      services: "Services",
      addService: "Add Service",
      searchServices: "Search services...",
      serviceName: "Service Name",
      type: "Type",
      items: "Items",
      status: "Status",
      actions: "Actions",
      active: "Active",
      inactive: "Inactive",
      viewItems: "View Items",
      edit: "Edit",
      delete: "Delete",
      noServices: "No Services Yet",
      noServicesMessage: "Get started by adding your first service.",
      noServicesFound: "No Services Found",
      noServicesFoundMessage: "Try adjusting your search.",
      lease: "Lease",
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
      serviceAdded: "Service Added",
      serviceAddedMessage: "Service has been created successfully.",
      error: "Error",
      loadingServices: "Loading Services",
      clearSearch: "Clear Search"
    },
    sw: {
      services: "Huduma",
      addService: "Ongeza Huduma",
      searchServices: "Tafuta huduma...",
      serviceName: "Jina la Huduma",
      type: "Aina",
      items: "Vitu",
      status: "Hali",
      actions: "Vitendo",
      active: "Inatumika",
      inactive: "Haitumiki",
      viewItems: "Angalia Vitu",
      edit: "Hariri",
      delete: "Futa",
      noServices: "Hakuna Huduma",
      noServicesMessage: "Anza kwa kuongeza huduma yako ya kwanza.",
      noServicesFound: "Hakuna Huduma Zilizopatikana",
      noServicesFoundMessage: "Jaribu kubadilisha utafutaji wako.",
      lease: "Ukodishaji",
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
      serviceAdded: "Huduma Imeongezwa",
      serviceAddedMessage: "Huduma imeongezwa kwa mafanikio.",
      error: "Hitilafu",
      loadingServices: "Inapakia Huduma",
      clearSearch: "Ondoa Utafutaji"
    }
  }

  const t = translations[language]

  // Fetch services
  const fetchServices = useCallback(async () => {
    if (!currentBusiness?.id) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/services?businessId=${currentBusiness.id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error('API request failed')
      }

      setServices(data.data?.services || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      showError(t.error, 'Failed to load services data')
    } finally {
      setIsLoading(false)
    }
  }, [currentBusiness?.id, showError, t.error])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (currentBusiness?.id) {
      fetchServices()
    }
  }, [currentBusiness?.id, fetchServices])

  // Filter services
  const filteredServices = services.filter(service => {
    const name = service.name || ''
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Handle add service
  const handleAddService = async () => {
    if (!currentBusiness?.id) return
    if (!formData.name.trim()) {
      showError(t.error, 'Service name is required')
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
          ...formData
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create service')
      }

      showSuccess(t.serviceAdded, t.serviceAddedMessage)
      fetchServices()
      setShowAddModal(false)
      setFormData({
        serviceType: 'LEASE',
        name: '',
        nameSwahili: '',
        description: ''
      })
    } catch (error) {
      console.error('Error saving service:', error)
      showError(t.error, 'Failed to save service')
    } finally {
      setAddingService(false)
    }
  }

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="teal" className="mx-auto mb-4" />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Action Bar */}
      <motion.div className="mb-6">
        <div className="flex items-center justify-end space-x-3">
          {hasPermissionSync(session, 'services.create', businessPermissions) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              <span>{t.addService}</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Search */}
      <motion.div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchServices}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
          />
        </div>
      </motion.div>

      {/* Services Display */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <Spinner size="lg" color="teal" className="mx-auto" />
        </div>
      ) : filteredServices.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
        >
          <WrenchScrewdriverIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? t.noServicesFound : t.noServices}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? t.noServicesFoundMessage : t.noServicesMessage}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors mr-3 text-sm font-medium"
            >
              {t.clearSearch}
            </button>
          )}
          {!searchQuery && hasPermissionSync(session, 'services.create', businessPermissions) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              {t.addService}
            </button>
          )}
        </motion.div>
      ) : (
        /* Services Table */
        <motion.div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-teal-600 border-b border-teal-700">
                <tr>
                  <th className="text-left py-3 px-6 font-bold text-white text-sm">{t.serviceName}</th>
                  <th className="text-left py-3 px-6 font-bold text-white text-sm">{t.type}</th>
                  <th className="text-center py-3 px-6 font-bold text-white text-sm">{t.items}</th>
                  <th className="text-left py-3 px-6 font-bold text-white text-sm">{t.status}</th>
                  <th className="text-center py-3 px-6 font-bold text-white text-sm">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service, index) => (
                  <motion.tr
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <WrenchScrewdriverIcon className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {language === 'sw' && service.nameSwahili ? service.nameSwahili : service.name}
                          </p>
                          <p className="text-xs text-gray-500">{service.createdAt.split('T')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {service.serviceType === 'LEASE' ? t.lease : service.serviceType}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold bg-gray-100 text-gray-700 rounded-full">
                        {service._count.serviceItems}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`flex items-center space-x-1 text-sm font-medium ${
                        service.isActive ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {service.isActive ? (
                          <>
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>{t.active}</span>
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="w-4 h-4" />
                            <span>{t.inactive}</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <LoadingLink href={`/admin/services/${service.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t.viewItems}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </motion.button>
                        </LoadingLink>
                        {hasPermissionSync(session, 'services.update', businessPermissions) && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title={t.edit}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </motion.button>
                        )}
                        {hasPermissionSync(session, 'services.delete', businessPermissions) && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t.delete}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
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
                onClick={() => setShowAddModal(false)}
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
                onClick={() => setShowAddModal(false)}
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
      )}
    </div>
  )
}
