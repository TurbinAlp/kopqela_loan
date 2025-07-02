'use client'

import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../contexts/LanguageContext'
import { useBusiness } from '../contexts/BusinessContext'
import { useNotifications } from '../contexts/NotificationContext'

interface Customer {
  id: number
  name: string
  email: string | null
  phone: string
  address: string | null
  status: 'active' | 'inactive' | 'suspended'
  registrationDate: string
  lastOrderDate?: string
  totalOrders: number
  totalSpent: number
  creditLimit: number
  outstandingBalance: number
  creditScore: 'excellent' | 'good' | 'fair' | 'poor'
  idNumber: string | null
  dateOfBirth: string | null
  occupation: string | null
  customerNotes: string | null
}

interface EditCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer
  onCustomerUpdated: () => void
}

export default function EditCustomerModal({ isOpen, onClose, customer, onCustomerUpdated }: EditCustomerModalProps) {
  const { language } = useLanguage()
  const { currentBusiness } = useBusiness()
  const { showSuccess, showError } = useNotifications()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
    dateOfBirth: '',
    occupation: '',
    creditLimit: '0',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    customerNotes: ''
  })

  // Update form data when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        address: customer.address || '',
        idNumber: customer.idNumber || '',
        dateOfBirth: customer.dateOfBirth || '',
        occupation: customer.occupation || '',
        creditLimit: customer.creditLimit.toString(),
        status: customer.status,
        customerNotes: customer.customerNotes || ''
      })
    }
  }, [customer])

  const translations = {
    en: { 
      title: "Edit Customer", 
      updating: "Updating...", 
      updateCustomer: "Update Customer", 
      cancel: "Cancel", 
      customerUpdated: "Customer updated successfully!",
      fullName: "Full Name",
      phone: "Phone",
      email: "Email",
      address: "Address",
      idNumber: "ID Number",
      dateOfBirth: "Date of Birth",
      occupation: "Occupation",
      creditLimit: "Credit Limit",
      status: "Status",
      customerNotes: "Notes",
      active: "Active",
      inactive: "Inactive",
      suspended: "Suspended"
    },
    sw: { 
      title: "Hariri Mteja", 
      updating: "Inasasisha...", 
      updateCustomer: "Sasisha Mteja", 
      cancel: "Sitisha", 
      customerUpdated: "Mteja amesasishwa kikamilifu!",
      fullName: "Jina Kamili",
      phone: "Simu",
      email: "Barua Pepe",
      address: "Anwani",
      idNumber: "Namba ya Kitambulisho",
      dateOfBirth: "Tarehe ya Kuzaliwa",
      occupation: "Kazi",
      creditLimit: "Kikomo cha Mkopo",
      status: "Hali",
      customerNotes: "Maelezo",
      active: "Hai",
      inactive: "Hahai",
      suspended: "Amesimamishwa"
    }
  }

  const t = translations[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      showError('Validation Error', 'Name and phone are required')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: currentBusiness?.id,
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim(),
          address: formData.address.trim() || null,
          idNumber: formData.idNumber.trim() || null,
          dateOfBirth: formData.dateOfBirth || null,
          occupation: formData.occupation.trim() || null,
          creditLimit: formData.creditLimit,
          status: formData.status,
          customerNotes: formData.customerNotes.trim() || null
        })
      })

      const result = await response.json()

      if (result.success) {
        showSuccess(t.customerUpdated, `Customer ${formData.name} updated successfully`)
        onCustomerUpdated()
      } else {
        showError('Error', result.error || 'Failed to update customer')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      showError('Network Error', 'Failed to connect to server')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100">
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-2xl font-bold text-gray-900">{t.title}</Dialog.Title>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <XMarkIcon className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName} *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone} *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.idNumber}</label>
                      <input
                        type="text"
                        value={formData.idNumber}
                        onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.dateOfBirth}</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.occupation}</label>
                      <input
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.creditLimit}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData({...formData, creditLimit: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.status}</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive' | 'suspended'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                        disabled={isSubmitting}
                      >
                        <option value="active">{t.active}</option>
                        <option value="inactive">{t.inactive}</option>
                        <option value="suspended">{t.suspended}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.address}</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.customerNotes}</label>
                    <textarea
                      value={formData.customerNotes}
                      onChange={(e) => setFormData({...formData, customerNotes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white resize-none"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button 
                      type="button" 
                      onClick={onClose} 
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      {t.cancel}
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? t.updating : t.updateCustomer}
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