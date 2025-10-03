'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon
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
  isActive: boolean
  inventoryCount: number
}

interface Product {
  id: number
  name: string
  nameSwahili?: string
  sku: string
  quantity: number
  reorderPoint?: number
}

interface StoreTransferModalProps {
  isOpen: boolean
  onClose: () => void
  onTransferComplete: () => void
  stores: Store[]
  selectedProducts?: Product[]
}

interface TransferItem {
  productId: number
  quantity: number
  reason?: string
}

export default function StoreTransferModal({
  isOpen,
  onClose,
  onTransferComplete,
  stores,
  selectedProducts = []
}: StoreTransferModalProps) {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const { currentBusiness } = useBusiness()

  const [sourceStoreId, setSourceStoreId] = useState<number | null>(null)
  const [destinationType, setDestinationType] = useState<'store' | 'external'>('store')
  const [destinationStoreId, setDestinationStoreId] = useState<number | null>(null)
  const [externalDestination, setExternalDestination] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [transferItems, setTransferItems] = useState<TransferItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  const translations = {
    en: {
      title: 'Store Transfer',
      subtitle: 'Transfer products between stores or to external destinations',
      sourceStore: 'Source Store',
      selectSource: 'Select source store',
      destinationType: 'Destination Type',
      internalTransfer: 'Internal Transfer (Store to Store)',
      externalTransfer: 'External Transfer (Outside Business)',
      destinationStore: 'Destination Store',
      selectDestination: 'Select destination store',
      externalDestination: 'External Destination',
      externalPlaceholder: 'Enter customer/business name',
      productsToTransfer: 'Products to Transfer',
      noProducts: 'No products available for transfer',
      loadingProducts: 'Loading products...',
      product: 'Product',
      available: 'Available',
      transferQty: 'Transfer Qty',
      reason: 'Reason (Optional)',
      reasonPlaceholder: 'Enter transfer reason',
      totalItems: 'Total Items',
      cancel: 'Cancel',
      transfer: 'Transfer',
      transferring: 'Transferring...',
      transferSuccess: 'Products transferred successfully',
      transferError: 'Failed to transfer products',
      selectSourceFirst: 'Please select a source store first',
      selectDestination: 'Please select a destination',
      noItemsSelected: 'Please select at least one product to transfer',
      invalidQuantity: 'Please enter valid quantities for all selected products',
      insufficientStock: 'Insufficient stock for some products',
      sameStoreError: 'Source and destination stores cannot be the same'
    },
    sw: {
      title: 'Uhamisho wa Madukani',
      subtitle: 'Hamisha bidhaa kati ya maduka au kwenda nje ya biashara',
      sourceStore: 'Duka la Chanzo',
      selectSource: 'Chagua duka la chanzo',
      destinationType: 'Aina ya Marudio',
      internalTransfer: 'Uhamisho wa Ndani (Duka hadi Duka)',
      externalTransfer: 'Uhamisho wa Nje (Nje ya Biashara)',
      destinationStore: 'Duka la Marudio',
      selectDestination: 'Chagua duka la marudio',
      externalDestination: 'Marudio ya Nje',
      externalPlaceholder: 'Ingiza jina la mteja/biashara',
      productsToTransfer: 'Bidhaa za Kuhamisha',
      noProducts: 'Hakuna bidhaa zinazopatikana kwa uhamisho',
      loadingProducts: 'Inapakia bidhaa...',
      product: 'Bidhaa',
      available: 'Zinazopatikana',
      transferQty: 'Kiasi cha Uhamisho',
      reason: 'Sababu (Si Lazima)',
      reasonPlaceholder: 'Ingiza sababu ya uhamisho',
      totalItems: 'Jumla ya Vitu',
      cancel: 'Ghairi',
      transfer: 'Hamisha',
      transferring: 'Inahamisha...',
      transferSuccess: 'Bidhaa zimehamishwa kikamilifu',
      transferError: 'Imeshindwa kuhamisha bidhaa',
      selectSourceFirst: 'Tafadhali chagua duka la chanzo kwanza',
      selectDestination: 'Tafadhali chagua marudio',
      noItemsSelected: 'Tafadhali chagua angalau bidhaa moja ya kuhamisha',
      invalidQuantity: 'Tafadhali ingiza kiasi sahihi kwa bidhaa zote zilizochaguliwa',
      insufficientStock: 'Hisa haitoshi kwa baadhi ya bidhaa',
      sameStoreError: 'Maduka ya chanzo na marudio hayawezi kuwa sawa'
    }
  }

  const t = translations[language]

  // Load products when source store changes
  useEffect(() => {
    if (sourceStoreId && currentBusiness) {
      loadStoreProducts()
    }
  }, [sourceStoreId, currentBusiness])

  // Initialize transfer items when products change
  useEffect(() => {
    if (selectedProducts.length > 0) {
      setTransferItems(selectedProducts.map(p => ({
        productId: p.id,
        quantity: 0,
        reason: ''
      })))
    } else if (products.length > 0) {
      setTransferItems(products.map(p => ({
        productId: p.id,
        quantity: 0,
        reason: ''
      })))
    }
  }, [products, selectedProducts])

  const loadStoreProducts = async () => {
    if (!sourceStoreId || !currentBusiness) return

    setIsLoadingProducts(true)
    try {
      const response = await fetch(
        `/api/admin/inventory/by-location?businessId=${currentBusiness.id}&storeId=${sourceStoreId}`
      )
      const data = await response.json()

      if (data.success) {
        setProducts(data.data.inventory.map((inv: any) => ({
          id: inv.product.id,
          name: inv.product.name,
          nameSwahili: inv.product.nameSwahili,
          sku: inv.product.sku,
          quantity: inv.quantity,
          reorderPoint: inv.reorderPoint
        })))
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      showError(t.title, 'Failed to load products')
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleTransferItemChange = (productId: number, field: keyof TransferItem, value: any) => {
    setTransferItems(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, [field]: value }
        : item
    ))
  }

  const validateTransfer = (): boolean => {
    if (!sourceStoreId) {
      showError(t.title, t.selectSourceFirst)
      return false
    }

    if (destinationType === 'store' && !destinationStoreId) {
      showError(t.title, t.selectDestination)
      return false
    }

    if (destinationType === 'external' && !externalDestination.trim()) {
      showError(t.title, t.selectDestination)
      return false
    }

    if (destinationType === 'store' && sourceStoreId === destinationStoreId) {
      showError(t.title, t.sameStoreError)
      return false
    }

    const itemsToTransfer = transferItems.filter(item => item.quantity > 0)
    if (itemsToTransfer.length === 0) {
      showError(t.title, t.noItemsSelected)
      return false
    }

    // Check for invalid quantities
    for (const item of itemsToTransfer) {
      const product = products.find(p => p.id === item.productId)
      if (!product || item.quantity > product.quantity) {
        showError(t.title, t.insufficientStock)
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateTransfer() || !currentBusiness) return

    setIsSubmitting(true)

    try {
      const itemsToTransfer = transferItems.filter(item => item.quantity > 0)

      const requestData = {
        businessId: currentBusiness.id,
        fromStoreId: sourceStoreId,
        isExternalMovement: destinationType === 'external',
        transfers: itemsToTransfer
      }

      if (destinationType === 'store') {
        requestData.toStoreId = destinationStoreId
      } else {
        requestData.externalDestination = externalDestination
      }

      const response = await fetch('/api/admin/inventory/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        showSuccess(t.title, t.transferSuccess)
        onTransferComplete()
        onClose()
        resetForm()
      } else {
        throw new Error(result.message || t.transferError)
      }
    } catch (error) {
      console.error('Error transferring products:', error)
      showError(t.title, error instanceof Error ? error.message : t.transferError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSourceStoreId(null)
    setDestinationType('store')
    setDestinationStoreId(null)
    setExternalDestination('')
    setProducts([])
    setTransferItems([])
  }

  const totalQuantity = transferItems.reduce((sum, item) => sum + item.quantity, 0)
  const activeStores = stores.filter(store => store.isActive)

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{t.title}</h2>
                  <p className="text-blue-100 mt-1">{t.subtitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Source Store Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.sourceStore}
                  </label>
                  <select
                    value={sourceStoreId || ''}
                    onChange={(e) => setSourceStoreId(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">{t.selectSource}</option>
                    {activeStores.map(store => (
                      <option key={store.id} value={store.id}>
                        {language === 'sw' && store.nameSwahili ? store.nameSwahili : store.name} 
                        ({store.inventoryCount} items)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.destinationType}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="destinationType"
                        value="store"
                        checked={destinationType === 'store'}
                        onChange={(e) => setDestinationType(e.target.value as 'store' | 'external')}
                        className="mr-3"
                      />
                      <div>
                        <BuildingStorefrontIcon className="w-5 h-5 text-blue-600 mb-1" />
                        <div className="text-sm font-medium">{t.internalTransfer}</div>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="destinationType"
                        value="external"
                        checked={destinationType === 'external'}
                        onChange={(e) => setDestinationType(e.target.value as 'store' | 'external')}
                        className="mr-3"
                      />
                      <div>
                        <GlobeAltIcon className="w-5 h-5 text-green-600 mb-1" />
                        <div className="text-sm font-medium">{t.externalTransfer}</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Destination Selection */}
                {destinationType === 'store' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.destinationStore}
                    </label>
                    <select
                      value={destinationStoreId || ''}
                      onChange={(e) => setDestinationStoreId(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">{t.selectDestination}</option>
                      {activeStores
                        .filter(store => store.id !== sourceStoreId)
                        .map(store => (
                          <option key={store.id} value={store.id}>
                            {language === 'sw' && store.nameSwahili ? store.nameSwahili : store.name}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.externalDestination}
                    </label>
                    <input
                      type="text"
                      value={externalDestination}
                      onChange={(e) => setExternalDestination(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t.externalPlaceholder}
                      required
                    />
                  </div>
                )}

                {/* Products Section */}
                {sourceStoreId && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t.productsToTransfer}</h3>
                    
                    {isLoadingProducts ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">{t.loadingProducts}</p>
                      </div>
                    ) : products.length === 0 ? (
                      <div className="text-center py-8">
                        <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">{t.noProducts}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {products.map((product) => {
                          const transferItem = transferItems.find(item => item.productId === product.id)
                          return (
                            <div key={product.id} className="border rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {language === 'sw' && product.nameSwahili ? product.nameSwahili : product.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-600">{t.available}: </span>
                                  <span className="font-medium">{product.quantity}</span>
                                </div>
                                <div>
                                  <input
                                    type="number"
                                    min="0"
                                    max={product.quantity}
                                    value={transferItem?.quantity || 0}
                                    onChange={(e) => handleTransferItemChange(
                                      product.id, 
                                      'quantity', 
                                      parseInt(e.target.value) || 0
                                    )}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={t.transferQty}
                                  />
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    value={transferItem?.reason || ''}
                                    onChange={(e) => handleTransferItemChange(
                                      product.id, 
                                      'reason', 
                                      e.target.value
                                    )}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={t.reasonPlaceholder}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {t.totalItems}: <span className="font-medium">{totalQuantity}</span>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || totalQuantity === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t.transferring}
                      </>
                    ) : (
                      <>
                        <ArrowRightIcon className="w-4 h-4 mr-2" />
                        {t.transfer}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
