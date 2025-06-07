'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  WifiIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  CloudIcon
} from '@heroicons/react/24/outline'

interface NetworkErrorProps {
  onRetry?: () => void
  message?: string
  showRetry?: boolean
  variant?: 'full' | 'compact'
}

export default function NetworkError({ 
  onRetry, 
  message, 
  showRetry = true, 
  variant = 'full' 
}: NetworkErrorProps) {
  const { language } = useLanguage()

  const translations = {
    en: {
      title: "Connection Problem",
      subtitle: "Unable to connect to the server",
      defaultMessage: "Please check your internet connection and try again.",
      customMessage: message,
      whatToDo: "What you can do:",
      steps: [
        "Check your internet connection",
        "Verify your network settings",
        "Try refreshing the page",
        "Contact your network administrator if the problem persists"
      ],
      retry: "Try Again",
      checkConnection: "Check Connection",
      offline: "You appear to be offline",
      weak: "Weak network signal detected"
    },
    sw: {
      title: "Tatizo la Muunganiko",
      subtitle: "Imeshindwa kuunganisha na seva",
      defaultMessage: "Tafadhali angalia muunganiko wako wa intaneti na ujaribu tena.",
      customMessage: message,
      whatToDo: "Unaweza kufanya nini:",
      steps: [
        "Angalia muunganiko wako wa intaneti",
        "Hakikisha mipangilio ya mtandao wako",
        "Jaribu kupakia upya ukurasa",
        "Wasiliana na msimamizi wa mtandao ikiwa tatizo litaendelea"
      ],
      retry: "Jaribu Tena",
      checkConnection: "Angalia Muunganiko",
      offline: "Inaonekana huna mtandao",
      weak: "Ishara dhaifu ya mtandao imegunduliwa"
    }
  }

  const t = translations[language]
  const [isRetrying, setIsRetrying] = React.useState(false)
  const [networkStatus, setNetworkStatus] = React.useState<'online' | 'offline' | 'weak'>('online')

  // Check network status
  React.useEffect(() => {
    const updateNetworkStatus = () => {
      if (!navigator.onLine) {
        setNetworkStatus('offline')
      } else {
        // Check connection quality (simplified)
        setNetworkStatus('online')
      }
    }

    updateNetworkStatus()
    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
    }
  }, [])

  const handleRetry = async () => {
    if (!onRetry) return
    
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  const getNetworkIcon = () => {
    switch (networkStatus) {
      case 'offline':
        return WifiIcon
      case 'weak':
        return SignalIcon
      default:
        return CloudIcon
    }
  }

  const getNetworkMessage = () => {
    switch (networkStatus) {
      case 'offline':
        return t.offline
      case 'weak':
        return t.weak
      default:
        return t.customMessage || t.defaultMessage
    }
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-red-800">{t.title}</p>
            <p className="text-sm text-red-700 mt-1">{getNetworkMessage()}</p>
          </div>
          {showRetry && onRetry && (
            <div className="ml-4">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                {t.retry}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const NetworkIcon = getNetworkIcon()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 text-center">
        {/* Network Icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`w-24 h-24 ${
                networkStatus === 'offline' ? 'bg-red-500' :
                networkStatus === 'weak' ? 'bg-yellow-500' :
                'bg-blue-500'
              } rounded-full flex items-center justify-center shadow-lg`}
            >
              <NetworkIcon className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900"
            >
              {t.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600"
            >
              {t.subtitle}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-500"
            >
              {getNetworkMessage()}
            </motion.p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        {showRetry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onRetry && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <ArrowPathIcon className={`w-5 h-5 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                  {t.retry}
                </button>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Reload Page
              </button>
            </div>
          </motion.div>
        )}

        {/* Network Status Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg p-6 shadow-md border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.whatToDo}</h3>
          <ol className="space-y-2 text-sm text-gray-600 text-left">
            {t.steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Network Status Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-4"
        >
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            networkStatus === 'online' ? 'bg-green-100 text-green-800' :
            networkStatus === 'weak' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              networkStatus === 'online' ? 'bg-green-500' :
              networkStatus === 'weak' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            Status: {networkStatus === 'online' ? 'Connected' : networkStatus === 'weak' ? 'Weak Signal' : 'Offline'}
          </div>
        </motion.div>
      </div>
    </div>
  )
}