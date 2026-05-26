import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" })

export const viewport: Viewport = {
  themeColor: "#2D4530",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

import ClientOnly from "@/components/ui/ClientOnly"
import PageTransition from "@/components/ui/PageTransition"
import ScrollToTop from "@/components/ui/ScrollToTop"
import InstallPrompt from "@/components/ui/InstallPrompt" // ✨ Importamos el cartel de instalación

export const metadata: Metadata = {
  title: {
    template: "%s | Calamuchita App",
    default: "Calamuchita App",
  },
  description: "Todo el Valle de Calamuchita en un solo lugar. Gastronomía, servicios, salud, turismo y más en Córdoba, Argentina.",
  manifest: "/manifest", // ✨ Vinculación clave para que Next.js asocie tu manifest.ts
  openGraph: {
    siteName: "Calamuchita App",
    locale: "es_AR",
    type: "website",
    images: [{ url: "/valle.jpg", width: 1200, height: 630, alt: "Valle de Calamuchita" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/valle.jpg"],
  },
  // PWA
  applicationName: "Calamuchita App",
  appleWebApp: {
    capable: true,
    title: "Calamuchita App",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    apple: [{ url: "/icons/apple-icon-180.png", sizes: "180x180" }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="cursor-none">
        <ScrollToTop />
        <ClientOnly />
        <PageTransition>
          {children}
        </PageTransition>
        
        {/* ✨ Inyectamos el cartel en la raíz para que vigile toda la navegación */}
        <InstallPrompt /> 
      </body>
    </html>
  )
}