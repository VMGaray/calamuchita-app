"use client"

import Link from "next/link"
import { MapPin, Map as MapIcon, CalendarDays } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // El header necesita fondo sólido cuando no hay hero oscuro detrás.
  // usePathname() se actualiza en cada navegación cliente, a diferencia de
  // las props del layout que quedan congeladas tras el primer render.
  const solid = pathname.startsWith("/buscar")
    || pathname.startsWith("/directorio")
    || pathname.startsWith("/negocios")
    || pathname.startsWith("/eventos")
    || pathname.startsWith("/mapa")
    || pathname.startsWith("/info-util")
    || pathname.startsWith("/unite")
    || pathname.startsWith("/mapa")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from("profiles").select("*").eq("id", user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  return (
    <header
      className="sticky top-0 z-50 pointer-events-none"
      style={solid ? {
        background: "rgba(225,219,201,0.97)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(45,69,48,0.10)",
      } : {
        background: "transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-2">

          {/* ── IZQUIERDA: Logo + accesos rápidos ── */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 pointer-events-auto">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 -ml-1 sm:-ml-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={solid
                  ? { background: "rgba(45,69,48,0.10)", border: "1px solid rgba(45,69,48,0.18)" }
                  : { background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)" }}
              >
                <MapPin size={15} style={{ color: solid ? "#2D4530" : "rgba(255,255,255,0.9)" }} />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="font-serif text-[15px] sm:text-[17px] font-semibold"
                  style={solid
                    ? { color: "#2D4530" }
                    : { color: "rgba(255,255,255,0.97)", textShadow: "0 1px 6px rgba(0,0,0,0.40)" }}
                >
                  Calamuchita
                </span>
                <span
                  className="font-serif text-[10px] sm:text-[11px] font-medium tracking-widest uppercase"
                  style={solid
                    ? { color: "rgba(45,69,48,0.70)" }
                    : { color: "rgba(255,255,255,0.97)", textShadow: "0 1px 6px rgba(0,0,0,0.40)" }}
                >
                  App
                </span>
              </div>
            </Link>

            {/* Botón Mapa */}
            <Link
              href="/mapa"
              prefetch={false}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              style={solid
                ? { background: "rgba(45,69,48,0.10)", border: "1px solid rgba(45,69,48,0.18)", color: "#2D4530" }
                : { background: "rgba(45,69,48,0.45)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(4px)", color: "rgba(255,255,255,0.9)" }}
            >
              <MapIcon size={15} />
              <span className="sm:hidden text-[11px] font-bold uppercase tracking-wide">Mapa</span>
              <span className="hidden sm:block text-[10px] font-bold uppercase tracking-wider">Explorar Mapa</span>
            </Link>

            {/* Botón Agenda */}
            <Link
              href="/eventos"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              style={solid
                ? { background: "rgba(45,69,48,0.10)", border: "1px solid rgba(45,69,48,0.18)", color: "#2D4530" }
                : { background: "rgba(45,69,48,0.45)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(4px)", color: "rgba(255,255,255,0.9)" }}
            >
              <CalendarDays size={15} />
              <span className="text-[11px] font-bold uppercase tracking-wide">Agenda</span>
            </Link>
          </div>

          {/* ── DERECHA: Auth ── */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 pointer-events-auto">
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2"
                  whileTap={{ scale: 0.97 }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={solid
                      ? { background: "rgba(45,69,48,0.10)", border: "1px solid rgba(45,69,48,0.18)" }
                      : { background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)" }}
                  >
                    <span className="text-xs font-medium" style={{ color: solid ? "#2D4530" : "rgba(255,255,255,0.95)" }}>
                      {initials}
                    </span>
                  </div>
                  <span className="text-sm hidden md:block" style={{ color: solid ? "#2D4530" : "rgba(255,255,255,0.8)" }}>
                    {profile?.full_name?.split(" ")[0] || "Mi cuenta"}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        className="absolute right-0 top-12 w-48 rounded-2xl overflow-hidden z-50"
                        style={{
                          background: "rgba(225,219,201,0.97)",
                          backdropFilter: "blur(16px)",
                          border: "1px solid rgba(45,69,48,0.15)",
                          boxShadow: "0 8px 32px rgba(45,69,48,0.1)",
                        }}
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(45,69,48,0.1)" }}>
                          <p className="text-sm font-medium" style={{ color: "#2D4530" }}>{profile?.full_name}</p>
                          <p className="text-xs" style={{ color: "rgba(45,69,48,0.5)" }}>
                            {profile?.role === "business" ? "Comercio" : profile?.role === "admin" ? "Admin" : "Cliente"}
                          </p>
                        </div>
                        <div className="p-2">
                          {profile?.role === "business" && (
                            <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors"
                              style={{ color: "rgba(45,69,48,0.75)" }}>
                              Mi panel
                            </Link>
                          )}
                          {profile?.role === "admin" && (
                            <Link href="/admin" onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors"
                              style={{ color: "rgba(45,69,48,0.75)" }}>
                              Panel admin
                            </Link>
                          )}
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors"
                            style={{ color: "#5E4B3B" }}>
                            Cerrar sesión
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </header>
  )
}
