"use client"

import { createContext, useContext } from "react"
import { BusinessCategory } from "@/types/database"

type BusinessDashboardValue = {
  businessId: string
  category: BusinessCategory | null
  isRestaurante: boolean
}

const BusinessDashboardContext = createContext<BusinessDashboardValue | null>(null)

export function BusinessDashboardProvider({
  value,
  children,
}: {
  value: BusinessDashboardValue
  children: React.ReactNode
}) {
  return (
    <BusinessDashboardContext.Provider value={value}>
      {children}
    </BusinessDashboardContext.Provider>
  )
}

export function useBusinessDashboard(): BusinessDashboardValue {
  const ctx = useContext(BusinessDashboardContext)
  if (!ctx) throw new Error("useBusinessDashboard debe usarse dentro de <BusinessDashboardProvider>")
  return ctx
}
