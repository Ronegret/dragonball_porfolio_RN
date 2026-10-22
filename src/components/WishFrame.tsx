import { ReactNode, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { WISH } from "../wishFrame";

/** Marco de Shen Long para el formulario "Pide tu deseo".
 *  Capas: dragón (imagen recortada, entero y sin cortes) → resplandor de esferas y ojos → panel de piedra con una muesca en la
 *  esquina de la cabeza (así el dragón queda visible sin tener que recortarlo) → rayos (canvas). En móvil el dragón se parte
 *  en cabeza (arriba) y cola (abajo) para no deformarlo.
 *  Los rayos saltan entre esferas vecinas siguiendo el cuerpo del dragón; con el cursor sobre el botón se multiplican. */

const SRC = "/assets/wish/frame.webp";

// esferas ordenadas alrededor del marco (para que los arcos de energía unan vecinas)
const BALLS = [...WISH.balls].map((b) => ({ x: b[0], y: b[1], r: b[2], a: Math.atan2(b[1] - 50, b[0] - 50) })).sort((p, q) => p.a - q.a);

type Bolt = { pts: number[]; life: number; w: number; hot: boolean };
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export default function WishFrame({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = cv.current!, ctx = canvas.getContext("2d")!, el = root.current!;
    const wide = window.matchMedia("(min-width:1000px)");
    let W = 0, H = 0, raf = 0, last = 0, hot = 0, visible = false;
    const bolts: Bolt[] = [];
    let next = 400;

    const size = () => {
      const r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // arco entre dos puntos con desplazamiento perpendicular aleatorio (relámpago)
    const jag = (x0: number, y0: number, x1: number, y1: number, seg: number, amp: number) => {
      const pts = [x0, y0], dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
      for (let i = 1; i < seg; i++) {
        const t = i / seg, o = rnd(-1, 1) * amp * Math.sin(Math.PI * t) * len * 0.12;
        pts.push(x0 + dx * t + nx * o, y0 + dy * t + ny * o);
      }
      pts.push(x1, y1);
      return pts;
    };
    const px = (p: number, ax: "x" | "y") => (ax === "x" ? (p / 100) * W : (p / 100) * H);

    const spawn = (burst = false) => {
      if (Math.random() < (burst ? 0.35 : 0.5)) {                               // arco de energía entre esferas vecinas
        const i = (Math.random() * BALLS.length) | 0, a = BALLS[i], b = BALLS[(i + 1) % BALLS.length];
        bolts.push({ pts: jag(px(a.x, "x"), px(a.y, "y"), px(b.x, "x"), px(b.y, "y"), 10, 1.1), life: 1, w: 1.15, hot: true });
      } else {                                                                  // chispazo corto que sale del cuerpo
        const b = BALLS[(Math.random() * BALLS.length) | 0], ang = rnd(0, 6.283), len = rnd(0.06, 0.16) * W;
        const x0 = px(b.x, "x"), y0 = px(b.y, "y");
        bolts.push({ pts: jag(x0, y0, x0 + Math.cos(ang) * len, y0 + Math.sin(ang) * len, 6, 1.6), life: 1, w: 0.8, hot: false });
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return;                                              // 30 fps: es un efecto de chispas
      const dt = Math.min(3, (now - last) / 16.67); last = now;
      hot *= Math.pow(0.94, dt);
      next -= dt * 16.67 * (1 + hot * 4);
      if (next <= 0 && wide.matches) { spawn(hot > 0.3); if (Math.random() < 0.4 + hot) spawn(); next = rnd(300, 800); }
      ctx.clearRect(0, 0, W, H);
      if (!wide.matches) return;
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i]; b.life -= 0.085 * dt;
        if (b.life <= 0) { bolts.splice(i, 1); continue; }
        const a = Math.min(1, b.life * 1.8) * rnd(0.7, 1);
        ctx.beginPath(); ctx.moveTo(b.pts[0], b.pts[1]);
        for (let q = 2; q < b.pts.length; q += 2) ctx.lineTo(b.pts[q], b.pts[q + 1]);
        ctx.globalAlpha = a;
        ctx.shadowColor = b.hot ? "rgba(120,255,150,1)" : "rgba(255,225,90,1)"; ctx.shadowBlur = 22;
        ctx.strokeStyle = b.hot ? "rgba(90,255,140,.95)" : "rgba(255,215,70,.95)"; ctx.lineWidth = 7 * b.w; ctx.stroke();
        ctx.shadowBlur = 0; ctx.strokeStyle = "#f4fff0"; ctx.lineWidth = 2.4 * b.w; ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const run = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? run() : stop(); }, { rootMargin: "120px" });
    io.observe(el);
    const ro = new ResizeObserver(size); ro.observe(canvas); size();
    const onVis = () => (document.hidden ? stop() : run());
    document.addEventListener("visibilitychange", onVis);

    // el botón de invocar excita la tormenta; el envío la dispara
    const btn = el.querySelector<HTMLElement>(".wish-go");
    const heat = () => { hot = 1; next = 0; };
    btn?.addEventListener("pointerenter", heat); btn?.addEventListener("focus", heat);
    el.addEventListener("submit", () => { hot = 2; for (let i = 0; i < 8; i++) spawn(true); });

    return () => { stop(); io.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", onVis); btn?.removeEventListener("pointerenter", heat); btn?.removeEventListener("focus", heat); };
  }, [reduce]);

  return (
    <div className="wish-frame" ref={root}>
      <div className="wf-clouds" aria-hidden />
      <img className="wf-dragon" src={SRC} alt="" loading="lazy" decoding="async" aria-hidden />
      <div className="wf-glows" aria-hidden>
        {BALLS.map((b, i) => (
          <i key={i} className="wf-ball" style={{ left: b.x + "%", top: b.y + "%", width: b.r * 2.9 + "%", animationDelay: -i * 0.55 + "s" }} />
        ))}
        {WISH.eyes.map((e, i) => <i key={i} className="wf-eye" style={{ left: e[0] + "%", top: e[1] + "%", animationDelay: -i * 0.4 + "s" }} />)}
      </div>
      <div className="wf-m wf-top" aria-hidden />
      {children}
      <div className="wf-m wf-bot" aria-hidden />
      <canvas className="wf-bolts" ref={cv} aria-hidden />
      <span className="wf-flash" aria-hidden />
    </div>
  );
}
