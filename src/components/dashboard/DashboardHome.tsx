export default function DashboardHome() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl text-stone-800 mb-1">Buen día 👋</h1>
        <p className="text-stone-500">Resumen de tu local hoy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Pedidos hoy</p>
          <p className="text-3xl font-serif text-stone-800">0</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Reservas hoy</p>
          <p className="text-3xl font-serif text-stone-800">0</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Menú del día</p>
          <p className="text-sm text-accent-400 font-medium mt-1">Sin publicar</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-700">Estado del local</p>
            <p className="text-xs text-stone-400 mt-0.5">Los clientes pueden ver si estás abierto</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-500">Cerrado</span>
            <div className="w-10 h-6 bg-stone-200 rounded-full cursor-pointer" />
            <span className="text-sm text-stone-500">Abierto</span>
          </div>
        </div>
      </div>
    </div>
  )
}