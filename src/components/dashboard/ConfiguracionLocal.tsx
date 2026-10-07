"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import ImageUpload from "@/components/ui/ImageUpload"
import GaleriaFotos from "@/components/ui/GaleriaFotos"
import HorariosEditor, { HorarioDay, mergeHorariosFromDB, expandHorariosForSave } from "@/components/ui/HorariosEditor"
import dynamic from "next/dynamic"
import { LatLng, PUEBLOS } from "@/lib/geocoding"

// El mapa (mapbox-gl) pesa: se carga solo en el navegador y aparte del resto del formulario
const UbicacionPicker = dynamic(() => import("@/components/dashboard/UbicacionPicker"), {
  ssr: false,
  loading: () => <div className="h-64 rounded-xl bg-stone-100 animate-pulse" />,
})

/** Separa la calle del pueblo en `address` ("calle, pueblo"), priorizando la columna `pueblo`. */
function splitAddress(address: string | null, pueblo: string | null): { street: string; pueblo: string } {
  const full = address?.trim() || ""
  if (pueblo) {
    const suffix = `, ${pueblo}`
    const street = full.toLowerCase().endsWith(suffix.toLowerCase()) ? full.slice(0, -suffix.length) : full
    return { street: street.trim(), pueblo }
  }
  const lastComma = full.lastIndexOf(",")
  if (lastComma === -1) return { street: full, pueblo: "" }
  return { street: full.slice(0, lastComma).trim(), pueblo: full.slice(lastComma + 1).trim() }
}

const categoryOptions = [
  { value: "restaurant", label: "Restaurante" },
  { value: "cafe", label: "Café" },
  { value: "bar", label: "Bar" },
  { value: "viandas", label: "Viandas" },
  { value: "panaderia", label: "Panadería" },
  { value: "pasteleria", label: "Pastelería" },
  { value: "sushi", label: "Sushi" },
  { value: "comida_para_llevar", label: "Comida para llevar" },
  { value: "pizzeria", label: "Pizzería" },
  { value: "hamburgueseria", label: "Hamburguesería" },
  { value: "other", label: "Otro" },
]

export default function ConfiguracionLocal() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [horarios, setHorarios] = useState<HorarioDay[]>([])
  const [coords, setCoords] = useState<LatLng | null>(null)

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
    facebook: "",
    offers_delivery: false,
    offers_takeaway: false,
    offers_dine_in: false,
    accepts_reservations: false,
    logo_url: null as string | null,
    cover_url: null as string | null,
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
        .select("*")
        .eq("owner_id", user.id)
        .single()

      if (business) {
        setBusinessId(business.id)
        const { street, pueblo } = splitAddress(business.address, business.pueblo)
        setForm({
          name: business.name || "",
          slug: business.slug || "",
          description: business.description || "",
          categories: business.categories || [],
          address: street,
          pueblo,
          phone: business.phone || "",
          whatsapp: business.whatsapp || "",
          instagram: business.instagram || "",
          facebook: business.facebook || "",
          offers_delivery: business.offers_delivery || false,
          offers_takeaway: business.offers_takeaway || false,
          offers_dine_in: business.offers_dine_in || false,
          accepts_reservations: business.accepts_reservations || false,
          logo_url: business.logo_url || null,
          cover_url: business.cover_url || null,
          pet_friendly: business.pet_friendly || false,
          payment_methods: business.payment_methods || [],
        })

        const { data: horariosData } = await supabase
          .from("business_hours")
          .select("*")
          .eq("business_id", business.id)
          .order("day_of_week")

        if (horariosData) setHorarios(mergeHorariosFromDB(horariosData))

        if (business.latitude != null && business.longitude != null) {
          setCoords({ lat: business.latitude, lng: business.longitude })
        }
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

  const handleSave = async () => {
    if (!form.name) { setError("El nombre es obligatorio"); return }
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const uniqueSlug = businessId ? form.slug : await generateUniqueSlug(form.slug, supabase)
    const data = {
      name: form.name,
      slug: uniqueSlug,
      description: form.description || null,
      section: "gastronomy",
      type: "gastronomy",
      category: form.categories[0] || "other",
      categories: form.categories,
      address: form.pueblo ? `${form.address}, ${form.pueblo}` : form.address || null,
      pueblo: form.pueblo || null,
      // Solo queda en null si el comercio tocó "Quitar ubicación" o nunca la cargó
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      offers_delivery: form.offers_delivery,
      offers_takeaway: form.offers_takeaway,
      offers_dine_in: form.offers_dine_in,
      accepts_reservations: form.accepts_reservations,
      logo_url: form.logo_url,
      cover_url: form.cover_url,
      pet_friendly: form.pet_friendly,
      payment_methods: form.payment_methods,
      owner_id: user.id,
    }

    if (businessId) {
      const { error } = await supabase.from("businesses").update(data).eq("id", businessId)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from("businesses").insert({ ...data, status: "pending" })
      if (error) {
        setError("Hubo un error al guardar. Intentá con un nombre diferente.")
        setSaving(false)
        return
      }
    }

    if (businessId && horarios.length > 0) {
      await supabase.from("business_hours").delete().eq("business_id", businessId)
      await supabase.from("business_hours").insert(
        expandHorariosForSave(horarios).map(h => ({ ...h, business_id: businessId }))
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-stone-700 mb-1">Facebook</label>
              <input
                type="text"
                value={form.facebook}
                onChange={(e) => handleChange("facebook", e.target.value)}
                placeholder="usuario o https://facebook.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Pueblo</label>
            <select
              value={form.pueblo}
              onChange={(e) => handleChange("pueblo", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300 bg-white"
            >
              <option value="">Seleccioná un pueblo</option>
              {/* Si el admin cargó un pueblo fuera de la lista, se conserva como opción */}
              {(form.pueblo && !PUEBLOS.includes(form.pueblo) ? [form.pueblo, ...PUEBLOS] : PUEBLOS)
                .map(p => <option key={p} value={p}>{p}</option>)}
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
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Ubicación en el mapa</label>
            <p className="text-xs text-stone-400 mb-3">
              Se usa en el mapa del Valle y en el botón &quot;Llegar&quot; de tu perfil.
            </p>
            <UbicacionPicker
              value={coords}
              onChange={setCoords}
              address={[form.address, form.pueblo].filter(Boolean).join(", ")}
            />
          </div>
        </div>

        {/* Servicios */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-medium text-stone-700 mb-4">Servicios ofrecidos</h2>
          <div className="space-y-3">
            {[
              { key: "offers_dine_in", label: "Salón" },
              { key: "offers_delivery", label: "Delivery" },
              { key: "offers_takeaway", label: "Take away" },
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


        {/* Fotos */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Logo y portada</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload
              value={form.logo_url}
              onChange={(url) => handleChange("logo_url", url)}
              folder="logos"
              label="Logo"
              pathPrefix={businessId}
              maxWidth={800}
            />
            <ImageUpload
              value={form.cover_url}
              onChange={(url) => handleChange("cover_url", url)}
              folder="covers"
              label="Foto de portada"
              pathPrefix={businessId}
            />
          </div>
          <p className="text-xs text-stone-400">El logo y la portada se guardan con el botón &quot;Guardar cambios&quot;.</p>
        </div>

        {/* Galería */}
        {businessId && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-sm font-medium text-stone-700 mb-1">Galería del local</h2>
            <p className="text-xs text-stone-400 mb-4">
              Hasta 8 fotos: salón, fachada, platos, lo que quieras mostrar. Se ven en tu perfil como carrusel.
            </p>
            <GaleriaFotos businessId={businessId} />
          </div>
        )}

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