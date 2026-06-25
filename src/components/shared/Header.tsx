"use client"

import Link from "next/link"
import { MapPin, Map as MapIcon, CalendarDays } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handler, { passive: true })
    handler()
    return () => window.removeEventListener("scroll", handler)
  }, [])

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

  // Sin scroll: transparente con texto blanco (para el hero del home)
  // Con scroll: crema con texto verde oscuro (visible en todas las páginas)
  const solid = scrolled
  const bg = solid ? "rgba(225,219,201,0.97)" : "transparent"
  const border = solid ? "1px solid rgba(45,69,48,0.10)" : "none"
  const logoColor = solid ? "#2D4530" : "rgba(255,255,255,0.97)"
  const logoShadow = solid ? "none" : "0 1px 6px rgba(0,0,0,0.40)"
  const logoBg = solid ? "rgba(45,69,48,0.10)" : "rgba(255,255,255,0.2)"
  const logoBorder = solid ? "1px solid rgba(45,69,48,0.18)" : "1px solid rgba(255,255,255,0.35)"
  const chipBg = solid ? "rgba(45,69,48,0.10)" : "rgba(45,69,48,0.45)"
  const chipBorder = solid ? "rgba(45,69,48,0.18)" : "rgba(255,255,255,0.22)"
  const chipColor = solid ? "#2D4530" : "rgba(255,255,255,0.9)"

  return (
    <header
      className="sticky top-0 z-50 pointer-events-none transition-all duration-300"
      style={{
        background: bg,
        backdropFilter: solid ? "blur(16px)" : undefined,
        WebkitBackdropFilter: solid ? "blur(16px)" : undefined,
        borderBottom: border,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-2">

          {/* ── IZQUIERDA: Logo + accesos rápidos ── */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 pointer-events-auto">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 -ml-1 sm:-ml-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{ background: logoBg, border: logoBorder }}
              >
                <MapPin size={15} style={{ color: logoColor }} />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="font-serif text-[15px] sm:text-[17px] font-semibold transition-all duration-300"
                  style={{ color: logoColor, textShadow: logoShadow }}
                >
                  Calamuchita
                </span>
                <span
                  className="font-serif text-[10px] sm:text-[11px] font-medium tracking-widest uppercase transition-all duration-300"
                  style={{ color: logoColor, textShadow: logoShadow }}
                >
                  App
                </span>
              </div>
            </Link>

            {/* Botón Mapa */}
            <Link
              href="/mapa"
              prefetch={false}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0"
              style={{
                background: chipBg,
                border: `1px solid ${chipBorder}`,
                backdropFilter: "blur(4px)",
                color: chipColor,
              }}
            >
              <MapIcon size={15} />
              <span className="sm:hidden text-[11px] font-bold uppercase tracking-wide">Mapa</span>
              <span className="hidden sm:block text-[10px] font-bold uppercase tracking-wider">Explorar Mapa</span>
            </Link>

            {/* Botón Agenda */}
            <Link
              href="/eventos"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0"
              style={{
                background: chipBg,
                border: `1px solid ${chipBorder}`,
                backdropFilter: "blur(4px)",
                color: chipColor,
              }}
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
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ background: logoBg, border: logoBorder }}
                  >
                    <span className="text-xs font-medium" style={{ color: logoColor }}>{initials}</span>
                  </div>
                  <span className="text-sm hidden md:block transition-all duration-300" style={{ color: logoColor }}>
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
