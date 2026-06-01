"use client"

import { useState } from "react"
import AdminLocalidades from "./AdminLocalidades"
import AdminServiciosUtiles from "./AdminServiciosUtiles"
import AdminTransporte from "./AdminTransporte"

type Tab = "servicios" | "transporte" | "localidades"

const TABS: { key: Tab; label: string; desc: string }[] = [
  { key: "servicios",   label: "Servicios",   desc: "Cooperativas, salud, farmacias, emergencias y más — organizados por localidad" },
  { key: "transporte",  label: "Transporte",  desc: "Horarios de micros y traslados" },
  { key: "localidades", label: "Localidades", desc: "Administrar la lista de pueblos del valle" },
]

export default function AdminInfoUtil() {
  const [tab, setTab] = useState<Tab>("servicios")
  const activeTab = TABS.find(t => t.key === tab)!

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl text-stone-800 mb-1">Info Útil</h1>
        <p className="text-stone-500 text-sm">Gestión de servicios y contactos del Valle de Calamuchita</p>
      </div>

      <div className="flex flex-wrap gap-1 p-1 rounded-2xl mb-2 w-fit" style={{ background: "rgba(45,69,48,0.07)" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={tab === t.key ? { background: "#2D4530", color: "white" } : { color: "rgba(45,69,48,0.6)" }}>
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-xs mb-6" style={{ color: "rgba(45,69,48,0.45)" }}>{activeTab.desc}</p>

      {tab === "servicios"   && <AdminServiciosUtiles />}
      {tab === "transporte"  && <AdminTransporte />}
      {tab === "localidades" && <AdminLocalidades />}
    </div>
  )
}
