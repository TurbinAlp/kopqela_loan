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

export default function ForgotPasswordPage() {
  const { language } = useLanguage()
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
      successSubtitle: "We've sent a password reset link to",
      email: "Email Address",
      sendLink: "Send Reset Link",
      backToLogin: "Back to Login",
      resendLink: "Resend Link",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      checkInbox: "Check your inbox and click the link to reset your password",
      didntReceive: "Didn't receive the email?",
      checkSpam: "Check your spam folder or"
    },
    sw: {
      title: "Umesahau Nywila?",
      subtitle: "Ingiza email yako ili kubadilisha nywila",
      successTitle: "Angalia Email Yako!",
      successSubtitle: "Tumetuma kiungo cha kubadilisha nywila kwa",
      email: "Anuani ya Email",
      sendLink: "Tuma Kiungo cha Kubadilisha",
      backToLogin: "Rudi Kwenye Kuingia",
      resendLink: "Tuma Tena",
      emailRequired: "Email inahitajika",
      emailInvalid: "Tafadhali ingiza email sahihi",
      checkInbox: "Angalia barua pepe yako na ubofye kiungo ili kubadilisha nywila",
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
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
    }, 2000)
  }

  const handleResend = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
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