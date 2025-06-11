'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { useLanguage, LanguageToggle } from '../contexts/LanguageContext'
import { useNotifications } from '../contexts/NotificationContext'
import { useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    setIsVisible(true)
    // Get email from URL params if available
    const email = searchParams?.get('email')
    if (email) {
      setFormData(prev => ({ ...prev, email }))
    }
  }, [searchParams])

  const translations = {
    en: {
      title: "Reset Your Password",
      subtitle: "Enter the code sent to your email and your new password",
      successTitle: "Password Reset Successful!",
      successSubtitle: "Your password has been updated successfully",
      email: "Email Address",
      code: "Reset Code",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      resetPassword: "Reset Password",
      backToLogin: "Back to Login",
      goToLogin: "Go to Login",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      codeRequired: "Reset code is required",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 8 characters",
      passwordInvalid: "Password must contain uppercase, lowercase and number",
      passwordsMatch: "Passwords do not match",
      codePlaceholder: "Enter 6-digit code",
      passwordPlaceholder: "Enter your new password",
      confirmPlaceholder: "Confirm your new password",
      emailPlaceholder: "Enter your email address"
    },
    sw: {
      title: "Badilisha Nywila Yako",
      subtitle: "Ingiza nambari uliyotumwa kwenye email na nywila mpya",
      successTitle: "Nywila Imebadilishwa Kikamilifu!",
      successSubtitle: "Nywila yako imesasishwa kikamilifu",
      email: "Anuani ya Email",
      code: "Nambari ya Kubadilisha",
      newPassword: "Nywila Mpya",
      confirmPassword: "Thibitisha Nywila",
      resetPassword: "Badilisha Nywila",
      backToLogin: "Rudi Kwenye Kuingia",
      goToLogin: "Nenda Kuingia",
      emailRequired: "Email inahitajika",
      emailInvalid: "Tafadhali ingiza email sahihi",
      codeRequired: "Nambari ya kubadilisha inahitajika",
      passwordRequired: "Nywila inahitajika",
      passwordMinLength: "Nywila lazima iwe angalau herufi 8",
      passwordInvalid: "Nywila lazima iwe na herufi kubwa, ndogo na nambari",
      passwordsMatch: "Nywila hazilingani",
      codePlaceholder: "Ingiza nambari ya tarakimu 6",
      passwordPlaceholder: "Ingiza nywila mpya",
      confirmPlaceholder: "Thibitisha nywila mpya",
      emailPlaceholder: "Ingiza anuani ya email"
    }
  }

  const t = translations[language]

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t.emailInvalid
    }
    
    if (!formData.code.trim()) {
      newErrors.code = t.codeRequired
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = t.passwordRequired
    } else if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = t.passwordInvalid
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordsMatch
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setIsSuccess(true)
        showSuccess(
          language === 'en' ? 'Password Reset!' : 'Nywila Imebadilishwa!',
          data.data?.message || 'Password has been reset successfully'
        )
      } else {
        if (data.field) {
          setErrors({ [data.field]: data.error })
        } else {
          showError(
            language === 'en' ? 'Reset Failed' : 'Kubadilisha Kumeshindwa',
            data.error || 'Failed to reset password'
          )
        }
      }
    } catch (error) {
      console.error('Reset password error:', error)
      showError(
        language === 'en' ? 'Network Error' : 'Hitilafu ya Mtandao',
        language === 'en' ? 'Please check your connection and try again' : 'Angalia muunganisho wako na ujaribu tena'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const floatingVariants = {
    animate: {
      y: [-15, 15, -15],
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div variants={floatingVariants} animate="animate" className="absolute top-16 left-8 w-40 h-40 bg-white/10 rounded-full blur-xl" />
        <motion.div variants={floatingVariants} animate="animate" style={{ animationDelay: "1.5s" }} className="absolute top-32 right-12 w-28 h-28 bg-white/15 rounded-full blur-lg" />
        <motion.div variants={floatingVariants} animate="animate" style={{ animationDelay: "3s" }} className="absolute bottom-24 left-1/3 w-44 h-44 bg-white/5 rounded-full blur-2xl" />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate={isVisible ? "visible" : "hidden"} className="w-full max-w-md relative z-10">
        {/* Language Toggle */}
        <motion.div variants={itemVariants} className="flex justify-end mb-6">
          <LanguageToggle />
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              {isSuccess ? <CheckCircleIcon className="w-8 h-8 text-white" /> : <LockClosedIcon className="w-8 h-8 text-white" />}
            </motion.div>
            
            <AnimatePresence mode="wait">
              <motion.div key={isSuccess ? 'success' : 'form'} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {isSuccess ? t.successTitle : t.title}
                </h1>
                <p className="text-gray-600 text-sm">
                  {isSuccess ? t.successSubtitle : t.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div key="form" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                  <motion.input whileFocus={{ scale: 1.02 }} type="email" value={formData.email} onChange={(e) => updateFormData('email', e.target.value)} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder={t.emailPlaceholder} />
                  {errors.email && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1">
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      {errors.email}
                    </motion.div>
                  )}
                </div>

                {/* Reset Code Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.code}</label>
                  <motion.input whileFocus={{ scale: 1.02 }} type="text" value={formData.code} onChange={(e) => updateFormData('code', e.target.value.replace(/\D/g, '').slice(0, 6))} className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.code ? 'border-red-500' : 'border-gray-300'}`} placeholder={t.codePlaceholder} maxLength={6} />
                  {errors.code && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1">
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      {errors.code}
                    </motion.div>
                  )}
                </div>

                {/* New Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.newPassword}</label>
                  <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                    <input type={showPassword ? "text" : "password"} value={formData.newPassword} onChange={(e) => updateFormData('newPassword', e.target.value)} className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`} placeholder={t.passwordPlaceholder} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </motion.div>
                  {errors.newPassword && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1">
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      {errors.newPassword}
                    </motion.div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.confirmPassword}</label>
                  <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => updateFormData('confirmPassword', e.target.value)} className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} placeholder={t.confirmPlaceholder} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </motion.div>
                  {errors.confirmPassword && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1">
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      {errors.confirmPassword}
                    </motion.div>
                  )}
                </div>

                <motion.button onClick={handleSubmit} disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LockClosedIcon className="w-5 h-5" />
                      <span>{t.resetPassword}</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
                  <CheckCircleIcon className="w-10 h-10 text-green-600" />
                </div>
                
                <motion.a href="/login" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  <span>{t.goToLogin}</span>
                </motion.a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back to Login */}
          {!isSuccess && (
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <motion.a href="/login" whileHover={{ scale: 1.05 }} className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium transition-colors">
                <ArrowLeftIcon className="w-4 h-4" />
                <span>{t.backToLogin}</span>
              </motion.a>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
} 