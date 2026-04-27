import Link from "next/link"
import { MapPin } from "lucide-react"

export default function Header() {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <MapPin size={14} className="text-primary-100" />
            </div>
            <span className="font-serif text-stone-800">Calamuchita App</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-stone-600 hover:text-primary-500 transition-colors">
              Ingresar
            </Link>
            <Link href="/registro" className="text-sm bg-primary-500 hover:bg-primary-400 text-primary-100 px-4 py-2 rounded-xl transition-colors">
              Registrate
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}