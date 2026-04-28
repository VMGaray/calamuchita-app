import type { Metadata } from "next"
import "./globals.css"
import CustomCursor from "@/components/ui/CustomCursor"
import ScrollProgress from "@/components/ui/ScrollProgress"

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
        <CustomCursor />
        <ScrollProgress />
        {children}
      </body>
    </html>
  )
}