'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useParams } from 'next/navigation'
import { useCustomerBusiness } from '../../../hooks/useCustomerBusiness'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useProducts } from '../../../hooks/useProducts'
import Image from 'next/image'
import {
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

export default function ProductCatalogPage() {
  const params = useParams()
  const slug = params.slug as string
  const { business, isLoading: businessLoading } = useCustomerBusiness(slug)
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || 'all')
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [sortBy, setSortBy] = useState('created')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // API filters based on UI state
  const apiFilters = useMemo(() => ({
    q: searchQuery || undefined,
    category: selectedCategory !== 'all' ? parseInt(selectedCategory) : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 1000000 ? priceRange[1] : undefined,
    inStock: inStockOnly || undefined,
    active: true,
    sort: sortBy === 'popular' ? 'created' : sortBy as 'name' | 'price' | 'created' | 'updated',
    order: sortBy === 'priceLowToHigh' ? 'asc' : 'desc' as 'asc' | 'desc',
    page: currentPage,
    limit: itemsPerPage,
    lang: language as 'en' | 'sw'
  }), [searchQuery, selectedCategory, priceRange, sortBy, inStockOnly, currentPage, itemsPerPage, language])

  // Fetch products using API
  const { products, pagination, loading, error } = useProducts(
    business?.slug || '', 
    apiFilters
  )

  const translations = {
    en: {
      productCatalog: 'Product Catalog',
      searchPlaceholder: 'Search products...',
      filters: 'Filters',
      clearFilters: 'Clear All',
      category: 'Category',
      allCategories: 'All Categories',
      priceRange: 'Price Range',
      productType: 'Product Type',
      allTypes: 'All Types',
      wholesale: 'Wholesale',
      retail: 'Retail',
      availability: 'Availability',
      inStockOnly: 'In Stock Only',
      sortBy: 'Sort By',
      popular: 'Most Popular',
      priceLowToHigh: 'Price: Low to High',
      priceHighToLow: 'Price: High to Low',
      newest: 'Newest First',
      rating: 'Highest Rated',
      productsFound: 'products found',
      noProductsFound: 'No products found',
      noProductsDesc: 'Try adjusting your search or filters',
      addToCart: 'Add to Cart',
      viewDetails: 'View Details',
      orderNow: 'Order Now',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      reviews: 'reviews',
      from: 'from',
      to: 'to',
      page: 'Page',
      of: 'of',
      previous: 'Previous',
      next: 'Next',
      loading: 'Loading products...',
      error: 'Error loading products'
    },
    sw: {
      productCatalog: 'Bidhaa Mbalimbali',
      searchPlaceholder: 'Tafuta bidhaa...',
      filters: 'Vichujio',
      clearFilters: 'Futa Vyote',
      category: 'Aina',
      allCategories: 'Aina Zote',
      priceRange: 'Bei',
      productType: 'Aina ya Bidhaa',
      allTypes: 'Aina Zote',
      wholesale: 'Jumla',
      retail: 'Reja Reja',
      availability: 'Upatikanaji',
      inStockOnly: 'Zilizo Stock Tu',
      sortBy: 'Panga Kwa',
      popular: 'Maarufu Zaidi',
      priceLowToHigh: 'Bei: Chini Kwanza',
      priceHighToLow: 'Bei: Juu Kwanza',
      newest: 'Mpya Kwanza',
      rating: 'Bora Zaidi',
      productsFound: 'bidhaa zimepatikana',
      noProductsFound: 'Hakuna bidhaa zilizopatikana',
      noProductsDesc: 'Jaribu kubadilisha utafutaji au vichujio',
      addToCart: 'Ongeza Kirooni',
      viewDetails: 'Ona Maelezo',
      orderNow: 'Oda Sasa',
      outOfStock: 'Imekwisha',
      inStock: 'Ipo Stock',
      reviews: 'maoni',
      from: 'kutoka',
      to: 'hadi',
      page: 'Ukurasa',
      of: 'wa',
      previous: 'Uliopita',
      next: 'Ifuatayo',
      loading: 'Inapakia bidhaa...',
      error: 'Hitilafu ya kupakia bidhaa'
    }
  }

  const t = translations[language]

  // Extract categories from products (now from API)
  const categories = useMemo(() => {
    if (!products) return []
    return Array.from(new Set(products.map(p => p.category?.name).filter(Boolean)))
  }, [products])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setPriceRange([0, 1000000])
    setSortBy('created')
    setInStockOnly(false)
    setCurrentPage(1)
  }

  if (businessLoading || !business) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.productCatalog}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">{t.filters}</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {t.clearFilters}
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.category}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                >
                  <option value="all">{t.allCategories}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.priceRange}
                </label>
                <div className="space-y-2">
                    <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="1000"
                      value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full text-gray-700"
                    />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="text-gray-700">{formatPrice(0)}</span>
                    <span className="text-gray-700">{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.availability}
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">{t.inStockOnly}</span>
                </label>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.sortBy}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                >
                  <option value="created">{t.newest}</option>
                  <option value="name">{t.popular}</option>
                  <option value="priceLowToHigh">{t.priceLowToHigh}</option>
                  <option value="priceHighToLow">{t.priceHighToLow}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">
                {loading ? t.loading : `${pagination.totalCount} ${t.productsFound}`}
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center text-sm text-gray-600"
              >
                <FunnelIcon className="w-4 h-4 mr-1" />
                {t.filters}
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{t.error}</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                          </div>
                            </div>
                          )}

            {/* Products Grid */}
            {!loading && !error && products && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/store/${business.slug}/products/${product.id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <div className="aspect-w-4 aspect-h-3 bg-gray-200">
                      <Image
                        src={
                          // Use primary image if available
                          product.images?.find(img => img.isPrimary)?.url ||
                          // Otherwise use first image
                          product.images?.[0]?.url ||
                          // Fallback to legacy imageUrl field if exists
                          product.imageUrl ||
                          // Final fallback to placeholder
                          "/images/placeholder-product.svg"
                        }
                        alt={product.name}
                        width={200}
                        height={200}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/images/placeholder-product.svg"
                        }}
                      />
                    </div>

                        <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {product.category && (
                        <p className="text-xs text-blue-600 mb-2">
                          {product.category.name}
                        </p>
                      )}

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xl font-bold" style={{ color: '#14b8a6' }}>
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
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && (!products || products.length === 0) && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noProductsFound}</h3>
                <p className="text-gray-600">{t.noProductsDesc}</p>
              </div>
            )}

                {/* Pagination */}
            {!loading && !error && products && products.length > 0 && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                      <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t.previous}
                      </button>
                      
                      <span className="px-4 py-2 text-sm text-gray-700">
                  {t.page} {pagination.page} {t.of} {pagination.totalPages}
                      </span>
                      
                      <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t.next}
                      </button>
                  </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}