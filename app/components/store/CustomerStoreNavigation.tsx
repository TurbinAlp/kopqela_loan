'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { useCustomerBusiness } from '../../hooks/useCustomerBusiness'
import { useCart } from '../../hooks/useCart'
import { useLanguage } from '../../contexts/LanguageContext'
import Image from 'next/image'
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  HomeIcon,
  GlobeAltIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline'

export default function CustomerStoreNavigation() {
  const params = useParams()
  const slug = params.slug as string
  const { business, isLoading } = useCustomerBusiness(slug)
  const { itemCount } = useCart(slug)
  const { language, setLanguage } = useLanguage()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Show loading state or nothing if business is not loaded
  if (isLoading || !business) return null

  const translations = {
    en: {
      home: 'Home',
      products: 'Products',
      search: 'Search products...',
      menu: 'Menu',
      cart: 'Cart'
    },
    sw: {
      home: 'Nyumbani',
      products: 'Bidhaa',
      search: 'Tafuta bidhaa...',
      menu: 'Menyu',
      cart: 'Kikapu'
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
    }
  ]

  const isCurrentPath = (href: string) => {
    if (href === `/store/${business.slug}`) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const primaryColor = business.businessSetting?.primaryColor || '#059669'

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Business Name */}
          <div className="flex items-center">
            <Link href={`/store/${business.slug}`} className="flex items-center space-x-3">
              {business.businessSetting?.logoUrl ? (
                <Image
                  width={400}
                  height={400}
                  src={business.businessSetting.logoUrl} 
                  alt={business.name}
                  className="w-10 h-10 object-cover rounded-lg"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  {business.name.charAt(0).toUpperCase()}
                </div>
              )}
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
                    backgroundColor: isCurrentPath(item.href) ? primaryColor : 'transparent'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            {/* Cart Icon with Badge */}
            <Link
              href={`/store/${business.slug}/cart`}
              className="relative flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-200 hover:bg-gray-100"
              title={t.cart}
            >
              <ShoppingCartIcon className="w-5 h-5" />
              <span className="hidden lg:inline">{t.cart}</span>
              
              {/* Cart Badge */}
              {itemCount > 0 && (
                <div 
                  className="absolute -top-2 -right-2 min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="px-1">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Language Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
              className="flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <GlobeAltIcon className="w-4 h-4" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Mobile Cart Icon */}
            <Link
              href={`/store/${business.slug}/cart`}
              className="md:hidden relative p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title={t.cart}
            >
              <ShoppingCartIcon className="w-6 h-6" />
              
              {/* Mobile Cart Badge */}
              {itemCount > 0 && (
                <div 
                  className="absolute -top-1 -right-1 min-w-[18px] h-4 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="px-1">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                </div>
              )}
            </Link>

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
                    backgroundColor: isCurrentPath(item.href) ? primaryColor : 'transparent'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            {/* Mobile Cart Link in Menu */}
            <Link
              href={`/store/${business.slug}/cart`}
              className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <ShoppingCartIcon className="w-5 h-5" />
                <span>{t.cart}</span>
              </div>
              {itemCount > 0 && (
                <div 
                  className="min-w-[24px] h-6 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="px-2">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
} 