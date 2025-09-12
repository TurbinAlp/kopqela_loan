'use client'

import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import Image from 'next/image'

interface Product {
  id: number
  name: string
  nameSwahili?: string
  price: number
  wholesalePrice?: number
  category?: string
  image?: string
  stock: number
  barcode?: string
  unit?: string
}

interface Category {
  id: number
  name: string
  nameSwahili?: string
  description?: string
  productCount?: number
}

interface ProductsSectionProps {
  products: Product[]
  categories: Category[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  onAddToCart: (product: Product) => void
  businessType?: 'RETAIL' | 'WHOLESALE' | 'BOTH'
}

export default function ProductsSection({
  products,
  categories,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onAddToCart,
  businessType
}: ProductsSectionProps) {
  const { language } = useLanguage()
  const normalizedBusinessType = (businessType || 'RETAIL').toUpperCase() as 'RETAIL' | 'WHOLESALE' | 'BOTH'
  
  const translations = {
    en: {
      productSearch: "Search products...",
      categories: "Categories",
      all: "All",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      currency: "TZS",
      retailPrice: "Retail",
      wholesalePrice: "Wholesale"
    },
    sw: {
      productSearch: "Tafuta bidhaa...",
      categories: "Makundi",
      all: "Yote",
      inStock: "Ipo Hifadhini",
      outOfStock: "Haijapapo",
      currency: "TSh",
      retailPrice: "Reja Reja",
      wholesalePrice: "Jumla"
    }
  }

  const t = translations[language]

  // Build categories for filter dropdown
  const categoryOptions = [
    { value: 'all', label: t.all },
    ...categories.map(category => ({
      value: category.name,
      label: language === 'sw' && category.nameSwahili 
        ? `${category.nameSwahili}/${category.name}` 
        : category.name
    }))
  ]

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.nameSwahili && product.nameSwahili.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.productSearch}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white text-gray-900"
        >
          {categoryOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm w-full"
            onClick={() => onAddToCart(product)}
          >
            <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                <Image
                  src={product?.image || '/images/placeholder-product.svg'}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="object-cover rounded"
                />
            </div>
            <h3 className="font-medium text-sm mb-2 line-clamp-2 leading-tight">
              {language === 'sw' && product.nameSwahili ? product.nameSwahili : product.name}
            </h3>

            {/* Price Display Section */}
            <div className="mb-3 space-y-1">
              {normalizedBusinessType !== 'WHOLESALE' && (
                <div className="text-xs font-medium">
                  <span className="text-gray-600">{t.retailPrice}:</span>
                  <span className="ml-1 font-bold text-teal-600">
                    {t.currency} {product.price.toLocaleString()}
                  </span>
                </div>
              )}

              {normalizedBusinessType !== 'RETAIL' && product.wholesalePrice && (
                <div className="text-xs font-medium">
                  <span className="text-gray-600">{t.wholesalePrice}:</span>
                  <span className="ml-1 font-semibold text-blue-600">
                    {t.currency} {product.wholesalePrice.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <p className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${t.inStock}: ${product.stock}` : t.outOfStock}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 