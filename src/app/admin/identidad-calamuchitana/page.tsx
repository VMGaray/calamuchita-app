"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import ImageUpload from "@/components/ui/ImageUpload"
import {
  ArrowLeft, Plus, X, Pencil, Trash2, Newspaper,
  Loader2, ImageIcon, CalendarDays,
} from "lucide-react"

// ── Tipos ─────────────────────────────────────────────────────────────────────

type PostType = "Entrevista" | "Efeméride" | "Tip del Finde" | "Novedad"

interface EditorialPost {
  id: string
  title: string
  type: PostType
  description: string | null
  image_url: string | null
  expires_at: string | null
  created_at: string
}

interface FormState {
  title: string
  type: PostType
  description: string
  expires_at: string
  image_url: string | null
}

// ── Constantes ────────────────────────────────────────────────────────────────

const POST_TYPES: PostType[] = ["Entrevista", "Efeméride", "Tip del Finde", "Novedad"]

const TYPE_STYLES: Record<PostType, { bg: string; color: string }> = {
  "Entrevista":    { bg: "rgba(45,69,48,0.10)",   color: "#2D4530" },
  "Efeméride":     { bg: "rgba(124,92,58,0.12)",  color: "#7C5C3A" },
  "Tip del Finde": { bg: "rgba(45,108,108,0.12)", color: "#2D6B6B" },
  "Novedad":       { bg: "rgba(74,85,162,0.10)",  color: "#4A55A2" },
}

const EMPTY_FORM: FormState = {
  title: "",
  type: "Novedad",
  description: "",
  expires_at: "",
  image_url: null,
}

const INPUT =
  "w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-sm text-stone-800 outline-none focus:ring-2 focus:ring-[#2D4530]/20 focus:border-[#2D4530]/30 transition-colors placeholder:text-stone-400"

// ── Componente ────────────────────────────────────────────────────────────────

export default function IdentidadCalamuchitanaPage() {
  const supabase = createClient()

  const [posts, setPosts] = useState<EditorialPost[]>([])
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<EditorialPost | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchPosts = async () => {
    setFetching(true)
    const { data } = await supabase
      .from("editorial_posts")
      .select("*")
      .order("created_at", { ascending: false })
    setPosts((data as EditorialPost[]) ?? [])
    setFetching(false)
  }

  useEffect(() => { fetchPosts() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ────────────────────────────────────────────────────────────────

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (post: EditorialPost) => {
    setEditing(post)
    setForm({
      title: post.title,
      type: post.type,
      description: post.description ?? "",
      expires_at: post.expires_at ?? "",
      image_url: post.image_url,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  const set = <K extends keyof FormState>(key: K) =>
    (val: FormState[K]) => setForm(f => ({ ...f, [key]: val }))

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)

    // Asegurar que image_url sea siempre un string de URL o null — nunca un objeto
    const safeImageUrl =
      typeof form.image_url === "string" && form.image_url.startsWith("http")
        ? form.image_url
        : null

    const payload = {
      title:       form.title.trim(),
      type:        form.type,
      description: form.description.trim() || null,
      image_url:   safeImageUrl,
      expires_at:  form.expires_at || null,
    }

    if (editing) {
      await supabase.from("editorial_posts").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("editorial_posts").insert([payload])
    }

    setSaving(false)
    closeForm()
    fetchPosts()
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (post: EditorialPost) => {
    if (!confirm(`¿Eliminar "${post.title}"?\nEsta acción no se puede deshacer.`)) return
    setDeletingId(post.id)
    await supabase.from("editorial_posts").delete().eq("id", post.id)
    setPosts(prev => prev.filter(p => p.id !== post.id))
    setDeletingId(null)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

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
              style={{ background: "rgba(45,69,48,0.10)" }}
            >
              <Newspaper size={18} style={{ color: "#2D4530" }} />
            </div>
            <div>
              <h1 className="text-xl font-serif text-stone-800 leading-tight">
                Identidad Calamuchitana
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                {posts.length} nota{posts.length !== 1 ? "s" : ""} publicada{posts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shrink-0 shadow-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#2D4530", color: "#E1DBC9" }}
        >
          <Plus size={15} />
          Nueva Nota
        </button>
      </div>

      {/* ── LOADING ────────────────────────────────────────────── */}
      {fetching && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin" style={{ color: "#2D4530", opacity: 0.35 }} />
        </div>
      )}

      {/* ── EMPTY STATE ────────────────────────────────────────── */}
      {!fetching && posts.length === 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 flex flex-col items-center justify-center py-20 px-6 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(45,69,48,0.07)" }}
          >
            <Newspaper size={24} style={{ color: "rgba(45,69,48,0.30)" }} />
          </div>
          <p className="text-stone-600 text-sm font-semibold mb-1">No hay notas publicadas</p>
          <p className="text-stone-400 text-xs mb-6 max-w-xs">
            Creá la primera entrevista, efeméride o tip del fin de semana para el Valle.
          </p>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: "#2D4530", color: "#E1DBC9" }}
          >
            <Plus size={14} /> Nueva Nota
          </button>
        </div>
      )}

      {/* ── GRID DE NOTAS ──────────────────────────────────────── */}
      {!fetching && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {posts.map(post => {
            const ts = TYPE_STYLES[post.type] ?? TYPE_STYLES["Novedad"]
            const isDeleting = deletingId === post.id
            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative h-44 bg-stone-50 flex-shrink-0 flex items-center justify-center">
                  {post.image_url ? (
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <ImageIcon size={28} style={{ color: "rgba(45,69,48,0.15)" }} />
                  )}
                  {/* Badge de tipo */}
                  <div className="absolute top-3 left-3">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: ts.bg, color: ts.color }}
                    >
                      {post.type}
                    </span>
                  </div>
                </div>

                {/* Cuerpo */}
                <div className="px-4 pt-3.5 pb-3 flex flex-col gap-1 flex-1">
                  <p className="text-sm font-bold text-stone-800 leading-snug line-clamp-2">
                    {post.title}
                  </p>
                  {post.description && (
                    <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                      {post.description}
                    </p>
                  )}
                  {post.expires_at && (
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-0.5">
                      <CalendarDays size={10} />
                      Expira: {new Date(post.expires_at + "T00:00:00").toLocaleDateString("es-AR")}
                    </div>
                  )}
                  <p className="text-[10px] text-stone-300 mt-auto pt-2 border-t border-stone-50">
                    {new Date(post.created_at).toLocaleDateString("es-AR", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex border-t border-stone-100">
                  <button
                    onClick={() => openEdit(post)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-stone-500 hover:text-[#2D4530] hover:bg-stone-50 transition-colors"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                  <div className="w-px bg-stone-100" />
                  <button
                    onClick={() => handleDelete(post)}
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
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-[200]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
            />

            {/* Drawer lateral */}
            <motion.div
              className="fixed right-0 top-0 bottom-0 z-[210] w-full max-w-lg flex flex-col"
              style={{ background: "#FDFCF9" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              {/* Drawer header — sticky */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b border-stone-200 sticky top-0 z-10"
                style={{ background: "#FDFCF9" }}
              >
                <h2 className="font-serif text-lg text-stone-800">
                  {editing ? "Editar nota" : "Nueva nota editorial"}
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

              {/* Formulario */}
              <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-y-auto">
                <div className="px-6 py-6 space-y-6 flex-1">

                  {/* Imagen de portada */}
                  <ImageUpload
                    value={form.image_url}
                    onChange={(url) => setForm(f => ({ ...f, image_url: url }))}
                    bucket="editorial"
                    folder="posts"
                    label="Imagen de portada"
                  />

                  {/* Tipo de contenido */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-stone-400 mb-3">
                      Tipo de contenido *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {POST_TYPES.map(t => {
                        const s = TYPE_STYLES[t]
                        const active = form.type === t
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, type: t }))}
                            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all text-left"
                            style={{
                              borderColor: active ? s.color : "transparent",
                              background:  active ? s.bg : "rgba(45,69,48,0.04)",
                              color:       active ? s.color : "rgba(45,69,48,0.50)",
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0 transition-colors"
                              style={{ background: active ? s.color : "rgba(45,69,48,0.20)" }}
                            />
                            {t}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Título */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-stone-400 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={e => set("title")(e.target.value)}
                      placeholder="Ej: 70 Años de Tradición — El Comienzo de la Oktoberfest"
                      className={INPUT}
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-stone-400 mb-2">
                      Descripción
                    </label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={e => set("description")(e.target.value)}
                      placeholder="Un párrafo introductorio que resume de qué trata esta nota..."
                      className={`${INPUT} resize-none`}
                    />
                  </div>

                  {/* Fecha de expiración — visible solo para Tip del Finde */}
                  {form.type === "Tip del Finde" && (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-stone-400 mb-2">
                        <CalendarDays size={10} className="inline mr-1" />
                        Expira el (opcional)
                      </label>
                      <input
                        type="date"
                        value={form.expires_at}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={e => set("expires_at")(e.target.value)}
                        className={INPUT}
                      />
                      <p className="text-[10px] text-stone-400 mt-1.5 leading-relaxed">
                        Pasada esta fecha el tip dejará de mostrarse automáticamente en la app.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer — sticky */}
                <div
                  className="px-6 py-4 border-t border-stone-200 sticky bottom-0"
                  style={{ background: "#FDFCF9" }}
                >
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
                      disabled={saving || !form.title.trim()}
                      className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                      style={{ background: "#2D4530", color: "#E1DBC9" }}
                    >
                      {saving ? (
                        <><Loader2 size={15} className="animate-spin" /> Guardando…</>
                      ) : editing ? (
                        "Guardar cambios"
                      ) : (
                        "Publicar nota"
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
