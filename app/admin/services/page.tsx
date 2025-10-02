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
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBusiness } from '../../contexts/BusinessContext'
import { useRequireAdminAuth } from '../../hooks/useRequireAuth'
import { hasPermissionSync, useBusinessPermissions } from '../../hooks/usePermissions'
import { useSession } from 'next-auth/react'
import Spinner from '../../components/ui/Spinner'
import { useNotifications } from '../../contexts/NotificationContext'
import LoadingLink from '../../components/ui/LoadingLink'
import EditServiceModal from '../../components/admin/services/EditServiceModal'
import DeleteServiceModal from '../../components/admin/services/DeleteServiceModal'
import AddServiceModal from '../../components/admin/services/AddServiceModal'

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
  const { showError } = useNotifications()
  const { isLoading: authLoading } = useRequireAdminAuth()
  const { currentBusiness } = useBusiness()
  const { data: session } = useSession()
  
  const { permissions: businessPermissions } = useBusinessPermissions(currentBusiness?.id)
  
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingService, setDeletingService] = useState<Service | null>(null)
  

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
      error: "Error",
      loadingServices: "Loading Services",
      clearSearch: "Clear Search",
      editService: "Edit Service",
      updateService: "Update Service",
      updating: "Updating...",
      serviceUpdated: "Service Updated",
      serviceUpdatedMessage: "Service has been updated successfully.",
      lease: "Lease",
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
      error: "Hitilafu",
      loadingServices: "Inapakia Huduma",
      clearSearch: "Ondoa Utafutaji",
      editService: "Hariri Huduma",
      updateService: "Sasisha Huduma",
      updating: "Inasasisha...",
      serviceUpdated: "Huduma Imesasishwa",
      serviceUpdatedMessage: "Huduma imesasishwa kwa mafanikio.",
      lease: "Ukodishaji"
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

  // Handle edit service
  const handleEditService = (service: Service) => {
    setEditingService(service)
    setShowEditModal(true)
  }


  // Handle delete service
  const handleDeleteService = (service: Service) => {
    setDeletingService(service)
    setShowDeleteModal(true)
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
                            onClick={() => handleEditService(service)}
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
                            onClick={() => handleDeleteService(service)}
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
      <AddServiceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onServiceAdded={fetchServices}
      />

      {/* Edit Service Modal */}
      <EditServiceModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingService(null)
        }}
        service={editingService}
        onServiceUpdated={fetchServices}
      />

      {/* Delete Service Modal */}
      <DeleteServiceModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingService(null)
        }}
        service={deletingService}
        onServiceDeleted={fetchServices}
      />
    </div>
  )
}
