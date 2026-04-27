export default function AdminHome() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl text-stone-800 mb-1">Panel de administración</h1>
        <p className="text-stone-500">Gestioná todos los negocios del valle</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Negocios activos</p>
          <p className="text-3xl font-serif text-stone-800">0</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Pendientes</p>
          <p className="text-3xl font-serif text-stone-800">0</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Usuarios</p>
          <p className="text-3xl font-serif text-stone-800">0</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Pedidos hoy</p>
          <p className="text-3xl font-serif text-stone-800">0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-base font-medium text-stone-700 mb-4">Accesos rápidos</h2>
          <div className="space-y-2">
            <a href="/admin/negocios/nuevo" className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
              <span className="text-sm text-stone-600">Agregar negocio de directorio</span>
              <span className="text-primary-500 text-sm">→</span>
            </a>
            <a href="/admin/gastronomia" className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
              <span className="text-sm text-stone-600">Ver comercios pendientes</span>
              <span className="text-primary-500 text-sm">→</span>
            </a>
            <a href="/admin/info-util" className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
              <span className="text-sm text-stone-600">Gestionar info útil</span>
              <span className="text-primary-500 text-sm">→</span>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-base font-medium text-stone-700 mb-4">Negocios por sección</h2>
          <div className="space-y-2">
            {["Gastronomía", "Servicios", "Salud", "Educación", "Turismo", "Comercios", "Eventos"].map(s => (
              <div key={s} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-stone-600">{s}</span>
                <span className="text-sm font-medium text-stone-400">0</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}