"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MapPin } from "lucide-react"
import { GASTRONOMY_CATEGORY_GROUPS } from "@/lib/constants/gastronomyCategories"
import { BusinessCategory } from "@/types/database"
import { sendEmail, newRegistrationEmailHtml } from "@/lib/email"

const ADMIN_NOTIFY_EMAIL = "vmg.setup.ai@gmail.com"

type View = "login" | "register" | "forgot" | "registered"

const ERROR_MAP: Record<string, string> = {
  "User already registered": "Ya existe una cuenta con ese email.",
  "Email already in use": "Ya existe una cuenta con ese email.",
  "Password should be at least 6 characters": "La contraseña debe tener al menos 6 caracteres.",
  "Signup requires a valid password": "La contraseña no es válida.",
  "Unable to validate email address: invalid format": "El formato del email no es válido.",
}
const translateError = (msg: string) => ERROR_MAP[msg] ?? "Ocurrió un error. Intentá de nuevo."

function GastronomicosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const linkExpired = searchParams.get("error") === "link_expired"

  const [view, setView] = useState<View>("login")

  // Login
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError]     = useState<string | null>(
    linkExpired ? "El enlace expiró. Iniciá sesión para continuar." : null
  )

  // Forgot password
  const [forgotEmail, setForgotEmail]         = useState("")
  const [forgotLoading, setForgotLoading]     = useState(false)
  const [forgotSent, setForgotSent]           = useState(false)
  const [forgotError, setForgotError]         = useState<string | null>(null)

  // Register
  const [fullName, setFullName]               = useState("")
  const [businessName, setBusinessName]       = useState("")
  const [regEmail, setRegEmail]               = useState("")
  const [phone, setPhone]                     = useState("")
  const [regPassword, setRegPassword]         = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [category, setCategory]               = useState<BusinessCategory | "">("")
  const [regLoading, setRegLoading]           = useState(false)
  const [regError, setRegError]               = useState<string | null>(null)

  const handleLogin = async () => {
    if (!email || !password) { setLoginError("Completá todos los campos."); return }
    setLoginLoading(true)
    setLoginError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setLoginError("Email o contraseña incorrectos.")
      setLoginLoading(false)
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

  const handleRegister = async () => {
    if (!fullName.trim())     { setRegError("Ingresá tu nombre."); return }
    if (!businessName.trim()) { setRegError("Ingresá el nombre del comercio."); return }
    if (!regEmail.trim())     { setRegError("Ingresá tu email."); return }
    if (regPassword.length < 6) { setRegError("La contraseña debe tener al menos 6 caracteres."); return }
    if (regPassword !== confirmPassword) { setRegError("Las contraseñas no coinciden."); return }
    if (!category) { setRegError("Elegí el tipo de negocio."); return }

    setRegLoading(true)
    setRegError(null)

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: {
        data: {
          full_name: fullName,
          role: "business",
          business_name: businessName,
          approval_status: "pending",
        },
      },
    })

    if (signUpError) {
      setRegError(translateError(signUpError.message))
      setRegLoading(false)
      return
    }

    // Registrar en tabla de solicitudes pendientes
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("pending_registrations").insert({
        user_id: user.id,
        email: regEmail,
        full_name: fullName,
        business_name: businessName,
        phone: phone || null,
        category,
      })

      const categoryLabel = GASTRONOMY_CATEGORY_GROUPS
        .flatMap(g => g.options)
        .find(opt => opt.value === category)?.label ?? category

      sendEmail({
        to: ADMIN_NOTIFY_EMAIL,
        subject: `Nueva solicitud de registro — ${businessName}`,
        html: newRegistrationEmailHtml({
          businessName,
          fullName,
          email: regEmail,
          phone: phone || null,
          category: categoryLabel,
          createdAt: new Date().toLocaleString("es-AR"),
          adminUrl: `${window.location.origin}/admin/solicitudes`,
        }),
      })
    }

    setRegLoading(false)
    setView("registered")
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

          {/* ── Registro exitoso ── */}
          {view === "registered" && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                <span className="text-2xl">✓</span>
              </div>
              <h2 className="text-base font-semibold text-stone-800">Solicitud enviada</h2>
              <p className="text-sm text-stone-500">
                Tu registro quedó pendiente de aprobación. Te avisamos por email cuando tu cuenta esté activa.
              </p>
              <button
                onClick={() => setView("login")}
                className="text-sm font-medium transition-colors"
                style={{ color: "#2D4530" }}
              >
                Volver al ingreso
              </button>
            </div>
          )}

          {/* ── Recuperar contraseña ── */}
          {view === "forgot" && (
            <div className="space-y-4">
              <button
                onClick={() => { setView("login"); setForgotSent(false); setForgotError(null) }}
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
          )}

          {/* ── Login ── */}
          {view === "login" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-stone-800 mb-1">Acceso gastronómicos</h2>

              {loginError && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{loginError}</div>
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
                    onClick={() => { setView("forgot"); setForgotEmail(email) }}
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
                disabled={loginLoading}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                style={{ background: "#2D4530", color: "#E1DBC9" }}
              >
                {loginLoading ? "Ingresando…" : "Ingresar"}
              </button>

              <p className="text-center text-xs text-stone-400 pt-1">
                ¿Primera vez?{" "}
                <button
                  onClick={() => { setView("register"); setRegError(null) }}
                  className="font-medium underline underline-offset-2 transition-colors"
                  style={{ color: "#2D4530" }}
                >
                  Registrate
                </button>
              </p>
            </div>
          )}

          {/* ── Registro ── */}
          {view === "register" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-stone-800 mb-1">Registrar comercio</h2>

              {regError && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{regError}</div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="María García"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Nombre del comercio</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="La Parrilla del Valle"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="3546 123456"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Confirmá la contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repetí tu contraseña"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">¿Qué tipo de negocio sos?</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as BusinessCategory)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50 bg-white"
                >
                  <option value="" disabled>Elegí una opción</option>
                  {GASTRONOMY_CATEGORY_GROUPS.map(({ group, options }) => (
                    <optgroup key={group} label={group}>
                      {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#F5F2EB" }}>
                <p className="text-xs" style={{ color: "#5C7A5E" }}>
                  Tu cuenta quedará <strong>pendiente de aprobación</strong>. Te avisamos por email cuando esté activa.
                </p>
              </div>

              <button
                onClick={handleRegister}
                disabled={regLoading}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                style={{ background: "#2D4530", color: "#E1DBC9" }}
              >
                {regLoading ? "Enviando solicitud…" : "Solicitar registro"}
              </button>

              <p className="text-center text-xs text-stone-400 pt-1">
                ¿Ya tenés cuenta?{" "}
                <button
                  onClick={() => { setView("login"); setLoginError(null) }}
                  className="font-medium underline underline-offset-2 transition-colors"
                  style={{ color: "#2D4530" }}
                >
                  Ingresá
                </button>
              </p>
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
