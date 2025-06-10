'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CogIcon,
  DocumentChartBarIcon,
  LanguageIcon,
  ComputerDesktopIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../contexts/LanguageContext'
import { usePathname } from 'next/navigation'
import NotificationCenter from '../components/notifications/NotificationCenter'
import GlobalSearch from '../components/search/GlobalSearch'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { language, setLanguage } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const translations = {
    en: {
      dashboard: "Dashboard",
      products: "Products", 
      sales: "Sales",
      pos: "Point of Sale",
      customers: "Customers",
      customerLookup: "Customer Lookup",
      paymentCollection: "Payment Collection",
      credit: "Credit",
      reports: "Reports",
      settings: "Settings",
      searchPlaceholder: "Search anything...",
      profile: "Profile",
      logout: "Logout",
      adminName: "John Admin"
    },
    sw: {
      dashboard: "Dashibodi",
      products: "Bidhaa",
      sales: "Mauzo",
      pos: "Mahali pa Mauzo",
      customers: "Wateja",
      customerLookup: "Utafutaji wa Wateja",
      paymentCollection: "Ukusanyaji wa Malipo",
      credit: "Mikopo",
      reports: "Ripoti",
      settings: "Mipangilio",
      searchPlaceholder: "Tafuta chochote...",
      profile: "Profaili",
      logout: "Toka",
      adminName: "John Msimamizi"
    }
  }

  const t = translations[language]

  const sidebarItems = [
    { name: t.dashboard, icon: HomeIcon, href: "/admin/dashboard" },
    { name: t.products, icon: ShoppingBagIcon, href: "/admin/products" },
    { name: t.sales, icon: DocumentChartBarIcon, href: "/admin/sales" },
    { name: t.pos, icon: ComputerDesktopIcon, href: "/cashier/pos" },
    { name: t.customers, icon: UserGroupIcon, href: "/admin/customers" },
    { name: t.customerLookup, icon: MagnifyingGlassIcon, href: "/admin/customers/lookup" },
    { name: t.paymentCollection, icon: BanknotesIcon, href: "/admin/payments" },
    { name: t.credit, icon: CreditCardIcon, href: "/admin/credit" },
    { name: t.reports, icon: DocumentTextIcon, href: "/admin/reports" },
    { name: t.settings, icon: CogIcon, href: "/admin/settings" }
  ]

  const isActiveRoute = (href: string) => {
    return pathname === href
  }

  const getPageTitle = () => {
    const currentItem = sidebarItems.find(item => isActiveRoute(item.href))
    return currentItem ? currentItem.name : t.dashboard
  }

  // Admin-specific Language Toggle Component
  const AdminLanguageToggle = () => {
    return (
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
        <button 
          onClick={() => setLanguage('en')} 
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            language === 'en' 
              ? 'bg-white text-teal-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <LanguageIcon className="w-4 h-4" />
          <span>EN</span>
        </button>
        <button 
          onClick={() => setLanguage('sw')} 
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            language === 'sw' 
              ? 'bg-white text-teal-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <LanguageIcon className="w-4 h-4" />
          <span>SW</span>
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Kopqela</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {sidebarItems.map((item, index) => (
            <motion.a
              key={item.name}
              href={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 px-3 py-3 mb-1 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActiveRoute(item.href)
                  ? 'bg-teal-50 text-teal-600 border-r-4 border-teal-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </motion.a>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Left side */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Bars3Icon className="w-6 h-6 text-gray-600" />
              </button>
              
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
              </div>
              
              {/* Mobile title */}
              <div className="block md:hidden">
                <h1 className="text-lg font-bold text-gray-800 truncate">{getPageTitle()}</h1>
              </div>
            </div>

            {/* Search - Hidden on very small screens */}
            <div className="hidden sm:flex flex-1 max-w-md mx-4">
              <GlobalSearch
                placeholder={t.searchPlaceholder}
                onResultSelect={(result) => {
                  // Navigate based on result type
                  switch (result.type) {
                    case 'product':
                      window.location.href = `/admin/products/${result.id}`
                      break
                    case 'customer':
                      window.location.href = `/admin/customers/${result.id}`
                      break
                    case 'order':
                      window.location.href = `/admin/sales/orders/${result.id}`
                      break
                  }
                }}
                className="w-full"
              />
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
              {/* Language toggle - Hidden on very small screens */}
              <div className="hidden sm:block">
                <AdminLanguageToggle />
              </div>
              
              {/* Notifications */}
              <NotificationCenter variant="header" />

              {/* User Profile */}
              <div className="relative">
                <button className="flex items-center space-x-2 lg:space-x-3 p-1 lg:p-2 rounded-lg hover:bg-gray-100">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xs lg:text-sm">JA</span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-800">{t.adminName}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <ChevronDownIcon className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile search bar - Shows on small screens */}
          <div className="block sm:hidden px-4 pb-3">
            <GlobalSearch
              placeholder={t.searchPlaceholder}
              onResultSelect={(result) => {
                // Navigate based on result type
                switch (result.type) {
                  case 'product':
                    window.location.href = `/admin/products/${result.id}`
                    break
                  case 'customer':
                    window.location.href = `/admin/customers/${result.id}`
                    break
                  case 'order':
                    window.location.href = `/admin/sales/orders/${result.id}`
                    break
                }
              }}
              className="w-full"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-white/20 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
    </div>
  )
}