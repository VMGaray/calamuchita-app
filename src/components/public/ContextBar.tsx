"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useLocalidad } from "@/lib/context/LocalidadContext"
import { MapPin, ChevronRight } from "lucide-react"
import { Suspense } from "react"

// ── Nombres de sección por ruta ──────────────────────────────────────────────
const SECTION_LABELS: Record<string, string> = {
  "/negocios":             "Gastronomía",
  "/directorio/services":  "Servicios",
  "/directorio/health":    "Salud",
  "/directorio/education": "Educación",
  "/directorio/tourism":   "Turismo",
  "/directorio/commerce":  "Comercios",
  "/directorio/events":    "Eventos",
  "/directorio/info":      "Info útil",
}

// ── Labels de subcategorías (gastro + directorio) ────────────────────────────
const SUBCAT_LABELS: Record<string, string> = {
  // gastronomy
  restaurant:    "Restaurantes",
  cafe:          "Cafés",
  cafe_bar:      "Bar/Café",
  viandas:       "Viandas",
  panaderia:     "Panadería",
  bar:           "Bares",
  other:         "Varios",
  // services
  alarmas:       "Alarmas-Seguridad",
  cerrajero:     "Cerrajero",
  construccion:  "Construcción",
  desinfecciones:"Desinfecciones",
  electricidad:  "Electricidad",
  fletes:        "Fletes",
  gasista:       "Gasista",
  herrero:       "Herrero",
  jardinero:     "Paisajismo y Jardines",
  limpieza:      "Limpieza",
  mecanica:      "Mecánica",
  movimiento:    "Movimiento de suelos",
  perforaciones: "Perforaciones",
  piletero:      "Piletero",
  pintor:        "Pintor",
  plomeria:      "Plomería",
  aridos:        "Venta de áridos",
  zinguero:      "Zinguero",
  carteles:      "Carteles tallados",
  costurera:     "Costurera/Modista",
  equitacion:    "Escuela de Equitación",
  traslados:     "Traslados",
  auxilio:       "Auxilio y Remolque",
  audiovisuales:     "Servicios audiovisuales",
  "higiene-seguridad": "Higiene y seguridad laboral",
  "licenciado-hys":    "Licenciado en higiene y seguridad",
  bombas:              "Bombas y Motores eléctricos",
  refrigeracion:       "Refrigeración",
  // health
  clinicas:      "Clínicas y Consultorios",
  especialidades:"Especialidades",
  hospitales:    "Hospitales",
  laboratorios:  "Laboratorios",
  terapias:      "Terapias alternativas",
  traslado:      "Traslado de pacientes",
  // education
  arte:          "Arte y Música",
  colegios:      "Colegios",
  deporte:       "Deporte",
  idiomas:       "Idiomas",
  maestras:      "Maestras/os",
  // tourism
  actividades:   "Actividades",
  agencia:       "Agencia de Viajes",
  alojamiento:   "Alojamiento",
  alquiler:      "Alquiler",
  excursiones:   "Excursiones",
  // commerce
  "fabrica-espumantes": "Fábrica de Espumantes",
  forrajeria:    "Forrajería",
  hogar:         "Hogar",
  imprenta:      "Imprenta",
  indumentaria:  "Indumentaria",
  mascotas:      "Mascotas",
  ninos:         "Niños",
  tecnologia:    "Tecnología",
  vehiculos:     "Vehículos",
  // events
  culturales:    "Culturales",
  deportivos:    "Deportivos",
  festivales:    "Festivales",
  gastronomia:   "Gastronomía",
  infantiles:    "Infantiles",
  musica:        "Música",
}

function ContextBarInner() {
  const pathname  = usePathname()
  const sp        = useSearchParams()
  const { localidad } = useLocalidad()

  // Detectar sección activa desde el pathname
  const sectionKey = Object.keys(SECTION_LABELS).find(k => pathname.startsWith(k))
  if (!sectionKey) return null

  // No mostrar en páginas de detalle (ej. /negocios/slug o /directorio/services/slug)
  const remainingPath = pathname.slice(sectionKey.length)
  if (remainingPath.length > 1) return null  // ">" 1 porque puede ser "/" sola

  const sectionLabel = SECTION_LABELS[sectionKey]

  // Subcategoría: "categoria" para gastronomy, "cat" para directorio
  const catParam    = sp.get("categoria") || sp.get("cat")
  const subcatLabel = catParam ? SUBCAT_LABELS[catParam] ?? null : null

  // Filtros rápidos activos
  const isAbierto  = sp.get("abierto")   === "true"
  const isDelivery = sp.get("delivery")  === "true"
  const isTakeaway = sp.get("takeaway")  === "true"
  const hasFilter  = isAbierto || isDelivery || isTakeaway

  return (
    <div
      className="md:hidden flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 py-1.5"
      style={{
        background:        "rgba(35,55,37,0.72)",
        backdropFilter:    "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop:         "1px solid rgba(255,255,255,0.07)",
        minHeight:         "32px",
      }}
    >
      {/* Localidad */}
      <MapPin
        size={10}
        className="flex-shrink-0"
        style={{ color: "rgba(225,219,201,0.60)" }}
      />
      <span
        className="text-[11px] font-medium whitespace-nowrap flex-shrink-0"
        style={{ color: "rgba(225,219,201,0.75)" }}
      >
        {localidad}
      </span>

      {/* Separador › Sección */}
      <ChevronRight size={9} className="flex-shrink-0 opacity-40" style={{ color: "#E1DBC9" }} />
      <span
        className="text-[11px] font-semibold whitespace-nowrap flex-shrink-0"
        style={{ color: "rgba(225,219,201,0.90)" }}
      >
        {sectionLabel}
      </span>

      {/* Subcategoría seleccionada */}
      {subcatLabel && (
        <>
          <ChevronRight size={9} className="flex-shrink-0 opacity-40" style={{ color: "#E1DBC9" }} />
          <span
            className="text-[11px] font-bold whitespace-nowrap flex-shrink-0 px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(225,219,201,0.18)",
              color:      "#E1DBC9",
              border:     "1px solid rgba(225,219,201,0.20)",
            }}
          >
            {subcatLabel}
          </span>
        </>
      )}

      {/* Chips de filtros rápidos */}
      {isAbierto && (
        <span
          className="text-[10px] font-bold whitespace-nowrap flex-shrink-0 px-2 py-0.5 rounded-full"
          style={{ background: "rgba(74,255,128,0.15)", color: "#6ee7a0" }}
        >
          Abierto
        </span>
      )}
      {isDelivery && (
        <span
          className="text-[10px] font-medium whitespace-nowrap flex-shrink-0 px-2 py-0.5 rounded-full"
          style={{ background: "rgba(225,219,201,0.10)", color: "rgba(225,219,201,0.80)" }}
        >
          Delivery
        </span>
      )}
      {isTakeaway && (
        <span
          className="text-[10px] font-medium whitespace-nowrap flex-shrink-0 px-2 py-0.5 rounded-full"
          style={{ background: "rgba(225,219,201,0.10)", color: "rgba(225,219,201,0.80)" }}
        >
          Take Away
        </span>
      )}

      {/* Punto de relleno si no hay filtros adicionales (para que la barra no quede vacía) */}
      {!subcatLabel && !hasFilter && (
        <span
          className="text-[10px] whitespace-nowrap flex-shrink-0"
          style={{ color: "rgba(225,219,201,0.35)" }}
        >
          · todos los resultados
        </span>
      )}
    </div>
  )
}

/** Barra de contexto sticky (mobile only) — va dentro del wrapper sticky del StickyCategoryBar */
export default function ContextBar() {
  return (
    <Suspense fallback={null}>
      <ContextBarInner />
    </Suspense>
  )
}
