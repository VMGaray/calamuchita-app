"use client"

import { useEffect, useRef } from "react"

export default function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particleRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const bg = canvasRef.current
    const pc = particleRef.current
    if (!bg || !pc) return
    const gl = bg.getContext("webgl")
    const ctx = pc.getContext("2d")
    if (!gl || !ctx) return

    const resize = () => {
      const w = bg.offsetWidth, h = bg.offsetHeight
      bg.width = pc.width = w * devicePixelRatio
      bg.height = pc.height = h * devicePixelRatio
      gl.viewport(0, 0, bg.width, bg.height)
    }
    resize()
    window.addEventListener("resize", resize)

    const vert = `attribute vec2 p; void main(){gl_Position=vec4(p,0,1);}`
    const frag = `
      precision mediump float;
      uniform float t; uniform vec2 res; uniform vec2 mouse;
      float noise(vec2 p){
        vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
        return mix(
          mix(fract(sin(dot(i,vec2(127.1,311.7)))*43758.5),fract(sin(dot(i+vec2(1,0),vec2(127.1,311.7)))*43758.5),u.x),
          mix(fract(sin(dot(i+vec2(0,1),vec2(127.1,311.7)))*43758.5),fract(sin(dot(i+vec2(1,1),vec2(127.1,311.7)))*43758.5),u.x),u.y);
      }
      float fbm(vec2 p){float v=0.,a=0.5;for(int i=0;i<3;i++){v+=a*noise(p);p=p*2.1+vec2(1.7,9.2);a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/res; uv.y=1.-uv.y;
        vec3 base=vec3(0.945,0.898,0.847);
        vec3 warm=vec3(0.925,0.820,0.745);
        vec3 accent=vec3(0.900,0.710,0.620);
        float n1=fbm(uv*2.2+vec2(t*0.05,0.));
        float n2=fbm(uv*1.6-vec2(0.,t*0.035)+vec2(2.3,1.1));
        vec3 col=mix(base,warm,n1*0.7);
        col=mix(col,accent,n2*0.45);
        float vig=1.-length((uv-0.5)*1.4);
        col=mix(col*0.93,col,smoothstep(0.,1.,vig));
        vec2 m=mouse/res; m.y=1.-m.y;
        col+=vec3(0.05,0.02,0.01)*exp(-length(uv-m)*2.5)*0.4;
        gl_FragColor=vec4(clamp(col,0.,1.),1.);
      }
    `

    function mkShader(type: number, src: string) {
      const s = gl!.createShader(type)!
      gl!.shaderSource(s, src); gl!.compileShader(s); return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, vert))
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, frag))
    gl.linkProgram(prog); gl.useProgram(prog)
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const tl = gl.getUniformLocation(prog, 't')
    const rl = gl.getUniformLocation(prog, 'res')
    const ml = gl.getUniformLocation(prog, 'mouse')

    let mx = bg.width/2, my = bg.height/2, tmx = mx, tmy = my

    const onMove = (e: MouseEvent) => {
      const r = bg.getBoundingClientRect()
      mx = (e.clientX - r.left) * devicePixelRatio
      my = (e.clientY - r.top) * devicePixelRatio
    }
    window.addEventListener("mousemove", onMove)

    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * bg.width, y: Math.random() * bg.height,
      r: Math.random() * 1.2 + 0.2,
      vx: (Math.random() - .5) * 0.15, vy: (Math.random() - .5) * 0.15,
      o: Math.random() * 0.4 + 0.05,
      tw: Math.random() * Math.PI * 2
    }))

    let rafId: number
    function render(ts: number) {
      if (!document.hidden) {
        tmx += (mx - tmx) * 0.08; tmy += (my - tmy) * 0.08
        gl!.uniform1f(tl, ts * 0.001)
        gl!.uniform2f(rl, bg!.width, bg!.height)
        gl!.uniform2f(ml, tmx, tmy)
        gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)

        ctx!.clearRect(0, 0, pc!.width, pc!.height)
        pts.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.tw += 0.015
          if (p.x < 0) p.x = pc!.width; if (p.x > pc!.width) p.x = 0
          if (p.y < 0) p.y = pc!.height; if (p.y > pc!.height) p.y = 0
          const o = p.o * (0.4 + 0.6 * Math.sin(p.tw))
          ctx!.beginPath(); ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(255,240,220,${o})`; ctx!.fill()
          if (Math.sin(p.tw * 2) > 0.85) {
            ctx!.beginPath(); ctx!.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2)
            ctx!.fillStyle = `rgba(255,220,190,${o * 0.15})`; ctx!.fill()
          }
        })
      }
      rafId = requestAnimationFrame(render)
    }
    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: "block" }} />
      <canvas ref={particleRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ display: "block" }} />
    </>
  )
}