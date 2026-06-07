"use client"

import Link from "next/link"
import Image from "next/image"
import AnimateIn from "@/components/ui/AnimateIn"
import { Search, MapPin } from "lucide-react"
import { normalizeArgPhone } from "@/lib/phone"

const sectionLabels: Record<string, string> = {
  gastronomy: "Gastronomía",
  services: "Servicios",
  health: "Salud",
  education: "Educación",
  tourism: "Turismo",
  commerce: "Comercios",
  events: "Eventos",
  info: "Info útil",
}

const sectionColors: Record<string, string> = {
  gastronomy: "bg-brand-earth/10 text-brand-earth",
  services:   "bg-brand-slate/10 text-brand-slate",
  health:     "bg-brand-pine/10 text-brand-pine",
  education:  "bg-brand-slate/10 text-brand-slate",
  tourism:    "bg-brand-pine/10 text-brand-pine",
  commerce:   "bg-brand-pine/10 text-brand-pine",
  events:     "bg-brand-earth/10 text-brand-earth",
  info:       "bg-brand-sand/50 text-brand-charcoal",
}

type BusinessHour = {
  day_of_week: number
  opens_at: string
  closes_at: string
  is_closed: boolean
}

function calcIsOpen(hours: BusinessHour[], fallback: boolean): boolean {
  if (!hours || hours.length === 0) return fallback
  const now = new Date()
  const day = now.getDay()
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  const today = hours.find(h => h.day_of_week === day)
  if (!today || today.is_closed) return false
  return hhmm >= today.opens_at.slice(0, 5) && hhmm <= today.closes_at.slice(0, 5)
}

interface Business {
  id: string
  name: string
  slug: string
  section: string
  subcategory: string | null
  address: string | null
  logo_url: string | null
  cover_url: string | null
  description: string | null
  is_open: boolean
  phone: string | null
  whatsapp: string | null
  business_hours: BusinessHour[]
}

interface Props {
  query: string
  results: Business[]
}

export default function BuscarResults({ query, results }: Props) {
  const getDetailUrl = (business: Business) => {
    if (business.section === "gastronomy") return `/negocios/${business.slug}`
    return `/directorio/${business.section}/${business.slug}`
  }

  return (
    <div className="min-h-screen bg-brand-sand">

      {/* Resultados */}
      <div className="px-4 py-8 max-w-4xl mx-auto">

        {/* Resultados */}
        {query && (
          <p className="text-sm mb-6" style={{ color: "rgba(45,69,48,0.55)" }}>
            {results.length > 0
              ? `${results.length} resultado${results.length !== 1 ? "s" : ""} para "${query}"`
              : `Sin resultados para "${query}"`
            }
          </p>
        )}

        {/* Sin resultados */}
        {query && results.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <Search size={40} className="mx-auto text-stone-300 mb-3" />
            <p className="text-stone-500 text-sm mb-1">No encontramos nada para "{query}"</p>
            <p className="text-stone-400 text-xs">Probá con otro término o navegá por secciones</p>
            <div className="flex justify-center gap-2 mt-6 flex-wrap">
              {Object.entries(sectionLabels).slice(0, 4).map(([key, label]) => (
                <Link
                  key={key}
                  href={key === "gastronomy" ? "/negocios" : `/directorio/${key}`}
                  className="px-4 py-2 rounded-xl text-sm transition-colors"
                  style={{ background: "rgba(45,69,48,0.08)", color: "#2D4530", border: "1px solid rgba(45,69,48,0.15)" }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sin query */}
        {!query && (
          <div className="text-center py-16">
            <Search size={40} className="mx-auto mb-3" style={{ color: "rgba(45,69,48,0.25)" }} />
            <p className="text-sm" style={{ color: "rgba(45,69,48,0.45)" }}>
              Escribí algo para buscar en todo el valle
            </p>
          </div>
        )}

        {/* Lista de resultados */}
        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((business, i) => (
              <AnimateIn key={business.id} direction="up" delay={i * 0.04}>
                <Link href={getDetailUrl(business)}>
                  <div
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex items-center gap-4 p-4 hover:border-stone-300 transition-all hover:shadow-sm"
                  >
                    {/* Logo/cover */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                      {business.logo_url ? (
                        <Image src={business.logo_url} alt={business.name} width={64} height={64}
                          className="w-full h-full object-cover" />
                      ) : business.cover_url ? (
                        <Image src={business.cover_url} alt={business.name} width={64} height={64}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-serif text-2xl"
                          style={{ color: "rgba(45,69,48,0.35)" }}>
                          {business.name[0]}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-semibold text-stone-800">{business.name}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sectionColors[business.section]}`}>
                          {sectionLabels[business.section]}
                        </span>
                        {calcIsOpen(business.business_hours, business.is_open) && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-pine/10 text-brand-pine">
                            Abierto
                          </span>
                        )}
                      </div>
                      {business.subcategory && (
                        <p className="text-xs text-stone-400 mb-1">{business.subcategory}</p>
                      )}
                      {business.description && (
                        <p className="text-xs text-stone-500 line-clamp-1 leading-relaxed">
                          {business.description}
                        </p>
                      )}
                      {business.address && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={10} className="text-stone-300 flex-shrink-0" />
                          <span className="text-xs text-stone-400 truncate">{business.address}</span>
                        </div>
                      )}
                    </div>

                    {/* WhatsApp rápido */}
                    {business.whatsapp && (
                      <a
                        href={`https://wa.me/${normalizeArgPhone(business.whatsapp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ background: "rgba(37,211,102,0.1)", color: "#25D366" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.545a.75.75 0 0 0 .921.921l5.701-1.469A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.964-1.366l-.355-.212-3.686.949.969-3.682-.231-.366A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </Link>
              </AnimateIn>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}