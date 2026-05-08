const items = [
  "Villa General Belgrano",
  "Los Reartes",
  "Santa Rosa de Calamuchita",
  "La Cumbrecita",
  "Yacanto",
  "Amboy",
  "Villa Ciudad de América",
  "Embalse",
  "Villa del Dique",
]

export default function MarqueeBand() {
  return (
    <div
      className="py-2.5 overflow-hidden"
      style={{
        background: "rgba(45,69,48,0.06)",
        borderTop: "1px solid rgba(45,69,48,0.08)",
        borderBottom: "1px solid rgba(45,69,48,0.08)",
      }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: "marquee-scroll 25s linear infinite",
          willChange: "transform",
        }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="text-xs font-medium tracking-widest uppercase inline-flex items-center"
            style={{ color: "rgba(45,69,48,0.4)", marginRight: "2rem" }}
          >
            {item}
            <span style={{ color: "rgba(45,69,48,0.18)", marginLeft: "2rem" }}>✦</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
