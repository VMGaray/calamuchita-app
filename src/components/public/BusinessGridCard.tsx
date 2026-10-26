import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

interface Props {
  href: string
  name: string
  imageUrl: string | null
  /** Línea chica dorada arriba del nombre (sección, rubro, etc.) */
  eyebrow?: string | null
  isPremium?: boolean
  isFeaturedRubro?: boolean
  isOpen?: boolean
  priority?: boolean
}

/**
 * Tarjeta chica de negocio para grillas de 2+ columnas.
 * Mismo formato que la página de Destacados del Valle.
 */
export default function BusinessGridCard({
  href, name, imageUrl, eyebrow, isPremium, isFeaturedRubro, isOpen, priority,
}: Props) {
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#2D4530] shadow-md">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex items-start justify-center pt-[18%]">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-serif text-xl font-bold"
              style={{ background: "#E1DBC9", color: "#2D4530" }}>
              {name[0]}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

        {(isPremium || isFeaturedRubro) && (
          <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1">
            {isPremium && (
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight"
                style={{ background: "#C9A44B", color: "#1a1a1a" }}
              >
                ★ Destacado
              </div>
            )}
            {isFeaturedRubro && (
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: "#3b82f6", color: "white" }}
              >
                <Star size={9} fill="currentColor" />
                Destacado
              </div>
            )}
          </div>
        )}

        {isOpen && (
          <span className="absolute top-2 right-2 z-10 text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: "rgba(20,60,35,0.75)", color: "#6ee7a0" }}>
            Abierto
          </span>
        )}

        {/* Info */}
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
          {eyebrow && (
            <p className="text-yellow-500 text-[9px] font-bold uppercase tracking-[0.25em] mb-0.5 truncate">
              {eyebrow}
            </p>
          )}
          <h3 className="text-white text-sm font-bold leading-tight group-hover:text-yellow-400 transition-colors line-clamp-2">
            {name}
          </h3>
        </div>
      </div>
    </Link>
  )
}
