'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import LoadingLink from '../components/ui/LoadingLink'
import { 
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CogIcon,
  DocumentChartBarIcon,
  LanguageIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../contexts/LanguageContext'
import { BusinessProvider } from '../contexts/BusinessContext'
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext'
import { usePathname } from 'next/navigation'
import { hasPermissionSync, useBusinessPermissions } from '../hooks/usePermissions'
import { useSession } from 'next-auth/react'
import { useBusiness } from '../contexts/BusinessContext'
import NotificationCenter from '../components/notifications/NotificationCenter'
import GlobalSearch from '../components/search/GlobalSearch'
import UserDropdown from '../components/ui/UserDropdown'
import CreateBusinessModal from '../components/admin/business/CreateBusinessModal'



interface AdminLayoutProps {
  children: React.ReactNode
}

// Main admin layout content component
function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { language, setLanguage } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarOpen, setSidebarOpen, closeSidebar } = useSidebar()
  const { data: session, status: authStatus } = useSession()
  const { currentBusiness, businesses, loadBusinesses, setCurrentBusiness, isLoading } = useBusiness()
  const [showCreateBusiness, setShowCreateBusiness] = useState(false)
  
  // Get business-specific permissions
  const { permissions: businessPermissions, loading: permissionsLoading } = useBusinessPermissions(currentBusiness?.id)
  
  // Listen for close sidebar events (from LoadingLink)
  useEffect(() => {
    const handleCloseSidebar = () => {
      closeSidebar()
    }
    
    window.addEventListener('closeSidebar', handleCloseSidebar)
    return () => {
      window.removeEventListener('closeSidebar', handleCloseSidebar)
    }
  }, [closeSidebar])

  // Block UI for users without any businesses: force create business modal
  useEffect(() => {
    // Show the blocking modal only after businesses have finished loading
    if (isLoading) {
      setShowCreateBusiness(false)
    } else {
      setShowCreateBusiness((businesses?.length || 0) === 0)
    }
  }, [isLoading, businesses])

  const handleBusinessCreated = async (businessId: number) => {
    // Reload businesses, select the newly created as current
    await loadBusinesses()
    // After loadBusinesses updates provider state, pick created business
    const created = (businesses || []).find(b => b.id === businessId)
    if (created) {
      await setCurrentBusiness(created)
    }
    setShowCreateBusiness(false)
  }

  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    // Auto-expand items based on current route
    const expanded = []
    if (pathname.startsWith('/admin/products') || pathname.startsWith('/admin/inventory')) {
      expanded.push('products')
    }
    if (pathname.startsWith('/admin/settings')) {
      expanded.push('settings')
    }
    if (pathname.startsWith('/admin/business')) {
      expanded.push('business')
    }
    if (pathname.startsWith('/admin/customers')) {
      expanded.push('customers')
    }
    return expanded
  })

  const translations = {
    en: {
      dashboard: "Dashboard",
      products: "Products",
      allProducts: "All Products",
      categories: "Categories",
      addProduct: "Add Product",
      editProduct: "Edit Product",
      productDetails: "Product Details",
      services: "Services",
      sales: "Sales",
      pos: "Point of Sale",
      customers: "Customers",
      customerDetails: "Customer Details",
      credit: "Credit Sales",
      reports: "Reports",
      settings: "Settings",
      generalSettings: "General Settings",
      searchPlaceholder: "Search anything...",
      adminName: "John Admin",
      business: 'Business',
      userManagement: 'User Management',
      movementHistory: 'Movement History'
    },
    sw: {
      dashboard: "Dashibodi",
      products: "Bidhaa",
      allProducts: "Bidhaa Zote",
      categories: "Makundi",
      addProduct: "Ongeza Bidhaa",
      editProduct: "Hariri Bidhaa",
      productDetails: "Maelezo ya Bidhaa",
      services: "Huduma",
      sales: "Mauzo",
      pos: "Mahali pa Mauzo",
      customers: "Wateja",
      customerDetails: "Maelezo ya Mteja",
      credit: "Mauzo ya Mikopo",
      reports: "Ripoti",
      settings: "Mipangilio",
      generalSettings: "Mipangilio ya Jumla",
      searchPlaceholder: "Tafuta chochote...",
      adminName: "John Msimamizi",
      business: 'Biashara',
      userManagement: 'Usimamizi wa Watumiaji',
      movementHistory: 'Historia ya Mabadiliko'
    }
  }

  const t = translations[language]

  // Global loading gate to avoid flicker across sidebar/header/content
  const globalLoading = authStatus === 'loading' || isLoading || (currentBusiness?.id ? permissionsLoading : false)

  if (globalLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    )
  }

  const allSidebarItems = [
    { 
      name: t.dashboard, 
      icon: HomeIcon, 
      href: "/admin/dashboard",
      permission: "dashboard.read"
    },
    { 
      name: t.products, 
      icon: ShoppingBagIcon, 
      href: "/admin/products",
      permission: "products.read",
      subItems: [
        { name: t.allProducts, href: "/admin/products", permission: "products.read" },
        { name: t.categories, href: "/admin/products/categories", permission: "categories.manage" },
        { name: t.addProduct, href: "/admin/products/add", permission: "products.create" },
        { name: t.movementHistory, href: "/admin/inventory/movements", permission: "inventory.read" }
      ]
    },
    { 
      name: t.services, 
      icon: WrenchScrewdriverIcon, 
      href: "/admin/services",
      permission: "services.read"
    },
    { 
      name: t.sales, 
      icon: DocumentChartBarIcon, 
      href: "/admin/sales",
      permission: "sales.read"
    },
    { 
      name: t.pos, 
      icon: ComputerDesktopIcon, 
      href: "/admin/pos",
      permission: "pos.create"
    },
    { 
      name: t.customers, 
      icon: UserGroupIcon, 
      href: "/admin/customers",
      permission: "customers.read"
    },
    { 
      name: t.credit, 
      icon: CreditCardIcon, 
      href: "/admin/credit",
      permission: "credit_applications.read"
    },
    { 
      name: t.reports, 
      icon: DocumentTextIcon, 
      href: "/admin/reports",
      permission: "reports.read"
    },
    { 
      name: t.userManagement, 
      icon: UserGroupIcon, 
      href: "/admin/users",
      permission: "users.read"
    },
    { 
      name: t.settings, 
      icon: CogIcon, 
      href: "/admin/settings",
      permission: "settings.manage",
      subItems: [
        { name: t.generalSettings, href: "/admin/settings", permission: "settings.manage" }
      ]
    },
    { 
      name: t.business, 
      icon: BuildingOfficeIcon, 
      href: "/admin/business",
      permission: "business.read"
    }
  ]

  // Filter sidebar items based on business-specific permissions
  const sidebarItems = allSidebarItems.filter(item => {
    if (!item.permission) return true // Show items without permission requirements
    return hasPermissionSync(session, item.permission, businessPermissions)
  }).map(item => ({
    ...item,
    subItems: item.subItems?.filter(subItem => {
      if (!subItem.permission) return true
      return hasPermissionSync(session, subItem.permission, businessPermissions)
    })
  }))

  const isActiveRoute = (href: string) => {
    if (pathname === href) return true
    
    // For nested routes, match parent routes but avoid false positives
    const nestedRouteMap: Record<string, string> = {
      "/admin/business": "/admin/business",
      "/admin/products": "/admin/products", 
      "/admin/settings": "/admin/settings",
      "/admin/customers": "/admin/customers"
    }
    
    for (const [parentRoute, prefix] of Object.entries(nestedRouteMap)) {
      if (href === parentRoute && pathname.startsWith(prefix + "/")) {
        return true
      }
    }
    
    return false
  }

  const isItemExpanded = (itemName: string) => {
    return expandedItems.includes(itemName.toLowerCase())
  }

  const toggleExpansion = (itemName: string) => {
    const key = itemName.toLowerCase()
    setExpandedItems(prev => 
      prev.includes(key) 
        ? prev.filter(item => item !== key)
        : [...prev, key]
    )
  }

  const getPageTitle = () => {
    // Check for exact matches in sub-items first
    for (const item of sidebarItems) {
      if (item.subItems) {
        const subItem = item.subItems.find(sub => pathname === sub.href)
        if (subItem) return subItem.name
      }
    }
    
    // Detailed route-specific handling
    const routeTitleMap: Record<string, string> = {
      // Products routes
      '/admin/products/add': t.addProduct,
      '/admin/products/categories': t.categories,
      
      // Business routes - need titles even without sidebar links
      '/admin/business/add': language === 'sw' ? 'Ongeza Biashara' : 'Add Business',
      '/admin/business/edit': language === 'sw' ? 'Hariri Biashara' : 'Edit Business',
    }
    
    // Check for dynamic routes with patterns
    if (pathname.match(/^\/admin\/products\/\d+\/edit$/)) {
      return t.editProduct
    }
    
    if (pathname.match(/^\/admin\/products\/\d+$/)) {
      return t.productDetails
    }
    
    if (pathname.match(/^\/admin\/customers\/\d+$/)) {
      return t.customerDetails
    }
    
    // Check static route mappings
    if (routeTitleMap[pathname]) {
      return routeTitleMap[pathname]
    }
    
    // Then check main items for exact matches
    const exactMatch = sidebarItems.find(item => pathname === item.href)
    if (exactMatch) return exactMatch.name
    
    // Finally, check for parent routes
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Koppela</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto mt-6 px-3 pb-6 sidebar-scroll">
          {sidebarItems.map((item, index) => (
            <div key={item.name}>
              {item.subItems ? (
                // Menu item with dropdown
                <>
                  <motion.button
                    onClick={() => toggleExpansion(item.name)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-full flex items-center justify-between px-3 py-3 mb-1 rounded-xl text-sm font-medium transition-all duration-200 ${
                      pathname.startsWith(item.href)
                        ? 'bg-teal-50 text-teal-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${
                      isItemExpanded(item.name) ? 'rotate-180' : ''
                    }`} />
                  </motion.button>
                  
                  {/* Sub-items */}
                  {(isItemExpanded(item.name) || pathname.startsWith(item.href)) && (
                    <div className="ml-8 mb-2">
                      {item.subItems.map((subItem, subIndex) => (
                        <LoadingLink
                          key={subItem.name}
                          href={subItem.href}
                          closeSidebarOnMobile={true}
                        >
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: subIndex * 0.05 }}
                            className={`block px-3 py-2 mb-1 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                              isActiveRoute(subItem.href)
                                ? 'bg-teal-100 text-teal-700 border-l-3 border-teal-600 font-semibold' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            {subItem.name}
                          </motion.div>
                        </LoadingLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Regular menu item
                <LoadingLink href={item.href} closeSidebarOnMobile={true}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-3 px-3 py-3 mb-1 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActiveRoute(item.href)
                        ? 'bg-teal-50 text-teal-600 border-r-4 border-teal-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </motion.div>
                </LoadingLink>
              )}
            </div>
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
                      router.push(`/admin/products/${result.id}`)
                      break
                    case 'customer':
                      router.push(`/admin/customers/${result.id}`)
                      break
                    case 'order':
                      router.push(`/admin/sales/orders/${result.id}`)
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
              <UserDropdown />
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
                    router.push(`/admin/products/${result.id}`)
                    break
                  case 'customer':
                    router.push(`/admin/customers/${result.id}`)
                    break
                  case 'order':
                    router.push(`/admin/sales/orders/${result.id}`)
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

      {/* Blocking modal for creating first business */}
      <CreateBusinessModal
        isOpen={showCreateBusiness}
        onClose={() => { /* Block manual close to force business creation */ }}
        onCreated={handleBusinessCreated}
      />

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

// Main export component with providers
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <BusinessProvider>
      <SidebarProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SidebarProvider>
    </BusinessProvider>
  )
}