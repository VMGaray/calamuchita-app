// Texto enriquecido mínimo para notas editoriales (Identidad Calamuchitana).
// Se guarda como texto plano: párrafos separados por una línea en blanco y
// negritas entre **asteriscos**. Así no hay HTML en la base ni riesgo de XSS.

const BOLD_RE = /\*\*([\s\S]+?)\*\*/g

export type RichSegment = { text: string; bold: boolean }

/** Párrafos (separados por líneas en blanco) con sus tramos normales y en negrita. */
export function parseRichText(src: string): RichSegment[][] {
  return src
    .replace(/\r\n?/g, "\n")
    .split(/\n[ \t]*\n+/)
    .map(p => p.replace(/^\n+|\n+$/g, ""))
    .filter(p => p.trim())
    .map(p => {
      const segs: RichSegment[] = []
      let last = 0
      for (const m of p.matchAll(BOLD_RE)) {
        if (m.index > last) segs.push({ text: p.slice(last, m.index), bold: false })
        segs.push({ text: m[1], bold: true })
        last = m.index + m[0].length
      }
      if (last < p.length) segs.push({ text: p.slice(last), bold: false })
      return segs
    })
}

/** Quita las marcas para usos en texto plano (previews, meta description). */
export function stripRichText(src: string): string {
  return src.replace(BOLD_RE, "$1")
}

// ── Pegado desde Word / Google Docs / web ─────────────────────────────────────

const BLOCK_TAGS = new Set([
  "P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE", "TR", "SECTION", "ARTICLE",
])

function isBoldElement(el: HTMLElement): boolean | null {
  const w = el.style.fontWeight
  if (w) return w === "bold" || w === "bolder" || Number(w) >= 600
  if (el.tagName === "B" || el.tagName === "STRONG") return true
  if (/^H[1-6]$/.test(el.tagName)) return true
  return null // hereda
}

/**
 * Convierte el HTML del portapapeles al formato de arriba, respetando párrafos
 * y negritas. Solo funciona en el navegador (usa DOMParser).
 */
export function htmlToRichText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html")
  const segs: RichSegment[] = []
  const push = (text: string, bold: boolean) => segs.push({ text, bold })

  const walk = (node: Node, bold: boolean) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // En HTML los saltos de línea del código fuente son espacios
      push((node.textContent ?? "").replace(/\s+/g, " "), bold)
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as HTMLElement
    if (["STYLE", "SCRIPT", "HEAD", "TITLE", "META"].includes(el.tagName)) return
    if (el.tagName === "BR") { push("\n", false); return }

    const isBlock = BLOCK_TAGS.has(el.tagName)
    if (isBlock) push("\n\n", false)
    if (el.tagName === "LI") push("• ", false)
    const childBold = isBoldElement(el) ?? bold
    el.childNodes.forEach(c => walk(c, childBold))
    if (isBlock) push("\n\n", false)
  }
  walk(doc.body, false)

  // Une tramos contiguos con el mismo formato y saca los espacios de los bordes
  // de las negritas para que no queden "** palabra**".
  let out = ""
  let i = 0
  while (i < segs.length) {
    const bold = segs[i].bold
    let text = ""
    while (i < segs.length && segs[i].bold === bold) text += segs[i++].text
    if (!bold || !text.trim()) { out += text; continue }
    const [, lead, core, trail] = text.match(/^(\s*)([\s\S]*?)(\s*)$/)!
    out += `${lead}**${core}**${trail}`
  }

  return out
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
