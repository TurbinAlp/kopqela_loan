'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { useLanguage, LanguageToggle } from '../contexts/LanguageContext'
import { useNotifications } from '../contexts/NotificationContext'
import { useAuthRedirect } from '../hooks/useAuthRedirect'
import Spinner from '../components/ui/Spinner'

export default function ForgotPasswordPage() {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const { isLoading: authLoading } = useAuthRedirect()
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const translations = {
    en: {
      title: "Forgot Password?",
      subtitle: "Enter your email to reset your password",
      successTitle: "Check Your Email!",
      successSubtitle: "We've sent a password reset code to",
      email: "Email Address",
      sendLink: "Send Reset Code",
      backToLogin: "Back to Login",
      resendLink: "Resend Link",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      checkInbox: "Check your inbox for the 6-digit code to reset your password",
      didntReceive: "Didn't receive the email?",
      checkSpam: "Check your spam folder or"
    },
    sw: {
      title: "Umesahau Nywila?",
      subtitle: "Ingiza email yako ili kubadilisha nywila",
      successTitle: "Angalia Email Yako!",
      successSubtitle: "Tumetuma nambari ya kubadilisha nywila kwa",
      email: "Anuani ya Email",
      sendLink: "Tuma Nambari ya Kubadilisha",
      backToLogin: "Rudi Kwenye Kuingia",
      resendLink: "Tuma Tena",
      emailRequired: "Email inahitajika",
      emailInvalid: "Tafadhali ingiza email sahihi",
      checkInbox: "Angalia barua pepe yako kwa nambari ya tarakimu 6 ili kubadilisha nywila",
      didntReceive: "Hujapokea email?",
      checkSpam: "Angalia folda ya spam au"
    }
  }

  const t = translations[language]

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const handleSubmit = async () => {
    setError('')
    
    if (!email.trim()) {
      setError(t.emailRequired)
      return
    }
    
    if (!validateEmail(email)) {
      setError(t.emailInvalid)
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setIsSuccess(true)
        showSuccess(
          language === 'en' ? 'Reset Code Sent!' : 'Nambari Imetumwa!',
          data.data?.message || 'Password reset code sent successfully'
        )
        
        // Auto-redirect to reset password page after 3 seconds
        setTimeout(() => {
          window.location.href = `/reset-password?email=${encodeURIComponent(email)}`
        }, 3000)
      } else {
        if (data.field) {
          setError(data.error)
        } else {
          showError(
            language === 'en' ? 'Request Failed' : 'Ombi Limeshindwa',
            data.error || 'Failed to send reset code'
          )
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      showError(
        language === 'en' ? 'Network Error' : 'Hitilafu ya Mtandao',
        language === 'en' ? 'Please check your connection and try again' : 'Angalia muunganisho wako na ujaribu tena'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        showSuccess(
          language === 'en' ? 'New Code Sent!' : 'Nambari Mpya Imetumwa!',
          data.data?.message || 'New reset code sent successfully'
        )
      } else {
        showError(
          language === 'en' ? 'Resend Failed' : 'Kutuma Tena Kumeshindwa',
          data.error || 'Failed to resend reset code'
        )
      }
    } catch (error) {
      console.error('Resend error:', error)
      showError(
        language === 'en' ? 'Network Error' : 'Hitilafu ya Mtandao',
        language === 'en' ? 'Please check your connection and try again' : 'Angalia muunganisho wako na ujaribu tena'
      )
    } finally {
      setIsLoading(false)
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

  // Show loading screen while checking authentication - prevents flash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="lg" color="white" />
        </div>
      </div>
    )
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
              {isSuccess ? <CheckCircleIcon className="w-8 h-8 text-white" /> : <SparklesIcon className="w-8 h-8 text-white" />}
            </motion.div>
            
            <AnimatePresence mode="wait">
              <motion.div key={isSuccess ? 'success' : 'form'} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {isSuccess ? t.successTitle : t.title}
                </h1>
                <p className="text-gray-600 text-sm">
                  {isSuccess ? (
                    <>
                      {t.successSubtitle}
                      <br />
                      <span className="font-semibold text-teal-600">{email}</span>
                    </>
                  ) : (
                    t.subtitle
                  )}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div key="form" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                  <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-4 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${error ? 'border-red-500' : 'border-gray-300'}`} placeholder="john@example.com" />
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                  </motion.div>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1">
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      {error}
                    </motion.div>
                  )}
                </div>

                <motion.button onClick={handleSubmit} disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <EnvelopeIcon className="w-5 h-5" />
                      <span>{t.sendLink}</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="space-y-6 text-center">
                <div className="w-20 h-20 bg-teal-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <EnvelopeIcon className="w-10 h-10 text-teal-600" />
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t.checkInbox}
                </p>
                
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    {language === 'en' ? 'Next Step:' : 'Hatua Ijayo:'}
                  </p>
                  <p className="text-sm text-blue-700">
                    {language === 'en' 
                      ? 'Once you get the code, visit the Reset Password page to enter your code and new password.'
                      : 'Ukipokea nambari, tembelea ukurasa wa Kubadilisha Nywila ili uweke nambari na nywila mpya.'
                    }
                  </p>
                  <motion.a 
                    href="/reset-password" 
                    whileHover={{ scale: 1.02 }}
                    className="inline-block mt-2 text-blue-600 hover:text-blue-800 font-semibold text-sm underline"
                  >
                    {language === 'en' ? '→ Go to Reset Password Page' : '→ Nenda Kwenye Ukurasa wa Kubadilisha Nywila'}
                  </motion.a>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>{t.didntReceive}</p>
                  <p className="mt-2">
                    {t.checkSpam}{' '}
                    <motion.button onClick={handleResend} disabled={isLoading} whileHover={{ scale: 1.05 }} className="text-teal-600 hover:text-teal-700 font-semibold disabled:opacity-50">
                      {isLoading ? (
                        <span className="inline-flex items-center">
                          <div className="w-3 h-3 border border-teal-600 border-t-transparent rounded-full animate-spin mr-1" />
                          {t.resendLink}
                        </span>
                      ) : (
                        t.resendLink
                      )}
                    </motion.button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back to Login */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <motion.a href="/login" whileHover={{ scale: 1.05 }} className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
              <span>{t.backToLogin}</span>
            </motion.a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 