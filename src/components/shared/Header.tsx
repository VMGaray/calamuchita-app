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
    <header className="sticky top-0 z-50" style={{ background: "transparent" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">

          <div className="flex items-center gap-4"> {/* Contenedor para Logo + Mapa */}
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 -ml-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)" }}>
                <MapPin size={15} style={{ color: "rgba(255,255,255,0.9)" }} />
              </div>
              <span
                className="font-serif text-xl font-semibold px-3 py-0.5 rounded-full hidden sm:inline"
                style={{
                  color: "rgba(255,255,255,0.97)",
                  background: "rgba(0,0,0,0.2)",
                  backdropFilter: "blur(8px)",
                  textShadow: "0 1px 6px rgba(0,0,0,0.35)",
                }}
              >
                Calamuchita App
              </span>
            </Link>

            <Link
              href="/mapa"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
              style={{
                background: "rgba(45,69,48,0.4)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(4px)"
              }}
            >
              <MapIcon size={14} className="text-white/90" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 hidden sm:block">Explorar Mapa</span>
            </Link>

            <Link
              href="/eventos"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
              style={{
                background: "rgba(45,69,48,0.4)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(4px)"
              }}
            >
              <CalendarDays size={14} className="text-white/90" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 hidden sm:block">Agenda</span>
            </Link>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2"
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)" }}>
                    <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.95)" }}>{initials}</span>
                  </div>
                  <span className="text-sm hidden md:block" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {profile?.full_name?.split(" ")[0] || "Mi cuenta"}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        className="absolute right-0 top-12 w-48 rounded-2xl overflow-hidden z-50"
                        style={{ background: "rgba(225,219,201,0.97)", backdropFilter: "blur(16px)", border: "1px solid rgba(45,69,48,0.15)", boxShadow: "0 8px 32px rgba(45,69,48,0.1)" }}
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
            ) : (
              <>
                <Link href="/login" className="text-sm transition-colors"
                  style={{ color: "rgba(255,255,255,0.75)" }}>
                  Ingresar
                </Link>
                <Link href="/registro"
                  className="text-sm px-4 py-2 rounded-xl transition-colors hidden sm:block"
                  style={{ background: "rgba(225,219,201,0.18)", color: "rgba(255,255,255,0.95)", border: "1px solid rgba(225,219,201,0.3)" }}>
                  Registrate
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}