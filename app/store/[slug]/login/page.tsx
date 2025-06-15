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

export default function CustomerLoginPage() {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { business, isLoading: businessLoading } = useCustomerBusiness(slug)
  const [isVisible, setIsVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Language translations
  const translations = {
    en: {
      welcome: "Welcome to",
      subtitle: "Sign in to your account to start shopping",
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
      passwordRequired: "Password is required",
      backToStore: "Back to Store",
      signingIn: "Signing in...",
      signUpFree: "Sign up - It's free!",
      customerLogin: "Customer Login"
    },
    sw: {
      welcome: "Karibu",
      subtitle: "Ingia kwenye akaunti yako ili kuanza ununuzi",
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
      passwordRequired: "Nywila inahitajika",
      backToStore: "Rudi Dukani",
      signingIn: "Ninaingia...",
      signUpFree: "Jisajili - Ni bure!",
      customerLogin: "Kuingia kwa Mteja"
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
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: `/store/${slug}`,
        redirect: false
      })

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          showError(
            language === 'en' ? 'Login Failed' : 'Kuingia Kumeshindwa',
            language === 'en' ? 'Invalid email or password' : 'Email au nenosiri sio sahihi'
          )
        } else {
          showError(
            language === 'en' ? 'Login Failed' : 'Kuingia Kumeshindwa',
            result.error
          )
        }
      } else if (result?.url) {
        showSuccess(
          language === 'en' ? 'Welcome back!' : 'Karibu tena!',
          language === 'en' ? 'You are now signed in' : 'Sasa umeingia'
        )
        
        // Redirect to store
        router.push(`/store/${slug}`)
      }

    } catch (error) {
      console.error('Customer login error:', error)
      showError(
        language === 'en' ? 'Login Error' : 'Hitilafu ya Kuingia',
        language === 'en' ? 'Something went wrong. Please try again.' : 'Kuna tatizo. Jaribu tena.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    
    try {
      const result = await signIn('google', {
        callbackUrl: `/store/${slug}`,
        redirect: false
      })
      
      if (result?.error) {
        showError(
          language === 'en' ? 'Google Sign In Failed' : 'Kuingia kwa Google Kumeshindwa',
          result.error
        )
      } else if (result?.url) {
        showSuccess(
          language === 'en' ? 'Welcome!' : 'Karibu!',
          language === 'en' ? 'You are now signed in' : 'Sasa umeingia'
        )
        // Redirect to store
        router.push(`/store/${slug}`)
      }
    } catch (error) {
      console.error('Google login error:', error)
      showError(
        language === 'en' ? 'Sign In Error' : 'Hitilafu ya Kuingia',
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
                             {business.businessSetting?.logo ? (
                 <img 
                   src={business.businessSetting.logo} 
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
              {t.welcome} {business.name}
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-gray-600 text-sm"
            >
              {t.subtitle}
            </motion.p>
          </div>

          {/* Google Sign In Button */}
          <motion.button
            variants={itemVariants}
            onClick={handleGoogleLogin}
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
                  {t.signingIn}
                </>
              ) : (
                t.continueGoogle
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

          {/* Email Login Form */}
          <motion.form 
            variants={itemVariants}
            onSubmit={handleEmailLogin}
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
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  {t.rememberMe}
                </label>
              </div>
              <Link 
                href={`/store/${slug}/forgot-password`}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                {t.forgotPassword}
              </Link>
            </div>

            {/* Sign In Button */}
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
                  {t.signingIn}
                </>
              ) : (
                t.signIn
              )}
            </motion.button>
          </motion.form>

          {/* Sign Up Link */}
          <motion.div 
            variants={itemVariants}
            className="text-center mt-8 pt-6 border-t border-gray-200"
          >
            <p className="text-gray-600 mb-3">
              {t.noAccount}
            </p>
            <Link 
              href={`/store/${slug}/register`}
              className="text-teal-600 hover:text-teal-700 font-semibold text-lg transition-colors"
            >
              {t.signUpFree}
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}