import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sfx } from "../lib";

// Orden de evolución (nº de imagen): base, saiyan, fase 3, blue, ultra instinto, fase 4
const ORDER = [1, 2, 5, 3, 4, 6];
const FORMS = ORDER.map((i) => `/assets/forms/f${i}.webp`);
const AURA = ["#39d8c6", "#ffc23a", "#ffd23a", "#37b7ff", "#e4eef9", "#ff3b3b"];
// tamaño del aura, nº de trazos ascendentes y si hay rayos, por forma
const SIZE = [0.3, 1.0, 1.2, 1.1, 0.95, 1.15];
const STREAKS = [0, 10, 14, 12, 16, 12];
const BOLTS = [0, 0, 1, 1, 0, 0];
const NAMES = ["Forma Base", "Super Saiyan", "Super Saiyan Fase 3", "Super Saiyan Blue", "Ultra Instinto", "Super Saiyan Fase 4"];
// Mi evolución = mis estudios y desarrollo profesional
const STUDY = [
  "Fundamentos · +17 años B2B + Desarrollo Web",
  "Diseño UX/UI · Bootcamp Neoland",
  "Producto Digital & Frontend · React · Figma",
  "Máster en IA Generativa · UDIA",
  "Agentes IA & Hiperautomatización · EBIS",
  "AI Product Designer · nivel máximo actual",
];

const hexRgb = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

export default function Character3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const figRef = useRef<HTMLButtonElement>(null);
  const [form, setForm] = useState(0);
  const [touched, setTouched] = useState(false);
  const busyRef = useRef(false);
  const colorRef = useRef(hexRgb(AURA[0]));
  const formRef = useRef(0);
  const burstRef = useRef(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => { colorRef.current = hexRgb(AURA[form]); formRef.current = form; }, [form]);

  // ---- aura de ki estilo anime: envoltura translúcida pegada a la silueta, borde brillante con
  //      lóbulos que suben, punta de llama sobre la cabeza y trazos verticales ascendentes ----
  useEffect(() => {
    const cv = canvasRef.current!; const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    let W = 0, H = 0, dpr = 1, raf = 0, t = 0, boost = 0, lean = 0, mX = -9999, lastX = 0, lastY = 0;
    const body = { x: 0, y: 0, w: 1, h: 1 };
    const ROWS = 48;
    const profiles = new Map<string, { l: number; r: number }[]>(); // contorno por filas (normalizado)
    const P: { x: number; y: number; vy: number; life: number; size: number }[] = [];
    const L: { pts: number[]; life: number }[] = [];
    const streaks = Array.from({ length: 18 }, () => ({ u: Math.random(), v: Math.random(), sp: 0.6 + Math.random() * 0.8, len: 0.08 + Math.random() * 0.12 }));

    const profile = (img: HTMLImageElement) => {
      const cached = profiles.get(img.currentSrc);
      if (cached) return cached;
      const w = 64, h = ROWS * 2, o = document.createElement("canvas"); o.width = w; o.height = h;
      const x = o.getContext("2d", { willReadFrequently: true })!; x.drawImage(img, 0, 0, w, h);
      const d = x.getImageData(0, 0, w, h).data; const pr: { l: number; r: number }[] = [];
      for (let r = 0; r < ROWS; r++) {
        let l = w, rr = -1;
        for (let yy = r * 2; yy < r * 2 + 2; yy++) for (let xx = 0; xx < w; xx++) if (d[(yy * w + xx) * 4 + 3] > 60) { if (xx < l) l = xx; if (xx > rr) rr = xx; }
        pr.push(rr < 0 ? { l: 0.5, r: 0.5 } : { l: l / w, r: (rr + 1) / w });
      }
      // suaviza: los huecos entre brazo y cuerpo no deben crear picos
      const sm = pr.map((_, i) => { let l = 0, r = 0; for (let k = -2; k <= 2; k++) { const q = pr[Math.min(ROWS - 1, Math.max(0, i + k))]; l += q.l; r += q.r; } return { l: l / 5, r: r / 5 }; });
      profiles.set(img.currentSrc, sm); return sm;
    };

    const size = () => {
      const r = cv.getBoundingClientRect(); if (!r.width) return;
      dpr = 1; W = r.width; H = r.height;   // el aura es un brillo difuso: a 1x se ve igual y pinta 4x menos píxeles en pantallas retina
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size(); window.addEventListener("resize", size);
    const onMove = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
      const sp = Math.hypot(x - lastX, y - lastY); lastX = x; lastY = y; mX = x;
      if (x > -80 && x < W + 80 && y > -80 && y < H + 120) boost = Math.min(1.6, boost + sp * 0.012); // el aura se agita al pasar el ratón
    };
    if (!reduce) window.addEventListener("mousemove", onMove);

    const bolt = () => {
      let x = body.x + body.w * (Math.random() < 0.5 ? 0.1 + Math.random() * 0.15 : 0.75 + Math.random() * 0.15);
      let y = body.y + body.h * (0.15 + Math.random() * 0.6);
      const pts = [x, y], seg = 5 + (Math.random() * 5 | 0), st = body.h * 0.03;
      for (let i = 0; i < seg; i++) { x += (Math.random() - 0.5) * st * 2.4; y += (Math.random() - 0.2) * st * 1.6; pts.push(x, y); }
      L.push({ pts, life: 1 });
    };

    // contorno del aura (lazo cerrado): punta sobre la cabeza -> lado izq. -> pies -> lado der.
    const contour = (pr: { l: number; r: number }[], S: number, s: number) => {
      const { x: bx, y: by, w: bw, h: bh } = body;
      let top = 0; while (top < ROWS - 1 && pr[top].r - pr[top].l < 0.02) top++;
      const L: number[] = [], R: number[] = [];
      for (let i = top; i < ROWS; i += 2) {
        const v = i / (ROWS - 1), y = by + v * bh;
        const grow = bw * S * s * (0.1 + 0.17 * (1 - v) ** 1.2);   // el aura abraza el cuerpo y se abre arriba
        L.push(bx + pr[i].l * bw - grow + lean * 6, y); R.push(bx + pr[i].r * bw + grow + lean * 6, y);
      }
      const yTop = by + (top / (ROWS - 1)) * bh, cx = (L[0] + R[0]) / 2;
      const pts = [cx + lean * 16, yTop - bh * S * s * 0.2];
      for (let k = 0; k < L.length; k += 2) pts.push(L[k], L[k + 1]);
      pts.push(bx + bw / 2 + lean * 6, by + bh + bh * 0.015);
      for (let k = R.length - 2; k >= 0; k -= 2) pts.push(R[k], R[k + 1]);
      return pts;
    };
    // traza el contorno con lenguas de fuego en punta que apuntan hacia arriba y suben con ph
    const flames = (pts: number[], spike: number, ph: number) => {
      const n = pts.length / 2; let cx = 0, cy = 0;
      for (let i = 0; i < n; i++) { cx += pts[i * 2]; cy += pts[i * 2 + 1]; }
      cx /= n; cy /= n;
      ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
      for (let i = 0; i < n; i++) {
        const px = pts[i * 2], py = pts[i * 2 + 1], qx = pts[((i + 1) % n) * 2], qy = pts[((i + 1) % n) * 2 + 1];
        const mx = (px + qx) / 2, my = (py + qy) / 2;
        let nx = mx - cx, ny = my - cy; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        let dx = nx * 0.55, dy = ny * 0.45 - 0.9; const dl = Math.hypot(dx, dy); dx /= dl; dy /= dl;   // hacia fuera y arriba
        const v = Math.min(1, Math.max(0, (my - body.y) / body.h));
        const fl = 0.3 + 0.7 * Math.abs(Math.sin(v * 22 + ph + i * 0.9)) ** 1.6;                      // llamas que suben
        const h = spike * fl * (1.15 - 0.85 * v) * body.h;
        ctx.lineTo(mx - dx * h * 0.15 + dx * h, my + dy * h);
        ctx.lineTo(qx, qy);
      }
      ctx.closePath();
    };

    // solo anima mientras el hero está en pantalla y la pestaña visible
    let onScreen = true;
    const resume = () => { if (!raf && onScreen && !document.hidden) loop(); };
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; resume(); });
    io.observe(cv);
    document.addEventListener("visibilitychange", resume);

    let last = 0;
    const loop = (now = 0) => {
      if (!onScreen || document.hidden) { raf = 0; return; }
      raf = requestAnimationFrame(loop);
      if (now - last < 15) return;   // tope de 60 fps: en pantallas de 120/144 Hz el aura iba al doble de velocidad y coste
      last = now; t += reduce ? 0 : 0.016;
      const f = formRef.current, S0 = SIZE[f];
      if (burstRef.current > 0) {
        boost = Math.max(boost, 2.6); for (let k = 0; k < 4; k++) bolt();
        for (let k = 0; k < 40; k++) P.push({ x: body.x + body.w * Math.random(), y: body.y + body.h * (0.3 + Math.random() * 0.7), vy: 2 + Math.random() * 3, life: 1, size: 1.5 + Math.random() * 3 });
        burstRef.current = 0;
      }
      boost *= 0.95;
      const c = colorRef.current, rgba = (al: number) => "rgba(" + c.r + "," + c.g + "," + c.b + "," + al + ")";
      const img = imgRef.current;
      ctx.clearRect(0, 0, W, H);
      if (!img || !img.naturalWidth) return;
      const ir = img.getBoundingClientRect(), cr = cv.getBoundingClientRect();
      const k = Math.min(ir.width / img.naturalWidth, ir.height / img.naturalHeight);
      body.w = img.naturalWidth * k; body.h = img.naturalHeight * k;
      body.x = ir.left - cr.left + (ir.width - body.w) / 2; body.y = ir.top - cr.top + (ir.height - body.h);
      const pr = profile(img);
      const S = S0 * (1 + boost * 0.35);
      const targetLean = mX > -9999 ? Math.max(-1, Math.min(1, (mX - (body.x + body.w / 2)) / (W * 0.5))) : 0;
      lean += (targetLean - lean) * 0.06;
      ctx.globalCompositeOperation = "lighter";

      const ph = t * 9;
      const flick = reduce ? 1 : 0.9 + 0.1 * Math.sin(t * 47) * Math.sin(t * 13);   // parpadeo rápido del aura
      const cx0 = body.x + body.w / 2, cy0 = body.y + body.h * 0.5;
      const glow = (r: number, inner: number, mid: number) => {
        const g = ctx.createRadialGradient(cx0, cy0 - body.h * 0.08, body.w * 0.1, cx0, cy0, r);
        g.addColorStop(0, "rgba(255,255,255," + inner * flick + ")"); g.addColorStop(0.45, rgba(mid * flick)); g.addColorStop(1, rgba(0.04));
        return g;
      };

      if (S0 < 0.5) {
        // forma base: solo un brillo suave que rodea la silueta
        flames(contour(pr, S, 1), 0.012, -ph * 0.5);
        ctx.save(); ctx.fillStyle = glow(body.h * 0.6, 0.06, 0.22); ctx.shadowColor = rgba(0.9); ctx.shadowBlur = 24; ctx.fill(); ctx.restore();
      } else {
        // 1) llamarada exterior, grande y difusa
        flames(contour(pr, S, 1.35), 0.1 * S, -ph * 0.8 + 2.3);
        ctx.save(); ctx.fillStyle = glow(body.h * 0.85, 0.12, 0.3); ctx.shadowColor = rgba(1); ctx.shadowBlur = 30; ctx.fill(); ctx.restore();
        // 2) aura principal con lenguas de fuego
        const main = contour(pr, S, 1);
        flames(main, 0.085 * S, -ph);
        ctx.save(); ctx.fillStyle = glow(body.h * 0.7, 0.55, 0.5); ctx.shadowColor = rgba(1); ctx.shadowBlur = 16; ctx.fill(); ctx.restore();
        // 3) trazos verticales que suben dentro del aura
        const nStreak = STREAKS[f];
        ctx.save(); flames(main, 0.085 * S, -ph); ctx.clip(); ctx.lineCap = "round";
        for (let i = 0; i < nStreak; i++) {
          const st = streaks[i]; st.v -= (reduce ? 0 : 0.014) * st.sp * (1 + boost); if (st.v < -0.3) { st.v = 1.05; st.u = Math.random(); }
          const x = body.x - body.w * 0.2 + st.u * body.w * 1.4, y = body.y + st.v * body.h, len = st.len * body.h * 1.4;
          const lg = ctx.createLinearGradient(x, y, x, y + len); lg.addColorStop(0, "rgba(255,255,255,0.8)"); lg.addColorStop(1, rgba(0));
          ctx.strokeStyle = lg; ctx.lineWidth = 2 + (i % 3); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + lean * 4, y + len); ctx.stroke();
        }
        ctx.restore();
        // 4) núcleo casi blanco pegado al cuerpo (el "calor" del aura)
        flames(contour(pr, S, 0.45), 0.025 * S, -ph * 1.4 + 1.1);
        ctx.fillStyle = "rgba(255,255,255," + 0.16 * flick + ")"; ctx.fill();
      }

      // rayos: SSJ Fase 3 y Blue, o al evolucionar
      if (!reduce && BOLTS[f] && Math.random() < 0.06 + boost * 0.05) bolt();
      for (let i = L.length - 1; i >= 0; i--) {
        const l = L[i]; l.life -= 0.16; if (l.life <= 0) { L.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = Math.min(1, l.life * 1.5); ctx.lineJoin = "round"; ctx.shadowColor = rgba(1); ctx.shadowBlur = 12;
        for (const [wd, st] of [[3.5, rgba(0.9)], [1.4, "#fff"]] as const) {
          ctx.lineWidth = wd; ctx.strokeStyle = st; ctx.beginPath(); ctx.moveTo(l.pts[0], l.pts[1]);
          for (let q = 2; q < l.pts.length; q += 2) ctx.lineTo(l.pts[q], l.pts[q + 1]);
          ctx.stroke();
        }
        ctx.restore();
      }

      // chispas que suben (solo transformaciones o estallido)
      if (!reduce && S0 > 0.5 && Math.random() < 0.25 + boost * 0.4)
        P.push({ x: body.x + body.w * (0.1 + Math.random() * 0.8), y: body.y + body.h * (0.4 + Math.random() * 0.6), vy: 1 + Math.random() * 1.5, life: 1, size: 1 + Math.random() * 2 });
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i]; p.y -= p.vy; p.x += lean * 0.5; p.life -= 0.016;
        if (p.life <= 0) { P.splice(i, 1); continue; }
        ctx.globalAlpha = p.life * 0.8; ctx.fillStyle = rgba(1); ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    };
    loop();
    return () => { cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener("visibilitychange", resume); window.removeEventListener("resize", size); window.removeEventListener("mousemove", onMove); };
  }, []);

  // ---- precarga imágenes para que el cambio sea instantáneo ----
  useEffect(() => { FORMS.forEach((s) => { const im = new Image(); im.src = s; }); }, []);

  const evolve = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setTouched(true);
    [flashRef.current, ringRef.current, figRef.current].forEach((el) => { if (el) { el.classList.remove("go"); void el.offsetWidth; el.classList.add("go"); } });
    sfx("powerup");
    burstRef.current = 1;                                   // estallido de ki
    setTimeout(() => setForm((x) => (x + 1) % FORMS.length), 180); // cambia en el pico del destello
    setTimeout(() => { busyRef.current = false; }, 650);
  };

  return (
    <div className="char3d">
      <canvas className="ki-canvas" ref={canvasRef} aria-hidden />
      <button className="ki-figure" ref={figRef} onClick={evolve} data-cursor data-snd
        style={{ ["--aura" as any]: AURA[form] }}
        aria-label={`${NAMES[form]} — ${STUDY[form]}. Clic para evolucionar.`}>
        <img className="ki-img" ref={imgRef} src={FORMS[form]} alt={NAMES[form]} draggable={false} />
        <span className="ki-ring" ref={ringRef} aria-hidden />
        <span className="ki-flash" ref={flashRef} aria-hidden />
      </button>
      <AnimatePresence>
        {!touched && (
          <motion.p className="balloon" role="note"
            initial={{ opacity: 0, transform: "translateY(8px) scale(0.92)" }} animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
            exit={{ opacity: 0, transform: "translateY(-6px) scale(0.95)" }} transition={{ type: "spring", duration: 0.5, bounce: 0.3, delay: 1.2 }}>
            <span className="bl-long">¡Hola! Soy Rodrigo. <b>Pulsa sobre mí</b> y mira cómo me transformo.</span>
            <span className="bl-short">¡Hola! <b>Pulsa</b> y evoluciono.</span>
          </motion.p>
        )}
      </AnimatePresence>
      <div className="char3d-ui" aria-live="polite">
        <div className="char3d-name">
          <span className="dot" style={{ background: AURA[form], color: AURA[form] }} />
          <b>{NAMES[form]}</b>
        </div>
        <div className="char3d-study">{STUDY[form]} <i>· clic para evolucionar</i></div>
      </div>
    </div>
  );
}
