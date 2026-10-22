import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { motion, AnimatePresence, animate, useInView, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { Howl, Howler } from "howler";

/* ---------- utils ---------- */
export function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.replace(/(.)/g, "$1$1") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Lista de enteros únicos guardada en localStorage. Si el valor está corrupto o manipulado, devuelve [] en vez de romper la web. */
export function readNums(key: string, min: number, max: number): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? [...new Set<number>(v.filter((n) => Number.isInteger(n) && n >= min && n <= max))] : [];
  } catch { return []; }
}

/** La intro (Loader) tapa toda la pantalla: los fondos animados no tienen por qué trabajar hasta que acabe. */
export const introPending = () => { try { return !(window as any).__introDone && !sessionStorage.getItem("rn_intro"); } catch { return false; } };
/** Ejecuta cb cuando termina la intro (o a los 20 s, por si el Loader no llegara a avisar). Devuelve la función que lo cancela. */
export function whenIntroDone(cb: () => void) {
  if (!introPending()) { cb(); return () => {}; }
  let live = true;
  const go = () => { if (live) { live = false; cb(); } };
  window.addEventListener("rn-intro-done", go, { once: true });
  const t = setTimeout(go, 20000);
  return () => { live = false; window.removeEventListener("rn-intro-done", go); clearTimeout(t); };
}

/* ---------- audio (Howler + efectos en public/assets/sfx) ---------- */
export type Sfx = "capsule" | "intro" | "powerup" | "teleport" | "radar" | "shenlong";
// volúmenes: los efectos de interfaz van ~10 dB por debajo de la música (los archivos ya vienen ajustados en tools/build-sfx-user.py)
const VOL: Record<Sfx, number> = { capsule: 0.7, intro: 0.6, powerup: 0.7, teleport: 0.6, radar: 0.7, shenlong: 0.8 };
const SOLO = new Set<Sfx>(["powerup", "shenlong", "intro", "capsule"]);       // efectos largos: una sola instancia a la vez
const _howls: Partial<Record<Sfx, Howl>> = {};
const _last: Partial<Record<Sfx, number>> = {};
// sonido activado por defecto (se recuerda si el visitante lo silencia)
let _muted = (() => { try { return localStorage.getItem("rn_muted") === "1"; } catch { return false; } })();
// no suena nada hasta el primer gesto: así no se acumulan sonidos que el navegador soltaría de golpe al desbloquear
let _armed = false;
const arm = () => { _armed = true; };
window.addEventListener("pointerdown", arm, { once: true, capture: true });
window.addEventListener("keydown", arm, { once: true, capture: true });
export const getMuted = () => _muted;
export const setMuted = (m: boolean) => {
  _muted = m; try { localStorage.setItem("rn_muted", m ? "1" : "0"); } catch { /* sin almacenamiento */ }
  if (m) Object.values(_howls).forEach((h) => h?.stop());
  window.dispatchEvent(new CustomEvent("rn-mute", { detail: m }));
};
const howl = (name: Sfx) => _howls[name] || (_howls[name] = new Howl({ src: [`/assets/sfx/${name}.mp3`], volume: VOL[name] }));
/** Crea ya el contexto de audio (lo hace Howler en su primera consulta). Tarda ~0,3 s de hilo principal: mejor con la web ociosa que en mitad de la cartela o en el primer clic. */
export const primeAudio = () => { try { Howler.volume(); } catch { /* sin audio */ } };
/** descarga el sonido por adelantado (p. ej. la intro mientras se ve la cartela) */
export const preloadSfx = (name: Sfx) => { howl(name); };
/** gap: ms mínimos entre dos reproducciones del mismo efecto (para hovers) */
export function sfx(name: Sfx, gap = 0) {
  if (_muted || !_armed) return;
  const now = performance.now();
  if (gap && now - (_last[name] ?? -1e9) < gap) return;
  _last[name] = now;
  const h = howl(name);
  if (SOLO.has(name)) h.stop();
  h.play();
}
/** baja y detiene un efecto largo (p. ej. el tema de las cápsulas al cerrar el proyecto) */
export function fadeOutSfx(name: Sfx, ms = 450) {
  const h = _howls[name]; if (!h || !h.playing()) return;
  h.fade(h.volume(), 0, ms); setTimeout(() => { h.stop(); h.volume(VOL[name]); }, ms + 30);
}
/** música de la intro: suena fuerte al abrir, baja para convivir con la web y se apaga sola */
export function playIntroMusic() {
  if (_muted || !_armed) return;
  const h = howl("intro"); h.stop(); h.volume(VOL.intro); h.play();
  setTimeout(() => h.playing() && h.fade(VOL.intro, 0.22, 1600), 4200);
  setTimeout(() => h.playing() && h.fade(0.22, 0, 4200), 11000);
  setTimeout(() => { h.stop(); h.volume(VOL.intro); }, 15400);
}

/* ---------- Esfera del Dragón (SVG) ---------- */
const STAR_POS: Record<number, number[][]> = {
  1: [[50, 50]], 2: [[38, 50], [62, 50]], 3: [[50, 36], [38, 61], [62, 61]],
  4: [[37, 37], [63, 37], [37, 63], [63, 63]],
  5: [[37, 37], [63, 37], [37, 63], [63, 63], [50, 50]],
  6: [[37, 34], [63, 34], [37, 50], [63, 50], [37, 66], [63, 66]],
  7: [[50, 31], [37, 46], [63, 46], [50, 50], [37, 69], [63, 69], [50, 59]],
};
export function ballSVGString(star: number, size = 52) {
  const id = "bs" + star;
  const stars = STAR_POS[star].map(([x, y]) =>
    `<path transform="translate(${x} ${y})" d="M0 -7 L2 -2 L7 -2 L3 1 L4 6 L0 3 L-4 6 L-3 1 L-7 -2 L-2 -2 Z" fill="#c0261f"/>`).join("");
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="overflow:visible"><defs><radialGradient id="${id}" cx="38%" cy="32%"><stop offset="0" stop-color="#fff6df"/><stop offset="35%" stop-color="#ffbf4d"/><stop offset="80%" stop-color="#ff8a1a"/><stop offset="100%" stop-color="#e2650f"/></radialGradient></defs><circle cx="50" cy="50" r="46" fill="url(#${id})" stroke="rgba(255,255,255,.5)" stroke-width="1.5"/><ellipse cx="36" cy="30" rx="13" ry="8" fill="rgba(255,255,255,.55)"/>${stars}</svg>`;
}

export function DragonBall({ star, size = 52 }: { star: number; size?: number }) {
  const id = "b" + star + "_" + Math.round(size);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={id} cx="38%" cy="32%">
          <stop offset="0" stopColor="#fff6df" /><stop offset="35%" stopColor="#ffbf4d" />
          <stop offset="80%" stopColor="#ff8a1a" /><stop offset="100%" stopColor="#e2650f" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${id})`} stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
      <ellipse cx="36" cy="30" rx="13" ry="8" fill="rgba(255,255,255,.55)" />
      {STAR_POS[star].map(([x, y], i) => (
        <path key={i} transform={`translate(${x} ${y})`}
          d="M0 -7 L2 -2 L7 -2 L3 1 L4 6 L0 3 L-4 6 L-3 1 L-7 -2 L-2 -2 Z" fill="#c0261f" />
      ))}
    </svg>
  );
}

/* ---------- Reveal (Framer Motion) ---------- */
export function Reveal({ children, delay = 0, y = 26, className = "", style }:
  { children: ReactNode; delay?: number; y?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div className={className} style={style}
      initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

/* ---------- Contexto de las 7 esferas ---------- */
type BallsCtx = {
  collected: number[]; isDone: (s: number) => boolean; count: number; unlocked: boolean;
  collect: (star: number, el: HTMLElement) => void; recruiter: () => void; reset: () => void;
};
const Ctx = createContext<BallsCtx>(null as any);
export const useBalls = () => useContext(Ctx);

export function BallsProvider({ children }: { children: ReactNode }) {
  const [collected, setCollected] = useState<number[]>(() => readNums("dbz_balls", 1, 7));
  useEffect(() => { try { localStorage.setItem("dbz_balls", JSON.stringify(collected)); } catch {} }, [collected]);

  const isDone = (s: number) => collected.includes(s);

  const flyToSlot = (star: number, el: HTMLElement) => {
    const slot = document.querySelector<HTMLElement>(`.slot[data-slot="${star}"]`);
    if (!slot) { setCollected((c) => c.includes(star) ? c : [...c, star]); return; }
    const from = el.getBoundingClientRect(), to = slot.getBoundingClientRect();
    el.style.opacity = "0";
    const fly = el.cloneNode(true) as HTMLElement;
    fly.className = "";
    Object.assign(fly.style, {
      position: "fixed", left: from.left + "px", top: from.top + "px",
      width: from.width + "px", height: from.height + "px", zIndex: "300",
      pointerEvents: "none", opacity: "1", filter: "drop-shadow(0 0 16px rgba(255,150,30,.9))",
    });
    document.body.appendChild(fly);
    gsap.to(fly, {
      left: to.left + (to.width - 16) / 2 + "px", top: to.top + (to.height - 16) / 2 + "px",
      width: 16, height: 16, duration: 0.8, ease: "power3.inOut",
      onComplete: () => { fly.remove(); setCollected((c) => c.includes(star) ? c : [...c, star]); },
    });
  };

  const collect = (star: number, el: HTMLElement) => {
    if (collected.includes(star)) return;
    sfx("radar");
    flyToSlot(star, el);
  };

  const recruiter = () => {
    const pending: number[] = [];
    for (let s = 1; s <= 7; s++) if (!collected.includes(s)) pending.push(s);
    pending.forEach((s, k) => setTimeout(() => {
      const el = document.querySelector<HTMLElement>(`.dball[data-star="${s}"]`);
      if (el) flyToSlot(s, el);
      else setCollected((c) => c.includes(s) ? c : [...c, s]);
    }, k * 180));
    setTimeout(() => {
      const t = document.getElementById("shenron");
      (window as any).lenis ? (window as any).lenis.scrollTo(t) : t?.scrollIntoView({ behavior: "smooth" });
    }, pending.length * 180 + 600);
  };

  const reset = () => { setCollected([]); try { localStorage.removeItem("dbz_balls"); } catch {} };

  const unlocked = collected.length >= 7;
  // bocadillo de aviso al encontrar una esfera
  const [toast, setToast] = useState<{ id: number; star: number; n: number } | null>(null);
  const prev = useRef(collected.length);
  useEffect(() => {
    if (collected.length > prev.current) {
      const star = collected[collected.length - 1];
      setToast({ id: Date.now(), star, n: collected.length });
      const tm = setTimeout(() => setToast(null), collected.length >= 7 ? 3800 : 2200);
      prev.current = collected.length;
      return () => clearTimeout(tm);
    }
    prev.current = collected.length;
  }, [collected]);
  useEffect(() => { if (unlocked) sfx("shenlong"); }, [unlocked]);

  return (
    <Ctx.Provider value={{ collected, isDone, count: collected.length, unlocked, collect, recruiter, reset }}>
      {children}
      <div className="db-toast-wrap" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div key={toast.id} className="db-toast"
              initial={{ opacity: 0, transform: "translateY(-14px) scale(0.92)" }} animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
              exit={{ opacity: 0, transform: "translateY(-8px) scale(0.96)" }} transition={{ type: "spring", duration: 0.45, bounce: 0.25 }}>
              <img src={`/assets/db/ball${toast.star}.webp`} alt="" />
              {toast.n >= 7
                ? <span><b>¡Las 7 esferas!</b> Baja y pide tu deseo a Shen Long ↓</span>
                : <span><b>¡Esfera de {toast.star}★ encontrada!</b> Llevas {toast.n}/7</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

/* ---------- Iconos Dragon Ball: símbolo rojo sobre una esfera del dragón lisa ---------- */
const ICONS: Record<string, ReactNode> = {
  mail: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3.5 7l8.5 6.5L20.5 7" /></>,
  chat: <path d="M4 18.5l1.4-3.6A7.5 7.5 0 1 1 8.9 18z" />,
  in: <><path d="M6 10v8M6 6.5v.5" /><path d="M10.5 18v-8M10.5 13.5c0-2 1.2-3.5 3.2-3.5s3 1.4 3 3.6V18" /></>,
  code: <><path d="M8.5 7L3.5 12l5 5" /><path d="M15.5 7l5 5-5 5" /><path d="M13.5 5l-3 14" /></>,
  scroll: <><path d="M7 3.5h8l3.5 3.5v13.5H7z" /><path d="M10 10h6M10 13.5h6M10 17h4" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17" /></>,
  star: <path className="f" d="M12 2.5l2.4 6.2 6.6.4-5.1 4.2 1.7 6.4L12 16.1 6.4 19.7l1.7-6.4L3 9.1l6.6-.4z" />,
  bolt: <path className="f" d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z" />,
  pen: <><path d="M4 20l1-5L15.5 4.5a2.1 2.1 0 0 1 3 3L8 18z" /><path d="M13.5 6.5l3 3" /></>,
  chart: <><path d="M4 20h16" /><path d="M7 16v-4M12 16V7M17 16v-7" /></>,
  calendar: <><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></>,
};
export function DBIcon({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <span className="dbi" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 24 24">{ICONS[name] ?? ICONS.star}</svg>
    </span>
  );
}

/* ---------- botón "Ver más / Ver menos" para listas plegadas ---------- */
/** Título estilo logo de la serie: las letras saltan una a una al entrar en pantalla.
 *  Marca con *asteriscos* la parte que va en dorado: "Cruza a mis *otros universos*". */
export function DBText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      el.classList.add("in"); io.disconnect();
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  let i = 0;
  const parts = text.split("*");
  return (
    <span ref={ref} className="dbt">
      <span className="sr-only">{text.replace(/\*/g, "")}</span>
      <span aria-hidden>
        {parts.map((seg, k) => seg.split(/(\s+)/).map((w, j) => /^\s+$/.test(w) || !w ? w : (
          <span key={k + "-" + j} className={"dbw" + (k % 2 ? " hl" : "")}>
            {[...w].map((ch, c) => <span key={c} className="dbl" style={{ ["--d" as any]: Math.min(i++, 34) * 26 + "ms" }}>{ch}</span>)}
          </span>
        )))}
      </span>
    </span>
  );
}

/** Cifra que sube desde 0 al entrar en pantalla y conserva prefijo y sufijo: "50+", "−96%", "+80". */
export function CountUp({ value, delay = 0 }: { value: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reduce = useReducedMotion();
  const m = value.match(/^([^\d]*)(\d+)(.*)$/);
  useEffect(() => {
    if (!m || reduce || !inView) return;
    const [, pre, num, suf] = m;
    const c = animate(0, Number(num), { duration: 1.2, delay, ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = pre + Math.round(v) + suf; } });
    return () => c.stop();
  }, [inView, value, reduce]);
  return <span ref={ref}>{!m || reduce ? value : m[1] + "0" + m[3]}</span>;
}

/** En escritorio los desplegables arrancan abiertos; en tablet/móvil, plegados */
export const isWide = () => window.matchMedia("(min-width:901px)").matches;

export function More({ open, onToggle, more, label }: { open: boolean; onToggle: () => void; more: number; label: string }) {
  if (more <= 0) return null;
  return (
    <div className="more-wrap">
      <button className="btn gold more-btn" data-cursor aria-expanded={open} onClick={onToggle}>
        {open ? "Ver menos ↑" : `${label} (+${more}) ↓`}
      </button>
    </div>
  );
}
