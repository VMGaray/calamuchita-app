import type { MetadataRoute } from "next"

export default function manifest() {
  return {
    id: "/",
    name: "Calamuchita App",
    short_name: "Calamuchita",
    description: "Todo el Valle de Calamuchita en un solo lugar. Gastronomía, servicios, turismo y más.",
    start_url: "/?utm_source=pwa&utm_medium=homescreen&utm_campaign=launch",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#F5F0E8",
    theme_color: "#2D4530",
    categories: ["travel", "food", "lifestyle"],
    lang: "es",
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/valle.jpg",
        sizes: "1280x720",
        type: "image/jpeg",
        form_factor: "wide",
        label: "Calamuchita App — Guía del Valle",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        form_factor: "narrow",
        label: "Calamuchita App — Ícono móvil",
      },
    ],
  }
}
