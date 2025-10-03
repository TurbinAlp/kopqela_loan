'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  ArrowRightIcon,
  PlusIcon,
  MinusIcon,
  InformationCircleIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBusiness } from '../../contexts/BusinessContext'
import { useNotifications } from '../../contexts/NotificationContext'
import Spinner from './Spinner'
import Image from 'next/image'

interface Store {
  id: number
  name: string
  nameSwahili?: string
  storeType: string
  address?: string
  city?: string
  isActive: boolean
}

interface InventoryItem {
  quantity: number
  reservedQuantity?: number
  reorderPoint?: number
  maxStock?: number
  location?: string
  storeId?: number
  store?: Store
}

interface Product {
  id: number
  name: string
  nameSwahili?: string
  sku?: string
  inventory?: InventoryItem[] | InventoryItem
  images?: { url: string, isPrimary: boolean }[]
}

interface TransferItem {
  productId: number
  product: Product
  availableStock: number
  transferQuantity: number
  reason: string
}

interface StockTransferModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  selectedProductIds?: number[]
  onTransferComplete: () => void
}

export default function StockTransferModal({
  isOpen,
  onClose,
  products,
  selectedProductIds = [],
  onTransferComplete
}: StockTransferModalProps) {
  const { language } = useLanguage()
  const { currentBusiness } = useBusiness()
  const { showError, showSuccess } = useNotifications()

  const [stores, setStores] = useState<Store[]>([])
  const [isLoadingStores, setIsLoadingStores] = useState(false)
  const [sourceStoreId, setSourceStoreId] = useState<number | null>(null)
  const [destinationType, setDestinationType] = useState<'store' | 'external'>('store')
  const [destinationStoreId, setDestinationStoreId] = useState<number | null>(null)
  const [externalDestination, setExternalDestination] = useState('')
  const [transferItems, setTransferItems] = useState<TransferItem[]>([])
  const [isTransferring, setIsTransferring] = useState(false)
  const [globalReason, setGlobalReason] = useState('')

  const translations = {
    en: {
      title: 'Stock Transfer',
      subtitle: 'Transfer products between stores',
      sourceStore: 'Source Store',
      destinationType: 'Destination Type',
      destinationStore: 'Destination Store',
      externalDestination: 'External Destination',
      storeTransfer: 'Store Transfer',
      externalTransfer: 'External Transfer',
      selectSourceStore: 'Select source store',
      selectDestinationStore: 'Select destination store',
      enterExternalDestination: 'Enter external destination (e.g., Customer name, Another business)',
      addProducts: 'Add Products',
      product: 'Product',
      available: 'Available',
      quantity: 'Quantity',
      reason: 'Reason (Optional)',
      globalReason: 'Global Reason (Applied to all items)',
      transfer: 'Transfer',
      cancel: 'Cancel',
      transferring: 'Transferring...',
      loadingStores: 'Loading stores...',
      noStoresFound: 'No stores found',
      noProductsSelected: 'No products selected for transfer',
      sameStoreError: 'Source and destination stores cannot be the same',
      noSourceStoreError: 'Please select a source store',
      noDestinationError: 'Please select a destination store or enter external destination',
      invalidQuantityError: 'Please enter valid quantities for all items',
      insufficientStockError: 'Insufficient stock for some items',
      transferSuccess: 'Stock transfer completed successfully',
      transferError: 'Failed to transfer stock',
      selectProducts: 'Select products to transfer from the products list',
      enterQuantities: 'Enter transfer quantities for each product',
      removeProduct: 'Remove product from transfer',
      totalItems: 'Total Items',
      totalQuantity: 'Total Quantity',
      storeTypeLabels: {
        main_store: 'Main Store',
        warehouse: 'Warehouse'
      }
    },
    sw: {
      title: 'Uhamishaji wa Hisa',
      subtitle: 'Hamisha bidhaa kati ya maduka',
      sourceStore: 'Duka la Kutoka',
      destinationType: 'Aina ya Marudio',
      destinationStore: 'Duka la Kwenda',
      externalDestination: 'Mahali pa Nje',
      storeTransfer: 'Uhamishaji wa Duka',
      externalTransfer: 'Uhamishaji wa Nje',
      selectSourceStore: 'Chagua duka la kutoka',
      selectDestinationStore: 'Chagua duka la kwenda',
      enterExternalDestination: 'Weka mahali pa nje (mfano: Jina la mteja, Biashara nyingine)',
      addProducts: 'Ongeza Bidhaa',
      product: 'Bidhaa',
      available: 'Inapatikana',
      quantity: 'Idadi',
      reason: 'Sababu (Si Lazima)',
      globalReason: 'Sababu ya Jumla (Itatumika kwa vitu vyote)',
      transfer: 'Hamisha',
      cancel: 'Ghairi',
      transferring: 'Inahamisha...',
      loadingStores: 'Inapakia maduka...',
      noStoresFound: 'Hakuna maduka yaliyopatikana',
      noProductsSelected: 'Hakuna bidhaa zilizochaguliwa kwa uhamishaji',
      sameStoreError: 'Duka la kutoka na la kwenda haliwezi kuwa sawa',
      noSourceStoreError: 'Tafadhali chagua duka la kutoka',
      noDestinationError: 'Tafadhali chagua duka la kwenda au weka mahali pa nje',
      invalidQuantityError: 'Tafadhali weka idadi sahihi kwa vitu vyote',
      insufficientStockError: 'Hisa haitoshi kwa baadhi ya vitu',
      transferSuccess: 'Uhamishaji wa hisa umekamilika kwa mafanikio',
      transferError: 'Imeshindwa kuhamisha hisa',
      selectProducts: 'Chagua bidhaa za kuhamisha kwenye orodha ya bidhaa',
      enterQuantities: 'Weka idadi ya kuhamisha kwa kila bidhaa',
      removeProduct: 'Ondoa bidhaa kutoka uhamishajini',
      totalItems: 'Vitu Vyote',
      totalQuantity: 'Idadi Yote',
      storeTypeLabels: {
        main_store: 'Hifadhi Kuu',
        warehouse: 'Ghala'
      }
    }
  }

  const t = translations[language]

  const fetchStores = async () => {
    if (!currentBusiness?.id) return

    setIsLoadingStores(true)
    try {
      const response = await fetch(`/api/admin/stores?businessId=${currentBusiness.id}`)
      const result = await response.json()

      if (response.ok && result.success) {
        const activeStores = result.data.stores.filter((store: Store) => store.isActive)
        setStores(activeStores)
        
        // Auto-select first store as source if only one exists
        if (activeStores.length === 1) {
          setSourceStoreId(activeStores[0].id)
        }
      } else {
        throw new Error(result.message || 'Failed to fetch stores')
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
      showError(t.title, error instanceof Error ? error.message : t.transferError)
    } finally {
      setIsLoadingStores(false)
    }
  }

  // Fetch stores when modal opens
  useEffect(() => {
    if (isOpen && currentBusiness?.id) {
      fetchStores()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentBusiness?.id])

  // Initialize transfer items when modal opens or source store changes
  useEffect(() => {
    if (isOpen && sourceStoreId) {
      const items = selectedProductIds
        .map(productId => {
          const product = products.find(p => p.id === productId)
          if (!product) return null

          const inventoryArray = Array.isArray(product.inventory) ? product.inventory : (product.inventory ? [product.inventory] : [])
          // Find inventory for the selected source store
          const storeInventory = inventoryArray.find(inv => inv.storeId === sourceStoreId)
          const availableStock = storeInventory?.quantity ?? 0

          if (availableStock <= 0) return null

          return {
            productId: product.id,
            product,
            availableStock,
            transferQuantity: 1,
            reason: ''
          } as TransferItem
        })
        .filter((item): item is TransferItem => item !== null)

      setTransferItems(items)
    } else if (!isOpen) {
      // Reset state when modal closes
      resetModalState()
    }
  }, [isOpen, selectedProductIds, products, sourceStoreId])

  const resetModalState = () => {
      setTransferItems([])
      setGlobalReason('')
    setSourceStoreId(null)
    setDestinationType('store')
    setDestinationStoreId(null)
    setExternalDestination('')
    setStores([])
  }

  // Update available stock when source store changes
  useEffect(() => {
    if (sourceStoreId) {
    setTransferItems(prevItems => 
      prevItems.map(item => {
        const inventoryArray = Array.isArray(item.product.inventory) ? item.product.inventory : (item.product.inventory ? [item.product.inventory] : [])
          const storeInventory = inventoryArray.find(inv => inv.storeId === sourceStoreId)
          const availableStock = storeInventory?.quantity ?? 0
        
        return {
          ...item,
          availableStock,
          transferQuantity: Math.min(item.transferQuantity, availableStock)
        }
      }).filter(item => item.availableStock > 0)
    )
    }
  }, [sourceStoreId])

  const handleStoreChange = (type: 'source' | 'destination', storeId: number | null) => {
    if (type === 'source') {
      setSourceStoreId(storeId)
      // Clear destination if it's the same as source
      if (storeId === destinationStoreId) {
        setDestinationStoreId(null)
      }
    } else {
      setDestinationStoreId(storeId)
    }
  }

  const handleDestinationTypeChange = (type: 'store' | 'external') => {
    setDestinationType(type)
    if (type === 'external') {
      setDestinationStoreId(null)
    } else {
      setExternalDestination('')
    }
  }

  const updateTransferQuantity = (productId: number, quantity: number) => {
    setTransferItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId
          ? { ...item, transferQuantity: Math.max(0, Math.min(quantity, item.availableStock)) }
          : item
      )
    )
  }

  const updateItemReason = (productId: number, reason: string) => {
    setTransferItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId ? { ...item, reason } : item
      )
    )
  }

  const removeTransferItem = (productId: number) => {
    setTransferItems(prevItems => prevItems.filter(item => item.productId !== productId))
  }

  const handleTransfer = async () => {
    // Validation
    if (!sourceStoreId) {
      showError(t.title, t.noSourceStoreError)
      return
    }

    if (destinationType === 'store') {
      if (!destinationStoreId) {
        showError(t.title, t.noDestinationError)
        return
      }
      if (sourceStoreId === destinationStoreId) {
        showError(t.title, t.sameStoreError)
        return
      }
    } else {
      if (!externalDestination.trim()) {
        showError(t.title, t.noDestinationError)
        return
      }
    }

    if (transferItems.length === 0) {
      showError(t.title, t.noProductsSelected)
      return
    }

    const invalidItems = transferItems.filter(item => item.transferQuantity <= 0 || item.transferQuantity > item.availableStock)
    if (invalidItems.length > 0) {
      showError(t.title, t.invalidQuantityError)
      return
    }

    if (!currentBusiness) {
      showError(t.title, 'Business not found')
      return
    }

    setIsTransferring(true)

    try {
      const transferData: Record<string, unknown> = {
        businessId: currentBusiness.id,
        fromStoreId: sourceStoreId,
        isExternalMovement: destinationType === 'external',
        createdBy: 1, // TODO: Get from auth context
        transfers: transferItems.map(item => ({
          productId: item.productId,
          quantity: item.transferQuantity,
          reason: item.reason || globalReason || (
            destinationType === 'store' 
              ? `Transfer between stores`
              : `External transfer to ${externalDestination}`
          )
        }))
      }

      // Add destination based on type
      if (destinationType === 'store') {
        transferData.toStoreId = destinationStoreId
      } else {
        transferData.externalDestination = externalDestination.trim()
      }

      const response = await fetch('/api/admin/inventory/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        showSuccess(t.title, t.transferSuccess)
        onTransferComplete()
        onClose()
      } else {
        throw new Error(result.message || t.transferError)
      }
    } catch (error) {
      console.error('Transfer error:', error)
      showError(t.title, error instanceof Error ? error.message : t.transferError)
    } finally {
      setIsTransferring(false)
    }
  }

  const totalItems = transferItems.length
  const totalQuantity = transferItems.reduce((sum, item) => sum + item.transferQuantity, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{t.title}</h2>
                  <p className="text-teal-100 mt-1">{t.subtitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-teal-500 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Store Selection */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  {/* Source Store */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <BuildingStorefrontIcon className="w-4 h-4 inline mr-1" />
                      {t.sourceStore}
                    </label>
                    {isLoadingStores ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                        <Spinner size="sm" />
                        <span className="ml-2 text-sm text-gray-600">{t.loadingStores}</span>
                      </div>
                    ) : (
                    <select
                        value={sourceStoreId || ''}
                        onChange={(e) => handleStoreChange('source', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        disabled={stores.length === 0}
                      >
                        <option value="">{t.selectSourceStore}</option>
                        {stores.map(store => (
                          <option key={store.id} value={store.id}>
                            {language === 'sw' && store.nameSwahili ? store.nameSwahili : store.name} 
                            ({t.storeTypeLabels[store.storeType as keyof typeof t.storeTypeLabels] || store.storeType})
                          </option>
                        ))}
                    </select>
                    )}
                    {stores.length === 0 && !isLoadingStores && (
                      <p className="text-sm text-gray-500 mt-1">{t.noStoresFound}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRightIcon className="w-8 h-8 text-teal-600" />
                  </div>

                  {/* Destination Type & Store */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.destinationType}</label>
                    <div className="space-y-3">
                      {/* Destination Type Selection */}
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="store"
                            checked={destinationType === 'store'}
                            onChange={(e) => handleDestinationTypeChange(e.target.value as 'store' | 'external')}
                            className="mr-2 text-teal-600 focus:ring-teal-500"
                          />
                          <BuildingStorefrontIcon className="w-4 h-4 mr-1" />
                          <span className="text-sm">{t.storeTransfer}</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="external"
                            checked={destinationType === 'external'}
                            onChange={(e) => handleDestinationTypeChange(e.target.value as 'store' | 'external')}
                            className="mr-2 text-teal-600 focus:ring-teal-500"
                          />
                          <GlobeAltIcon className="w-4 h-4 mr-1" />
                          <span className="text-sm">{t.externalTransfer}</span>
                        </label>
                      </div>

                      {/* Destination Selection */}
                      {destinationType === 'store' ? (
                    <select
                          value={destinationStoreId || ''}
                          onChange={(e) => handleStoreChange('destination', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                          disabled={stores.length === 0}
                        >
                          <option value="">{t.selectDestinationStore}</option>
                          {stores
                            .filter(store => store.id !== sourceStoreId)
                            .map(store => (
                              <option key={store.id} value={store.id}>
                                {language === 'sw' && store.nameSwahili ? store.nameSwahili : store.name} 
                                ({t.storeTypeLabels[store.storeType as keyof typeof t.storeTypeLabels] || store.storeType})
                              </option>
                            ))}
                    </select>
                      ) : (
                        <input
                          type="text"
                          value={externalDestination}
                          onChange={(e) => setExternalDestination(e.target.value)}
                          placeholder={t.enterExternalDestination}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Global Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.globalReason}</label>
                <input
                  type="text"
                  value={globalReason}
                  onChange={(e) => setGlobalReason(e.target.value)}
                  placeholder={destinationType === 'store' ? 'Transfer between stores' : `External transfer to ${externalDestination || 'destination'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                />
              </div>

              {/* Transfer Items */}
              {transferItems.length === 0 ? (
                <div className="text-center py-8">
                  <InformationCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noProductsSelected}</h3>
                  <p className="text-gray-600">{t.selectProducts}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{t.addProducts}</h3>
                    <div className="text-sm text-gray-600">
                      {t.totalItems}: {totalItems} | {t.totalQuantity}: {totalQuantity}
                    </div>
                  </div>

                  {transferItems.map((item, index) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {(() => {
                            const primaryImage = item.product.images?.find(img => img.isPrimary)
                            const imageToShow = primaryImage || item.product.images?.[0]
                            
                            if (imageToShow) {
                              return (
                                <Image 
                                  src={imageToShow.url} 
                                  alt={item.product.name} 
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover" 
                                />
                              )
                            } else {
                              return <div className="w-8 h-8 bg-gray-400 rounded"></div>
                            }
                          })()}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                              {item.product.sku && (
                                <p className="text-sm text-gray-500 font-mono">{item.product.sku}</p>
                              )}
                              <p className="text-sm text-gray-600">
                                {t.available}: <span className="font-medium">{item.availableStock}</span>
                              </p>
                            </div>

                            <button
                              onClick={() => removeTransferItem(item.productId)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title={t.removeProduct}
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Quantity Controls */}
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t.quantity}</label>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateTransferQuantity(item.productId, item.transferQuantity - 1)}
                                  disabled={item.transferQuantity <= 1}
                                  className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <MinusIcon className="w-4 h-4" />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={item.availableStock}
                                  value={item.transferQuantity}
                                  onChange={(e) => updateTransferQuantity(item.productId, parseInt(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                                <button
                                  onClick={() => updateTransferQuantity(item.productId, item.transferQuantity + 1)}
                                  disabled={item.transferQuantity >= item.availableStock}
                                  className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <PlusIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t.reason}</label>
                              <input
                                type="text"
                                value={item.reason}
                                onChange={(e) => updateItemReason(item.productId, e.target.value)}
                                placeholder="Optional reason for this item"
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {transferItems.length > 0 && (
                  <span>{t.totalItems}: {totalItems} | {t.totalQuantity}: {totalQuantity}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  disabled={isTransferring}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={
                    isTransferring || 
                    transferItems.length === 0 || 
                    !sourceStoreId ||
                    (destinationType === 'store' && (!destinationStoreId || sourceStoreId === destinationStoreId)) ||
                    (destinationType === 'external' && !externalDestination.trim())
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTransferring && <Spinner size="sm" color="white" />}
                  <span>{isTransferring ? t.transferring : t.transfer}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
