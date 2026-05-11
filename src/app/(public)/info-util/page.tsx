import { Suspense } from "react"
import InfoUtilPage from "@/components/public/InfoUtilPage"

interface Props {
  searchParams: Promise<{ categoria?: string; pueblo?: string }>
}

export async function generateMetadata({ searchParams }: Props) {
  const { categoria } = await searchParams
  const label = categoria
    ? categoria.charAt(0).toUpperCase() + categoria.slice(1)
    : "Info Útil"
  return { title: `${label} — Valle de Calamuchita` }
}

export default async function InfoUtilRoute({ searchParams }: Props) {
  const { categoria, pueblo } = await searchParams
  return (
    <Suspense>
      <InfoUtilPage initialCategoria={categoria} initialPueblo={pueblo} />
    </Suspense>
  )
}
