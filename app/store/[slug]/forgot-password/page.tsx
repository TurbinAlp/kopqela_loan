'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage, LanguageToggle } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { useParams } from 'next/navigation'
import { useCustomerBusiness } from '../../../hooks/useCustomerBusiness'
import Link from 'next/link'

export default function CustomerForgotPasswordPage() {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const params = useParams()
  const slug = params.slug as string
  const { business, isLoading: businessLoading } = useCustomerBusiness(slug)
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Language translations
  const translations = {
    en: {
      title: "Forgot Password?",
      subtitle: "Enter your email address and we'll send you a link to reset your password",
      emailSent: "Check Your Email",
      emailSentSubtitle: "We've sent a password reset link to",
      email: "Email Address",
      sendResetLink: "Send Reset Link",
      backToLogin: "Back to Sign In",
      backToStore: "Back to Store",
      rememberPassword: "Remember your password?",
      signIn: "Sign in",
      sendingEmail: "Sending...",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      checkSpam: "Don't see the email? Check your spam folder.",
      resendEmail: "Resend Email",
      returnToLogin: "Return to Sign In"
    },
    sw: {
      title: "Umesahau Nywila?",
      subtitle: "Ingiza anuani yako ya email na tutakutumia kiungo cha kubadilisha nywila",
      emailSent: "Angalia Email Yako",
      emailSentSubtitle: "Tumetuma kiungo cha kubadilisha nywila kwenda",
      email: "Anuani ya Email",
      sendResetLink: "Tuma Kiungo cha Kubadilisha",
      backToLogin: "Rudi Kuingia",
      backToStore: "Rudi Dukani",
      rememberPassword: "Umekumbuka nywila yako?",
      signIn: "Ingia",
      sendingEmail: "Ninatuma...",
      emailRequired: "Email inahitajika",
      emailInvalid: "Tafadhali ingiza email sahihi",
      checkSpam: "Huoni email? Angalia kwenye spam folder.",
      resendEmail: "Tuma Tena Email",
      returnToLogin: "Rudi Kuingia"
    }
  }

  const t = translations[language]

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!email) {
      newErrors.email = t.emailRequired
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t.emailInvalid
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setIsEmailSent(true)
        showSuccess(
          language === 'en' ? 'Email Sent!' : 'Email Imetumwa!',
          language === 'en' ? 'Check your email for reset instructions.' : 'Angalia email yako kwa maelekezo ya kubadilisha.'
        )
      } else {
        showError(
          language === 'en' ? 'Send Failed' : 'Kutuma Kumeshindwa',
          data.message || (language === 'en' ? 'Something went wrong. Please try again.' : 'Kuna tatizo. Jaribu tena.')
        )
      }

    } catch (error) {
      console.error('Forgot password error:', error)
      showError(
        language === 'en' ? 'Send Error' : 'Hitilafu ya Kutuma',
        language === 'en' ? 'Something went wrong. Please try again.' : 'Kuna tatizo. Jaribu tena.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = () => {
    setIsEmailSent(false)
    setEmail('')
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
        {/* Back Links */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between mb-6"
        >
          <Link 
            href={`/store/${slug}/login`}
            className="flex items-center text-teal-600 hover:text-teal-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.backToLogin}
          </Link>
          <LanguageToggle />
        </motion.div>

        {/* Main Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl shadow-2xl p-8 transition-all duration-500"
        >
          {!isEmailSent ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </motion.div>
                
                <motion.h1 
                  variants={itemVariants}
                  className="text-2xl font-bold text-gray-800 mb-2"
                >
                  {t.title}
                </motion.h1>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-gray-600 text-sm"
                >
                  {t.subtitle}
                </motion.p>
              </div>

              {/* Reset Form */}
              <motion.form 
                variants={itemVariants}
                onSubmit={handleSendResetLink}
                className="space-y-6"
              >
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: '' }))
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Send Reset Link Button */}
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
                      {t.sendingEmail}
                    </>
                  ) : (
                    t.sendResetLink
                  )}
                </motion.button>
              </motion.form>

              {/* Back to Login Link */}
              <motion.div 
                variants={itemVariants}
                className="text-center mt-8 pt-6 border-t border-gray-200"
              >
                <p className="text-gray-600 mb-3">
                  {t.rememberPassword}
                </p>
                <Link 
                  href={`/store/${slug}/login`}
                  className="text-teal-600 hover:text-teal-700 font-semibold text-lg transition-colors"
                >
                  {t.signIn}
                </Link>
              </motion.div>
            </>
          ) : (
            /* Email Sent Success State */
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a1 1 0 001.42 0L21 7M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-800 mb-2"
              >
                {t.emailSent}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mb-2"
              >
                {t.emailSentSubtitle}
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-teal-600 font-semibold mb-6"
              >
                {email}
              </motion.p>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-500 text-sm mb-8"
              >
                {t.checkSpam}
              </motion.p>

              <div className="space-y-4">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleResendEmail}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  {t.resendEmail}
                </motion.button>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center pt-4 border-t border-gray-200"
                >
                  <Link 
                    href={`/store/${slug}/login`}
                    className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                  >
                    {t.returnToLogin}
                  </Link>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}