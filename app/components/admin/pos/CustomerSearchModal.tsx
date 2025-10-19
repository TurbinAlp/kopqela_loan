'use client'

import { useState } from 'react'
import { XMarkIcon, MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import AddCustomerModal from '../../AddCustomerModal'

interface Customer {
  id: number
  name: string
  phone: string
  email?: string | null
}

interface CustomerSearchModalProps {
  isOpen: boolean
  onClose: () => void
  customers: Customer[]
  onSelectCustomer: (customer: Customer) => void
  onCustomerAdded?: (customer: Customer) => void
}

export default function CustomerSearchModal({
  isOpen,
  onClose,
  customers,
  onSelectCustomer,
  onCustomerAdded
}: CustomerSearchModalProps) {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)

  const translations = {
    en: {
      title: 'Select Customer',
      searchPlaceholder: 'Search by name or phone...',
      noResults: 'No customers found',
      addNewCustomer: 'Add New Customer',
      selectButton: 'Select',
      close: 'Close'
    },
    sw: {
      title: 'Chagua Mteja',
      searchPlaceholder: 'Tafuta kwa jina au simu...',
      noResults: 'Hakuna wateja waliopatikana',
      addNewCustomer: 'Ongeza Mteja Mpya',
      selectButton: 'Chagua',
      close: 'Funga'
    }
  }

  const t = translations[language]

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  )

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer)
    setSearchTerm('')
    onClose()
  }

  const handleAddCustomer = (newCustomer: Customer) => {
    if (onCustomerAdded) {
      onCustomerAdded(newCustomer)
    }
    setShowAddCustomerModal(false)
    onSelectCustomer(newCustomer)
    setSearchTerm('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Main Modal Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                autoFocus
              />
            </div>
          </div>

          {/* Customer List */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredCustomers.length > 0 ? (
              <div className="space-y-2">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-600">{customer.phone}</div>
                    {customer.email && (
                      <div className="text-xs text-gray-500">{customer.email}</div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>{t.noResults}</p>
              </div>
            )}
          </div>

          {/* Footer with Add New Customer Button */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <UserPlusIcon className="w-5 h-5" />
              {t.addNewCustomer}
            </button>
          </div>
        </div>
      </div>

      {/* Add Customer Modal (Secondary) */}
      {showAddCustomerModal && (
        <AddCustomerModal
          isOpen={showAddCustomerModal}
          onClose={() => setShowAddCustomerModal(false)}
          onCustomerAdded={handleAddCustomer}
        />
      )}
    </>
  )
}

