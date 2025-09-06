'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useLanguage, LanguageToggle } from '../contexts/LanguageContext'
import { useNotifications } from '../contexts/NotificationContext'
import { signIn } from 'next-auth/react'
import { useAuthRedirect } from '../hooks/useAuthRedirect'
import Spinner from '../components/ui/Spinner'

function LoginPageContent() {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const { isLoading: authLoading } = useAuthRedirect()
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isFormFocused, setIsFormFocused] = useState(false)

  // Animated entrance effect
  useEffect(() => {
    setIsVisible(true)
    
    // Check if user just verified their email
    const verified = searchParams.get('verified')
    if (verified === 'true') {
      showSuccess(
        language === 'en' ? 'Email Verified!' : 'Barua Pepe Imehakikiwa!',
        language === 'en' ? 'Your account has been verified. You can now login.' : 'Akaunti yako imehakikiwa. Sasa unaweza kuingia.'
      )
    }
  }, [searchParams, language, showSuccess])

  // Language translations
  const translations = {
    en: {
      welcome: "Welcome Back",
      subtitle: "Sign in to your account to continue",
      continueGoogle: "Continue with Google",
      orEmail: "Or continue with email",
      email: "Email Address",
      password: "Password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      signIn: "Sign In",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
      showPassword: "Show password",
      hidePassword: "Hide password",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      passwordRequired: "Password is required"
    },
    sw: {
      welcome: "Karibu Tena",
      subtitle: "Ingia kwenye akaunti yako ili kuendelea",
      continueGoogle: "Endelea na Google",
      orEmail: "Au endelea na email",
      email: "Anuani ya Email",
      password: "Nywila",
      rememberMe: "Nikumbuke",
      forgotPassword: "Umesahau nywila?",
      signIn: "Ingia",
      noAccount: "Huna akaunti?",
      signUp: "Jisajili",
      showPassword: "Onyesha nywila",
      hidePassword: "Ficha nywila",
      emailRequired: "Email inahitajika",
      emailInvalid: "Tafadhali ingiza email sahihi",
      passwordRequired: "Nywila inahitajika"
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
    
    if (!password) {
      newErrors.password = t.passwordRequired
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      // First, check credentials and verification status
      const checkResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const checkData = await checkResponse.json()

      if (!checkData.success) {
        if (checkData.error === 'UNVERIFIED_EMAIL') {
          // Redirect to existing verification page
          window.location.href = `/register?email=${encodeURIComponent(email)}`
          return
        } else if (checkData.error === 'ACCOUNT_INACTIVE') {
          showError(
            language === 'en' ? 'Account Inactive' : 'Akaunti Haifanyi Kazi',
            language === 'en' ? 'Your account is not active. Please contact your administrator or verify your email.' : 'Akaunti yako haifanyi kazi. Wasiliana na msimamizi wako au hakiki barua pepe yako.'
          )
          return
        } else {
          // Invalid credentials or other error
          showError(
            language === 'en' ? 'Login Failed' : 'Kuingia Kumeshindwa',
            language === 'en' ? 'Invalid email or password. Please check your credentials.' : 'Email au nenosiri sio sahihi. Angalia taarifa zako.'
          )
          return
        }
      }

      // If check passed, proceed with NextAuth
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/admin/dashboard',
        redirect: false // Handle redirect manually for better error handling
      })

      if (result?.error) {
        // Handle NextAuth errors (should be rare now)
        showError(
          language === 'en' ? 'Login Failed' : 'Kuingia Kumeshindwa',
          language === 'en' ? 'Authentication failed. Please try again.' : 'Uthibitisho umeshindwa. Jaribu tena.'
        )
      } else if (result?.ok) {
        // Login successful, redirect manually
        window.location.href = result.url || '/admin/dashboard'
      }

    } catch (error) {
      console.error('Login error:', error)
      showError(
        language === 'en' ? 'Login Error' : 'Hitilafu ya Kuingia',
        language === 'en' ? 'Something went wrong. Please try again.' : 'Kuna tatizo. Jaribu tena.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      // Let NextAuth handle the redirect automatically
      await signIn('google', {
        callbackUrl: '/admin/dashboard'
      })
    } catch (error) {
      console.error('Google login error:', error)
      showError(
        language === 'en' ? 'Sign In Error' : 'Hitilafu ya Kuingia',
        language === 'en' ? 'Something went wrong. Please try again.' : 'Kuna tatizo. Jaribu tena.'
      )
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

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Show loading screen while checking authentication - prevents flash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="lg" color="white" />
          <div className="text-white text-lg font-medium">Checking authentication...</div>
        </div>
      </div>
    )
  }

  // If authenticated, the useAuthRedirect hook will handle the redirect
  // This component will not render for authenticated users

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          variants={floatingVariants}
          animate="animate"
          className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
        />
        <motion.div 
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "1s" }}
          className="absolute top-40 right-20 w-24 h-24 bg-white/15 rounded-full blur-lg"
        />
        <motion.div 
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "2s" }}
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        className="w-full max-w-md relative z-10"
      >
        {/* Language Toggle */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-end mb-6"
        >
          <LanguageToggle />
        </motion.div>

        {/* Main Card */}
        <motion.div 
          variants={itemVariants}
          className={`bg-white rounded-3xl shadow-2xl p-8 transition-all duration-500 ${
            isFormFocused ? 'shadow-3xl scale-[1.02]' : ''
          }`}
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              variants={pulseVariants}
              animate="animate"
              className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            >
              <span className="text-2xl font-bold text-white">K</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-3xl font-bold text-gray-800 mb-2"
            >
              {t.welcome}
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-gray-600"
            >
              {t.subtitle}
            </motion.p>
          </div>

          {/* Google Sign In Button */}
          <motion.button
            variants={itemVariants}
            onClick={handleGoogleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white border border-gray-300 hover:border-gray-400 rounded-xl py-4 px-6 flex items-center justify-center space-x-3 mb-6 transition-all duration-300 hover:shadow-lg group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700 group-hover:text-gray-900">
              {t.continueGoogle}
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

          {/* Email Login Form */}
          <motion.form 
            variants={itemVariants}
            onSubmit={handleEmailLogin}
            onFocus={() => setIsFormFocused(true)}
            onBlur={() => setIsFormFocused(false)}
            className="space-y-6"
          >
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.email}
              </label>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                className="relative"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-6 left-0 flex items-center text-red-500 text-sm"
                  >
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    {errors.email}
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.password}
              </label>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                className="relative"
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title={showPassword ? t.hidePassword : t.showPassword}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
                {errors.password && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-6 left-0 flex items-center text-red-500 text-sm"
                  >
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    {errors.password}
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <motion.label 
                whileHover={{ scale: 1.05 }}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-300 ${
                  rememberMe 
                    ? 'bg-teal-500 border-teal-500' 
                    : 'border-gray-300 hover:border-teal-500'
                }`}>
                  {rememberMe && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <CheckCircleIcon className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {t.rememberMe}
                </span>
              </motion.label>

              <motion.a
                whileHover={{ scale: 1.05 }}
                href="/forgot-password"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                {t.forgotPassword}
              </motion.a>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </motion.div>
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {t.signIn}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.form>

          {/* Sign Up Link */}
          <motion.div 
            variants={itemVariants}
            className="text-center mt-8"
          >
            <span className="text-gray-600">{t.noAccount} </span>
            <motion.a
              whileHover={{ scale: 1.05 }}
              href="/register"
              className="text-teal-600 hover:text-teal-700 font-semibold"
            >
              {t.signUp}
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner /></div>}>
      <LoginPageContent />
    </Suspense>
  )
} 