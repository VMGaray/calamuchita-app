"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session)
      setVerifying(false)
    })
  }, [])

  const handleReset = async () => {
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError("No se pudo actualizar la contraseña. Intentá de nuevo.")
      return
    }
    setSuccess(true)
    // Redirige al dashboard luego de actualizar (ya están logueados)
    setTimeout(() => router.push("/dashboard"), 2500)
  }

  if (verifying) {
    return <p className="text-sm text-stone-400 text-center py-4">Verificando...</p>
  }

  if (success) {
    return (
      <div className="bg-green-50 text-green-700 text-sm px-4 py-4 rounded-xl text-center">
        ✓ Contraseña actualizada. Redirigiendo...
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          El enlace expiró o ya fue utilizado. Pedí uno nuevo desde el login.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl text-stone-800">Nueva contraseña</h2>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Nueva contraseña</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Confirmá la contraseña</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Repetí tu contraseña"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={handleReset}
        disabled={loading}
        className="w-full bg-primary-500 hover:bg-primary-400 text-primary-100 font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar nueva contraseña"}
      </button>
    </div>
  )
}
