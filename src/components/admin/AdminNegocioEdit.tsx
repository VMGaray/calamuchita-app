"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BusinessSection, BusinessCategory } from "@/types/database"
import { MASTER_CATEGORIES } from "@/lib/constants/categories"
import ImageUpload from "@/components/ui/ImageUpload"
import PdfUpload from "@/components/ui/PdfUpload"
import HorariosEditor, { HorarioDay } from "@/components/ui/HorariosEditor"
import { ArrowLeft, Star } from "lucide-react"
import QRMarketing from "@/components/admin/QRMarketing"

const sections: { value: BusinessSection; label: string }[] = [
  { value: "gastronomy", label: "Gastronomía" },
  { value: "services",   label: "Servicios" },
  { value: "health",     label: "Salud" },
  { value: "education",  label: "Educación" },
  { value: "tourism",    label: "Turismo" },
  { value: "commerce",   label: "Comercios" },
  { value: "events",     label: "Eventos" },
  { value: "info",       label: "Info útil" },
]

const gastronomyCategories: { value: BusinessCategory; label: string }[] = [
  { value: "restaurant", label: "Restaurante" },
  { value: "cafe_bar",   label: "Bar/Café" },
  { value: "viandas",    label: "Viandas" },
  { value: "other",      label: "Otro" },
]
const subcategoryOptions: Record<string, string[]> = {
  services: MASTER_CATEGORIES.services.subcategories.map(s => s.label),
  commerce: MASTER_CATEGORIES.commerce.subcategories.map(s => s.label),
  health: MASTER_CATEGORIES.health.subcategories.map(s => s.label),
  education: MASTER_CATEGORIES.education.subcategories.map(s => s.label),
  tourism: MASTER_CATEGORIES.tourism.subcategories.map(s => s.label),
}

const pueblos = [
  "Villa General Belgrano", "Los Reartes", "Santa Rosa de Calamuchita",
  "La Cumbrecita", "Yacanto", "Amboy", "Villa Ciudad de América",
  "Embalse", "Villa del Dique",
]

interface Props { id: string }

export default function AdminNegocioEdit({ id }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [horarios, setHorarios] = useState<HorarioDay[]>([])

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    section: "services" as BusinessSection,
    category: "other" as BusinessCategory,
    subcategory: "",
    address: "",
    pueblo: "",
    phone: "",
    instagram: "",
    whatsapp: "",
    offers_delivery: false,
    offers_takeaway: false,
    offers_dine_in: false,
    accepts_reservations: false,
    logo_url: null as string | null,
    cover_url: null as string | null,
    menu_pdf_url: null as string | null,
    status: "active",
    menu_link: "",
    pet_friendly: false,
    payment_methods: [] as string[],
    is_premium: false,
  })

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()

      const { data: business } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single()

      if (business) {
        const addressParts = business.address?.split(",") || []
        setForm({
          name: business.name || "",
          slug: business.slug || "",
          description: business.description || "",
          section: business.section || "services",
          category: business.category || "other",
          subcategory: business.subcategory || "",
          address: addressParts[0]?.trim() || "",
          pueblo: addressParts[1]?.trim() || "",
          phone: business.phone || "",
          instagram: business.instagram || "",
          whatsapp: business.whatsapp || "",
          offers_delivery: business.offers_delivery || false,
          offers_takeaway: business.offers_takeaway || false,
          offers_dine_in: business.offers_dine_in || false,
          accepts_reservations: business.accepts_reservations || false,
          logo_url: business.logo_url || null,
          cover_url: business.cover_url || null,
          menu_pdf_url: business.menu_pdf_url || null,
          status: business.status || "active",
          menu_link: business.menu_link || "",
          pet_friendly: business.pet_friendly || false,
          payment_methods: business.payment_methods || [],
          is_premium: business.is_premium || false,
        })
      }

      const { data: horariosData } = await supabase
        .from("business_hours")
        .select("*")
        .eq("business_id", id)
        .order("day_of_week")

      if (horariosData) setHorarios(horariosData)
      setLoading(false)
    }
    fetch()
  }, [id])

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.name) { setError("El nombre es obligatorio"); return }
    setSaving(true)
    setError(null)

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        section: form.section,
        category: form.section === "gastronomy" ? form.category : null,
        subcategory: form.subcategory || null,
        address: form.pueblo ? `${form.address}, ${form.pueblo}` : form.address || null,
        phone: form.phone || null,
        instagram: form.instagram || null,
        whatsapp: form.whatsapp || null,
        offers_delivery: form.offers_delivery,
        offers_takeaway: form.offers_takeaway,
        offers_dine_in: form.offers_dine_in,
        accepts_reservations: form.accepts_reservations,
        logo_url: form.logo_url,
        cover_url: form.cover_url,
        menu_pdf_url: form.menu_pdf_url || null,
        status: form.status,
        menu_link: form.menu_link || null,
        pet_friendly: form.pet_friendly,
        payment_methods: form.payment_methods,
        is_premium: form.is_premium,
      })
      .eq("id", id)

    if (updateError) { setError(updateError.message); setSaving(false); return }

    if (horarios.length > 0) {
      await supabase.from("business_hours").delete().eq("business_id", id)
      await supabase.from("business_hours").insert(
        horarios.map(h => ({ ...h, business_id: id }))
      )
    }

    setSuccess(true)
    setSaving(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 h-32 animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors">
          <ArrowLeft size={18} className="text-stone-600" />
        </button>
        <div>
          <h1 className="text-2xl text-stone-800">Editar negocio</h1>
          <p className="text-stone-500 text-sm">{form.name}</p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl mb-6">¡Guardado correctamente!</div>}

      <div className="space-y-6">

        {/* Status */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-medium text-stone-700 mb-3">Estado</h2>
          <div className="flex gap-2">
            {["active", "pending", "suspended"].map(s => (
              <button
                key={s}
                onClick={() => handleChange("status", s)}
                className={`py-2 px-4 rounded-xl text-xs font-medium border transition-colors ${
                  form.status === s
                    ? s === "active" ? "bg-green-500 text-white border-green-500"
                    : s === "pending" ? "bg-yellow-500 text-white border-yellow-500"
                    : "bg-red-500 text-white border-red-500"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                }`}
              >
                {s === "active" ? "Activo" : s === "pending" ? "Pendiente" : "Suspendido"}
              </button>
            ))}
          </div>
        </div>

        {/* Sección */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-medium text-stone-700 mb-4">Sección</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {sections.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleChange("section", value)}
                className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                  form.section === value
                    ? "bg-primary-500 text-white border-primary-500"
                    : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {form.section === "gastronomy" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">Categoría</label>
              <div className="flex gap-2 flex-wrap">
                {gastronomyCategories.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleChange("category", value)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                      form.category === value
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {form.section !== "gastronomy" && (
  <div className="mt-4">
    <label className="block text-sm font-medium text-stone-700 mb-2">
      Subcategoría <span className="text-stone-400 font-normal">(rubro)</span>
    </label>
    {subcategoryOptions[form.section] && (
      <div className="flex gap-2 flex-wrap mb-3">
        {subcategoryOptions[form.section].map(opt => (
          <button key={opt} onClick={() => handleChange("subcategory", opt)}
            className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
              form.subcategory === opt
                ? "bg-primary-500 text-white border-primary-500"
                : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
            }`}>
            {opt}
          </button>
        ))}
      </div>
    )}
    <input type="text" value={form.subcategory}
      onChange={e => handleChange("subcategory", e.target.value)}
      placeholder="O escribí una subcategoría personalizada..."
      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
  </div>
)}
        </div>

        {/* Info básica */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Información básica</h2>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nombre *</label>
            <input type="text" value={form.name} onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
            <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)}
              rows={3} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300 resize-none" />
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Contacto y ubicación</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono</label>
              <input type="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">WhatsApp</label>
              <input type="tel" value={form.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Instagram</label>
            <input type="text" value={form.instagram} onChange={(e) => handleChange("instagram", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Pueblo</label>
            <select value={form.pueblo} onChange={(e) => handleChange("pueblo", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300 bg-white">
              <option value="">Seleccioná un pueblo</option>
              {pueblos.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Dirección</label>
            <input type="text" value={form.address} onChange={(e) => handleChange("address", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
        </div>
        <div>
         <label className="block text-sm font-medium text-stone-700 mb-1">Sitio web</label>
          <input type="url" value={form.menu_link} onChange={e => handleChange("menu_link", e.target.value)}
           placeholder="https://..."
           className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
        </div>

        {/* Servicios */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-medium text-stone-700 mb-4">Servicios</h2>
          <div className="space-y-3">
            {[
              { key: "offers_delivery", label: "Delivery" },
              { key: "offers_takeaway", label: "Take away" },
              { key: "offers_dine_in", label: "Comer en el lugar" },
              { key: "accepts_reservations", label: "Reserva de mesa" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => handleChange(key, e.target.checked)} className="w-4 h-4 accent-primary-500" />
                <span className="text-sm text-stone-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Horarios */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-medium text-stone-700 mb-4">Horarios de atención</h2>
          <HorariosEditor value={horarios} onChange={setHorarios} />
        </div>

        {/* Fotos */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Fotos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload value={form.logo_url} onChange={(url) => handleChange("logo_url", url)} folder="logos" label="Logo" />
            <ImageUpload value={form.cover_url} onChange={(url) => handleChange("cover_url", url)} folder="covers" label="Foto de portada" />
          </div>
        </div>

        {/* PDF */}
       {form.section === "gastronomy" && (
  <div className="bg-white rounded-2xl border border-stone-200 p-6">
    <h2 className="text-sm font-medium text-stone-700 mb-4">Servicios</h2>
    <div className="space-y-3">
      {[
        { key: "offers_delivery", label: "Delivery" },
        { key: "offers_takeaway", label: "Take away" },
        { key: "offers_dine_in", label: "Comer en el lugar" },
        { key: "accepts_reservations", label: "Reserva de mesa" },
      ].map(({ key, label }) => (
        <label key={key} className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
            onChange={e => handleChange(key, e.target.checked)} className="w-4 h-4 accent-primary-500" />
          <span className="text-sm text-stone-700">{label}</span>
        </label>
      ))}
    </div>
  </div>
)}

{["services", "commerce", "health", "tourism", "education"].includes(form.section) && (
  <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
    <h2 className="text-sm font-medium text-stone-700">Más información</h2>
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" checked={form.pet_friendly}
        onChange={e => handleChange("pet_friendly", e.target.checked)}
        className="w-4 h-4 accent-primary-500" />
      <div>
        <span className="text-sm text-stone-700">Pet friendly 🐾</span>
        <p className="text-xs text-stone-400">Aceptan mascotas</p>
      </div>
    </label>
    <div>
      <p className="text-sm font-medium text-stone-700 mb-3">Formas de pago</p>
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "efectivo", label: "Efectivo" },
          { value: "debito", label: "Débito" },
          { value: "credito", label: "Crédito" },
          { value: "transferencia", label: "Transferencia" },
          { value: "mercadopago", label: "Mercado Pago" },
          { value: "qr", label: "QR" },
        ].map(({ value, label }) => (
          <button key={value}
            onClick={() => {
              const current = form.payment_methods
              handleChange("payment_methods",
                current.includes(value)
                  ? current.filter((m: string) => m !== value)
                  : [...current, value]
              )
            }}
            className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
              form.payment_methods.includes(value)
                ? "bg-primary-500 text-white border-primary-500"
                : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
            }`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  </div>
)}
{/* Link al menú del día */}
{form.section === "gastronomy" && (
  <div className="bg-white rounded-2xl border border-stone-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-sm font-medium text-stone-700">Menú del día</h2>
        <p className="text-xs text-stone-400 mt-0.5">Gestioná el menú diario de este local</p>
      </div>
      <a
        href={`/admin/negocios/${id}/menu-del-dia`}
        className="bg-primary-500 hover:bg-primary-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
      >
        Gestionar menú
      </a>
    </div>
  </div>
)}
        {/* Destacado en carrusel */}
        <div className={`rounded-2xl border-2 p-4 transition-colors ${form.is_premium ? "border-yellow-400 bg-yellow-50" : "border-stone-200 bg-white"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.is_premium ? "bg-yellow-100" : "bg-stone-100"}`}>
                <Star size={18} fill={form.is_premium ? "currentColor" : "none"} className={form.is_premium ? "text-yellow-500" : "text-stone-400"} />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">Destacado en página principal</p>
                <p className="text-xs text-stone-500">Aparece en el carrusel de Destacados del Valle</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleChange("is_premium", !form.is_premium)}
              className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${form.is_premium ? "bg-yellow-400" : "bg-stone-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_premium ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
        </div>

        {/* QR Marketing */}
        <QRMarketing name={form.name} slug={form.slug} section={form.section} />

        {/* Botones */}
        <div className="flex gap-3">
          <button onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

      </div>
    </div>
  )
}