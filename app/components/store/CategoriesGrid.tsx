'use client'

import Link from 'next/link'
import { useBusiness } from '../../contexts/BusinessContext'
import { useLanguage } from '../../contexts/LanguageContext'

export default function CategoriesGrid() {
  const { business } = useBusiness()
  const { language } = useLanguage()

  if (!business) return null

  const translations = {
    en: {
      shopByCategory: 'Shop by Category'
    },
    sw: {
      shopByCategory: 'Nunua kwa Aina'
    }
  }

  const t = translations[language]

  // Sample categories based on business type
  const categories = business.businessType === 'Electronics' 
    ? ['Smartphones', 'Laptops', 'Accessories', 'Audio']
    : business.businessType === 'Fashion & Clothing'
    ? ['Men\'s Wear', 'Women\'s Wear', 'Shoes', 'Accessories']
    : ['Groceries', 'Household', 'Beverages', 'Personal Care']

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{t.shopByCategory}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/store/${business.slug}/products?category=${category}`}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: business.primaryColor }}
              >
                {category.charAt(0)}
              </div>
              <h3 className="font-semibold text-gray-900">{category}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 