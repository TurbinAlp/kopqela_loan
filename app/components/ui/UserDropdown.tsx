'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { useSession, signOut } from 'next-auth/react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBusiness } from '../../contexts/BusinessContext'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'

interface UserDropdownProps {
  className?: string
}

export default function UserDropdown({ className = '' }: UserDropdownProps) {
  const { language } = useLanguage()
  const { data: session } = useSession()
  const { currentBusiness, businesses, setCurrentBusiness } = useBusiness()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get user role from current business (already loaded with business data)
  const userRole = currentBusiness?.userRole?.toLowerCase() || 'customer'

  const translations = {
    en: {
      profile: "Profile",
      settings: "Settings", 
      logout: "Logout",
      administrator: "Administrator",
      manager: "Manager",
      cashier: "Cashier",
      customer: "Customer"
    },
    sw: {
      profile: "Profaili",
      settings: "Mipangilio",
      logout: "Toka",
      administrator: "Msimamizi",
      manager: "Meneja", 
      cashier: "Mwajiri",
      customer: "Mteja"
    }
  }

  const t = translations[language]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    // Use firstName and lastName if available
    if (session?.user?.firstName && session?.user?.lastName) {
      return `${session.user.firstName[0]}${session.user.lastName[0]}`.toUpperCase()
    }
    
    // Fallback to name if available
    if (session?.user?.name) {
      return session.user.name.split(' ').map(name => name[0]).join('').toUpperCase()
    }
    
    // Final fallback to email or 'U'
    return session?.user?.email?.[0]?.toUpperCase() || 'U'
  }

  // Check if user has profile picture
  const getUserImage = () => {
    return session?.user?.image || null
  }

  // Get user role display name from current business context
  const getUserRole = () => {
    const role = userRole || 'customer'

    // Debug logging
    console.log('UserDropdown - Current business:', currentBusiness?.name)
    console.log('UserDropdown - Dynamic role:', role)
    console.log('UserDropdown - Business ID:', currentBusiness?.id)

    switch (role) {
      case 'admin':
        return t.administrator
      case 'manager':
        return t.manager
      case 'cashier':
        return t.cashier
      case 'customer':
      default:
        console.warn('UserDropdown - Unknown role, defaulting to customer:', role)
        return t.customer // Default fallback
    }
  }

  const handleLogout = async () => {
    setIsOpen(false)
    await signOut({ 
      callbackUrl: '/login',
      redirect: true 
    })
  }

  const handleProfile = () => {
    setIsOpen(false)
    // Navigate to profile page
    router.push('/admin/profile')
  }

  const handleSettings = () => {
    setIsOpen(false)
    // Navigate to settings page  
    router.push('/admin/settings')
  }

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95, 
      y: -10,
      transition: { 
        duration: 0.1 
      }
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    }
  }

  const menuItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.15 }
    })
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* User Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center space-x-2 lg:space-x-3 p-1 lg:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        {/* Avatar */}
        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full overflow-hidden">
          {getUserImage() ? (
            <Image 
              src={getUserImage()!} 
              alt="Profile" 
              width={32}
              height={32}
              className="w-full h-full object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-medium text-xs lg:text-sm">
                {getUserInitials()}
              </span>
            </div>
          )}
        </div>
        
        {/* User Info - Hidden on small screens */}
        <div className="hidden lg:block text-left">
          <p className="text-sm font-medium text-gray-800">
            {session?.user?.firstName && session?.user?.lastName
              ? `${session.user.firstName} ${session.user.lastName}`
              : session?.user?.name || session?.user?.email || 'User'}
          </p>
          <p className="text-xs text-gray-500">{getUserRole()}</p>
        </div>
        
        {/* Dropdown Arrow */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-teal-500 ring-opacity-5 z-50 overflow-hidden"
          >
            {/* User Info Header - Mobile */}
            <div className="lg:hidden px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800">
                {session?.user?.firstName && session?.user?.lastName 
                  ? `${session.user.firstName} ${session.user.lastName}`
                  : session?.user?.name || session?.user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-500">{getUserRole()}</p>
            </div>

            <div className="py-1">
              {/* Business Switcher - Only show if multiple businesses */}
              {businesses.length > 1 && (
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Current Business</p>
                  <div className="space-y-1">
                    {businesses.map((business) => (
                      <button
                        key={business.id}
                        onClick={() => {
                          setCurrentBusiness(business)
                          setIsOpen(false)
                        }}
                        className={`flex items-center space-x-2 w-full px-2 py-2 text-left text-sm rounded-lg transition-colors ${
                          currentBusiness?.id === business.id
                            ? 'bg-teal-50 text-teal-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <BuildingOfficeIcon className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{business.name}</p>
                          <p className="text-xs text-gray-500 truncate">{business.businessType}</p>
                        </div>
                        {currentBusiness?.id === business.id && (
                          <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile */}
              <motion.button
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                onClick={handleProfile}
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span>{t.profile}</span>
              </motion.button>

              {/* Settings */}
              <motion.button
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                onClick={handleSettings}
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <CogIcon className="w-4 h-4 text-gray-400" />
                <span>{t.settings}</span>
              </motion.button>

              {/* Divider */}
              <div className="my-1 border-t border-gray-100" />

              {/* Logout */}
              <motion.button
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-500" />
                <span>{t.logout}</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 