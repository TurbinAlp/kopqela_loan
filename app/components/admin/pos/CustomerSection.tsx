'use client'

import { UserIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'

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
}

export default function CustomerSection({
  selectedCustomer,
  customers,
  customerSearch,
  setCustomerSearch,
  onSelectCustomer,
  onAddCustomerClick
}: CustomerSectionProps) {
  const { language } = useLanguage()
  
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

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4 flex items-center text-gray-900">
        <UserIcon className="w-5 h-5 mr-2 text-gray-900" />
        {t.customer}
      </h3>
      <div className="space-y-3">
        <div className="relative">
          <input
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
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedCustomer ? selectedCustomer.name : t.walkInCustomer}
          </div>
          <button
            onClick={onAddCustomerClick}
            className="text-teal-600 text-sm hover:text-teal-700"
          >
            {t.addCustomer}
          </button>
        </div>
      </div>
    </div>
  )
} 