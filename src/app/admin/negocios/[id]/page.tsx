import AdminNegocioEdit from "@/components/admin/AdminNegocioEdit"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminNegocioEditPage({ params }: Props) {
  const { id } = await params
  return <AdminNegocioEdit id={id} />
}