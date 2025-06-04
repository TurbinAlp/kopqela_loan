'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  LockClosedIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useLanguage, LanguageToggle } from '../contexts/LanguageContext'

export default function ResetPasswordPage() {
  const { language } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const translations = {
    en: {
      title: "Reset Your Password",
      subtitle: "Create a new secure password",
      successTitle: "Password Reset Successfully!",
      successSubtitle: "Your password has been updated",
      password: "New Password",
      confirmPassword: "Confirm Password",
      resetPassword: "Reset Password",
      signIn: "Sign In Now",
      passwordStrength: "Password Strength:",
      weak: "Weak",
      fair: "Fair", 
      good: "Good",
      strong: "Strong",
      requirements: "Password Requirements:",
      minLength: "At least 8 characters",
      hasNumber: "Contains a number",
      hasUpper: "Contains uppercase letter",
      hasLower: "Contains lowercase letter",
      hasSpecial: "Contains special character",
      passwordRequired: "New password is required",
      passwordMinLength: "Password must be at least 8 characters",
      passwordsMatch: "Passwords do not match",
      successMessage: "You can now sign in with your new password"
    },
    sw: {
      title: "Badilisha Nywila Yako",
      subtitle: "Tengeneza nywila mpya salama",
      successTitle: "Nywila Imebadilishwa!",
      successSubtitle: "Nywila yako imesasishwa",
      password: "Nywila Mpya",
      confirmPassword: "Thibitisha Nywila",
      resetPassword: "Badilisha Nywila",
      signIn: "Ingia Sasa",
      passwordStrength: "Nguvu ya Nywila:",
      weak: "Dhaifu",
      fair: "Wastani",
      good: "Nzuri",
      strong: "Nguvu",
      requirements: "Mahitaji ya Nywila:",
      minLength: "Angalau vibambo 8",
      hasNumber: "Ina namba",
      hasUpper: "Ina herufi kubwa",
      hasLower: "Ina herufi ndogo",
      hasSpecial: "Ina alama maalum",
      passwordRequired: "Nywila mpya inahitajika",
      passwordMinLength: "Nywila lazima iwe na vibambo 8 au zaidi",
      passwordsMatch: "Nywila hazifanani",
      successMessage: "Sasa unaweza kuingia kwa nywila yako mpya"
    }
  }

  const t = translations[language]

  const getPasswordStrength = (password: string) => {
    let score = 0
    const checks = {
      length: password.length >= 8,
      number: /\d/.test(password),
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    }

    Object.values(checks).forEach(check => check && score++)

    if (score <= 2) return { strength: 'weak', color: 'bg-red-500', percentage: 25 }
    if (score === 3) return { strength: 'fair', color: 'bg-yellow-500', percentage: 50 }
    if (score === 4) return { strength: 'good', color: 'bg-blue-500', percentage: 75 }
    return { strength: 'strong', color: 'bg-green-500', percentage: 100 }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const getRequirementStatus = (password: string) => ({
    length: password.length >= 8,
    number: /\d/.test(password),
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  })

  const requirements = getRequirementStatus(formData.password)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) newErrors.password = t.passwordRequired
    else if (formData.password.length < 8) newErrors.password = t.passwordMinLength
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordsMatch
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
    }, 2000)
  }

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
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
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 flex items-center justify-center p-4 relative overflow-hidden">
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
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
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
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.password}</label>
                  <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                    <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => updateFormData({ password: e.target.value })} className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.password ? 'border-red-500' : 'border-gray-300'}`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </motion.div>
                  {errors.password && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1">
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      {errors.password}
                    </motion.div>
                  )}
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{t.passwordStrength}</span>
                        <span className={`text-sm font-semibold ${passwordStrength.strength === 'weak' ? 'text-red-500' : passwordStrength.strength === 'fair' ? 'text-yellow-500' : passwordStrength.strength === 'good' ? 'text-blue-500' : 'text-green-500'}`}>
                          {t[passwordStrength.strength as keyof typeof t]}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div className={`h-2 rounded-full ${passwordStrength.color}`} initial={{ width: 0 }} animate={{ width: `${passwordStrength.percentage}%` }} transition={{ duration: 0.3 }} />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{t.requirements}</p>
                      <div className="space-y-1">
                        {[
                          { key: 'length', text: t.minLength },
                          { key: 'number', text: t.hasNumber },
                          { key: 'upper', text: t.hasUpper },
                          { key: 'lower', text: t.hasLower },
                          { key: 'special', text: t.hasSpecial }
                        ].map(({ key, text }) => (
                          <motion.div key={key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`flex items-center text-sm ${requirements[key as keyof typeof requirements] ? 'text-green-600' : 'text-gray-500'}`}>
                            <CheckCircleIcon className={`w-4 h-4 mr-2 ${requirements[key as keyof typeof requirements] ? 'text-green-500' : 'text-gray-300'}`} />
                            {text}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.confirmPassword}</label>
                  <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => updateFormData({ confirmPassword: e.target.value })} className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
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

                <motion.button onClick={handleSubmit} disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
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
              <motion.div key="success" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="space-y-6 text-center">
                <div className="w-20 h-20 bg-teal-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <CheckCircleIcon className="w-10 h-10 text-teal-600" />
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t.successMessage}
                </p>
                
                <motion.a href="/login" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  <span>{t.signIn}</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.a>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
} 