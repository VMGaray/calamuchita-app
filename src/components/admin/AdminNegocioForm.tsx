"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BusinessSection, BusinessCategory } from "@/types/database"
import ImageUpload from "@/components/ui/ImageUpload"

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
  { value: "cafe",       label: "Café" },
  { value: "viandas",    label: "Viandas" },
  { value: "bar",        label: "Bar" },
  { value: "other",      label: "Otro" },
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

export default function AdminNegocioForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    offers_delivery: false,
    offers_takeaway: false,
    offers_dine_in: false,
    logo_url: null as string | null,
    cover_url: null as string | null,
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

  const handleSubmit = async () => {
    if (!form.name || !form.section) {
      setError("El nombre y la sección son obligatorios")
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error } = await supabase.from("businesses").insert({
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      description: form.description || null,
      section: form.section,
      type: "directory",
      category: form.section === "gastronomy" ? form.category : null,
      subcategory: form.subcategory || null,
      address: form.pueblo ? `${form.address}, ${form.pueblo}` : form.address || null,
      phone: form.phone || null,
      instagram: form.instagram || null,
      offers_delivery: form.offers_delivery,
      offers_takeaway: form.offers_takeaway,
      offers_dine_in: form.offers_dine_in,
      status: "active",
      is_open: false,
      owner_id: null,
      logo_url: form.logo_url,
      cover_url: form.cover_url,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/admin/negocios")
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl text-stone-800 mb-1">Nuevo negocio</h1>
        <p className="text-stone-500">Completá la información del negocio</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">

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
                    ? "bg-primary-500 text-primary-100 border-primary-500"
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
                        ? "bg-primary-500 text-primary-100 border-primary-500"
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
                Subcategoría <span className="text-stone-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={form.subcategory}
                onChange={(e) => handleChange("subcategory", e.target.value)}
                placeholder="Ej: Plomería, Electricidad..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          )}
        </div>

        {/* Información básica */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="text-sm font-medium text-stone-700">Información básica</h2>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nombre del negocio"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Slug <span className="text-stone-400 font-normal">(URL)</span>
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="nombre-del-negocio"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-sm outline-none focus:ring-2 focus:ring-primary-300 bg-stone-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Breve descripción del negocio..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300 resize-none"
            />
          </div>
        </div>

        {/* Contacto y ubicación */}
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
              <label className="block text-sm font-medium text-stone-700 mb-1">Instagram</label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => handleChange("instagram", e.target.value)}
                placeholder="@usuario"
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
              {pueblos.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
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

        {/* Opciones para gastronomía */}
        {form.section === "gastronomy" && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-sm font-medium text-stone-700 mb-4">Servicios ofrecidos</h2>
            <div className="space-y-3">
              {[
                { key: "offers_delivery", label: "Delivery" },
                { key: "offers_takeaway", label: "Take away" },
                { key: "offers_dine_in", label: "Salón / comer en el lugar" },
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
        )}
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
</div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-primary-100 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar negocio"}
          </button>
        </div>

      </div>
    </div>
  )
}