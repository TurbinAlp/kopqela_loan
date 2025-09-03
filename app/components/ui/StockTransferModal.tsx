'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  ArrowRightIcon,
  PlusIcon,
  MinusIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBusiness } from '../../contexts/BusinessContext'
import { useNotifications } from '../../contexts/NotificationContext'
import Spinner from './Spinner'
import Image from 'next/image'

interface InventoryItem {
  quantity: number
  reservedQuantity?: number
  reorderPoint?: number
  maxStock?: number
  location?: string
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

  const [fromLocation, setFromLocation] = useState<'main_store' | 'retail_store'>('main_store')
  const [toLocation, setToLocation] = useState<'main_store' | 'retail_store'>('retail_store')
  const [transferItems, setTransferItems] = useState<TransferItem[]>([])
  const [isTransferring, setIsTransferring] = useState(false)
  const [globalReason, setGlobalReason] = useState('')

  const translations = {
    en: {
      title: 'Stock Transfer',
      subtitle: 'Transfer products between locations',
      fromLocation: 'From Location',
      toLocation: 'To Location',
      mainStore: 'Main Store',
      retailStore: 'Retail Store',
      addProducts: 'Add Products',
      product: 'Product',
      available: 'Available',
      quantity: 'Quantity',
      reason: 'Reason (Optional)',
      globalReason: 'Global Reason (Applied to all items)',
      transfer: 'Transfer',
      cancel: 'Cancel',
      transferring: 'Transferring...',
      noProductsSelected: 'No products selected for transfer',
      sameLocationError: 'Source and destination locations cannot be the same',
      invalidQuantityError: 'Please enter valid quantities for all items',
      insufficientStockError: 'Insufficient stock for some items',
      transferSuccess: 'Stock transfer completed successfully',
      transferError: 'Failed to transfer stock',
      selectProducts: 'Select products to transfer from the products list',
      enterQuantities: 'Enter transfer quantities for each product',
      removeProduct: 'Remove product from transfer',
      totalItems: 'Total Items',
      totalQuantity: 'Total Quantity'
    },
    sw: {
      title: 'Uhamishaji wa Hisa',
      subtitle: 'Hamisha bidhaa kati ya mahali',
      fromLocation: 'Kutoka Mahali',
      toLocation: 'Kwenda Mahali',
      mainStore: 'Hifadhi Kuu',
      retailStore: 'Duka la Nje',
      addProducts: 'Ongeza Bidhaa',
      product: 'Bidhaa',
      available: 'Inapatikana',
      quantity: 'Idadi',
      reason: 'Sababu (Si Lazima)',
      globalReason: 'Sababu ya Jumla (Itatumika kwa vitu vyote)',
      transfer: 'Hamisha',
      cancel: 'Ghairi',
      transferring: 'Inahamisha...',
      noProductsSelected: 'Hakuna bidhaa zilizochaguliwa kwa uhamishaji',
      sameLocationError: 'Mahali pa kutoka na pa kwenda hayawezi kuwa sawa',
      invalidQuantityError: 'Tafadhali weka idadi sahihi kwa vitu vyote',
      insufficientStockError: 'Hisa haitoshi kwa baadhi ya vitu',
      transferSuccess: 'Uhamishaji wa hisa umekamilika kwa mafanikio',
      transferError: 'Imeshindwa kuhamisha hisa',
      selectProducts: 'Chagua bidhaa za kuhamisha kwenye orodha ya bidhaa',
      enterQuantities: 'Weka idadi ya kuhamisha kwa kila bidhaa',
      removeProduct: 'Ondoa bidhaa kutoka uhamishajini',
      totalItems: 'Vitu Vyote',
      totalQuantity: 'Idadi Yote'
    }
  }

  const t = translations[language]

  // Initialize transfer items when modal opens
  useEffect(() => {
    if (isOpen) {
      const items = selectedProductIds
        .map(productId => {
          const product = products.find(p => p.id === productId)
          if (!product) return null

          const inventoryArray = Array.isArray(product.inventory) ? product.inventory : (product.inventory ? [product.inventory] : [])
          const locationInventory = inventoryArray.find(inv => inv.location === fromLocation)
          const availableStock = locationInventory?.quantity ?? 0

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
    } else {
      // Reset state when modal closes
      setTransferItems([])
      setGlobalReason('')
      setFromLocation('main_store')
      setToLocation('retail_store')
    }
  }, [isOpen, selectedProductIds, products, fromLocation])

  // Update available stock when source location changes
  useEffect(() => {
    setTransferItems(prevItems => 
      prevItems.map(item => {
        const inventoryArray = Array.isArray(item.product.inventory) ? item.product.inventory : (item.product.inventory ? [item.product.inventory] : [])
        const locationInventory = inventoryArray.find(inv => inv.location === fromLocation)
        const availableStock = locationInventory?.quantity ?? 0
        
        return {
          ...item,
          availableStock,
          transferQuantity: Math.min(item.transferQuantity, availableStock)
        }
      }).filter(item => item.availableStock > 0)
    )
  }, [fromLocation])

  const handleLocationChange = (type: 'from' | 'to', location: 'main_store' | 'retail_store') => {
    if (type === 'from') {
      setFromLocation(location)
      // Auto-switch destination to opposite location
      setToLocation(location === 'main_store' ? 'retail_store' : 'main_store')
    } else {
      setToLocation(location)
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
    if (fromLocation === toLocation) {
      showError(t.title, t.sameLocationError)
      return
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
      const transferData = {
        businessId: currentBusiness.id,
        fromLocation,
        toLocation,
        createdBy: 1, // TODO: Get from auth context
        transfers: transferItems.map(item => ({
          productId: item.productId,
          quantity: item.transferQuantity,
          reason: item.reason || globalReason || `Transfer from ${fromLocation} to ${toLocation}`
        }))
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
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
              {/* Location Selection */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.fromLocation}</label>
                    <select
                      value={fromLocation}
                      onChange={(e) => handleLocationChange('from', e.target.value as 'main_store' | 'retail_store')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                    >
                      <option value="main_store">{t.mainStore}</option>
                      <option value="retail_store">{t.retailStore}</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRightIcon className="w-8 h-8 text-teal-600" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.toLocation}</label>
                    <select
                      value={toLocation}
                      onChange={(e) => handleLocationChange('to', e.target.value as 'main_store' | 'retail_store')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                    >
                      <option value="main_store">{t.mainStore}</option>
                      <option value="retail_store">{t.retailStore}</option>
                    </select>
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
                  placeholder={`Transfer from ${fromLocation} to ${toLocation}`}
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
                  disabled={isTransferring || transferItems.length === 0 || fromLocation === toLocation}
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
