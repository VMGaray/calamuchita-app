"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, Edit2, Check, X, FileText, ImageIcon, BookOpen } from "lucide-react"
import { SkeletonCarta } from "@/components/ui/Skeleton"
import PdfUpload from "@/components/ui/PdfUpload"
import ImageUpload from "@/components/ui/ImageUpload"
import { useBusinessDashboard } from "@/lib/context/BusinessDashboardContext"

type Mode = "manual" | "pdf" | "fotos" | null

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
}

const MAX_FOTOS = 5

export default function MiCartaSimple() {
  const { isRestaurante } = useBusinessDashboard()
  const [loading, setLoading] = useState(true)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>(null)
  const [choosingMode, setChoosingMode] = useState(false)

  // Manual
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [items, setItems] = useState<MenuItem[]>([])
  const [addingItem, setAddingItem] = useState(false)
  const [newItem, setNewItem] = useState({ name: "", description: "", price: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", description: "", price: "" })

  // PDF
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  // Fotos
  const [fotos, setFotos] = useState<(string | null)[]>(Array(MAX_FOTOS).fill(null))

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: business } = await supabase
        .from("businesses")
        .select("id, menu_pdf_url, menu_photos_urls")
        .eq("owner_id", user.id)
        .single()

      if (!business) { setLoading(false); return }

      setBusinessId(business.id)
      setPdfUrl(business.menu_pdf_url)

      const existingFotos = (business.menu_photos_urls || []) as string[]
      if (existingFotos.length > 0) {
        setFotos(Array.from({ length: MAX_FOTOS }, (_, i) => existingFotos[i] ?? null))
      }

      const { data: categories } = await supabase
        .from("menu_categories")
        .select("id, menu_items(id, name, description, price)")
        .eq("business_id", business.id)
        .limit(1)

      const cat = categories?.[0]
      if (cat) {
        setCategoryId(cat.id)
        setItems((cat.menu_items || []) as MenuItem[])
      }

      if (cat && (cat.menu_items?.length ?? 0) > 0) setMode("manual")
      else if (business.menu_pdf_url) setMode("pdf")
      else if (existingFotos.length > 0) setMode("fotos")

      setLoading(false)
    }
    fetchData()
  }, [])

  const clearOtherModes = async (keep: Mode) => {
    if (!businessId) return
    const supabase = createClient()

    if (keep !== "manual" && categoryId) {
      await supabase.from("menu_categories").delete().eq("id", categoryId)
      setCategoryId(null)
      setItems([])
    }
    if (keep !== "pdf" && pdfUrl) {
      await supabase.from("businesses").update({ menu_pdf_url: null }).eq("id", businessId)
      setPdfUrl(null)
    }
    if (keep !== "fotos" && fotos.some(Boolean)) {
      await supabase.from("businesses").update({ menu_photos_urls: [] }).eq("id", businessId)
      setFotos(Array(MAX_FOTOS).fill(null))
    }
  }

  const handlePickMode = async (picked: Exclude<Mode, null>) => {
    if (mode && mode !== picked) {
      const ok = confirm("Esto va a reemplazar tu carta actual. ¿Continuar?")
      if (!ok) return
      await clearOtherModes(picked)
    }
    setMode(picked)
    setChoosingMode(false)
  }

  const ensureCategory = async (): Promise<string | null> => {
    if (categoryId) return categoryId
    if (!businessId) return null
    const supabase = createClient()
    const { data, error } = await supabase
      .from("menu_categories")
      .insert({ business_id: businessId, name: "Carta", sort_order: 0, is_active: true })
      .select("id")
      .single()
    if (error || !data) return null
    setCategoryId(data.id)
    return data.id
  }

  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.price) return
    const catId = await ensureCategory()
    if (!catId || !businessId) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        business_id: businessId,
        category_id: catId,
        name: newItem.name.trim(),
        description: newItem.description.trim() || null,
        price: parseFloat(newItem.price),
        is_available: true,
        sort_order: items.length,
      })
      .select("id, name, description, price")
      .single()

    if (!error && data) {
      setItems(prev => [...prev, data as MenuItem])
      setNewItem({ name: "", description: "", price: "" })
      setAddingItem(false)
    }
  }

  const handleEditItem = async (itemId: string) => {
    if (!editForm.name.trim() || !editForm.price) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from("menu_items")
      .update({
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        price: parseFloat(editForm.price),
      })
      .eq("id", itemId)
      .select("id, name, description, price")
      .single()

    if (!error && data) {
      setItems(prev => prev.map(i => i.id === itemId ? (data as MenuItem) : i))
      setEditingId(null)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    const supabase = createClient()
    await supabase.from("menu_items").delete().eq("id", itemId)
    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  const handlePdfChange = async (url: string | null) => {
    if (!businessId) return
    setPdfUrl(url)
    await createClient().from("businesses").update({ menu_pdf_url: url }).eq("id", businessId)
  }

  const handleFotoChange = async (index: number, url: string | null) => {
    if (!businessId) return
    const next = [...fotos]
    next[index] = url
    setFotos(next)
    await createClient()
      .from("businesses")
      .update({ menu_photos_urls: next.filter(Boolean) })
      .eq("id", businessId)
  }

  if (isRestaurante) return (
    <div className="max-w-2xl">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-700">
        Esta función no está disponible para tu tipo de negocio.
      </div>
    </div>
  )

  if (loading) return <div className="max-w-2xl"><SkeletonCarta /></div>

  if (!businessId) return (
    <div className="max-w-2xl">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-700">
        Primero completá la información de tu local en <strong>Mi local</strong>.
      </div>
    </div>
  )

  const modeLabel: Record<Exclude<Mode, null>, string> = {
    manual: "Carga manual",
    pdf: "PDF",
    fotos: "Fotos",
  }

  const showPicker = !mode || choosingMode

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-stone-800 mb-1">Mi carta</h1>
          <p className="text-stone-500 text-sm">Elegí cómo mostrar tu carta a los clientes</p>
        </div>
        {mode && !choosingMode && (
          <button
            onClick={() => setChoosingMode(true)}
            className="text-xs font-medium px-3 py-2 rounded-xl border border-stone-200 text-stone-500 hover:border-stone-300 transition-colors"
          >
            Cambiar modo
          </button>
        )}
      </div>

      {mode && !choosingMode && (
        <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 w-fit">
          <Check size={14} className="text-green-600" />
          <span className="text-xs font-medium text-green-700">Modo activo: {modeLabel[mode]}</span>
        </div>
      )}

      {showPicker && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => handlePickMode("manual")}
            className={`bg-white rounded-2xl border p-6 text-left transition-colors hover:border-stone-300 ${mode === "manual" ? "border-[#2D4530] ring-1 ring-[#2D4530]/30" : "border-stone-200"}`}
          >
            <BookOpen size={22} style={{ color: "#2D4530" }} className="mb-3" />
            <p className="text-sm font-semibold text-stone-800 mb-1">Carga manual</p>
            <p className="text-xs text-stone-400">Cargá cada plato con nombre, descripción y precio</p>
          </button>
          <button
            onClick={() => handlePickMode("pdf")}
            className={`bg-white rounded-2xl border p-6 text-left transition-colors hover:border-stone-300 ${mode === "pdf" ? "border-[#2D4530] ring-1 ring-[#2D4530]/30" : "border-stone-200"}`}
          >
            <FileText size={22} style={{ color: "#2D4530" }} className="mb-3" />
            <p className="text-sm font-semibold text-stone-800 mb-1">PDF</p>
            <p className="text-xs text-stone-400">Subí un PDF con tu carta completa</p>
          </button>
          <button
            onClick={() => handlePickMode("fotos")}
            className={`bg-white rounded-2xl border p-6 text-left transition-colors hover:border-stone-300 ${mode === "fotos" ? "border-[#2D4530] ring-1 ring-[#2D4530]/30" : "border-stone-200"}`}
          >
            <ImageIcon size={22} style={{ color: "#2D4530" }} className="mb-3" />
            <p className="text-sm font-semibold text-stone-800 mb-1">Fotos</p>
            <p className="text-xs text-stone-400">Subí una o varias fotos de tu carta</p>
          </button>
        </div>
      )}

      {mode === "manual" && !choosingMode && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {items.length > 0 && (
            <div className="divide-y divide-stone-100">
              {items.map(item => (
                <div key={item.id} className="px-5 py-3">
                  {editingId === item.id ? (
                    <div className="space-y-2">
                      <input
                        autoFocus
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Nombre del plato"
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm outline-none focus:border-stone-400"
                      />
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Descripción (opcional)"
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm outline-none focus:border-stone-400"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                          placeholder="Precio"
                          className="w-32 px-3 py-2 rounded-lg border border-stone-200 text-sm outline-none focus:border-stone-400"
                        />
                        <button
                          onClick={() => handleEditItem(item.id)}
                          className="px-3 py-2 rounded-lg text-sm font-medium"
                          style={{ background: "#2D4530", color: "white" }}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-700">{item.name}</p>
                        {item.description && <p className="text-xs text-stone-400 mt-0.5 truncate">{item.description}</p>}
                      </div>
                      <p className="text-sm font-semibold shrink-0" style={{ color: "#2D4530" }}>
                        ${item.price.toLocaleString("es-AR")}
                      </p>
                      <button
                        onClick={() => { setEditingId(item.id); setEditForm({ name: item.name, description: item.description || "", price: item.price.toString() }) }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 hover:text-stone-600 hover:bg-stone-100 transition-colors shrink-0"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-4 border-t border-stone-100">
            {addingItem ? (
              <div className="space-y-2">
                <input
                  autoFocus
                  type="text"
                  value={newItem.name}
                  onChange={e => setNewItem(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre del plato *"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-stone-400"
                />
                <input
                  type="text"
                  value={newItem.description}
                  onChange={e => setNewItem(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción (opcional)"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-stone-400"
                />
                <div className="flex gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                    <input
                      type="number"
                      value={newItem.price}
                      onChange={e => setNewItem(f => ({ ...f, price: e.target.value }))}
                      placeholder="Precio"
                      className="w-32 pl-7 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-stone-400"
                    />
                  </div>
                  <button
                    onClick={handleAddItem}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: "#2D4530", color: "white" }}
                  >
                    Agregar
                  </button>
                  <button
                    onClick={() => { setAddingItem(false); setNewItem({ name: "", description: "", price: "" }) }}
                    className="px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:bg-stone-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingItem(true)}
                className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                <Plus size={15} />
                Agregar plato
              </button>
            )}
          </div>
        </div>
      )}

      {mode === "pdf" && !choosingMode && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          {pdfUrl ? (
            <div className="flex items-center justify-between">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-500 font-medium">
                Ver PDF cargado
              </a>
              <button onClick={() => handlePdfChange(null)} className="text-red-400 hover:text-red-500 text-sm">
                Quitar
              </button>
            </div>
          ) : (
            <PdfUpload onChange={handlePdfChange} />
          )}
        </div>
      )}

      {mode === "fotos" && !choosingMode && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-xs text-stone-400 mb-4">Hasta {MAX_FOTOS} fotos de tu carta</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fotos.map((url, i) => (
              <ImageUpload
                key={i}
                value={url}
                onChange={u => handleFotoChange(i, u)}
                folder="menu-fotos"
                label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
