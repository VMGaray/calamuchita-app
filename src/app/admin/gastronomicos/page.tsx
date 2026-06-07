"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  UtensilsCrossed,
  BookOpen,
  ShoppingBag,
  CalendarDays,
  BarChart2,
  Settings,
  ChevronRight,
  MapPin,
  LogOut,
  Eye,
} from "lucide-react"

const sections = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Inicio",
    color: "rgba(200,96,58,0.1)",
    iconColor: "#c8603a",
    description: "Resumen del día: pedidos de hoy, reservas, estado del menú y ventas del mes. También tiene el botón para marcar el local como abierto o cerrado.",
    features: ["Contador de pedidos del día", "Reservas pendientes", "Estado del menú del día", "Toggle abierto / cerrado", "Pedidos recientes"],
  },
  {
    href: "/dashboard/menu-del-dia",
    icon: UtensilsCrossed,
    label: "Menú del día",
    color: "rgba(45,69,48,0.08)",
    iconColor: "#2D4530",
    description: "Cargá el menú de cada día: entrada, principal, postre y precio. Lo publicás cuando está listo y los clientes lo ven en la app al instante.",
    features: ["Entrada, principal y postre", "Precio del menú completo", "Publicar / despublicar", "Se reinicia cada día"],
  },
  {
    href: "/dashboard/carta",
    icon: BookOpen,
    label: "Carta",
    color: "rgba(45,69,48,0.08)",
    iconColor: "#2D4530",
    description: "Cargá los platos y bebidas de la carta permanente con nombre, descripción, precio y foto. Los clientes la ven en el perfil de tu local.",
    features: ["Platos con foto y precio", "Categorías (entradas, principales, postres…)", "Visibles en el perfil público"],
  },
  {
    href: "/dashboard/pedidos",
    icon: ShoppingBag,
    label: "Pedidos",
    color: "rgba(200,96,58,0.1)",
    iconColor: "#c8603a",
    description: "Gestioná los pedidos que llegan desde la app: delivery o take away. Podés ver el detalle de cada pedido y actualizarlos a preparado / listo / entregado.",
    features: ["Pedidos de delivery y take away", "Estado: nuevo / en preparación / listo / entregado", "Detalle de productos y totales"],
  },
  {
    href: "/dashboard/reservas",
    icon: CalendarDays,
    label: "Reservas",
    color: "rgba(45,69,48,0.08)",
    iconColor: "#2D4530",
    description: "Ves todas las reservas de mesa: nombre, cantidad de personas, fecha y hora. Podés confirmarlas o cancelarlas desde acá.",
    features: ["Reservas con nombre y contacto", "Confirmación o rechazo", "Vista por fecha"],
  },
  {
    href: "/dashboard/estadisticas",
    icon: BarChart2,
    label: "Estadísticas",
    color: "rgba(45,69,48,0.08)",
    iconColor: "#2D4530",
    description: "Mirá cómo viene tu negocio: vistas al perfil, clicks en WhatsApp, pedidos totales y evolución mensual. Todo en gráficos simples.",
    features: ["Vistas al perfil", "Clicks en WhatsApp", "Pedidos por mes", "Gráfico de evolución"],
  },
  {
    href: "/dashboard/configuracion",
    icon: Settings,
    label: "Mi local",
    color: "rgba(45,69,48,0.08)",
    iconColor: "#2D4530",
    description: "Todo sobre el local: nombre, descripción, dirección, coordenadas, teléfono, WhatsApp, Instagram, horarios, fotos, carta en PDF, formas de pago y más.",
    features: ["Datos del local y contacto", "Pueblo y dirección + coordenadas", "Logo y fotos del lugar", "Horarios de atención", "Servicios: delivery, take away, salón", "Formas de pago y pet friendly"],
  },
]

export default function VistaGastronomicosPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Eye size={16} className="text-stone-400" />
          <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Vista previa</span>
        </div>
        <h1 className="text-2xl text-stone-800 mb-1">Panel del gastronómico</h1>
        <p className="text-stone-500 text-sm">Así ve un gastronómico su panel de control cuando entra a la app.</p>
      </div>

      {/* Maqueta del sidebar del gastronómico */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-8">
        <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Barra de navegación que ve el gastronómico</p>
        </div>
        <div className="p-4">
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            {/* Mobile nav mock */}
            <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto border-b border-stone-100 bg-stone-50 [scrollbar-width:none]">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 mr-1" style={{ background: "#2D4530" }}>
                <MapPin size={13} className="text-white" />
              </div>
              {sections.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap flex-shrink-0 bg-stone-100 text-stone-600"
                >
                  <Icon size={12} />
                  {label}
                </span>
              ))}
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap flex-shrink-0 text-red-400 bg-red-50 ml-auto">
                <LogOut size={12} />
                Salir
              </span>
            </div>
            <div className="px-4 py-3 bg-white">
              <p className="text-xs text-stone-400">↑ En mobile aparece como barra horizontal deslizable</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(({ href, icon: Icon, label, color, iconColor, description, features }) => (
          <div key={href} className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col gap-4">
            {/* Header de la tarjeta */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: color }}
              >
                <Icon size={18} style={{ color: iconColor }} />
              </div>
              <div>
                <p className="font-semibold text-stone-800">{label}</p>
                <p className="text-xs text-stone-400">/dashboard{href === "/dashboard" ? "" : href.replace("/dashboard", "")}</p>
              </div>
            </div>

            {/* Descripción */}
            <p className="text-sm text-stone-600 leading-relaxed">{description}</p>

            {/* Features */}
            <ul className="space-y-1.5">
              {features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-stone-500">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: iconColor }} />
                  {f}
                </li>
              ))}
            </ul>

            {/* Link */}
            <Link
              href={href}
              target="_blank"
              className="mt-auto flex items-center justify-between px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <span>Abrir esta sección</span>
              <ChevronRight size={14} className="text-stone-400" />
            </Link>
          </div>
        ))}
      </div>

      {/* Footer aclaratorio */}
      <div className="mt-6 bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4">
        <p className="text-xs text-stone-500">
          Al abrir las secciones con tu usuario de admin vas a ver la interfaz real pero sin datos de ningún negocio. Cada gastronómico ve sus propios pedidos, reservas y estadísticas cuando entra con su cuenta.
        </p>
      </div>
    </div>
  )
}
