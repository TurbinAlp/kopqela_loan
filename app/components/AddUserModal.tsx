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
import { useNotifications } from '../contexts/NotificationContext'

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
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  role: 'ADMIN' | 'MANAGER' | 'CASHIER'
  phone: string
  status: 'Active' | 'Inactive'
}

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserAdded?: (user: User) => void
  businessId?: number
}

export default function AddUserModal({ isOpen, onClose, onUserAdded, businessId }: AddUserModalProps) {
  const { language } = useLanguage()
  const { showSuccess, showError } = useNotifications()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [inviteExistingUser, setInviteExistingUser] = useState(false)
  
  const [formData, setFormData] = useState<UserForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CASHIER',
    phone: '',
    status: 'Active'
  })



  // Calculate progress based on user type
  const totalFields = inviteExistingUser 
    ? 2 // email, role (for existing users)
    : 7 // firstName, lastName, email, password, confirmPassword, role, status (for new users)
  const progress = Math.min((completedFields.size / totalFields) * 100, 100)

  const translations = {
    en: {
      title: "Add User",
      subtitle: "Create new user or invite existing user",
      
      // User type options
      createNewUser: "Create New User",
      inviteExistingUser: "Invite Existing User",
      newUserDescription: "Create a brand new user account",
      existingUserDescription: "Invite an existing system user to this business",
      
      // Form sections
      userInformation: "User Information",
      accountSettings: "Account Settings",
      permissions: "Permissions",
      
      // Form fields
      firstName: "First Name",
      lastName: "Last Name",
      emailAddress: "Email Address",
      phoneNumber: "Phone Number",
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
      enterFirstName: "Enter first name",
      enterLastName: "Enter last name",
      enterEmail: "Enter email address",
      enterPhone: "Enter phone number",
      enterPassword: "Enter password",
      confirmPasswordPlaceholder: "Confirm password",
      
      // Buttons
      cancel: "Cancel",
      addUser: "Add User",
      adding: "Adding...",
      showPassword: "Show Password",
      hidePassword: "Hide Password",
      
      // Validation messages
      firstNameRequired: "First name is required",
      lastNameRequired: "Last name is required",
      emailRequired: "Email address is required",
      emailInvalid: "Please enter a valid email address",
      passwordRequired: "Password is required",
      passwordTooShort: "Password must be at least 8 characters",
      passwordsDoNotMatch: "Passwords do not match",
      
      // Success
      userAdded: "User added successfully!",
      userCreated: "User has been created successfully!",
      userInvited: "User has been invited to this business successfully!",
      success: "Success",
      error: "Error",
      errorAddingUser: "Error adding user. Please try again.",
      
      // Role descriptions
      adminDescription: "Full system access and user management",
      managerDescription: "Sales management, reports, and customer management",
      cashierDescription: "Point of sale and payment collection",
      
      // Progress
      progress: "Progress",
      completed: "Completed"
    },
    sw: {
      title: "Ongeza Mtumiaji",
      subtitle: "Tengeneza mtumiaji mpya au alitisha aliyepo",
      
      // User type options
      createNewUser: "Tengeneza Mtumiaji Mpya",
      inviteExistingUser: "Alitisha Mtumiaji Aliyepo",
      newUserDescription: "Tengeneza akaunti mpya kabisa",
      existingUserDescription: "Alitisha mtumiaji aliyepo kwenye mfumo huu biashara",
      
      // Form sections
      userInformation: "Maelezo ya Mtumiaji",
      accountSettings: "Mipangilio ya Akaunti",
      permissions: "Ruhusa",
      
      // Form fields
      firstName: "Jina la Kwanza",
      lastName: "Jina la Mwisho",
      emailAddress: "Barua Pepe",
      phoneNumber: "Nambari ya Simu",
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
      enterFirstName: "Ingiza jina la kwanza",
      enterLastName: "Ingiza jina la mwisho",
      enterEmail: "Ingiza barua pepe",
      enterPhone: "Ingiza nambari ya simu",
      enterPassword: "Ingiza nywila",
      confirmPasswordPlaceholder: "Thibitisha nywila",
      
      // Buttons
      cancel: "Ghairi",
      addUser: "Ongeza Mtumiaji",
      adding: "Inaongeza...",
      showPassword: "Onyesha Nywila",
      hidePassword: "Ficha Nywila",
      
      // Validation messages
      firstNameRequired: "Jina la kwanza linahitajika",
      lastNameRequired: "Jina la mwisho linahitajika",
      emailRequired: "Barua pepe inahitajika",
      emailInvalid: "Tafadhali ingiza barua pepe sahihi",
      passwordRequired: "Nywila inahitajika",
      passwordTooShort: "Nywila lazima iwe na angalau herufi 8",
      passwordsDoNotMatch: "Nywila hazifanani",
      
      // Success
      userAdded: "Mtumiaji ameongezwa!",
      userCreated: "Mtumiaji ametengenezwa!",
      userInvited: "Mtumiaji amealitishwa kwenye biashara hii!",
      success: "Imefanikiwa",
      error: "Hitilafu",
      errorAddingUser: "Hitilafu kuongeza mtumiaji. Tafadhali jaribu tena.",
      
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

    if (inviteExistingUser) {
      // For existing users, only email and role are required
      if (!formData.email.trim()) {
        newErrors.email = t.emailRequired
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t.emailInvalid
      }
    } else {
      // For new users, all fields are required
      if (!formData.firstName.trim()) {
        newErrors.firstName = t.firstNameRequired
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = t.lastNameRequired
      }

      if (!formData.email.trim()) {
        newErrors.email = t.emailRequired
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t.emailInvalid
      }

      // Password validation (only for new users)
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
    
    if (!validateForm() || !businessId) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/users?businessId=${businessId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          isActive: formData.status === 'Active',
          inviteExistingUser: inviteExistingUser
        })
      })

      const data = await response.json()

      if (data.success) {
        // Call callback if provided
        if (onUserAdded) {
          onUserAdded(data.data)
        }

        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'CASHIER',
          phone: '',
          status: 'Active'
        })
        setCompletedFields(new Set())
        setInviteExistingUser(false)

        // Show success message
        const successMessage = inviteExistingUser 
          ? `${data.data.name} - ${t.userInvited}`
          : `${data.data.name} - ${t.userCreated}`
        showSuccess(t.success, successMessage)

        // Close modal
        onClose()
      } else {
        showError(t.error, data.message || t.errorAddingUser)
      }

    } catch (error) {
      console.error('Error adding user:', error)
      showError(t.error, t.errorAddingUser)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAndClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'CASHIER',
      phone: '',
      status: 'Active'
    })
    setErrors({})
    setCompletedFields(new Set())
    setInviteExistingUser(false)
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
                    {/* User Type Toggle */}
                    <div className="space-y-3">
                      <h3 className="text-base font-medium text-gray-900 flex items-center space-x-2">
                        <UserGroupIcon className="w-4 h-4 text-gray-600" />
                        <span>User Type</span>
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Create New User Option */}
                        <motion.div
                          className={`relative p-3 border rounded-md cursor-pointer transition-all ${
                            !inviteExistingUser 
                              ? 'border-teal-500 bg-teal-50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => setInviteExistingUser(false)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full border ${
                              !inviteExistingUser 
                                ? 'border-teal-500 bg-teal-500' 
                                : 'border-gray-300'
                            }`}>
                              {!inviteExistingUser && (
                                <CheckIcon className="w-2 h-2 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{t.createNewUser}</h4>
                            </div>
                          </div>
                        </motion.div>

                        {/* Invite Existing User Option */}
                        <motion.div
                          className={`relative p-3 border rounded-md cursor-pointer transition-all ${
                            inviteExistingUser 
                              ? 'border-teal-500 bg-teal-50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => setInviteExistingUser(true)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full border ${
                              inviteExistingUser 
                                ? 'border-teal-500 bg-teal-500' 
                                : 'border-gray-300'
                            }`}>
                              {inviteExistingUser && (
                                <CheckIcon className="w-2 h-2 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{t.inviteExistingUser}</h4>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* User Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                          <UserIcon className="w-5 h-5 text-gray-600" />
                          <span>{t.userInformation}</span>
                        </h3>

                        {/* First Name - Only for new users */}
                        {!inviteExistingUser && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.firstName} <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <motion.div
                              animate={{ 
                                scale: focusedField === 'firstName' ? 1.1 : 1,
                                color: isFieldCompleted('firstName') ? '#10b981' : '#9ca3af'
                              }}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                            >
                              <UserIcon />
                            </motion.div>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              placeholder={t.enterFirstName}
                              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-900 placeholder-gray-500 bg-white ${
                                errors.firstName ? 'border-red-300' : 'border-gray-300'
                              }`}
                              disabled={isSubmitting}
                              onFocus={() => handleFieldFocus('firstName')}
                              onBlur={handleFieldBlur}
                            />
                            {isFieldCompleted('firstName') && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              >
                                <CheckIcon className="w-5 h-5 text-green-500" />
                              </motion.div>
                            )}
                          </div>
                          {errors.firstName && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-1 text-sm text-red-600 flex items-center space-x-1"
                            >
                              <ExclamationTriangleIcon className="w-4 h-4" />
                              <span>{errors.firstName}</span>
                            </motion.p>
                          )}
                        </div>
                        )}

                        {/* Last Name - Only for new users */}
                        {!inviteExistingUser && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.lastName} <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <motion.div
                              animate={{ 
                                scale: focusedField === 'lastName' ? 1.1 : 1,
                                color: isFieldCompleted('lastName') ? '#10b981' : '#9ca3af'
                              }}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                            >
                              <UserIcon />
                            </motion.div>
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              placeholder={t.enterLastName}
                              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-900 placeholder-gray-500 bg-white ${
                                errors.lastName ? 'border-red-300' : 'border-gray-300'
                              }`}
                              disabled={isSubmitting}
                              onFocus={() => handleFieldFocus('lastName')}
                              onBlur={handleFieldBlur}
                            />
                            {isFieldCompleted('lastName') && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              >
                                <CheckIcon className="w-5 h-5 text-green-500" />
                              </motion.div>
                            )}
                          </div>
                          {errors.lastName && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-1 text-sm text-red-600 flex items-center space-x-1"
                            >
                              <ExclamationTriangleIcon className="w-4 h-4" />
                              <span>{errors.lastName}</span>
                            </motion.p>
                          )}
                        </div>
                        )}

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
                      </div>

                      {/* Account Settings - Only for new users */}
                      {!inviteExistingUser && (
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


                        {/* Phone Number - Only for new users */}
                        {!inviteExistingUser && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.phoneNumber}
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder={t.enterPhone}
                              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-500 bg-white"
                              disabled={isSubmitting}
                              onFocus={() => handleFieldFocus('phone')}
                              onBlur={handleFieldBlur}
                            />
                          </div>
                        </div>
                        )}

                        {/* User Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.userStatus} <span className="text-red-500">*</span>
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
                      )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-row space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={resetAndClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-sm font-medium"
                        disabled={isSubmitting}
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || Object.keys(errors).length > 0}
                        className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span className="text-white">{t.adding}</span>
                          </>
                        ) : (
                          <>
                            <UserGroupIcon className="w-4 h-4 text-white" />
                            <span className="text-white">{t.addUser}</span>
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