"use client";

import { useEffect, useRef } from "react";

/**
 * Camada de "brilho recém-encerado" em WebGL (fragment shader): névoas douradas
 * flutuando + faíscas cintilando, reagindo ao mouse. GPU, sem biblioteca.
 * Guards: prefers-reduced-motion, telas pequenas e pausa fora da viewport.
 */
const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),
             mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x), f.y);
}
float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=0.5;} return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv; p.x *= u_res.x / u_res.y;
  float t = u_time * 0.05;
  vec2 q = p*2.4 + vec2(t, -t*0.6) + u_mouse*0.25;
  float g = pow(fbm(q), 2.6);
  // faíscas redondas em duas escalas (pontos, não blocos)
  float sparks = 0.0;
  for (int L=0; L<2; L++){
    float scale = (L==0) ? 34.0 : 60.0;
    vec2 sp = p*scale;
    vec2 cell = floor(sp);
    vec2 fr = fract(sp);
    float rnd = hash(cell + float(L)*7.3);
    vec2 center = vec2(hash(cell+0.13+float(L)), hash(cell+0.27+float(L)*2.0));
    float d = length(fr - center);
    float dot = smoothstep(0.11, 0.0, d);
    float tw = pow(max(0.0, sin(u_time*(2.6+float(L)*0.9) + rnd*40.0)), 24.0);
    sparks += dot * tw * step(0.90, rnd) * ((L==0) ? 1.0 : 0.6);
  }
  vec3 gold = vec3(0.82,0.52,0.28);
  vec3 goldLight = vec3(1.0,0.88,0.62);
  float shine = g*0.14 + sparks*1.3;
  vec3 col = mix(gold, goldLight, min(1.0, sparks));
  gl_FragColor = vec4(col*shine, shine);
}`;

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a,0.0,1.0); }`;

export function ShineCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 640) return;
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMove);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.01 });
    io.observe(canvas);

    const start = performance.now();
    const loop = () => {
      if (visible) {
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, (performance.now() - start) / 1000);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
