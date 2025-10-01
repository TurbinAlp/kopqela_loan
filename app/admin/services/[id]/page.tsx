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
  XMarkIcon,
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
  specifications?: any
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
  const { showError, showSuccess } = useNotifications()
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
  const [addingItem, setAddingItem] = useState(false)
  
  // Item form
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
      addNewItem: "Add New Item",
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
      create: "Create Item",
      creating: "Creating...",
      itemAdded: "Item Added",
      itemAddedMessage: "Item has been added successfully.",
      error: "Error",
      currency: "TZS",
      for: "for",
      minutes: "Minutes",
      hours: "Hours",
      days: "Days",
      weeks: "Weeks",
      months: "Months",
      years: "Years",
      clearSearch: "Clear Search",
      loading: "Loading..."
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
      addNewItem: "Ongeza Kitu Kipya",
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
      create: "Tengeneza Kitu",
      creating: "Inaongeza...",
      itemAdded: "Kitu Kimeongezwa",
      itemAddedMessage: "Kitu kimeongezwa kwa mafanikio.",
      error: "Hitilafu",
      currency: "TSh",
      for: "kwa",
      minutes: "Dakika",
      hours: "Masaa",
      days: "Siku",
      weeks: "Wiki",
      months: "Miezi",
      years: "Miaka",
      clearSearch: "Ondoa Utafutaji",
      loading: "Inapakia..."
    }
  }

  const t = translations[language]

  const durationUnitOptions = [
    { value: 'MINUTES', label: t.minutes },
    { value: 'HOURS', label: t.hours },
    { value: 'DAYS', label: t.days },
    { value: 'WEEKS', label: t.weeks },
    { value: 'MONTHS', label: t.months },
    { value: 'YEARS', label: t.years }
  ]

  const statusOptions = [
    { value: 'AVAILABLE', label: t.available },
    { value: 'RENTED', label: t.rented },
    { value: 'BOOKED', label: t.booked },
    { value: 'MAINTENANCE', label: t.maintenance }
  ]

  // Helper to format duration
  const formatDuration = (value: number, unit: string) => {
    const unitLabel = durationUnitOptions.find(o => o.value === unit)?.label || unit
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
      showError(t.error, 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [serviceId, currentBusiness?.id, showError, t.error])

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

  // Handle add item
  const handleAddItem = async () => {
    if (!serviceId) return
    if (!formData.itemNumber.trim() || !formData.name.trim() || !formData.price || !formData.durationValue) {
      showError(t.error, 'Item number, name, price, and duration are required')
      return
    }

    setAddingItem(true)
    
    try {
      const response = await fetch(`/api/admin/services/${serviceId}/items`, {
        method: 'POST',
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
        throw new Error(data.message || 'Failed to create item')
      }

      showSuccess(t.itemAdded, t.itemAddedMessage)
      fetchData()
      setShowAddModal(false)
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
    } catch (error: any) {
      console.error('Error saving item:', error)
      showError(t.error, error.message || 'Failed to save item')
    } finally {
      setAddingItem(false)
    }
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
                          {t.currency} {Number(item.price).toLocaleString()}
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
                          <span>{statusOptions.find(s => s.value === item.status)?.label}</span>
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

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">{t.addNewItem}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                disabled={addingItem}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Item Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.itemNumberLabel} *
                </label>
                <input
                  type="text"
                  value={formData.itemNumber}
                  onChange={(e) => setFormData({ ...formData, itemNumber: e.target.value })}
                  disabled={addingItem}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  placeholder={t.itemNumberPlaceholder}
                />
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.nameLabel} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={addingItem}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  placeholder={t.namePlaceholder}
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
                  onChange={(e) => setFormData({ ...formData, nameSwahili: e.target.value })}
                  disabled={addingItem}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  placeholder={t.nameSwahiliPlaceholder}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.descriptionLabel}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={addingItem}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  rows={2}
                  placeholder={t.descriptionPlaceholder}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.priceLabel} ({t.currency}) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={addingItem}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  placeholder={t.pricePlaceholder}
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.durationLabel} *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      value={formData.durationValue}
                      onChange={(e) => setFormData({ ...formData, durationValue: e.target.value })}
                      disabled={addingItem}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                      placeholder="15, 30, 45, 1, 2..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{t.durationValueLabel}</p>
                  </div>
                  <div>
                    <select
                      value={formData.durationUnit}
                      onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                      disabled={addingItem}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
                    >
                      {durationUnitOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">{t.durationUnitLabel}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.statusLabel}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceItem['status'] })}
                  disabled={addingItem}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={addingItem}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleAddItem}
                disabled={addingItem || !formData.itemNumber.trim() || !formData.name.trim() || !formData.price || !formData.durationValue}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {addingItem && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{addingItem ? t.creating : t.create}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
