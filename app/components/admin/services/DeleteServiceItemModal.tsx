'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrashIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
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
  specifications?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  currentCustomer?: {
    id: number
    fullName: string
    phone?: string
    email?: string
  } | null
}

interface DeleteServiceItemModalProps {
  isOpen: boolean
  onClose: () => void
  serviceId: number
  item: ServiceItem | null
  onItemDeleted: () => void
}

export default function DeleteServiceItemModal({
  isOpen,
  onClose,
  serviceId,
  item,
  onItemDeleted
}: DeleteServiceItemModalProps) {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const [isDeleting, setIsDeleting] = useState(false)

  const translations = {
    en: {
      deleteConfirmTitle: "Delete Service Item",
      deleteConfirmMessage: "Are you sure you want to delete this item? This action cannot be undone.",
      itemNumber: "Item Number",
      confirmDelete: "Delete",
      deleting: "Deleting...",
      cancel: "Cancel",
      itemDeleted: "Item Deleted",
      itemDeletedMessage: "Item has been deleted successfully."
    },
    sw: {
      deleteConfirmTitle: "Futa Kitu cha Huduma",
      deleteConfirmMessage: "Una uhakika unataka kufuta kitu hiki? Hatua hii haiwezi kubatilishwa.",
      itemNumber: "Nambari ya Kitu",
      confirmDelete: "Futa",
      deleting: "Inafuta...",
      cancel: "Ghairi",
      itemDeleted: "Kitu Kimefutwa",
      itemDeletedMessage: "Kitu kimefutwa kwa mafanikio."
    }
  }

  const t = translations[language]

  // Confirm delete item
  const confirmDeleteItem = async () => {
    if (!item || !serviceId) return

    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/admin/services/${serviceId}/items/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete item')
      }

      showSuccess(t.itemDeleted, t.itemDeletedMessage)
      onItemDeleted()
      onClose()
    } catch (error: unknown) {
      console.error('Error deleting item:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item'
      showError('Error', errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{t.deleteConfirmTitle}</h3>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4">
          <p className="text-gray-600 mb-4">{t.deleteConfirmMessage}</p>
          
          {/* Item Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrashIcon className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {language === 'sw' && item.nameSwahili ? item.nameSwahili : item.name}
                </p>
                <p className="text-sm text-gray-500">
                  {t.itemNumber}: {item.itemNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.cancel}
          </button>
          <button
            onClick={confirmDeleteItem}
            disabled={isDeleting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isDeleting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isDeleting ? t.deleting : t.confirmDelete}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
