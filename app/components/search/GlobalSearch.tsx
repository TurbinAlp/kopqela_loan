'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useIsClient } from '../../hooks/useIsClient'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
  ShoppingBagIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

type SearchResult = {
  id: string
  type: 'product' | 'customer' | 'order'
  title: string
  subtitle: string
  description?: string
  metadata?: Record<string, string | number | boolean>
}

type GlobalSearchProps = {
  onResultSelect?: (result: SearchResult) => void
  placeholder?: string
  className?: string
  showCategories?: boolean
}

// Mock search function - replace with actual API call
const mockSearch = async (query: string): Promise<SearchResult[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const mockData: SearchResult[] = [
    {
      id: '1',
      type: 'product',
      title: 'Laptop Dell Inspiron',
      subtitle: 'Electronics',
      description: 'High-performance laptop for business use',
      metadata: { price: 850000, stock: 15 }
    },
    {
      id: '2',
      type: 'customer',
      title: 'John Doe',
      subtitle: '+255123456789',
      description: 'Regular customer with good payment history',
      metadata: { orders: 15, balance: 50000 }
    },
    {
      id: '3',
      type: 'order',
      title: 'ORD-001',
      subtitle: 'John Doe - TSh 85,000',
      description: 'Completed order from yesterday',
      metadata: { status: 'completed', date: '2024-01-15' }
    },
    {
      id: '4',
      type: 'product',
      title: 'Rice 25kg',
      subtitle: 'Food & Beverages',
      description: 'Premium quality rice for wholesale',
      metadata: { price: 45000, stock: 50 }
    },
    {
      id: '5',
      type: 'customer',
      title: 'Mary Smith',
      subtitle: '+255987654321',
      description: 'New customer registered last week',
      metadata: { orders: 3, balance: 0 }
    }
  ]
  
  return mockData.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
  )
}

export default function GlobalSearch({ 
  onResultSelect, 
  placeholder, 
  className = '',
  showCategories = true 
}: GlobalSearchProps) {
  const { language } = useLanguage()
  const isClient = useIsClient()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const translations = {
    en: {
      searchPlaceholder: 'Search products, customers, orders...',
      noResults: 'No results found',
      searchTip: 'Try different keywords or check spelling',
      products: 'Products',
      customers: 'Customers',
      orders: 'Orders',
      viewAll: 'View all results',
      recentSearches: 'Recent Searches'
    },
    sw: {
      searchPlaceholder: 'Tafuta bidhaa, wateja, maagizo...',
      noResults: 'Hakuna matokeo',
      searchTip: 'Jaribu maneno mengine au angalia tahajia',
      products: 'Bidhaa',
      customers: 'Wateja',
      orders: 'Maagizo',
      viewAll: 'Ona matokeo yote',
      recentSearches: 'Utafutaji wa Hivi Karibuni'
    }
  }

  const t = translations[language as keyof typeof translations] || translations.en

  // Search with debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const searchResults = await mockSearch(query)
        setResults(searchResults)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Handle click outside - only on client
  useEffect(() => {
    if (!isClient) return

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isClient])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleResultSelect = (result: SearchResult) => {
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(-1)
    onResultSelect?.(result)
  }

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'product':
        return <ShoppingBagIcon className="h-5 w-5 text-blue-500" />
      case 'customer':
        return <UserIcon className="h-5 w-5 text-green-500" />
      case 'order':
        return <DocumentTextIcon className="h-5 w-5 text-purple-500" />
      default:
        return <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'product':
        return t.products
      case 'customer':
        return t.customers
      case 'order':
        return t.orders
      default:
        return ''
    }
  }

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = []
    }
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => {
            if (query.trim() || results.length > 0) {
              setIsOpen(true)
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t.searchPlaceholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-form-type="other"
          name="search-query"
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
        />
        
        {/* Clear Button */}
        {query && !isLoading && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (query.trim().length >= 2 || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {showCategories ? (
                  // Grouped results by type
                  Object.entries(groupedResults).map(([type, typeResults]) => (
                    <div key={type}>
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                        {getTypeLabel(type as SearchResult['type'])}
                      </div>
                      {typeResults.map((result) => {
                        const globalIndex = results.findIndex(r => r.id === result.id)
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultSelect(result)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 transition-colors ${
                              selectedIndex === globalIndex ? 'bg-teal-50 border-r-2 border-teal-500' : ''
                            }`}
                          >
                            {getResultIcon(result.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {result.title}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {result.subtitle}
                              </p>
                              {result.description && (
                                <p className="text-xs text-gray-400 truncate mt-1">
                                  {result.description}
                                </p>
                              )}
                            </div>
                            {result.metadata && (
                              <div className="text-xs text-gray-400">
                                {result.type === 'product' && result.metadata.price && (
                                  <span>TSh {result.metadata.price.toLocaleString()}</span>
                                )}
                                {result.type === 'customer' && result.metadata.orders && (
                                  <span>{result.metadata.orders} orders</span>
                                )}
                                {result.type === 'order' && result.metadata.status && (
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    result.metadata.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    result.metadata.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {result.metadata.status}
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))
                ) : (
                  // Flat list of results
                  results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultSelect(result)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 transition-colors ${
                        selectedIndex === index ? 'bg-teal-50 border-r-2 border-teal-500' : ''
                      }`}
                    >
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {result.subtitle}
                        </p>
                        {result.description && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
                
                {/* View All Results */}
                {results.length > 5 && (
                  <div className="border-t border-gray-100 p-2">
                    <button
                      onClick={() => {
                        // Navigate to full search page with current query
                        window.location.href = `/admin/search?q=${encodeURIComponent(query)}`
                      }}
                      className="w-full px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                    >
                      {t.viewAll} ({results.length})
                    </button>
                  </div>
                )}
              </div>
            ) : query.trim().length >= 2 ? (
              <div className="p-4 text-center">
                <MagnifyingGlassIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">{t.noResults}</p>
                <p className="text-xs text-gray-400 mt-1">{t.searchTip}</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}