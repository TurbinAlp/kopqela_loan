'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  BugAntIcon
} from '@heroicons/react/24/outline'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Global error:', error)
    
    // You can integrate with error tracking services like Sentry here
    // Sentry.captureException(error)
  }, [error])

  const translations = {
    en: {
      title: "Something went wrong!",
      subtitle: "An unexpected error occurred",
      description: "We're sorry for the inconvenience. Our team has been notified and is working to fix this issue.",
      errorCode: "Error 500",
      whatHappened: "What happened?",
      whatCanYouDo: "What can you do?",
      tryAgain: "Try Again",
      goHome: "Go to Homepage",
      reportBug: "Report Bug",
      reload: "Reload Page",
      technical: "Technical Details",
      showDetails: "Show Details",
      hideDetails: "Hide Details",
      contactSupport: "Contact Support",
      steps: [
        "Check your internet connection",
        "Refresh the page",
        "Clear your browser cache",
        "Try again in a few minutes"
      ]
    },
    sw: {
      title: "Kitu kimekwenda vibaya!",
      subtitle: "Kosa lisilotarajiwa limetokea",
      description: "Tunaomba msamaha kwa usumbufu. Timu yetu imearifiwa na inafanya kazi kutatua suala hili.",
      errorCode: "Kosa 500",
      whatHappened: "Nini kilitokea?",
      whatCanYouDo: "Unaweza kufanya nini?",
      tryAgain: "Jaribu Tena",
      goHome: "Rudi Nyumbani",
      reportBug: "Ripoti Kosa",
      reload: "Pakia Tena Ukurasa",
      technical: "Maelezo ya Kiteknolojia",
      showDetails: "Onyesha Maelezo",
      hideDetails: "Ficha Maelezo",
      contactSupport: "Wasiliana na Msaada",
      steps: [
        "Angalia muunganiko wako wa intaneti",
        "Pakia upya ukurasa",
        "Futa kache ya kivinjari chako",
        "Jaribu tena baada ya dakika chache"
      ]
    }
  }

  // Default to English since we might not have language context available
  const t = translations.en

  const [showDetails, setShowDetails] = useState(false)

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl w-full space-y-8 text-center">
            {/* Error Icon */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg"
                >
                  <ExclamationTriangleIcon className="w-16 h-16 text-white" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold text-gray-900"
                >
                  {t.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-gray-600"
                >
                  {t.subtitle}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-gray-500 max-w-md mx-auto"
                >
                  {t.description}
                </motion.p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={reset}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  {t.tryAgain}
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <HomeIcon className="w-5 h-5 mr-2" />
                  {t.goHome}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  {t.reload}
                </button>
                
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <BugAntIcon className="w-4 h-4 mr-2" />
                  {showDetails ? t.hideDetails : t.showDetails}
                </button>
              </div>
            </motion.div>

            {/* What can you do */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-lg p-6 shadow-md border border-gray-200 text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                {t.whatCanYouDo}
              </h3>
              <ol className="space-y-2 text-sm text-gray-600">
                {t.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </motion.div>

            {/* Technical Details */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: showDetails ? 1 : 0, 
                height: showDetails ? 'auto' : 0 
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {showDetails && (
                <div className="bg-gray-900 rounded-lg p-6 text-left">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {t.technical}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-300">
                      <span className="text-red-400">Error:</span> {error.message}
                    </div>
                    {error.digest && (
                      <div className="text-gray-300">
                        <span className="text-red-400">Digest:</span> {error.digest}
                      </div>
                    )}
                    <div className="text-gray-300">
                      <span className="text-red-400">Timestamp:</span> {new Date().toISOString()}
                    </div>
                    {error.stack && (
                      <details className="mt-4">
                        <summary className="text-red-400 cursor-pointer">Stack Trace</summary>
                        <pre className="mt-2 text-xs text-gray-400 whitespace-pre-wrap overflow-x-auto">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="pt-6 text-center"
            >
              <p className="text-xs text-gray-400">
                Error ID: {error.digest || 'Unknown'} | {" "}
                <button 
                  onClick={() => window.location.href = '/contact'} 
                  className="text-red-600 hover:text-red-700"
                >
                  {t.contactSupport}
                </button>
              </p>
            </motion.div>
          </div>
        </div>
      </body>
    </html>
  ) 
}