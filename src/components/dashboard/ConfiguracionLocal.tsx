"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import ImageUpload from "@/components/ui/ImageUpload"
import PdfUpload from "@/components/ui/PdfUpload"
import HorariosEditor, { HorarioDay } from "@/components/ui/HorariosEditor"

const categoryOptions = [
  { value: "restaurant", label: "Restaurante" },
  { value: "cafe_bar", label: "Café / Bar" },
  { value: "viandas", label: "Viandas" },
  { value: "hamburguesas", label: "Hamburgueserías" },
  { value: "other", label: "Otro" },
]

const pueblos = [
  "Villa General Belgrano",
  "Los Reartes",
  "Santa Rosa de Calamuchita",
  "La Cumbrecita",
  "Yacanto",
  "Amboy",
  "Villa Ciudad de América",
  "Embalse",
  "Villa del Dique",
]

export default function ConfiguracionLocal() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [horarios, setHorarios] = useState<HorarioDay[]>([])

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    categories: [] as string[],
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
    logo_url: null as string | null,
    cover_url: null as string | null,
    menu_pdf_url: null as string | null,
    pet_friendly: false,
    payment_methods: [] as string[],
  })

  useEffect(() => {
    const fetchBusiness = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: business } = await supabase
        .from("businesses")
        .select("*, business_photos(*)")
        .eq("owner_id", user.id)
        .single()

      if (business) {
        setBusinessId(business.id)
        setPhotos(business.business_photos?.map((p: { url: string }) => p.url) || [])
        setForm({
          name: business.name || "",
          slug: business.slug || "",
          description: business.description || "",
          categories: business.categories || [],
          address: business.address?.split(",")[0]?.trim() || "",
          pueblo: business.address?.split(",")[1]?.trim() || "",
          phone: business.phone || "",
          whatsapp: business.whatsapp || "",
          instagram: business.instagram || "",
          menu_link: business.menu_link || "",
          offers_delivery: business.offers_delivery || false,
          offers_takeaway: business.offers_takeaway || false,
          offers_dine_in: business.offers_dine_in || false,
          accepts_reservations: business.accepts_reservations || false,
          logo_url: business.logo_url || null,
          cover_url: business.cover_url || null,
          menu_pdf_url: business.menu_pdf_url || null,
          pet_friendly: business.pet_friendly || false,
          payment_methods: business.payment_methods || [],
        })

        const { data: horariosData } = await supabase
          .from("business_hours")
          .select("*")
          .eq("business_id", business.id)
          .order("day_of_week")

        if (horariosData) setHorarios(horariosData)
      }
      setLoading(false)
    }
    fetchBusiness()
  }, [])

  const handleChange = (field: string, value: string | boolean | string[] | null) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value }
      if (field === "name" && !businessId) {
        updated.slug = (value as string)
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

  const toggleCategory = (cat: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }))
  }

  const handleAddPhoto = async (url: string | null) => {
    if (!url || !businessId) return
    const supabase = createClient()
    await supabase.from("business_photos").insert({
      business_id: businessId,
      url,
      sort_order: photos.length,
    })
    setPhotos(prev => [...prev, url])
  }

  const handleRemovePhoto = async (url: string) => {
    if (!businessId) return
    const supabase = createClient()
    await supabase.from("business_photos").delete().eq("business_id", businessId).eq("url", url)
    setPhotos(prev => prev.filter(p => p !== url))
  }

  const handleSave = async () => {
    if (!form.name) { setError("El nombre es obligatorio"); return }
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const data = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      section: "gastronomy",
      type: "gastronomy",
      category: form.categories[0] || "other",
      categories: form.categories,
      address: form.pueblo ? `${form.address}, ${form.pueblo}` : form.address || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      instagram: form.instagram || null,
      menu_link: form.menu_link || null,
      offers_delivery: form.offers_delivery,
      offers_takeaway: form.offers_takeaway,
      offers_dine_in: form.offers_dine_in,
      accepts_reservations: form.accepts_reservations,
      logo_url: form.logo_url,
      cover_url: form.cover_url,
      menu_pdf_url: form.menu_pdf_url || null,
      pet_friendly: form.pet_friendly,
      payment_methods: form.payment_methods,
      owner_id: user.id,
      status: "pending",
    }

    if (businessId) {
      const { error } = await supabase.from("businesses").update(data).eq("id", businessId)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from("businesses").insert(data)
      if (error) { setError(error.message); setSaving(false); return }
    }

    if (businessId && horarios.length > 0) {
      await supabase.from("business_hours").delete().eq("business_id", businessId)
      await supabase.from("business_hours").insert(
        horarios.map(h => ({ ...h, business_id: businessId }))
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
      <div className="mb-8">
        <h1 className="text-2xl text-stone-800 mb-1">Mi local</h1>
        <p className="text-stone-500">Completá la información de tu negocio</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl mb-6">¡Guardado correctamente!</div>}

      <div className="space-y-6">

        {/* Tipo de negocio — multiselección */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-medium text-stone-700 mb-1">Tipo de negocio</h2>
          <p className="text-xs text-stone-400 mb-4">Podés seleccionar más de uno</p>
          <div className="flex gap-2 flex-wrap">
            {categoryOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleCategory(value)}
                className={`py-2 px-4 rounded-xl text-sm font-medium border transition-colors ${
                  form.categories.includes(value)
                    ? "bg-primary-500 text-white border-primary-500"
                    : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Info básica */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Información básica</h2>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nombre del local *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej: La Casona del Valle"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Contale a los clientes sobre tu local..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300 resize-none"
            />
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Contacto y ubicación</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="3546 123456"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">WhatsApp</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                placeholder="3546 123456"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Instagram</label>
            <input
              type="text"
              value={form.instagram}
              onChange={(e) => handleChange("instagram", e.target.value)}
              placeholder="@usuario"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Pueblo</label>
            <select
              value={form.pueblo}
              onChange={(e) => handleChange("pueblo", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300 bg-white"
            >
              <option value="">Seleccioná un pueblo</option>
              {pueblos.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Dirección</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Calle y número"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </div>

        {/* Servicios */}
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
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => handleChange(key, e.target.checked)}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm text-stone-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pet friendly y formas de pago */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
          <h2 className="text-sm font-medium text-stone-700">Más información</h2>

          {/* Pet friendly */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.pet_friendly}
              onChange={(e) => handleChange("pet_friendly", e.target.checked)}
              className="w-4 h-4 accent-primary-500"
            />
            <div>
              <span className="text-sm text-stone-700">Pet friendly 🐾</span>
              <p className="text-xs text-stone-400">Aceptás mascotas en el local</p>
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
                <button
                  key={value}
                  onClick={() => {
                    const current = form.payment_methods
                    handleChange(
                      "payment_methods",
                      current.includes(value)
                        ? current.filter((p: string) => p !== value)
                        : [...current, value]
                    )
                  }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                    form.payment_methods.includes(value)
                      ? "bg-primary-500 text-white border-primary-500"
                      : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Carta */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Carta</h2>
          <p className="text-xs text-stone-400">Podés subir un PDF, pegar un link o cargar la carta directamente en la app.</p>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Link externo</label>
            <input
              type="url"
              value={form.menu_link}
              onChange={(e) => handleChange("menu_link", e.target.value)}
              placeholder="https://tu-carta.com o link de Google Drive"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">PDF de la carta</label>
            {form.menu_pdf_url ? (
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-primary-600 text-xs font-bold">PDF</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">Carta subida</p>
                    <a href={form.menu_pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500">Ver PDF</a>
                  </div>
                </div>
                <button onClick={() => handleChange("menu_pdf_url", null)} className="text-red-400 hover:text-red-500 text-sm">
                  Eliminar
                </button>
              </div>
            ) : (
              <PdfUpload onChange={(url) => handleChange("menu_pdf_url", url)} />
            )}
          </div>
        </div>

        {/* Fotos */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Fotos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload
              value={form.logo_url}
              onChange={(url) => handleChange("logo_url", url)}
              folder="logos"
              label="Logo"
            />
            <ImageUpload
              value={form.cover_url}
              onChange={(url) => handleChange("cover_url", url)}
              folder="covers"
              label="Foto de portada"
            />
          </div>

          {/* Fotos adicionales */}
          <div>
            <p className="text-sm font-medium text-stone-700 mb-3">Fotos adicionales</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {photos.map((url, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-stone-200 aspect-square">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemovePhoto(url)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              {photos.length < 8 && (
                <ImageUpload
                  value={null}
                  onChange={handleAddPhoto}
                  folder="gallery"
                  label=""
                />
              )}
            </div>
            <p className="text-xs text-stone-400">{photos.length}/8 fotos</p>
          </div>
        </div>

        {/* Horarios */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-medium text-stone-700 mb-4">Horarios de atención</h2>
          <HorariosEditor value={horarios} onChange={setHorarios} />
        </div>

        {/* Guardar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? "Guardando..." : businessId ? "Guardar cambios" : "Crear mi local"}
        </button>

      </div>
    </div>
  )
}