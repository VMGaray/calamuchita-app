export default function HeroSection() {
  return (
    <section className="bg-primary-500 px-4 py-16 text-center">
      <span className="inline-block bg-primary-400 text-primary-100 text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
        Valle de Calamuchita · Córdoba
      </span>
      <h1 className="font-serif text-5xl text-sand-100 leading-tight mb-4">
        Todo el valle,<br />en un solo lugar
      </h1>
      <p className="text-primary-200 text-base max-w-md mx-auto mb-8 leading-relaxed">
        Gastronomía, salud, servicios, turismo y más. Explorá lo mejor de los pueblos serranos.
      </p>
      <div className="flex max-w-md mx-auto bg-sand-100 rounded-2xl overflow-hidden">
        <input
          type="text"
          placeholder="Buscar restaurantes, servicios..."
          className="flex-1 bg-transparent border-none outline-none px-5 py-3.5 text-stone-700 placeholder:text-stone-400 text-sm"
        />
        <button className="bg-accent-400 hover:bg-accent-300 text-accent-50 px-5 py-3.5 text-sm font-medium transition-colors">
          Buscar
        </button>
      </div>
    </section>
  )
}