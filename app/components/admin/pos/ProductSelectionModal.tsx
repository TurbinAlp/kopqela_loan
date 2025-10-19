'use client'

import { useState } from 'react'
import { XMarkIcon, MagnifyingGlassIcon, PlusIcon, MinusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'

interface Product {
  id: number
  name: string
  nameSwahili?: string
  price: number
  wholesalePrice?: number
  category?: string
  image?: string
  stock: number
  barcode?: string
  unit?: string
}

interface TempCartItem {
  product: Product
  quantity: number
}

interface ProductSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  onAddToCart: (items: Array<{ product: Product, quantity: number }>) => void
  orderType: 'RETAIL' | 'WHOLESALE'
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  products,
  onAddToCart,
  orderType
}: ProductSelectionModalProps) {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [tempCart, setTempCart] = useState<TempCartItem[]>([])

  // Filter products by search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.nameSwahili && product.nameSwahili.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.includes(searchTerm))
  )

  const addToTempCart = (product: Product) => {
    // Check if already in temp cart
    const existing = tempCart.find(item => item.product.id === product.id)
    if (existing) {
      // Increment quantity
      setTempCart(tempCart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      // Add new
      setTempCart([...tempCart, { product, quantity: 1 }])
    }
  }

  const updateTempCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      // Remove from temp cart
      setTempCart(tempCart.filter(item => item.product.id !== productId))
    } else {
      setTempCart(tempCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const handleDone = () => {
    if (tempCart.length > 0) {
      onAddToCart(tempCart)
      setTempCart([])
      setSearchTerm('')
      onClose()
    }
  }

  const handleCancel = () => {
    setTempCart([])
    setSearchTerm('')
    onClose()
  }

  const getDisplayPrice = (product: Product) => {
    return orderType === 'WHOLESALE' && product.wholesalePrice
      ? product.wholesalePrice
      : product.price
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white md:rounded-lg shadow-xl w-full md:max-w-5xl md:mx-4 h-full md:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'sw' ? 'Chagua Bidhaa' : 'Select Products'}
          </h2>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content - Split Layout */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left: Product Selection */}
          <div className="flex-1 flex flex-col md:border-r border-gray-200 overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'sw' ? 'Tafuta bidhaa...' : 'Search products...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900"
                  autoFocus
                />
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {searchTerm.trim() === '' ? (
                // Empty state - no search
                <div className="text-center py-12 text-gray-500">
                  <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">
                    {language === 'sw' ? 'Tafuta Bidhaa' : 'Search for Products'}
                  </p>
                  <p className="text-sm mt-2">
                    {language === 'sw' 
                      ? 'Andika jina la bidhaa ili kuanza kutafuta'
                      : 'Type product name to start searching'}
                  </p>
                </div>
              ) : filteredProducts.length > 0 ? (
                // Show filtered products
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToTempCart(product)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 active:bg-teal-100 transition-colors text-left"
                    >
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {language === 'sw' && product.nameSwahili ? product.nameSwahili : product.name}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {language === 'sw' ? 'TSh' : 'TZS'} {getDisplayPrice(product).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {language === 'sw' ? 'Hisa' : 'Stock'}: {product.stock}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // No results found
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">
                    {language === 'sw' ? 'Hakuna bidhaa zilizopatikana' : 'No products found'}
                  </p>
                  <p className="text-sm mt-2">
                    {language === 'sw' 
                      ? 'Jaribu kutafuta kwa jina tofauti'
                      : 'Try searching with a different name'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Temp Cart */}
          <div className="w-full md:w-80 flex flex-col bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 max-h-[40vh] md:max-h-none">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <ShoppingCartIcon className="w-5 h-5 mr-2" />
                {language === 'sw' ? 'Bidhaa Zilizochaguliwa' : 'Selected Items'} ({tempCart.length})
              </h3>
            </div>

            {/* Temp Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {tempCart.length > 0 ? (
                <div className="space-y-2">
                  {tempCart.map(item => (
                    <div key={item.product.id} className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {language === 'sw' && item.product.nameSwahili ? item.product.nameSwahili : item.product.name}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {language === 'sw' ? 'TSh' : 'TZS'} {getDisplayPrice(item.product).toLocaleString()}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateTempCartQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300 active:bg-gray-400"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 1
                              updateTempCartQuantity(item.product.id, qty)
                            }}
                            className="w-14 text-center border border-gray-300 rounded px-1 text-sm text-gray-900"
                          />
                          <button
                            onClick={() => updateTempCartQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300 active:bg-gray-400"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {(getDisplayPrice(item.product) * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {language === 'sw' ? 'Hakuna bidhaa zilizochaguliwa' : 'No items selected'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
          >
            {language === 'sw' ? 'Ghairi' : 'Cancel'}
          </button>
          <button
            onClick={handleDone}
            disabled={tempCart.length === 0}
            className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {language === 'sw' ? 'Maliza' : 'Done'} {tempCart.length > 0 && `(${tempCart.length})`}
          </button>
        </div>
      </div>
    </div>
  )
}

