"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"

// Solo fade-in al cambiar de ruta, sin animación de salida.
// Antes había un AnimatePresence con exit: en el App Router, `children` siempre
// muestra la ruta NUEVA, así que durante el fade-out la página nueva se montaba
// dentro del div que salía y después otra vez en el que entraba. Todo se montaba
// dos veces por navegación (vistas duplicadas en increment_view, fetches dobles).
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [prevPathname, setPrevPathname] = useState(pathname)
  const [navigated, setNavigated] = useState(false)

  // Sin fade en la primera carga (como el initial={false} de antes).
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setNavigated(true)
  }

  return (
    <motion.div
      key={pathname}
      initial={navigated ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  )
}
