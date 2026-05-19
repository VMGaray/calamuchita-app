"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Edit2, Check, X } from "lucide-react"
import { SkeletonCarta } from "@/components/ui/Skeleton"

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  is_available: boolean
  sort_order: number
  image_url: string | null
  category_id: string
}

interface MenuCategory {
  id: string
  name: string
  sort_order: number
  is_active: boolean
  menu_items: MenuItem[]
}

export default function CartaManager() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedCat, setExpandedCat] = useState<string | null>(null)

  // Estados para nueva categoría
  const [newCatName, setNewCatName] = useState("")
  const [addingCat, setAddingCat] = useState(false)

  // Estados para nuevo item
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({ name: "", description: "", price: "" })

  // Estado para edición inline
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", description: "", price: "" })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (!business) { setLoading(false); return }

    setBusinessId(business.id)

    const { data } = await supabase
      .from("menu_categories")
      .select("*, menu_items(*)")
      .eq("business_id", business.id)
      .order("sort_order")

    setCategories(data || [])
    if (data && data.length > 0) setExpandedCat(data[0].id)
    setLoading(false)
  }

  // ── CATEGORÍAS ──

  const handleAddCategory = async () => {
    if (!newCatName.trim() || !businessId) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from("menu_categories")
      .insert({
        business_id: businessId,
        name: newCatName.trim(),
        sort_order: categories.length,
      })
      .select("*, menu_items(*)")
      .single()

    if (!error && data) {
      setCategories(prev => [...prev, data])
      setExpandedCat(data.id)
      setNewCatName("")
      setAddingCat(false)
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("¿Eliminás esta categoría y todos sus platos?")) return
    const supabase = createClient()
    await supabase.from("menu_categories").delete().eq("id", catId)
    setCategories(prev => prev.filter(c => c.id !== catId))
  }

  const handleToggleCategory = async (cat: MenuCategory) => {
    const supabase = createClient()
    await supabase
      .from("menu_categories")
      .update({ is_active: !cat.is_active })
      .eq("id", cat.id)
    setCategories(prev =>
      prev.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c)
    )
  }

  // ── ITEMS ──

  const handleAddItem = async (categoryId: string) => {
    if (!newItem.name.trim() || !newItem.price || !businessId) return
    const supabase = createClient()
    const cat = categories.find(c => c.id === categoryId)
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        business_id: businessId,
        category_id: categoryId,
        name: newItem.name.trim(),
        description: newItem.description.trim() || null,
        price: parseFloat(newItem.price),
        is_available: true,
        sort_order: cat?.menu_items?.length || 0,
      })
      .select()
      .single()

    if (!error && data) {
      setCategories(prev => prev.map(c =>
        c.id === categoryId
          ? { ...c, menu_items: [...(c.menu_items || []), data] }
          : c
      ))
      setNewItem({ name: "", description: "", price: "" })
      setAddingItemTo(null)
    }
  }

  const handleDeleteItem = async (catId: string, itemId: string) => {
    const supabase = createClient()
    await supabase.from("menu_items").delete().eq("id", itemId)
    setCategories(prev => prev.map(c =>
      c.id === catId
        ? { ...c, menu_items: c.menu_items.filter(i => i.id !== itemId) }
        : c
    ))
  }

  const handleToggleItem = async (catId: string, item: MenuItem) => {
    const supabase = createClient()
    await supabase
      .from("menu_items")
      .update({ is_available: !item.is_available })
      .eq("id", item.id)
    setCategories(prev => prev.map(c =>
      c.id === catId
        ? { ...c, menu_items: c.menu_items.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i) }
        : c
    ))
  }

  const handleEditItem = async (catId: string, itemId: string) => {
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
      .select()
      .single()

    if (!error && data) {
      setCategories(prev => prev.map(c =>
        c.id === catId
          ? { ...c, menu_items: c.menu_items.map(i => i.id === itemId ? data : i) }
          : c
      ))
      setEditingItem(null)
    }
  }

  if (loading) return <div className="max-w-2xl"><SkeletonCarta /></div>

  if (!businessId) return (
    <div className="max-w-2xl">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-700">
        Primero completá la información de tu local en <strong>Mi local</strong>.
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-stone-800 mb-1">Carta</h1>
          <p className="text-stone-500 text-sm">Administrá las categorías y platos de tu menú</p>
        </div>
        <button
          onClick={() => setAddingCat(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: "#c8603a", color: "white" }}
        >
          <Plus size={16} />
          Nueva categoría
        </button>
      </div>

      {/* Formulario nueva categoría */}
      <AnimatePresence>
        {addingCat && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white rounded-2xl border border-stone-200 p-5 mb-4 flex gap-3"
          >
            <input
              autoFocus
              type="text"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddCategory()}
              placeholder="Nombre de la categoría (ej: Entradas, Platos principales...)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:border-stone-400"
            />
            <button
              onClick={handleAddCategory}
              className="px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "#c8603a", color: "white" }}
            >
              Agregar
            </button>
            <button
              onClick={() => { setAddingCat(false); setNewCatName("") }}
              className="px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:bg-stone-100"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de categorías */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="text-stone-500 text-sm mb-1">Tu carta está vacía</p>
          <p className="text-stone-400 text-xs">Creá una categoría para empezar a agregar platos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">

              {/* Header categoría */}
              <div className="flex items-center gap-3 px-5 py-4">
                <GripVertical size={16} className="text-stone-300 flex-shrink-0" />
                <button
                  onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                  className="flex-1 flex items-center gap-2 text-left"
                >
                  <span className="font-medium text-stone-800 text-sm">{cat.name}</span>
                  <span className="text-xs text-stone-400">
                    ({cat.menu_items?.length || 0} platos)
                  </span>
                  {expandedCat === cat.id
                    ? <ChevronUp size={16} className="text-stone-400 ml-auto" />
                    : <ChevronDown size={16} className="text-stone-400 ml-auto" />
                  }
                </button>

                {/* Toggle activo */}
                <button
                  onClick={() => handleToggleCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                    cat.is_active
                      ? "bg-green-100 text-green-600"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {cat.is_active ? "Visible" : "Oculta"}
                </button>

                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Items de la categoría */}
              <AnimatePresence>
                {expandedCat === cat.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-stone-100">

                      {/* Lista de items */}
                      {cat.menu_items?.length > 0 && (
                        <div className="divide-y divide-stone-100">
                          {cat.menu_items
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map(item => (
                              <div key={item.id} className="px-5 py-3">
                                {editingItem === item.id ? (
                                  // Modo edición
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
                                        onClick={() => handleEditItem(cat.id, item.id)}
                                        className="px-3 py-2 rounded-lg text-sm font-medium"
                                        style={{ background: "#c8603a", color: "white" }}
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button
                                        onClick={() => setEditingItem(null)}
                                        className="px-3 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-100"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // Modo visualización
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className={`text-sm font-medium ${item.is_available ? "text-stone-700" : "text-stone-400 line-through"}`}>
                                          {item.name}
                                        </p>
                                      </div>
                                      {item.description && (
                                        <p className="text-xs text-stone-400 mt-0.5 truncate">{item.description}</p>
                                      )}
                                    </div>
                                    <p className="text-sm font-semibold flex-shrink-0" style={{ color: "#c8603a" }}>
                                      ${item.price.toLocaleString("es-AR")}
                                    </p>

                                    {/* Disponible toggle */}
                                    <button
                                      onClick={() => handleToggleItem(cat.id, item)}
                                      className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 transition-colors ${
                                        item.is_available
                                          ? "bg-green-100 text-green-600"
                                          : "bg-stone-100 text-stone-400"
                                      }`}
                                    >
                                      {item.is_available ? "Disponible" : "Agotado"}
                                    </button>

                                    <button
                                      onClick={() => {
                                        setEditingItem(item.id)
                                        setEditForm({
                                          name: item.name,
                                          description: item.description || "",
                                          price: item.price.toString(),
                                        })
                                      }}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 hover:text-stone-600 hover:bg-stone-100 transition-colors flex-shrink-0"
                                    >
                                      <Edit2 size={13} />
                                    </button>

                                    <button
                                      onClick={() => handleDeleteItem(cat.id, item.id)}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Formulario nuevo item */}
                      <div className="px-5 py-4">
                        <AnimatePresence>
                          {addingItemTo === cat.id ? (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="space-y-2"
                            >
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
                                  onClick={() => handleAddItem(cat.id)}
                                  className="px-4 py-2.5 rounded-xl text-sm font-medium"
                                  style={{ background: "#c8603a", color: "white" }}
                                >
                                  Agregar
                                </button>
                                <button
                                  onClick={() => { setAddingItemTo(null); setNewItem({ name: "", description: "", price: "" }) }}
                                  className="px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:bg-stone-100"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </motion.div>
                          ) : (
                            <button
                              onClick={() => setAddingItemTo(cat.id)}
                              className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
                            >
                              <Plus size={15} />
                              Agregar plato
                            </button>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}