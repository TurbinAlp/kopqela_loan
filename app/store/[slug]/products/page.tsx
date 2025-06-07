'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useBusiness } from '../../../contexts/BusinessContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface Product {
  id: number
  name: string
  nameSwahili: string
  description: string
  descriptionSwahili: string
  category: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviewCount: number
  inStock: boolean
  stockCount: number
  isWholesale: boolean
  isRetail: boolean
  tags: string[]
}

export default function ProductCatalogPage() {
  const { business } = useBusiness()
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || 'all')
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [sortBy, setSortBy] = useState('popular')
  const [productType, setProductType] = useState('all')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

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
      next: 'Next'
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
      next: 'Ifuatayo'
    }
  }

  const t = translations[language]

  // Generate sample products based on business type
  const products: Product[] = useMemo(() => {
    if (!business) return []
    
    if (business.businessType === 'Electronics') {
      return [
        {
          id: 1, name: 'iPhone 15 Pro', nameSwahili: 'iPhone 15 Pro', 
          description: 'Latest iPhone with advanced camera', descriptionSwahili: 'iPhone mpya na kamera bora',
          category: 'Smartphones', price: 1200000, originalPrice: 1350000, image: '/images/products/iphone.jpg',
          rating: 4.8, reviewCount: 124, inStock: true, stockCount: 15, isWholesale: false, isRetail: true,
          tags: ['premium', 'new', 'apple']
        },
        {
          id: 2, name: 'Samsung Galaxy S24', nameSwahili: 'Samsung Galaxy S24',
          description: 'Powerful Android smartphone', descriptionSwahili: 'Simu ya Android yenye nguvu',
          category: 'Smartphones', price: 950000, image: '/images/products/samsung.jpg',
          rating: 4.6, reviewCount: 89, inStock: true, stockCount: 8, isWholesale: true, isRetail: true,
          tags: ['android', 'samsung']
        },
        {
          id: 3, name: 'MacBook Air M3', nameSwahili: 'MacBook Air M3',
          description: 'Ultra-light laptop for professionals', descriptionSwahili: 'Laptop nyepesi kwa wafanyakazi',
          category: 'Laptops', price: 1800000, image: '/images/products/macbook.jpg',
          rating: 4.9, reviewCount: 67, inStock: false, stockCount: 0, isWholesale: false, isRetail: true,
          tags: ['apple', 'professional']
        },
        {
          id: 4, name: 'AirPods Pro', nameSwahili: 'AirPods Pro',
          description: 'Wireless earbuds with noise canceling', descriptionSwahili: 'Vipute bila waya na kuzuia kelele',
          category: 'Audio', price: 280000, image: '/images/products/airpods.jpg',
          rating: 4.7, reviewCount: 156, inStock: true, stockCount: 25, isWholesale: false, isRetail: true,
          tags: ['apple', 'wireless']
        }
      ]
    } else if (business.businessType === 'Fashion & Clothing') {
      return [
        {
          id: 1, name: 'Elegant Dress', nameSwahili: 'Nguo ya Kifahari',
          description: 'Beautiful dress for special occasions', descriptionSwahili: 'Nguo nzuri kwa matukio maalum',
          category: "Women's Wear", price: 65000, originalPrice: 75000, image: '/images/products/dress.jpg',
          rating: 4.6, reviewCount: 34, inStock: true, stockCount: 12, isWholesale: false, isRetail: true,
          tags: ['elegant', 'party']
        },
        {
          id: 2, name: 'Casual T-Shirt', nameSwahili: 'Shati la Kawaida',
          description: 'Comfortable cotton t-shirt', descriptionSwahili: 'Shati la pambajenye utulivu',
          category: "Men's Wear", price: 18000, image: '/images/products/tshirt.jpg',
          rating: 4.4, reviewCount: 67, inStock: true, stockCount: 45, isWholesale: true, isRetail: true,
          tags: ['casual', 'cotton']
        },
        {
          id: 3, name: 'Designer Shoes', nameSwahili: 'Viatu vya Kisanifu',
          description: 'Stylish leather shoes', descriptionSwahili: 'Viatu vya ngozi vya kisanifu',
          category: 'Shoes', price: 85000, image: '/images/products/shoes.jpg',
          rating: 4.8, reviewCount: 23, inStock: false, stockCount: 0, isWholesale: false, isRetail: true,
          tags: ['leather', 'formal']
        }
      ]
    } else {
      return [
        {
          id: 1, name: 'Rice 5kg', nameSwahili: 'Mchele Kilo 5',
          description: 'Premium quality rice', descriptionSwahili: 'Mchele wa ubora wa juu',
          category: 'Groceries', price: 12000, image: '/images/products/rice.jpg',
          rating: 4.3, reviewCount: 145, inStock: true, stockCount: 50, isWholesale: true, isRetail: true,
          tags: ['staple', 'quality']
        },
        {
          id: 2, name: 'Cooking Oil 2L', nameSwahili: 'Mafuta ya Kupikia Lita 2',
          description: 'Pure vegetable cooking oil', descriptionSwahili: 'Mafuta safi ya mboga ya kupikia',
          category: 'Groceries', price: 8500, originalPrice: 9500, image: '/images/products/oil.jpg',
          rating: 4.2, reviewCount: 78, inStock: true, stockCount: 35, isWholesale: true, isRetail: true,
          tags: ['cooking', 'pure']
        },
        {
          id: 3, name: 'Sugar 2kg', nameSwahili: 'Sukari Kilo 2',
          description: 'Refined white sugar', descriptionSwahili: 'Sukari nyeupe iliyosafishwa',
          category: 'Groceries', price: 6000, image: '/images/products/sugar.jpg',
          rating: 4.1, reviewCount: 92, inStock: false, stockCount: 0, isWholesale: true, isRetail: true,
          tags: ['sweet', 'baking']
        }
      ]
    }
  }, [business])

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products])

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const name = language === 'sw' ? product.nameSwahili : product.name
      const description = language === 'sw' ? product.descriptionSwahili : product.description
      
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesType = productType === 'all' || 
                         (productType === 'wholesale' && product.isWholesale) ||
                         (productType === 'retail' && product.isRetail)
      const matchesStock = !inStockOnly || product.inStock

      return matchesSearch && matchesCategory && matchesPrice && matchesType && matchesStock
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priceLowToHigh':
          return a.price - b.price
        case 'priceHighToLow':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'newest':
          return b.id - a.id
        default:
          return b.reviewCount - a.reviewCount
      }
    })

    return filtered
  }, [products, searchQuery, selectedCategory, priceRange, productType, inStockOnly, sortBy, language])

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
    setProductType('all')
    setInStockOnly(false)
    setSortBy('popular')
    setCurrentPage(1)
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we load the store information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.productCatalog}</h1>
              <p className="text-gray-600">
                {filteredAndSortedProducts.length} {t.productsFound}
              </p>
            </div>

            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal"
              >
                <option value="popular">{t.popular}</option>
                <option value="priceLowToHigh">{t.priceLowToHigh}</option>
                <option value="priceHighToLow">{t.priceHighToLow}</option>
                <option value="rating">{t.rating}</option>
                <option value="newest">{t.newest}</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FunnelIcon className="w-5 h-5 mr-2" />
                {t.filters}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t.filters}</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  {t.clearFilters}
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.category}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal"
                >
                  <option value="all">{t.allCategories}</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.priceRange}
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      placeholder={t.from}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000000])}
                      placeholder={t.to}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-600 font-normal placeholder:text-gray-500 placeholder:font-normal"
                    />
                  </div>
                </div>
              </div>

              {/* Product Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.productType}
                </label>
                <div className="space-y-2">
                  {['all', 'wholesale', 'retail'].map((type) => (
                    <label key={type} className="flex items-center text-gray-600">
                      <input
                        type="radio"
                        name="productType"
                        value={type}
                        checked={productType === type}
                        onChange={(e) => setProductType(e.target.value)}
                        className="mr-2 text-teal-600 focus:ring-teal-500"
                      />
                      {type === 'all' ? t.allTypes : type === 'wholesale' ? t.wholesale : t.retail}
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.availability}
                </label>
                <label className="flex items-center text-gray-600">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="mr-2 text-teal-600 focus:ring-teal-500"
                  />
                  {t.inStockOnly}
                </label>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-12">
                <AdjustmentsHorizontalIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noProductsFound}</h3>
                <p className="text-gray-600">{t.noProductsDesc}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedProducts.map((product) => {
                    const name = language === 'sw' ? product.nameSwahili : product.name
                    const description = language === 'sw' ? product.descriptionSwahili : product.description
                    
                    return (
                      <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-w-4 aspect-h-3 bg-gray-200 relative">
                          <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">Product Image</span>
                          </div>
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white font-semibold">{t.outOfStock}</span>
                            </div>
                          )}
                          {product.originalPrice && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{description}</p>

                          {/* Rating */}
                          <div className="flex items-center mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <StarIconSolid
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              ({product.reviewCount} {t.reviews})
                            </span>
                          </div>

                          {/* Price */}
                          <div className="mb-4">
                            <div className="flex items-center space-x-2">
                              <span 
                                className="text-xl font-bold"
                                style={{ color: business.primaryColor }}
                              >
                                {formatPrice(product.price)}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                              {product.inStock ? `${t.inStock} (${product.stockCount})` : t.outOfStock}
                            </p>
                          </div>

                          {/* Product Types */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {product.isWholesale && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {t.wholesale}
                              </span>
                            )}
                            {product.isRetail && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                {t.retail}
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/store/${business.slug}/products/${product.id}`}
                            className={`block w-full text-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                              product.inStock
                                ? 'text-white hover:opacity-90'
                                : 'text-gray-500 bg-gray-200 cursor-not-allowed'
                            }`}
                            style={{
                              backgroundColor: product.inStock ? business.primaryColor : undefined
                            }}
                          >
                            {product.inStock ? t.viewDetails : t.outOfStock}
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t.previous}
                      </button>
                      
                      <span className="px-4 py-2 text-sm text-gray-700">
                        {t.page} {currentPage} {t.of} {totalPages}
                      </span>
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t.next}
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}