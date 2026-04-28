"use client"

import Link from "next/link"
import { MapPin } from "lucide-react"
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
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
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
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <MapPin size={14} className="text-primary-100" />
            </div>
            <span className="font-serif text-stone-800">Calamuchita App</span>
          </Link>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2"
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-100">{initials}</span>
                  </div>
                  <span className="text-sm text-stone-600 hidden md:block">
                    {profile?.full_name?.split(" ")[0] || "Mi cuenta"}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpen(false)}
                      />
                      <motion.div
                        className="absolute right-0 top-12 w-48 bg-white rounded-2xl border border-stone-200 overflow-hidden z-50"
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <div className="px-4 py-3 border-b border-stone-100">
                          <p className="text-sm font-medium text-stone-700">{profile?.full_name}</p>
                          <p className="text-xs text-stone-400 capitalize">{profile?.role === "business" ? "Comercio" : profile?.role === "admin" ? "Admin" : "Cliente"}</p>
                        </div>
                        <div className="p-2">
                          {profile?.role === "business" && (
                            <Link
                              href="/dashboard"
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 rounded-xl transition-colors"
                            >
                              Mi panel
                            </Link>
                          )}
                          {profile?.role === "admin" && (
                            <Link
                              href="/admin"
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 rounded-xl transition-colors"
                            >
                              Panel admin
                            </Link>
                          )}
                          <Link
                            href="/perfil"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 rounded-xl transition-colors"
                          >
                            Mi perfil
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
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
                <Link href="/login" className="text-sm text-stone-600 hover:text-primary-500 transition-colors">
                  Ingresar
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/registro" className="text-sm bg-primary-500 hover:bg-primary-400 text-primary-100 px-4 py-2 rounded-xl transition-colors">
                    Registrate
                  </Link>
                </motion.div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}