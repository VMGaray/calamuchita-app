import Header from "@/components/shared/Header"
import SectionsBar from "@/components/public/SectionsBar"
import HeroSection from "@/components/public/HeroSection"
import Footer from "@/components/shared/Footer"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Bloque foto: header + hero */}
      <div className="relative">
        {/* Foto del valle */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/valle.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Overlay oscuro para legibilidad del texto blanco */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0) 100%)",
          }}
        />
        {/* Overlay cálido que funde hacia el crema */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `
              linear-gradient(to bottom,
                rgba(246,225,213,0) 0%,
                rgba(246,225,213,0) 50%,
                rgba(245,237,224,0.92) 82%,
                rgba(245,237,224,1) 100%
              )
            `,
          }}
        />
        {/* Grain */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: 0.06 }}>
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <filter id="grain-public">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch"/>
              <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#grain-public)"/>
          </svg>
        </div>

        {/* Contenido sobre la foto */}
        <div className="relative z-10">
          <Header />
          <HeroSection />
        </div>
      </div>

      {/* Categorías: debajo de la foto */}
      <SectionsBar />

      <main className="flex-1 md:pr-20">
        {children}
      </main>
      <div className="pb-20 md:pb-0">
        <Footer />
      </div>
    </div>
  )
}