import AnimateIn from "@/components/ui/AnimateIn"
import AnimatedCounter from "@/components/ui/AnimatedCounter"

const stats = [
  { value: 9, suffix: "", label: "Pueblos del valle", desc: "De VGB a Embalse y más" },
  { value: 50, suffix: "+", label: "Comercios", desc: "Locales activos en la plataforma" },
  { value: 8, suffix: "", label: "Categorías", desc: "Gastronomía, salud, servicios y más" },
  { value: 100, suffix: "%", label: "Local", desc: "Hecho en el Valle de Calamuchita" },
]

export default function StatsSection() {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-white/80 py-16 px-4 my-12 rounded-3xl">
      <AnimateIn direction="up">
        <h2 className="font-serif text-3xl text-primary-700 text-center mb-2">
          El valle en números
        </h2>
        <p className="text-primary-500 text-sm text-center mb-10">
          Una plataforma que crece con la comunidad
        </p>
      </AnimateIn>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {stats.map(({ value, suffix, label, desc }, i) => (
          <AnimateIn key={label} direction="up" delay={i * 0.1}>
            <div className="text-center">
              <p className="font-serif text-5xl text-primary-600 mb-1">
                <AnimatedCounter to={value} suffix={suffix} />
              </p>
              <p className="text-sm font-medium text-primary-700 mb-1">{label}</p>
              <p className="text-xs text-primary-400 leading-relaxed">{desc}</p>
            </div>
          </AnimateIn>
        ))}
      </div>
    </div>
  )
}