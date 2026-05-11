"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Plus } from "lucide-react"
import Link from "next/link"

type FeaturedBusiness = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  subcategory: string | null
  section: string
}

const FALLBACK = "/valle.jpg"

// Componente de la Tarjeta con efecto de brillo
function FeaturedCard({ biz }: { biz: FeaturedBusiness }) {
  return (
    <motion.div
      whileHover={{ y: -15, scale: 1.02 }}
      className="relative flex-shrink-0 group cursor-pointer"
      style={{
        width: "320px",
        height: "420px",
      }}
    >
      <Link href={`/negocios/${biz.slug}`} className="block w-full h-full">
        <div className="w-full h-full relative overflow-hidden rounded-[40px] bg-[#2D4530] shadow-2xl">
          {/* Imagen con zoom infinito */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${biz.cover_url || FALLBACK})` }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

          {/* Brillo dinámico (Glare) al hacer hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transform" />

          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <div className="px-3 py-1 rounded-full bg-yellow-500 text-black text-[10px] font-black uppercase tracking-tighter w-fit">
              Premium
            </div>
          </div>

          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-[1px] w-4 bg-yellow-500" />
              <p className="text-yellow-500 text-[10px] font-bold uppercase tracking-[0.3em]">{biz.section}</p>
            </div>
            <h3 className="text-white text-3xl font-serif font-bold leading-tight group-hover:text-yellow-400 transition-colors">
              {biz.name}
            </h3>
          </div>

          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2D4530]">
              <Plus size={20} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function JoyasDelValle({ businesses }: { businesses: FeaturedBusiness[] }) {
  if (businesses.length === 0) return null

  // Duplicamos los items para el efecto infinito sin saltos
  const duplicatedBusinesses = [...businesses, ...businesses, ...businesses]

  return (
    <section className="py-24 bg-transparent overflow-hidden">
      <div className="px-6 mb-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-6xl md:text-9xl font-black tracking-tighter leading-none text-[#2D4530] mb-6">
            DESTACADOS
          </h2>
          <div className="flex justify-between items-end">
            <p className="text-[#C9A44B] font-bold text-sm uppercase tracking-[0.6em] border-l-4 border-[#C9A44B] pl-4">
              Curaduría Exclusiva
            </p>
            <Link href="/negocios" className="group flex items-center gap-2 text-xs font-black text-[#2D4530] uppercase border-b-2 border-[#2D4530] pb-1">
              Explorar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Tira infinita animada */}
      <div className="relative flex overflow-hidden">
        <motion.div
          className="flex gap-8 px-4"
          animate={{ x: ["0%", "-33.33%"] }} // Se mueve un tercio (el set original)
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25, // Velocidad del flujo
              ease: "linear",
            },
          }}
          whileHover={{ animationPlayState: "paused" }} // Se frena al tocar/hover
        >
          {duplicatedBusinesses.map((biz, idx) => (
            <FeaturedCard key={`${biz.id}-${idx}`} biz={biz} />
          ))}
        </motion.div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
}