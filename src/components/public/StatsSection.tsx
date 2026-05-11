import AnimateIn from "@/components/ui/AnimateIn"
import AnimatedCounter from "@/components/ui/AnimatedCounter"

interface Props {
  pueblosCount: number
  comerciosCount: number
  categoriasCount: number
}

export default function StatsSection({ pueblosCount, comerciosCount, categoriasCount }: Props) {
  const stats = [
    {
      value: pueblosCount,
      suffix: "",
      label: "Pueblos del valle",
      desc: "De VGB a Embalse y más allá",
    },
    {
      value: comerciosCount,
      suffix: "+",
      label: "Comercios activos",
      desc: "Locales verificados en la plataforma",
    },
    {
      value: categoriasCount,
      suffix: "",
      label: "Categorías",
      desc: "Gastronomía, salud, servicios y más",
    },
    {
      value: 100,
      suffix: "%",
      label: "Local",
      desc: "Hecho en el Valle de Calamuchita",
    },
  ]

  return (
    <div
      className="relative overflow-hidden py-10 md:py-16 px-4 my-8 md:my-12 rounded-3xl"
      style={{
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(45,69,48,0.1)",
      }}
    >
      {/* Textura topográfica */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.04 }}
        viewBox="0 0 1200 300"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M-60,240 Q80,150 190,130 Q275,115 320,138 Q385,165 360,232 Q340,290 240,310 Q130,330 30,300 Q-40,278 -60,240Z" stroke="#2D4530" strokeWidth="2" />
        <path d="M10,240 Q130,168 212,150 Q262,138 300,156 Q350,176 330,232 Q310,280 224,300 Q148,318 68,296 Q10,278 10,240Z" stroke="#2D4530" strokeWidth="1.5" />
        <path d="M72,236 Q172,190 226,176 Q254,168 278,182 Q312,200 296,234 Q280,264 234,278 Q188,292 142,282 Q86,270 72,236Z" stroke="#2D4530" strokeWidth="1.2" />
        <path d="M520,262 Q660,178 768,158 Q852,144 906,158 Q980,176 970,240 Q960,290 882,312 Q806,332 702,328 Q612,324 554,296 Q516,276 520,262Z" stroke="#2D4530" strokeWidth="2" />
        <path d="M578,258 Q700,190 768,172 Q822,160 864,172 Q922,192 914,240 Q906,278 846,298 Q786,316 704,312 Q634,308 586,284 Q558,270 578,258Z" stroke="#2D4530" strokeWidth="1.5" />
        <path d="M980,218 Q1060,152 1130,144 Q1186,138 1210,158 Q1240,182 1232,218 Q1224,248 1180,262 Q1132,276 1080,264 Q1020,250 990,230 Q976,222 980,218Z" stroke="#2D4530" strokeWidth="1.5" />
        <path d="M0,268 Q180,256 320,260 Q440,264 540,250 Q650,234 760,242 Q880,250 1000,236 Q1120,224 1200,230" stroke="#2D4530" strokeWidth="1" strokeDasharray="10 7" opacity="0.7" />
      </svg>

      <div className="relative z-10">
        <AnimateIn direction="up">
          <h2 className="font-serif text-3xl text-center mb-2" style={{ color: "#2D4530" }}>
            El valle en números
          </h2>
          <p className="text-sm text-center mb-12" style={{ color: "rgba(45,69,48,0.5)" }}>
            Una plataforma que crece con la comunidad
          </p>
        </AnimateIn>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
          {stats.map(({ value, suffix, label, desc }, i) => (
            <AnimateIn key={label} direction="up" delay={i * 0.1}>
              <div className="text-center group">
                <p
                  className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-none mb-2"
                  style={{ color: "#2D4530" }}
                >
                  <AnimatedCounter to={value} suffix={suffix} duration={2} />
                </p>
                <div
                  className="h-0.5 w-8 mx-auto mb-3 rounded-full transition-all duration-300 group-hover:w-14"
                  style={{ background: "rgba(45,69,48,0.2)" }}
                />
                <p className="text-sm font-semibold mb-1" style={{ color: "#3C3C3C" }}>
                  {label}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(45,69,48,0.45)" }}>
                  {desc}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </div>
  )
}
