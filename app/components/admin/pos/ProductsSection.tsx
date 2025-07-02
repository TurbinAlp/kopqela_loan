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
  category?: string
  image?: string
  stock: number
  barcode?: string
  unit?: string
}

interface ProductsSectionProps {
  products: Product[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  onAddToCart: (product: Product) => void
}

export default function ProductsSection({
  products,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onAddToCart
}: ProductsSectionProps) {
  const { language } = useLanguage()
  
  const translations = {
    en: {
      productSearch: "Search products...",
      categories: "Categories",
      all: "All",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      currency: "TZS"
    },
    sw: {
      productSearch: "Tafuta bidhaa...",
      categories: "Makundi",
      all: "Yote",
      inStock: "Ipo Hifadhini",
      outOfStock: "Haijapapo",
      currency: "TSh"
    }
  }

  const t = translations[language]

  const categories = [
    { value: 'all', label: t.all },
    { value: 'Food', label: 'Food/Chakula' },
    { value: 'Construction', label: 'Construction/Ujenzi' },
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
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => onAddToCart(product)}
          >
            <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                <Image src={product?.image || ''} alt={product.name} width={200} height={200} />
            </div>
            <h3 className="font-medium text-sm mb-1 line-clamp-2">
              {language === 'sw' && product.nameSwahili ? product.nameSwahili : product.name}
            </h3>
            <p className="text-lg font-bold text-teal-600 mb-1">
              {t.currency} {product.price.toLocaleString()}
            </p>
            <p className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${t.inStock}: ${product.stock}` : t.outOfStock}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 