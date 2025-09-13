'use client'

import { UserIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useEffect, useRef, useState } from 'react'

interface Customer {
  id: number
  name: string
  phone: string
  email?: string
  creditLimit?: number
  outstandingBalance?: number
}

interface CustomerSectionProps {
  selectedCustomer: Customer | null
  customers: Customer[]
  customerSearch: string
  setCustomerSearch: (search: string) => void
  onSelectCustomer: (customer: Customer) => void
  onAddCustomerClick: () => void
  mode?: 'WALKIN' | 'SAVED'
  onModeChange?: (mode: 'WALKIN' | 'SAVED') => void
}

export default function CustomerSection({
  selectedCustomer,
  customers,
  customerSearch,
  setCustomerSearch,
  onSelectCustomer,
  onAddCustomerClick,
  mode,
  onModeChange
}: CustomerSectionProps) {
  const { language } = useLanguage()
  const [internalMode, setInternalMode] = useState<'WALKIN' | 'SAVED'>('WALKIN')
  const effectiveMode = mode || internalMode
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const translations = {
    en: {
      customer: "Customer",
      customerSearch: "Search customer...",
      walkInCustomer: "Walk-in Customer",
      addCustomer: "Add New Customer"
    },
    sw: {
      customer: "Mteja",
      customerSearch: "Tafuta mteja...",
      walkInCustomer: "Mteja wa Kawaida",
      addCustomer: "Ongeza Mteja Mpya"
    }
  }

  const t = translations[language]

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  )

  // Focus search when switching to SAVED
  useEffect(() => {
    if (effectiveMode === 'SAVED') {
      setTimeout(() => searchInputRef.current?.focus(), 0)
    }
  }, [effectiveMode])

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4 flex items-center text-gray-900">
        <UserIcon className="w-5 h-5 mr-2 text-gray-900" />
        {t.customer}
      </h3>
      <div className="space-y-4">
        {/* Mode selector: Walk-in vs Saved */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (onModeChange ? onModeChange('WALKIN') : setInternalMode('WALKIN'))}
            className={`inline-flex items-center px-3 py-2 rounded-md border text-sm ${effectiveMode === 'WALKIN' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <span className={`mr-2 inline-block w-3 h-3 rounded-full border ${effectiveMode === 'WALKIN' ? 'bg-teal-600 border-teal-600' : 'border-gray-400'}`}></span>
            {t.walkInCustomer}
          </button>
          <button
            type="button"
            onClick={() => (onModeChange ? onModeChange('SAVED') : setInternalMode('SAVED'))}
            className={`inline-flex items-center px-3 py-2 rounded-md border text-sm ${effectiveMode === 'SAVED' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <span className={`mr-2 inline-block w-3 h-3 rounded-full border ${effectiveMode === 'SAVED' ? 'bg-teal-600 border-teal-600' : 'border-gray-400'}`}></span>
            {language === 'sw' ? 'Mteja Aliyehifadhiwa' : 'Saved Customer'}
          </button>
        </div>

        {/* Search shown only when Saved mode */}
        {effectiveMode === 'SAVED' && (
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t.customerSearch}
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
            />
            {/* Customer dropdown */}
            {customerSearch && filteredCustomers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto text-gray-900">
                {filteredCustomers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => onSelectCustomer(customer)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 text-gray-900"
                  >
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-600 text-gray-900">{customer.phone}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {effectiveMode === 'SAVED' && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedCustomer ? selectedCustomer.name : (language === 'sw' ? 'Chagua mteja...' : 'Select a customer...')}
            </div>
            <button
              onClick={onAddCustomerClick}
              className="text-teal-600 text-sm hover:text-teal-700"
            >
              {t.addCustomer}
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 