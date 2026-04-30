"use client"

import { useEffect, useRef } from "react"

export default function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl")
    if (!gl) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener("resize", resize)

    const vert = `attribute vec2 pos; void main() { gl_Position = vec4(pos, 0.0, 1.0); }`

    const frag = `
      precision highp float;
      uniform float time;
      uniform vec2 res;
      uniform vec2 mouse;

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float smoothNoise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(noise(i), noise(i+vec2(1,0)), u.x), mix(noise(i+vec2(0,1)), noise(i+vec2(1,1)), u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 6; i++) { v += a * smoothNoise(p); p = p * 2.1 + vec2(1.7, 9.2); a *= 0.5; }
        return v;
      }

      vec3 bluepalette(float t) {
        vec3 dark  = vec3(0.32, 0.48, 0.72);
        vec3 mid   = vec3(0.42, 0.60, 0.85);
        vec3 light = vec3(0.64, 0.74, 0.93);
        vec3 col = mix(dark, mid, smoothstep(0.0, 0.5, t));
        col = mix(col, light, smoothstep(0.5, 1.0, t));
        col += 0.04 * sin(t * 12.0 + time * 0.5);
        return col;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / res;
        uv.y = 1.0 - uv.y;
        vec2 m = mouse / res; m.y = 1.0 - m.y;

        float d = length(uv - m);
        float strength = 0.35 * exp(-d * 1.8);
       vec2 distort = uv + normalize(uv - m + 0.001) * strength * sin(time * 2.5 + d * 8.0);

        float n1 = fbm(distort * 2.2 + time * 0.18);
        float n2 = fbm(distort * 1.6 - time * 0.13 + vec2(4.1, 2.3));
        float n3 = fbm(distort * 3.0 + time * 0.08 + vec2(1.5, 7.2));

        float combined = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
        combined += 0.1 * sin(distort.x * 5.0 + time * 0.4) * cos(distort.y * 4.0 - time * 0.3);

        vec3 col = bluepalette(combined);

        float aber = 0.003;
        float r = fbm((distort + vec2(aber, 0.0)) * 2.2 + time * 0.1);
        float b = fbm((distort - vec2(aber, 0.0)) * 2.2 + time * 0.1);
        col.r = mix(col.r, bluepalette(r).r, 0.3);
        col.b = mix(col.b, bluepalette(b).b, 0.3);
        col = pow(col, vec3(0.92));

        gl_FragColor = vec4(col, 1.0);
      }
    `

    function compile(src: string, type: number) {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(vert, gl.VERTEX_SHADER))
    gl.attachShader(prog, compile(frag, gl.FRAGMENT_SHADER))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(prog, "pos")
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const timeLoc = gl.getUniformLocation(prog, "time")
    const resLoc = gl.getUniformLocation(prog, "res")
    const mouseLoc = gl.getUniformLocation(prog, "mouse")

    gl.uniform2f(resLoc, canvas.width, canvas.height)

    let mx = canvas.width / 2, my = canvas.height / 2
    let tmx = mx, tmy = my
    let rafId: number

    const handleMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mx = (e.clientX - r.left) * window.devicePixelRatio
      my = (e.clientY - r.top) * window.devicePixelRatio
    }

    window.addEventListener("mousemove", handleMouseMove)

    function render(t: number) {
      tmx += (mx - tmx) * 0.12
      tmy += (my - tmy) * 0.12
      gl!.uniform1f(timeLoc, t * 0.001)
      gl!.uniform2f(resLoc, canvas!.width, canvas!.height)
      gl!.uniform2f(mouseLoc, tmx, tmy)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  )
}