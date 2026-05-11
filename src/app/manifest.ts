import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Calamuchita App",
    short_name: "Calamuchita",
    description: "Todo el Valle de Calamuchita en un solo lugar. Gastronomía, servicios, turismo y más.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#E1DBC9",
    theme_color: "#2D4530",
    categories: ["travel", "food", "lifestyle"],
    icons: [
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
    ],
  }
}
