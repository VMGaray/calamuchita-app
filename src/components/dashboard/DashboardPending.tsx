"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface Props {
  userName: string
  userEmail: string
  userId: string
}

export default function DashboardPending({ userName, userEmail, userId }: Props) {
  const router = useRouter()

  // Cuando el admin aprueba y crea el negocio, el layout se re-renderiza automáticamente
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const channel = supabase
      .channel("business-approval")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "businesses", filter: `owner_id=eq.${userId}` },
        () => { router.refresh() }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, router])

  const waMsg = encodeURIComponent(
    `Hola! Me registré en Calamuchita App como gastronómico y mi cuenta lleva más de 24hs pendiente de aprobación.\n\nNombre: ${userName || "—"}\nEmail: ${userEmail || "—"}`
  )
  const waLink = `https://wa.me/541145311047?text=${waMsg}`

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-3xl"
          style={{ background: "rgba(200,96,58,0.08)" }}
        >
          ⏳
        </div>
        <h2 className="text-xl font-medium text-stone-800 mb-2">Tu cuenta está pendiente de aprobación</h2>
        <p className="text-sm text-stone-500 max-w-xs">
          Enviamos tu solicitud al equipo de Calamuchita App. En cuanto sea aprobada, esta pantalla se actualizará automáticamente y podrás gestionar tu negocio.
        </p>
        <p className="text-xs text-stone-400 mt-3">No hace falta que recargues la página.</p>

        <div className="mt-8 p-4 rounded-2xl border border-stone-200 bg-white w-full text-left">
          <p className="text-xs font-medium text-stone-600 mb-1">¿Ya pasaron las 24hs y no hay cambios?</p>
          <p className="text-xs text-stone-400 mb-3">
            Si tu solicitud sigue pendiente después de 24 horas, podés contactarnos directamente por WhatsApp.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#25D366" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </main>
  )
}
