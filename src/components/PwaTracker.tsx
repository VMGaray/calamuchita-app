'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const DEVICE_KEY = 'calamuchita_device_id';
const LAST_PING_KEY = 'calamuchita_last_ping';
const PING_EVERY_MS = 12 * 60 * 60 * 1000; // 1 registro cada 12 h por dispositivo

type Platform = 'ios' | 'android' | 'android-app' | 'desktop';

function isIOS(ua: string): boolean {
  // iPadOS 13+ se presenta como Mac: se distingue por la pantalla táctil
  const isIPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/.test(ua) || isIPadOS;
}

function detectPlatform(): Platform | null {
  const ua = navigator.userAgent;
  const w = window as any;

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    w.navigator.standalone === true; // iOS

  // iOS primero: abierta desde la pantalla de inicio cuenta como app instalada
  if (isIOS(ua)) return isStandalone ? 'ios' : null;

  // App de Play Store (WebView con Capacitor)
  if (w.Capacitor?.isNativePlatform?.() || /\bwv\b/.test(ua)) return 'android-app';

  if (!isStandalone) return null; // navegador común: no se cuenta

  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

// pwa_devices.device_id es uuid: el fallback tiene que generar un UUID v4 válido.
// crypto.randomUUID no existe en iOS < 15.4.
function newDeviceId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; // versión 4
  b[8] = (b[8] & 0x3f) | 0x80; // variante RFC 4122
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
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
        deviceId = newDeviceId();
        localStorage.setItem(DEVICE_KEY, deviceId);
      }

      const supabase = createClient();
      supabase
        .rpc('track_pwa_device', { p_device_id: deviceId, p_platform: platform })
        .then(({ error }) => {
          if (error) console.warn('[PwaTracker] track_pwa_device falló:', error.message);
          else localStorage.setItem(LAST_PING_KEY, String(Date.now()));
        });
    } catch (e) {
      // Nunca romper la app por el contador
      console.warn('[PwaTracker] no se pudo registrar el dispositivo:', e);
    }
  }, []);

  return null;
}
