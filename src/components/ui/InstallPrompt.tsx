'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

async function recordInstall() {
  try {
    const supabase = createClient()
    const ua = navigator.userAgent
    const platform = /iPhone|iPad|iPod/.test(ua)
      ? 'iOS'
      : /Android/.test(ua)
      ? 'Android'
      : 'Desktop'

    await supabase.from('pwa_installs').insert({ user_agent: ua, platform })
  } catch {
    // non-blocking — tracking failure should never affect the UI
  }
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const recorded = useRef(false); // prevent double-counting if both events fire

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    const onAppInstalled = () => {
      if (recorded.current) return;
      recorded.current = true;
      recordInstall();
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // appinstalled will fire and handle tracking if accepted.
    // Only track here as fallback for browsers that don't emit appinstalled.
    if (outcome === 'accepted' && !recorded.current) {
      recorded.current = true;
      recordInstall();
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-[#1C352D] text-[#F5F2EB] p-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 border border-emerald-800">
      <div className="flex-1">
        <p className="font-semibold text-sm">Llevá el Valle en tu celular</p>
        <p className="text-xs text-gray-300">Instalá la app para un acceso más rápido.</p>
      </div>
      <button
        onClick={handleInstallClick}
        className="bg-[#F5F2EB] text-[#1C352D] px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all flex-shrink-0"
      >
        Instalar
      </button>
      <button
        onClick={() => setIsVisible(false)}
        aria-label="Cerrar"
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
        style={{ background: "rgba(255,255,255,0.1)", color: "rgba(245,242,235,0.6)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#F5F2EB")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(245,242,235,0.6)")}
      >
        ×
      </button>
    </div>
  );
}
