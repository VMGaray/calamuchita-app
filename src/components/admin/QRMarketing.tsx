"use client"

import { Download, Printer } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"

interface Props {
  name: string
  slug: string
  section: string
}

const BASE_URL = "https://www.calamuchita-app.com.ar"
const QR_ID = "qr-mkt-canvas"

// Inline PIN icon — white rounded bg so it's visible against the green QR dots
const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30">
  <rect x="-3" y="-3" width="30" height="30" rx="6" fill="white"/>
  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="#2D4530"/>
  <circle cx="12" cy="10" r="3.2" fill="white"/>
</svg>`
const PIN_DATA_URL = `data:image/svg+xml,${encodeURIComponent(PIN_SVG)}`

function getPublicUrl(slug: string, section: string): string {
  if (section === "gastronomy") return `${BASE_URL}/negocios/${slug}`
  return `${BASE_URL}/directorio/${section}/${slug}`
}

function getCanvas(): HTMLCanvasElement | null {
  return document.getElementById(QR_ID) as HTMLCanvasElement | null
}

export default function QRMarketing({ name, slug, section }: Props) {
  const url = getPublicUrl(slug, section)

  const handleDownload = () => {
    const canvas = getCanvas()
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `qr-${slug}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const handlePrint = () => {
    const canvas = getCanvas()
    if (!canvas) return
    const qrDataUrl = canvas.toDataURL("image/png")

    const win = window.open("", "_blank")
    if (!win) return

    win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Cartel - ${name}</title>
  <style>
    @page { size: A5 portrait; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 148mm;
      height: 210mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0;
      background: #F5F0E8;
      font-family: Georgia, 'Times New Roman', serif;
      padding: 14mm 16mm;
    }
    .app-name {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #2D4530;
      margin-bottom: 10mm;
      opacity: 0.7;
    }
    .biz-name {
      font-size: 26px;
      color: #1C1C1C;
      text-align: center;
      line-height: 1.25;
      margin-bottom: 10mm;
      max-width: 100%;
      word-break: break-word;
    }
    .qr-wrap {
      padding: 6mm;
      background: #ffffff;
      border-radius: 8px;
      margin-bottom: 10mm;
      box-shadow: 0 2px 12px rgba(45,69,48,0.12);
    }
    .qr-wrap img {
      display: block;
      width: 80mm;
      height: 80mm;
    }
    .tagline {
      font-size: 13px;
      color: #2D4530;
      text-align: center;
      font-style: italic;
      line-height: 1.5;
      max-width: 110mm;
    }
    .divider {
      width: 20mm;
      height: 2px;
      background: #C9A44B;
      border-radius: 2px;
      margin: 6mm auto;
    }
  </style>
</head>
<body>
  <p class="app-name">Calamuchita App</p>
  <h1 class="biz-name">${name}</h1>
  <div class="qr-wrap">
    <img src="${qrDataUrl}" alt="QR Code" />
  </div>
  <div class="divider"></div>
  <p class="tagline">Escaneá para ver nuestras promos y contacto</p>
</body>
</html>`)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
    }, 400)
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6">
      <h2 className="text-sm font-medium text-stone-700 mb-0.5">Material de marketing</h2>
      <p className="text-xs text-stone-400 mb-5">QR para imprimir o compartir</p>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* QR preview */}
        <div className="flex-shrink-0 p-3 bg-stone-50 rounded-2xl border border-stone-100">
          <QRCodeCanvas
            id={QR_ID}
            value={url}
            size={180}
            fgColor="#2D4530"
            bgColor="#FFFFFF"
            level="H"
            imageSettings={{
              src: PIN_DATA_URL,
              height: 52,
              width: 52,
              excavate: true,
            }}
          />
        </div>

        {/* Info + actions */}
        <div className="flex-1 w-full space-y-3">
          <div className="bg-stone-50 rounded-xl p-3">
            <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wide mb-1">URL pública</p>
            <p className="text-xs text-stone-600 break-all font-mono leading-relaxed">{url}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-xs font-medium transition-colors"
            >
              <Download size={13} />
              Descargar PNG
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-medium hover:bg-stone-50 transition-colors"
            >
              <Printer size={13} />
              Imprimir cartel A5
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
