import type { Metadata } from "next"
import "./globals.css"
import ClientOnly from "@/components/ui/ClientOnly"
import PageTransition from "@/components/ui/PageTransition"

export const metadata: Metadata = {
  title: "Calamuchita App",
  description: "Todo el Valle de Calamuchita en un solo lugar",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="cursor-none">
        <ClientOnly />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  )
}