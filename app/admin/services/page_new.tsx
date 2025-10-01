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
  basePrice?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ServiceItemForm {
  id: string
  name: string
  nameSwahili: string
  description: string
  price: string
  pricingUnit: string
  quantity: number
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
  const [serviceType, setServiceType] = useState('LEASE')
  
  // Service items list
  const [serviceItems, setServiceItems] = useState<ServiceItemForm[]>([])
  
  // Current item being added
  const [currentItem, setCurrentItem] = useState({
    name: '',
    nameSwahili: '',
    description: '',
    price: '',
    pricingUnit: 'PER_DAY',
    quantity: 1
  })

  const translations = {
    en: {
      services: "Services",
      addService: "Add Service",
      searchServices: "Search services...",
      serviceName: "Service Name",
      type: "Type",
      description: "Description",
      basePrice: "Base Price",
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
      currency: "TZS",
      lease: "Lease",
      addingService: "Adding Service...",
      selectServiceType: "Select Service Type",
      cancel: "Cancel",
      add: "Add",
      serviceAdded: "Service Added Successfully",
      serviceAddedMessage: "The service has been added with all items.",
      error: "Error",
      loadingServices: "Loading Services",
      loadingMessage: "Please wait while we fetch your services...",
      // New modal strings
      serviceItems: "Service Items",
      addServiceAndItems: "Add Service & Items",
      addItemToList: "Add Item to List",
      itemName: "Item Name",
      itemNameSwahili: "Item Name (Swahili)",
      price: "Price",
      pricingUnit: "Pricing Unit",
      quantity: "Quantity",
      removeItem: "Remove",
      noItemsAdded: "No items added yet. Add items to this service.",
      saveService: "Save Service",
      perMinute: "Per Minute",
      perHour: "Per Hour",
      perDay: "Per Day",
      perWeek: "Per Week",
      perMonth: "Per Month",
      perYear: "Per Year",
      atLeastOneItem: "Please add at least one item to the service"
    },
    sw: {
      services: "Huduma",
      addService: "Ongeza Huduma",
      searchServices: "Tafuta huduma...",
      serviceName: "Jina la Huduma",
      type: "Aina",
      description: "Maelezo",
      basePrice: "Bei ya Msingi",
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
      currency: "TSh",
      lease: "Ukodishaji",
      addingService: "Inaongeza Huduma...",
      selectServiceType: "Chagua Aina ya Huduma",
      cancel: "Ghairi",
      add: "Ongeza",
      serviceAdded: "Huduma Imeongezwa Kwa Mafanikio",
      serviceAddedMessage: "Huduma imeongezwa pamoja na vitu vyote.",
      error: "Hitilafu",
      loadingServices: "Inapakia Huduma",
      loadingMessage: "Tafadhali subiri tunapokusanya huduma zako...",
      // New modal strings
      serviceItems: "Vitu vya Huduma",
      addServiceAndItems: "Ongeza Huduma na Vitu",
      addItemToList: "Ongeza Kitu Kwenye Orodha",
      itemName: "Jina la Kitu",
      itemNameSwahili: "Jina la Kitu (Kiswahili)",
      price: "Bei",
      pricingUnit: "Kipimo cha Bei",
      quantity: "Idadi",
      removeItem: "Ondoa",
      noItemsAdded: "Hakuna vitu vilivyoongezwa. Ongeza vitu kwenye huduma hii.",
      saveService: "Hifadhi Huduma",
      perMinute: "Kwa Dakika",
      perHour: "Kwa Saa",
      perDay: "Kwa Siku",
      perWeek: "Kwa Wiki",
      perMonth: "Kwa Mwezi",
      perYear: "Kwa Mwaka",
      atLeastOneItem: "Tafadhali ongeza angalau kitu kimoja kwenye huduma"
    }
  }

  const t = translations[language]

  // Pricing unit options
  const pricingUnitOptions = [
    { value: 'PER_MINUTE', label: t.perMinute },
    { value: 'PER_HOUR', label: t.perHour },
    { value: 'PER_DAY', label: t.perDay },
    { value: 'PER_WEEK', label: t.perWeek },
    { value: 'PER_MONTH', label: t.perMonth },
    { value: 'PER_YEAR', label: t.perYear }
  ]

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

  // Add item to list
  const handleAddItemToList = () => {
    if (!currentItem.name || !currentItem.price) {
      showError(t.error, 'Please fill item name and price')
      return
    }

    const newItem: ServiceItemForm = {
      id: Date.now().toString(),
      ...currentItem
    }

    setServiceItems([...serviceItems, newItem])
    
    // Reset form
    setCurrentItem({
      name: '',
      nameSwahili: '',
      description: '',
      price: '',
      pricingUnit: 'PER_DAY',
      quantity: 1
    })
  }

  // Remove item from list
  const handleRemoveItem = (id: string) => {
    setServiceItems(serviceItems.filter(item => item.id !== id))
  }

  // Save service with items
  const handleSaveService = async () => {
    if (!currentBusiness?.id) return

    if (serviceItems.length === 0) {
      showError(t.error, t.atLeastOneItem)
      return
    }

    setAddingService(true)
    
    try {
      // First create the service
      const serviceResponse = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: currentBusiness.id,
          serviceType,
          name: serviceType === 'LEASE' ? (language === 'sw' ? 'Huduma ya Ukodishaji' : 'Lease Service') : 'Service',
          nameSwahili: 'Huduma ya Ukodishaji',
          description: language === 'sw' ? 'Kodisha bidhaa kwa wateja kwa masharti rahisi ya malipo' : 'Lease items to customers with flexible payment terms',
          isActive: true
        })
      })

      const serviceData = await serviceResponse.json()

      if (!serviceResponse.ok || !serviceData.success) {
        throw new Error(serviceData.message || 'Failed to create service')
      }

      const serviceId = serviceData.data.id

      // Then create all items
      const itemPromises = serviceItems.map(item =>
        fetch(`/api/admin/services/${serviceId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: item.name,
            nameSwahili: item.nameSwahili,
            description: item.description,
            price: item.price,
            pricingUnit: item.pricingUnit,
            quantity: item.quantity
          })
        })
      )

      await Promise.all(itemPromises)

      showSuccess(t.serviceAdded, t.serviceAddedMessage)
      fetchServices()
      setShowAddModal(false)
      setServiceItems([])
      setServiceType('LEASE')
    } catch (error) {
      console.error('Error saving service:', error)
      showError(t.error, 'Network error: Failed to save service')
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
              {language === 'sw' ? 'Ondoa Utafutaji' : 'Clear Search'}
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
                  <th className="text-left py-3 px-6 font-bold text-white text-sm">{t.description}</th>
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
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">{service.description || '—'}</span>
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

      {/* Add Service & Items Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{t.addServiceAndItems}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                disabled={addingService}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Service Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.selectServiceType} *
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  disabled={addingService}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
                >
                  <option value="LEASE">{t.lease}</option>
                </select>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* Service Items Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{t.serviceItems}</h4>

                {/* Item Form */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.itemName} *
                      </label>
                      <input
                        type="text"
                        value={currentItem.name}
                        onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                        disabled={addingService}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., Standard Room, Toyota Vitz"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.itemNameSwahili}
                      </label>
                      <input
                        type="text"
                        value={currentItem.nameSwahili}
                        onChange={(e) => setCurrentItem({ ...currentItem, nameSwahili: e.target.value })}
                        disabled={addingService}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., Chumba cha Kawaida"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.description}
                    </label>
                    <textarea
                      value={currentItem.description}
                      onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                      disabled={addingService}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      rows={2}
                      placeholder="e.g., Single bed, AC, TV"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.price} ({t.currency}) *
                      </label>
                      <input
                        type="number"
                        value={currentItem.price}
                        onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
                        disabled={addingService}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="50000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.pricingUnit} *
                      </label>
                      <select
                        value={currentItem.pricingUnit}
                        onChange={(e) => setCurrentItem({ ...currentItem, pricingUnit: e.target.value })}
                        disabled={addingService}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        {pricingUnitOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.quantity}
                      </label>
                      <input
                        type="number"
                        value={currentItem.quantity}
                        onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                        disabled={addingService}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        min="1"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddItemToList}
                    disabled={addingService}
                    className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>{t.addItemToList}</span>
                  </button>
                </div>

                {/* Items List */}
                {serviceItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <p>{t.noItemsAdded}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {serviceItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {t.currency} {Number(item.price).toLocaleString()} / {pricingUnitOptions.find(o => o.value === item.pricingUnit)?.label} • {t.quantity}: {item.quantity}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={addingService}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                onClick={handleSaveService}
                disabled={addingService || serviceItems.length === 0}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {addingService && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{addingService ? t.addingService : t.saveService}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
