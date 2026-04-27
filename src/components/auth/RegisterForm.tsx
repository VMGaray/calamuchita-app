"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type AccountType = "customer" | "business"

export default function RegisterForm() {
  const router = useRouter()
  const [accountType, setAccountType] = useState<AccountType>("customer")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: accountType,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (accountType === "business") {
      router.push("/dashboard")
    } else {
      router.push("/")
    }
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Selector de tipo de cuenta */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Tipo de cuenta
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setAccountType("customer")}
            className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors ${
              accountType === "customer"
                ? "bg-primary-500 text-primary-100 border-primary-500"
                : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
            }`}
          >
            Soy cliente
          </button>
          <button
            onClick={() => setAccountType("business")}
            className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors ${
              accountType === "business"
                ? "bg-primary-500 text-primary-100 border-primary-500"
                : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
            }`}
          >
            Tengo un local
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Nombre completo
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="María García"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Teléfono
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="3546 123456"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {accountType === "business" && (
        <div className="bg-accent-50 border border-accent-100 rounded-xl px-4 py-3">
          <p className="text-sm text-accent-500 font-medium">
            Registro como comercio
          </p>
          <p className="text-xs text-accent-400 mt-1">
            Tu cuenta quedará pendiente de aprobación. Te avisamos por email cuando esté activa.
          </p>
        </div>
      )}

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-primary-500 hover:bg-primary-400 text-primary-100 font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </div>
  )
}