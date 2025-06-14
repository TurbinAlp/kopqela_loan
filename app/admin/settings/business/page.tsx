'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'

export default function BusinessSettingsRedirect() {
  const router = useRouter()
  const { language } = useLanguage()

  const translations = {
    en: {
      redirecting: 'Redirecting to Business Module...',
      moved: 'Business Settings Moved',
      description: 'Business settings have been moved to the new Business module for better organization.'
    },
    sw: {
      redirecting: 'Inaelekeza kwa Moduli ya Biashara...',
      moved: 'Mipangilio ya Biashara Imehamishwa',
      description: 'Mipangilio ya biashara yamehamishwa kwenye moduli mpya ya Biashara kwa mpangilio bora.'
    }
  }

  const t = translations[language]

  useEffect(() => {
    // Redirect to new business settings location after a short delay
    const timer = setTimeout(() => {
      router.push('/admin/business/settings')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-screen"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
          <BuildingOfficeIcon className="w-8 h-8 text-teal-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.moved}</h1>
        <p className="text-gray-600 mb-4">{t.description}</p>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
          <span className="text-sm text-gray-500">{t.redirecting}</span>
        </div>
      </div>
    </motion.div>
  )
} 