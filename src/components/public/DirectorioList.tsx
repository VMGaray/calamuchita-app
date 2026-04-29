"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AnimateIn from "@/components/ui/AnimateIn"
import Card3D from "@/components/ui/Card3D"
import { SkeletonBusinessGrid } from "@/components/ui/Skeleton"
import { createClient } from "@/lib/supabase/client"
import { sectionCategories, SectionKey } from "@/lib/sections"
import { Phone, AtSign, MapPin } from "lucide-react"

interface Business {
  id: string
  name: string
  slug: string
  subcategory: string | null
  address: string | null
  phone: string | null
  instagram: string | null
  logo_url: string | null
  cover_url: string | null
  description: string | null
}

interface Props {
  section: SectionKey
  filters: { cat?: string; q?: string; pueblo?: string }
}

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

export default function DirectorioList({ section, filters }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(filters.q || "")

  const categories = sectionCategories[section] || []
  const activeCategory = filters.cat || ""

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from("businesses")
        .select("id, name, slug, subcategory, address, phone, instagram, logo_url, cover_url, description")
        .eq("status", "active")
        .eq("section", section)

      if (activeCategory && activeCategory !== "varios") {
        query = query.ilike("subcategory", `%${activeCategory}%`)
      }

      if (filters.q) {
        query = query.ilike("name", `%${filters.q}%`)
      }

      if (filters.pueblo) {
        query = query.ilike("address", `%${filters.pueblo}%`)
      }

      const { data } = await query.order("name")
      setBusinesses(data || [])
      setLoading(false)
    }
    fetchBusinesses()
  }, [section, activeCategory, filters.q, filters.pueblo])

  const updateFilter = (key: string, value: string) => {
    const current = new URLSearchParams(searchParams.toString())
    if (value) current.set(key, value)
    else current.delete(key)
    router.push(`/directorio/${section}?${current.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter("q", search)
  }

  return (
    <div>
      {/* Búsqueda */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="flex-1 bg-white border border-stone-200 rounded-2xl px-5 py-3 text-sm text-stone-700 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-primary-300"
          />
          <button
            type="submit"
            className="bg-primary-500 text-primary-100 px-5 py-3 rounded-2xl text-sm font-medium hover:bg-primary-400 transition-colors"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Filtro por pueblo */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => updateFilter("pueblo", "")}
          className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${
            !filters.pueblo ? "bg-primary-500 text-primary-100 border-primary-500" : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
          }`}
        >
          Todos los pueblos
        </button>
        {pueblos.map(p => (
          <button
            key={p}
            onClick={() => updateFilter("pueblo", p)}
            className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${
              filters.pueblo === p ? "bg-primary-500 text-primary-100 border-primary-500" : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
            }`}
          >
            {p.replace("Villa General Belgrano", "VGB").replace("Santa Rosa de Calamuchita", "Santa Rosa")}
          </button>
        ))}
      </div>

      {/* Filtro por categoría */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map(({ label, href }) => {
          const catKey = href.includes("cat=") ? href.split("cat=")[1] : ""
          const isActive = activeCategory === catKey
          return (
            <button
              key={label}
              onClick={() => updateFilter("cat", catKey)}
              className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                isActive ? "bg-primary-500 text-primary-100 border-primary-500" : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Resultados */}
      {loading ? (
        <SkeletonBusinessGrid count={6} />
      ) : businesses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <p className="text-stone-400 text-sm">No encontramos negocios con esos filtros.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-stone-400 mb-4">{businesses.length} resultado{businesses.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map((business, i) => (
              <AnimateIn key={business.id} direction="up" delay={i * 0.05}>
                <Card3D className="h-full">
                  <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 h-full">
                    <div className="h-32 relative bg-primary-100">
                      {business.cover_url ? (
                        <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/60 rounded-full flex items-center justify-center font-serif text-xl text-primary-400">
                            {business.name[0]}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-medium text-stone-800 mb-0.5">{business.name}</h3>
                      {business.subcategory && (
                        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 text-primary-600 mb-2">
                          {business.subcategory}
                        </span>
                      )}
                      {business.description && (
                        <p className="text-sm text-stone-500 mb-3 leading-relaxed line-clamp-2">
                          {business.description}
                        </p>
                      )}
                      <div className="space-y-1.5 mt-2">
                        {business.address && (
                          <div className="flex items-center gap-2 text-xs text-stone-400">
                            <MapPin size={12} />
                            <span>{business.address}</span>
                          </div>
                        )}
                        {business.phone && (
                          <a
                            href={`tel:${business.phone}`}
                            className="flex items-center gap-2 text-xs text-primary-500 hover:text-primary-600"
                          >
                            <Phone size={12} />
                            <span>{business.phone}</span>
                          </a>
                        )}
                        {business.instagram && (
                          <a
                            href={`https://instagram.com/${business.instagram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-primary-500 hover:text-primary-600"
                          >
                            <AtSign size={12} />
                            <span>{business.instagram}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Card3D>
              </AnimateIn>
            ))}
          </div>
        </>
      )}
    </div>
  )
}