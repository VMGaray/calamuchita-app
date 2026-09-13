"use client"

import { AnimatePresence, motion } from "framer-motion"

interface ConfirmModalProps {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  /** "danger" usa rojo en el botón de confirmar (para acciones destructivas). */
  variant?: "danger" | "default"
  onConfirm: () => void
  onCancel: () => void
}

/** Modal de confirmación genérico — reutilizable para cualquier acción que convenga confirmar. */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[300]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            className="fixed inset-0 z-[301] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              className="w-full max-w-sm bg-white rounded-3xl overflow-hidden border border-brand-slate/20 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="font-serif text-lg text-stone-800 mb-1.5">{title}</h2>
                {message && (
                  <p className="text-sm text-stone-500 leading-relaxed">{message}</p>
                )}
              </div>
              <div className="flex border-t border-stone-100">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  {cancelLabel}
                </button>
                <div className="w-px bg-stone-100" />
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                    variant === "danger"
                      ? "text-red-500 hover:bg-red-50"
                      : "text-[#2D4530] hover:bg-stone-50"
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
