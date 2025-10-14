'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useLanguage, LanguageToggle } from '../contexts/LanguageContext'
import { useNotifications } from '../contexts/NotificationContext'
import { signIn } from 'next-auth/react'
import { useAuthRedirect } from '../hooks/useAuthRedirect'
import Spinner from '../components/ui/Spinner'

type RegistrationStep = 'method' | 'details' | 'plan' | 'business' | 'verification'

function RegisterPageContent() {
  const { language } = useLanguage()
  const { showWarning, showError, showSuccess } = useNotifications()
  const { isLoading: authLoading } = useAuthRedirect()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('method')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [verificationTimer, setVerificationTimer] = useState(60)
  
  // Plan selection state
  const [plans, setPlans] = useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)

  
  const [formData, setFormData] = useState({
    method: null as 'google' | 'email' | null,
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false,
    planId: null as number | null, // Selected subscription plan
    businessName: '',
    businessType: '',
    businessCategory: '',
    businessDescription: '',
    registrationNumber: '',
    businessAddress: '',
    verificationCode: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setIsVisible(true)
    
    // Check if user came from employee invitation
    const emailParam = searchParams.get('email')
    if (emailParam) {
      // If email is provided, this is likely an employee verification
      setFormData(prev => ({ ...prev, email: emailParam }))
      setCurrentStep('verification') // Skip to verification step
    }
  }, [searchParams])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentStep === 'verification' && verificationTimer > 0) {
      interval = setInterval(() => {
        setVerificationTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [currentStep, verificationTimer])

  // Fetch subscription plans when entering plan step
  useEffect(() => {
    if (currentStep === 'plan') {
      const fetchPlans = async () => {
        setLoadingPlans(true)
        try {
          const response = await fetch('/api/subscription/plans')
          const data = await response.json()
          if (data.success) {
            setPlans(data.data)
          }
        } catch (error) {
          console.error('Error fetching plans:', error)
          showError('Error', 'Failed to load subscription plans')
        } finally {
          setLoadingPlans(false)
        }
      }
      fetchPlans()
    }
  }, [currentStep, showError])

  const translations = {
    en: {
      getStarted: "Start Your Business Journey!",
      subtitle: "Register your business on our platform",
      signupGoogle: "Sign up with Google",
      orSignup: "Or sign up with email",
      signupEmail: "Sign up with Email",
      createAccount: "Create Business Account",
      detailsSubtitle: "Tell us about yourself as the business owner",
      fullName: "Full Name",
      email: "Email Address", 
      password: "Password",
      confirmPassword: "Confirm Password",
      phone: "Phone Number (Optional)",
      acceptTerms: "I agree to the Terms & Conditions",
      businessInfo: "Business Information",
      businessSubtitle: "Tell us about your business",
      businessName: "Business Name",
      businessType: "Business Type",
      selectBusinessType: "Select business type",
      businessCategory: "Business Category",
      selectBusinessCategory: "Select business category",
      businessDescription: "Business Description",
      registrationNumber: "Registration Number",
      businessAddress: "Business Address",
      verifyEmail: "Verify Your Email",
      verificationSubtitle: "We sent a code to",
      enterCode: "Enter 6-digit code",
      didntReceive: "Didn't receive the code?",
      resendIn: "Resend in",
      resendNow: "Resend now",
      sending: "Sending...",
      codeSentSuccess: "New verification code sent to your email!",
      next: "Next",
      previous: "Back", 
      createAccountBtn: "Create Account",
      verify: "Verify",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign in",
      // Business Types
      retail: "Retail",
      wholesale: "Wholesale",
      both: "Both (Wholesale & Retail)",
      electronics: "Electronics",
      fashion: "Fashion",
      pharmacy: "Pharmacy",
      restaurant: "Restaurant",
      grocery: "Grocery",
      service: "Service",
      other: "Other",
      // Validation messages
      nameRequired: "Full name is required",
      emailRequired: "Email is required", 
      emailInvalid: "Please enter a valid email",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 8 characters",
      passwordsMatch: "Passwords do not match",
      termsRequired: "Please accept the terms and conditions",
      businessNameRequired: "Business name is required",
      businessTypeRequired: "Please select business type",
      businessDescRequired: "Business description is required",
      businessAddressRequired: "Business address is required",
      codeRequired: "Verification code is required",
      codeInvalid: "Please enter a valid 6-digit code",
      // Plan selection
      choosePlan: 'Choose Your Plan',
      choosePlanSubtitle: 'Select a plan to start your 30-day free trial',
      planRequired: 'Please select a plan to continue'
    },
    sw: {
      getStarted: "Anza Safari ya Biashara!",
      subtitle: "Sajili biashara yako kwenye jukwaa letu",
      signupGoogle: "Jisajili kwa Google",
      orSignup: "Au jisajili kwa email", 
      signupEmail: "Jisajili kwa Email",
      createAccount: "Tengeneza Akaunti ya Biashara",
      detailsSubtitle: "Tuambie kuhusu wewe kama mmiliki wa biashara",
      fullName: "Jina Kamili",
      email: "Anuani ya Email",
      password: "Nywila", 
      confirmPassword: "Thibitisha Nywila",
      phone: "Namba ya Simu (Si Lazima)",
      acceptTerms: "Nakubali Masharti na Vigezo",
      businessInfo: "Maelezo ya Biashara",
      businessSubtitle: "Tuambie kuhusu biashara yako",
      businessName: "Jina la Biashara",
      businessType: "Aina ya Biashara",
      selectBusinessType: "Chagua aina ya biashara",
      businessCategory: "Kundi la Biashara",
      selectBusinessCategory: "Chagua kundi la biashara",
      businessDescription: "Maelezo ya Biashara",
      registrationNumber: "Namba ya Usajili ",
      businessAddress: "Anwani ya Biashara",
      verifyEmail: "Thibitisha Email Yako",
      verificationSubtitle: "Tumetuma nambari kwa",
      enterCode: "Ingiza nambari ya takwimu 6",
      didntReceive: "Hujapokea nambari?", 
      resendIn: "Tuma tena baada ya",
      resendNow: "Tuma tena sasa",
      sending: "Inatuma...",
      codeSentSuccess: "Nambari mpya imetumwa kwenye email yako!",
      next: "Mbele",
      previous: "Rudi",
      createAccountBtn: "Tengeneza Akaunti",
      verify: "Thibitisha", 
      alreadyHaveAccount: "Tayari una akaunti?",
      signIn: "Ingia",
      // Business Types
      retail: "Rejareja",
      wholesale: "Jumla",
      both: "Zote (Jumla & Rejareja)",
      electronics: "Vifaa vya Umeme",
      fashion: "Nguo & Mitindo",
      pharmacy: "Duka la Dawa",
      restaurant: "Mgahawa",
      grocery: "Vyakula & Mboga",
      service: "Huduma",
      other: "Nyingine",
      // Validation messages
      nameRequired: "Jina kamili linahitajika",
      emailRequired: "Email inahitajika",
      emailInvalid: "Tafadhali ingiza email sahihi", 
      passwordRequired: "Nywila inahitajika",
      passwordMinLength: "Nywila lazima iwe na vibambo 8 au zaidi",
      passwordsMatch: "Nywila hazifanani",
      termsRequired: "Tafadhali kubali masharti na vigezo",
      businessNameRequired: "Jina la biashara linahitajika",
      businessTypeRequired: "Tafadhali chagua aina ya biashara",
      businessDescRequired: "Maelezo ya biashara yanahitajika",
      businessAddressRequired: "Anwani ya biashara inahitajika",
      codeRequired: "Nambari ya uthibitisho inahitajika",
      codeInvalid: "Tafadhali ingiza nambari sahihi ya takwimu 6",
      // Plan selection
      choosePlan: 'Chagua Mpango Wako',
      choosePlanSubtitle: 'Chagua mpango kuanza majaribio ya siku 30 bure',
      planRequired: 'Tafadhali chagua mpango ili kuendelea'
    }
  }

  const t = translations[language]

  const businessTypes = [
    { value: 'RETAIL', label: t.retail },
    { value: 'WHOLESALE', label: t.wholesale },
    { value: 'BOTH', label: t.both }
  ]

  const businessCategories = [
    { value: 'GROCERY', label: t.grocery },
    { value: 'ELECTRONICS', label: t.electronics },
    { value: 'FASHION', label: t.fashion },
    { value: 'PHARMACY', label: t.pharmacy },
    { value: 'RESTAURANT', label: t.restaurant },
    { value: 'SERVICE', label: t.service },
    { value: 'OTHER', label: t.other }
  ]

  // API Integration Functions
  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      console.log('Email check response:', data) // Debug log
      
      // Handle both success and error responses
      if (response.ok && data.success) {
        return data.data.available
      } else {
        // If API returns error (email exists), it means email is not available
        return false
      }
    } catch (error) {
      console.error('Email check failed:', error)
      return false
    }
  }

  const registerBusinessOwner = async (): Promise<{ success: boolean; message: string; userId?: string; field?: string; emailWarning?: boolean }> => {
    try {
      const response = await fetch('/api/auth/register/business-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.fullName.split(' ')[0] || formData.fullName,
          lastName: formData.fullName.split(' ').slice(1).join(' ') || 'User',
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone: formData.phone || undefined,
          planId: formData.planId, // NEW: Selected plan
          businessName: formData.businessName,
          businessType: String(formData.businessType || '').toUpperCase(),
          businessCategory: formData.businessCategory || undefined,
          businessDescription: formData.businessDescription,
          businessAddress: formData.businessAddress,
          businessPhone: formData.phone || undefined,
          registrationNumber: formData.registrationNumber || undefined
        })
      })
      const data = await response.json()
      
      if (response.ok) {
        return { 
          success: true, 
          message: data.data?.message || 'Registration successful', 
          userId: data.data?.userId,
          emailWarning: data.data?.emailWarning 
        }
      } else {
        // Handle backend error response properly
        return { 
          success: false, 
          message: data.error || data.message || 'Registration failed', 
          field: data.field 
        }
      }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, message: 'Registration failed. Please try again.' }
    }
  }

  const verifyEmail = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: code
        })
      })
      const data = await response.json()
      return { success: response.ok, message: data.message }
    } catch (error) {
      console.error('Verification failed:', error)
      return { success: false, message: 'Verification failed. Please try again.' }
    }
  }

  const resendVerificationCode = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, message: data.data?.message || 'Verification code sent successfully' }
      } else {
        return { success: false, message: data.error || data.message || 'Failed to resend code' }
      }
    } catch (error) {
      console.error('Resend failed:', error)
      return { success: false, message: 'Failed to resend code. Please try again.' }
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setIsGoogleLoading(true)
      
      const result = await signIn('google', {
        callbackUrl: '/admin/dashboard',
        redirect: false
      })
      
      if (result?.error) {
        showError(
          language === 'en' ? 'Google Sign Up Failed' : 'Kusajili kwa Google Kumeshindwa',
          result.error
        )
      } else if (result?.url) {
        showSuccess(
          language === 'en' ? 'Account created successfully!' : 'Akaunti imetengenezwa kikamilifu!',
          language === 'en' ? 'Redirecting to your dashboard...' : 'Inakuelekeza kwenye dashibodi yako...'
        )
        // Redirect to the callback URL
        router.push(result.url)
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

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 'method':
        if (!formData.method) return false
        break
      case 'details':
        if (!formData.fullName.trim()) newErrors.fullName = t.nameRequired
        if (!formData.email.trim()) newErrors.email = t.emailRequired
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t.emailInvalid
        if (!formData.password) newErrors.password = t.passwordRequired
        else if (formData.password.length < 8) newErrors.password = t.passwordMinLength
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          newErrors.password = language === 'en' 
            ? 'Password must contain uppercase, lowercase and number' 
            : 'Password lazima iwe na herufi kubwa, ndogo na nambari'
        }
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t.passwordsMatch
        // Validate phone number if provided
        if (formData.phone && formData.phone.trim()) {
          const phoneRegex = /^(\+255|0)[67]\d{8}$/
          if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
            newErrors.phone = language === 'en' 
              ? 'Please enter a valid Tanzania phone number (e.g., +255712345678 or 0712345678)' 
              : 'Tafadhali ingiza namba sahihi ya simu ya Tanzania (mfano: +255712345678 au 0712345678)'
          }
        }
        if (!formData.acceptTerms) newErrors.acceptTerms = t.termsRequired
        break
      case 'business':
          if (!formData.businessName.trim()) newErrors.businessName = t.businessNameRequired
          if (!formData.businessType) newErrors.businessType = t.businessTypeRequired
        if (!formData.businessDescription.trim()) newErrors.businessDescription = t.businessDescRequired
        if (!formData.businessAddress.trim()) newErrors.businessAddress = t.businessAddressRequired
        break
      case 'verification':
        if (!formData.verificationCode.trim()) newErrors.verificationCode = t.codeRequired
        else if (!/^\d{6}$/.test(formData.verificationCode)) newErrors.verificationCode = t.codeInvalid
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = async () => {
    if (!validateCurrentStep()) return

    setIsLoading(true)
    
    try {
      switch (currentStep) {
        case 'method':
          setCurrentStep('details')
          break
        case 'details':
          // Check email availability before proceeding
          const emailAvailable = await checkEmailAvailability(formData.email)
          if (!emailAvailable) {
            setErrors({ email: 'This email is already registered' })
            return
          }
          setCurrentStep('plan') // Changed to plan selection
          break
        case 'plan':
          // Validate plan selection
          if (!formData.planId) {
            setErrors({ plan: t.planRequired })
            showWarning('Warning', t.planRequired)
            return
          }
          setErrors({})
          setCurrentStep('business')
          break
                case 'business':
          // Register the business owner
          const registrationResult = await registerBusinessOwner()
          if (!registrationResult.success) {
              showError(
              language === 'en' ? 'Registration Failed' : 'Usajili Umeshindikana',
                registrationResult.message
              )
            // Attach field-specific error as well for inline display when returning to that step
            if (registrationResult.field) {
              setErrors({ [registrationResult.field]: registrationResult.message })
            }
            return
          }
          
          // Check if email failed to send
          if (registrationResult.emailWarning) {
            showWarning(
              language === 'en' ? 'Email Delivery Issue' : 'Tatizo la Kutuma Email',
              language === 'en' 
                ? 'Account created successfully, but verification email failed to send. You can request a new code below.'
                : 'Akaunti imeundwa kikamilifu, lakini email ya uthibitisho imeshindwa kutumwa. Unaweza kuomba nambari mpya hapo chini.'
            )
          }
          
          setCurrentStep('verification')
          setVerificationTimer(60) 
          break
        case 'verification':
          const verificationResult = await verifyEmail(formData.verificationCode)
          if (!verificationResult.success) {
            setErrors({ verificationCode: verificationResult.message })
            return
          }
          // Success! Show toast and redirect
          showSuccess(
            language === 'en' ? 'Account Verified!' : 'Akaunti Imethibitishwa!',
            language === 'en' ? 'Your account has been verified successfully. Redirecting to login...' : 'Akaunti yako imethibitishwa kikamilifu. Tunakuelekeza kwenye kuingia...'
          )
          setTimeout(() => {
            router.push('/login')
          }, 2000)
          break
      }
    } catch (error) {
      console.error('Step processing failed:', error)
      setErrors({ general: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrevious = () => {
    switch (currentStep) {
      case 'details':
        setCurrentStep('method')
        break
      case 'plan':
        setCurrentStep('details')
        break
      case 'business':
        setCurrentStep('plan')
        break
      case 'verification':
        setCurrentStep('business')
        break
    }
  }

  const floatingVariants = {
    animate: {
      y: [-20, 20, -20],
      x: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const slideVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  const progressPercentage = { method: 20, details: 40, business: 60, verification: 100 }[currentStep]

  const getStepTitle = () => {
    switch (currentStep) {
      case 'method': return t.getStarted
      case 'details': return t.createAccount
      case 'business': return t.businessInfo
      case 'verification': return t.verifyEmail
      default: return ''
    }
  }

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'method': return t.subtitle
      case 'details': return t.detailsSubtitle
      case 'business': return t.businessSubtitle
      case 'verification': return `${t.verificationSubtitle} ${formData.email}`
      default: return ''
    }
  }

  // Defer to global loader
  if (authLoading) return null

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
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
            <motion.div className="h-full bg-gradient-to-r from-teal-500 to-teal-600" initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
          </div>

          {/* Header */}
          <div className="text-center mb-8 mt-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <SparklesIcon className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1 key={currentStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl font-bold text-gray-800 mb-2">{getStepTitle()}</motion.h1>
            <motion.p key={`${currentStep}-subtitle`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-gray-600">{getStepSubtitle()}</motion.p>
            
            {/* General Error Display */}
            {errors.general && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700 text-sm">
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  {errors.general}
                </div>
              </motion.div>
            )}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="min-h-[400px]">
              
              {/* Method Selection */}
              {currentStep === 'method' && (
                <div className="space-y-6">
                  <motion.button onClick={handleGoogleSignup} disabled={isGoogleLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full bg-white border border-gray-300 hover:border-gray-400 rounded-xl py-4 px-6 flex items-center justify-center space-x-3 transition-all duration-300 hover:shadow-lg group ${isGoogleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                          {language === 'en' ? 'Signing up...' : 'Inasajili...'}
                        </>
                      ) : (
                        t.signupGoogle
                      )}
                    </span>
                  </motion.button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500 font-medium">{t.orSignup}</span></div>
                  </div>
                  
                  <motion.button onClick={() => { updateFormData({ method: 'email' }); setTimeout(() => setCurrentStep('details'), 100); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <span>{t.signupEmail}</span>
                  </motion.button>
                </div>
              )}

              {/* User Details */}
              {currentStep === 'details' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName}</label>
                    <motion.input whileFocus={{ scale: 1.02 }} type="text" value={formData.fullName} onChange={(e) => updateFormData({ fullName: e.target.value })} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`} placeholder="John Doe" />
                    {errors.fullName && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1"><XCircleIcon className="w-4 h-4 mr-1" />{errors.fullName}</motion.div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                    <motion.input whileFocus={{ scale: 1.02 }} type="email" value={formData.email} onChange={(e) => updateFormData({ email: e.target.value })} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="john@example.com" />
                    {errors.email && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1"><XCircleIcon className="w-4 h-4 mr-1" />{errors.email}</motion.div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.password}</label>
                    <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                      <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => updateFormData({ password: e.target.value })} className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.password ? 'border-red-500' : 'border-gray-300'}`} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </motion.div>
                    {errors.password && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1"><XCircleIcon className="w-4 h-4 mr-1" />{errors.password}</motion.div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.confirmPassword}</label>
                    <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => updateFormData({ confirmPassword: e.target.value })} className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </motion.div>
                    {errors.confirmPassword && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1"><XCircleIcon className="w-4 h-4 mr-1" />{errors.confirmPassword}</motion.div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone}</label>
                    <motion.input 
                      whileFocus={{ scale: 1.02 }} 
                      type="tel" 
                      value={formData.phone} 
                      onChange={(e) => updateFormData({ phone: e.target.value })} 
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} 
                      placeholder={language === 'en' ? '+255712345678 or 0712345678' : '+255712345678 au 0712345678'} 
                    />
                    {errors.phone && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="flex items-center text-red-500 text-sm mt-1"
                      >
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        {errors.phone}
                      </motion.div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'en' ? 'Optional - Tanzania phone number format' : 'Si lazima - Muundo wa namba ya simu ya Tanzania'}
                    </p>
                  </div>

                  <div>
                    <motion.label whileHover={{ scale: 1.02 }} className="flex items-start cursor-pointer">
                      <input type="checkbox" checked={formData.acceptTerms} onChange={(e) => updateFormData({ acceptTerms: e.target.checked })} className="sr-only" />
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mt-0.5 mr-3 transition-all duration-300 ${formData.acceptTerms ? 'bg-teal-500 border-teal-500' : 'border-gray-300 hover:border-teal-500'}`}>
                        {formData.acceptTerms && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}><CheckCircleIcon className="w-3 h-3 text-white" /></motion.div>}
                      </div>
                      <span className="text-sm text-gray-600 leading-5">{t.acceptTerms}</span>
                    </motion.label>
                    {errors.acceptTerms && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-2"><XCircleIcon className="w-4 h-4 mr-1" />{errors.acceptTerms}</motion.div>}
                  </div>
                </div>
              )}

              {/* Plan Selection */}
              {currentStep === 'plan' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {t.choosePlan}
                    </h2>
                    <p className="text-gray-600">
                      {t.choosePlanSubtitle}
                    </p>
                  </div>

                  {loadingPlans ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : (
                    <div className="grid gap-4 max-h-96 overflow-y-auto">
                      {plans.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, planId: plan.id }))}
                          className={`relative p-4 border-2 rounded-lg text-left transition-all ${
                            formData.planId === plan.id
                              ? 'border-teal-600 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {formData.planId === plan.id && (
                            <div className="absolute top-4 right-4">
                              <CheckCircleIcon className="w-6 h-6 text-teal-600" />
                            </div>
                          )}
                          <div className="pr-10">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {language === 'en' ? plan.displayName : (plan.displayNameSwahili || plan.displayName)}
                            </h4>
                            <p className="text-2xl font-bold text-teal-600 mt-1">
                              {plan.priceMonthly.toLocaleString('en-TZ')} TZS
                              <span className="text-sm font-normal text-gray-600">
                                {language === 'en' ? '/month' : '/mwezi'}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              {language === 'en' ? plan.description : (plan.descriptionSwahili || plan.description)}
                            </p>
                            
                            {/* Key Features */}
                            <div className="mt-3 space-y-1">
                              {plan.features?.max_businesses && (
                                <div className="text-xs text-gray-700">
                                  • {plan.features.max_businesses} {language === 'en' ? 'business(es)' : 'biashara'}
                                </div>
                              )}
                              {plan.features?.max_stores_per_business && (
                                <div className="text-xs text-gray-700">
                                  • {plan.features.max_stores_per_business} {language === 'en' ? 'store(s) per business' : 'duka kwa biashara'}
                                </div>
                              )}
                              {plan.features?.max_users_per_business && (
                                <div className="text-xs text-gray-700">
                                  • {plan.features.max_users_per_business === 999 ? (language === 'en' ? 'Unlimited users' : 'Watumiaji wasiojulikana') : `${plan.features.max_users_per_business} ${language === 'en' ? 'users' : 'watumiaji'}`}
                                </div>
                              )}
                              {plan.features?.enable_credit_sales && (
                                <div className="text-xs text-gray-700">
                                  • {language === 'en' ? 'Credit sales' : 'Mauzo ya mkopo'}
                                </div>
                              )}
                              {plan.features?.advanced_reports && (
                                <div className="text-xs text-gray-700">
                                  • {language === 'en' ? 'Advanced reports' : 'Ripoti za kina'}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {errors.plan && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="flex items-center justify-center text-red-500 text-sm"
                    >
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      {errors.plan}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Enhanced Business Information */}
              {currentStep === 'business' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.businessName}</label>
                    <motion.input whileFocus={{ scale: 1.02 }} type="text" value={formData.businessName} onChange={(e) => updateFormData({ businessName: e.target.value })} className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.businessName ? 'border-red-500' : 'border-gray-300'}`} placeholder="ABC Trading Ltd" />
                    {errors.businessName && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1"><XCircleIcon className="w-4 h-4 mr-1" />{errors.businessName}</motion.div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.businessType}</label>
                    <motion.select whileFocus={{ scale: 1.02 }} value={formData.businessType} onChange={(e) => updateFormData({ businessType: e.target.value })} className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 bg-white ${errors.businessType ? 'border-red-500' : 'border-gray-300'}`}>
                      <option value="" className="text-gray-400">{t.selectBusinessType}</option>
                      {businessTypes.map((type) => (
                        <option key={type.value} value={type.value} className="text-gray-900">{type.label}</option>
                      ))}
                    </motion.select>
                    {errors.businessType && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1"><XCircleIcon className="w-4 h-4 mr-1" />{errors.businessType}</motion.div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.businessCategory}</label>
                    <motion.select whileFocus={{ scale: 1.02 }} value={formData.businessCategory} onChange={(e) => updateFormData({ businessCategory: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 bg-white border-gray-300">
                      <option value="" className="text-gray-400">{t.selectBusinessCategory}</option>
                      {businessCategories.map((cat) => (
                        <option key={cat.value} value={cat.value} className="text-gray-900">{cat.label}</option>
                      ))}
                    </motion.select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.businessDescription}</label>
                    <motion.textarea whileFocus={{ scale: 1.02 }} value={formData.businessDescription} onChange={(e) => updateFormData({ businessDescription: e.target.value })} rows={3} className={`w-full px-3 py-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none text-gray-900 placeholder-gray-400 ${errors.businessDescription ? 'border-red-500' : 'border-gray-300'}`} placeholder="Brief description of your business..." />
                    {errors.businessDescription && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1"><XCircleIcon className="w-4 h-4 mr-1" />{errors.businessDescription}</motion.div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.businessAddress}</label>
                    <motion.textarea whileFocus={{ scale: 1.02 }} value={formData.businessAddress} onChange={(e) => updateFormData({ businessAddress: e.target.value })} rows={2} className={`w-full px-3 py-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none text-gray-900 placeholder-gray-400 ${errors.businessAddress ? 'border-red-500' : 'border-gray-300'}`} placeholder="Business physical address..." />
                    {errors.businessAddress && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1"><XCircleIcon className="w-4 h-4 mr-1" />{errors.businessAddress}</motion.div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.registrationNumber}</label>
                    <motion.input whileFocus={{ scale: 1.02 }} type="text" value={formData.registrationNumber} onChange={(e) => updateFormData({ registrationNumber: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400" placeholder="REG123456" />
                  </div>
                </div>
              )}

              {/* Email Verification */}
              {currentStep === 'verification' && (
                <div className="space-y-6 text-center">
                  <div className="w-20 h-20 bg-teal-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.verifyEmail}</h3>
                    <p className="text-sm text-gray-600">
                      {t.verificationSubtitle} <span className="font-semibold text-teal-600">{formData.email}</span>
                    </p>
                  </div>
                  


                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">{t.enterCode}</label>
                    <motion.input whileFocus={{ scale: 1.02 }} type="text" value={formData.verificationCode} onChange={(e) => {
                      const code = e.target.value.replace(/\D/g, '').slice(0, 6)
                      updateFormData({ verificationCode: code })
                      // Clear errors when user starts typing
                      if (errors.verificationCode) {
                        setErrors({ ...errors, verificationCode: '' })
                      }
                    }} className={`w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.verificationCode ? 'border-red-500' : 'border-gray-300'}`} placeholder="000000" maxLength={6} />
                    {errors.verificationCode && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center text-red-500 text-sm"><XCircleIcon className="w-4 h-4 mr-1" />{errors.verificationCode}</motion.div>}
                  </div>

                  

                  <div className="text-sm text-gray-600">
                    <p>{t.didntReceive}</p>
                    {verificationTimer > 0 ? (
                      <p className="mt-2">{t.resendIn} <span className="font-semibold text-teal-600">{verificationTimer}s</span></p>
                    ) : (
                      <motion.button onClick={async () => {
                        setIsLoading(true)
                        const result = await resendVerificationCode()
                        if (result.success) {
                          setVerificationTimer(60)
                          showSuccess(
                            language === 'en' ? 'Code Sent!' : 'Nambari Imetumwa!',
                            result.message
                          )
                        } else {
                          showError(
                            language === 'en' ? 'Resend Failed' : 'Kutuma Tena Kumeshindwa',
                            result.message
                          )
                        }
                        setIsLoading(false)
                      }} whileHover={{ scale: 1.05 }} className="mt-2 text-teal-600 hover:text-teal-700 font-semibold disabled:opacity-50" disabled={isLoading}>
                        {isLoading ? (
                          <span className="flex items-center">
                            <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mr-2" />
                            {t.sending}
                          </span>
                        ) : t.resendNow}
                      </motion.button>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep !== 'method' && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <motion.button onClick={handlePrevious} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors">
                <ArrowLeftIcon className="w-4 h-4" />
                <span>{t.previous}</span>
              </motion.button>

              <motion.button onClick={handleNext} disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                <span>{currentStep === 'verification' ? t.verify : currentStep === 'details' ? t.createAccountBtn : t.next}</span>
                {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ArrowRightIcon className="w-4 h-4" />}
              </motion.button>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {t.alreadyHaveAccount}{' '}
              <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                {t.signIn}
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner /></div>}>
      <RegisterPageContent />
    </Suspense>
  )
} 