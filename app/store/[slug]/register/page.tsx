'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useLanguage, LanguageToggle } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { signIn } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomerBusiness } from '../../../hooks/useCustomerBusiness'
import Link from 'next/link'
import Image from 'next/image'

export default function CustomerRegisterPage() {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { business, isLoading: businessLoading } = useCustomerBusiness(slug)
  const [isVisible, setIsVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false
  })

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Language translations
  const translations = {
    en: {
      joinTitle: "Join",
      subtitle: "Create your account and start shopping",
      signupGoogle: "Sign up with Google",
      orEmail: "Or sign up with email",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      phone: "Phone Number (Optional)",
      acceptTerms: "I agree to the Terms & Conditions",
      createAccount: "Create Account",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign in",
      showPassword: "Show password",
      hidePassword: "Hide password",
      backToStore: "Back to Store",
      signingUp: "Creating account...",
      // Validation messages
      firstNameRequired: "First name is required",
      lastNameRequired: "Last name is required",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      passwordRequired: "Password is required",
      passwordTooShort: "Password must be at least 8 characters",
      confirmPasswordRequired: "Please confirm your password",
      passwordsNoMatch: "Passwords do not match",
      termsRequired: "Please accept the terms and conditions"
    },
    sw: {
      joinTitle: "Jiunge na",
      subtitle: "Fungua akaunti yako na uanze ununuzi",
      signupGoogle: "Jisajili kwa Google",
      orEmail: "Au jisajili kwa email",
      firstName: "Jina la Kwanza",
      lastName: "Jina la Mwisho",
      email: "Anuani ya Email",
      password: "Nywila",
      confirmPassword: "Thibitisha Nywila",
      phone: "Namba ya Simu (Si lazima)",
      acceptTerms: "Ninakubali Masharti na Hali",
      createAccount: "Fungua Akaunti",
      alreadyHaveAccount: "Tayari una akaunti?",
      signIn: "Ingia",
      showPassword: "Onyesha nywila",
      hidePassword: "Ficha nywila",
      backToStore: "Rudi Dukani",
      signingUp: "Ninafungua akaunti...",
      // Validation messages
      firstNameRequired: "Jina la kwanza linahitajika",
      lastNameRequired: "Jina la mwisho linahitajika",
      emailRequired: "Email inahitajika",
      emailInvalid: "Tafadhali ingiza email sahihi",
      passwordRequired: "Nywila inahitajika",
      passwordTooShort: "Nywila lazima iwe na angalau herufi 8",
      confirmPasswordRequired: "Tafadhali thibitisha nywila yako",
      passwordsNoMatch: "Nywila hazifanani",
      termsRequired: "Tafadhali kubali masharti na hali"
    }
  }

  const t = translations[language]

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = t.firstNameRequired
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = t.lastNameRequired
    }
    
    if (!formData.email) {
      newErrors.email = t.emailRequired
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.emailInvalid
    }
    
    if (!formData.password) {
      newErrors.password = t.passwordRequired
    } else if (formData.password.length < 8) {
      newErrors.password = t.passwordTooShort
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t.confirmPasswordRequired
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordsNoMatch
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = t.termsRequired
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      // Call registration API
      const response = await fetch('/api/auth/register/customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || null,
          role: 'CUSTOMER'
        }),
      })

      const data = await response.json()

      if (data.success) {
        showSuccess(
          language === 'en' ? 'Account Created!' : 'Akaunti Imetengenezwa!',
          language === 'en' ? 'Please check your email to verify your account.' : 'Tafadhali angalia email yako ili kuthibitisha akaunti yako.'
        )
        
        // Redirect to login after short delay
        setTimeout(() => {
          router.push(`/store/${slug}/login`)
        }, 2000)
      } else {
        showError(
          language === 'en' ? 'Registration Failed' : 'Kusajili Kumeshindwa',
          data.message || (language === 'en' ? 'Something went wrong. Please try again.' : 'Kuna tatizo. Jaribu tena.')
        )
      }

    } catch (error) {
      console.error('Customer registration error:', error)
      showError(
        language === 'en' ? 'Registration Error' : 'Hitilafu ya Kusajili',
        language === 'en' ? 'Something went wrong. Please try again.' : 'Kuna tatizo. Jaribu tena.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true)
    
    try {
      const result = await signIn('google', {
        callbackUrl: `/store/${slug}`,
        redirect: false
      })
      
      if (result?.error) {
        showError(
          language === 'en' ? 'Google Sign Up Failed' : 'Kusajili kwa Google Kumeshindwa',
          result.error
        )
      } else if (result?.url) {
        showSuccess(
          language === 'en' ? 'Welcome!' : 'Karibu!',
          language === 'en' ? 'Your account has been created successfully' : 'Akaunti yako imetengenezwa kikamilifu'
        )
        // Redirect to store
        router.push(`/store/${slug}`)
      }
    } catch (error) {
      console.error('Google signup error:', error)
      showError(
        language === 'en' ? 'Sign Up Error' : 'Hitilafu ya Kusajili',
        language === 'en' ? 'Something went wrong. Please try again.' : 'Kuna tatizo. Jaribu tena.'
      )
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Store Not Found</h1>
          <p className="text-gray-600">The store you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-32 h-32 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-20 h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        className="w-full max-w-md relative z-10"
      >
        {/* Back to Store Link */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between mb-6"
        >
          <Link 
            href={`/store/${slug}`}
            className="flex items-center text-teal-600 hover:text-teal-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.backToStore}
          </Link>
          <LanguageToggle />
        </motion.div>

        {/* Main Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl shadow-2xl p-8 transition-all duration-500"
        >
          {/* Business Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            >
                             {business.businessSetting?.logoUrl ? (
                 <Image 
                   src={business.businessSetting.logoUrl} 
                   alt={business.name}
                   className="w-16 h-16 object-cover rounded-xl"
                 />
               ) : (
                <span className="text-2xl font-bold text-white">
                  {business.name.charAt(0).toUpperCase()}
                </span>
              )}
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-2xl font-bold text-gray-800 mb-2"
            >
              {t.joinTitle} {business.name}
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-gray-600 text-sm"
            >
              {t.subtitle}
            </motion.p>
          </div>

          {/* Google Sign Up Button */}
          <motion.button
            variants={itemVariants}
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white border border-gray-300 hover:border-gray-400 rounded-xl py-4 px-6 flex items-center justify-center space-x-3 mb-6 transition-all duration-300 hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700 group-hover:text-gray-900">
              {isGoogleLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                  {t.signingUp}
                </>
              ) : (
                t.signupGoogle
              )}
            </span>
          </motion.button>

          {/* Divider */}
          <motion.div 
            variants={itemVariants}
            className="relative mb-6"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                {t.orEmail}
              </span>
            </div>
          </motion.div>

          {/* Email Registration Form */}
          <motion.form 
            variants={itemVariants}
            onSubmit={handleEmailSignup}
            className="space-y-5"
          >
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.firstName}
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.lastName}
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.email}
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t.password}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Phone Input (Optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                {t.phone}
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                placeholder="+255 123 456 789"
              />
            </div>

            {/* Terms Checkbox */}
            <div>
              <div className="flex items-start">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="acceptTerms" className="ml-3 block text-sm text-gray-700 leading-5">
                  {t.acceptTerms}
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>
              )}
            </div>

            {/* Create Account Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                  {t.signingUp}
                </>
              ) : (
                t.createAccount
              )}
            </motion.button>
          </motion.form>

          {/* Sign In Link */}
          <motion.div 
            variants={itemVariants}
            className="text-center mt-8 pt-6 border-t border-gray-200"
          >
            <p className="text-gray-600 mb-3">
              {t.alreadyHaveAccount}
            </p>
            <Link 
              href={`/store/${slug}/login`}
              className="text-teal-600 hover:text-teal-700 font-semibold text-lg transition-colors"
            >
              {t.signIn}
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}