import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/** Personaje cargando ki: la imagen (con su aura pintada) más una capa de canvas con rayos, humo, niebla de energía,
 *  chispas y ondas en el suelo. El ratón (o el dedo) acerca el aura: los rayos saltan hacia el cursor, el personaje
 *  se inclina hacia él y un clic cerca lanza una descarga. Solo anima mientras está en pantalla. */

type Bolt = { pts: number[]; life: number; w: number };
type Puff = { x: number; y: number; vx: number; vy: number; r: number; grow: number; a: number; age: number; life: number; glow: boolean };
type Spark = { x: number; y: number; vx: number; vy: number; age: number; life: number; c: string; r: number };
type Ring = { age: number; big: boolean };

function sprite(rgb: string) {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d")!, gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(0.45, `rgba(${rgb},.5)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return c;
}
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export default function KiFigure({ src, alt }: { src: string; alt: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = cv.current!, ctx = canvas.getContext("2d")!, el = wrap.current!, im = img.current!;
    const smoke = sprite("120,140,185"), mist = sprite("95,190,255");
    let W = 0, H = 0, bx = 0, by = 0, bw = 1, bh = 1, s = 1, raf = 0, last = 0, t = 0, boost = 0, lean = 0, nextRing = 30;
    const ptr = { x: -9999, y: -9999, on: false };
    const bolts: Bolt[] = [], puffs: Puff[] = [], sparks: Spark[] = [], rings: Ring[] = [];
    let px = 0, py = 0, near = 0;

    const size = () => {
      const r = canvas.getBoundingClientRect(), e = el.getBoundingClientRect();
      if (!r.width) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = r.width; H = r.height; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bw = e.width; bh = e.height; bx = e.left - r.left; by = e.top - r.top; s = bh / 420;
    };

    const makeBolt = () => {
      const cx = bx + bw / 2, cy = by + bh * 0.48;
      const ox = bx + bw * rnd(0.18, 0.82), oy = by + bh * rnd(0.1, 0.86);
      let ang = Math.atan2(oy - cy, ox - cx) + rnd(-0.55, 0.55);
      if (near > 0.1) {                                             // los rayos buscan el cursor
        let d = Math.atan2(py - oy, px - ox) - ang; d = Math.atan2(Math.sin(d), Math.cos(d));
        ang += d * Math.min(0.85, 0.3 + near);
      }
      const len = bh * rnd(0.22, 0.5) * (1 + near * 0.5), seg = 6 + ((Math.random() * 4) | 0), pts = [ox, oy];
      let x = ox, y = oy;
      for (let i = 0; i < seg; i++) {
        const st = len / seg, j = rnd(-0.5, 0.5) * st * 1.15;
        x += Math.cos(ang) * st - Math.sin(ang) * j; y += Math.sin(ang) * st + Math.cos(ang) * j; pts.push(x, y);
      }
      bolts.push({ pts, life: 1, w: 1 });
      if (Math.random() < 0.3) {                                    // rama
        const k = 2 + ((Math.random() * (seg - 3)) | 0), bxp = pts[k * 2], byp = pts[k * 2 + 1], ba = ang + (Math.random() < 0.5 ? -1 : 1) * rnd(0.5, 0.9);
        const bp = [bxp, byp]; let qx = bxp, qy = byp;
        for (let i = 0; i < 4; i++) { const st = (len * 0.4) / 4, j = rnd(-0.5, 0.5) * st; qx += Math.cos(ba) * st - Math.sin(ba) * j; qy += Math.sin(ba) * st + Math.cos(ba) * j; bp.push(qx, qy); }
        bolts.push({ pts: bp, life: 0.9, w: 0.6 });
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 15) return;
      const dt = Math.min(2.5, (now - last) / 16.67 || 1); last = now; t += dt / 60;
      const r = canvas.getBoundingClientRect();
      px = ptr.x - r.left; py = ptr.y - r.top;
      const cx = bx + bw / 2, cy = by + bh * 0.5;
      near = ptr.on ? clamp(1 - Math.hypot(px - cx, py - cy) / (bh * 1.15), 0, 1) : 0;
      boost *= Math.pow(0.93, dt);
      const charge = clamp(0.3 + near * 0.7 + boost, 0, 2.2), flick = 0.82 + 0.18 * Math.sin(t * 38) * Math.sin(t * 11);

      // el personaje se inclina hacia el cursor y respira
      lean += ((ptr.on ? clamp((px - cx) / bw, -1, 1) * near : 0) - lean) * 0.08;
      im.style.transform = `translate3d(${(lean * 12).toFixed(2)}px,0,0) rotate(${(lean * 1.8).toFixed(2)}deg) scale(${(1 + 0.006 * Math.sin(t * 3) + boost * 0.02).toFixed(4)})`;

      ctx.clearRect(0, 0, W, H);
      // ---- humo/polvo en los pies y niebla de energía a los lados ----
      if (Math.random() < 0.2 * dt) puffs.push({ x: bx + bw * rnd(0.15, 0.85), y: by + bh * 0.97, vx: rnd(-0.25, 0.25) + lean * 0.5, vy: -rnd(0.3, 0.8), r: bw * rnd(0.1, 0.18), grow: rnd(0.7, 1.2), a: 0.3, age: 0, life: rnd(110, 170), glow: false });
      if (Math.random() < 0.12 * dt * (0.6 + charge)) puffs.push({ x: bx + bw * (Math.random() < 0.5 ? rnd(0.02, 0.2) : rnd(0.8, 0.98)), y: by + bh * rnd(0.35, 0.95), vx: rnd(-0.2, 0.2), vy: -rnd(0.4, 0.9), r: bw * rnd(0.12, 0.22), grow: 0.6, a: 0.2, age: 0, life: rnd(80, 130), glow: true });
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i]; p.age += dt; if (p.age >= p.life) { puffs.splice(i, 1); continue; }
        p.x += p.vx * dt * s; p.y += p.vy * dt * s; const k = p.age / p.life, sz = p.r * (1 + p.grow * k) * 2;
        ctx.globalCompositeOperation = p.glow ? "lighter" : "source-over"; ctx.globalAlpha = p.a * Math.sin(Math.PI * k);
        ctx.drawImage(p.glow ? mist : smoke, p.x - sz / 2, p.y - sz / 2, sz, sz);
      }
      // ---- resplandor que respira ----
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 1;
      const g = ctx.createRadialGradient(cx, cy, bh * 0.05, cx, cy, bh * 0.85);
      g.addColorStop(0, `rgba(130,200,255,${(0.06 + 0.12 * charge * flick).toFixed(3)})`); g.addColorStop(1, "rgba(60,120,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // ---- ondas de ki en el suelo ----
      nextRing -= dt; if (nextRing <= 0) { rings.push({ age: 0, big: false }); nextRing = rnd(110, 200) / (0.6 + charge * 0.6); }
      for (let i = rings.length - 1; i >= 0; i--) {
        const q = rings[i]; q.age += dt; const k = q.age / (q.big ? 60 : 70); if (k >= 1) { rings.splice(i, 1); continue; }
        const rx = bw * (0.2 + (q.big ? 1.6 : 0.95) * k);
        ctx.globalAlpha = (1 - k) * (q.big ? 0.8 : 0.5); ctx.strokeStyle = q.big ? "#fff" : "rgba(120,200,255,1)"; ctx.lineWidth = (q.big ? 4 : 2) * s;
        ctx.beginPath(); ctx.ellipse(bx + bw / 2, by + bh * 0.97, rx, rx * 0.22, 0, 0, 7); ctx.stroke();
      }
      // ---- rayos ----
      if (Math.random() < ((1.7 + 7 * charge) / 60) * dt) makeBolt();
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i]; b.life -= 0.14 * dt; if (b.life <= 0) { bolts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(1, b.life * 1.7) * rnd(0.65, 1);
        ctx.beginPath(); ctx.moveTo(b.pts[0], b.pts[1]); for (let q = 2; q < b.pts.length; q += 2) ctx.lineTo(b.pts[q], b.pts[q + 1]);
        ctx.shadowColor = "rgba(80,170,255,1)"; ctx.shadowBlur = 14 * s; ctx.strokeStyle = "rgba(70,160,255,.9)"; ctx.lineWidth = 4.2 * s * b.w; ctx.stroke();
        ctx.shadowBlur = 0; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.6 * s * b.w; ctx.stroke();
      }
      // ---- chispas que suben ----
      if (Math.random() < (0.25 + charge * 0.7) * dt) sparks.push({ x: bx + bw * rnd(0.1, 0.9), y: by + bh * rnd(0.3, 0.98), vx: rnd(-0.3, 0.3) + lean * 0.6, vy: -rnd(0.7, 1.9), age: 0, life: rnd(45, 90), c: Math.random() < 0.45 ? "255,225,120" : "190,230,255", r: rnd(0.8, 2.1) });
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]; p.age += dt; if (p.age >= p.life) { sparks.splice(i, 1); continue; }
        p.x += p.vx * dt * s; p.y += p.vy * dt * s; const k = p.age / p.life;
        ctx.globalAlpha = (1 - k) * 0.9; ctx.fillStyle = `rgb(${p.c})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * s * (1 - k * 0.5), 0, 7); ctx.fill();
      }
      if (boost > 0.05) {                                           // destello de la descarga
        const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, bh * 0.75);
        fg.addColorStop(0, "rgba(210,235,255,.9)"); fg.addColorStop(0.5, "rgba(120,190,255,.35)"); fg.addColorStop(1, "rgba(80,150,255,0)");
        ctx.globalAlpha = clamp(boost * 0.3, 0, 0.45); ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    };

    // ---- interacción ----
    const onMove = (e: PointerEvent) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true; };
    const onUp = (e: PointerEvent) => { if (e.pointerType === "touch") ptr.on = false; };
    const onLeave = () => { ptr.on = false; };
    const onDown = (e: PointerEvent) => {
      ptr.x = e.clientX; ptr.y = e.clientY;
      const r = canvas.getBoundingClientRect();
      if (Math.hypot(e.clientX - r.left - (bx + bw / 2), e.clientY - r.top - (by + bh * 0.5)) < bh * 0.75) {   // descarga si se toca cerca del personaje
        boost = 1.6; rings.push({ age: 0, big: true }); for (let i = 0; i < 7; i++) makeBolt();
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    // solo mientras está en pantalla
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { size(); if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
      else { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: "120px" });
    io.observe(el);
    const ro = new ResizeObserver(size); ro.observe(el);
    const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerdown", onDown); window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave); document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduce]);

  return (
    <div ref={wrap} className="splash-fig ki-fig">
      <canvas ref={cv} className="ki-fx" aria-hidden />
      <img ref={img} src={src} alt={alt} loading="lazy" decoding="async" />
    </div>
  );
}
