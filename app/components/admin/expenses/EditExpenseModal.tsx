'use client'

import { useState, useEffect, Fragment, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import {
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useBusiness } from '../../../contexts/BusinessContext'
import { useNotifications } from '../../../contexts/NotificationContext'

interface Expense {
  id: number
  expenseNumber: string
  title: string
  description?: string
  amount: number
  expenseDate: string
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT'
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  categoryId?: number
  vendorName?: string
  vendorContact?: string
  reference?: string
  isRecurring: boolean
  recurringType?: string
  nextDueDate?: string
}

interface EditExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  expense: Expense | null
  onExpenseUpdated?: () => void
}

interface ExpenseForm {
  title: string
  description: string
  amount: string
  expenseDate: string
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT'
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  categoryId: string
  vendorName: string
  vendorContact: string
  reference: string
  isRecurring: boolean
  recurringType: string
  nextDueDate: string
}

interface ExpenseCategory {
  id: number
  name: string
  nameSwahili?: string
  color?: string
}

export default function EditExpenseModal({ isOpen, onClose, expense, onExpenseUpdated }: EditExpenseModalProps) {
  const { language } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  
  const [formData, setFormData] = useState<ExpenseForm>({
    title: '',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    status: 'PENDING',
    categoryId: '',
    vendorName: '',
    vendorContact: '',
    reference: '',
    isRecurring: false,
    recurringType: 'MONTHLY',
    nextDueDate: ''
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

  const loadCategories = useCallback(async () => {
    if (!currentBusiness?.id) return

    try {
      const response = await fetch(`/api/admin/expense-categories?businessId=${currentBusiness.id}`)
      const result = await response.json()

      if (response.ok && result.success) {
        setCategories(result.data.categories)
      }
    } catch (error) {
      console.error('Error loading expense categories:', error)
    }
  }, [currentBusiness?.id])

  const populateForm = useCallback(() => {
    if (!expense) return

    setFormData({
      title: expense.title || '',
      description: expense.description || '',
      amount: expense.amount?.toString() || '',
      expenseDate: expense.expenseDate ? expense.expenseDate.split('T')[0] : new Date().toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod || 'CASH',
      status: expense.status || 'PENDING',
      categoryId: expense.categoryId?.toString() || '',
      vendorName: expense.vendorName || '',
      vendorContact: expense.vendorContact || '',
      reference: expense.reference || '',
      isRecurring: expense.isRecurring || false,
      recurringType: expense.recurringType || 'MONTHLY',
      nextDueDate: expense.nextDueDate ? expense.nextDueDate.split('T')[0] : ''
    })

    // Mark required fields as completed if they have values
    const completed = new Set<string>()
    if (expense.title) completed.add('title')
    if (expense.amount) completed.add('amount')
    if (expense.expenseDate) completed.add('expenseDate')
    if (expense.paymentMethod) completed.add('paymentMethod')
    setCompletedFields(completed)
  }, [expense])

  // Load expense categories and populate form when modal opens
  useEffect(() => {
    if (isOpen && currentBusiness?.id) {
      loadCategories()
      if (expense) {
        populateForm()
      }
    }
  }, [isOpen, currentBusiness?.id, expense, loadCategories, populateForm])

  // Calculate progress
  const totalFields = 4 // title, amount, expenseDate, paymentMethod
  const progress = (completedFields.size / totalFields) * 100

  const translations = {
    en: {
      title: 'Edit Expense',
      subtitle: 'Update expense information',
      expenseTitle: 'Expense Title',
      titlePlaceholder: 'Enter expense title',
      description: 'Description',
      descriptionPlaceholder: 'Expense description (optional)',
      amount: 'Amount',
      amountPlaceholder: 'Enter expense amount',
      expenseDate: 'Expense Date',
      paymentMethod: 'Payment Method',
      status: 'Status',
      category: 'Category',
      categoryPlaceholder: 'Select category (optional)',
      vendor: 'Vendor Information',
      vendorName: 'Vendor Name',
      vendorNamePlaceholder: 'Vendor or supplier name (optional)',
      vendorContact: 'Vendor Contact',
      vendorContactPlaceholder: 'Phone or email (optional)',
      reference: 'Reference Number',
      referencePlaceholder: 'Invoice/receipt number (optional)',
      recurring: 'Recurring Expense',
      recurringDescription: 'This expense repeats regularly',
      recurringType: 'Recurring Type',
      nextDueDate: 'Next Due Date',
      
      // Payment Methods
      cash: 'Cash',
      card: 'Card',
      mobileMoney: 'Mobile Money',
      bankTransfer: 'Bank Transfer',
      cheque: 'Cheque',
      credit: 'Credit',
      
      // Status
      pending: 'Pending',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      
      // Recurring Types
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
      
      // Actions
      cancel: 'Cancel',
      updateExpense: 'Update Expense',
      
      // Validation
      titleRequired: 'Expense title is required',
      amountRequired: 'Amount is required',
      amountInvalid: 'Please enter a valid amount',
      expenseDateRequired: 'Expense date is required',
      nextDueDateRequired: 'Next due date is required for recurring expenses',
      
      // Messages
      expenseUpdated: 'Expense updated successfully',
      errorUpdating: 'Failed to update expense',
      
      // Progress
      progress: 'Progress',
      requiredFields: 'Required fields',
      
      // Categories
      noCategories: 'No categories available'
    },
    sw: {
      title: 'Hariri matumizi',
      subtitle: 'Badilisha maelezo ya matumizi',
      expenseTitle: 'Kichwa cha matumizi',
      titlePlaceholder: 'Ingiza kichwa cha matumizi',
      description: 'Maelezo',
      descriptionPlaceholder: 'Maelezo ya matumizi (si lazima)',
      amount: 'Kiasi',
      amountPlaceholder: 'Ingiza kiasi cha matumizi',
      expenseDate: 'Tarehe ya matumizi',
      paymentMethod: 'Njia ya Malipo',
      status: 'Hali',
      category: 'Kundi',
      categoryPlaceholder: 'Chagua kundi (si lazima)',
      vendor: 'Maelezo ya Muuzaji',
      vendorName: 'Jina la Muuzaji',
      vendorNamePlaceholder: 'Jina la muuzaji au msambazaji (si lazima)',
      vendorContact: 'Mawasiliano ya Muuzaji',
      vendorContactPlaceholder: 'Simu au barua pepe (si lazima)',
      reference: 'Nambari ya Rejea',
      referencePlaceholder: 'Nambari ya ankara/risiti (si lazima)',
      recurring: 'Matumizi yanajirudia',
      recurringDescription: 'Matumizi haya yanajirudia mara kwa mara',
      recurringType: 'Aina ya Kurudia',
      nextDueDate: 'Tarehe Ijayo ya Kulipa',
      
      // Payment Methods
      cash: 'Fedha Taslimu',
      card: 'Kadi',
      mobileMoney: 'Fedha za Simu',
      bankTransfer: 'Uhamisho wa Benki',
      cheque: 'Hundi',
      credit: 'Mkopo',
      
      // Status
      pending: 'Inasubiri',
      paid: 'Imelipwa',
      overdue: 'Imechelewa',
      cancelled: 'Imeghairiwa',
      
      // Recurring Types
      daily: 'Kila Siku',
      weekly: 'Kila Wiki',
      monthly: 'Kila Mwezi',
      quarterly: 'Kila Robo Mwaka',
      yearly: 'Kila Mwaka',
      
      // Actions
      cancel: 'Ghairi',
      updateExpense: 'Badilisha matumizi',
      
      // Validation
      titleRequired: 'Kichwa cha matumizi kinahitajika',
      amountRequired: 'Kiasi kinahitajika',
      amountInvalid: 'Tafadhali ingiza kiasi sahihi',
      expenseDateRequired: 'Tarehe ya matumizi inahitajika',
      nextDueDateRequired: 'Tarehe ijayo ya kulipa inahitajika kwa matumizi zinazorudi',
      
      // Messages
      expenseUpdated: 'matumizi imebadilishwa kikamilifu',
      errorUpdating: 'Imeshindwa kubadilisha matumizi',
      
      // Progress
      progress: 'Maendeleo',
      requiredFields: 'Sehemu zinazohitajika',
      
      // Categories
      noCategories: 'Hakuna makundi yaliyopatikana'
    }
  }

  const t = translations[language]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = t.titleRequired
    }

    if (!formData.amount.trim()) {
      newErrors.amount = t.amountRequired
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = t.amountInvalid
    }

    if (!formData.expenseDate) {
      newErrors.expenseDate = t.expenseDateRequired
    }

    if (formData.isRecurring && !formData.nextDueDate) {
      newErrors.nextDueDate = t.nextDueDateRequired
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ExpenseForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Track completed fields (only for required string fields)
    if (typeof value === 'string' && ['title', 'amount', 'expenseDate', 'paymentMethod'].includes(field)) {
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
    
    if (!validateForm() || !currentBusiness?.id || !expense?.id) return

    setIsSubmitting(true)

    try {
      const expenseData = {
        businessId: currentBusiness.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        amount: Number(formData.amount),
        expenseDate: formData.expenseDate,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        vendorName: formData.vendorName.trim() || null,
        vendorContact: formData.vendorContact.trim() || null,
        reference: formData.reference.trim() || null,
        isRecurring: formData.isRecurring,
        recurringType: formData.isRecurring ? formData.recurringType : null,
        nextDueDate: formData.isRecurring ? formData.nextDueDate : null
      }

      const response = await fetch(`/api/admin/expenses/${expense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        showSuccess(t.title, t.expenseUpdated)
        onExpenseUpdated?.()
        handleClose()
      } else {
        throw new Error(result.message || t.errorUpdating)
      }
    } catch (error) {
      console.error('Error updating expense:', error)
      showError(t.title, error instanceof Error ? error.message : t.errorUpdating)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      status: 'PENDING',
      categoryId: '',
      vendorName: '',
      vendorContact: '',
      reference: '',
      isRecurring: false,
      recurringType: 'MONTHLY',
      nextDueDate: ''
    })
    setErrors({})
    setCompletedFields(new Set())
    onClose()
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return <BanknotesIcon className="w-5 h-5" />
      case 'CARD':
        return <CreditCardIcon className="w-5 h-5" />
      case 'MOBILE_MONEY':
        return <DevicePhoneMobileIcon className="w-5 h-5" />
      case 'BANK_TRANSFER':
        return <BuildingLibraryIcon className="w-5 h-5" />
      case 'CHEQUE':
        return <DocumentTextIcon className="w-5 h-5" />
      default:
        return <CreditCardIcon className="w-5 h-5" />
    }
  }

  if (!expense) return null

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
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCardIcon className="h-6 w-6 text-blue-600" />
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
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t.requiredFields}</p>
                </div>

                {/* Form - Same as AddExpenseModal but with different submit handler */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.expenseTitle} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          onFocus={() => setFocusedField('title')}
                          onBlur={() => setFocusedField(null)}
                          placeholder={t.titlePlaceholder}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            errors.title ? 'border-red-300' : 'border-gray-300'
                          } ${focusedField === 'title' ? 'ring-2 ring-blue-500' : ''}`}
                        />
                        {completedFields.has('title') && (
                          <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {errors.title && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600 flex items-center"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          {errors.title}
                        </motion.p>
                      )}
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.amount} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.amount}
                          onChange={(e) => handleInputChange('amount', e.target.value)}
                          onFocus={() => setFocusedField('amount')}
                          onBlur={() => setFocusedField(null)}
                          placeholder={t.amountPlaceholder}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            errors.amount ? 'border-red-300' : 'border-gray-300'
                          } ${focusedField === 'amount' ? 'ring-2 ring-blue-500' : ''}`}
                        />
                        {completedFields.has('amount') && (
                          <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {errors.amount && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600 flex items-center"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          {errors.amount}
                        </motion.p>
                      )}
                    </div>

                    {/* Expense Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.expenseDate} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.expenseDate}
                          onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            errors.expenseDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {completedFields.has('expenseDate') && (
                          <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {errors.expenseDate && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600 flex items-center"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          {errors.expenseDate}
                        </motion.p>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.paymentMethod} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="CASH">{t.cash}</option>
                        <option value="CARD">{t.card}</option>
                        <option value="MOBILE_MONEY">{t.mobileMoney}</option>
                        <option value="BANK_TRANSFER">{t.bankTransfer}</option>
                        <option value="CHEQUE">{t.cheque}</option>
                        <option value="CREDIT">{t.credit}</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.status}
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="PENDING">{t.pending}</option>
                        <option value="PAID">{t.paid}</option>
                        <option value="OVERDUE">{t.overdue}</option>
                        <option value="CANCELLED">{t.cancelled}</option>
                      </select>
                    </div>

                    {/* Category */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.category}
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => handleInputChange('categoryId', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">{t.categoryPlaceholder}</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {language === 'sw' && category.nameSwahili 
                              ? category.nameSwahili 
                              : category.name}
                          </option>
                        ))}
                      </select>
                      {categories.length === 0 && (
                        <p className="text-sm text-gray-500 mt-1">{t.noCategories}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.description}
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder={t.descriptionPlaceholder}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Vendor Information */}
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        {t.vendor}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.vendorName}
                          </label>
                          <input
                            type="text"
                            value={formData.vendorName}
                            onChange={(e) => handleInputChange('vendorName', e.target.value)}
                            placeholder={t.vendorNamePlaceholder}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.vendorContact}
                          </label>
                          <input
                            type="text"
                            value={formData.vendorContact}
                            onChange={(e) => handleInputChange('vendorContact', e.target.value)}
                            placeholder={t.vendorContactPlaceholder}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reference */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.reference}
                      </label>
                      <input
                        type="text"
                        value={formData.reference}
                        onChange={(e) => handleInputChange('reference', e.target.value)}
                        placeholder={t.referencePlaceholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Recurring Expense */}
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-3 mb-4">
                        <input
                          type="checkbox"
                          id="isRecurring"
                          checked={formData.isRecurring}
                          onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 flex items-center">
                          <TagIcon className="w-4 h-4 mr-2" />
                          {t.recurring}
                        </label>
                      </div>
                      {formData.isRecurring && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t.recurringType}
                            </label>
                            <select
                              value={formData.recurringType}
                              onChange={(e) => handleInputChange('recurringType', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="DAILY">{t.daily}</option>
                              <option value="WEEKLY">{t.weekly}</option>
                              <option value="MONTHLY">{t.monthly}</option>
                              <option value="QUARTERLY">{t.quarterly}</option>
                              <option value="YEARLY">{t.yearly}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t.nextDueDate}
                            </label>
                            <input
                              type="date"
                              value={formData.nextDueDate}
                              onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.nextDueDate ? 'border-red-300' : 'border-gray-300'
                              }`}
                            />
                            {errors.nextDueDate && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-1 text-sm text-red-600 flex items-center"
                              >
                                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                                {errors.nextDueDate}
                              </motion.p>
                            )}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2 pl-7">{t.recurringDescription}</p>
                    </div>
                  </div>

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
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{t.updateExpense}</span>
                        </>
                      ) : (
                        <>
                          {getPaymentMethodIcon(formData.paymentMethod)}
                          <span>{t.updateExpense}</span>
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
