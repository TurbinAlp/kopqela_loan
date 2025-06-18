'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useCustomerBusiness } from '../../../../hooks/useCustomerBusiness'
import { useLanguage } from '../../../../contexts/LanguageContext'
import { useProduct } from '../../../../hooks/useProducts'
import { useCart } from '../../../../hooks/useCart'
import {
  ChevronLeftIcon,
  ShoppingCartIcon,
  CheckIcon,
  XMarkIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, ChevronLeftIcon as ChevronLeftSolid, ChevronRightIcon } from '@heroicons/react/24/solid'

export default function ProductDetailsPage() {
  const { language } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const productId = parseInt(params?.id as string)
  const slug = params?.slug as string
  const { business, isLoading: businessLoading } = useCustomerBusiness(slug)
  const { product, loading: productLoading, error } = useProduct(slug, productId)
  const { addToCart: addToCartHook } = useCart(slug)
  
  const [quantity, setQuantity] = useState(1)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showImageZoom, setShowImageZoom] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showCartSuccess, setShowCartSuccess] = useState(false)

  const translations = {
    en: {
      backToCatalog: 'Back to Products',
      productNotFound: 'Product Not Found',
      loading: 'Loading...',
      error: 'Something went wrong',
      price: 'Price',
      wholesalePrice: 'Wholesale Price',
      quantity: 'Quantity',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      description: 'Description',
      shareProduct: 'Share',
      addToWishlist: 'Add to Wishlist',
      removeFromWishlist: 'Remove from Wishlist',
      category: 'Category',
      sku: 'SKU',
      barcode: 'Barcode',
      availability: 'Availability',
      unit: 'Unit',
      stockLevel: 'Stock Level',
      lowStock: 'Low Stock',
      saveAmount: 'Save',
      location: 'Location',
      viewImage: 'View Image',
      closeImage: 'Close Image',
      previousImage: 'Previous Image',
      nextImage: 'Next Image',
      addedToCart: 'Added to Cart!',
      viewCart: 'View Cart',
      continueShopping: 'Continue Shopping',
      goToCart: 'Go to Cart'
    },
    sw: {
      backToCatalog: 'Rudi kwenye Bidhaa',
      productNotFound: 'Bidhaa Haikupatikana',
      loading: 'Inapakia...',
      error: 'Kuna hitilafu imetokea',
      price: 'Bei',
      wholesalePrice: 'Bei ya Jumla',
      quantity: 'Kiasi',
      addToCart: 'Ongeza kwenye Kikapu',
      buyNow: 'Nunua Sasa',
      outOfStock: 'Haitapatikani',
      inStock: 'Inapatikana',
      description: 'Maelezo',
      shareProduct: 'Shiriki',
      addToWishlist: 'Ongeza kwenye Orodha ya Matakwa',
      removeFromWishlist: 'Ondoa kwenye Orodha ya Matakwa',
      category: 'Kategoria',
      sku: 'Nambari ya Bidhaa',
      barcode: 'Kodi ya Msimbo',
      availability: 'Upatikanaji',
      unit: 'Kipimo',
      stockLevel: 'Kiwango cha Hifadhi',
      lowStock: 'Hifadhi Ndogo',
      saveAmount: 'Okoa',
      location: 'Mahali',
      viewImage: 'Angalia Picha',
      closeImage: 'Funga Picha',
      previousImage: 'Picha ya Awali',
      nextImage: 'Picha ya Baadaye',
      addedToCart: 'Imeongezwa kwenye Kikapu!',
      viewCart: 'Angalia Kikapu',
      continueShopping: 'Endelea Kununua',
      goToCart: 'Enda Kikieni'
    }
  }

  const t = translations[language]

  // Loading state
  if (businessLoading || productLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.error}</h2>
          <Link 
            href={`/store/${slug}/products`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t.backToCatalog}
          </Link>
        </div>
      </div>
    )
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.productNotFound}</h2>
          <Link 
            href={`/store/${slug}/products`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t.backToCatalog}
          </Link>
        </div>
      </div>
    )
  }

  const primaryColor = business?.businessSetting?.primaryColor || '#2563eb'
  const productName = (language === 'sw' && product.nameSwahili) ? product.nameSwahili : product.name
  const productDescription = product.description || ''
  
  // Handle product images
  const productImages = product.images && product.images.length > 0 
    ? product.images.sort((a, b) => a.sortOrder - b.sortOrder)
    : (product.imageUrl ? [{ id: 0, url: product.imageUrl, isPrimary: true, sortOrder: 0 }] : [])
  
  const currentImage = productImages[selectedImageIndex]
  
  // Calculate inventory status
  const inventory = product.inventory
  const stockQuantity = inventory?.quantity || 0
  const isInStock = stockQuantity > 0
  const isLowStock = inventory?.reorderPoint && stockQuantity <= inventory.reorderPoint

  // Cart management functions
  const addToCart = () => {
    if (!product || !business) return 0
    
    const cartItem = {
      productId: product.id,
      name: product.name,
      nameSwahili: product.nameSwahili || product.name,
      quantity: quantity,
      price: product.wholesalePrice && product.wholesalePrice < product.price 
        ? product.wholesalePrice 
        : product.price,
      image: productImages.length > 0 ? productImages[0].url : undefined,
      category: product.category?.name,
      unit: product.unit
    }

    return addToCartHook(cartItem)
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Add to cart
    addToCart()
    
    // Force cart update event for real-time badge update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    }
    
    setIsAddingToCart(false)
    setShowCartSuccess(true)
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowCartSuccess(false)
    }, 3000)
  }

  const handleBuyNow = () => {
    if (!product || !business) return
    
    // Add to cart first
    addToCart()
    
    // Force cart update event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    }
    
    // Redirect to cart page first
    router.push(`/store/${slug}/cart`)
  }

  // Image navigation functions with animation
  const goToPreviousImage = () => {
    if (productImages.length > 1 && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setSelectedImageIndex((prev) => 
          prev === 0 ? productImages.length - 1 : prev - 1
        )
        setIsTransitioning(false)
      }, 150)
    }
  }

  const goToNextImage = () => {
    if (productImages.length > 1 && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setSelectedImageIndex((prev) => 
          prev === productImages.length - 1 ? 0 : prev + 1
        )
        setIsTransitioning(false)
      }, 150)
    }
  }

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0) // Reset touch end
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && productImages.length > 1) {
      goToNextImage()
    }
    if (isRightSwipe && productImages.length > 1) {
      goToPreviousImage()
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPreviousImage()
    } else if (e.key === 'ArrowRight') {
      goToNextImage()
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const calculateSavings = () => {
    if (product.wholesalePrice && product.price > product.wholesalePrice) {
      const savings = product.price - product.wholesalePrice
      const percentage = Math.round((savings / product.price) * 100)
      return { amount: savings, percentage }
    }
    return null
  }

  const savings = calculateSavings()

  return (
    <div className="min-h-screen bg-white">
      {/* Cart Success Notification */}
      {showCartSuccess && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform animate-pulse">
          <div className="flex items-center space-x-2">
            <CheckIcon className="h-5 w-5" />
            <span className="font-medium">{t.addedToCart}</span>
          </div>
          <div className="mt-2 flex space-x-2">
            <Link
              href={`/store/${slug}/cart`}
              className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded transition-colors"
            >
              {t.goToCart}
            </Link>
            <button
              onClick={() => setShowCartSuccess(false)}
              className="text-xs bg-green-400 hover:bg-green-500 px-2 py-1 rounded transition-colors"
            >
              {t.continueShopping}
            </button>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {showImageZoom && currentImage && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4 transition-opacity duration-300"
          onClick={() => setShowImageZoom(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageZoom(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 transition-colors duration-200"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
            
            {/* Navigation arrows in zoom modal */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPreviousImage()
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeftSolid className="h-12 w-12" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNextImage()
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 transition-all duration-200 hover:scale-110"
                >
                  <ChevronRightIcon className="h-12 w-12" />
                </button>
              </>
            )}
            
            <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              <Image
                src={currentImage.url}
                alt={productName}
                width={800}
                height={800}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Header with back navigation */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link 
            href={`/store/${slug}/products`}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            <span className="font-medium">{t.backToCatalog}</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsFavorited(!isFavorited)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isFavorited ? (
                <HeartIconSolid className="h-6 w-6 text-red-500" />
              ) : (
                <HeartIcon className="h-6 w-6 text-gray-600" />
              )}
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ShareIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Product Images Gallery */}
          <div className="mb-8 lg:mb-0">
            {/* Main Image with Navigation */}
            <div 
              className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm mb-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onKeyDown={handleKeyDown}
              tabIndex={0}
            >
              {currentImage ? (
                <div className="relative w-full h-full">
                  <div className={`w-full h-full transition-all duration-500 ease-in-out ${
                    isTransitioning 
                      ? 'opacity-0 transform scale-105' 
                      : 'opacity-100 transform scale-100'
                  }`}>
                    <Image 
                      src={currentImage.url} 
                      alt={productName}
                      width={600}
                      height={600}
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                      priority
                      onClick={() => setShowImageZoom(true)}
                    />
                  </div>
                  
                  {/* Navigation Arrows for Desktop */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={goToPreviousImage}
                        disabled={isTransitioning}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 hidden md:flex items-center justify-center hover:scale-110 disabled:opacity-50 disabled:scale-100"
                        aria-label={t.previousImage}
                      >
                        <ChevronLeftSolid className="h-6 w-6" />
                      </button>
                      <button
                        onClick={goToNextImage}
                        disabled={isTransitioning}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 hidden md:flex items-center justify-center hover:scale-110 disabled:opacity-50 disabled:scale-100"
                        aria-label={t.nextImage}
                      >
                        <ChevronRightIcon className="h-6 w-6" />
                      </button>
                    </>
                  )}

                  {/* Image Counter and Swipe Hint */}
                  {productImages.length > 1 && (
                    <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2 transition-all duration-300 ${
                      isTransitioning ? 'opacity-50' : 'opacity-100'
                    }`}>
                      <span className="transition-all duration-300">{selectedImageIndex + 1} / {productImages.length}</span>
                      <span className="hidden md:inline">•</span>
                      <span className="text-xs text-gray-300 md:hidden">Swipe to navigate</span>
                      <span className="text-xs text-gray-300 hidden md:inline">Use arrows or click thumbnails</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-2">📦</div>
                    <p>No image available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => {
                      if (!isTransitioning) {
                        setIsTransitioning(true)
                        setTimeout(() => {
                          setSelectedImageIndex(index)
                          setIsTransitioning(false)
                        }, 150)
                      }
                    }}
                    disabled={isTransitioning}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 disabled:scale-100 ${
                      selectedImageIndex === index 
                        ? 'border-blue-500 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${productName} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover transition-transform duration-200"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="lg:pt-4">
            {/* Product Name and Category */}
            <div className="mb-6">
              {product.category && (
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  {product.category.name}
                </p>
              )}
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
                {productName}
              </h1>
              
              {/* Stock Status */}
              <div className="flex items-center mb-4">
                {isInStock ? (
                  <div className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-600 font-medium">
                      {isLowStock ? t.lowStock : t.inStock}
                    </span>
                    <span className="text-gray-500 ml-2">
                      ({stockQuantity} {t.stockLevel.toLowerCase()})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-600 font-medium">{t.outOfStock}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-baseline flex-wrap gap-2">
                {/* Show wholesale price if available and different from regular price */}
                {product.wholesalePrice && product.wholesalePrice < product.price ? (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-3xl font-bold text-red-600">
                      {formatPrice(product.wholesalePrice)}
                    </span>
                    {savings && (
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
                        {t.saveAmount} {savings.percentage}%
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                )}
                
                {product.unit && (
                  <span className="text-gray-500 text-lg">per {product.unit}</span>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700 mr-3">
                    {t.quantity}:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 text-gray-600"
                      disabled={!isInStock}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 min-w-[3rem] text-center text-gray-700">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                      className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 text-gray-600"
                      disabled={!isInStock || quantity >= stockQuantity}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock || isAddingToCart}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                  style={{ backgroundColor: isInStock ? primaryColor : undefined }}
                >
                  {isAddingToCart ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ShoppingCartIcon className="h-5 w-5 mr-2" />
                      {isInStock ? t.addToCart : t.outOfStock}
                    </>
                  )}
                </button>
                
                {isInStock && (
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
                  >
                    {t.buyNow}
                  </button>
                )}
              </div>
            </div>

            {/* Product Description */}
            {productDescription && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t.description}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {productDescription}
                </p>
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-4">
              {product.sku && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.sku}:</span>
                  <span className="font-medium text-gray-900">{product.sku}</span>
                </div>
              )}
              
              {product.barcode && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.barcode}:</span>
                  <span className="font-medium text-gray-900">{product.barcode}</span>
                </div>
              )}
              
              {product.category && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.category}:</span>
                  <span className="font-medium text-gray-900">{product.category.name}</span>
                </div>
              )}
              
              {product.unit && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.unit}:</span>
                  <span className="font-medium text-gray-900">{product.unit}</span>
                </div>
              )}

              {inventory?.location && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.location}:</span>
                  <span className="font-medium text-gray-900">{inventory.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}