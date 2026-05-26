"use client"

import { useEffect, useState, type ElementType } from "react"
import { createClient } from "@/lib/supabase/client"
import { Globe, Phone, AtSign, MapPin, Mail, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

const SECTIONS = [
  { id: "sitio",    label: "Sitio" },
  { id: "contacto", label: "Contacto" },
  { id: "redes",    label: "Redes sociales" },
]

interface Config {
  nombre: string
  descripcion: string
  url: string
  localidad_default: string
  email: string
  whatsapp: string
  telefono: string
  direccion: string
  instagram: string
  facebook: string
  tiktok: string
}

const DEFAULTS: Config = {
  nombre: "Calamuchita App",
  descripcion: "La plataforma del Valle de Calamuchita. Gastronomía, servicios, salud, turismo y más.",
  url: "https://calamuchita.app",
  localidad_default: "Villa General Belgrano",
  email: "",
  whatsapp: "1145311047",
  telefono: "",
  direccion: "Valle de Calamuchita, Córdoba, Argentina",
  instagram: "",
  facebook: "",
  tiktok: "",
}

function Field({
  label, icon: Icon, value, onChange, placeholder, type = "text", textarea = false,
}: {
  label: string
  icon: ElementType
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  textarea?: boolean
}) {
  const base = "w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 outline-none focus:border-[#2D4530] transition-colors"
  return (
    <div>
      <label className="block text-xs font-medium text-stone-500 mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={14} className="absolute left-3 top-3 text-stone-400" />
        {textarea ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className={`${base} resize-none pt-2.5`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={base}
          />
        )}
      </div>
    </div>
  )
}

export default function AdminConfiguracion() {
  const [active, setActive] = useState("sitio")
  const [config, setConfig] = useState<Config>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")
  const [dbMissing, setDbMissing] = useState(false)

  const set = (key: keyof Config) => (value: string) =>
    setConfig(p => ({ ...p, [key]: value }))

  useEffect(() => {
    const load = async () => {
      const { data, error } = await createClient()
        .from("site_config")
        .select("*")
        .eq("id", "main")
        .single()

      if (error?.code === "42P01") {
        // Table doesn't exist
        setDbMissing(true)
      } else if (data) {
        setConfig({ ...DEFAULTS, ...data })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setStatus("idle")
    const { error } = await createClient()
      .from("site_config")
      .upsert({ id: "main", ...config }, { onConflict: "id" })

    setSaving(false)
    if (error) {
      if (error.code === "42P01") setDbMissing(true)
      setStatus("error")
    } else {
      setStatus("saved")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-stone-400" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl text-stone-800 mb-1">Configuración</h1>
        <p className="text-stone-500 text-sm">Ajustes generales de la plataforma</p>
      </div>

      {/* Alerta si falta la tabla */}
      {dbMissing && (
        <div className="mb-6 p-4 rounded-2xl border border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">Tabla <code>site_config</code> no encontrada</p>
              <p className="text-xs text-amber-700 mb-3">Ejecutá este SQL en el editor de Supabase para habilitarla:</p>
              <pre className="text-[11px] bg-amber-100 rounded-xl p-3 overflow-x-auto text-amber-900 leading-relaxed">{`create table site_config (
  id text primary key default 'main',
  nombre text, descripcion text, url text,
  localidad_default text, email text,
  whatsapp text, telefono text, direccion text,
  instagram text, facebook text, tiktok text,
  updated_at timestamptz default now()
);
insert into site_config (id) values ('main')
  on conflict do nothing;`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-stone-100 rounded-xl w-fit">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              active === s.id
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">

        {active === "sitio" && (
          <>
            <Field label="Nombre del sitio"     icon={Globe}  value={config.nombre}            onChange={set("nombre")} />
            <Field label="Descripción"          icon={Globe}  value={config.descripcion}       onChange={set("descripcion")} textarea />
            <Field label="URL del sitio"        icon={Globe}  value={config.url}               onChange={set("url")} placeholder="https://calamuchita.app" />
            <Field label="Localidad por defecto" icon={MapPin} value={config.localidad_default} onChange={set("localidad_default")} placeholder="Villa General Belgrano" />
          </>
        )}

        {active === "contacto" && (
          <>
            <Field label="Email de contacto" icon={Mail}  value={config.email}    onChange={set("email")}    placeholder="hola@calamuchita.app" />
            <Field label="WhatsApp"          icon={Phone} value={config.whatsapp} onChange={set("whatsapp")} placeholder="11XXXXXXXX" />
            <Field label="Teléfono"          icon={Phone} value={config.telefono} onChange={set("telefono")} />
            <Field label="Dirección / Región" icon={MapPin} value={config.direccion} onChange={set("direccion")} placeholder="Valle de Calamuchita, Córdoba" />
          </>
        )}

        {active === "redes" && (
          <>
            <Field label="Instagram" icon={AtSign} value={config.instagram} onChange={set("instagram")} placeholder="@calamuchita.app" />
            <Field label="Facebook"  icon={Globe}     value={config.facebook}  onChange={set("facebook")}  placeholder="facebook.com/calamuchitaapp" />
            <Field label="TikTok"    icon={Globe}     value={config.tiktok}    onChange={set("tiktok")}    placeholder="@calamuchita.app" />
          </>
        )}
      </div>

      {/* Guardar */}
      <div className="mt-4 flex items-center justify-between">
        {status === "error" && (
          <p className="text-xs text-red-500 flex items-center gap-1.5">
            <AlertCircle size={12} /> Error al guardar. Verificá que la tabla exista.
          </p>
        )}
        {status !== "error" && <span />}

        <button
          onClick={handleSave}
          disabled={saving || dbMissing}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors bg-[#2D4530] hover:bg-[#3a5a3e] text-white disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 size={14} className="animate-spin" /> Guardando…</>
          ) : status === "saved" ? (
            <><CheckCircle size={14} /> Guardado</>
          ) : (
            <><Save size={14} /> Guardar cambios</>
          )}
        </button>
      </div>
    </div>
  )
}
