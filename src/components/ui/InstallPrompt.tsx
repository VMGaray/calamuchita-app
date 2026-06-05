'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

async function recordInstall() {
  try {
    const supabase = createClient()
    const ua = navigator.userAgent
    const platform = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : 'Desktop'
    await supabase.from('pwa_installs').insert({ user_agent: ua, platform })
  } catch {
    // non-blocking — tracking failure should never affect the UI
  }
}

const DISMISS_KEY = 'pwa_banner_dismissed_at'
const DISMISS_TTL = 7 * 24 * 60 * 60 * 1000 // 7 días

function wasDismissed() {
  try {
    const ts = localStorage.getItem(DISMISS_KEY)
    if (!ts) return false
    return Date.now() - parseInt(ts, 10) < DISMISS_TTL
  } catch { return false }
}

function markDismissed() {
  try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);
  const recorded = useRef(false);

  useEffect(() => {
    // Ya instalada como PWA — no mostrar
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    if (standalone) return;

    // El usuario ya cerró el banner recientemente
    if (wasDismissed()) return;

    const ua = navigator.userAgent
    const ios = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream

    if (ios) {
      // iOS Safari no dispara beforeinstallprompt — mostramos instrucciones manuales
      const t = setTimeout(() => {
        setIosMode(true)
        setIsVisible(true)
      }, 3000)
      return () => clearTimeout(t)
    }

    // Android / Chrome Desktop: esperamos el evento nativo
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }

    const onAppInstalled = () => {
      if (recorded.current) return
      recorded.current = true
      recordInstall()
      setIsVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, []);

  const handleDismiss = () => {
    markDismissed()
    setIsVisible(false)
  }

  const handleInstall = async () => {
    if (iosMode) { handleDismiss(); return }
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted' && !recorded.current) {
      recorded.current = true
      recordInstall()
    }
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-[#1C352D] text-[#F5F2EB] p-4 rounded-xl shadow-2xl flex items-center gap-3 z-[150] border border-emerald-800">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Llevá el Valle en tu celular</p>
        {iosMode ? (
          <p className="text-xs text-emerald-200 mt-0.5 leading-relaxed">
            Tocá <span className="font-bold text-white">Compartir ⬆</span> y después{" "}
            <span className="font-bold text-white">"Agregar a inicio"</span>
          </p>
        ) : (
          <p className="text-xs text-gray-300">Instalá la app para un acceso más rápido.</p>
        )}
      </div>
      {!iosMode && (
        <button
          onClick={handleInstall}
          className="bg-[#F5F2EB] text-[#1C352D] px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all flex-shrink-0"
        >
          Instalar
        </button>
      )}
      <button
        onClick={handleDismiss}
        aria-label="Cerrar"
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
        style={{ background: "rgba(255,255,255,0.1)", color: "rgba(245,242,235,0.6)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#F5F2EB")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(245,242,235,0.6)")}
      >
        ×
      </button>
    </div>
  )
}
