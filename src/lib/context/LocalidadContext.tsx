"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { MAIN_LOCALIDADES } from "@/lib/constants/telefonos"

const LS_KEY = "calamuchita_localidad"

type LocalidadContextValue = {
  localidad: string
  setLocalidad: (loc: string) => void
}

const LocalidadContext = createContext<LocalidadContextValue | null>(null)

export function LocalidadProvider({ children }: { children: React.ReactNode }) {
  const [localidad, setLocalidadState] = useState(MAIN_LOCALIDADES[0])

  // Hydrate from localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY)
    if (saved && saved !== localidad) setLocalidadState(saved)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setLocalidad = (loc: string) => {
    setLocalidadState(loc)
    localStorage.setItem(LS_KEY, loc)
  }

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
