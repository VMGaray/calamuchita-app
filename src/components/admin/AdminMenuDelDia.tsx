"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface DailyMenuItem {
  id?: string
  name: string
  description: string
  price: string
  includes_drink: boolean
}

interface Props {
  businessId: string
}

export default function AdminMenuDelDia({ businessId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [isPublished, setIsPublished] = useState(false)
  const [items, setItems] = useState<DailyMenuItem[]>([])
  const [yesterdayItems, setYesterdayItems] = useState<DailyMenuItem[]>([])
  const [businessName, setBusinessName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const today = new Date().toISOString().split("T")[0]
  const todayLabel = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long"
  })

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const { data: business } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single()

      if (business) setBusinessName(business.name)

      const { data: todayMenu } = await supabase
        .from("daily_menus")
        .select("*, daily_menu_items(*)")
        .eq("business_id", businessId)
        .eq("date", today)
        .single()

      if (todayMenu) {
        setMenuId(todayMenu.id)
        setIsPublished(todayMenu.is_published)
        setItems(todayMenu.daily_menu_items.map((i: any) => ({
          id: i.id,
          name: i.name,
          description: i.description || "",
          price: i.price.toString(),
          includes_drink: i.includes_drink,
        })))
      }

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const { data: yesterdayMenu } = await supabase
        .from("daily_menus")
        .select("*, daily_menu_items(*)")
        .eq("business_id", businessId)
        .eq("date", yesterday.toISOString().split("T")[0])
        .single()

      if (yesterdayMenu) {
        setYesterdayItems(yesterdayMenu.daily_menu_items.map((i: any) => ({
          name: i.name,
          description: i.description || "",
          price: i.price.toString(),
          includes_drink: i.includes_drink,
        })))
      }

      setLoading(false)
    }

    fetchData()
  }, [businessId])

  const addItem = () => setItems(prev => [...prev, { name: "", description: "", price: "", includes_drink: false }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (index: number, field: keyof DailyMenuItem, value: any) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const loadYesterday = () => {
    setItems(yesterdayItems.map(i => ({ ...i, id: undefined })))
    setSuccess("Menú de ayer cargado.")
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleSave = async (publish: boolean) => {
    if (items.length === 0) { setError("Agregá al menos un plato"); return }
    const invalid = items.find(i => !i.name || !i.price)
    if (invalid) { setError("Todos los platos deben tener nombre y precio"); return }

    setSaving(true)
    setError(null)
    const supabase = createClient()

    if (menuId) {
      await supabase.from("daily_menus").update({ is_published: publish }).eq("id", menuId)
      await supabase.from("daily_menu_items").delete().eq("daily_menu_id", menuId)
      await supabase.from("daily_menu_items").insert(
        items.map(i => ({
          daily_menu_id: menuId,
          name: i.name,
          description: i.description || null,
          price: parseFloat(i.price),
          includes_drink: i.includes_drink,
        }))
      )
    } else {
      const { data: newMenu } = await supabase
        .from("daily_menus")
        .insert({ business_id: businessId, date: today, is_published: publish })
        .select()
        .single()

      if (newMenu) {
        setMenuId(newMenu.id)
        await supabase.from("daily_menu_items").insert(
          items.map(i => ({
            daily_menu_id: newMenu.id,
            name: i.name,
            description: i.description || null,
            price: parseFloat(i.price),
            includes_drink: i.includes_drink,
          }))
        )
      }
    }

    setIsPublished(publish)
    setSuccess(publish ? "¡Menú publicado!" : "Borrador guardado")
    setSaving(false)
    setTimeout(() => setSuccess(null), 3000)
  }

  if (loading) return (
    <div className="max-w-2xl space-y-4">
      {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 h-24 animate-pulse" />)}
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push("/dashboard")} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors">
          <ArrowLeft size={18} className="text-stone-600" />
        </button>
        <div>
          <h1 className="text-2xl text-stone-800">Menú del día</h1>
          <p className="text-stone-500 text-sm capitalize">{businessName} · {todayLabel}</p>
        </div>
        <div className="ml-auto">
          {isPublished ? (
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-green-100 text-green-600">
              <Eye size={12} /> Publicado
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-stone-100 text-stone-500">
              <EyeOff size={12} /> Sin publicar
            </span>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl mb-4">{success}</div>}

      {yesterdayItems.length > 0 && items.length === 0 && (
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-700">Hay menú de ayer disponible</p>
            <p className="text-xs text-primary-500 mt-0.5">Usalo como punto de partida</p>
          </div>
          <button onClick={loadYesterday} className="text-sm font-medium text-primary-600 hover:text-primary-700 bg-white border border-primary-200 px-4 py-2 rounded-xl transition-colors">
            Usar menú de ayer
          </button>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(index, "name", e.target.value)}
                placeholder="Nombre del plato *"
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button onClick={() => removeItem(index)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-400 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                placeholder="Descripción (opcional)"
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
              />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                  placeholder="Precio *"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={item.includes_drink}
                onChange={(e) => updateItem(index, "includes_drink", e.target.checked)}
                className="w-4 h-4 accent-primary-500"
              />
              <span className="text-xs text-stone-500">Incluye bebida</span>
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-stone-200 hover:border-primary-300 hover:bg-primary-50 text-stone-400 hover:text-primary-500 text-sm font-medium transition-colors flex items-center justify-center gap-2 mb-6"
      >
        <Plus size={16} />
        Agregar plato
      </button>

      <div className="flex gap-3">
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
        >
          Guardar borrador
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? "Publicando..." : isPublished ? "Actualizar menú" : "Publicar menú"}
        </button>
      </div>
    </div>
  )
}