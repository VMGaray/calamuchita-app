'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const DEVICE_KEY = 'calamuchita_device_id';
const LAST_PING_KEY = 'calamuchita_last_ping';
const PING_EVERY_MS = 12 * 60 * 60 * 1000; // 1 registro cada 12 h por dispositivo

type Platform = 'ios' | 'android' | 'android-app' | 'desktop';

function detectPlatform(): Platform | null {
  const ua = navigator.userAgent;
  const w = window as any;

  // App de Play Store (WebView con Capacitor)
  if (w.Capacitor?.isNativePlatform?.() || /\bwv\b/.test(ua)) return 'android-app';

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    w.navigator.standalone === true; // iOS

  if (!isStandalone) return null; // navegador común: no se cuenta

  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

export default function PwaTracker() {
  useEffect(() => {
    try {
      const platform = detectPlatform();
      if (!platform) return;

      const lastPing = Number(localStorage.getItem(LAST_PING_KEY) || 0);
      if (Date.now() - lastPing < PING_EVERY_MS) return;

      let deviceId = localStorage.getItem(DEVICE_KEY);
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem(DEVICE_KEY, deviceId);
      }

      const supabase = createClient();
      supabase
        .rpc('track_pwa_device', { p_device_id: deviceId, p_platform: platform })
        .then(({ error }) => {
          if (!error) localStorage.setItem(LAST_PING_KEY, String(Date.now()));
        });
    } catch {
      // Nunca romper la app por el contador
    }
  }, []);

  return null;
}
