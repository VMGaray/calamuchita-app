import type { NextConfig } from "next"
import withPWAInit from "@ducanh2912/next-pwa"

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
})

const nextConfig: NextConfig = {
  experimental: {
    // CSS en un <style> del <head> en vez de 4 <link> que bloquean el render (~20 KB con gzip).
    // Conviene para visitas nuevas (los anuncios llevan a la home); el costo es no cachear el CSS aparte.
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: "/**",
      },
    ],
    // Vercel Image Optimization sigue desactivado (límite del plan agotado): el loader manda las
    // imágenes de Supabase a su transformación y las de /public a variantes WebP pregeneradas.
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
    // Si se cambian, regenerar las variantes con scripts/generate-image-variants.mjs
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    qualities: [70, 75, 80, 85, 90],
  },
  async headers() {
    return [
      {
        // Headers de seguridad de base para todas las rutas.
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), geolocation=(self)" },
        ],
      },
      {
        // Variantes de imágenes de /public: el nombre lleva el ancho, no cambian entre deploys
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/:file(valle.jpg|logo-qr.png|videoMenu.mp4)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ]
  },
  async redirects() {
    return [
      { source: "/login", destination: "/gastronomicos", permanent: false },
      { source: "/registro", destination: "/gastronomicos", permanent: false },
      // Gastronomía tiene un solo perfil público (/negocios/<slug>, con carta y pedidos).
      // Los links viejos del directorio se redirigen antes de renderizar (308; la query se conserva).
      { source: "/directorio/gastronomy", destination: "/negocios", permanent: true },
      { source: "/directorio/gastronomy/:slug", destination: "/negocios/:slug", permanent: true },
    ]
  },
}

export default withPWA(nextConfig)