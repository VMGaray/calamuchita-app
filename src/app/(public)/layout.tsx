import Header from "@/components/shared/Header"
import HeroSection from "@/components/public/HeroSection"
import StickyCategoryBar from "@/components/public/StickyCategoryBar"
import Footer from "@/components/shared/Footer"
import { headers } from "next/headers"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  const isSearchPage = pathname.startsWith("/buscar")

  return (
    <div className="min-h-screen flex flex-col">

      <div className="relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/valle.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(to bottom,
              rgba(225,219,201,0) 0%,
              rgba(225,219,201,0) 50%,
              rgba(225,219,201,0.93) 82%,
              rgba(225,219,201,1) 100%
            )`,
          }}
        />
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: 0.06 }}>
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <filter id="grain-public">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch"/>
              <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#grain-public)"/>
          </svg>
        </div>
        <div className="relative z-10">
          <Header />
          {!isSearchPage && <HeroSection />}
        </div>
      </div>

      <div className="relative -mt-20 z-30 flex flex-col flex-1">
        <StickyCategoryBar />
        <main className="flex-1">
          {children}
        </main>
        <div className="pb-20 md:pb-0">
          <Footer />
        </div>
      </div>
    </div>
  )
}