"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type AccountType = "customer" | "business"

const ERROR_MAP: Record<string, string> = {
  "User already registered": "Ya existe una cuenta con ese email.",
  "Email already in use": "Ya existe una cuenta con ese email.",
  "Password should be at least 6 characters": "La contraseña debe tener al menos 6 caracteres.",
  "Signup requires a valid password": "La contraseña no es válida.",
  "Unable to validate email address: invalid format": "El formato del email no es válido.",
}

const translateError = (msg: string) => ERROR_MAP[msg] ?? "Ocurrió un error. Intentá de nuevo."

export default function RegisterForm() {
  const router = useRouter()
  const [accountType, setAccountType] = useState<AccountType>("customer")
  const [fullName, setFullName] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }
    if (accountType === "business" && !businessName.trim()) {
      setError("Ingresá el nombre del comercio.")
      return
    }

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
          ...(accountType === "business" && {
            business_name: businessName,
            approval_status: "pending",
          }),
        },
      },
    })

    if (error) {
      setError(translateError(error.message))
      setLoading(false)
      return
    }

    if (accountType === "business") {
      // Registrar en tabla de solicitudes pendientes para que el admin lo vea
      const supabase2 = createClient()
      const { data: { user } } = await supabase2.auth.getUser()
      if (user) {
        await supabase2.from("pending_registrations").insert({
          user_id: user.id,
          email,
          full_name: fullName,
          business_name: businessName,
          phone: phone || null,
        })
      }
      router.push("/dashboard")
    } else {
      router.push("/")
    }
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Tipo de cuenta */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Tipo de cuenta</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setAccountType("customer")}
            className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors ${
              accountType === "customer"
                ? "bg-primary-500 text-primary-100 border-primary-500"
                : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
            }`}
          >
            Soy usuario
          </button>
          <button
            onClick={() => setAccountType("business")}
            className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors ${
              accountType === "business"
                ? "bg-primary-500 text-primary-100 border-primary-500"
                : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
            }`}
          >
            Soy gastronómico
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Nombre completo</label>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="María García"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {accountType === "business" && (
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Nombre del comercio</label>
          <input
            type="text"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            placeholder="La Parrilla del Valle"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
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
        <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="3546 123456"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Contraseña</label>
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

      {accountType === "business" && (
        <div className="bg-accent-50 border border-accent-100 rounded-xl px-4 py-3">
          <p className="text-sm text-accent-500 font-medium">Registro como gastronómico</p>
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
