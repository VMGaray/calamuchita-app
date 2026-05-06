"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, ShoppingBag } from "lucide-react"
import CarritoDrawer from "./CarritoDrawer"

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  category_id: string | null
}

interface MenuCategory {
  id: string
  name: string
  menu_items: MenuItem[]
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Props {
  categories: MenuCategory[]
  business: {
    id: string
    name: string
    whatsapp: string | null
    offers_delivery: boolean
    offers_takeaway: boolean
  }
}

export default function CartaInteractiva({ categories, business }: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  const addItem = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }]
    })
  }

  const removeItem = (id: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id)
      if (existing?.quantity === 1) return prev.filter(i => i.id !== id)
      return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
    })
  }

  const getQty = (id: string) => cart.find(i => i.id === id)?.quantity || 0
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const activeCategories = categories.filter(
    cat => cat.menu_items?.some(item => item.is_available)
  )

  if (activeCategories.length === 0) return null

  return (
    <>
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl text-stone-800">Carta</h2>
          {totalItems > 0 && (
            <motion.button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "#c8603a", color: "white" }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.96 }}
            >
              <ShoppingBag size={15} />
              Ver pedido · ${totalPrice.toLocaleString("es-AR")}
            </motion.button>
          )}
        </div>

        <div className="space-y-8">
          {activeCategories.map(cat => (
            <div key={cat.id}>
              <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-4">
                {cat.name}
              </h3>
              <div className="space-y-3">
                {cat.menu_items
                  .filter(item => item.is_available)
                  .map(item => {
                    const qty = getQty(item.id)
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 py-3 border-b border-stone-100 last:border-0"
                      >
                        {item.image_url && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-700">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                          <p className="text-sm font-semibold mt-1" style={{ color: "#c8603a" }}>
                            ${item.price.toLocaleString("es-AR")}
                          </p>
                        </div>

                        {/* Controles +/- */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <AnimatePresence>
                            {qty > 0 && (
                              <motion.button
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                onClick={() => removeItem(item.id)}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                style={{
                                  background: "rgba(200,96,58,0.1)",
                                  color: "#c8603a",
                                }}
                              >
                                <Minus size={14} />
                              </motion.button>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {qty > 0 && (
                              <motion.span
                                key={qty}
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-6 text-center text-sm font-semibold text-stone-700"
                              >
                                {qty}
                              </motion.span>
                            )}
                          </AnimatePresence>

                          <motion.button
                            onClick={() => addItem(item)}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            style={{ background: "#c8603a", color: "white" }}
                          >
                            <Plus size={14} />
                          </motion.button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón flotante en mobile */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setDrawerOpen(true)}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 md:hidden z-40 flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-lg"
            style={{
              background: "#c8603a",
              color: "white",
              boxShadow: "0 8px 24px rgba(200,96,58,0.4)",
            }}
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              {totalItems}
            </div>
            <span className="text-sm font-medium">Ver pedido</span>
            <span className="text-sm font-semibold">
              ${totalPrice.toLocaleString("es-AR")}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <CarritoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cart={cart}
        onAdd={addItem}
        onRemove={removeItem}
        business={business}
        onOrderSuccess={() => {
          setCart([])
          setDrawerOpen(false)
        }}
      />
    </>
  )
}