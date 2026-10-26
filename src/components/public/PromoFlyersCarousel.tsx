"use client"

import { useState, type CSSProperties } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import { Maximize2 } from "lucide-react"
import type { PromoFlyerView } from "@/lib/promos"
import "swiper/css"
import "swiper/css/pagination"

// El visor solo se descarga cuando alguien toca un flyer
const PromoFlyerViewer = dynamic(() => import("@/components/public/PromoFlyerViewer"), { ssr: false })

// Carrusel deslizable de flyers, mostrados enteros (object-contain). Tocar uno abre el visor
// a pantalla completa con zoom.
export default function PromoFlyersCarousel({
  flyers,
  alt,
}: {
  flyers: PromoFlyerView[]
  alt: string
}) {
  const [openAt, setOpenAt] = useState<number | null>(null)
  if (flyers.length === 0) return null

  const single = flyers.length === 1

  return (
    <div className="promo-flyers">
      <Swiper
        modules={[Pagination]}
        pagination={single ? false : { clickable: true }}
        slidesPerView={single ? 1 : 1.15}
        spaceBetween={10}
        breakpoints={single ? undefined : { 640: { slidesPerView: 1.6 } }}
        className={single ? "" : "pb-7!"}
        style={{ "--swiper-pagination-color": "#2D4530", "--swiper-pagination-bottom": "0px" } as CSSProperties}
      >
        {flyers.map((f, i) => (
          <SwiperSlide key={f.id}>
            <button
              type="button"
              onClick={() => setOpenAt(i)}
              className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-stone-100 cursor-zoom-in"
              aria-label={`Ver flyer ${i + 1} de ${flyers.length} ampliado`}
            >
              <Image
                src={f.url}
                alt={`${alt} — flyer ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 420px, 90vw"
                className="object-contain"
              />
              <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-90 transition-opacity group-hover:opacity-100">
                <Maximize2 size={14} aria-hidden="true" />
              </span>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      {openAt !== null && (
        <PromoFlyerViewer flyers={flyers} startIndex={openAt} alt={alt} onClose={() => setOpenAt(null)} />
      )}
    </div>
  )
}
