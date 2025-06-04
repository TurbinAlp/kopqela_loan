'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  UserIcon,
  BuildingOfficeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useLanguage, LanguageToggle } from '../contexts/LanguageContext'

type RegistrationStep = 'method' | 'details' | 'role' | 'business' | 'verification'
type UserRole = 'customer' | 'business' | null

export default function RegisterPage() {
  const { language } = useLanguage()
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('method')
  const [isVisible, setIsVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [verificationTimer, setVerificationTimer] = useState(60)
  
  const [formData, setFormData] = useState({
    method: null as 'google' | 'email' | null,
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false,
    role: null as UserRole,
    businessName: '',
    businessType: '',
    registrationNumber: '',
    accessReason: '',
    verificationCode: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentStep === 'verification' && verificationTimer > 0) {
      interval = setInterval(() => {
        setVerificationTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [currentStep, verificationTimer])

  const translations = {
    en: {
      getStarted: "Let's Get Started!",
      subtitle: "Choose how you'd like to sign up",
      signupGoogle: "Sign up with Google",
      orSignup: "Or sign up with email",
      signupEmail: "Sign up with Email",
      createAccount: "Create Your Account",
      detailsSubtitle: "Tell us about yourself",
      fullName: "Full Name",
      email: "Email Address", 
      password: "Password",
      confirmPassword: "Confirm Password",
      phone: "Phone Number (Optional)",
      acceptTerms: "I agree to the Terms & Conditions",
      selectRole: "What's Your Role?",
      roleSubtitle: "Choose how you'll use the platform",
      customer: "Customer",
      customerDesc: "Browse and purchase products",
      businessUser: "Business User", 
      businessDesc: "Manage inventory and sales",
      businessInfo: "Business Information",
      businessSubtitle: "Tell us about your business",
      businessName: "Business Name",
      businessType: "Business Type",
      selectBusinessType: "Select business type",
      registrationNumber: "Registration Number (Optional)",
      accessReason: "Why do you need business access?",
      verifyEmail: "Verify Your Email",
      verificationSubtitle: "We sent a code to",
      enterCode: "Enter 6-digit code",
      didntReceive: "Didn't receive the code?",
      resendIn: "Resend in",
      resendNow: "Resend now",
      next: "Next",
      previous: "Back", 
      createAccountBtn: "Create Account",
      verify: "Verify",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign in",
      // Business Types
      retail: "Retail Store",
      wholesale: "Wholesale",
      online: "Online Business",
      service: "Service Provider",
      other: "Other",
      // Validation messages
      nameRequired: "Full name is required",
      emailRequired: "Email is required", 
      emailInvalid: "Please enter a valid email",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 8 characters",
      passwordsMatch: "Passwords do not match",
      termsRequired: "Please accept the terms and conditions",
      roleRequired: "Please select a role",
      businessNameRequired: "Business name is required",
      businessTypeRequired: "Please select business type",
      accessReasonRequired: "Please provide a reason for business access",
      codeRequired: "Verification code is required",
      codeInvalid: "Please enter a valid 6-digit code"
    },
    sw: {
      getStarted: "Tuanze!",
      subtitle: "Chagua jinsi ungependa kujisajili",
      signupGoogle: "Jisajili kwa Google",
      orSignup: "Au jisajili kwa email", 
      signupEmail: "Jisajili kwa Email",
      createAccount: "Tengeneza Akaunti Yako",
      detailsSubtitle: "Tuambie kuhusu wewe",
      fullName: "Jina Kamili",
      email: "Anuani ya Email",
      password: "Nywila", 
      confirmPassword: "Thibitisha Nywila",
      phone: "Namba ya Simu (Si Lazima)",
      acceptTerms: "Nakubali Masharti na Vigezo",
      selectRole: "Jukumu Lako ni Nini?",
      roleSubtitle: "Chagua jinsi utakavyotumia mfumo",
      customer: "Mteja",
      customerDesc: "Angalia na nunua bidhaa",
      businessUser: "Mtumiaji wa Biashara",
      businessDesc: "Simamia hisa na mauzo",
      businessInfo: "Maelezo ya Biashara",
      businessSubtitle: "Tuambie kuhusu biashara yako",
      businessName: "Jina la Biashara",
      businessType: "Aina ya Biashara",
      selectBusinessType: "Chagua aina ya biashara",
      registrationNumber: "Namba ya Usajili (Si Lazima)",
      accessReason: "Kwa nini unahitaji ufikiaji wa biashara?",
      verifyEmail: "Thibitisha Email Yako",
      verificationSubtitle: "Tumetuma nambari kwa",
      enterCode: "Ingiza nambari ya takwimu 6",
      didntReceive: "Hujapokea nambari?", 
      resendIn: "Tuma tena baada ya",
      resendNow: "Tuma tena sasa",
      next: "Mbele",
      previous: "Rudi",
      createAccountBtn: "Tengeneza Akaunti",
      verify: "Thibitisha", 
      alreadyHaveAccount: "Tayari una akaunti?",
      signIn: "Ingia",
      // Business Types
      retail: "Duka la Rejareja",
      wholesale: "Biashara ya Jumla",
      online: "Biashara ya Mtandaoni",
      service: "Mtoa Huduma",
      other: "Nyingine",
      // Validation messages
      nameRequired: "Jina kamili linahitajika",
      emailRequired: "Email inahitajika",
      emailInvalid: "Tafadhali ingiza email sahihi", 
      passwordRequired: "Nywila inahitajika",
      passwordMinLength: "Nywila lazima iwe na vibambo 8 au zaidi",
      passwordsMatch: "Nywila hazifanani",
      termsRequired: "Tafadhali kubali masharti na vigezo",
      roleRequired: "Tafadhali chagua jukumu",
      businessNameRequired: "Jina la biashara linahitajika",
      businessTypeRequired: "Tafadhali chagua aina ya biashara",
      accessReasonRequired: "Tafadhali toa sababu ya uhitaji wa ufikiaji wa biashara",
      codeRequired: "Nambari ya uthibitisho inahitajika",
      codeInvalid: "Tafadhali ingiza nambari sahihi ya takwimu 6"
    }
  }

  const t = translations[language]

  const businessTypes = [
    { value: 'retail', label: t.retail },
    { value: 'wholesale', label: t.wholesale },
    { value: 'online', label: t.online },
    { value: 'service', label: t.service },
    { value: 'other', label: t.other }
  ]

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 'method':
        if (!formData.method) return false
        break
      
      case 'details':
        if (!formData.fullName.trim()) newErrors.fullName = t.nameRequired
        if (!formData.email.trim()) newErrors.email = t.emailRequired
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t.emailInvalid
        if (!formData.password) newErrors.password = t.passwordRequired
        else if (formData.password.length < 8) newErrors.password = t.passwordMinLength
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t.passwordsMatch
        if (!formData.acceptTerms) newErrors.acceptTerms = t.termsRequired
        break
      
      case 'role':
        if (!formData.role) newErrors.role = t.roleRequired
        break
      
      case 'business':
        if (formData.role === 'business') {
          if (!formData.businessName.trim()) newErrors.businessName = t.businessNameRequired
          if (!formData.businessType) newErrors.businessType = t.businessTypeRequired
          if (!formData.accessReason.trim()) newErrors.accessReason = t.accessReasonRequired
        }
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

  const handleNext = () => {
    if (!validateCurrentStep()) return

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      
      if (currentStep === 'method') {
        setCurrentStep(formData.method === 'google' ? 'role' : 'details')
      } else if (currentStep === 'details') {
        setCurrentStep('role')
      } else if (currentStep === 'role') {
        if (formData.role === 'business') {
          setCurrentStep('business')
        } else {
          setCurrentStep('verification')
          setVerificationTimer(60)
        }
      } else if (currentStep === 'business') {
        setCurrentStep('verification')
        setVerificationTimer(60)
      } else if (currentStep === 'verification') {
        console.log('Registration completed:', formData)
      }
    }, 1000)
  }

  const handlePrevious = () => {
    if (currentStep === 'details') setCurrentStep('method')
    else if (currentStep === 'role') setCurrentStep(formData.method === 'google' ? 'method' : 'details')
    else if (currentStep === 'business') setCurrentStep('role')
    else if (currentStep === 'verification') setCurrentStep(formData.role === 'business' ? 'business' : 'role')
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

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  }

  const floatingVariants = {
    animate: {
      y: [-15, 15, -15],
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    }
  }

  const progressPercentage = { method: 20, details: 40, role: 60, business: 80, verification: 100 }[currentStep]

  const getStepTitle = () => {
    switch (currentStep) {
      case 'method': return t.getStarted
      case 'details': return t.createAccount
      case 'role': return t.selectRole  
      case 'business': return t.businessInfo
      case 'verification': return t.verifyEmail
      default: return ''
    }
  }

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'method': return t.subtitle
      case 'details': return t.detailsSubtitle
      case 'role': return t.roleSubtitle
      case 'business': return t.businessSubtitle
      case 'verification': return `${t.verificationSubtitle} ${formData.email}`
      default: return ''
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

      <motion.div variants={containerVariants} initial="hidden" animate={isVisible ? "visible" : "hidden"} className="w-full max-w-lg relative z-10">
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
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1 key={currentStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-2xl font-bold text-gray-800 mb-2">{getStepTitle()}</motion.h1>
            <motion.p key={`${currentStep}-subtitle`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-gray-600 text-sm">{getStepSubtitle()}</motion.p>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="min-h-[400px]">
              
              {/* Method Selection */}
              {currentStep === 'method' && (
                <div className="space-y-6">
                  <motion.button onClick={() => { updateFormData({ method: 'google' }); setTimeout(() => setCurrentStep('role'), 100); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-white border border-gray-300 hover:border-gray-400 rounded-xl py-4 px-6 flex items-center justify-center space-x-3 transition-all duration-300 hover:shadow-lg group">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">{t.signupGoogle}</span>
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
                    <motion.input whileFocus={{ scale: 1.02 }} type="tel" value={formData.phone} onChange={(e) => updateFormData({ phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400" placeholder="+255 123 456 789" />
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

              {/* Role Selection */}
              {currentStep === 'role' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <motion.button onClick={() => updateFormData({ role: 'customer' })} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`p-6 border-2 rounded-xl transition-all duration-300 text-left ${formData.role === 'customer' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.role === 'customer' ? 'bg-teal-100' : 'bg-gray-100'}`}>
                          <UserIcon className={`w-6 h-6 ${formData.role === 'customer' ? 'text-teal-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{t.customer}</h3>
                          <p className="text-sm text-gray-600">{t.customerDesc}</p>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button onClick={() => updateFormData({ role: 'business' })} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`p-6 border-2 rounded-xl transition-all duration-300 text-left ${formData.role === 'business' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.role === 'business' ? 'bg-teal-100' : 'bg-gray-100'}`}>
                          <BuildingOfficeIcon className={`w-6 h-6 ${formData.role === 'business' ? 'text-teal-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{t.businessUser}</h3>
                          <p className="text-sm text-gray-600">{t.businessDesc}</p>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                  {errors.role && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm"><XCircleIcon className="w-4 h-4 mr-1" />{errors.role}</motion.div>}
                </div>
              )}

              {/* Business Information */}
              {currentStep === 'business' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.businessName}</label>
                    <motion.input whileFocus={{ scale: 1.02 }} type="text" value={formData.businessName} onChange={(e) => updateFormData({ businessName: e.target.value })} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.businessName ? 'border-red-500' : 'border-gray-300'}`} placeholder="ABC Trading Ltd" />
                    {errors.businessName && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1"><XCircleIcon className="w-4 h-4 mr-1" />{errors.businessName}</motion.div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.businessType}</label>
                    <motion.select whileFocus={{ scale: 1.02 }} value={formData.businessType} onChange={(e) => updateFormData({ businessType: e.target.value })} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 bg-white ${errors.businessType ? 'border-red-500' : 'border-gray-300'}`}>
                      <option value="" className="text-gray-400">{t.selectBusinessType}</option>
                      {businessTypes.map((type) => (
                        <option key={type.value} value={type.value} className="text-gray-900">{type.label}</option>
                      ))}
                    </motion.select>
                    {errors.businessType && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1"><XCircleIcon className="w-4 h-4 mr-1" />{errors.businessType}</motion.div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.registrationNumber}</label>
                    <motion.input whileFocus={{ scale: 1.02 }} type="text" value={formData.registrationNumber} onChange={(e) => updateFormData({ registrationNumber: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400" placeholder="REG123456" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.accessReason}</label>
                    <motion.textarea whileFocus={{ scale: 1.02 }} value={formData.accessReason} onChange={(e) => updateFormData({ accessReason: e.target.value })} rows={4} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none text-gray-900 placeholder-gray-400 ${errors.accessReason ? 'border-red-500' : 'border-gray-300'}`} placeholder="Explain why you need business access..." />
                    {errors.accessReason && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-red-500 text-sm mt-1"><XCircleIcon className="w-4 h-4 mr-1" />{errors.accessReason}</motion.div>}
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

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">{t.enterCode}</label>
                    <motion.input whileFocus={{ scale: 1.02 }} type="text" value={formData.verificationCode} onChange={(e) => updateFormData({ verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6) })} className={`w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 ${errors.verificationCode ? 'border-red-500' : 'border-gray-300'}`} placeholder="000000" maxLength={6} />
                    {errors.verificationCode && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center text-red-500 text-sm"><XCircleIcon className="w-4 h-4 mr-1" />{errors.verificationCode}</motion.div>}
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>{t.didntReceive}</p>
                    {verificationTimer > 0 ? (
                      <p className="mt-2">{t.resendIn} <span className="font-semibold text-teal-600">{verificationTimer}s</span></p>
                    ) : (
                      <motion.button onClick={() => setVerificationTimer(60)} whileHover={{ scale: 1.05 }} className="mt-2 text-teal-600 hover:text-teal-700 font-semibold">{t.resendNow}</motion.button>
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

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600 text-sm">{t.alreadyHaveAccount} </span>
            <motion.a whileHover={{ scale: 1.05 }} href="/login" className="text-teal-600 hover:text-teal-700 font-semibold text-sm">{t.signIn}</motion.a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 