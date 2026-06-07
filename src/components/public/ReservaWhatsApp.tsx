"use client"

import { useState } from "react"
import { normalizeArgPhone } from "@/lib/phone"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, Users, X } from "lucide-react"

interface Props {
  whatsapp: string
  businessName: string
}

export default function ReservaWhatsApp({ whatsapp, businessName }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
    people: "2",
    notes: "",
  })

  const handleReservar = () => {
    const fullPhone = normalizeArgPhone(whatsapp)

    const message = encodeURIComponent(
      `Hola ${businessName}! 👋\n\n` +
      `Quiero hacer una reserva:\n` +
      `📅 Fecha: ${form.date}\n` +
      `🕐 Hora: ${form.time}\n` +
      `👥 Personas: ${form.people}\n` +
      `👤 Nombre: ${form.name}\n` +
      (form.notes ? `📝 Notas: ${form.notes}\n` : "") +
      `\n¡Gracias!`
    )

    window.open(`https://wa.me/${fullPhone}?text=${message}`, "_blank")
    setOpen(false)
  }

  const isValid = form.name && form.date && form.time && form.people

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-brand-pine text-brand-sand hover:opacity-90 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Calendar size={16} />
        Reservar mesa
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
              className="fixed inset-x-4 bottom-4 top-4 z-50 max-w-md mx-auto overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            >
              <div className="bg-white rounded-3xl overflow-hidden">
                <div className="bg-brand-pine px-6 py-4 flex items-center justify-between">
                  <h2 className="font-serif text-xl text-brand-sand">Reservar mesa</h2>
                  <button onClick={() => setOpen(false)} className="text-brand-sand/60 hover:text-brand-sand text-2xl leading-none">×</button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Tu nombre *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="María García"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-brand-pine/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        <Calendar size={12} className="inline mr-1" />
                        Fecha *
                      </label>
                      <input
                        type="date"
                        value={form.date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-brand-pine/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        <Clock size={12} className="inline mr-1" />
                        Hora *
                      </label>
                      <input
                        type="time"
                        value={form.time}
                        onChange={(e) => setForm(p => ({ ...p, time: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-brand-pine/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      <Users size={12} className="inline mr-1" />
                      Cantidad de personas *
                    </label>
                    <select
                      value={form.people}
                      onChange={(e) => setForm(p => ({ ...p, people: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-brand-pine/20 bg-white"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>
                      ))}
                      <option value="más de 10">Más de 10</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Aclaraciones <span className="text-stone-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Ej: cumpleaños, alergias, silla para bebé..."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-brand-pine/20 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleReservar}
                    disabled={!isValid}
                    className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.549 4.126 1.516 5.858L.057 23.25a.75.75 0 00.918.919l5.451-1.458A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.655-.523-5.17-1.432l-.371-.22-3.838 1.027 1.049-3.733-.242-.386A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    Enviar reserva por WhatsApp
                  </button>

                  <p className="text-xs text-stone-400 text-center">
                    Se abrirá WhatsApp con tu reserva lista para enviar
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