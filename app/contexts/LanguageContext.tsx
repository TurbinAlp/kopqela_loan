'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useIsClient } from '../hooks/useIsClient'

type Language = 'en' | 'sw'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Common translations used across multiple screens
const commonTranslations = {
  en: {
    // Auth common
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    signIn: "Sign In",
    signUp: "Sign Up",
    backToLogin: "Back to Login",
    
    // Form validation
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email address",
    passwordRequired: "Password is required",
    passwordMinLength: "Password must be at least 8 characters",
    passwordsMatch: "Passwords do not match",
    
    // Common UI
    loading: "Loading...",
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    
    // Navigation
    home: "Home",
    dashboard: "Dashboard",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout"
  },
  sw: {
    // Auth common
    email: "Anuani ya Email",
    password: "Nywila",
    confirmPassword: "Thibitisha Nywila",
    signIn: "Ingia",
    signUp: "Jisajili",
    backToLogin: "Rudi Kwenye Kuingia",
    
    // Form validation
    emailRequired: "Email inahitajika",
    emailInvalid: "Tafadhali ingiza email sahihi",
    passwordRequired: "Nywila inahitajika",
    passwordMinLength: "Nywila lazima iwe na vibambo 8 au zaidi",
    passwordsMatch: "Nywila hazifanani",
    
    // Common UI
    loading: "Inakaribia...",
    submit: "Wasilisha",
    cancel: "Ghairi",
    save: "Hifadhi",
    edit: "Hariri",
    delete: "Futa",
    confirm: "Thibitisha",
    
    // Navigation
    home: "Nyumbani",
    dashboard: "Dashibodi",
    profile: "Profaili",
    settings: "Mipangilio",
    logout: "Toka"
  }
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>('en')
  const isClient = useIsClient()

  useEffect(() => {
    // Only run on client side to prevent hydration errors
    if (!isClient) return

    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('koppela-language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'sw')) {
      setLanguageState(savedLanguage)
    } else {
      // Detect user's browser language
      const browserLang = navigator.language.toLowerCase()
      if (browserLang.startsWith('sw')) {
        setLanguageState('sw')
      }
    }
  }, [isClient])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    // Only access localStorage on client side
    if (isClient) {
      localStorage.setItem('koppela-language', lang)
    }
  }

  const t = (key: string): string => {
    return commonTranslations[language][key as keyof typeof commonTranslations['en']] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Language toggle component for reuse
export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage()
  
  return (
    <div className="flex bg-white/20 backdrop-blur-sm rounded-full p-1">
      <button 
        onClick={() => setLanguage('en')} 
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          language === 'en' 
            ? 'bg-white text-teal-600 shadow-lg' 
            : 'text-white hover:bg-white/10'
        }`}
      >
        EN
      </button>
      <button 
        onClick={() => setLanguage('sw')} 
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          language === 'sw' 
            ? 'bg-white text-teal-600 shadow-lg' 
            : 'text-white hover:bg-white/10'
        }`}
      >
        SW
      </button>
    </div>
  )
} 