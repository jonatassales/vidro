// SmoothUI shader-reveal-transition, scoped to its displacement wipe variant.
// Source and MIT notice: ../vendor/smoothui/.
const VERTEX =
  'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }'
const FRAGMENT = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uProgress;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float progress = smoothstep(0.0, 1.0, uProgress);
  float n = noise(uv * vec2(12.0, 26.0) + vec2(uTime * 0.26, -uTime * 0.12));
  float blade = progress * 1.32 - 0.16 + n * 0.11;
  float edge = blade - uv.x;
  float front = exp(-edge * edge * 120.0);
  float mask = front * 0.92 + smoothstep(-0.03, 0.16, edge) * 0.18;
  vec3 color = mix(vec3(0.12, 0.92, 1.0), vec3(1.0), front * 0.38);
  float entry = smoothstep(0.0, 0.10, uProgress);
  float exitFade = 1.0 - smoothstep(0.76, 1.0, uProgress);
  float alpha = clamp((mask * 0.76 + front * 0.24) * entry * exitFade, 0.0, 0.92);
  gl_FragColor = vec4(color * alpha + vec3(1.0) * front * 0.16 * entry * exitFade, alpha);
}`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  gl.deleteShader(shader)
  return null
}

export function createWipeTransition(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
  })
  const vertex = gl && compile(gl, gl.VERTEX_SHADER, VERTEX)
  const fragment = gl && compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
  const program = gl?.createProgram()
  let supported = false
  if (gl && vertex && fragment && program) {
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    supported = Boolean(gl.getProgramParameter(program, gl.LINK_STATUS))
  }
  if (vertex) gl?.deleteShader(vertex)
  if (fragment) gl?.deleteShader(fragment)
  const buffer = supported ? gl?.createBuffer() : null
  supported = supported && Boolean(buffer)
  if (gl && program && supported) {
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram is not a React hook.
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer ?? null)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    )
    const position = gl.getAttribLocation(program, 'a')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
  }
  const resolution = gl && program && gl.getUniformLocation(program, 'uRes')
  const time = gl && program && gl.getUniformLocation(program, 'uTime')
  const progress = gl && program && gl.getUniformLocation(program, 'uProgress')
  let frame = 0
  let pendingSwap: (() => void) | undefined

  function swap() {
    const callback = pendingSwap
    pendingSwap = undefined
    callback?.()
  }

  function finish() {
    cancelAnimationFrame(frame)
    frame = 0
    swap()
    if (gl && !gl.isContextLost()) {
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
    canvas.hidden = true
  }

  function onContextLost(event: Event) {
    event.preventDefault()
    supported = false
    finish()
  }
  canvas.addEventListener('webglcontextlost', onContextLost)
  canvas.hidden = true

  return {
    finish,
    play(onSwap: () => void) {
      finish()
      if (!supported || !gl || !program) {
        onSwap()
        return
      }
      const context = gl
      pendingSwap = onSwap
      canvas.hidden = false
      const started = performance.now()
      const animate = (now: number) => {
        const raw = Math.min(1, (now - started) / 1080)
        const eased = 1 - (1 - raw) ** 4
        const bounds = canvas.getBoundingClientRect()
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const width = Math.max(1, Math.round(bounds.width * dpr))
        const height = Math.max(1, Math.round(bounds.height * dpr))
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width
          canvas.height = height
        }
        context.viewport(0, 0, width, height)
        context.clearColor(0, 0, 0, 0)
        context.clear(context.COLOR_BUFFER_BIT)
        context.uniform2f(resolution || null, width, height)
        context.uniform1f(time || null, now / 1000)
        context.uniform1f(progress || null, eased)
        context.drawArrays(context.TRIANGLE_STRIP, 0, 4)
        if (eased >= 0.5) swap()
        if (raw < 1) frame = requestAnimationFrame(animate)
        else finish()
      }
      frame = requestAnimationFrame(animate)
    },
    dispose() {
      finish()
      canvas.removeEventListener('webglcontextlost', onContextLost)
      if (buffer) gl?.deleteBuffer(buffer)
      if (program) gl?.deleteProgram(program)
    },
  }
}
