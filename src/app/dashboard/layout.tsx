import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "@/components/dashboard/Sidebar"
import DashboardPending from "@/components/dashboard/DashboardPending"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const isBusiness = user.user_metadata?.role === "business"

  if (isBusiness) {
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .eq("status", "active")
      .maybeSingle()

    if (!business) {
      return (
        <DashboardPending
          userId={user.id}
          userName={user.user_metadata?.full_name || ""}
          userEmail={user.email || ""}
        />
      )
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
