'use client'

import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../contexts/LanguageContext'

interface User {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'CASHIER'
  status: 'Active' | 'Inactive'
  lastLogin: string
  firstName?: string
  lastName?: string
  phone?: string
  isOwner?: boolean
}

interface UserForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'ADMIN' | 'MANAGER' | 'CASHIER'
  status: 'Active' | 'Inactive'
}

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserUpdated?: (user: User) => void
  user: User | null
  businessId?: number
}

export default function EditUserModal({ isOpen, onClose, onUserUpdated, user, businessId }: EditUserModalProps) {
  const { language } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changePassword, setChangePassword] = useState(false)
  
  const [formData, setFormData] = useState<UserForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CASHIER',
    status: 'Active'
  })

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role,
        status: user.status
      })
      
      // Set completed fields based on existing data
      const completed = new Set<string>()
      if (user.name) completed.add('name')
      if (user.email) completed.add('email')
      completed.add('role')
      completed.add('status')
      setCompletedFields(completed)
    }
  }, [isOpen, user])



  // Calculate progress
  const totalFields = changePassword ? 6 : 4 // name, email, role, status (+ password, confirmPassword if changing)
  const progress = Math.min((completedFields.size / totalFields) * 100, 100)

  const translations = {
    en: {
      title: "Edit User",
      subtitle: "Update user information",
      
      // Form sections
      userInformation: "User Information",
      accountSettings: "Account Settings",
      passwordSettings: "Password Settings",
      
      // Form fields
      fullName: "Full Name",
      emailAddress: "Email Address",
      password: "New Password",
      confirmPassword: "Confirm New Password",
      userRole: "User Role",
      userStatus: "User Status",
      changePassword: "Change Password",
      
      // Role options
      admin: "Admin",
      manager: "Manager",
      cashier: "Cashier",
      
      // Status options
      active: "Active",
      inactive: "Inactive",
      
      // Placeholders
      enterFullName: "Enter full name",
      enterEmail: "Enter email address",
      enterPassword: "Enter new password",
      confirmPasswordPlaceholder: "Confirm new password",
      
      // Buttons
      cancel: "Cancel",
      updateUser: "Update User",
      updating: "Updating...",
      showPassword: "Show Password",
      hidePassword: "Hide Password",
      
      // Validation messages
      nameRequired: "Full name is required",
      emailRequired: "Email address is required",
      emailInvalid: "Please enter a valid email address",
      passwordRequired: "Password is required when changing password",
      passwordTooShort: "Password must be at least 8 characters",
      passwordsDoNotMatch: "Passwords do not match",
      
      // Success
      userUpdated: "User updated successfully!",
      
      // Role descriptions
      adminDescription: "Full system access and user management",
      managerDescription: "Sales management, reports, and customer management",
      cashierDescription: "Point of sale and payment collection",
      
      // Progress
      progress: "Progress",
      completed: "Completed"
    },
    sw: {
      title: "Hariri Mtumiaji",
      subtitle: "Sasisha maelezo ya mtumiaji",
      
      // Form sections
      userInformation: "Maelezo ya Mtumiaji",
      accountSettings: "Mipangilio ya Akaunti",
      passwordSettings: "Mipangilio ya Nywila",
      
      // Form fields
      fullName: "Jina Kamili",
      emailAddress: "Barua Pepe",
      password: "Nywila Mpya",
      confirmPassword: "Thibitisha Nywila Mpya",
      userRole: "Jukumu la Mtumiaji",
      userStatus: "Hali ya Mtumiaji",
      changePassword: "Badilisha Nywila",
      
      // Role options
      admin: "Msimamizi",
      manager: "Meneja",
      cashier: "Mwajiri",
      
      // Status options
      active: "Amilifu",
      inactive: "Sio Amilifu",
      
      // Placeholders
      enterFullName: "Ingiza jina kamili",
      enterEmail: "Ingiza barua pepe",
      enterPassword: "Ingiza nywila mpya",
      confirmPasswordPlaceholder: "Thibitisha nywila mpya",
      
      // Buttons
      cancel: "Ghairi",
      updateUser: "Sasisha Mtumiaji",
      updating: "Inasasisha...",
      showPassword: "Onyesha Nywila",
      hidePassword: "Ficha Nywila",
      
      // Validation messages
      nameRequired: "Jina kamili linahitajika",
      emailRequired: "Barua pepe inahitajika",
      emailInvalid: "Tafadhali ingiza barua pepe sahihi",
      passwordRequired: "Nywila inahitajika wakati wa kubadilisha",
      passwordTooShort: "Nywila lazima iwe na angalau herufi 8",
      passwordsDoNotMatch: "Nywila hazifanani",
      
      // Success
      userUpdated: "Mtumiaji amesasishwa!",
      
      // Role descriptions
      adminDescription: "Ufikiaji kamili wa mfumo na usimamizi wa watumiaji",
      managerDescription: "Usimamizi wa mauzo, ripoti, na wateja",
      cashierDescription: "Mahali pa mauzo na ukusanyaji wa malipo",
      
      // Progress
      progress: "Maendeleo",
      completed: "Imekamilika"
    }
  }

  const t = translations[language]

  const handleInputChange = (field: keyof UserForm, value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    
    // Track completed fields for progress
    const newCompletedFields = new Set(completedFields)
    if (value.trim()) {
      newCompletedFields.add(field)
    } else {
      newCompletedFields.delete(field)
    }
    setCompletedFields(newCompletedFields)
    
    // Clear errors and validate in real-time
    const newErrors = { ...errors }
    
    // Clear current field error
    if (newErrors[field]) {
      delete newErrors[field]
    }
    
    // Special handling for password fields - validate both when either changes
    if (changePassword && (field === 'password' || field === 'confirmPassword')) {
      // Clear both password errors
      delete newErrors.password
      delete newErrors.confirmPassword
      
      // Re-validate password fields
      if (field === 'password') {
        if (!value) {
          newErrors.password = t.passwordRequired
        } else if (value.length < 8) {
          newErrors.password = t.passwordTooShort
        }
        
        // Check confirm password match with new password
        if (newFormData.confirmPassword && value !== newFormData.confirmPassword) {
          newErrors.confirmPassword = t.passwordsDoNotMatch
        }
      } else if (field === 'confirmPassword') {
        if (!value) {
          newErrors.confirmPassword = t.passwordRequired
        } else if (value !== newFormData.password) {
          newErrors.confirmPassword = t.passwordsDoNotMatch
        }
      }
    }
    
    setErrors(newErrors)
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

    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.emailInvalid
    }

    // Password validation only if changing password
    if (changePassword) {
      if (!formData.password) {
        newErrors.password = t.passwordRequired
      } else if (formData.password.length < 8) {
        newErrors.password = t.passwordTooShort
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = t.passwordRequired
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t.passwordsDoNotMatch
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !user || !businessId) return

    setIsSubmitting(true)

    try {
      const updateData: {
        firstName: string
        lastName: string
        email: string
        role: string
        isActive: boolean
        password?: string
      } = {
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        role: formData.role,
        isActive: formData.status === 'Active'
      }

      // Include password if changing
      if (changePassword && formData.password) {
        updateData.password = formData.password
      }

      const response = await fetch(`/api/admin/users/${user.id}?businessId=${businessId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (data.success) {
        // Call callback if provided
        if (onUserUpdated) {
          onUserUpdated(data.data)
        }

        // Show success message
        alert(t.userUpdated)

        // Close modal
        onClose()
      } else {
        alert(data.message || 'Error updating user. Please try again.')
      }

    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAndClose = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'CASHIER',
      status: 'Active'
    })
    setErrors({})
    setCompletedFields(new Set())
    setChangePassword(false)
    onClose()
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return t.adminDescription
      case 'MANAGER':
        return t.managerDescription
      case 'CASHIER':
        return t.cashierDescription
      default:
        return ''
    }
  }

  if (!user) return null

  return (
    <Transition show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black/50 bg-opacity-25 backdrop-blur-sm " />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden bg-white text-left align-middle shadow-xl transition-all rounded-2xl">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-8 text-white rounded-t-2xl">
                  <button
                    onClick={resetAndClose}
                    className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    disabled={isSubmitting}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <UserGroupIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-2xl font-bold">
                        {t.title}
                      </Dialog.Title>
                      <p className="text-teal-100 mt-1">{t.subtitle}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-teal-100">{t.progress}</span>
                      <span className="text-sm text-teal-100">{Math.round(progress)}% {t.completed}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <motion.div 
                        className="bg-white rounded-full h-2"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="px-6 py-6 max-h-96 overflow-y-auto">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* User Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                          <UserIcon className="w-5 h-5 text-gray-600" />
                          <span>{t.userInformation}</span>
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
                              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-900 placeholder-gray-500 bg-white ${
                                errors.name ? 'border-red-300' : 'border-gray-300'
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
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-1 text-sm text-red-600 flex items-center space-x-1"
                            >
                              <ExclamationTriangleIcon className="w-4 h-4" />
                              <span>{errors.name}</span>
                            </motion.p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.emailAddress} <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <motion.div
                              animate={{ 
                                scale: focusedField === 'email' ? 1.1 : 1,
                                color: isFieldCompleted('email') ? '#10b981' : '#9ca3af'
                              }}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                            >
                              <EnvelopeIcon />
                            </motion.div>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder={t.enterEmail}
                              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-900 placeholder-gray-500 bg-white ${
                                errors.email ? 'border-red-300' : 'border-gray-300'
                              }`}
                              disabled={isSubmitting}
                              onFocus={() => handleFieldFocus('email')}
                              onBlur={handleFieldBlur}
                            />
                            {isFieldCompleted('email') && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              >
                                <CheckIcon className="w-5 h-5 text-green-500" />
                              </motion.div>
                            )}
                          </div>
                          {errors.email && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-1 text-sm text-red-600 flex items-center space-x-1"
                            >
                              <ExclamationTriangleIcon className="w-4 h-4" />
                              <span>{errors.email}</span>
                            </motion.p>
                          )}
                        </div>
                      </div>

                      {/* Account Settings */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                          <ShieldCheckIcon className="w-5 h-5 text-gray-600" />
                          <span>{t.accountSettings}</span>
                        </h3>

                        {/* User Role */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.userRole} <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.target.value as 'ADMIN' | 'MANAGER' | 'CASHIER')}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                            disabled={isSubmitting}
                            onFocus={() => handleFieldFocus('role')}
                            onBlur={handleFieldBlur}
                          >
                            <option value="CASHIER">{t.cashier}</option>
                            <option value="MANAGER">{t.manager}</option>
                            <option value="ADMIN">{t.admin}</option>
                          </select>
                          <p className="mt-1 text-sm text-gray-500">{getRoleDescription(formData.role)}</p>
                        </div>

                        {/* User Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.userStatus}
                          </label>
                          <select
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value as 'Active' | 'Inactive')}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                            disabled={isSubmitting}
                            onFocus={() => handleFieldFocus('status')}
                            onBlur={handleFieldBlur}
                          >
                            <option value="Active">{t.active}</option>
                            <option value="Inactive">{t.inactive}</option>
                          </select>
                        </div>

                        {/* Change Password Toggle */}
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={changePassword}
                              onChange={(e) => setChangePassword(e.target.checked)}
                              className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                              disabled={isSubmitting}
                            />
                            <span className="text-sm font-medium text-gray-700">{t.changePassword}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Password Section (only if changing password) */}
                    {changePassword && (
                      <div className="pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
                          <KeyIcon className="w-5 h-5 text-gray-600" />
                          <span>{t.passwordSettings}</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* New Password */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t.password} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                placeholder={t.enterPassword}
                                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-900 placeholder-gray-500 bg-white ${
                                  errors.password ? 'border-red-300' : 'border-gray-300'
                                }`}
                                disabled={isSubmitting}
                                onFocus={() => handleFieldFocus('password')}
                                onBlur={handleFieldBlur}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                disabled={isSubmitting}
                              >
                                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                              </button>
                            </div>
                            {errors.password && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-1 text-sm text-red-600 flex items-center space-x-1"
                              >
                                <ExclamationTriangleIcon className="w-4 h-4" />
                                <span>{errors.password}</span>
                              </motion.p>
                            )}
                          </div>

                          {/* Confirm New Password */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t.confirmPassword} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                placeholder={t.confirmPasswordPlaceholder}
                                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-900 placeholder-gray-500 bg-white ${
                                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                }`}
                                disabled={isSubmitting}
                                onFocus={() => handleFieldFocus('confirmPassword')}
                                onBlur={handleFieldBlur}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                disabled={isSubmitting}
                              >
                                {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                              </button>
                            </div>
                            {errors.confirmPassword && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-1 text-sm text-red-600 flex items-center space-x-1"
                              >
                                <ExclamationTriangleIcon className="w-4 h-4" />
                                <span>{errors.confirmPassword}</span>
                              </motion.p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
                      <button
                        type="button"
                        onClick={resetAndClose}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
                        disabled={isSubmitting}
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || Object.keys(errors).length > 0}
                        className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>{t.updating}</span>
                          </>
                        ) : (
                          <>
                            <UserGroupIcon className="w-5 h-5" />
                            <span>{t.updateUser}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}