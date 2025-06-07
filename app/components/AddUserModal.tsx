'use client'

import { useState, Fragment } from 'react'
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
  role: 'Admin' | 'Manager' | 'Cashier'
  status: 'Active' | 'Inactive'
  lastLogin: string
}

interface UserForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'Admin' | 'Manager' | 'Cashier'
  status: 'Active' | 'Inactive'
  permissions: string[]
}

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserAdded?: (user: User) => void
}

export default function AddUserModal({ isOpen, onClose, onUserAdded }: AddUserModalProps) {
  const { language } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState<UserForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Cashier',
    status: 'Active',
    permissions: []
  })



  // Calculate progress
  const totalFields = 6 // name, email, password, confirmPassword, role, status
  const progress = Math.min((completedFields.size / totalFields) * 100, 100)

  const translations = {
    en: {
      title: "Add New User",
      subtitle: "Create a new user account",
      
      // Form sections
      userInformation: "User Information",
      accountSettings: "Account Settings",
      permissions: "Permissions",
      
      // Form fields
      fullName: "Full Name",
      emailAddress: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      userRole: "User Role",
      userStatus: "User Status",
      
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
      enterPassword: "Enter password",
      confirmPasswordPlaceholder: "Confirm password",
      
      // Buttons
      cancel: "Cancel",
      addUser: "Add User",
      adding: "Adding...",
      showPassword: "Show Password",
      hidePassword: "Hide Password",
      
      // Validation messages
      nameRequired: "Full name is required",
      emailRequired: "Email address is required",
      emailInvalid: "Please enter a valid email address",
      passwordRequired: "Password is required",
      passwordTooShort: "Password must be at least 8 characters",
      passwordsDoNotMatch: "Passwords do not match",
      
      // Success
      userAdded: "User added successfully!",
      
      // Role descriptions
      adminDescription: "Full system access and user management",
      managerDescription: "Sales management, reports, and customer management",
      cashierDescription: "Point of sale and payment collection",
      
      // Progress
      progress: "Progress",
      completed: "Completed"
    },
    sw: {
      title: "Ongeza Mtumiaji Mpya",
      subtitle: "Tengeneza akaunti mpya ya mtumiaji",
      
      // Form sections
      userInformation: "Maelezo ya Mtumiaji",
      accountSettings: "Mipangilio ya Akaunti",
      permissions: "Ruhusa",
      
      // Form fields
      fullName: "Jina Kamili",
      emailAddress: "Barua Pepe",
      password: "Nywila",
      confirmPassword: "Thibitisha Nywila",
      userRole: "Jukumu la Mtumiaji",
      userStatus: "Hali ya Mtumiaji",
      
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
      enterPassword: "Ingiza nywila",
      confirmPasswordPlaceholder: "Thibitisha nywila",
      
      // Buttons
      cancel: "Ghairi",
      addUser: "Ongeza Mtumiaji",
      adding: "Inaongeza...",
      showPassword: "Onyesha Nywila",
      hidePassword: "Ficha Nywila",
      
      // Validation messages
      nameRequired: "Jina kamili linahitajika",
      emailRequired: "Barua pepe inahitajika",
      emailInvalid: "Tafadhali ingiza barua pepe sahihi",
      passwordRequired: "Nywila inahitajika",
      passwordTooShort: "Nywila lazima iwe na angalau herufi 8",
      passwordsDoNotMatch: "Nywila hazifanani",
      
      // Success
      userAdded: "Mtumiaji ameongezwa!",
      
      // Role descriptions
      adminDescription: "Ufikiaji kamili wa mfumo na usimamizi wa watumiaji",
      managerDescription: "Usimamiji wa mauzo, ripoti, na wateja",
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
    if (field === 'password' || field === 'confirmPassword') {
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

    // Password validation
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create user object
      const newUser: User = {
        id: Date.now(), // In real app, this would come from API
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        lastLogin: 'Never'
      }

      // Call callback if provided
      if (onUserAdded) {
        onUserAdded(newUser)
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Cashier',
        status: 'Active',
        permissions: []
      })
      setCompletedFields(new Set())

      // Show success message (you can implement toast notification)
      alert(t.userAdded)

      // Close modal
      onClose()

    } catch (error) {
      console.error('Error adding user:', error)
      alert('Error adding user. Please try again.')
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
      role: 'Cashier',
      status: 'Active',
      permissions: []
    })
    setErrors({})
    setCompletedFields(new Set())
    onClose()
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'Admin':
        return t.adminDescription
      case 'Manager':
        return t.managerDescription
      case 'Cashier':
        return t.cashierDescription
      default:
        return ''
    }
  }

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

                        {/* Password */}
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

                        {/* Confirm Password */}
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

                        {/* User Role */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.userRole} <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.target.value as 'Admin' | 'Manager' | 'Cashier')}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                            disabled={isSubmitting}
                            onFocus={() => handleFieldFocus('role')}
                            onBlur={handleFieldBlur}
                          >
                            <option value="Cashier">{t.cashier}</option>
                            <option value="Manager">{t.manager}</option>
                            <option value="Admin">{t.admin}</option>
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
                      </div>
                    </div>

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
                            <span>{t.adding}</span>
                          </>
                        ) : (
                          <>
                            <UserGroupIcon className="w-5 h-5" />
                            <span>{t.addUser}</span>
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