"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("Email o contraseña incorrectos.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setForgotError("Ingresá tu email.")
      return
    }
    setForgotLoading(true)
    setForgotError(null)
    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${siteUrl}/reset-password`,
    })
    setForgotLoading(false)
    if (error) {
      setForgotError("No pudimos enviar el email. Verificá la dirección.")
      return
    }
    setForgotSent(true)
  }

  if (showForgot) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => { setShowForgot(false); setForgotSent(false); setForgotError(null) }}
          className="text-xs text-stone-400 hover:text-stone-600"
        >
          ← Volver al login
        </button>
        <h3 className="text-base font-medium text-stone-800">Recuperar contraseña</h3>

        {forgotSent ? (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">
            ✓ Te enviamos un email a <strong>{forgotEmail}</strong> con el enlace para restablecer tu contraseña. Revisá también el correo no deseado.
          </div>
        ) : (
          <>
            {forgotError && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{forgotError}</div>
            )}
            <p className="text-sm text-stone-500">
              Ingresá el email de tu cuenta y te enviamos un enlace para crear una nueva contraseña.
            </p>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleForgotPassword}
              disabled={forgotLoading}
              className="w-full bg-primary-500 hover:bg-primary-400 text-primary-100 font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {forgotLoading ? "Enviando..." : "Enviar enlace"}
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-stone-700">Contraseña</label>
          <button
            onClick={() => { setShowForgot(true); setForgotEmail(email) }}
            className="text-xs text-primary-500 hover:text-primary-600"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-primary-500 hover:bg-primary-400 text-primary-100 font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </div>
  )
}
