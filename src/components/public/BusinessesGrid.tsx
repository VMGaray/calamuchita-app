const businesses = [
  { name: "La Casona del Valle", type: "Restaurante", location: "VGB", open: true, hasMenu: true, bg: "bg-primary-100" },
  { name: "Café del Bosque", type: "Café", location: "Los Reartes", open: true, hasMenu: false, bg: "bg-accent-100" },
  { name: "El Rincón Serrano", type: "Parrilla", location: "Santa Rosa", open: false, hasMenu: false, bg: "bg-stone-200" },
  { name: "Viandas de María", type: "Viandas", location: "VGB", open: true, hasMenu: true, bg: "bg-purple-100" },
]

export default function BusinessesGrid() {
  return (
    <div className="mb-12">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-serif text-2xl text-stone-900">Abiertos ahora</h2>
        <a href="/negocios" className="text-sm text-primary-500 font-medium hover:text-primary-600">
          Ver todos
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {businesses.map(({ name, type, location, open, hasMenu, bg }) => (
          <div key={name} className="bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-primary-300 transition-all cursor-pointer">
            <div className={`${bg} h-24 flex items-center justify-center`}>
              <div className="w-10 h-10 bg-white/50 rounded-full" />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-stone-800 mb-0.5 truncate">{name}</h3>
              <p className="text-xs text-stone-400 mb-2">{type} · {location}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${open ? "bg-primary-100 text-primary-600" : "bg-stone-100 text-stone-500"}`}>
                  {open ? "Abierto" : "Cerrado"}
                </span>
                {hasMenu && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-100 text-accent-500">
                    Menú del día
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}