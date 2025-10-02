'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  BuildingStorefrontIcon,
  PlusIcon,
  MapPinIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { useBusiness } from '../../../contexts/BusinessContext'
import AddStoreModal from './AddStoreModal'
import EditStoreModal from './EditStoreModal'
import StoreTransferModal from './StoreTransferModal'

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
  manager?: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
  _count: {
    inventory: number
  }
}

interface BusinessUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
}

interface MultiStoreSettingsProps {
  isMultiStoreEnabled: boolean
  onToggleMultiStore: (enabled: boolean) => void
}

export default function MultiStoreSettings({
  isMultiStoreEnabled,
  onToggleMultiStore
}: MultiStoreSettingsProps) {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const { currentBusiness } = useBusiness()

  const [stores, setStores] = useState<Store[]>([])
  const [businessUsers, setBusinessUsers] = useState<BusinessUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const translations = {
    en: {
      title: 'Multi-Store Management',
      subtitle: 'Manage multiple store locations for your business',
      enableMultiStore: 'Enable Multi-Store',
      disableMultiStore: 'Disable Multi-Store',
      multiStoreDescription: 'Enable this feature to manage multiple store locations, track inventory separately, and assign managers to different stores.',
      addStore: 'Add New Store',
      transferProducts: 'Transfer Products',
      noStores: 'No stores configured',
      noStoresDescription: 'Add your first store location to start managing multiple stores.',
      storeName: 'Store Name',
      storeType: 'Type',
      location: 'Location',
      manager: 'Manager',
      inventory: 'Inventory Items',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      inactive: 'Inactive',
      mainStore: 'Main Store',
      warehouse: 'Warehouse',
      noManager: 'No manager',
      viewStore: 'View store details',
      editStore: 'Edit store',
      deleteStore: 'Delete store',
      confirmDelete: 'Are you sure you want to delete this store?',
      deleteMessage: 'Are you sure you want to delete this store? This action cannot be undone.',
      delete: 'Delete',
      cancel: 'Cancel',
      deleteWarning: 'This action cannot be undone.',
      storeDeleted: 'Store deleted successfully',
      errorDeleting: 'Failed to delete store',
      errorLoading: 'Failed to load stores'
    },
    sw: {
      title: 'Usimamizi wa Maduka Mengi',
      subtitle: 'Simamia mahali mbalimbali pa maduka kwa biashara yako',
      enableMultiStore: 'Washa Maduka Mengi',
      disableMultiStore: 'Zima Maduka Mengi',
      multiStoreDescription: 'Washa kipengele hiki ili kusimamia mahali mbalimbali pa maduka, kufuatilia hisa kwa kila duka, na kuweka meneja kwa maduka tofauti.',
      addStore: 'Ongeza Duka Jipya',
      transferProducts: 'Hamisha Bidhaa',
      noStores: 'Hakuna maduka yaliyosanidiwa',
      noStoresDescription: 'Ongeza mahali pa kwanza pa duka ili kuanza kusimamia maduka mengi.',
      storeName: 'Jina la Duka',
      storeType: 'Aina',
      location: 'Mahali',
      manager: 'Meneja',
      inventory: 'Bidhaa za Hisa',
      status: 'Hali',
      actions: 'Vitendo',
      active: 'Amilifu',
      inactive: 'Haijaamilifu',
      mainStore: 'Duka Kuu',
      warehouse: 'Ghala',
      noManager: 'Hakuna meneja',
      viewStore: 'Ona maelezo ya duka',
      editStore: 'Hariri duka',
      deleteStore: 'Futa duka',
      confirmDelete: 'Una uhakika unataka kufuta duka hili?',
      deleteMessage: 'Una uhakika unataka kufuta duka hili? Hatua hii haiwezi kurudishwa.',
      delete: 'Futa',
      cancel: 'Ghairi',
      deleteWarning: 'Kitendo hiki hakiwezi kutendua.',
      storeDeleted: 'Duka limefutwa kikamilifu',
      errorDeleting: 'Imeshindwa kufuta duka',
      errorLoading: 'Imeshindwa kupakia maduka'
    }
  }

  const handleEditStore = (store: Store) => {
    setSelectedStore(store)
    setShowEditModal(true)
  }

  const handleDeleteStore = (store: Store) => {
    setSelectedStore(store)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteStore = async () => {
    if (!selectedStore || !currentBusiness) return

    try {
      const response = await fetch(`/api/admin/stores/${selectedStore.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          businessId: currentBusiness.id
        })
      })

      const data = await response.json()

      if (data.success) {
        showSuccess(
          language === 'en' ? 'Store Deleted' : 'Duka Limefutwa',
          language === 'en' ? 'Store deleted successfully' : 'Duka limefutwa kikamilifu'
        )
        loadStores()
        setShowDeleteConfirm(false)
        setSelectedStore(null)
      } else {
        showError(
          language === 'en' ? 'Delete Failed' : 'Kufuta Kumeshindwa',
          data.message || (language === 'en' ? 'Failed to delete store' : 'Imeshindwa kufuta duka')
        )
      }
    } catch (error) {
      console.error('Error deleting store:', error)
      showError(
        language === 'en' ? 'Delete Failed' : 'Kufuta Kumeshindwa',
        language === 'en' ? 'An error occurred while deleting the store' : 'Hitilafu imetokea wakati wa kufuta duka'
      )
    }
  }

  const t = translations[language]

  const loadStores = useCallback(async () => {
    if (!currentBusiness) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/stores?businessId=${currentBusiness.id}`)
      const result = await response.json()

      if (response.ok && result.success) {
        setStores(result.data.stores)
      } else {
        throw new Error(result.message || t.errorLoading)
      }
    } catch (error) {
      console.error('Error loading stores:', error)
      showError(t.title, error instanceof Error ? error.message : t.errorLoading)
    } finally {
      setIsLoading(false)
    }
  }, [currentBusiness, showError, t.title, t.errorLoading])

  const loadBusinessUsers = useCallback(async () => {
    if (!currentBusiness) return

    try {
      const response = await fetch(`/api/admin/users?businessId=${currentBusiness.id}`)
      const result = await response.json()

      if (response.ok && result.success) {
        setBusinessUsers(result.data || [])
      }
    } catch (error) {
      console.error('Error loading business users:', error)
    }
  }, [currentBusiness])

  const storeTypeLabels = {
    main_store: t.mainStore,
    warehouse: t.warehouse
  }

  useEffect(() => {
    if (isMultiStoreEnabled && currentBusiness) {
      loadStores()
      loadBusinessUsers()
    }
  }, [isMultiStoreEnabled, currentBusiness, loadStores, loadBusinessUsers])

  const formatLocation = (store: Store) => {
    const parts = [store.address, store.city, store.region].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : '-'
  }

  return (
    <div className="space-y-6">
      {/* Multi-Store Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{t.multiStoreDescription}</p>
          </div>
          <div className="ml-4">
            <button
              onClick={() => onToggleMultiStore(!isMultiStoreEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                isMultiStoreEnabled ? 'bg-teal-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isMultiStoreEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          {isMultiStoreEnabled ? t.enableMultiStore : t.disableMultiStore}
        </div>
      </div>

      {/* Stores Management */}
      {isMultiStoreEnabled && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t.subtitle}</h3>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTransferModal(true)}
                  disabled={stores.length < 2}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRightIcon className="w-4 h-4 mr-2" />
                  {t.transferProducts}
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  {t.addStore}
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : stores.length === 0 ? (
              <div className="text-center py-12">
                <BuildingStorefrontIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noStores}</h3>
                <p className="text-gray-600 mb-6">{t.noStoresDescription}</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  {t.addStore}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.storeName}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.storeType}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.location}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.manager}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.inventory}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.status}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stores.map((store) => (
                      <tr key={store.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {store.name}
                            </div>
                            {store.nameSwahili && (
                              <div className="text-sm text-gray-500">
                                {store.nameSwahili}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            store.storeType === 'main_store' 
                              ? 'bg-blue-100 text-blue-800'
                              : store.storeType === 'retail_store'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {storeTypeLabels[store.storeType as keyof typeof storeTypeLabels]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 text-gray-400 mr-1" />
                            {formatLocation(store)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {store.manager ? (
                            <div className="flex items-center">
                              <UserIcon className="w-4 h-4 text-gray-400 mr-1" />
                              {store.manager.firstName} {store.manager.lastName}
                            </div>
                          ) : (
                            <span className="text-gray-500">{t.noManager}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {store._count.inventory} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            store.isActive 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {store.isActive ? (
                              <>
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                {t.active}
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-3 h-3 mr-1" />
                                {t.inactive}
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-teal-600 hover:text-teal-900 p-1 rounded"
                              title={t.viewStore}
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditStore(store)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title={t.editStore}
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStore(store)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title={t.deleteStore}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onStoreAdded={loadStores}
        businessUsers={businessUsers}
      />

      {/* Edit Store Modal */}
      <EditStoreModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedStore(null)
        }}
        onStoreUpdated={loadStores}
        store={selectedStore}
        businessUsers={businessUsers}
      />

      {/* Store Transfer Modal */}
      <StoreTransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransferComplete={loadStores}
        stores={stores.map(store => ({
          ...store,
          inventoryCount: store._count.inventory
        }))}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedStore && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t.confirmDelete}</h3>
                <p className="text-sm text-gray-600">{selectedStore.name}</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">{t.deleteMessage}</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setSelectedStore(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmDeleteStore}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
