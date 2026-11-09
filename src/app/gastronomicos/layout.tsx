import type { Metadata } from "next"
import { canonical } from "@/lib/seo"

// La página es client component: el canonical se declara acá.
export const metadata: Metadata = { alternates: canonical("/gastronomicos") }

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
