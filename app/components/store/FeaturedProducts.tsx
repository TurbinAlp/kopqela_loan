'use client'

import Link from 'next/link'
import { useBusiness } from '../../contexts/BusinessContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid'

export default function FeaturedProducts() {
  const { business } = useBusiness()
  const { language } = useLanguage()

  if (!business) return null

  const translations = {
    en: {
      featuredProducts: 'Featured Products',
      viewAll: 'View All Products',
      addToCart: 'Add to Cart',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock'
    },
    sw: {
      featuredProducts: 'Bidhaa Maalum',
      viewAll: 'Angalia Bidhaa Zote',
      addToCart: 'Ongeza Kariooni',
      inStock: 'Ipo Stock',
      outOfStock: 'Imekwisha'
    }
  }

  const t = translations[language]

  // Sample products based on business type
  const sampleProducts = [
    {
      id: 1,
      name: business.businessType === 'Electronics' ? 'Smartphone' : business.businessType === 'Fashion & Clothing' ? 'T-Shirt' : 'Rice 5kg',
      price: business.businessType === 'Electronics' ? 450000 : business.businessType === 'Fashion & Clothing' ? 25000 : 8000,
      image: '/images/product-placeholder.jpg',
      rating: 4.5,
      inStock: true
    },
    {
      id: 2,
      name: business.businessType === 'Electronics' ? 'Laptop' : business.businessType === 'Fashion & Clothing' ? 'Dress' : 'Cooking Oil 2L',
      price: business.businessType === 'Electronics' ? 800000 : business.businessType === 'Fashion & Clothing' ? 45000 : 12000,
      image: '/images/product-placeholder.jpg',
      rating: 4.8,
      inStock: true
    },
    {
      id: 3,
      name: business.businessType === 'Electronics' ? 'Headphones' : business.businessType === 'Fashion & Clothing' ? 'Shoes' : 'Sugar 2kg',
      price: business.businessType === 'Electronics' ? 85000 : business.businessType === 'Fashion & Clothing' ? 55000 : 5000,
      image: '/images/product-placeholder.jpg',
      rating: 4.2,
      inStock: false
    }
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{t.featuredProducts}</h2>
          <Link
            href={`/store/${business.slug}/products`}
            className="text-lg font-semibold hover:underline"
            style={{ color: business.primaryColor }}
          >
            {t.viewAll} →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sampleProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-w-4 aspect-h-3 bg-gray-200">
                <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Product Image</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({product.rating})</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: business.primaryColor }}>
                      {formatPrice(product.price)}
                    </p>
                    <p className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.inStock ? t.inStock : t.outOfStock}
                    </p>
                  </div>
                  
                  <Link
                    href={`/store/${business.slug}/products/${product.id}`}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
                    style={{ backgroundColor: business.primaryColor }}
                  >
                    <ShoppingCartIcon className="w-4 h-4 mr-1" />
                    {t.addToCart}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 