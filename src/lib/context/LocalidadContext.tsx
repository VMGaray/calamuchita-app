"use client"

import { createContext, useContext, useEffect, useState } from "react"

const LS_KEY = "calamuchita_localidad"

type LocalidadContextValue = {
  localidad: string
  setLocalidad: (loc: string) => void
  hydrated: boolean
}

const LocalidadContext = createContext<LocalidadContextValue | null>(null)

export function LocalidadProvider({ children }: { children: React.ReactNode }) {
  // "" representa "Todas las localidades" — es el estado por defecto al entrar a la app
  const [localidad, setLocalidadState] = useState("")
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) setLocalidadState(saved)
    setHydrated(true)
  }, [])

  const setLocalidad = (loc: string) => {
    setLocalidadState(loc)
    localStorage.setItem(LS_KEY, loc)
  }

  return (
    <LocalidadContext.Provider value={{ localidad, setLocalidad, hydrated }}>
      {children}
    </LocalidadContext.Provider>
  )
}

export function useLocalidad(): LocalidadContextValue {
  const ctx = useContext(LocalidadContext)
  if (!ctx) throw new Error("useLocalidad debe usarse dentro de <LocalidadProvider>")
  return ctx
}
