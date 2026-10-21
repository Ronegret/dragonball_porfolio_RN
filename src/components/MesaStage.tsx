import { useEffect, useRef, useState } from "react";
import { DBText, sfx } from "../lib";
import { MESA } from "../mesa2Gaze";                 // escena sin oficina (recortada). "../mesaGaze" = la versión con la oficina de fondo
import { scrollToId } from "./Hud";

/** Escena protagonista (100vw × 100svh): Rodrigo, su mesa y su portátil flotando en el cosmos, que te sigue con la mirada.
 *
 *  El vídeo original es un barrido de mirada (frente → izquierda → arriba → derecha). Los fotogramas están recortados (sin la
 *  oficina, con transparencia: tools/build-mesa2.py). En vez de reproducirlo, cada fotograma lleva anotada hacia dónde mira
 *  (src/mesa2Gaze.ts) y el canvas dibuja el fotograma cuya
 *  mirada se parece más a la dirección del cursor. La mirada objetivo se suaviza, así que al mover el ratón la cabeza
 *  recorre los fotogramas intermedios (giro continuo), con un fundido de ~110 ms entre fotogramas.
 *  Sin movimiento del ratón durante unos segundos, vuelve a reproducirse el barrido original (la escena nunca está muerta). */

const F = MESA.frames, N = F.length;
const src = (i: number) => `/assets/mesa2/m${String(i).padStart(2, "0")}.webp`;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const MAX_UP = 1.18;                                       // aumento máximo sobre el tamaño original del vídeo (calidad)
const place = (v: number, size: number, view: number) => (size >= view ? clamp(v, view - size, 0) : clamp(v, 0, view - size));

export default function MesaStage() {
  const stage = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const burstEl = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [touched, setTouched] = useState(false);
  const [burst, setBurst] = useState(0);
  // la animación de entrada del nombre espera a que termine la intro (si se ve en la intro, ocurre tapada)
  const [go, setGo] = useState(() => {
    try { return !!(window as any).__introDone || !!sessionStorage.getItem("rn_intro"); } catch { return true; }
  });
  useEffect(() => {
    const on = () => setGo(true);
    window.addEventListener("rn-intro-done", on);
    return () => window.removeEventListener("rn-intro-done", on);
  }, []);

  useEffect(() => {
    const canvas = cv.current!, ctx = canvas.getContext("2d")!, el = stage.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    // en móviles/equipos modestos solo se cargan los fotogramas pares (la mitad): mismo recorrido, menos memoria
    const lite = window.innerWidth < 760 || ((navigator as any).deviceMemory ?? 8) <= 4;
    const imgs: (HTMLImageElement | null)[] = Array(N).fill(null);

    let W = 0, H = 0, dpr = 1, s = 1, hx = 0.5, hy = 0.3;
    let X = 0, Y = 0, SW = 1, SH = 1, ax = -9, ay = -9;     // dónde se dibujó el último fotograma (para saber dónde está la cabeza)
    let cur = 0, prev = -1, fade = 1;
    let gx = 0.05, gy = 0, tx = 0.05, ty = 0, lgx = 9, lgy = 9;
    let mode: "auto" | "gaze" = "auto", lastMove = -1e9, apT = 1;
    let raf = 0, last = 0, dirty = true, visible = true, started = false;
    const ptr = { x: 0, y: 0 };

    // ---- geometría: cubre la pantalla y, en horizontal, desplaza la escena para que Rodrigo quede a la derecha del texto ----
    const layout = () => {
      const r = el.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      const land = W / H > 1.15;
      // El vídeo mide 1280×720: ampliarlo mucho lo vuelve borroso. Se limita el aumento (MAX_UP); la mesa se desvanece en los
      // bordes y queda anclada abajo, flotando sobre el cosmos. 1.0 = nítido, más de ~1.2 = blando.
      s = Math.min(Math.max(W / MESA.w, H / MESA.h) * (land ? 1.1 : 1), land ? MAX_UP : W < 600 ? 1 : 1.15);
      s = Math.max(0.8, Math.min(s, (H - 79) / 670));         // en pantallas bajas la cabeza no debe salirse por arriba (barra superior ~70 px)
      hx = land ? 0.63 : 0.5;
      dirty = true;
    };

    const draw = () => {
      const im = imgs[cur]; if (!im) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      SW = MESA.w * s; SH = MESA.h * s;
      X = place(hx * W - MESA.head[0] * SW - gx * 8, SW, W);          // la escena se mueve un poco al revés que la mirada
      Y = place(H - SH + 6 - gy * 5, SH, H);                           // anclada abajo: la mesa es el suelo de la escena
      ctx.clearRect(0, 0, W, H);
      if (fade < 1 && prev >= 0 && imgs[prev]) {
        // fundido correcto entre imágenes con transparencia: mezcla lineal de los valores premultiplicados
        ctx.globalAlpha = 1 - fade; ctx.drawImage(imgs[prev]!, X, Y, SW, SH);
        ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = fade; ctx.drawImage(im, X, Y, SW, SH);
        ctx.globalCompositeOperation = "source-over";
      } else ctx.drawImage(im, X, Y, SW, SH);
      ctx.globalAlpha = 1;
      // el resplandor de ki de detrás sigue al personaje
      if (Math.abs(X - ax) > 1 || Math.abs(Y - ay) > 1) {
        ax = X; ay = Y;
        el.style.setProperty("--ax", (X + SW * MESA.head[0]).toFixed(0) + "px");
        el.style.setProperty("--ay", (Y + SH * 0.5).toFixed(0) + "px");
        el.style.setProperty("--as", (SW * 0.5).toFixed(0) + "px");
      }
    };

    const setFrame = (i: number) => { if (i !== cur) { prev = cur; cur = i; fade = 0; dirty = true; } };

    // ---- fotograma cuya mirada más se parece a la objetivo; un pequeño castigo por saltar lejos en el tiempo
    //      evita cambiar entre las dos "ramas" del vídeo (derecha a los 2 s y a los 7 s) por diferencias mínimas ----
    const pick = () => {
      let best = -1, bs = 1e9, cs = 1e9;
      for (let i = 0; i < N; i++) {
        const f = F[i]; if (f[3] || !imgs[i]) continue;
        const sc = Math.hypot(gx - f[1], (gy - f[2]) * 1.1) + 0.0022 * Math.abs(f[0] - F[cur][0]);
        if (i === cur) cs = sc;
        if (sc < bs) { bs = sc; best = i; }
      }
      if (best >= 0 && best !== cur && bs < cs - 0.035) setFrame(best);
    };

    const target = () => {
      const r = el.getBoundingClientRect();
      const headX = X + MESA.head[0] * SW, headY = r.top + Y + MESA.head[1] * SH;
      tx = clamp(((ptr.x - (r.left + headX)) / (W * 0.36)) * 1.15, -1, 1);     // +1 = cursor a la derecha
      ty = clamp((headY - ptr.y) / (H * 0.32), 0, 1);                           // +1 = cursor arriba; por debajo, mira al frente
    };

    // ---- carga progresiva: primero un fotograma de cada 8, luego de cada 4, 2 y el resto ----
    const lvl = (i: number) => (i % 8 === 0 ? 0 : i % 4 === 0 ? 1 : i % 2 === 0 ? 2 : 3);
    const order = Array.from({ length: N }, (_, i) => i).filter((i) => !reduce || i === 0).filter((i) => !lite || i % 2 === 0)
      .sort((a, b) => lvl(a) - lvl(b) || a - b);
    let p = 0;
    const load = (i: number) => new Promise<void>((res) => {
      const im = new Image(); im.decoding = "async";
      im.onload = () => { (im.decode ? im.decode() : Promise.resolve()).catch(() => {}).finally(() => { imgs[i] = im; if (i === 0) setReady(true); dirty = true; res(); }); };
      im.onerror = () => res();
      im.src = src(i);
    });
    const worker = async () => { while (p < order.length) await load(order[p++]); };
    for (let k = 0; k < 4; k++) worker();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 15) return;                           // tope de 60 fps
      const dt = Math.min(3, (now - last) / 16.67 || 1); last = now;
      if (mode === "gaze" && now - lastMove > 2800) { mode = "auto"; apT = F[cur][0]; }
      if (mode === "gaze") {
        target();
        const k = 1 - Math.pow(0.84, dt);
        gx += (tx - gx) * k; gy += (ty - gy) * k;
        pick();
      } else {                                               // reposo: el barrido original del vídeo, a su velocidad (24 fps)
        apT += dt * 0.4; if (apT >= 240) apT = 1;
        let k = cur;
        for (let i = N - 1; i >= 0; i--) if (F[i][0] <= apT && imgs[i]) { k = i; break; }
        setFrame(k);
        gx += (F[cur][1] - gx) * 0.2; gy += (F[cur][2] - gy) * 0.2;
      }
      if (fade < 1) { fade = Math.min(1, fade + dt / 6.5); dirty = true; }
      if (Math.abs(gx - lgx) > 0.003 || Math.abs(gy - lgy) > 0.003) { lgx = gx; lgy = gy; dirty = true; }
      if (dirty) { draw(); dirty = false; }
    };

    if ((import.meta as any).env?.DEV) (window as any).__mesa = () => ({ ptr: { ...ptr }, cur, f: F[cur], mode, tx, ty, gx, gy, X, Y, SW, SH, headX: X + MESA.head[0] * SW, W, H, loaded: imgs.filter(Boolean).length });
    const run = () => { if (!raf && visible && !document.hidden && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    const onMove = (e: PointerEvent) => {
      ptr.x = e.clientX; ptr.y = e.clientY; lastMove = performance.now();
      if (mode === "auto") { mode = "gaze"; gx = F[cur][3] ? 0 : F[cur][1]; gy = F[cur][2]; }
      if (!started) { started = true; setTouched(true); }
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? run() : stop(); }, { rootMargin: "80px" });
    io.observe(el);
    const ro = new ResizeObserver(layout); ro.observe(el);
    const onVis = () => (document.hidden ? stop() : run());
    layout();
    if (!reduce) window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    run();
    if (reduce) { const t = setInterval(() => { if (imgs[0]) { draw(); clearInterval(t); } }, 120); }

    return () => {
      stop(); io.disconnect(); ro.disconnect();
      window.removeEventListener("pointermove", onMove); document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // ---- clic/toque en la escena: carga de ki (onda + destello + sacudida + sonido de la transformación) ----
  const power = (e: React.PointerEvent) => {
    if ((e.target as Element).closest("a,button")) return;
    const el = stage.current!, r = el.getBoundingClientRect();
    burstEl.current?.style.setProperty("--bx", e.clientX - r.left + "px");
    burstEl.current?.style.setProperty("--by", e.clientY - r.top + "px");
    setBurst((n) => n + 1); setTouched(true);
    el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake");
    sfx("powerup");
  };

  return (
    <section id="inicio" ref={stage} className={"mesa" + (ready && go ? " ready" : "")} onPointerDown={power}>
      <div className="mesa-aura" aria-hidden />
      <canvas ref={cv} className="mesa-cv" role="img" aria-label="Rodrigo Negrete sentado a su mesa con el portátil. Su mirada sigue a tu cursor." />
      <div className="mesa-shade" aria-hidden />
      <div className="wrap mesa-ui">
        <div className="mesa-copy">
          <span className="mesa-tag">Saga del diseño de producto · Episodio 1</span>
          {go && (
            <p className="mesa-name">
              <span><DBText text="RODRIGO" /></span>
              <span><DBText text="*NEGRETE*" /></span>
            </p>
          )}
          <p className="mesa-role">AI Product Designer · UX/UI · Agentes IA y automatización</p>
        </div>
      </div>
      <div className={"mesa-hint" + (touched ? " off" : "")} aria-hidden>
        <span className="h-fine">👀 Mueve el ratón: te sigo con la mirada</span>
        <span className="h-coarse">👀 Desliza el dedo: te sigo con la mirada</span>
        <small>Pulsa sobre mí y carga ki</small>
      </div>
      <button className="mesa-scroll" onClick={() => scrollToId("hero")} aria-label="Bajar al contenido">
        <span>Scroll</span><i aria-hidden />
      </button>
      <div className="mesa-burst" ref={burstEl} aria-hidden>
        {burst > 0 && <span key={burst}><i /><i /><b /></span>}
      </div>
    </section>
  );
}
