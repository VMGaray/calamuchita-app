import Sidebar from "@/components/dashboard/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
