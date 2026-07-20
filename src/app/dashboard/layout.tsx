import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "@/components/dashboard/Sidebar"
import DashboardPending from "@/components/dashboard/DashboardPending"
import { BusinessDashboardProvider } from "@/lib/context/BusinessDashboardContext"
import { isRestaurante } from "@/lib/utils/business"
import { BusinessCategory } from "@/types/database"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/gastronomicos")
  }

  const isBusiness = user.user_metadata?.role === "business"

  let business: { id: string; category: BusinessCategory | null } | null = null

  if (!isBusiness) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      redirect("/")
    }
  } else {
    const { data } = await supabase
      .from("businesses")
      .select("id, category")
      .eq("owner_id", user.id)
      .eq("status", "active")
      .maybeSingle()

    business = data

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
      <BusinessDashboardProvider
        value={{
          businessId: business?.id ?? "",
          category: business?.category ?? null,
          isRestaurante: isRestaurante(business?.category),
        }}
      >
        <Sidebar />
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </BusinessDashboardProvider>
    </div>
  )
}
