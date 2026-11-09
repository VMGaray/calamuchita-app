import type { Metadata } from "next"
import { canonical } from "@/lib/seo"

// La página es client component: el canonical se declara acá.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { alternates: canonical(`/eventos/${id}`) }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
