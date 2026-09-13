/**
 * Detecta si la app corre "instalada" — como PWA standalone o como TWA en Android.
 *
 * `display-mode: standalone` es la señal estándar, pero es conocida por no ser
 * 100% confiable dentro de un TWA en ciertas combinaciones de Chrome/OEM (ver
 * hallazgo de landscape en Xiaomi/MIUI). El referrer `android-app://` es la
 * señal específica que Android usa para lanzar un TWA y no depende del cálculo
 * de display-mode, así que la sumamos como respaldo.
 */
export function isInstalledApp(): boolean {
  if (typeof window === "undefined") return false

  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true

  const isTWA = document.referrer.startsWith("android-app://")

  return standalone || isTWA
}
