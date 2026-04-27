export default function HomePage() {
  return (
    <div>
      <section className="bg-sand-100 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl text-stone-900 mb-4">
            El valle en tu bolsillo
          </h1>
          <p className="text-lg text-stone-500 mb-8">
            Explorá los mejores restaurantes, cafés y viandas del Valle de Calamuchita. Pedí, reservá y disfrutá.
          </p>
          <a
            href="/negocios"
            className="inline-block bg-primary-500 hover:bg-primary-400 text-primary-100 px-8 py-3 rounded-xl text-base font-medium transition-colors"
    >
            Explorar comercios
          </a>
        </div>
      </section>
    </div>
  )
}