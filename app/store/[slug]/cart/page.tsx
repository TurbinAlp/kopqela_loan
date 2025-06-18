'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useCustomerBusiness } from '../../../hooks/useCustomerBusiness'
import { useCart } from '../../../hooks/useCart'
import { useLanguage } from '../../../contexts/LanguageContext'
import {
  ChevronLeftIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

export default function CartPage() {
  const params = useParams()
  const slug = params.slug as string
  const { business, isLoading: businessLoading } = useCustomerBusiness(slug)
  const { 
    cartItems, 
    isLoading: cartLoading, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    getTotalPrice,
    isEmpty 
  } = useCart(slug)
  const { language } = useLanguage()

  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set())

  const translations = {
    en: {
      cart: 'Shopping Cart',
      backToShopping: 'Continue Shopping',
      emptyCart: 'Your cart is empty',
      emptyCartDesc: 'Add some products to get started',
      removeItem: 'Remove item',
      updateQuantity: 'Update quantity',
      subtotal: 'Subtotal',
      total: 'Total',
      proceedToCheckout: 'Proceed to Checkout',
      clearCart: 'Clear Cart',
      quantity: 'Qty',
      price: 'Price',
      saving: 'Saving',
      itemsInCart: 'items in cart',
      confirmClear: 'Are you sure you want to clear your cart?',
      moveToWishlist: 'Move to Wishlist',
      outOfStock: 'Out of Stock',
      lowStock: 'Low Stock'
    },
    sw: {
      cart: 'Kikapu cha Ununuzi',
      backToShopping: 'Endelea Kununua',
      emptyCart: 'Kikapu chako ni tupu',
      emptyCartDesc: 'Ongeza bidhaa ili kuanza',
      removeItem: 'Ondoa kipengee',
      updateQuantity: 'Badilisha kiasi',
      subtotal: 'Jumla ya Nje',
      total: 'Jumla',
      proceedToCheckout: 'Endelea na Malipo',
      clearCart: 'Futa Kikapu',
      quantity: 'Kiasi',
      price: 'Bei',
      saving: 'Unokoa',
      itemsInCart: 'vitu kwenye kikapu',
      confirmClear: 'Una uhakika unataka kufuta kikapu chako?',
      moveToWishlist: 'Hamisha kwenye Orodha ya Matakwa',
      outOfStock: 'Haipatikani',
      lowStock: 'Stock Ndogo'
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

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId)
      return
    }
    updateQuantity(productId, newQuantity)
    // Force cart update event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    }
  }

  const handleRemoveItem = async (productId: number) => {
    setRemovingItems(prev => new Set(prev.add(productId)))
    
    // Add slight delay for better UX
    setTimeout(() => {
      removeFromCart(productId)
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
      // Force cart update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      }
    }, 300)
  }

  const handleClearCart = () => {
    if (window.confirm(t.confirmClear)) {
      clearCart()
      // Force cart update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      }
    }
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  if (businessLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Business not found</p>
        </div>
      </div>
    )
  }

  const primaryColor = business.businessSetting?.primaryColor || '#059669'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/store/${business.slug}/products`}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                <span className="font-medium">{t.backToShopping}</span>
              </Link>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900">{t.cart}</h1>
            
            <div className="text-sm text-gray-500">
              {getTotalItems()} {t.itemsInCart}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEmpty ? (
          // Empty Cart State
          <div className="text-center py-16">
            <ShoppingBagIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.emptyCart}</h2>
            <p className="text-gray-600 mb-8">{t.emptyCartDesc}</p>
            <Link
              href={`/store/${business.slug}/products`}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              {t.backToShopping}
            </Link>
          </div>
        ) : (
          // Cart Items
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    {t.cart} ({getTotalItems()} items)
                  </h2>
                  {cartItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-sm text-red-600 hover:text-red-800 transition-colors"
                    >
                      {t.clearCart}
                    </button>
                  )}
                </div>

                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className={`p-6 transition-all duration-300 ${
                        removingItems.has(item.productId) ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ShoppingBagIcon className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            <Link
                              href={`/store/${business.slug}/products/${item.productId}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {language === 'sw' && item.nameSwahili ? item.nameSwahili : item.name}
                            </Link>
                          </h3>
                          
                          {item.category && (
                            <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                  disabled={removingItems.has(item.productId)}
                                  className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 text-gray-600"
                                  aria-label="Decrease quantity"
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="px-4 py-2 text-sm font-medium min-w-[60px] text-center text-gray-700">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                  disabled={removingItems.has(item.productId)}
                                  className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 text-gray-600"
                                  aria-label="Increase quantity"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Unit */}
                              {item.unit && (
                                <span className="text-sm text-gray-500">per {item.unit}</span>
                              )}
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                {formatPrice(item.subtotal)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatPrice(item.price)} each
                              </p>
                            </div>
                          </div>

                          {/* Item Actions */}
                          <div className="mt-4 flex items-center space-x-4">
                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              disabled={removingItems.has(item.productId)}
                              className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                              <span>{t.removeItem}</span>
                            </button>

                            <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                              <HeartIcon className="h-4 w-4" />
                              <span>{t.moveToWishlist}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm sticky top-4">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">{t.subtotal}</h2>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">
                      {t.subtotal} ({getTotalItems()} items)
                    </span>
                    <span className="font-medium text-gray-700">{formatPrice(getTotalPrice())}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-700">{t.total}</span>
                      <span className="text-gray-700">{formatPrice(getTotalPrice())}</span>
                    </div>
                  </div>

                  <Link
                    href={`/store/${business.slug}/order`}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {t.proceedToCheckout}
                  </Link>

                  <Link
                    href={`/store/${business.slug}/products`}
                    className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    {t.backToShopping}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 