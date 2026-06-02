"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MapPin } from "lucide-react"

function GastronomicosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const linkExpired = searchParams.get("error") === "link_expired"

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(
    linkExpired ? "El enlace expiró. Iniciá sesión para continuar." : null
  )

  const [showForgot, setShowForgot]   = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent]   = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!email || !password) { setError("Completá todos los campos."); return }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError("Email o contraseña incorrectos.")
      setLoading(false)
      return
    }
    router.push("/dashboard")
    router.refresh()
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) { setForgotError("Ingresá tu email."); return }
    setForgotLoading(true)
    setForgotError(null)
    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    })
    setForgotLoading(false)
    if (resetError) { setForgotError("No pudimos enviar el email. Verificá la dirección."); return }
    setForgotSent(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "#F5F2EB" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "#2D4530" }}
          >
            <MapPin size={18} style={{ color: "#E1DBC9" }} />
          </div>
          <span className="font-serif text-xl" style={{ color: "#2D4530" }}>Calamuchita App</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-7 shadow-sm">

          {showForgot ? (
            /* ── Recuperar contraseña ── */
            <div className="space-y-4">
              <button
                onClick={() => { setShowForgot(false); setForgotSent(false); setForgotError(null) }}
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                ← Volver
              </button>
              <h2 className="text-base font-semibold text-stone-800">Recuperar contraseña</h2>

              {forgotSent ? (
                <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">
                  ✓ Revisá tu email — te enviamos el enlace de recuperación.
                </div>
              ) : (
                <>
                  {forgotError && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{forgotError}</div>
                  )}
                  <p className="text-sm text-stone-500">
                    Ingresá tu email y te enviamos el enlace para restablecer tu contraseña.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
                    />
                  </div>
                  <button
                    onClick={handleForgotPassword}
                    disabled={forgotLoading}
                    className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    style={{ background: "#2D4530", color: "#E1DBC9" }}
                  >
                    {forgotLoading ? "Enviando…" : "Enviar enlace"}
                  </button>
                </>
              )}
            </div>
          ) : (
            /* ── Login ── */
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-stone-800 mb-1">Acceso</h2>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-stone-600">Contraseña</label>
                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setForgotEmail(email) }}
                    className="text-xs transition-colors"
                    style={{ color: "#2D4530" }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                style={{ background: "#2D4530", color: "#E1DBC9" }}
              >
                {loading ? "Ingresando…" : "Ingresar"}
              </button>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}

export default function GastronomicosPage() {
  return (
    <Suspense>
      <GastronomicosContent />
    </Suspense>
  )
}
