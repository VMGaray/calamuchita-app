"use client"

import { Download, Printer, QrCode } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"

const APP_URL = "https://calamuchita.app"
const QR_ID = "qr-app-main"

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30">
  <rect x="-3" y="-3" width="30" height="30" rx="6" fill="white"/>
  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="#2D4530"/>
  <circle cx="12" cy="10" r="3.2" fill="white"/>
</svg>`
const PIN_DATA_URL = `data:image/svg+xml,${encodeURIComponent(PIN_SVG)}`

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function buildStickerCanvas(qrCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const S = 900
  const c = document.createElement("canvas")
  c.width = S
  c.height = S
  const ctx = c.getContext("2d")!

  // Background
  ctx.fillStyle = "#2D4530"
  roundRect(ctx, 0, 0, S, S, 140)
  ctx.fill()

  // Gold outer ring
  ctx.strokeStyle = "#C9A44B"
  ctx.lineWidth = 6
  roundRect(ctx, 24, 24, S - 48, S - 48, 120)
  ctx.stroke()

  // Gold inner ring (thin)
  ctx.strokeStyle = "rgba(201,164,75,0.35)"
  ctx.lineWidth = 2
  roundRect(ctx, 40, 40, S - 80, S - 80, 108)
  ctx.stroke()

  // App name — top
  ctx.fillStyle = "#F5F0E8"
  ctx.font = "700 44px Arial, Helvetica, sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("CALAMUCHITA APP", S / 2, 106)

  // Decorative dots row
  ctx.fillStyle = "#C9A44B"
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.arc(S / 2 - 24 + i * 12, 150, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // White QR backing card
  const QR = 420
  const qx = (S - QR) / 2
  const qy = 185
  ctx.fillStyle = "#FFFFFF"
  roundRect(ctx, qx - 28, qy - 28, QR + 56, QR + 56, 24)
  ctx.fill()

  // QR image
  ctx.drawImage(qrCanvas, qx, qy, QR, QR)

  // Decorative dots row — bottom
  ctx.fillStyle = "#C9A44B"
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.arc(S / 2 - 24 + i * 12, S - 156, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // Tagline
  ctx.fillStyle = "#F5F0E8"
  ctx.font = "italic 34px Georgia, 'Times New Roman', serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("Todo el valle en un mismo lugar", S / 2, S - 112)

  // URL — very small
  ctx.fillStyle = "rgba(245,240,232,0.45)"
  ctx.font = "22px Arial, Helvetica, sans-serif"
  ctx.fillText("calamuchita.app", S / 2, S - 68)

  return c
}

export default function QRAppMarketing() {
  const handleDownloadQR = () => {
    const canvas = document.getElementById(QR_ID) as HTMLCanvasElement | null
    if (!canvas) return
    const link = document.createElement("a")
    link.download = "qr-calamuchita-app.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const handleDownloadSticker = () => {
    const qrCanvas = document.getElementById(QR_ID) as HTMLCanvasElement | null
    if (!qrCanvas) return
    const sticker = buildStickerCanvas(qrCanvas)
    const link = document.createElement("a")
    link.download = "calco-calamuchita-app.png"
    link.href = sticker.toDataURL("image/png")
    link.click()
  }

  const handlePrintSticker = () => {
    const qrCanvas = document.getElementById(QR_ID) as HTMLCanvasElement | null
    if (!qrCanvas) return
    const qrDataUrl = qrCanvas.toDataURL("image/png")

    const win = window.open("", "_blank")
    if (!win) return

    win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Calco Calamuchita App</title>
  <style>
    @page { size: 100mm 100mm; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 100mm;
      height: 100mm;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0ece0;
    }
    .sticker {
      width: 92mm;
      height: 92mm;
      border-radius: 16mm;
      background: #2D4530;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 7mm;
      box-shadow: 0 0 0 1.5mm #C9A44B;
      outline: 0.5mm solid rgba(201,164,75,0.3);
      outline-offset: -3mm;
    }
    .app-name {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #F5F0E8;
    }
    .qr-wrap {
      background: #fff;
      border-radius: 4mm;
      padding: 3mm;
      flex-shrink: 0;
    }
    .qr-wrap img {
      display: block;
      width: 52mm;
      height: 52mm;
    }
    .tagline {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 7px;
      font-style: italic;
      color: #F5F0E8;
      text-align: center;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="sticker">
    <p class="app-name">Calamuchita App</p>
    <div class="qr-wrap">
      <img src="${qrDataUrl}" alt="QR Code">
    </div>
    <p class="tagline">Todo el valle en un mismo lugar</p>
  </div>
</body>
</html>`)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 400)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl text-stone-800 mb-1">Marketing App</h1>
        <p className="text-stone-500 text-sm">Materiales para promocionar Calamuchita App en el valle</p>
      </div>

      {/* QR principal */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <QrCode size={15} className="text-primary-500" />
          <h2 className="text-sm font-medium text-stone-700">QR de la App</h2>
        </div>
        <p className="text-xs text-stone-400 mb-6">Apunta a la home de Calamuchita App</p>

        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* QR preview */}
          <div
            className="flex-shrink-0 rounded-2xl p-4 border border-stone-100"
            style={{ background: "#2D4530" }}
          >
            <div className="bg-white rounded-xl p-3">
              <QRCodeCanvas
                id={QR_ID}
                value={APP_URL}
                size={200}
                fgColor="#2D4530"
                bgColor="#FFFFFF"
                level="H"
                imageSettings={{
                  src: PIN_DATA_URL,
                  height: 56,
                  width: 56,
                  excavate: true,
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex-1 w-full space-y-4">
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wide mb-1">URL</p>
              <p className="text-sm text-stone-700 font-mono">{APP_URL}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-stone-500">Descargar</p>
              <button
                onClick={handleDownloadQR}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-stone-700">Solo el QR</p>
                  <p className="text-xs text-stone-400">PNG 200×200px — para usar en diseños</p>
                </div>
                <Download size={15} className="text-stone-400 flex-shrink-0" />
              </button>
              <button
                onClick={handleDownloadSticker}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-stone-700">Diseño de calcomanía</p>
                  <p className="text-xs text-stone-400">PNG 900×900px — lista para imprenta</p>
                </div>
                <Download size={15} className="text-stone-400 flex-shrink-0" />
              </button>
            </div>

            <div>
              <p className="text-xs font-medium text-stone-500 mb-2">Imprimir</p>
              <button
                onClick={handlePrintSticker}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium">Imprimir calco (100×100mm)</p>
                  <p className="text-xs opacity-70">Vista previa A4 con calco a escala</p>
                </div>
                <Printer size={15} className="flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview del calco */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-sm font-medium text-stone-700 mb-1">Preview del calco</h2>
        <p className="text-xs text-stone-400 mb-5">Diseño de 100×100mm con esquinas redondeadas</p>
        <div className="flex items-center justify-center py-4">
          <div
            className="flex flex-col items-center justify-between"
            style={{
              width: 200,
              height: 200,
              borderRadius: 32,
              background: "#2D4530",
              padding: 16,
              boxShadow: "0 0 0 3px #C9A44B, inset 0 0 0 2px rgba(201,164,75,0.25)",
            }}
          >
            <p
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.15em",
                color: "#F5F0E8",
                textTransform: "uppercase",
              }}
            >
              Calamuchita App
            </p>
            <div style={{ background: "#fff", borderRadius: 10, padding: 8 }}>
              <QRCodeCanvas
                value={APP_URL}
                size={100}
                fgColor="#2D4530"
                bgColor="#FFFFFF"
                level="H"
                imageSettings={{
                  src: PIN_DATA_URL,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>
            <p
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 9,
                fontStyle: "italic",
                color: "#F5F0E8",
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              Todo el valle en un mismo lugar
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
