'use client'

import { ShoppingCartIcon, PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'

interface CartItem {
  id: number
  name: string
  nameSwahili?: string
  price: number
  quantity: number
  subtotal: number
}

interface CartSectionProps {
  cart: CartItem[]
  onUpdateQuantity: (productId: number, newQuantity: number) => void
  onRemoveFromCart: (productId: number) => void
}

export default function CartSection({
  cart,
  onUpdateQuantity,
  onRemoveFromCart
}: CartSectionProps) {
  const { language } = useLanguage()
  
  const translations = {
    en: {
      cart: "Shopping Cart",
      currency: "TZS"
    },
    sw: {
      cart: "Kart ya Ununuzi",
      currency: "TSh"
    }
  }

  const t = translations[language]

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4 flex items-center text-gray-900">
        <ShoppingCartIcon className="w-5 h-5 mr-2 text-gray-900" />
        {t.cart} ({cart.length})
      </h3>
      
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate text-gray-900">
                {language === 'sw' && item.nameSwahili ? item.nameSwahili : item.name}
              </p>
              <p className="text-xs text-gray-600 text-gray-900">
                {t.currency} {item.price.toLocaleString()} x {item.quantity}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 text-gray-900"
              >
                <MinusIcon className="w-3 h-3 text-gray-900" />
              </button>
              <span className="text-sm font-medium w-8 text-center text-gray-900">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 text-gray-900"
              >
                <PlusIcon className="w-3 h-3 text-gray-900" />
              </button>
              <button
                onClick={() => onRemoveFromCart(item.id)}
                className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 ml-2"
              >
                <XMarkIcon className="w-3 h-3 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {cart.length === 0 && (
        <p className="text-gray-500 text-center py-8">Cart is empty</p>
      )}
    </div>
  )
} 