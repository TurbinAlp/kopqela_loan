'use client'

import { useState, useEffect, Fragment, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  MinusCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useBusiness } from '../../../contexts/BusinessContext'
import { useNotifications } from '../../../contexts/NotificationContext'

interface Product {
  id: number
  name: string
  nameSwahili?: string
  sku?: string
  unit?: string
  costPrice?: number
  inventory?: Array<{
    quantity: number
    location?: string
    storeId?: number
    store?: {
      id: number
      name: string
      nameSwahili?: string
    }
  }>
}

interface Store {
  id: number
  name: string
  nameSwahili?: string
}

interface StockAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onAdjustmentCreated?: () => void
}

interface AdjustmentForm {
  adjustmentType: 'DAMAGE' | 'EXPIRED' | 'THEFT' | 'LOST' | 'QUALITY_ISSUE' | 'BREAKAGE' | 'SPOILAGE' | 'RETURN_TO_SUPPLIER' | 'OTHER'
  quantity: string
  unitCost: string
  storeId: string
  reason: string
  notes: string
  referenceNumber: string
  adjustmentDate: string
}

export default function StockAdjustmentModal({ 
  isOpen, 
  onClose, 
  product, 
  onAdjustmentCreated 
}: StockAdjustmentModalProps) {
  const { language } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())
  const [stores, setStores] = useState<Store[]>([])
  
  const [formData, setFormData] = useState<AdjustmentForm>({
    adjustmentType: 'DAMAGE',
    quantity: '',
    unitCost: '',
    storeId: '',
    reason: '',
    notes: '',
    referenceNumber: '',
    adjustmentDate: new Date().toISOString().split('T')[0]
  })

  const { currentBusiness } = useBusiness()
  const { showSuccess, showError } = useNotifications()

  // Fix for HeadlessUI overflow hidden issue
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        document.documentElement.style.overflow = 'visible'
      }, 0)
      
      return () => {
        clearTimeout(timer)
      }
    }
  }, [isOpen])

  const loadStores = useCallback(async () => {
    if (!currentBusiness?.id) return

    try {
      const response = await fetch(`/api/admin/stores?businessId=${currentBusiness.id}`)
      const result = await response.json()

      if (response.ok && result.success) {
        setStores(result.data.stores || [])
      }
    } catch (error) {
      console.error('Error loading stores:', error)
    }
  }, [currentBusiness?.id])

  const populateForm = useCallback(() => {
    if (!product) return

    // Set default unit cost from product cost price
    const defaultUnitCost = product.costPrice?.toString() || '0'
    
    setFormData(prev => ({
      ...prev,
      unitCost: defaultUnitCost,
      storeId: product.inventory?.[0]?.storeId?.toString() || ''
    }))

    // Mark required fields as completed if they have values
    const completed = new Set<string>()
    if (defaultUnitCost !== '0') completed.add('unitCost')
    setCompletedFields(completed)
  }, [product])

  // Load stores and populate form when modal opens
  useEffect(() => {
    if (isOpen && currentBusiness?.id) {
      loadStores()
      if (product) {
        populateForm()
      }
    }
  }, [isOpen, currentBusiness?.id, product, loadStores, populateForm])

  // Calculate progress
  const totalFields = 4 // adjustmentType, quantity, unitCost, reason
  const progress = (completedFields.size / totalFields) * 100

  const translations = {
    en: {
      title: 'Stock Adjustment',
      subtitle: 'Remove damaged, expired, or lost inventory',
      product: 'Product',
      currentStock: 'Current Stock',
      adjustmentType: 'Adjustment Type',
      quantity: 'Quantity to Remove',
      quantityPlaceholder: 'Enter quantity',
      unitCost: 'Unit Cost',
      unitCostPlaceholder: 'Cost per unit',
      store: 'Store/Location',
      storePlaceholder: 'Select store (optional)',
      reason: 'Reason',
      reasonPlaceholder: 'Describe why stock is being adjusted',
      notes: 'Additional Notes',
      notesPlaceholder: 'Additional details (optional)',
      referenceNumber: 'Reference Number',
      referencePlaceholder: 'Invoice, batch number, etc. (optional)',
      adjustmentDate: 'Adjustment Date',
      
      // Adjustment Types
      damage: 'Damaged',
      expired: 'Expired',
      theft: 'Theft/Stolen',
      lost: 'Lost/Missing',
      qualityIssue: 'Quality Issue',
      breakage: 'Breakage',
      spoilage: 'Spoilage',
      returnToSupplier: 'Return to Supplier',
      other: 'Other',
      
      // Actions
      cancel: 'Cancel',
      adjustStock: 'Adjust Stock',
      
      // Validation
      quantityRequired: 'Quantity is required',
      quantityInvalid: 'Please enter a valid quantity',
      quantityTooHigh: 'Quantity cannot exceed current stock',
      unitCostRequired: 'Unit cost is required',
      unitCostInvalid: 'Please enter a valid unit cost',
      reasonRequired: 'Reason is required',
      
      // Messages
      adjustmentCreated: 'Stock adjustment created successfully',
      errorCreating: 'Failed to create stock adjustment',
      
      // Progress
      progress: 'Progress',
      requiredFields: 'Required fields',
      
      // Info
      totalCost: 'Total Cost',
      noStores: 'No stores available',
      units: 'units'
    },
    sw: {
      title: 'Marekebisho ya Hisa',
      subtitle: 'Ondoa bidhaa zilizoharibika, zimepita muda, au zimepotea',
      product: 'Bidhaa',
      currentStock: 'Hisa ya Sasa',
      adjustmentType: 'Aina ya Marekebisho',
      quantity: 'Kiasi cha Kuondoa',
      quantityPlaceholder: 'Ingiza kiasi',
      unitCost: 'Bei ya Kipande',
      unitCostPlaceholder: 'Bei ya kipande kimoja',
      store: 'Duka/Mahali',
      storePlaceholder: 'Chagua duka (si lazima)',
      reason: 'Sababu',
      reasonPlaceholder: 'Eleza kwa nini hisa inarekebisha',
      notes: 'Maelezo ya Ziada',
      notesPlaceholder: 'Maelezo ya ziada (si lazima)',
      referenceNumber: 'Nambari ya Rejea',
      referencePlaceholder: 'Ankara, nambari ya kundi, n.k. (si lazima)',
      adjustmentDate: 'Tarehe ya Marekebisho',
      
      // Adjustment Types
      damage: 'Imeharibika',
      expired: 'Imepita Muda',
      theft: 'Wizi/Imeibwa',
      lost: 'Imepotea',
      qualityIssue: 'Tatizo la Ubora',
      breakage: 'Imevunjika',
      spoilage: 'Imeoza',
      returnToSupplier: 'Rudisha kwa Muuzaji',
      other: 'Mengineyo',
      
      // Actions
      cancel: 'Ghairi',
      adjustStock: 'Rekebisha Hisa',
      
      // Validation
      quantityRequired: 'Kiasi kinahitajika',
      quantityInvalid: 'Tafadhali ingiza kiasi sahihi',
      quantityTooHigh: 'Kiasi hakiwezi kuzidi hisa iliyopo',
      unitCostRequired: 'Bei ya kipande inahitajika',
      unitCostInvalid: 'Tafadhali ingiza bei sahihi',
      reasonRequired: 'Sababu inahitajika',
      
      // Messages
      adjustmentCreated: 'Marekebisho ya hisa yamefanywa kikamilifu',
      errorCreating: 'Imeshindwa kufanya marekebisho ya hisa',
      
      // Progress
      progress: 'Maendeleo',
      requiredFields: 'Sehemu zinazohitajika',
      
      // Info
      totalCost: 'Jumla ya Bei',
      noStores: 'Hakuna maduka yaliyopatikana',
      units: 'vipande'
    }
  }

  const t = translations[language]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.quantity.trim()) {
      newErrors.quantity = t.quantityRequired
    } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = t.quantityInvalid
    } else {
      // Check if quantity exceeds current stock
      const currentStock = getCurrentStock()
      if (Number(formData.quantity) > currentStock) {
        newErrors.quantity = t.quantityTooHigh
      }
    }

    if (!formData.unitCost.trim()) {
      newErrors.unitCost = t.unitCostRequired
    } else if (isNaN(Number(formData.unitCost)) || Number(formData.unitCost) < 0) {
      newErrors.unitCost = t.unitCostInvalid
    }

    if (!formData.reason.trim()) {
      newErrors.reason = t.reasonRequired
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof AdjustmentForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Track completed fields (only for required fields)
    if (['quantity', 'unitCost', 'reason'].includes(field)) {
      if (value.trim()) {
        setCompletedFields(prev => new Set([...prev, field]))
      } else {
        setCompletedFields(prev => {
          const newSet = new Set(prev)
          newSet.delete(field)
          return newSet
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !currentBusiness?.id || !product?.id) return

    setIsSubmitting(true)

    try {
      const adjustmentData = {
        businessId: currentBusiness.id,
        productId: product.id,
        storeId: formData.storeId ? Number(formData.storeId) : null,
        adjustmentType: formData.adjustmentType,
        quantity: Number(formData.quantity),
        unitCost: Number(formData.unitCost),
        reason: formData.reason.trim(),
        notes: formData.notes.trim() || null,
        referenceNumber: formData.referenceNumber.trim() || null,
        adjustmentDate: formData.adjustmentDate
      }

      const response = await fetch('/api/admin/stock-adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adjustmentData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        showSuccess(t.title, t.adjustmentCreated)
        onAdjustmentCreated?.()
        handleClose()
      } else {
        throw new Error(result.message || t.errorCreating)
      }
    } catch (error) {
      console.error('Error creating stock adjustment:', error)
      showError(t.title, error instanceof Error ? error.message : t.errorCreating)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      adjustmentType: 'DAMAGE',
      quantity: '',
      unitCost: product?.costPrice?.toString() || '0',
      storeId: '',
      reason: '',
      notes: '',
      referenceNumber: '',
      adjustmentDate: new Date().toISOString().split('T')[0]
    })
    setErrors({})
    setCompletedFields(new Set())
    onClose()
  }

  const getCurrentStock = () => {
    if (!product?.inventory) return 0
    // Only count positive quantities (ignore negative inventory)
    return product.inventory.reduce((total, inv) => total + Math.max(0, inv.quantity), 0)
  }

  const getTotalCost = () => {
    const quantity = Number(formData.quantity) || 0
    const unitCost = Number(formData.unitCost) || 0
    return quantity * unitCost
  }


  if (!product) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <MinusCircleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        {t.title}
                      </Dialog.Title>
                      <p className="text-sm text-gray-600">{t.subtitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{t.progress}</span>
                    <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-red-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t.requiredFields}</p>
                </div>

                {/* Product Info */}
                <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{t.product}</h3>
                      <p className="text-lg font-semibold text-blue-900">
                        {language === 'sw' && product.nameSwahili ? product.nameSwahili : product.name}
                      </p>
                      {product.sku && (
                        <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{t.currentStock}</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {getCurrentStock()} {product.unit && `${product.unit}s`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Adjustment Type */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.adjustmentType} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.adjustmentType}
                        onChange={(e) => handleInputChange('adjustmentType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="DAMAGE">{t.damage}</option>
                        <option value="EXPIRED">{t.expired}</option>
                        <option value="THEFT">{t.theft}</option>
                        <option value="LOST">{t.lost}</option>
                        <option value="QUALITY_ISSUE">{t.qualityIssue}</option>
                        <option value="BREAKAGE">{t.breakage}</option>
                        <option value="SPOILAGE">{t.spoilage}</option>
                        <option value="RETURN_TO_SUPPLIER">{t.returnToSupplier}</option>
                        <option value="OTHER">{t.other}</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.quantity} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max={getCurrentStock()}
                          value={formData.quantity}
                          onChange={(e) => handleInputChange('quantity', e.target.value)}
                          onFocus={() => setFocusedField('quantity')}
                          onBlur={() => setFocusedField(null)}
                          placeholder={t.quantityPlaceholder}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                            errors.quantity ? 'border-red-300' : 'border-gray-300'
                          } ${focusedField === 'quantity' ? 'ring-2 ring-red-500' : ''}`}
                        />
                        {completedFields.has('quantity') && (
                          <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {errors.quantity && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600 flex items-center"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          {errors.quantity}
                        </motion.p>
                      )}
                    </div>

                    {/* Unit Cost */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.unitCost} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.unitCost}
                          onChange={(e) => handleInputChange('unitCost', e.target.value)}
                          onFocus={() => setFocusedField('unitCost')}
                          onBlur={() => setFocusedField(null)}
                          placeholder={t.unitCostPlaceholder}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                            errors.unitCost ? 'border-red-300' : 'border-gray-300'
                          } ${focusedField === 'unitCost' ? 'ring-2 ring-red-500' : ''}`}
                        />
                        {completedFields.has('unitCost') && (
                          <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {errors.unitCost && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600 flex items-center"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          {errors.unitCost}
                        </motion.p>
                      )}
                    </div>

                    {/* Store */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.store}
                      </label>
                      <select
                        value={formData.storeId}
                        onChange={(e) => handleInputChange('storeId', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">{t.storePlaceholder}</option>
                        {stores.map((store) => (
                          <option key={store.id} value={store.id}>
                            {language === 'sw' && store.nameSwahili 
                              ? store.nameSwahili 
                              : store.name}
                          </option>
                        ))}
                      </select>
                      {stores.length === 0 && (
                        <p className="text-sm text-gray-500 mt-1">{t.noStores}</p>
                      )}
                    </div>

                    {/* Reason */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.reason} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <textarea
                          value={formData.reason}
                          onChange={(e) => handleInputChange('reason', e.target.value)}
                          onFocus={() => setFocusedField('reason')}
                          onBlur={() => setFocusedField(null)}
                          placeholder={t.reasonPlaceholder}
                          rows={3}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all ${
                            errors.reason ? 'border-red-300' : 'border-gray-300'
                          } ${focusedField === 'reason' ? 'ring-2 ring-red-500' : ''}`}
                        />
                        {completedFields.has('reason') && (
                          <CheckIcon className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {errors.reason && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600 flex items-center"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          {errors.reason}
                        </motion.p>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.notes}
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder={t.notesPlaceholder}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Reference Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.referenceNumber}
                      </label>
                      <input
                        type="text"
                        value={formData.referenceNumber}
                        onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                        placeholder={t.referencePlaceholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    {/* Adjustment Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.adjustmentDate}
                      </label>
                      <input
                        type="date"
                        value={formData.adjustmentDate}
                        onChange={(e) => handleInputChange('adjustmentDate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Total Cost Display */}
                  {formData.quantity && formData.unitCost && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="w-5 h-5 text-yellow-600 mr-2" />
                          <span className="text-sm font-medium text-yellow-800">{t.totalCost}</span>
                        </div>
                        <span className="text-lg font-bold text-yellow-900">
                          TSh {getTotalCost().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{t.adjustStock}</span>
                        </>
                      ) : (
                        <>
                          <MinusCircleIcon className="w-5 h-5" />
                          <span>{t.adjustStock}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
