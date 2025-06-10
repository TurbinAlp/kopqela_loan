'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

type QuickSearchResult = {
  id: string
  name: string
  nameSwahili?: string
  category: string
  price: number
  stock: number
  type: 'retail' | 'wholesale'
  image?: string
}

type QuickSearchProps = {
  onProductSelect?: (product: QuickSearchResult) => void
  onAddNew?: () => void
  placeholder?: string
  className?: string
  showAddButton?: boolean
  maxResults?: number
}

// Mock product data - replace with actual API call
const mockProducts: QuickSearchResult[] = [
  {
    id: '1',
    name: 'Laptop Dell Inspiron',
    nameSwahili: 'Kompyuta Dell Inspiron',
    category: 'Electronics',
    price: 850000,
    stock: 15,
    type: 'retail'
  },
  {
    id: '2',
    name: 'Rice 25kg',
    nameSwahili: 'Mchele 25kg',
    category: 'Food',
    price: 45000,
    stock: 50,
    type: 'wholesale'
  },
  {
    id: '3',
    name: 'Samsung Galaxy S24',
    nameSwahili: 'Simu Samsung Galaxy S24',
    category: 'Electronics',
    price: 320000,
    stock: 8,
    type: 'retail'
  },
  {
    id: '4',
    name: 'Cooking Oil 5L',
    nameSwahili: 'Mafuta ya kupikia 5L',
    category: 'Food',
    price: 12000,
    stock: 30,
    type: 'retail'
  },
  {
    id: '5',
    name: 'Office Chair',
    nameSwahili: 'Kiti cha ofisi',
    category: 'Furniture',
    price: 85000,
    stock: 12,
    type: 'retail'
  },
  {
    id: '6',
    name: 'Maize Flour 2kg',
    nameSwahili: 'Unga wa mahindi 2kg',
    category: 'Food',
    price: 3500,
    stock: 100,
    type: 'retail'
  }
]

const searchProducts = (query: string): QuickSearchResult[] => {
  if (!query.trim()) return []
  
  const searchTerm = query.toLowerCase()
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    (product.nameSwahili && product.nameSwahili.toLowerCase().includes(searchTerm)) ||
    product.category.toLowerCase().includes(searchTerm)
  )
}

export default function QuickSearch({ 
  onProductSelect, 
  onAddNew,
  placeholder, 
  className = '',
  showAddButton = true,
  maxResults = 6
}: QuickSearchProps) {
  const { language } = useLanguage()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<QuickSearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const translations = {
    en: {
      searchPlaceholder: 'Search products...',
      addNew: 'Add New Product',
      noResults: 'No products found',
      searchTip: 'Try different keywords',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      lowStock: 'Low Stock',
      retail: 'Retail',
      wholesale: 'Wholesale'
    },
    sw: {
      searchPlaceholder: 'Tafuta bidhaa...',
      addNew: 'Ongeza Bidhaa Mpya',
      noResults: 'Hakuna bidhaa',
      searchTip: 'Jaribu maneno mengine',
      inStock: 'Ipo Stock',
      outOfStock: 'Hakuna Stock',
      lowStock: 'Stock Kidogo',
      retail: 'Rejareja',
      wholesale: 'Jumla'
    }
  }

  const t = translations[language as keyof typeof translations] || translations.en

  // Search with debounce
  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      const searchResults = searchProducts(query).slice(0, maxResults)
      setResults(searchResults)
    }, 200)

    return () => clearTimeout(timer)
  }, [query, maxResults])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    const totalItems = results.length + (showAddButton && query.trim() ? 1 : 0)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          if (selectedIndex < results.length) {
            handleProductSelect(results[selectedIndex])
          } else if (showAddButton && onAddNew) {
            onAddNew()
          }
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleProductSelect = (product: QuickSearchResult) => {
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(-1)
    onProductSelect?.(product)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: t.outOfStock, color: 'text-red-600' }
    if (stock <= 10) return { label: t.lowStock, color: 'text-yellow-600' }
    return { label: t.inStock, color: 'text-green-600' }
  }

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
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
        />
        
        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (query.trim().length >= 1 || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {results.length > 0 ? (
              <div className="py-1">
                {results.map((product, index) => {
                  const stockStatus = getStockStatus(product.stock)
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                        selectedIndex === index ? 'bg-teal-50 border-r-2 border-teal-500' : ''
                      }`}
                    >
                      {/* Product Image Placeholder */}
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-teal-600 font-medium text-sm">
                          {(language === 'en' ? product.name : product.nameSwahili || product.name).charAt(0)}
                        </span>
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {language === 'en' ? product.name : product.nameSwahili || product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{product.category}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            product.type === 'retail' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {t[product.type]}
                          </span>
                        </div>
                      </div>
                      
                      {/* Price and Stock */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          TSh {product.price.toLocaleString()}
                        </p>
                        <p className={`text-xs ${stockStatus.color}`}>
                          {product.stock} {stockStatus.label}
                        </p>
                      </div>
                    </button>
                  )
                })}
                
                {/* Add New Product Option */}
                {showAddButton && query.trim() && onAddNew && (
                  <button
                    onClick={() => {
                      onAddNew()
                      setQuery('')
                      setIsOpen(false)
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100 ${
                      selectedIndex === results.length ? 'bg-teal-50 border-r-2 border-teal-500' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <PlusIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
                        {t.addNew}
                      </p>
                      <p className="text-xs text-gray-500">
                        Create &quot;{query}&quot; as new product
                      </p>
                    </div>
                  </button>
                )}
              </div>
            ) : query.trim().length >= 1 ? (
              <div className="p-4 text-center">
                <MagnifyingGlassIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">{t.noResults}</p>
                <p className="text-xs text-gray-400 mt-1">{t.searchTip}</p>
                
                {/* Add New Product Option when no results */}
                {showAddButton && onAddNew && (
                  <button
                    onClick={() => {
                      onAddNew()
                      setQuery('')
                      setIsOpen(false)
                    }}
                    className="mt-3 inline-flex items-center px-3 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t.addNew}
                  </button>
                )}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}