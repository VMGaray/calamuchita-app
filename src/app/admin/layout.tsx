import AdminSidebar from "@/components/admin/AdminSidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: "#E1DBC9" }}>
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
