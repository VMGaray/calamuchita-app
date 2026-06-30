export function extractYoutubeId(url: string): string | null {
  if (!url?.trim()) return null
  try {
    const u = new URL(url.trim())
    // https://www.youtube.com/watch?v=ID
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return u.searchParams.get("v")
    }
    // https://www.youtube.com/embed/ID
    const embedMatch = u.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/)
    if (embedMatch) return embedMatch[1]
    // https://youtu.be/ID
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1).split("?")[0]
      if (id.length === 11) return id
    }
  } catch {
    return null
  }
  return null
}

export function isValidYoutubeUrl(url: string): boolean {
  return extractYoutubeId(url) !== null
}
