"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BusinessSection, BusinessCategory } from "@/types/database"
import { MASTER_CATEGORIES } from "@/lib/constants/categories"
import ImageUpload from "@/components/ui/ImageUpload"
import PdfUpload from "@/components/ui/PdfUpload"
import HorariosEditor, { HorarioDay } from "@/components/ui/HorariosEditor"

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

const COBERTURAS = [
  "APROSS", "IOMA", "OSDE", "PAMI", "Swiss Medical",
  "Medifé", "Galeno", "Sancor Salud", "Omint", "Particular",
]

const ESPECIALIDADES_SUGERIDAS = [
  "Cardiología", "Clínica médica", "Dermatología", "Ginecología",
  "Kinesiología", "Neurología", "Nutrición", "Odontología",
  "Oftalmología", "Pediatría", "Psicología", "Traumatología",
]

const pueblos = [
  "Villa General Belgrano", "Los Reartes", "Santa Rosa de Calamuchita",
  "La Cumbrecita", "Yacanto", "Amboy", "Villa Ciudad de América",
  "Embalse", "Villa del Dique", "Villa Rumipal", "Villa Alpina",
  "Villa Berna", "Villa Ciudad Parque", "La Cruz", "Intiyaco",
  "Potrero de Garay", "Villa Quillinzo",
]

const generateUniqueSlug = async (baseSlug: string, supabase: any): Promise<string> => {
  let slug = baseSlug
  let counter = 1
  while (true) {
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()
    if (!data) return slug
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

export default function AdminNegocioForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [horarios, setHorarios] = useState<HorarioDay[]>([])
  const [galleryPhotos, setGalleryPhotos] = useState<(string | null)[]>([null, null, null])

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
    whatsapp: "",
    instagram: "",
    menu_link: "",
    offers_delivery: false,
    offers_takeaway: false,
    offers_dine_in: false,
    accepts_reservations: false,
    pet_friendly: false,
    payment_methods: [] as string[],
    logo_url: null as string | null,
    cover_url: null as string | null,
    menu_pdf_url: null as string | null,
    doctor_name: "",
    medical_specialties: [] as string[],
    health_coverages: [] as string[],
  })

  const handleChange = (field: string, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value }
      if (field === "name") {
        updated.slug = value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim()
      }
      return updated
    })
  }

  const togglePayment = (method: string) => {
    setForm(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method]
    }))
  }

  const toggleHealthArray = (field: "medical_specialties" | "health_coverages", value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.section) {
      setError("El nombre y la sección son obligatorios")
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const baseSlug = form.slug || form.name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").trim()

    const uniqueSlug = await generateUniqueSlug(baseSlug, supabase)

    const { error: insertError } = await supabase.from("businesses").insert({
      name: form.name,
      slug: uniqueSlug,
      description: form.description || null,
      section: form.section,
      type: form.section === "gastronomy" ? "gastronomy" : "directory",
      category: form.section === "gastronomy" ? form.category : null,
      subcategory: form.subcategory || null,
      address: form.pueblo ? `${form.address}, ${form.pueblo}` : form.address || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      instagram: form.instagram || null,
      menu_link: form.menu_link || null,
      offers_delivery: form.offers_delivery,
      offers_takeaway: form.offers_takeaway,
      offers_dine_in: form.offers_dine_in,
      accepts_reservations: form.accepts_reservations,
      pet_friendly: form.pet_friendly,
      payment_methods: form.payment_methods,
      status: "active",
      is_open: false,
      owner_id: null,
      logo_url: form.logo_url,
      cover_url: form.cover_url,
      menu_pdf_url: form.menu_pdf_url,
      doctor_name: form.section === "health" ? form.doctor_name || null : null,
      medical_specialties: form.section === "health" ? form.medical_specialties : [],
      health_coverages: form.section === "health" ? form.health_coverages : [],
    })

    if (insertError) {
      setError("Error al guardar. Intentá de nuevo.")
      setLoading(false)
      return
    }

    const validPhotos = galleryPhotos.filter(Boolean) as string[]
    if (horarios.length > 0 || validPhotos.length > 0) {
      const { data: saved } = await supabase
        .from("businesses").select("id").eq("slug", uniqueSlug).single()
      if (saved) {
        if (horarios.length > 0) {
          await supabase.from("business_hours").insert(
            horarios.map(h => ({ ...h, business_id: saved.id }))
          )
        }
        if (validPhotos.length > 0) {
          await supabase.from("business_photos").insert(
            validPhotos.map(url => ({ business_id: saved.id, url }))
          )
        }
      }
    }

    router.push("/admin/negocios")
  }

  const isGastronomy = form.section === "gastronomy"
  const isHealth = form.section === "health"
  const isServicesOrCommerce = ["services", "commerce", "health", "tourism", "education"].includes(form.section)

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl text-stone-800 mb-1">Nuevo negocio</h1>
        <p className="text-stone-500">Completá la información del negocio</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
      )}

      <div className="space-y-6">

        {/* Sección */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-medium text-stone-700 mb-4">Sección</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {sections.map(({ value, label }) => (
              <button key={value} onClick={() => handleChange("section", value)}
                className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                  form.section === value
                    ? "bg-primary-500 text-white border-primary-500"
                    : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Categoría gastronomía */}
          {isGastronomy && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">Categoría</label>
              <div className="flex gap-2 flex-wrap">
                {gastronomyCategories.map(({ value, label }) => (
                  <button key={value} onClick={() => handleChange("category", value)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                      form.category === value
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subcategoría con sugerencias */}
          {!isGastronomy && (
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
              <input
                type="text"
                value={form.subcategory}
                onChange={e => handleChange("subcategory", e.target.value)}
                placeholder="O escribí una subcategoría personalizada..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          )}
        </div>

        {/* Info básica */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Información básica</h2>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nombre *</label>
            <input type="text" value={form.name} onChange={e => handleChange("name", e.target.value)}
              placeholder="Nombre del negocio"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Slug <span className="text-stone-400 font-normal">(URL — se genera automáticamente)</span>
            </label>
            <input type="text" value={form.slug} onChange={e => handleChange("slug", e.target.value)}
              placeholder="nombre-del-negocio"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-sm outline-none focus:ring-2 focus:ring-primary-300 bg-stone-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => handleChange("description", e.target.value)}
              placeholder="Breve descripción del negocio..." rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300 resize-none" />
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Contacto y ubicación</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono</label>
              <input type="tel" value={form.phone} onChange={e => handleChange("phone", e.target.value)}
                placeholder="3546 123456"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">WhatsApp</label>
              <input type="tel" value={form.whatsapp} onChange={e => handleChange("whatsapp", e.target.value)}
                placeholder="3546 123456"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Instagram</label>
              <input type="text" value={form.instagram} onChange={e => handleChange("instagram", e.target.value)}
                placeholder="@usuario"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Sitio web</label>
              <input type="url" value={form.menu_link} onChange={e => handleChange("menu_link", e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Pueblo</label>
            <select value={form.pueblo} onChange={e => handleChange("pueblo", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300 bg-white">
              <option value="">Seleccioná un pueblo</option>
              {pueblos.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Dirección</label>
            <input type="text" value={form.address} onChange={e => handleChange("address", e.target.value)}
              placeholder="Calle y número"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
        </div>

        {/* Servicios ofrecidos — gastronomía */}
        {isGastronomy && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-sm font-medium text-stone-700 mb-4">Servicios ofrecidos</h2>
            <div className="space-y-3">
              {[
                { key: "offers_delivery", label: "Delivery" },
                { key: "offers_takeaway", label: "Take away" },
                { key: "offers_dine_in", label: "Comer en el lugar" },
                { key: "accepts_reservations", label: "Reserva de mesa" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                    onChange={e => handleChange(key, e.target.checked)}
                    className="w-4 h-4 accent-primary-500" />
                  <span className="text-sm text-stone-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Info extra — servicios y comercios */}
        {isServicesOrCommerce && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            <h2 className="text-sm font-medium text-stone-700">Más información</h2>

            {/* Pet friendly */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.pet_friendly}
                onChange={e => handleChange("pet_friendly", e.target.checked)}
                className="w-4 h-4 accent-primary-500" />
              <div>
                <span className="text-sm text-stone-700">Pet friendly 🐾</span>
                <p className="text-xs text-stone-400">Aceptan mascotas</p>
              </div>
            </label>

            {/* Formas de pago */}
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
                  <button key={value} onClick={() => togglePayment(value)}
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

        {/* Salud — campos específicos */}
        {isHealth && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            <h2 className="text-sm font-medium text-stone-700">Información de salud</h2>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Nombre del profesional <span className="text-stone-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={form.doctor_name}
                onChange={e => handleChange("doctor_name", e.target.value)}
                placeholder="Dr./Dra. Nombre Apellido"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Especialidades</label>
              <div className="flex gap-2 flex-wrap mb-3">
                {ESPECIALIDADES_SUGERIDAS.map(esp => (
                  <button
                    key={esp}
                    onClick={() => toggleHealthArray("medical_specialties", esp)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                      form.medical_specialties.includes(esp)
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
                    }`}
                  >
                    {esp}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Escribí una especialidad y presioná Enter..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
                onKeyDown={e => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    toggleHealthArray("medical_specialties", e.currentTarget.value.trim())
                    e.currentTarget.value = ""
                    e.preventDefault()
                  }
                }}
              />
              {form.medical_specialties.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {form.medical_specialties.map(esp => (
                    <span key={esp} className="flex items-center gap-1 py-1 px-2.5 rounded-full text-xs bg-primary-50 text-primary-600 border border-primary-100">
                      {esp}
                      <button onClick={() => toggleHealthArray("medical_specialties", esp)} className="hover:text-red-400 ml-0.5 leading-none">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Coberturas aceptadas</label>
              <div className="flex gap-2 flex-wrap">
                {COBERTURAS.map(cob => (
                  <button
                    key={cob}
                    onClick={() => toggleHealthArray("health_coverages", cob)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                      form.health_coverages.includes(cob)
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
                    }`}
                  >
                    {cob}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Horarios */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-medium text-stone-700 mb-4">Horarios de atención</h2>
          <HorariosEditor value={horarios} onChange={setHorarios} />
        </div>

        {/* Fotos */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Fotos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload value={form.logo_url} onChange={url => handleChange("logo_url", url)}
              folder="logos" label="Logo" />
            <ImageUpload value={form.cover_url} onChange={url => handleChange("cover_url", url)}
              folder="covers" label="Foto de portada" />
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
        </div>

        {/* PDF carta — solo gastronomía */}
        {isGastronomy && (
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

        {/* Botones */}
        <div className="flex gap-3">
          <button onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-sm font-medium transition-colors disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar negocio"}
          </button>
        </div>

      </div>
    </div>
  )
}