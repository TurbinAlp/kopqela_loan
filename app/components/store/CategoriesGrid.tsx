'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCustomerBusiness } from '../../hooks/useCustomerBusiness'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ShoppingBagIcon,
  SparklesIcon,
  UserIcon,
  HeartIcon,
  ShoppingCartIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

export default function CategoriesGrid() {
  const params = useParams()
  const slug = params.slug as string
  const { business, isLoading } = useCustomerBusiness(slug)
  const { language } = useLanguage()

  if (isLoading || !business) return null

  const translations = {
    en: {
      shopByCategory: 'Shop by Category',
      exploreCategories: 'Discover what we have to offer'
    },
    sw: {
      shopByCategory: 'Nunua kwa Aina',
      exploreCategories: 'Gundua tunachokupa'
    }
  }

  const t = translations[language]

  // Categories with icons based on business type
  const getCategoriesWithIcons = () => {
    if (business.businessType === 'Electronics') {
      return [
        { name: 'Smartphones', icon: DevicePhoneMobileIcon, color: '#3b82f6' },
        { name: 'Laptops', icon: ComputerDesktopIcon, color: '#8b5cf6' },
        { name: 'Accessories', icon: SparklesIcon, color: '#f59e0b' },
        { name: 'Audio', icon: ShoppingBagIcon, color: '#ef4444' }
      ]
    } else if (business.businessType === 'Fashion & Clothing') {
      return [
        { name: 'Men\'s Wear', icon: UserIcon, color: '#1f2937' },
        { name: 'Women\'s Wear', icon: HeartIcon, color: '#ec4899' },
        { name: 'Shoes', icon: SparklesIcon, color: '#8b5cf6' },
        { name: 'Accessories', icon: ShoppingBagIcon, color: '#f59e0b' }
      ]
    } else {
      return [
        { name: 'Groceries', icon: ShoppingCartIcon, color: '#10b981' },
        { name: 'Household', icon: HomeIcon, color: '#3b82f6' },
        { name: 'Beverages', icon: SparklesIcon, color: '#f59e0b' },
        { name: 'Personal Care', icon: HeartIcon, color: '#ec4899' }
      ]
    }
  }

  const categories = getCategoriesWithIcons()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t.shopByCategory}</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t.exploreCategories}
        </p>
      </div>
      
      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Link
              key={category.name}
              href={`/store/${business.slug}/products?category=${category.name}`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center border border-gray-100 hover:-translate-y-2"
            >
              <div 
                className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
                style={{ backgroundColor: category.color }}
              >
                <Icon className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Explore collection
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
} 