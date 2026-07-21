"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import ImageUpload from "@/components/ui/ImageUpload"
import { Novedad } from "@/types/database"
import { LOCALIDADES } from "@/lib/constants/telefonos"
import {
  ArrowLeft, Plus, X, Pencil, Trash2, Sparkles,
  Loader2, ImageIcon, CalendarDays, MapPin,
} from "lucide-react"

const ACCENT = "#6B7A5E"

interface FormState {
  title: string
  content: string
  locality: string
  expires_at: string
  image_url: string | null
  published: boolean
}

const EMPTY_FORM: FormState = {
  title: "",
  content: "",
  locality: "",
  expires_at: "",
  image_url: null,
  published: true,
}

const INPUT =
  "w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-sm text-stone-800 outline-none focus:ring-2 focus:border-transparent transition-colors placeholder:text-stone-400"

// Convierte un timestamptz ISO a formato datetime-local ("YYYY-MM-DDTHH:mm")
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function statusOf(n: Pick<Novedad, "published" | "expires_at">): "published" | "draft" | "expired" {
  if (n.expires_at && new Date(n.expires_at) <= new Date()) return "expired"
  if (!n.published) return "draft"
  return "published"
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  published: { bg: "rgba(107,122,94,0.12)", color: ACCENT, label: "Publicada" },
  draft:     { bg: "rgba(120,113,108,0.12)", color: "#78716C", label: "Borrador" },
  expired:   { bg: "rgba(180,60,60,0.10)", color: "#B43C3C", label: "Vencida" },
}

export default function AdminNovedadesPage() {
  const supabase = createClient()

  const [novedades, setNovedades] = useState<Novedad[]>([])
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Novedad | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const fetchNovedades = async () => {
    setFetching(true)
    const { data } = await supabase
      .from("novedades")
      .select("*")
      .order("created_at", { ascending: false })
    setNovedades((data as Novedad[]) ?? [])
    setFetching(false)
  }

  useEffect(() => { fetchNovedades() }, [] ) // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (n: Novedad) => {
    setEditing(n)
    setForm({
      title: n.title ?? "",
      content: n.content ?? "",
      locality: n.locality ?? "",
      expires_at: toDatetimeLocal(n.expires_at),
      image_url: n.image_url,
      published: n.published,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setForm(EMPTY_FORM)
    setSaveError(null)
  }

  const set = <K extends keyof FormState>(key: K) =>
    (val: FormState[K]) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const safeImageUrl =
      typeof form.image_url === "string" && form.image_url.startsWith("http")
        ? form.image_url
        : null

    const payload = {
      title:      form.title.trim() || null,
      content:    form.content.trim() || null,
      locality:   form.locality || null,
      image_url:  safeImageUrl,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      published:  form.published,
    }

    setSaveError(null)
    let error
    if (editing) {
      ;({ error } = await supabase.from("novedades").update(payload).eq("id", editing.id))
    } else {
      ;({ error } = await supabase.from("novedades").insert([payload]))
    }

    setSaving(false)
    if (error) {
      setSaveError(error.message)
      return
    }
    closeForm()
    fetchNovedades()
  }

  const handleDelete = async (n: Novedad) => {
    if (!confirm(`¿Eliminar "${n.title || "esta novedad"}"?\nEsta acción no se puede deshacer.`)) return
    setDeletingId(n.id)
    await supabase.from("novedades").delete().eq("id", n.id)
    setNovedades(prev => prev.filter(p => p.id !== n.id))
    setDeletingId(null)
  }

  return (
    <div>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-stone-700 transition-colors mb-3"
          >
            <ArrowLeft size={12} />
            Volver al Panel
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(107,122,94,0.12)" }}
            >
              <Sparkles size={18} style={{ color: ACCENT }} />
            </div>
            <div>
              <h1 className="text-xl font-serif text-stone-800 leading-tight">
                Novedades
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                {novedades.length} novedad{novedades.length !== 1 ? "es" : ""} cargada{novedades.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shrink-0 shadow-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: ACCENT, color: "#fff" }}
        >
          <Plus size={15} />
          Nueva Novedad
        </button>
      </div>

      {/* ── LOADING ────────────────────────────────────────────── */}
      {fetching && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin" style={{ color: ACCENT, opacity: 0.35 }} />
        </div>
      )}

      {/* ── EMPTY STATE ────────────────────────────────────────── */}
      {!fetching && novedades.length === 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 flex flex-col items-center justify-center py-20 px-6 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(107,122,94,0.10)" }}
          >
            <Sparkles size={24} style={{ color: "rgba(107,122,94,0.40)" }} />
          </div>
          <p className="text-stone-600 text-sm font-semibold mb-1">No hay novedades cargadas</p>
          <p className="text-stone-400 text-xs mb-6 max-w-xs">
            Cargá un aviso de corta duración para el Valle — un horario especial, un taller, algo puntual.
          </p>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: ACCENT, color: "#fff" }}
          >
            <Plus size={14} /> Nueva Novedad
          </button>
        </div>
      )}

      {/* ── GRID DE NOVEDADES ──────────────────────────────────── */}
      {!fetching && novedades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {novedades.map(n => {
            const status = STATUS_STYLES[statusOf(n)]
            const isDeleting = deletingId === n.id
            return (
              <div
                key={n.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                style={{ borderLeft: `3px solid ${ACCENT}` }}
              >
                <div className="relative h-36 bg-stone-50 flex-shrink-0 flex items-center justify-center">
                  {n.image_url ? (
                    <Image
                      src={n.image_url}
                      alt={n.title ?? "Novedad"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <ImageIcon size={26} style={{ color: "rgba(107,122,94,0.20)" }} />
                  )}
                  <div className="absolute top-3 left-3">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: status.bg, color: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className="px-4 pt-3.5 pb-3 flex flex-col gap-1 flex-1">
                  <p className="text-sm font-bold text-stone-800 leading-snug line-clamp-2">
                    {n.title || "(Sin título)"}
                  </p>
                  {n.content && (
                    <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                      {n.content}
                    </p>
                  )}
                  {n.expires_at && (
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-0.5">
                      <CalendarDays size={10} />
                      Vence: {new Date(n.expires_at).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                  <p className="text-[10px] text-stone-300 mt-auto pt-2 border-t border-stone-50">
                    {new Date(n.created_at).toLocaleDateString("es-AR", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex border-t border-stone-100">
                  <button
                    onClick={() => openEdit(n)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-stone-500 hover:text-[#6B7A5E] hover:bg-stone-50 transition-colors"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                  <div className="w-px bg-stone-100" />
                  <button
                    onClick={() => handleDelete(n)}
                    disabled={isDeleting}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-stone-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                  >
                    {isDeleting
                      ? <Loader2 size={12} className="animate-spin" />
                      : <><Trash2 size={12} /> Eliminar</>
                    }
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ══ MODAL FORMULARIO ══════════════════════════════════════ */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-[200]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
            />

            <motion.div
              className="fixed right-0 top-0 bottom-0 z-[210] w-full max-w-lg flex flex-col"
              style={{ background: "#FDFCF9" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div
                className="flex items-center justify-between px-6 py-4 border-b border-stone-200 sticky top-0 z-10"
                style={{ background: "#FDFCF9" }}
              >
                <h2 className="font-serif text-lg text-stone-800">
                  {editing ? "Editar novedad" : "Nueva novedad"}
                </h2>
                <button
                  type="button"
                  onClick={closeForm}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={15} className="text-stone-500" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-y-auto">
                <div className="px-6 py-6 space-y-6 flex-1">

                  <ImageUpload
                    value={form.image_url}
                    onChange={(url) => setForm(f => ({ ...f, image_url: url }))}
                    bucket="event-images"
                    folder="novedades"
                    label="Imagen (opcional)"
                  />

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-stone-400 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => set("title")(e.target.value)}
                      placeholder="Ej: Lunes 22 la AFIP atiende en VGB"
                      className={INPUT}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-stone-400 mb-2">
                      Contenido
                    </label>
                    <textarea
                      rows={4}
                      value={form.content}
                      onChange={e => set("content")(e.target.value)}
                      placeholder="Detalle breve de la novedad..."
                      className={`${INPUT} resize-none`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-stone-400 mb-2">
                      <MapPin size={10} className="inline mr-1" />
                      Localidad (opcional)
                    </label>
                    <select
                      value={form.locality}
                      onChange={e => set("locality")(e.target.value)}
                      className={`${INPUT} bg-white`}
                    >
                      <option value="">Sin localidad específica</option>
                      {LOCALIDADES.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-stone-400 mb-2">
                      <CalendarDays size={10} className="inline mr-1" />
                      Fecha y hora de vencimiento (opcional)
                    </label>
                    <input
                      type="datetime-local"
                      value={form.expires_at}
                      onChange={e => set("expires_at")(e.target.value)}
                      className={INPUT}
                    />
                    <p className="text-[10px] text-stone-400 mt-1.5 leading-relaxed">
                      Pasada esta fecha la novedad deja de mostrarse automáticamente. Si la dejás vacía, no vence.
                    </p>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200">
                    <div>
                      <p className="text-sm font-medium text-stone-700">Publicada</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">Si está apagado, queda como borrador (no se ve en la app).</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.published}
                      onClick={() => set("published")(!form.published)}
                      className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
                      style={{ background: form.published ? ACCENT : "#D6D3D1" }}
                    >
                      <span
                        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"
                        style={{ transform: form.published ? "translateX(22px)" : "translateX(2px)" }}
                      />
                    </button>
                  </div>
                </div>

                <div
                  className="px-6 py-4 border-t border-stone-200 sticky bottom-0"
                  style={{ background: "#FDFCF9" }}
                >
                  {saveError && (
                    <div className="mb-3 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      Error al guardar: {saveError}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="flex-1 py-3 rounded-xl text-sm font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                      style={{ background: ACCENT, color: "#fff" }}
                    >
                      {saving ? (
                        <><Loader2 size={15} className="animate-spin" /> Guardando…</>
                      ) : editing ? (
                        "Guardar cambios"
                      ) : (
                        "Publicar novedad"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
