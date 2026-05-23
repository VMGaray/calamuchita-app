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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mipljgnmpkkfveoaqlyx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.mapbox.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 2592000,
    formats: ["image/avif", "image/webp"],
  },
}

export default withPWA(nextConfig)