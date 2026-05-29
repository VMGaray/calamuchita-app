"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, Plus, ShoppingBag, Truck, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Props {
  open: boolean
  onClose: () => void
  cart: CartItem[]
  onAdd: (item: any) => void
  onRemove: (id: string) => void
  business: {
    id: string
    name: string
    whatsapp: string | null
    offers_delivery: boolean
    offers_takeaway: boolean
  }
  onOrderSuccess: () => void
}

type Step = "cart" | "form" | "success"

export default function CarritoDrawer({
  open, onClose, cart, onAdd, onRemove, business, onOrderSuccess
}: Props) {
  const [step, setStep] = useState<Step>("cart")
  const [orderType, setOrderType] = useState<"delivery" | "takeaway">(
    business.offers_takeaway ? "takeaway" : "delivery"
  )
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0)

  const handleConfirm = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Completá tu nombre y teléfono")
      return
    }
    if (orderType === "delivery" && !form.address.trim()) {
      setError("Ingresá tu dirección para el delivery")
      return
    }
    setError("")
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          business_id: business.id,
          customer_id: user!.id,
          type: orderType,
          status: "pending",
          total,
          notes: form.notes || null,
          customer_name: form.name,
          customer_phone: form.phone,
          delivery_address: orderType === "delivery" ? form.address : null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      await supabase.from("order_items").insert(
        cart.map(item => ({
          order_id: order.id,
          item_name: item.name,
          item_price: item.price,
          quantity: item.quantity,
        }))
      )

      const itemsText = cart
        .map(i => `• ${i.quantity}x ${i.name} — $${(i.price * i.quantity).toLocaleString("es-AR")}`)
        .join("\n")

      const msg = [
        `🛒 *Nuevo pedido — ${business.name}*`,
        ``,
        `👤 *Cliente:* ${form.name}`,
        `📞 *Teléfono:* ${form.phone}`,
        `📦 *Tipo:* ${orderType === "delivery" ? "🚚 Delivery" : "🏃 Take away"}`,
        orderType === "delivery" ? `📍 *Dirección:* ${form.address}` : "",
        ``,
        `*Productos:*`,
        itemsText,
        ``,
        `💰 *Total: $${total.toLocaleString("es-AR")}*`,
        form.notes ? `\n📝 *Nota:* ${form.notes}` : "",
        ``,
        `_Pedido registrado en Calamuchita App_`,
      ].filter(Boolean).join("\n")

      if (business.whatsapp) {
        const phone = business.whatsapp.replace(/\D/g, "")
        window.open(
          `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
          "_blank"
        )
      }

      setStep("success")
      setTimeout(() => {
        onOrderSuccess()
        setStep("cart")
        setForm({ name: "", phone: "", address: "", notes: "" })
      }, 3000)

    } catch (e) {
      setError("Hubo un error al procesar el pedido. Intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — z-[200] supera la sticky nav (z-[100]) */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer — z-[210] sobre el backdrop */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-[210] w-full max-w-md flex flex-col"
            style={{ background: "#E1DBC9" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(45,69,48,0.12)" }}>
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} style={{ color: "#2D4530" }} />
                <h2 className="font-serif text-lg" style={{ color: "#2D4530" }}>
                  {step === "cart" ? "Tu pedido" : step === "form" ? "Tus datos" : "¡Pedido enviado!"}
                </h2>
                {step === "cart" && totalItems > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(45,69,48,0.1)", color: "#2D4530" }}>
                    {totalItems}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(45,69,48,0.08)" }}>
                <X size={16} style={{ color: "#2D4530" }} />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto">

              {/* STEP: CARRITO */}
              {step === "cart" && (
                <div className="p-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag size={40} className="mx-auto mb-3" style={{ color: "rgba(45,69,48,0.25)" }} />
                      <p className="text-sm" style={{ color: "rgba(45,69,48,0.5)" }}>Tu carrito está vacío</p>
                    </div>
                  ) : (
                    <>
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid rgba(45,69,48,0.08)" }}>
                          <div className="flex-1">
                            <p className="text-sm font-medium" style={{ color: "#2D4530" }}>{item.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: "rgba(45,69,48,0.5)" }}>
                              ${item.price.toLocaleString("es-AR")} c/u
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onRemove(item.id)}
                              className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ background: "rgba(45,69,48,0.1)", color: "#2D4530" }}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold" style={{ color: "#2D4530" }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onAdd(item)}
                              className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ background: "#2D4530", color: "#E1DBC9" }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="text-sm font-semibold w-20 text-right" style={{ color: "#2D4530" }}>
                            ${(item.price * item.quantity).toLocaleString("es-AR")}
                          </p>
                        </div>
                      ))}

                      {/* Tipo de pedido */}
                      {(business.offers_delivery || business.offers_takeaway) && (
                        <div className="pt-2">
                          <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: "rgba(45,69,48,0.5)" }}>Tipo de pedido</p>
                          <div className="grid grid-cols-2 gap-2">
                            {business.offers_takeaway && (
                              <button
                                onClick={() => setOrderType("takeaway")}
                                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all bg-white"
                                style={{
                                  borderColor: orderType === "takeaway" ? "#2D4530" : "transparent",
                                  background: orderType === "takeaway" ? "rgba(45,69,48,0.06)" : "white",
                                }}
                              >
                                <ShoppingBag size={18} style={{ color: orderType === "takeaway" ? "#2D4530" : "#6B7B84" }} />
                                <span className="text-xs font-medium" style={{ color: orderType === "takeaway" ? "#2D4530" : "#6B7B84" }}>
                                  Take away
                                </span>
                              </button>
                            )}
                            {business.offers_delivery && (
                              <button
                                onClick={() => setOrderType("delivery")}
                                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all"
                                style={{
                                  borderColor: orderType === "delivery" ? "#2D4530" : "transparent",
                                  background: orderType === "delivery" ? "rgba(45,69,48,0.06)" : "white",
                                }}
                              >
                                <Truck size={18} style={{ color: orderType === "delivery" ? "#2D4530" : "#6B7B84" }} />
                                <span className="text-xs font-medium" style={{ color: orderType === "delivery" ? "#2D4530" : "#6B7B84" }}>
                                  Delivery
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* STEP: FORMULARIO */}
              {step === "form" && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: "rgba(45,69,48,0.6)" }}>Nombre *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Tu nombre"
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white outline-none transition-colors"
                      style={{ color: "#2D4530", border: "1px solid rgba(45,69,48,0.15)" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: "rgba(45,69,48,0.6)" }}>Teléfono *</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="Tu número de teléfono"
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white outline-none transition-colors"
                      style={{ color: "#2D4530", border: "1px solid rgba(45,69,48,0.15)" }}
                    />
                  </div>
                  {orderType === "delivery" && (
                    <div>
                      <label className="text-xs font-medium block mb-1.5" style={{ color: "rgba(45,69,48,0.6)" }}>Dirección de entrega *</label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        placeholder="Calle, número, localidad"
                        className="w-full px-4 py-3 rounded-xl text-sm bg-white outline-none transition-colors"
                        style={{ color: "#2D4530", border: "1px solid rgba(45,69,48,0.15)" }}
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: "rgba(45,69,48,0.6)" }}>Notas (opcional)</label>
                    <textarea
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Alguna aclaración sobre tu pedido..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white outline-none transition-colors resize-none"
                      style={{ color: "#2D4530", border: "1px solid rgba(45,69,48,0.15)" }}
                    />
                  </div>

                  {error && (
                    <p className="text-xs px-3 py-2 rounded-lg" style={{ color: "#5E4B3B", background: "rgba(94,75,59,0.08)", border: "1px solid rgba(94,75,59,0.15)" }}>{error}</p>
                  )}

                  {/* Resumen */}
                  <div className="bg-white rounded-xl p-4" style={{ border: "1px solid rgba(45,69,48,0.1)" }}>
                    <p className="text-xs mb-2" style={{ color: "rgba(45,69,48,0.45)" }}>Resumen del pedido</p>
                    {cart.map(i => (
                      <div key={i.id} className="flex justify-between text-xs py-0.5" style={{ color: "rgba(45,69,48,0.65)" }}>
                        <span>{i.quantity}x {i.name}</span>
                        <span>${(i.price * i.quantity).toLocaleString("es-AR")}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-semibold mt-2 pt-2" style={{ color: "#2D4530", borderTop: "1px solid rgba(45,69,48,0.1)" }}>
                      <span>Total</span>
                      <span>${total.toLocaleString("es-AR")}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "rgba(45,69,48,0.45)" }}>
                      {orderType === "delivery" ? "🚚 Delivery" : "🏃 Take away"} · Pago en el negocio
                    </p>
                  </div>
                </div>
              )}

              {/* STEP: ÉXITO */}
              {step === "success" && (
                <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CheckCircle size={64} style={{ color: "#2D4530" }} />
                  </motion.div>
                  <h3 className="font-serif text-2xl" style={{ color: "#2D4530" }}>¡Pedido enviado!</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(45,69,48,0.6)" }}>
                    Tu pedido fue registrado y se abrió WhatsApp para confirmarlo con el local.
                    Pronto te van a contactar.
                  </p>
                </div>
              )}
            </div>

            {/* Footer con botones */}
            {step !== "success" && (
              <div className="px-6 py-5 space-y-2" style={{ borderTop: "1px solid rgba(45,69,48,0.12)" }}>
                {step === "cart" && (
                  <>
                    <div className="flex justify-between text-sm font-semibold mb-3" style={{ color: "#2D4530" }}>
                      <span>Total</span>
                      <span>${total.toLocaleString("es-AR")}</span>
                    </div>
                    <button
                      onClick={() => cart.length > 0 && setStep("form")}
                      disabled={cart.length === 0}
                      className="w-full py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                      style={{ background: "#2D4530", color: "#E1DBC9" }}
                    >
                      Continuar con mis datos →
                    </button>
                  </>
                )}
                {step === "form" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep("cart")}
                      className="flex-1 py-3.5 rounded-xl text-sm font-medium transition-colors"
                      style={{ border: "1px solid rgba(45,69,48,0.2)", color: "#2D4530" }}
                    >
                      Volver
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={loading}
                      className="flex-1 py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
                      style={{ background: "#2D4530", color: "#E1DBC9" }}
                    >
                      {loading ? "Enviando..." : "Confirmar pedido →"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

