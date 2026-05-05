import AdminMenuDelDia from '@/components/admin/AdminMenuDelDia'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminMenuDelDiaPage({ params }: Props) {
  const { id } = await params
  return <AdminMenuDelDia businessId={id} />
}