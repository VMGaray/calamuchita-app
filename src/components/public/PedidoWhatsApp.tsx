"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Plus, Minus, Truck, X } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface MenuItem {
  id: string
  name: string
  price: number
  description?: string | null
}

interface Props {
  whatsapp: string
  businessName: string
  items: MenuItem[]
  type: "delivery" | "takeaway"
}

export default function PedidoWhatsApp({ whatsapp, businessName, items, type }: Props) {
  const [open, setOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id)
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === id)
      if (existing?.quantity === 1) return prev.filter(c => c.id !== id)
      return prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c)
    })
  }

  const getQuantity = (id: string) => cart.find(c => c.id === id)?.quantity || 0

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handlePedir = () => {
    const phone = whatsapp.replace(/\D/g, "")
    const fullPhone = phone.startsWith("54") ? phone : `54${phone}`

    const itemsList = cart
      .map(item => `• ${item.quantity}x ${item.name} — $${(item.price * item.quantity).toLocaleString("es-AR")}`)
      .join("\n")

    const message = encodeURIComponent(
      `Hola ${businessName}! 👋\n\n` +
      `Quiero hacer un pedido:\n\n` +
      `${itemsList}\n\n` +
      `💰 Total: $${total.toLocaleString("es-AR")}\n` +
      `📦 Modalidad: ${type === "delivery" ? "Delivery 🚚" : "Take away 🛍️"}\n` +
      (type === "delivery" && address ? `📍 Dirección: ${address}\n` : "") +
      `👤 Nombre: ${name}\n` +
      (notes ? `📝 Notas: ${notes}\n` : "") +
      `\n¡Gracias!`
    )

    window.open(`https://wa.me/${fullPhone}?text=${message}`, "_blank")
    setOpen(false)
    setCart([])
  }

  const isValid = cart.length > 0 && name && (type === "takeaway" || address)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`w-full py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
          type === "delivery"
            ? "bg-blue-500 hover:bg-blue-400 text-white"
            : "bg-accent-400 hover:bg-accent-300 text-white"
        }`}
      >
        {type === "delivery" ? <Truck size={16} /> : <ShoppingBag size={16} />}
        {type === "delivery" ? "Pedir delivery" : "Pedir take away"}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-x-4 bottom-4 top-4 z-50 max-w-lg mx-auto overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            >
              <div className="bg-white rounded-3xl overflow-hidden">
                {/* Header */}
                <div className="bg-primary-500 px-6 py-4 flex items-center justify-between sticky top-0">
                  <h2 className="font-serif text-xl text-white">
                    {type === "delivery" ? "Pedir delivery" : "Pedir take away"}
                  </h2>
                  <button onClick={() => setOpen(false)} className="text-primary-200 hover:text-white text-2xl">×</button>
                </div>

                <div className="p-6 space-y-6">

                  {/* Items del menú */}
                  <div>
                    <h3 className="text-sm font-medium text-stone-700 mb-3">Elegí tus platos</h3>
                    <div className="space-y-2">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-stone-100 hover:border-stone-200 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-700 truncate">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-stone-400 truncate">{item.description}</p>
                            )}
                            <p className="text-sm font-medium text-primary-500 mt-0.5">
                              ${item.price.toLocaleString("es-AR")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            {getQuantity(item.id) > 0 && (
                              <>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-sm font-medium w-4 text-center">{getQuantity(item.id)}</span>
                              </>
                            )}
                            <button
                              onClick={() => addToCart(item)}
                              className="w-7 h-7 rounded-full bg-primary-500 hover:bg-primary-400 text-white flex items-center justify-center transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  {cart.length > 0 && (
                    <div className="bg-stone-50 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-600">Total del pedido</span>
                        <span className="text-lg font-medium text-stone-800">
                          ${total.toLocaleString("es-AR")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Datos del cliente */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-stone-700">Tus datos</h3>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Nombre *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tu nombre"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
                      />
                    </div>
                    {type === "delivery" && (
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">Dirección de entrega *</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Calle y número"
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Aclaraciones (opcional)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Sin cebolla, extra salsa..."
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                      />
                    </div>
                  </div>

                  {/* Botón enviar */}
                  <button
                    onClick={handlePedir}
                    disabled={!isValid}
                    className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.549 4.126 1.516 5.858L.057 23.25a.75.75 0 00.918.919l5.451-1.458A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.655-.523-5.17-1.432l-.371-.22-3.838 1.027 1.049-3.733-.242-.386A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    Enviar pedido por WhatsApp
                  </button>

                  <p className="text-xs text-stone-400 text-center">
                    Se abrirá WhatsApp con tu pedido listo para enviar
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}