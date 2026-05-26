'use client';

import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Previene que el navegador tire su cartel genérico
      e.preventDefault();
      // Guarda el evento para dispararlo cuando el usuario haga clic
      setDeferredPrompt(e);
      // Muestra nuestro cartel personalizado
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Muestra el prompt nativo
    deferredPrompt.prompt();
    // Espera la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('El usuario instaló la app 🎉');
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