"use client"

import { createContext, useContext, useState } from "react"
import { MAIN_LOCALIDADES } from "@/lib/constants/telefonos"

type LocalidadContextValue = {
  localidad: string
  setLocalidad: (loc: string) => void
}

const LocalidadContext = createContext<LocalidadContextValue | null>(null)

export function LocalidadProvider({ children }: { children: React.ReactNode }) {
  const [localidad, setLocalidad] = useState(MAIN_LOCALIDADES[0])

  return (
    <LocalidadContext.Provider value={{ localidad, setLocalidad }}>
      {children}
    </LocalidadContext.Provider>
  )
}

export function useLocalidad(): LocalidadContextValue {
  const ctx = useContext(LocalidadContext)
  if (!ctx) throw new Error("useLocalidad debe usarse dentro de <LocalidadProvider>")
  return ctx
}
