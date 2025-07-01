'use client'

import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CreditCardIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../contexts/LanguageContext'
import { useBusiness } from '../contexts/BusinessContext'
import { useNotifications } from '../contexts/NotificationContext'

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onCustomerAdded?: (customer: Customer) => void
}

interface CustomerForm {
  name: string
  email: string
  phone: string
  address: string
  idNumber: string
  dateOfBirth: string
  occupation: string
  creditLimit: string
  status: 'active' | 'inactive'
  customerNotes: string
}

interface Customer {
  id: number
  name: string
  email: string | null
  phone: string
  address: string | null
  idNumber: string | null
  dateOfBirth: string | null
  occupation: string | null
  creditLimit: number
  outstandingBalance: number
  status: 'active' | 'inactive'
  customerNotes: string | null
  registrationDate: string
  totalOrders: number
  totalSpent: number
  creditScore: 'excellent' | 'good' | 'fair' | 'poor'
}

export default function AddCustomerModal({ isOpen, onClose, onCustomerAdded }: AddCustomerModalProps) {
  const { language } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())
  
  const [formData, setFormData] = useState<CustomerForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
    dateOfBirth: '',
    occupation: '',
    creditLimit: '0',
    status: 'active',
    customerNotes: ''
  })

  const { currentBusiness } = useBusiness()
  const { showSuccess, showError } = useNotifications()

  // Fix for HeadlessUI overflow hidden issue
  useEffect(() => {
    if (isOpen) {
      // Override HeadlessUI's overflow hidden with a timeout
      const timer = setTimeout(() => {
        document.documentElement.style.overflow = 'visible'
      }, 0)
      
      return () => {
        clearTimeout(timer)
      }
    }
  }, [isOpen])

  // Calculate progress
  const totalFields = 6 // name, phone, email, address, occupation, creditLimit
  const progress = (completedFields.size / totalFields) * 100

  const translations = {
    en: {
      title: "Add New Customer",
      subtitle: "Enter customer information",
      
      // Form sections
      personalInformation: "Personal Information",
      contactInformation: "Contact Information",
      creditInformation: "Credit Information",
      additionalNotes: "Additional Notes",
      
      // Form fields
      fullName: "Full Name",
      emailAddress: "Email Address",
      phoneNumber: "Phone Number",
      physicalAddress: "Physical Address",
      idNumber: "ID Number",
      dateOfBirth: "Date of Birth",
      occupation: "Occupation",
      creditLimit: "Credit Limit",
      customerStatus: "Customer Status",
      notes: "Notes",
      
      // Status options
      active: "Active",
      inactive: "Inactive",
      
      // Placeholders
      enterFullName: "Enter full name",
      enterEmail: "Enter email address",
      enterPhone: "Enter phone number",
      enterAddress: "Enter physical address",
      enterIdNumber: "Enter ID number",
      enterOccupation: "Enter occupation",
      enterCreditLimit: "Enter credit limit",
      enterNotes: "Enter any additional notes",
      
      // Buttons
      cancel: "Cancel",
      addCustomer: "Add Customer",
      adding: "Adding...",
      
      // Validation messages
      nameRequired: "Full name is required",
      phoneRequired: "Phone number is required",
      emailInvalid: "Please enter a valid email address",
      phoneInvalid: "Please enter a valid phone number",
      creditLimitInvalid: "Credit limit must be a valid number",
      idNumberInvalid: "Please enter a valid ID number",
      
      // Success
      customerAdded: "Customer added successfully!",
      
      currency: "TZS"
    },
    sw: {
      title: "Ongeza Mteja Mpya",
      subtitle: "Ingiza taarifa za mteja",
      
      // Form sections
      personalInformation: "Taarifa za Kibinafsi",
      contactInformation: "Taarifa za Mawasiliano",
      creditInformation: "Taarifa za Mkopo",
      additionalNotes: "Maelezo ya Ziada",
      
      // Form fields
      fullName: "Jina Kamili",
      emailAddress: "Anwani ya Barua Pepe",
      phoneNumber: "Namba ya Simu",
      physicalAddress: "Anwani ya Kinyumba",
      idNumber: "Namba ya Kitambulisho",
      dateOfBirth: "Tarehe ya Kuzaliwa",
      occupation: "Kazi",
      creditLimit: "Kikomo cha Mkopo",
      customerStatus: "Hali ya Mteja",
      notes: "Maelezo",
      
      // Status options
      active: "Hai",
      inactive: "Hahai",
      
      // Placeholders
      enterFullName: "Ingiza jina kamili",
      enterEmail: "Ingiza anwani ya barua pepe",
      enterPhone: "Ingiza namba ya simu",
      enterAddress: "Ingiza anwani ya kinyumba",
      enterIdNumber: "Ingiza namba ya kitambulisho",
      enterOccupation: "Ingiza kazi",
      enterCreditLimit: "Ingiza kikomo cha mkopo",
      enterNotes: "Ingiza maelezo ya ziada",
      
      // Buttons
      cancel: "Sitisha",
      addCustomer: "Ongeza Mteja",
      adding: "Inaongeza...",
      
      // Validation messages
      nameRequired: "Jina kamili linahitajika",
      phoneRequired: "Namba ya simu inahitajika",
      emailInvalid: "Tafadhali ingiza anwani sahihi ya barua pepe",
      phoneInvalid: "Tafadhali ingiza namba sahihi ya simu",
      creditLimitInvalid: "Kikomo cha mkopo lazima kiwe namba sahihi",
      idNumberInvalid: "Tafadhali ingiza namba sahihi ya kitambulisho",
      
      // Success
      customerAdded: "Mteja ameongezwa kwa mafanikio!",
      
      currency: "TSh"
    }
  }

  const t = translations[language]

  const handleInputChange = (field: keyof CustomerForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Track completed fields for progress
    const newCompletedFields = new Set(completedFields)
    if (value.trim()) {
      newCompletedFields.add(field)
    } else {
      newCompletedFields.delete(field)
    }
    setCompletedFields(newCompletedFields)
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFieldFocus = (field: string) => {
    setFocusedField(field)
  }

  const handleFieldBlur = () => {
    setFocusedField(null)
  }

  const isFieldCompleted = (field: string) => {
    return completedFields.has(field)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = t.nameRequired
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t.phoneRequired
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.emailInvalid
    }

    // Phone validation (basic)
    if (formData.phone && !/^\+?[\d\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = t.phoneInvalid
    }

    // Credit limit validation
    if (formData.creditLimit && isNaN(Number(formData.creditLimit))) {
      newErrors.creditLimit = t.creditLimitInvalid
    }

    // ID number validation (basic)
    if (formData.idNumber && formData.idNumber.length < 5) {
      newErrors.idNumber = t.idNumberInvalid
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: currentBusiness?.id,
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone,
          address: formData.address || null,
          idNumber: formData.idNumber || null,
          dateOfBirth: formData.dateOfBirth || null,
          occupation: formData.occupation || null,
          creditLimit: formData.creditLimit || '0',
          status: formData.status,
          customerNotes: formData.customerNotes || null
        })
      })

      const result = await response.json()

      if (result.success) {
        // Show success notification
        showSuccess(t.customerAdded, `Customer ${formData.name} has been added successfully`)
        
        // Call callback to refresh the list
        if (onCustomerAdded) {
          onCustomerAdded(result.data)
        }

        // Reset form and close
        setFormData({
          name: '', email: '', phone: '', address: '', idNumber: '',
          dateOfBirth: '', occupation: '', creditLimit: '0', status: 'active', customerNotes: ''
        })
        onClose()
      } else {
        showError('Error', result.error || 'Failed to add customer')
      }

    } catch (error) {
      console.error('Error adding customer:', error)
      showError('Network Error', 'Failed to connect to server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAndClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      idNumber: '',
      dateOfBirth: '',
      occupation: '',
      creditLimit: '0',
      status: 'active',
      customerNotes: ''
    })
    setErrors({})
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={resetAndClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1">
                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                      {t.title}
                    </Dialog.Title>
                    <p className="text-gray-600 mt-1">{t.subtitle}</p>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(progress)}% complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetAndClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-600" />
                  </motion.button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                        <span>{t.personalInformation}</span>
                      </h3>

                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.fullName} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <motion.div
                            animate={{ 
                              scale: focusedField === 'name' ? 1.1 : 1,
                              color: isFieldCompleted('name') ? '#10b981' : '#9ca3af'
                            }}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                          >
                            <UserIcon />
                          </motion.div>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder={t.enterFullName}
                            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 text-gray-900 placeholder-gray-500 ${
                              errors.name ? 'border-red-300 bg-red-50' : 
                              isFieldCompleted('name') ? 'border-green-300 bg-green-50' :
                              focusedField === 'name' ? 'border-teal-300 bg-teal-50 transform scale-105' :
                              'border-gray-300 hover:border-gray-400 bg-white'
                            }`}
                            disabled={isSubmitting}
                            onFocus={() => handleFieldFocus('name')}
                            onBlur={handleFieldBlur}
                          />
                          {isFieldCompleted('name') && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              <CheckIcon className="w-5 h-5 text-green-500" />
                            </motion.div>
                          )}
                        </div>
                        {errors.name && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm mt-1 flex items-center space-x-1"
                          >
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span>{errors.name}</span>
                          </motion.p>
                        )}
                      </div>

                      {/* ID Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.idNumber}
                        </label>
                        <div className="relative">
                          <IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.idNumber}
                            onChange={(e) => handleInputChange('idNumber', e.target.value)}
                            placeholder={t.enterIdNumber}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-500 bg-white ${
                              errors.idNumber ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={isSubmitting}
                            onFocus={() => handleFieldFocus('idNumber')}
                            onBlur={handleFieldBlur}
                          />
                        </div>
                        {errors.idNumber && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span>{errors.idNumber}</span>
                          </p>
                        )}
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.dateOfBirth}
                        </label>
                        <div className="relative">
                          <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                            disabled={isSubmitting}
                            onFocus={() => handleFieldFocus('dateOfBirth')}
                            onBlur={handleFieldBlur}
                          />
                        </div>
                      </div>

                      {/* Occupation */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.occupation}
                        </label>
                        <div className="relative">
                          <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.occupation}
                            onChange={(e) => handleInputChange('occupation', e.target.value)}
                            placeholder={t.enterOccupation}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-500 bg-white"
                            disabled={isSubmitting}
                            onFocus={() => handleFieldFocus('occupation')}
                            onBlur={handleFieldBlur}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact & Credit Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <PhoneIcon className="w-5 h-5 text-gray-600" />
                        <span>{t.contactInformation}</span>
                      </h3>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.phoneNumber} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <motion.div
                            animate={{ 
                              scale: focusedField === 'phone' ? 1.1 : 1,
                              color: isFieldCompleted('phone') ? '#10b981' : '#9ca3af'
                            }}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                          >
                            <PhoneIcon />
                          </motion.div>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder={t.enterPhone}
                            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 text-gray-900 placeholder-gray-500 ${
                              errors.phone ? 'border-red-300 bg-red-50' : 
                              isFieldCompleted('phone') ? 'border-green-300 bg-green-50' :
                              focusedField === 'phone' ? 'border-teal-300 bg-teal-50 transform scale-105' :
                              'border-gray-300 hover:border-gray-400 bg-white'
                            }`}
                            disabled={isSubmitting}
                            onFocus={() => handleFieldFocus('phone')}
                            onBlur={handleFieldBlur}
                          />
                          {isFieldCompleted('phone') && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              <CheckIcon className="w-5 h-5 text-green-500" />
                            </motion.div>
                          )}
                        </div>
                        {errors.phone && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm mt-1 flex items-center space-x-1"
                          >
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span>{errors.phone}</span>
                          </motion.p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.emailAddress}
                        </label>
                        <div className="relative">
                          <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder={t.enterEmail}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-500 bg-white ${
                              errors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={isSubmitting}
                            onFocus={() => handleFieldFocus('email')}
                            onBlur={handleFieldBlur}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span>{errors.email}</span>
                          </p>
                        )}
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.physicalAddress}
                        </label>
                        <div className="relative">
                          <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <textarea
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            placeholder={t.enterAddress}
                            rows={3}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-gray-900 placeholder-gray-500 bg-white"
                            disabled={isSubmitting}
                            onFocus={() => handleFieldFocus('address')}
                            onBlur={handleFieldBlur}
                          />
                        </div>
                      </div>

                      {/* Credit Information */}
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 pt-4">
                        <CreditCardIcon className="w-5 h-5 text-gray-600" />
                        <span>{t.creditInformation}</span>
                      </h3>

                      {/* Credit Limit */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.creditLimit} ({t.currency})
                        </label>
                        <input
                          type="number"
                          value={formData.creditLimit}
                          onChange={(e) => handleInputChange('creditLimit', e.target.value)}
                          placeholder={t.enterCreditLimit}
                          min="0"
                          step="1000"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-500 bg-white ${
                            errors.creditLimit ? 'border-red-300' : 'border-gray-300'
                          }`}
                          disabled={isSubmitting}
                          onFocus={() => handleFieldFocus('creditLimit')}
                          onBlur={handleFieldBlur}
                        />
                        {errors.creditLimit && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span>{errors.creditLimit}</span>
                          </p>
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.customerStatus}
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                          disabled={isSubmitting}
                          onFocus={() => handleFieldFocus('status')}
                          onBlur={handleFieldBlur}
                        >
                          <option value="active">{t.active}</option>
                          <option value="inactive">{t.inactive}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.additionalNotes}</h3>
                    <textarea
                      value={formData.customerNotes}
                      onChange={(e) => handleInputChange('customerNotes', e.target.value)}
                      placeholder={t.enterNotes}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-gray-900 placeholder-gray-500 bg-white"
                      disabled={isSubmitting}
                      onFocus={() => handleFieldFocus('customerNotes')}
                      onBlur={handleFieldBlur}
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetAndClose}
                      className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      {t.cancel}
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>{t.adding}</span>
                        </>
                      ) : (
                        <>
                          <CheckIcon className="w-5 h-5" />
                          <span>{t.addCustomer}</span>
                        </>
                      )}
                    </motion.button>
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