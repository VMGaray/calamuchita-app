import Link from "next/link"
import { MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Marca */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
                <MapPin size={14} className="text-primary-100" />
              </div>
              <span className="font-serif text-stone-800">Calamuchita App</span>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              La plataforma gastronómica del Valle de Calamuchita.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
              Explorar
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/negocios" className="text-sm text-stone-600 hover:text-primary-500 transition-colors">
                  Todos los comercios
                </Link>
              </li>
              <li>
                <Link href="/negocios?categoria=restaurant" className="text-sm text-stone-600 hover:text-primary-500 transition-colors">
                  Restaurantes
                </Link>
              </li>
              <li>
                <Link href="/negocios?categoria=cafe" className="text-sm text-stone-600 hover:text-primary-500 transition-colors">
                  Cafés
                </Link>
              </li>
              <li>
                <Link href="/negocios?categoria=viandas" className="text-sm text-stone-600 hover:text-primary-500 transition-colors">
                  Viandas
                </Link>
              </li>
            </ul>
          </div>

          {/* Comercios */}
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
              Para comercios
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/registro" className="text-sm text-stone-600 hover:text-primary-500 transition-colors">
                  Sumá tu local
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-stone-600 hover:text-primary-500 transition-colors">
                  Acceder al panel
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-stone-100 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-stone-400">
            © 2025 Calamuchita App · Valle de Calamuchita, Córdoba
          </p>
          <p className="text-xs text-stone-400">
            Hecho con amor en las sierras
          </p>
        </div>

      </div>
    </footer>
  )
}