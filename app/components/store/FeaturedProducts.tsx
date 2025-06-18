'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCustomerBusiness } from '../../hooks/useCustomerBusiness'
import { useLanguage } from '../../contexts/LanguageContext'
import { useProducts } from '../../hooks/useProducts'
import { EyeIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'

export default function FeaturedProducts() {
  const params = useParams()
  const slug = params.slug as string
  const { business, isLoading: businessLoading } = useCustomerBusiness(slug)
  const { language } = useLanguage()

  // Fetch featured products (limit to 4, newest first) - only when business is loaded
  const { products, loading, error } = useProducts(
    slug, // Use URL slug directly since it matches the API endpoint
    {
      active: true,
      sort: 'created',
      order: 'desc',
      limit: 4,
      lang: language as 'en' | 'sw'
    }
  )

  if (businessLoading || !business) return null

  const translations = {
    en: {
      featuredProducts: 'Featured Products',
      viewAllProducts: 'View All Products',
      viewProduct: 'View Product',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      loading: 'Loading products...',
      noProducts: 'No products available yet',
      newArrivals: 'New Arrivals'
    },
    sw: {
      featuredProducts: 'Bidhaa Maalum',
      viewAllProducts: 'Angalia Bidhaa Zote',
      viewProduct: 'Angalia Bidhaa',
      inStock: 'Ipo Stock',
      outOfStock: 'Imekwisha',
      loading: 'Inapakia bidhaa...',
      noProducts: 'Bado hakuna bidhaa',
      newArrivals: 'Bidhaa Mpya'
    }
  }

  const t = translations[language]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.featuredProducts}</h2>
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <span className="ml-3 text-gray-600">{t.loading}</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !products || products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.featuredProducts}</h2>
          <p className="text-gray-600 text-lg mb-8">{t.noProducts}</p>
          <Link
            href={`/store/${business.slug}/products`}
            className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            <EyeIcon className="w-5 h-5 mr-2" />
            {t.viewAllProducts}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t.newArrivals}</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Discover our latest products and best sellers
        </p>
        <Link
          href={`/store/${business.slug}/products`}
          className="inline-flex items-center text-lg font-semibold text-teal-600 hover:text-teal-700 transition-colors group"
        >
          {t.viewAllProducts}
          <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.slice(0, 4).map((product) => {
          // Get product image with priority for primary image
          const primaryImage = product.images?.find(img => img.isPrimary)
          const imageUrl = primaryImage?.url || product.images?.[0]?.url || product.imageUrl || '/images/placeholder-product.svg'
          
          return (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder-product.svg"
                  }}
                />
                
                {/* Stock Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.inventory?.inStock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inventory?.inStock ? t.inStock : t.outOfStock}
                  </span>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                  {product.name}
                </h3>
                
                {product.category && (
                  <p className="text-sm text-teal-600 font-medium mb-3">
                    {product.category.name}
                  </p>
                )}

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </p>
                    {product.wholesalePrice && product.wholesalePrice !== product.price && (
                      <p className="text-sm text-gray-500">
                        Wholesale: {formatPrice(product.wholesalePrice)}
                      </p>
                    )}
                  </div>
                </div>

                {/* View Product Button */}
                <Link
                  href={`/store/${business.slug}/products/${product.id}`}
                  className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-teal-600 rounded-xl transition-all hover:bg-teal-700 hover:shadow-lg group/btn"
                >
                  <EyeIcon className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                  {t.viewProduct}
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 