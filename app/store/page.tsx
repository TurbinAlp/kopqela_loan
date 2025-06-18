'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '../contexts/LanguageContext'
import { useStores } from '../hooks/useStores'
import ClientOnlyToolbar from '../components/ClientOnlyToolbar'
import Image from 'next/image'
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  TagIcon,
  ShoppingBagIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

export default function StoreListingPage() {
  const { language, setLanguage } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Fetch stores using the custom hook
  const { stores, isLoading, error } = useStores(searchQuery, selectedCategory)

  const translations = {
    en: {
      title: 'Discover Amazing Stores',
      subtitle: 'Find the perfect store for your shopping needs',
      searchPlaceholder: 'Search stores...',
      allCategories: 'All Categories',
      viewStore: 'View Store',
      shopNow: 'Shop Now',
      deliveryAvailable: 'Delivery Available',
      openNow: 'Open Now',
      closedNow: 'Closed',
      areas: 'delivery areas',
      noStoresFound: 'No stores found',
      noStoresDesc: 'Try adjusting your search or category filter',
      loading: 'Loading stores...',
      errorLoading: 'Error loading stores',
      products: 'Products',
      location: 'Location'
    },
    sw: {
      title: 'Gundua Maduka Mazuri',
      subtitle: 'Pata duka kamili kwa mahitaji yako ya ununuzi',
      searchPlaceholder: 'Tafuta maduka...',
      allCategories: 'Aina Zote',
      viewStore: 'Ona Duka',
      shopNow: 'Nunua Sasa',
      deliveryAvailable: 'Uwasilishaji Unapatikana',
      openNow: 'Limefunguka',
      closedNow: 'Limefungwa',
      areas: 'maeneo ya uwasilishaji',
      noStoresFound: 'Hakuna maduka yaliyopatikana',
      noStoresDesc: 'Jaribu kubadilisha utafutaji au chujio la aina',
      loading: 'Ninapakia maduka...',
      errorLoading: 'Hitilafu ya kupakia maduka',
      products: 'Bidhaa',
      location: 'Mahali'
    }
  }

  const t = translations[language]

  // Get unique business types for category filter
  const businessTypes = ['all', ...Array.from(new Set(stores.map(store => store.businessType)))]

  // Check if store is currently open
  const isStoreOpen = (store: typeof stores[0]) => {
    const now = new Date()
    const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()]
    const currentTime = now.toTimeString().slice(0, 5)
    const todayHours = store.workingHours[dayKey]
    return todayHours?.isOpen && currentTime >= todayHours.open && currentTime <= todayHours.close
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-teal-600">
              Kopqela
            </Link>
            <button
              onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span>{language.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">{t.title}</h1>
          <p className="text-lg md:text-xl text-teal-100 mb-6 max-w-2xl mx-auto">
            {t.subtitle}
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                placeholder={t.searchPlaceholder}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {businessTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedCategory(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === type
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? t.allCategories : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Store Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t.loading}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <TagIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.errorLoading}</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12">
            <TagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noStoresFound}</h3>
            <p className="text-gray-600">{t.noStoresDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => {
              const storeIsOpen = isStoreOpen(store)
              return (
                <div key={store.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                  {/* Store Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {store.logo ? (
                          <Image
                            width={48}
                            height={48}
                            src={store.logo} 
                            alt={store.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: store.primaryColor }}
                          >
                            {store.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{store.name}</h3>
                          <p className="text-sm text-gray-500">{store.businessType}</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        storeIsOpen 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${storeIsOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                        {storeIsOpen ? t.openNow : t.closedNow}
                      </span>
                    </div>

                    {/* Description */}
                    {store.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">{store.description}</p>
                    )}

                    {/* Store Info */}
                    <div className="space-y-2">
                      {store.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="line-clamp-1">{store.address}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span>{store.deliveryAreas.length} {t.areas}</span>
                      </div>

                      {store.contactPhone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                          <span>{store.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="px-6 pb-6">
                    <div className="flex space-x-3">
                      {/* View Store Button */}
                      <Link
                        href={`/store/${store.slug}`}
                        className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        {t.viewStore}
                      </Link>

                      {/* Shop Now Button */}
                      <Link
                        href={`/store/${store.slug}/products`}
                        className="flex-1 flex items-center justify-center px-4 py-2.5 text-white font-medium rounded-lg transition-colors text-sm"
                        style={{ backgroundColor: store.primaryColor }}
                      >
                        <ShoppingBagIcon className="w-4 h-4 mr-2" />
                        {t.shopNow}
                      </Link>
                    </div>

                    {/* Delivery Badge */}
                    <div className="mt-3 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {t.deliveryAvailable}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <ClientOnlyToolbar />
    </div>
  )
} 