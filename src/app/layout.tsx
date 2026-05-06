import type { Metadata } from "next"
import "./globals.css"
import ClientOnly from "@/components/ui/ClientOnly"
import PageTransition from "@/components/ui/PageTransition"
import ScrollToTop from "@/components/ui/ScrollToTop"

export const metadata: Metadata = {
  title: {
    template: "%s | Calamuchita App",
    default: "Calamuchita App",
  },
  description: "Todo el Valle de Calamuchita en un solo lugar. Gastronomía, servicios, salud, turismo y más en Córdoba, Argentina.",
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="cursor-none">
        <ScrollToTop />
        <ClientOnly />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  )
}