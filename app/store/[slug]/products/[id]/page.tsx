'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useBusiness } from '../../../../contexts/BusinessContext'
import { useLanguage } from '../../../../contexts/LanguageContext'
import {
  HeartIcon,
  ShareIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface Product {
  id: number
  name: string
  nameSwahili: string
  description: string
  descriptionSwahili: string
  fullDescription: string
  fullDescriptionSwahili: string
  category: string
  price: number
  originalPrice?: number
  images: string[]
  rating: number
  reviewCount: number
  inStock: boolean
  stockCount: number
  isWholesale: boolean
  isRetail: boolean
  tags: string[]
  specifications: { [key: string]: string }
  specificationsSwahili: { [key: string]: string }
}

interface Review {
  id: number
  customerName: string
  rating: number
  comment: string
  commentSwahili: string
  date: string
  verified: boolean
}

export default function ProductDetailsPage() {
  const { business } = useBusiness()
  const { language } = useLanguage()
  const params = useParams()
  const productId = parseInt(params?.id as string)
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorited, setIsFavorited] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [showImageZoom, setShowImageZoom] = useState(false)

  const translations = {
    en: {
      backToCatalog: 'Back to Products',
      productNotFound: 'Product Not Found',
      productNotFoundDesc: 'The product you are looking for does not exist or has been removed.',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      quantity: 'Quantity',
      addToFavorites: 'Add to Favorites',
      removeFromFavorites: 'Remove from Favorites',
      shareProduct: 'Share Product',
      requestPurchase: 'Request Purchase',
      addToCart: 'Add to Cart',
      wholesaleOnly: 'Wholesale Only',
      retailOnly: 'Retail Only',
      bothTypes: 'Wholesale & Retail',
      youSave: 'You Save',
      description: 'Description',
      specifications: 'Specifications',
      reviews: 'Reviews',
      relatedProducts: 'Related Products',
      customerReviews: 'Customer Reviews',
      writeReview: 'Write a Review',
      verified: 'Verified Purchase',
      unverified: 'Unverified',
      noReviews: 'No Reviews Yet',
      noReviewsDesc: 'Be the first to review this product',
      maxQuantity: 'Maximum quantity available',
      zoomImage: 'Click to zoom image',
      closeZoom: 'Close zoom view'
    },
    sw: {
      backToCatalog: 'Rudi Bidhaa',
      productNotFound: 'Bidhaa Haijapatikana',
      productNotFoundDesc: 'Bidhaa unayotafuta haipo au imeondolewa.',
      inStock: 'Ipo Stock',
      outOfStock: 'Imekwisha',
      quantity: 'Idadi',
      addToFavorites: 'Ongeza Vipendwa',
      removeFromFavorites: 'Ondoa Vipendwa',
      shareProduct: 'Shiriki Bidhaa',
      requestPurchase: 'Omba Ununuzi',
      addToCart: 'Ongeza Kirooni',
      wholesaleOnly: 'Jumla Tu',
      retailOnly: 'Reja Reja Tu',
      bothTypes: 'Jumla na Reja Reja',
      youSave: 'Unaokoa',
      description: 'Maelezo',
      specifications: 'Vipimo',
      reviews: 'Maoni',
      relatedProducts: 'Bidhaa Zinazofanana',
      customerReviews: 'Maoni ya Wateja',
      writeReview: 'Andika Maoni',
      verified: 'Ununuzi Umehakikiwa',
      unverified: 'Haujahakikiwa',
      noReviews: 'Hakuna Maoni Bado',
      noReviewsDesc: 'Kuwa wa kwanza kutoa maoni',
      maxQuantity: 'Idadi ya juu zaidi inayopatikana',
      zoomImage: 'Bofya kukuza picha',
      closeZoom: 'Funga ukuzaji'
    }
  }

  const t = translations[language]

  // Generate sample product data
  const product: Product | null = useMemo(() => {
    if (!business || !productId) return null
    
    if (business.businessType === 'Electronics') {
      const electronicsProducts = [
        {
          id: 1, name: 'iPhone 15 Pro', nameSwahili: 'iPhone 15 Pro',
          description: 'Latest iPhone with advanced camera', descriptionSwahili: 'iPhone mpya na kamera bora',
          fullDescription: 'The iPhone 15 Pro features a titanium design, advanced A17 Pro chip, and professional camera system with 5x optical zoom. Perfect for photography, gaming, and professional work.',
          fullDescriptionSwahili: 'iPhone 15 Pro ina muundo wa titanium, chip ya A17 Pro ya kisasa, na mfumo wa kamera ya kitaalamu wenye kukuza mara 5. Nzuri kwa kupiga picha, mchezo, na kazi za kitaalamu.',
          category: 'Smartphones', price: 1200000, originalPrice: 1350000,
          images: ['/images/products/iphone1.jpg', '/images/products/iphone2.jpg', '/images/products/iphone3.jpg'],
          rating: 4.8, reviewCount: 124, inStock: true, stockCount: 15, isWholesale: false, isRetail: true,
          tags: ['premium', 'new', 'apple'],
          specifications: {
            'Screen Size': '6.1 inches',
            'Storage': '128GB',
            'Camera': '48MP Triple Camera',
            'Battery': '4422 mAh',
            'OS': 'iOS 17',
            'Color': 'Natural Titanium'
          },
          specificationsSwahili: {
            'Ukubwa wa Skrini': 'Inchi 6.1',
            'Hifadhi': '128GB',
            'Kamera': 'Kamera Tatu za 48MP',
            'Betri': '4422 mAh',
            'Mfumo': 'iOS 17',
            'Rangi': 'Titanium Asili'
          }
        },
        {
          id: 2, name: 'Samsung Galaxy S24', nameSwahili: 'Samsung Galaxy S24',
          description: 'Powerful Android smartphone', descriptionSwahili: 'Simu ya Android yenye nguvu',
          fullDescription: 'Samsung Galaxy S24 with AI-powered features, advanced camera system, and long-lasting battery. Experience the future of smartphones.',
          fullDescriptionSwahili: 'Samsung Galaxy S24 yenye vipengele vya AI, mfumo wa kamera wa kisasa, na betri ya kudumu. Pata uzoefu wa simu za siku zijazo.',
          category: 'Smartphones', price: 950000,
          images: ['/images/products/samsung1.jpg', '/images/products/samsung2.jpg'],
          rating: 4.6, reviewCount: 89, inStock: true, stockCount: 8, isWholesale: true, isRetail: true,
          tags: ['android', 'samsung'],
          specifications: {
            'Screen Size': '6.2 inches',
            'Storage': '256GB',
            'Camera': '50MP Triple Camera',
            'Battery': '4000 mAh',
            'OS': 'Android 14',
            'Color': 'Phantom Black'
          },
          specificationsSwahili: {
            'Ukubwa wa Skrini': 'Inchi 6.2',
            'Hifadhi': '256GB',
            'Kamera': 'Kamera Tatu za 50MP',
            'Betri': '4000 mAh',
            'Mfumo': 'Android 14',
            'Rangi': 'Nyeusi ya Phantom'
          }
        }
      ]
      return electronicsProducts.find(p => p.id === productId) || null
    } else if (business.businessType === 'Fashion & Clothing') {
      const fashionProducts = [
        {
          id: 1, name: 'Elegant Dress', nameSwahili: 'Nguo ya Kifahari',
          description: 'Beautiful dress for special occasions', descriptionSwahili: 'Nguo nzuri kwa matukio maalum',
          fullDescription: 'An elegant dress perfect for weddings, parties, and special events. Made from high-quality fabric with attention to detail.',
          fullDescriptionSwahili: 'Nguo ya kifahari nzuri kwa harusi, sherehe, na matukio maalum. Imetengenezwa kwa kitambaa cha ubora wa juu na makini.',
          category: "Women's Wear", price: 65000, originalPrice: 75000,
          images: ['/images/products/dress1.jpg', '/images/products/dress2.jpg'],
          rating: 4.6, reviewCount: 34, inStock: true, stockCount: 12, isWholesale: false, isRetail: true,
          tags: ['elegant', 'party'],
          specifications: {
            'Material': '100% Cotton',
            'Size': 'M, L, XL Available',
            'Color': 'Navy Blue',
            'Care': 'Machine Washable',
            'Origin': 'Made in Tanzania'
          },
          specificationsSwahili: {
            'Nyenzo': 'Pamba 100%',
            'Saizi': 'M, L, XL Zinapatikana',
            'Rangi': 'Bluu ya Bahari',
            'Utunzaji': 'Inaweza Fuliwa kwa Mashine',
            'Asili': 'Imetengenezwa Tanzania'
          }
        }
      ]
      return fashionProducts.find(p => p.id === productId) || null
    } else {
      const generalProducts = [
        {
          id: 1, name: 'Rice 5kg', nameSwahili: 'Mchele Kilo 5',
          description: 'Premium quality rice', descriptionSwahili: 'Mchele wa ubora wa juu',
          fullDescription: 'High-quality rice perfect for daily meals. Carefully selected and processed to ensure freshness and taste.',
          fullDescriptionSwahili: 'Mchele wa ubora wa juu unaolingana na chakula cha kila siku. Umechaguliwa na kusindikwa kwa makini ili kuhakikisha utazama na ladha.',
          category: 'Groceries', price: 12000,
          images: ['/images/products/rice1.jpg', '/images/products/rice2.jpg'],
          rating: 4.3, reviewCount: 145, inStock: true, stockCount: 50, isWholesale: true, isRetail: true,
          tags: ['staple', 'quality'],
          specifications: {
            'Weight': '5 Kilograms',
            'Type': 'Long Grain Rice',
            'Origin': 'Mbeya, Tanzania',
            'Quality': 'Premium Grade',
            'Expiry': '12 Months from packaging'
          },
          specificationsSwahili: {
            'Uzito': 'Kilo 5',
            'Aina': 'Mchele wa Punje Ndefu',
            'Asili': 'Mbeya, Tanzania',
            'Ubora': 'Daraja la Juu',
            'Mwisho': 'Miezi 12 kutoka kupakiwa'
          }
        }
      ]
      return generalProducts.find(p => p.id === productId) || null
    }
  }, [business, productId])

  // Generate sample reviews
  const reviews: Review[] = useMemo(() => {
    if (!product) return []
    
    return [
      {
        id: 1,
        customerName: 'John Mwalimu',
        rating: 5,
        comment: 'Excellent product! Very happy with the quality and service.',
        commentSwahili: 'Bidhaa bora sana! Nimefurahi na ubora na huduma.',
        date: '2024-01-15',
        verified: true
      },
      {
        id: 2,
        customerName: 'Mary Kijana',
        rating: 4,
        comment: 'Good value for money. Fast delivery too.',
        commentSwahili: 'Bei nzuri kwa ubora. Utoaji wa haraka pia.',
        date: '2024-01-10',
        verified: true
      },
      {
        id: 3,
        customerName: 'Peter Simba',
        rating: 5,
        comment: 'Highly recommend this product. Will buy again.',
        commentSwahili: 'Napendekeza sana bidhaa hii. Nitanunua tena.',
        date: '2024-01-05',
        verified: false
      }
    ]
  }, [product])

  // Generate related products
  const relatedProducts = useMemo(() => {
    if (!business || !product) return []
    
    if (business.businessType === 'Electronics') {
      return [
        { id: 3, name: 'AirPods Pro', nameSwahili: 'AirPods Pro', price: 280000, rating: 4.7, category: 'Audio' },
        { id: 4, name: 'MacBook Air', nameSwahili: 'MacBook Air', price: 1800000, rating: 4.9, category: 'Laptops' }
      ].filter(p => p.id !== productId)
    }
    return []
  }, [business, product, productId])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stockCount || 1)) {
      setQuantity(newQuantity)
    }
  }

  const handleShare = () => {
    if (navigator.share && business && product) {
      navigator.share({
        title: language === 'sw' ? product.nameSwahili : product.name,
        text: language === 'sw' ? product.descriptionSwahili : product.description,
        url: window.location.href,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
      })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XMarkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.productNotFound}</h2>
          <p className="text-gray-600 mb-6">{t.productNotFoundDesc}</p>
          <Link
            href={`/store/${business.slug}/products`}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-2" />
            {t.backToCatalog}
          </Link>
        </div>
      </div>
    )
  }

  const productName = language === 'sw' ? product.nameSwahili : product.name
  const productDescription = language === 'sw' ? product.fullDescriptionSwahili : product.fullDescription
  const productSpecs = language === 'sw' ? product.specificationsSwahili : product.specifications

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href={`/store/${business.slug}`}
              className="text-gray-500 hover:text-gray-700"
            >
              {business.name}
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href={`/store/${business.slug}/products`}
              className="text-gray-500 hover:text-gray-700"
            >
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{productName}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse">
            {/* Image thumbnails */}
            <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
              <div className="grid grid-cols-4 gap-6">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    className={`relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-50 ${
                      index === selectedImageIndex ? 'ring-2 ring-teal-500' : ''
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-md flex items-center justify-center">
                      <span className="text-gray-500 text-xs">Image {index + 1}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main image */}
            <div className="w-full aspect-w-1 aspect-h-1">
              <div 
                className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-400 rounded-lg flex items-center justify-center cursor-zoom-in"
                onClick={() => setShowImageZoom(true)}
              >
                <div className="text-center">
                  <MagnifyingGlassIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <span className="text-gray-600 text-sm">{t.zoomImage}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{productName}</h1>

            <div className="mt-3">
              <div className="flex items-center space-x-3">
                <p className="text-3xl text-gray-900" style={{ color: business.primaryColor }}>
                  {formatPrice(product.price)}
                </p>
                {product.originalPrice && (
                  <>
                    <p className="text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </p>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {t.youSave} {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-3">
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIconSolid
                      key={rating}
                      className={`${
                        product.rating > rating ? 'text-yellow-400' : 'text-gray-300'
                      } h-5 w-5 flex-shrink-0`}
                    />
                  ))}
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  {product.reviewCount} {t.reviews}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-base text-gray-700">{productDescription}</div>
            </div>

            {/* Product type badges */}
            <div className="mt-6 flex items-center space-x-2">
              {product.isWholesale && product.isRetail && (
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  {t.bothTypes}
                </span>
              )}
              {product.isWholesale && !product.isRetail && (
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {t.wholesaleOnly}
                </span>
              )}
              {!product.isWholesale && product.isRetail && (
                <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                  {t.retailOnly}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="mt-6">
              <div className="flex items-center">
                <CheckIcon className={`h-5 w-5 ${product.inStock ? 'text-green-500' : 'text-red-500'}`} />
                <p className={`ml-2 text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inStock ? `${t.inStock} (${product.stockCount} available)` : t.outOfStock}
                </p>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            {product.inStock && (
              <div className="mt-10 flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    {t.quantity}
                  </label>
                  <div className="mt-1 flex items-center">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 font-normal"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={product.stockCount}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 text-center border-t border-b border-gray-300 py-2 text-gray-600 font-normal"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stockCount}
                      className="p-2 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 font-normal"
                    >
                      +
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {t.maxQuantity}: {product.stockCount}
                  </p>
                </div>

                <div className="flex-1">
                  <Link
                    href={`/store/${business.slug}/order?productId=${product.id}&quantity=${quantity}`}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                    style={{ backgroundColor: business.primaryColor }}
                  >
                    <ShoppingCartIcon className="w-5 h-5 mr-2" />
                    {t.requestPurchase}
                  </Link>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex items-center space-x-4">
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                {isFavorited ? (
                  <HeartIconSolid className="w-5 h-5 text-red-500 mr-2" />
                ) : (
                  <HeartIcon className="w-5 h-5 mr-2" />
                )}
                {isFavorited ? t.removeFromFavorites : t.addToFavorites}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ShareIcon className="w-5 h-5 mr-2" />
                {t.shareProduct}
              </button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16 lg:mt-24">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                  {t[tab as keyof typeof t]}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-8">
            {activeTab === 'description' && (
              <div className="prose prose-sm text-gray-500">
                <p>{productDescription}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(productSpecs).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-200 pb-2">
                    <dt className="font-medium text-gray-900">{key}</dt>
                    <dd className="mt-1 text-gray-600">{value}</dd>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{t.customerReviews}</h3>
                  <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                    {t.writeReview}
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">{t.noReviews}</p>
                    <p className="text-sm text-gray-400">{t.noReviewsDesc}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-900">{review.customerName}</h4>
                            <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                              review.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {review.verified ? t.verified : t.unverified}
                            </span>
                          </div>
                          <time className="text-sm text-gray-500">{review.date}</time>
                        </div>
                        <div className="mt-1 flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIconSolid
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-gray-700">
                          {language === 'sw' ? review.commentSwahili : review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">{t.relatedProducts}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/store/${business.slug}/products/${relatedProduct.id}`}
                  className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Product Image</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      {language === 'sw' ? relatedProduct.nameSwahili : relatedProduct.name}
                    </h3>
                    <div className="mt-1 flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIconSolid
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(relatedProduct.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="ml-1 text-xs text-gray-500">({relatedProduct.rating})</span>
                    </div>
                    <p className="mt-1 text-lg font-medium text-gray-900" style={{ color: business.primaryColor }}>
                      {formatPrice(relatedProduct.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Zoom Modal */}
      {showImageZoom && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageZoom(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <div className="w-full h-96 bg-gradient-to-br from-gray-300 to-gray-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">{t.closeZoom}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}