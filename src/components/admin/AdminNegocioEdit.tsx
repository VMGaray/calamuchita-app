"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BusinessSection, BusinessCategory } from "@/types/database"
import { MASTER_CATEGORIES } from "@/lib/constants/categories"
import ImageUpload from "@/components/ui/ImageUpload"
import PdfUpload from "@/components/ui/PdfUpload"
import { isValidYoutubeUrl } from "@/lib/utils/youtube"
import HorariosEditor, { HorarioDay, expandHorariosForSave, mergeHorariosFromDB, defaultHorarios } from "@/components/ui/HorariosEditor"
import { ArrowLeft, Star } from "lucide-react"
import QRMarketing from "@/components/admin/QRMarketing"

const sections: { value: BusinessSection; label: string }[] = [
  { value: "gastronomy", label: "Gastronomía" },
  { value: "services",   label: "Servicios" },
  { value: "health",     label: "Salud" },
  { value: "education",  label: "Educación" },
  { value: "sports",     label: "Deportes" },
  { value: "tourism",    label: "Turismo" },
  { value: "commerce",   label: "Comercios" },
  { value: "events",     label: "Eventos" },
  { value: "info",       label: "Info útil" },
]

const gastronomyCategories: { value: BusinessCategory; label: string }[] = [
  { value: "restaurant", label: "Restaurante" },
  { value: "cafe_bar",   label: "Bar/Café" },
  { value: "viandas",    label: "Viandas" },
  { value: "panaderia",  label: "Panadería" },
  { value: "sushi",      label: "Sushi" },
  { value: "other",      label: "Otro" },
]
const PROFESIONALES_OPTIONS = [
  "Contador", "Abogado", "Geólogo", "Arquitecto",
  "Desarrollador/a web", "Ingeniero", "Diseño gráfico", "Fotógrafo", "Traductor",
]

const subcategoryOptions: Record<string, string[]> = {
  services:  MASTER_CATEGORIES.services.subcategories.map(s => s.label),
  commerce:  MASTER_CATEGORIES.commerce.subcategories.map(s => s.label),
  health:    MASTER_CATEGORIES.health.subcategories.map(s => s.label),
  education: MASTER_CATEGORIES.education.subcategories.map(s => s.label),
  tourism:   MASTER_CATEGORIES.tourism.subcategories.map(s => s.label),
  sports:    MASTER_CATEGORIES.sports.subcategories.map(s => s.label),
  events:    ["Culturales", "Deportivos", "Festivales", "Gastronómicos", "Infantiles", "Música", "Otro"],
  info:      ["Cooperativas", "Emergencias", "Farmacias", "Municipalidad", "Transporte", "Turismo oficial", "Otro"],
}

const pueblos = [
  "Villa General Belgrano", "Los Reartes", "Santa Rosa de Calamuchita",
  "La Cumbrecita", "Yacanto", "Amboy", "Villa Ciudad de América",
  "Embalse", "Villa del Dique", "Villa Rumipal", "Villa Alpina",
  "Villa Berna", "Villa Ciudad Parque", "La Cruz", "Intiyaco",
  "Potrero de Garay", "Villa Quillinzo",
]

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  if (!token || !address.trim()) return null
  try {
    const fullQuery = `${address}, Córdoba, Argentina`
    const bbox = "-65.5,-33.2,-63.5,-31.4"
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullQuery)}.json?access_token=${token}&country=AR&limit=1&proximity=-64.5622,-31.9791&bbox=${bbox}`
    )
    if (!res.ok) return null
    const data = await res.json()
    const feature = data.features?.[0]
    if (!feature) return null
    const [lng, lat] = feature.center
    return { lat, lng }
  } catch {
    return null
  }
}

function parseManualCoords(input: string): { lat: number; lng: number } | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const urlMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (urlMatch) {
    const lat = parseFloat(urlMatch[1])
    const lng = parseFloat(urlMatch[2])
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
  }
  const parts = trimmed.split(/[,\s]+/).filter(Boolean)
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0])
    const lng = parseFloat(parts[1])
    if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng }
    }
  }
  return null
}

interface Props { id: string }

export default function AdminNegocioEdit({ id }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [horarios, setHorarios] = useState<HorarioDay[]>(defaultHorarios)
  const [galleryPhotos, setGalleryPhotos] = useState<(string | null)[]>([null, null, null])
  const [branches, setBranches] = useState<Array<{ address: string; pueblo: string }>>([])
  const [professionalType, setProfessionalType] = useState("")
  const [coordsInput, setCoordsInput] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

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
    facebook: "",
    whatsapp: "",
    offers_delivery: false,
    offers_takeaway: false,
    offers_dine_in: false,
    accepts_reservations: false,
    logo_url: null as string | null,
    cover_url: null as string | null,
    menu_pdf_url: null as string | null,
    video_url: "",
    status: "active",
    menu_link: "",
    pet_friendly: false,
    payment_methods: [] as string[],
    is_premium: false,
    has_24h_guard: false,
    appointment_system: "",
    group_name: "",
    group_id: "",
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
          pueblo: business.pueblo || addressParts[1]?.trim() || "",
          phone: business.phone || "",
          instagram: business.instagram || "",
          facebook: business.facebook || "",
          whatsapp: business.whatsapp || "",
          offers_delivery: business.offers_delivery || false,
          offers_takeaway: business.offers_takeaway || false,
          offers_dine_in: business.offers_dine_in || false,
          accepts_reservations: business.accepts_reservations || false,
          logo_url: business.logo_url || null,
          cover_url: business.cover_url || null,
          menu_pdf_url: business.menu_pdf_url || null,
          video_url: business.video_url || "",
          status: business.status || "active",
          menu_link: business.menu_link || "",
          pet_friendly: business.pet_friendly || false,
          payment_methods: business.payment_methods || [],
          is_premium: business.is_premium || false,
          has_24h_guard: business.has_24h_guard || false,
          appointment_system: business.appointment_system || "",
          group_name: business.group_name || "",
          group_id: business.group_id || "",
        })
        setBranches(business.branches || [])
        const cats: string[] = business.categories || []
        const profType = cats.find((c: string) => PROFESIONALES_OPTIONS.includes(c)) || ""
        setProfessionalType(profType)
        const nonProfCats = cats.filter((c: string) => !PROFESIONALES_OPTIONS.includes(c))
        setSelectedCategories(nonProfCats.length > 0 ? nonProfCats : (business.subcategory ? [business.subcategory] : []))
        if (business.latitude && business.longitude) {
          setCoordsInput(`${business.latitude}, ${business.longitude}`)
        }
      }

      const { data: horariosData } = await supabase
        .from("business_hours")
        .select("*")
        .eq("business_id", id)
        .order("day_of_week")

      if (horariosData) setHorarios(mergeHorariosFromDB(horariosData))

      const { data: photosData } = await supabase
        .from("business_photos")
        .select("url")
        .eq("business_id", id)

      if (photosData) {
        const urls = photosData.map((p: any) => p.url as string)
        setGalleryPhotos([urls[0] || null, urls[1] || null, urls[2] || null])
      }

      setLoading(false)
    }
    fetch()
  }, [id])

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const handleSave = async () => {
    if (!form.name) { setError("El nombre es obligatorio"); return }
    setSaving(true)
    setError(null)

    const supabase = createClient()

    const fullAddress = form.pueblo ? `${form.address}, ${form.pueblo}` : form.address
    const manualCoords = parseManualCoords(coordsInput)
    const coords = manualCoords ?? (fullAddress ? await geocodeAddress(fullAddress) : null)

    const hasProfesionales = form.section === "services" && selectedCategories.includes("Profesionales")
    const updatedCategories = hasProfesionales && professionalType
      ? [...new Set([...selectedCategories, professionalType])]
      : selectedCategories.filter(Boolean)

    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        section: form.section,
        category: form.section === "gastronomy" ? form.category : null,
        subcategory: updatedCategories[0] || null,
        categories: updatedCategories,
        address: fullAddress || null,
        pueblo: form.pueblo || null,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        phone: form.phone || null,
        instagram: form.instagram || null,
        facebook: form.facebook || null,
        whatsapp: form.whatsapp || null,
        offers_delivery: form.offers_delivery,
        offers_takeaway: form.offers_takeaway,
        offers_dine_in: form.offers_dine_in,
        accepts_reservations: form.accepts_reservations,
        logo_url: form.logo_url,
        cover_url: form.cover_url,
        menu_pdf_url: form.menu_pdf_url || null,
        video_url: form.video_url || null,
        status: form.status,
        menu_link: form.menu_link || null,
        pet_friendly: form.pet_friendly,
        payment_methods: form.payment_methods,
        is_premium: form.is_premium,
        has_24h_guard: form.section === "health" ? form.has_24h_guard : false,
        appointment_system: form.section === "health" ? form.appointment_system || null : null,
        group_name: form.group_name || null,
        group_id: form.group_id || null,
      })
      .eq("id", id)

    if (updateError) { setError(updateError.message); setSaving(false); return }

    if (horarios.length > 0) {
      await supabase.from("business_hours").delete().eq("business_id", id)
      await supabase.from("business_hours").insert(
        expandHorariosForSave(horarios).map(h => ({ ...h, business_id: id }))
      )
    }

    // Guardar sucursales (requiere columna `branches jsonb default '[]'` en businesses)
    await supabase.from("businesses").update({ branches }).eq("id", id)

    const validPhotos = galleryPhotos.filter(Boolean) as string[]
    await supabase.from("business_photos").delete().eq("business_id", id)
    if (validPhotos.length > 0) {
      await supabase.from("business_photos").insert(
        validPhotos.map(url => ({ business_id: id, url }))
      )
    }

    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 4000)
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
        <button onClick={() => router.push("/dashboard")} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors">
          <ArrowLeft size={18} className="text-stone-600" />
        </button>
        <div>
          <h1 className="text-2xl text-stone-800">Editar negocio</h1>
          <p className="text-stone-500 text-sm">{form.name}</p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl mb-6">¡Guardado correctamente!</div>}

      {/* Toast fijo — visible sin importar el scroll */}
      {(success || error) && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl pointer-events-none ${
          success ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {success ? "¡Guardado correctamente!" : error}
        </div>
      )}

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
    <label className="block text-sm font-medium text-stone-700 mb-1">
      Rubros <span className="text-stone-400 font-normal">(podés elegir más de uno)</span>
    </label>
    {subcategoryOptions[form.section] && (
      <div className="flex gap-2 flex-wrap mt-2 mb-3">
        {subcategoryOptions[form.section].map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggleCategory(opt)}
            className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
              selectedCategories.includes(opt)
                ? "bg-primary-500 text-white border-primary-500"
                : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    )}
    {form.section === "services" && selectedCategories.includes("Profesionales") && (
      <div className="mt-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
        <label className="block text-xs font-semibold text-violet-700 mb-2">Tipo de profesional</label>
        <div className="flex gap-2 flex-wrap">
          {PROFESIONALES_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setProfessionalType(prev => prev === opt ? "" : opt)}
              className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                professionalType === opt
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-stone-600 border-stone-200 hover:border-violet-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    )}
    <input
      type="text"
      placeholder="Escribí un rubro personalizado y presioná Enter…"
      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
      onKeyDown={e => {
        if (e.key === "Enter" && e.currentTarget.value.trim()) {
          toggleCategory(e.currentTarget.value.trim())
          e.currentTarget.value = ""
          e.preventDefault()
        }
      }}
    />
    {selectedCategories.length > 0 && (
      <div className="flex gap-2 flex-wrap mt-2.5">
        {selectedCategories.map(cat => (
          <span
            key={cat}
            className="flex items-center gap-1 py-1 px-2.5 rounded-full text-xs bg-primary-50 text-primary-600 border border-primary-100"
          >
            {cat}
            <button
              type="button"
              onClick={() => toggleCategory(cat)}
              className="hover:text-red-400 ml-0.5 leading-none font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    )}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Instagram</label>
              <input type="text" value={form.instagram} onChange={(e) => handleChange("instagram", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Facebook</label>
              <input type="text" value={form.facebook} onChange={(e) => handleChange("facebook", e.target.value)}
                placeholder="usuario o https://facebook.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
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

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Coordenadas <span className="text-stone-400 font-normal">(tiene prioridad sobre la dirección)</span>
            </label>
            <input
              type="text"
              value={coordsInput}
              onChange={e => setCoordsInput(e.target.value)}
              placeholder="-31.9809, -64.5594  o pegá el enlace de Google Maps"
              className={`w-full px-4 py-2.5 rounded-xl border text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300 ${
                coordsInput && !parseManualCoords(coordsInput)
                  ? "border-red-300 focus:ring-red-200"
                  : coordsInput && parseManualCoords(coordsInput)
                  ? "border-green-300 focus:ring-green-200"
                  : "border-stone-200"
              }`}
            />
            {coordsInput && parseManualCoords(coordsInput) && (
              <p className="text-xs text-green-600 mt-1">
                lat {parseManualCoords(coordsInput)!.lat.toFixed(6)}, lng {parseManualCoords(coordsInput)!.lng.toFixed(6)}
              </p>
            )}
            {coordsInput && !parseManualCoords(coordsInput) && (
              <p className="text-xs text-red-500 mt-1">Formato no reconocido. Usá "-31.9809, -64.5594" o el enlace de Google Maps.</p>
            )}
            <p className="text-xs text-stone-400 mt-1">
              En Google Maps: clic derecho en el punto → copiar las coordenadas que aparecen.
            </p>
          </div>

          {/* Sucursales */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-stone-700">Sucursales <span className="text-stone-400 font-normal">(domicilios adicionales)</span></label>
              <button
                type="button"
                onClick={() => setBranches(prev => [...prev, { address: "", pueblo: "" }])}
                className="text-xs font-medium px-3 py-1.5 rounded-xl border border-primary-300 text-primary-600 hover:bg-primary-50 transition-colors"
              >
                + Agregar sucursal
              </button>
            </div>
            {branches.length === 0 && (
              <p className="text-xs text-stone-400">Sin sucursales — una sola dirección.</p>
            )}
            <div className="space-y-3">
              {branches.map((branch, i) => (
                <div key={i} className="p-3 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600">Sucursal {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => setBranches(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-xs text-red-400 hover:text-red-500"
                    >
                      Eliminar
                    </button>
                  </div>
                  <select
                    value={branch.pueblo}
                    onChange={e => setBranches(prev => prev.map((b, idx) => idx === i ? { ...b, pueblo: e.target.value } : b))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                  >
                    <option value="">Seleccioná un pueblo</option>
                    {pueblos.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input
                    type="text"
                    value={branch.address}
                    onChange={e => setBranches(prev => prev.map((b, idx) => idx === i ? { ...b, address: e.target.value } : b))}
                    placeholder="Calle y número"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
              ))}
            </div>
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
              { key: "offers_dine_in", label: "Salón" },
              { key: "offers_delivery", label: "Delivery" },
              { key: "offers_takeaway", label: "Take away" },
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
          <div>
            <p className="text-sm font-medium text-stone-700 mb-1">Fotos adicionales <span className="text-stone-400 font-normal">(carrusel en el detalle — hasta 3)</span></p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              {[0, 1, 2].map(i => (
                <ImageUpload
                  key={i}
                  value={galleryPhotos[i]}
                  onChange={url => {
                    const next = [...galleryPhotos]
                    next[i] = url
                    setGalleryPhotos(next)
                  }}
                  folder="gallery"
                  label={`Foto ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Video de YouTube <span className="text-stone-400 font-normal">(opcional)</span>
            </label>
            <input
              type="url"
              value={form.video_url}
              onChange={e => handleChange("video_url", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            {form.video_url && !isValidYoutubeUrl(form.video_url) && (
              <p className="text-xs text-red-500 mt-1">El link no parece ser un video de YouTube válido.</p>
            )}
            {form.video_url && isValidYoutubeUrl(form.video_url) && (
              <p className="text-xs text-green-600 mt-1">✓ Link de YouTube válido</p>
            )}
          </div>
        </div>

        {/* Servicios ofrecidos — gastronomía */}
        {form.section === "gastronomy" && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-sm font-medium text-stone-700 mb-4">Servicios</h2>
            <div className="space-y-3">
              {[
                { key: "offers_dine_in", label: "Salón" },
                { key: "offers_delivery", label: "Delivery" },
                { key: "offers_takeaway", label: "Take away" },
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

        {/* Carta en PDF — solo gastronomía */}
        {form.section === "gastronomy" && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <h2 className="text-sm font-medium text-stone-700">Carta en PDF</h2>
            {form.menu_pdf_url ? (
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-primary-600 text-xs font-bold">PDF</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">Carta subida</p>
                    <a href={form.menu_pdf_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary-500">Ver PDF</a>
                  </div>
                </div>
                <button onClick={() => handleChange("menu_pdf_url", null)}
                  className="text-red-400 hover:text-red-500 text-sm">Eliminar</button>
              </div>
            ) : (
              <PdfUpload onChange={url => handleChange("menu_pdf_url", url)} />
            )}
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

        {/* Salud — guardia y turnos */}
        {form.section === "health" && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <h2 className="text-sm font-medium text-stone-700">Guardia y turnos</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.has_24h_guard}
                onChange={e => handleChange("has_24h_guard", e.target.checked)}
                className="w-4 h-4 accent-primary-500" />
              <div>
                <span className="text-sm text-stone-700">Guardia de 24 hs</span>
                <p className="text-xs text-stone-400">Atención de emergencias las 24 horas</p>
              </div>
            </label>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Sistema de turnos</label>
              <input type="text" value={form.appointment_system}
                onChange={e => handleChange("appointment_system", e.target.value)}
                placeholder="Ej: Cada profesional administra su agenda"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <p className="text-xs text-stone-400 pt-2 border-t border-stone-100">
              Cada médico/a o especialista de este lugar tiene su propia ficha (sección Salud). Para
              vincularlos entre sí, completá "Grupo profesional" más abajo con el mismo ID en todos.
            </p>
          </div>
        )}

        {/* Grupo profesional */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Grupo profesional (opcional)</h2>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nombre del grupo</label>
            <input type="text" value={form.group_name} onChange={e => handleChange("group_name", e.target.value)}
              placeholder="ej: Grupo Vértice"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">ID del grupo</label>
            <div className="flex gap-2">
              <input type="text" value={form.group_id} onChange={e => handleChange("group_id", e.target.value)}
                placeholder="UUID compartido entre los miembros del grupo"
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
              <button type="button" onClick={() => handleChange("group_id", crypto.randomUUID())}
                className="px-3 py-2.5 rounded-xl border border-primary-300 text-primary-600 text-xs font-medium hover:bg-primary-50 transition-colors whitespace-nowrap">
                Generar nuevo ID
              </button>
            </div>
          </div>
          <p className="text-xs text-stone-400">
            Si este profesional forma parte de un espacio compartido con otros colegas, completá estos campos. Usá el mismo ID de grupo en todos los miembros del grupo.
          </p>
        </div>

        {/* QR Marketing */}
        <QRMarketing name={form.name} slug={form.slug} section={form.section} />

        {/* Botones */}
        <div className="flex gap-3">
          <button onClick={() => router.push("/dashboard")}
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