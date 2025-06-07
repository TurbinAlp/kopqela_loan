'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useBusiness } from '../../contexts/BusinessContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface BusinessNotFoundProps {
  children: ReactNode
}

export default function BusinessNotFound({ children }: BusinessNotFoundProps) {
  const { business, error } = useBusiness()
  const { language } = useLanguage()

  const translations = {
    en: {
      businessNotFound: 'Store Not Found',
      storeUnavailable: 'This store is currently unavailable or may have been moved.',
      checkUrl: 'Please check the URL and try again.',
      backToHome: 'Back to Home',
      businessInactive: 'Store Temporarily Closed',
      temporarilyUnavailable: 'This store is temporarily unavailable. Please try again later.',
      contactSupport: 'If you believe this is an error, please contact support.'
    },
    sw: {
      businessNotFound: 'Duka Halijapatikana',
      storeUnavailable: 'Duka hili halipo au limehama.',
      checkUrl: 'Tafadhali angalia URL na jaribu tena.',
      backToHome: 'Rudi Nyumbani',
      businessInactive: 'Duka Limefungwa Kwa Muda',
      temporarilyUnavailable: 'Duka hili halipo kwa sasa. Tafadhali jaribu baadaye.',
      contactSupport: 'Kama unafikiri hii ni kosa, tafadhali wasiliana na msaada.'
    }
  }

  const t = translations[language]

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error.includes('not found') ? t.businessNotFound : t.businessInactive}
            </h1>
            <p className="text-gray-600 mb-1">
              {error.includes('not found') ? t.storeUnavailable : t.temporarilyUnavailable}
            </p>
            <p className="text-gray-500 text-sm">
              {error.includes('not found') ? t.checkUrl : t.contactSupport}
            </p>
          </div>
          
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          >
            {t.backToHome}
          </Link>
        </div>
      </div>
    )
  }

  if (!business) {
    return null
  }

  return <>{children}</>
} 