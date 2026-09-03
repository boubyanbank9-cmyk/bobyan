import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'alain_cart_v2'

function normalizeCartItem(item) {
  if (!item || item.id == null) return null

  const quantity = Math.max(1, Number(item.quantity) || 1)
  const price = Number(item.price)
  if (!Number.isFinite(price)) return null

  const images = Array.isArray(item.images)
    ? item.images.filter(Boolean)
    : item.image
      ? [item.image]
      : []

  return {
    id: item.id,
    name: item.name || '',
    nameAr: item.nameAr || item.name_ar || item.name || '',
    description: item.description || '',
    descriptionAr: item.descriptionAr || item.description_ar || item.description || '',
    price,
    quantity,
    images: images.length
      ? images
      : ['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80'],
    featured: Boolean(item.featured),
    isInStock: item.isInStock !== false,
  }
}

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.map(normalizeCartItem).filter(Boolean)
  } catch {
    return []
  }
}

function saveCartToStorage(items) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore quota / private mode errors
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadCartFromStorage())
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    saveCartToStorage(items)
  }, [items])

  const addItem = (product) => {
    const qty = Math.max(1, Number(product?.quantity) || 1)
    const normalized = normalizeCartItem({ ...product, quantity: qty })
    if (!normalized) return

    setItems((current) => {
      const existing = current.find((item) => item.id === normalized.id)
      if (existing) {
        return current.map((item) =>
          item.id === normalized.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        )
      }
      return [...current, normalized]
    })
  }

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeItem(id)
      return
    }
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    try {
      localStorage.removeItem(CART_STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
