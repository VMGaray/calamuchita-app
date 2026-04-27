import Link from "next/link"
import { sectionCategories, SectionKey } from "@/lib/sections"

interface Props {
  section: SectionKey
}

export default function CategoriesGrid({ section }: Props) {
  const categories = sectionCategories[section] || sectionCategories.gastronomy

  return (
    <div className="mb-12">
      <h2 className="font-serif text-2xl text-stone-900 mb-6">Categorías</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map(({ label, desc, href, bg, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-primary-300 transition-all"
          >
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <span className={`text-lg ${color}`}>●</span>
            </div>
            <h3 className="text-sm font-medium text-stone-800 mb-1">{label}</h3>
            <p className="text-xs text-stone-400 leading-relaxed">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}