'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCustomerBusiness } from '../../hooks/useCustomerBusiness'
import { useLanguage } from '../../contexts/LanguageContext'
import { useProducts } from '../../hooks/useProducts'
import { ShoppingCartIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'

export default function FeaturedProducts() {
  const params = useParams()
  const slug = params.slug as string
  const { business, isLoading: businessLoading } = useCustomerBusiness(slug)
  const { language } = useLanguage()

  // Fetch featured products (limit to 3, newest first) - only when business is loaded
  console.log('FeaturedProducts: business slug:', business?.slug, 'URL slug:', slug)
  
  const { products, loading, error } = useProducts(
    slug, // Use URL slug directly since it matches the API endpoint
    {
      active: true,
      sort: 'created',
      order: 'desc',
      limit: 3,
      lang: language as 'en' | 'sw'
    }
  )

  if (businessLoading || !business) return null

  // console.log('FeaturedProducts: loading:', loading, 'error:', error, 'products:', products?.length)

  const translations = {
    en: {
      featuredProducts: 'Featured Products',
      viewAll: 'View All Products',
      addToCart: 'Add to Cart',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      loading: 'Loading products...',
      noProducts: 'No products available'
    },
    sw: {
      featuredProducts: 'Bidhaa Maalum',
      viewAll: 'Angalia Bidhaa Zote',
      addToCart: 'Ongeza Kariooni',
      inStock: 'Ipo Stock',
      outOfStock: 'Imekwisha',
      loading: 'Inapakia bidhaa...',
      noProducts: 'Hakuna bidhaa zinazopatikana'
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
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t.featuredProducts}</h2>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">{t.loading}</span>
            <div className="ml-3 text-xs text-gray-400">
              Debug: slug={slug}, business={business?.name}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !products || products.length === 0) {
    return (
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t.featuredProducts}</h2>
            <Link
              href={`/store/${business.slug}/products`}
              className="text-lg font-semibold hover:underline text-teal-600"
            >
              {t.viewAll} →
            </Link>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600">{t.noProducts}</p>
            <div className="mt-4 text-xs text-gray-400">
              Debug: error={error}, products={products?.length}, loading={loading}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{t.featuredProducts}</h2>
          <Link
            href={`/store/${business.slug}/products`}
            className="text-lg font-semibold hover:underline text-teal-600"
          >
            {t.viewAll} →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.slice(0, 3).map((product) => (
            <Link
              key={product.id}
              href={`/store/${business.slug}/products/${product.id}`}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="aspect-w-4 aspect-h-3 bg-gray-200">
                <Image
                  src="/globe.svg"
                  alt={product.name}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E"
                  }}
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                {product.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {product.category && (
                  <p className="text-xs text-blue-600 mb-3">
                    {product.category.name}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-teal-600">
                      {formatPrice(product.price)}
                    </p>
                    {product.wholesalePrice && product.wholesalePrice !== product.price && (
                      <p className="text-sm text-gray-500">
                        Wholesale: {formatPrice(product.wholesalePrice)}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      product.inventory?.inStock ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.inventory?.inStock ? t.inStock : t.outOfStock}
                    </p>
                    {product.inventory?.quantity && (
                      <p className="text-xs text-gray-500">
                        Qty: {product.inventory.quantity}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md transition-colors hover:bg-teal-700">
                    <ShoppingCartIcon className="w-4 h-4 mr-1" />
                    {t.addToCart}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 