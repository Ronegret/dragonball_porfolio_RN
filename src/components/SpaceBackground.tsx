import { useEffect, useRef } from "react";
import { TRANSFORMATIONS } from "../data";

/** Universo de fondo: nebulosa + campo de partículas interactivo (canvas) + planetas con parallax anclados
 *  a su sección + la cápsula de Goku cruzando el cielo.
 *  Un único bucle rAF: pinta las partículas y mueve los planetas con transform (sin leer layout por frame). */

type Star = { bx: number; by: number; z: number; r: number; ox: number; oy: number; vx: number; vy: number; tw: number; ts: number; k: number; dx: number; dust: boolean };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number };

const RGB = ["255,255,255", "184,210,255", "255,226,160", "204,170,255", "120,230,255"];   // blanco, azul, dorado, violeta, acento (ki)
const hexRgb = (h: string) => { const n = parseInt(h.replace("#", ""), 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; };

function sprite(rgb: string) {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d")!, gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(0.16, `rgba(${rgb},.9)`); gr.addColorStop(0.42, `rgba(${rgb},.2)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return c;
}

// planetas anclados a una sección: f = velocidad relativa al contenido (menor = más lejano), y = altura en pantalla al llegar a su sección
const OBJECTS = [
  { cls: "o-earth", img: "earth", anchor: "perfil", side: "left", f: 0.3, y: 0.62 },
  { cls: "o-namek", img: "namek-planet", anchor: "stack", side: "right", f: 0.24, y: 0.5 },
  { cls: "o-island", img: "island", anchor: "trayectoria", side: "right", f: 0.34, y: 0.42 },
];

export default function SpaceBackground() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = cv.current!, ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const sprites = RGB.map(sprite);
    let W = 0, H = 0, dpr = 1, raf = 0, last = 0, t = 0;
    let stars: Star[] = [];
    const meteors: Meteor[] = [];
    let nextMeteor = 4000;
    const ptr = { x: -9999, y: -9999, on: false, touch: false };
    let lastSy = window.scrollY, warp = 0;

    const build = () => {
      const mobile = W < 760;
      const n = Math.round(Math.min(mobile ? 90 : 190, Math.max(60, (W * H) / 9000)));
      stars = Array.from({ length: n }, (_, i) => {
        const z = Math.pow(Math.random(), 1.6) * 0.85 + 0.15;             // pocas cercanas, muchas lejanas
        const dust = i < (mobile ? 5 : 9);                                // motas grandes y difusas de nebulosa
        return {
          bx: Math.random() * W, by: Math.random() * H, z, r: dust ? 60 + Math.random() * 90 : 0.5 + z * 1.5 + (Math.random() < 0.06 ? 1.2 : 0),
          ox: 0, oy: 0, vx: 0, vy: 0, tw: Math.random() * 6.28, ts: 0.6 + Math.random() * 2.2,
          k: dust ? [3, 1, 3, 4][i % 4] : Math.random() < 0.14 ? 4 : Math.random() < 0.3 ? 1 : Math.random() < 0.18 ? 2 : 0,
          dx: (Math.random() - 0.5) * 0.06 * z, dust,
        };
      });
    };

    const size = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const rebuild = Math.abs(w - W) > 80 || Math.abs(h - H) > 160 || !stars.length;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5); W = w; H = h;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (rebuild) build();
      if (reduce) frame(0, true);
    };

    const accent = (i: number) => { sprites[4] = sprite(hexRgb(TRANSFORMATIONS[i].aura)); };
    const onPhase = (e: Event) => accent((e as CustomEvent).detail as number);
    window.addEventListener("evo-phase", onPhase);

    // ---- interacción: el ratón (o el dedo) aparta las estrellas; un clic lanza una onda de choque ----
    const onMove = (e: PointerEvent) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true; ptr.touch = e.pointerType === "touch"; };
    const onLeave = () => { ptr.on = false; };
    const onDown = (e: PointerEvent) => {
      const cx = e.clientX, cy = e.clientY;
      for (const s of stars) {
        const x = s.bx + s.ox, y = s.by + s.oy, dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy);
        if (d < 280 && d > 0.1) { const f = (1 - d / 280) * 15 * (0.4 + s.z); s.vx += (dx / d) * f; s.vy += (dy / d) * f; }
      }
    };
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }

    // ---- objetos con parallax anclados a su sección ----
    const els = [...root.current!.querySelectorAll<HTMLElement>("[data-anchor]")];
    let anchors: number[] = [], sizes: number[] = [];
    const measure = () => {
      anchors = els.map((el) => { const s = document.getElementById(el.dataset.anchor!); return s ? s.offsetTop : -1; });
      sizes = els.map((el) => el.offsetWidth || 300);
    };
    const ro = new ResizeObserver(measure); ro.observe(document.body);
    const placeObjects = (sy: number) => {
      els.forEach((el, i) => {
        const a = anchors[i]; if (a < 0) return;
        const o = OBJECTS[i], size = sizes[i];
        const y = H * o.y + (a - sy) * o.f;
        const vis = y > -size * 0.8 && y < H + size * 0.8;
        el.style.visibility = vis ? "visible" : "hidden";
        if (vis) el.style.transform = `translate3d(0,${(y - size / 2).toFixed(1)}px,0)`;
      });
    };

    const frame = (now: number, still = false) => {
      const dt = Math.min(2.5, (now - last) / 16.67 || 1); last = now; t += dt / 60;
      const sy = window.scrollY, sv = sy - lastSy; lastSy = sy;
      warp += (Math.min(1, Math.abs(sv) / 70) - warp) * 0.12;
      ctx.clearRect(0, 0, W, H);

      const R = 150, near: { x: number; y: number; d: number }[] = [];
      for (const s of stars) {
        s.bx += s.dx * dt; if (s.bx < -20) s.bx = W + 20; else if (s.bx > W + 20) s.bx = -20;
        let y = (s.by - sy * s.z * 0.2) % H; if (y < 0) y += H;           // parallax infinito con el scroll
        if (!still) {
          // fuerza del puntero + muelle de vuelta a la posición base
          const x0 = s.bx + s.ox, y0 = y + s.oy;
          if (ptr.on && !s.dust) {
            const dx = x0 - ptr.x, dy = y0 - ptr.y, d = Math.hypot(dx, dy);
            if (d < R && d > 0.1) { const f = (1 - d / R) ** 2 * 1.3 * (0.4 + s.z) * dt; s.vx += (dx / d) * f; s.vy += (dy / d) * f; }
          }
          s.vx -= s.ox * 0.016 * dt; s.vy -= s.oy * 0.016 * dt;
          s.vx *= 0.9; s.vy *= 0.9; s.ox += s.vx * dt; s.oy += s.vy * dt;
        }
        const x = s.bx + s.ox, yy = y + s.oy;
        if (x < -s.r * 3 || x > W + s.r * 3 || yy < -s.r * 3 || yy > H + s.r * 3) continue;
        if (s.dust) { ctx.globalAlpha = 0.07 + 0.03 * Math.sin(t * 0.4 + s.tw); const sz = s.r * 2; ctx.drawImage(sprites[s.k], x - s.r, yy - s.r, sz, sz); continue; }
        const a = still ? 0.8 : (0.35 + 0.65 * s.z) * (0.62 + 0.38 * Math.sin(t * s.ts + s.tw));
        ctx.globalAlpha = a;
        const sz = s.r * 5.5; ctx.drawImage(sprites[s.k], x - sz / 2, yy - sz / 2, sz, sz);
        if (warp > 0.07) {                                              // scroll rápido: las estrellas se estiran (salto al hiperespacio)
          const len = warp * 46 * s.z * Math.sign(sv || 1);
          ctx.globalAlpha = a * 0.8 * warp; ctx.strokeStyle = `rgb(${RGB[s.k]})`; ctx.lineWidth = Math.max(0.6, s.r * 0.7);
          ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x, yy + len); ctx.stroke();
        }
        if (ptr.on && !ptr.touch) { const d = Math.hypot(x - ptr.x, yy - ptr.y); if (d < R + 30 && near.length < 14) near.push({ x, y: yy, d }); }
      }
      // constelación: hilos finos entre el puntero y las estrellas que tiene cerca
      if (near.length) {
        ctx.lineWidth = 0.8; ctx.strokeStyle = "rgb(190,215,255)";
        for (let i = 0; i < near.length; i++) {
          const p = near[i]; ctx.globalAlpha = Math.max(0, 1 - p.d / (R + 30)) * 0.4;
          ctx.beginPath(); ctx.moveTo(ptr.x, ptr.y); ctx.lineTo(p.x, p.y); ctx.stroke();
          for (let j = i + 1; j < near.length; j++) {
            const q = near[j], d = Math.hypot(p.x - q.x, p.y - q.y);
            if (d < 95) { ctx.globalAlpha = (1 - d / 95) * 0.22; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
          }
        }
      }
      // estrellas fugaces
      if (!still) {
        nextMeteor -= dt * 16.67;
        if (nextMeteor <= 0) { nextMeteor = 6000 + Math.random() * 9000; meteors.push({ x: W * (0.35 + Math.random() * 0.65), y: -20 + Math.random() * H * 0.35, vx: -(9 + Math.random() * 5), vy: 4.5 + Math.random() * 3, life: 1 }); }
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i]; m.x += m.vx * dt; m.y += m.vy * dt; m.life -= 0.011 * dt;
          if (m.life <= 0) { meteors.splice(i, 1); continue; }
          const tx = m.x - m.vx * 14, ty = m.y - m.vy * 14, g = ctx.createLinearGradient(m.x, m.y, tx, ty);
          g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(1, "rgba(160,190,255,0)");
          ctx.globalAlpha = Math.min(1, m.life * 2); ctx.strokeStyle = g; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      placeObjects(sy);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 15) return;                                      // tope de 60 fps en pantallas rápidas
      frame(now);
    };
    const onVis = () => { cancelAnimationFrame(raf); raf = 0; if (!document.hidden && !reduce) { last = performance.now(); raf = requestAnimationFrame(loop); } };

    size(); measure();
    window.addEventListener("resize", size);
    document.addEventListener("visibilitychange", onVis);
    if (!reduce) raf = requestAnimationFrame(loop); else placeObjects(window.scrollY);
    const m1 = setTimeout(measure, 800), m2 = setTimeout(measure, 2800);   // tras cargar fuentes e imágenes cambian las alturas

    return () => {
      cancelAnimationFrame(raf); clearTimeout(m1); clearTimeout(m2); ro.disconnect();
      window.removeEventListener("resize", size); window.removeEventListener("evo-phase", onPhase);
      window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave); document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="bg-layer space" ref={root} aria-hidden>
      <div className="nebula" />
      <canvas className="starfield" ref={cv} />
      {OBJECTS.map((o) => (
        <div key={o.cls} className={"sp-obj " + o.cls + " side-" + o.side} data-anchor={o.anchor}>
          <img className="obj-float" src={`/assets/space/${o.img}.webp`} alt="" decoding="async" loading="lazy" />
        </div>
      ))}
      <div className="pod-fly"><img src="/assets/space/pod.webp" alt="" decoding="async" loading="lazy" /></div>
    </div>
  );
}
