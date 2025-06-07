'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useBusiness } from '../../contexts/BusinessContext'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  HomeIcon,
  CreditCardIcon,
  UserIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export default function StoreNavigation() {
  const { business } = useBusiness()
  const { language, setLanguage } = useLanguage()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!business) return null

  const translations = {
    en: {
      home: 'Home',
      products: 'Products',
      order: 'Order',
      credit: 'Credit',
      account: 'Account',
      search: 'Search products...',
      menu: 'Menu'
    },
    sw: {
      home: 'Nyumbani',
      products: 'Bidhaa',
      order: 'Agiza',
      credit: 'Mkopo',
      account: 'Akaunti',
      search: 'Tafuta bidhaa...',
      menu: 'Menyu'
    }
  }

  const t = translations[language]

  const navigation = [
    {
      name: t.home,
      href: `/store/${business.slug}`,
      icon: HomeIcon
    },
    {
      name: t.products,
      href: `/store/${business.slug}/products`,
      icon: ShoppingBagIcon
    },
    {
      name: t.order,
      href: `/store/${business.slug}/order`,
      icon: ShoppingBagIcon
    }
  ]

  // Add credit navigation if business allows credit
  if (business.settings.allowCredit) {
    navigation.push({
      name: t.credit,
      href: `/store/${business.slug}/credit`,
      icon: CreditCardIcon
    })
  }

  navigation.push({
    name: t.account,
    href: `/store/${business.slug}/account`,
    icon: UserIcon
  })

  const isCurrentPath = (href: string) => {
    if (href === `/store/${business.slug}`) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Business Name */}
          <div className="flex items-center">
            <Link href={`/store/${business.slug}`} className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: business.primaryColor }}
              >
                {business.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
                <p className="text-sm text-gray-500 hidden sm:block">{business.businessType}</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isCurrentPath(item.href)
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={{
                    backgroundColor: isCurrentPath(item.href) ? business.primaryColor : 'transparent'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Language Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
              className="flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <GlobeAltIcon className="w-4 h-4" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
              >
                <span className="sr-only">{t.menu}</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isCurrentPath(item.href)
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: isCurrentPath(item.href) ? business.primaryColor : 'transparent'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
} 