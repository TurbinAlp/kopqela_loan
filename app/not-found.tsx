'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from './contexts/LanguageContext'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function NotFoundPage() {
  const { language } = useLanguage()

  const translations = {
    en: {
      title: "Page Not Found",
      subtitle: "Oops! The page you're looking for doesn't exist.",
      description: "The page you are trying to access might have been moved, deleted, or doesn't exist. Please check the URL or navigate back to safety.",
      errorCode: "Error 404",
      suggestions: "Here are some suggestions:",
      goHome: "Go to Homepage",
      goBack: "Go Back",
      searchSite: "Search Site",
      contact: "Contact Support",
      recentPages: "Recent Pages",
      dashboard: "Dashboard",
      products: "Products",
      customers: "Customers",
      sales: "Sales"
    },
    sw: {
      title: "Ukurasa Haujapatikana",
      subtitle: "Samahani! Ukurasa unaoitafuta haupo.",
      description: "Ukurasa unaoujaribu kufikia huenda umehamishwa, umefutwa, au haupo. Tafadhali angalia URL au rudi nyuma kwa usalama.",
      errorCode: "Kosa 404",
      suggestions: "Hapa kuna mapendekezo:",
      goHome: "Rudi Nyumbani",
      goBack: "Rudi Nyuma",
      searchSite: "Tafuta Tovuti",
      contact: "Wasiliana na Msaada",
      recentPages: "Kurasa za Hivi Karibuni",
      dashboard: "Dashibodi",
      products: "Bidhaa",
      customers: "Wateja",
      sales: "Mauzo"
    }
  }

  const t = translations[language]

  const quickLinks = [
    { name: t.dashboard, href: "/admin/dashboard", icon: HomeIcon },
    { name: t.products, href: "/admin/products", icon: MagnifyingGlassIcon },
    { name: t.customers, href: "/admin/customers", icon: HomeIcon },
    { name: t.sales, href: "/admin/sales", icon: HomeIcon }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 text-center">
        {/* Error Code */}
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
              className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <ExclamationTriangleIcon className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl font-bold text-gray-900"
            >
              404
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-gray-500 uppercase tracking-wide"
            >
              {t.errorCode}
            </motion.p>
          </div>
        </motion.div>

        {/* Title and Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
          <p className="text-sm text-gray-500 leading-relaxed">{t.description}</p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              {t.goHome}
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              {t.goBack}
            </button>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="pt-8 border-t border-gray-200"
        >
          <h3 className="text-sm font-medium text-gray-900 mb-4">{t.suggestions}</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-teal-600 transition-all duration-200"
                >
                  <link.icon className="w-4 h-4 mr-2" />
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="pt-6 text-center"
        >
          <p className="text-xs text-gray-400">
            Need help? {" "}
            <Link href="/contact" className="text-teal-600 hover:text-teal-700">
              {t.contact}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
} 