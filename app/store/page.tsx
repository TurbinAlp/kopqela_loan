'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '../contexts/LanguageContext'
import { useStores } from '../hooks/useStores'
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  TagIcon
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
      viewStore: 'Visit Store',
      deliveryAvailable: 'Delivery Available',
      creditAvailable: 'Credit Available',
      openNow: 'Open Now',
      closedNow: 'Closed',
      areas: 'areas',
      noStoresFound: 'No stores found',
      noStoresDesc: 'Try adjusting your search or category filter',
      loading: 'Loading stores...',
      errorLoading: 'Error loading stores'
    },
    sw: {
      title: 'Gundua Maduka Mazuri',
      subtitle: 'Pata duka kamili kwa mahitaji yako ya ununuzi',
      searchPlaceholder: 'Tafuta maduka...',
      allCategories: 'Aina Zote',
      viewStore: 'Tembelea Duka',
      deliveryAvailable: 'Uwasilishaji Unapatikana',
      creditAvailable: 'Mkopo Unapatikana',
      openNow: 'Limefunguka',
      closedNow: 'Limefungwa',
      areas: 'maeneo',
      noStoresFound: 'Hakuna maduka yaliyopatikana',
      noStoresDesc: 'Jaribu kubadilisha utafutaji au chujio la aina',
      loading: 'Ninapakia maduka...',
      errorLoading: 'Hitilafu ya kupakia maduka'
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
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl md:text-2xl text-teal-100 mb-8 max-w-3xl mx-auto">
            {t.subtitle}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => {
              const storeIsOpen = isStoreOpen(store)
              return (
                <div key={store.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Store Header */}
                  <div 
                    className="h-32 flex items-center justify-center text-white relative"
                    style={{ backgroundColor: store.primaryColor }}
                  >
                    <div className="text-center">
                      {store.logo ? (
                        <img 
                          src={store.logo} 
                          alt={store.name}
                          className="w-16 h-16 object-cover rounded-xl mx-auto mb-2"
                        />
                      ) : (
                        <div className="text-4xl font-bold mb-2">
                          {store.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-sm opacity-90">{store.businessType}</div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        storeIsOpen 
                          ? 'bg-green-500 bg-opacity-20 text-green-100 border border-green-400'
                          : 'bg-red-500 bg-opacity-20 text-red-100 border border-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${storeIsOpen ? 'bg-green-400' : 'bg-red-400'}`} />
                        {storeIsOpen ? t.openNow : t.closedNow}
                      </span>
                    </div>
                  </div>

                  {/* Store Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{store.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{store.description}</p>

                    {/* Store Info */}
                    <div className="space-y-2 mb-6">
                      {store.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{store.address}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{store.deliveryAreas.length} {t.areas}</span>
                      </div>

                      {store.contactPhone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{store.contactPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {t.deliveryAvailable}
                      </span>
                      {store.settings.allowCredit && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t.creditAvailable}
                        </span>
                      )}
                    </div>

                    {/* Visit Store Button */}
                    <Link
                      href={`/store/${store.slug}`}
                      className="block w-full text-center px-4 py-3 text-white font-semibold rounded-lg transition-colors hover:opacity-90"
                      style={{ backgroundColor: store.primaryColor }}
                    >
                      {t.viewStore}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 