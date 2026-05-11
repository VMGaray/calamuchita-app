export default function WaveDivider({
  fill,
  bgColor,
}: {
  fill: string
  bgColor?: string
}) {
  return (
    <div aria-hidden style={{ background: bgColor, lineHeight: 0, display: "block" }}>
      <svg
        viewBox="0 0 1440 80"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: 72 }}
      >
        <path
          d="M0,38 C180,72 360,4 540,34 C720,64 900,8 1080,38 C1200,58 1320,18 1440,42 L1440,80 L0,80 Z"
          fill={fill}
        />
      </svg>
    </div>
  )
}
