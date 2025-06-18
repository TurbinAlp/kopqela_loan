'use client'

import { useState, useEffect, useCallback } from 'react'

export interface CartItem {
  productId: number
  name: string
  nameSwahili: string
  price: number
  quantity: number
  subtotal: number
  image?: string
  category?: string
  unit?: string
}

// Custom cart event interface
interface CartUpdateEvent extends CustomEvent {
  detail: {
    type: 'ADD' | 'UPDATE' | 'REMOVE' | 'CLEAR'
    item?: CartItem
    productId?: number
  }
}

export function useCart(businessSlug?: string) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Generate storage key for this business
  const getStorageKey = useCallback(() => 
    businessSlug ? `orderItems_${businessSlug}` : 'orderItems', 
    [businessSlug]
  )

  // Load cart items from localStorage
  const loadCartItems = useCallback(() => {
    if (typeof window === 'undefined') return []
    
    try {
      const saved = localStorage.getItem(getStorageKey())
      if (saved) {
        const savedItems = JSON.parse(saved)
        if (Array.isArray(savedItems)) {
          return savedItems
        }
      }
    } catch (error) {
      console.error('Error loading cart items:', error)
    }
    return []
  }, [getStorageKey])

  // Save cart items to localStorage
  const saveCartItems = useCallback((items: CartItem[]) => {
    if (typeof window === 'undefined') return
    
    try {
      if (items.length === 0) {
        localStorage.removeItem(getStorageKey())
      } else {
        localStorage.setItem(getStorageKey(), JSON.stringify(items))
      }
    } catch (error) {
      console.error('Error saving cart items:', error)
    }
  }, [getStorageKey])

  // Dispatch cart update event for real-time updates
  const dispatchCartUpdate = useCallback((type: 'ADD' | 'UPDATE' | 'REMOVE' | 'CLEAR', item?: CartItem, productId?: number) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('cartUpdate', {
        detail: { type, item, productId }
      }) as CartUpdateEvent
      window.dispatchEvent(event)
    }
  }, [])

  // Initialize cart from localStorage
  useEffect(() => {
    const items = loadCartItems()
    setCartItems(items)
    setIsLoading(false)
  }, [loadCartItems])

  // Listen for cross-tab storage changes only
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === getStorageKey() && e.newValue !== e.oldValue) {
        const newItems = e.newValue ? JSON.parse(e.newValue) : []
        setCartItems(Array.isArray(newItems) ? newItems : [])
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [getStorageKey])

  // Listen for cart update events for same-page real-time updates
  useEffect(() => {
    const handleCartUpdate = () => {
      // Only update if this is a different cart hook instance or external update
      const currentItems = loadCartItems()
      setCartItems(currentItems)
    }

    window.addEventListener('cartUpdate', handleCartUpdate)

    return () => {
      window.removeEventListener('cartUpdate', handleCartUpdate)
    }
  }, [loadCartItems])

  // Save to localStorage whenever cart changes (without dispatching events)
  useEffect(() => {
    if (!isLoading) {
      saveCartItems(cartItems)
    }
  }, [cartItems, saveCartItems, isLoading])

  // Add item to cart
  const addToCart = useCallback((item: Omit<CartItem, 'subtotal'>) => {
    const orderItem: CartItem = {
      ...item,
      subtotal: item.price * item.quantity
    }

    setCartItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(
        cartItem => cartItem.productId === orderItem.productId
      )

      let updatedItems: CartItem[]
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = [...currentItems]
        updatedItems[existingItemIndex].quantity += orderItem.quantity
        updatedItems[existingItemIndex].subtotal = 
          updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity
      } else {
        // Add new item
        updatedItems = [...currentItems, orderItem]
      }

      // Dispatch event for real-time updates
      setTimeout(() => {
        dispatchCartUpdate('ADD', orderItem)
      }, 0)

      return updatedItems
    })

    return true
  }, [dispatchCartUpdate])

  // Update item quantity
  const updateQuantity = useCallback((productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(items => {
        const updatedItems = items.filter(item => item.productId !== productId)
        
        setTimeout(() => {
          dispatchCartUpdate('REMOVE', undefined, productId)
        }, 0)

        return updatedItems
      })
      return
    }

    setCartItems(items => {
      const updatedItems = items.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity, subtotal: item.price * newQuantity }
          : item
      )

      setTimeout(() => {
        const updatedItem = updatedItems.find(item => item.productId === productId)
        if (updatedItem) {
          dispatchCartUpdate('UPDATE', updatedItem)
        }
      }, 0)

      return updatedItems
    })
  }, [dispatchCartUpdate])

  // Remove item from cart
  const removeFromCart = useCallback((productId: number) => {
    setCartItems(items => {
      const updatedItems = items.filter(item => item.productId !== productId)
      
      setTimeout(() => {
        dispatchCartUpdate('REMOVE', undefined, productId)
      }, 0)

      return updatedItems
    })
  }, [dispatchCartUpdate])

  // Clear all items
  const clearCart = useCallback(() => {
    setCartItems([])
    
    setTimeout(() => {
      dispatchCartUpdate('CLEAR')
    }, 0)
  }, [dispatchCartUpdate])

  // Calculate totals
  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }, [cartItems])

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.subtotal, 0)
  }, [cartItems])

  // Check if item is in cart
  const isInCart = useCallback((productId: number) => {
    return cartItems.some(item => item.productId === productId)
  }, [cartItems])

  // Get specific item quantity
  const getItemQuantity = useCallback((productId: number) => {
    const item = cartItems.find(item => item.productId === productId)
    return item?.quantity || 0
  }, [cartItems])

  return {
    cartItems,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    getItemQuantity,
    // Convenient computed values
    itemCount: getTotalItems(),
    totalPrice: getTotalPrice(),
    isEmpty: cartItems.length === 0
  }
} 