'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  WrenchIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useBusiness } from '../../../contexts/BusinessContext'
import { useRequireAdminAuth } from '../../../hooks/useRequireAuth'
import { hasPermissionSync, useBusinessPermissions } from '../../../hooks/usePermissions'
import { useSession } from 'next-auth/react'
import Spinner from '../../../components/ui/Spinner'
import { useNotifications } from '../../../contexts/NotificationContext'
import AddServiceItemModal from '../../../components/admin/services/AddServiceItemModal'
import EditServiceItemModal from '../../../components/admin/services/EditServiceItemModal'
import DeleteServiceItemModal from '../../../components/admin/services/DeleteServiceItemModal'

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

interface Service {
  id: number
  name: string
  nameSwahili?: string
  serviceType: string
  description?: string
}

export default function ServiceItemsPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLanguage()
  const { showError } = useNotifications()
  const { isLoading: authLoading } = useRequireAdminAuth()
  const { currentBusiness } = useBusiness()
  const { data: session } = useSession()
  
  const { permissions: businessPermissions } = useBusinessPermissions(currentBusiness?.id)
  
  const [service, setService] = useState<Service | null>(null)
  const [items, setItems] = useState<ServiceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingItem, setDeletingItem] = useState<ServiceItem | null>(null)

  const serviceId = params.id ? parseInt(params.id as string) : null

  const translations = {
    en: {
      backToServices: "Back to Services",
      serviceItems: "Service Items",
      addItem: "Add Item",
      searchItems: "Search by item number or name...",
      itemNumber: "Item #",
      itemName: "Name",
      price: "Price",
      status: "Status",
      actions: "Actions",
      available: "Available",
      rented: "Rented",
      booked: "Booked",
      maintenance: "Maintenance",
      rentedBy: "Rented by",
      until: "until",
      edit: "Edit",
      delete: "Delete",
      noItems: "No Items Yet",
      noItemsMessage: "Start by adding items to this service.",
      noItemsFound: "No Items Found",
      noItemsFoundMessage: "Try adjusting your search.",
      for: "for",
      clearSearch: "Clear Search",
      loading: "Loading...",
      cannotDeleteRented: "Cannot delete a rented item"
    },
    sw: {
      backToServices: "Rudi kwa Huduma",
      serviceItems: "Vitu vya Huduma",
      addItem: "Ongeza Kitu",
      searchItems: "Tafuta kwa namba au jina...",
      itemNumber: "Namba",
      itemName: "Jina",
      price: "Bei",
      status: "Hali",
      actions: "Vitendo",
      available: "Inapatikana",
      rented: "Imekodishwa",
      booked: "Imehifadhiwa",
      maintenance: "Matengenezo",
      rentedBy: "Imekodishwa na",
      until: "hadi",
      edit: "Hariri",
      delete: "Futa",
      noItems: "Hakuna Vitu",
      noItemsMessage: "Anza kwa kuongeza vitu kwenye huduma hii.",
      noItemsFound: "Hakuna Vitu Vilivyopatikana",
      noItemsFoundMessage: "Jaribu kubadilisha utafutaji wako.",
      for: "kwa",
      clearSearch: "Ondoa Utafutaji",
      loading: "Inapakia...",
      cannotDeleteRented: "Haiwezi kufuta kitu kilichokodishwa"
    }
  }

  const t = translations[language]

  // Helper to format duration
  const formatDuration = (value: number, unit: string) => {
    const unitLabels: Record<string, string> = {
      'MINUTES': language === 'sw' ? 'Dakika' : 'Minutes',
      'HOURS': language === 'sw' ? 'Masaa' : 'Hours', 
      'DAYS': language === 'sw' ? 'Siku' : 'Days',
      'WEEKS': language === 'sw' ? 'Wiki' : 'Weeks',
      'MONTHS': language === 'sw' ? 'Miezi' : 'Months',
      'YEARS': language === 'sw' ? 'Miaka' : 'Years'
    }
    const unitLabel = unitLabels[unit] || unit
    return `${value} ${unitLabel}`
  }

  // Fetch service and items
  const fetchData = useCallback(async () => {
    if (!serviceId) return

    setIsLoading(true)
    try {
      // Fetch service details
      const serviceResponse = await fetch(`/api/admin/services?businessId=${currentBusiness?.id}`)
      const serviceData = await serviceResponse.json()
      
      if (serviceData.success) {
        const foundService = serviceData.data.services.find((s: Service) => s.id === serviceId)
        if (foundService) {
          setService(foundService)
        }
      }

      // Fetch items
      const itemsResponse = await fetch(`/api/admin/services/${serviceId}/items`)
      const itemsData = await itemsResponse.json()

      if (itemsData.success) {
        setItems(itemsData.data.items || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      showError('Error', 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [serviceId, currentBusiness?.id, showError])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (serviceId && currentBusiness?.id) {
      fetchData()
    }
  }, [serviceId, currentBusiness?.id, fetchData])

  // Filter items
  const filteredItems = items.filter(item => {
    const searchLower = searchQuery.toLowerCase()
    return (
      item.itemNumber.toLowerCase().includes(searchLower) ||
      item.name.toLowerCase().includes(searchLower)
    )
  })

  // Handle edit item
  const handleEditItem = (item: ServiceItem) => {
    setEditingItem(item)
    setShowEditModal(true)
  }

  // Handle delete item
  const handleDeleteItem = (item: ServiceItem) => {
    if (item.status === 'RENTED') {
      showError('Error', t.cannotDeleteRented)
      return
    }
    setDeletingItem(item)
    setShowDeleteModal(true)
  }


  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700'
      case 'RENTED':
        return 'bg-red-100 text-red-700'
      case 'BOOKED':
        return 'bg-yellow-100 text-yellow-700'
      case 'MAINTENANCE':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'RENTED':
        return <XCircleIcon className="w-4 h-4" />
      case 'BOOKED':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'MAINTENANCE':
        return <WrenchIcon className="w-4 h-4" />
      default:
        return null
    }
  }

  // Get status label
  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      'AVAILABLE': language === 'sw' ? 'Inapatikana' : 'Available',
      'RENTED': language === 'sw' ? 'Imekodishwa' : 'Rented',
      'BOOKED': language === 'sw' ? 'Imehifadhiwa' : 'Booked',
      'MAINTENANCE': language === 'sw' ? 'Matengenezo' : 'Maintenance'
    }
    return statusLabels[status] || status
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
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>{t.backToServices}</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {service ? (language === 'sw' && service.nameSwahili ? service.nameSwahili : service.name) : t.serviceItems}
            </h1>
            {service?.description && (
              <p className="text-gray-600 mt-1">{service.description}</p>
            )}
          </div>
          {hasPermissionSync(session, 'services.create', businessPermissions) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              <span>{t.addItem}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <motion.div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchItems}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
          />
        </div>
      </motion.div>

      {/* Items Display */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <Spinner size="lg" color="teal" className="mx-auto" />
          <p className="text-gray-600 mt-4">{t.loading}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
        >
          <CheckCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? t.noItemsFound : t.noItems}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? t.noItemsFoundMessage : t.noItemsMessage}
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
              {t.addItem}
            </button>
          )}
        </motion.div>
      ) : (
        /* Items Table */
        <motion.div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-teal-600 border-b border-teal-700">
                <tr>
                  <th className="text-left py-3 px-6 font-bold text-white text-sm">{t.itemNumber}</th>
                  <th className="text-left py-3 px-6 font-bold text-white text-sm">{t.itemName}</th>
                  <th className="text-right py-3 px-6 font-bold text-white text-sm">{t.price}</th>
                  <th className="text-left py-3 px-6 font-bold text-white text-sm">{t.status}</th>
                  <th className="text-center py-3 px-6 font-bold text-white text-sm">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-mono font-bold text-gray-900">{item.itemNumber}</p>
                        <p className="text-xs text-gray-500">{item.createdAt.split('T')[0]}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">
                          {language === 'sw' && item.nameSwahili ? item.nameSwahili : item.name}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-500">{item.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {language === 'sw' ? 'TSh' : 'TZS'} {Number(item.price).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t.for} {formatDuration(item.durationValue, item.durationUnit)}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span>{getStatusLabel(item.status)}</span>
                        </span>
                        {item.status === 'RENTED' && item.currentCustomer && (
                          <div className="mt-1 text-xs text-gray-600">
                            <p>{t.rentedBy}: {item.currentCustomer.fullName}</p>
                            {item.currentRentalEnd && (
                              <p>{t.until}: {new Date(item.currentRentalEnd).toLocaleString()}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        {hasPermissionSync(session, 'services.update', businessPermissions) && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditItem(item)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title={t.edit}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </motion.button>
                        )}
                        {hasPermissionSync(session, 'services.delete', businessPermissions) && item.status !== 'RENTED' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteItem(item)}
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

      {/* Modals */}
      <AddServiceItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        serviceId={serviceId!}
        onItemAdded={fetchData}
      />

      <EditServiceItemModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingItem(null)
        }}
        serviceId={serviceId!}
        item={editingItem}
        onItemUpdated={fetchData}
      />

      <DeleteServiceItemModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingItem(null)
        }}
        serviceId={serviceId!}
        item={deletingItem}
        onItemDeleted={fetchData}
      />
    </div>
  )
}
