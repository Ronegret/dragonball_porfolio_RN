import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useBalls, getMuted, setMuted, sfx } from "../lib";

const NAV: [string, string][] = [
  ["perfil", "Perfil"], ["poderes", "Poderes"], ["sagas", "Sagas"],
  ["trayectoria", "Trayectoria"], ["shenron", "Invocar"],
];

export const scrollToId = (id: string, offset = -10) => {
  const t = document.getElementById(id);
  sfx("teleport");   // teletransportación al saltar de sección
  const l = (window as any).lenis;
  if (l) l.scrollTo(t, { offset }); else t?.scrollIntoView({ behavior: "smooth" });
};

export default function Hud() {
  const { count, isDone, recruiter } = useBalls();
  const [m, setM] = useState(getMuted());
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("");
  const ki = useRef<HTMLDivElement>(null);

  // barra de ki: solo trabaja mientras hay scroll (useScroll de framer medía en cada frame)
  useEffect(() => {
    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => { if (ki.current) ki.current.style.transform = `scaleX(${s.progress})`; } });
    return () => st.kill();
  }, []);

  // sección activa en el menú
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: "-45% 0px -50% 0px" });
    NAV.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  // la cartela de intro puede activar/silenciar el sonido
  useEffect(() => {
    const h = (e: Event) => setM((e as CustomEvent).detail as boolean);
    window.addEventListener("rn-mute", h);
    return () => window.removeEventListener("rn-mute", h);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [menu]);

  const go = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); setMenu(false); scrollToId(id); };

  return (
    <header className="hud">
      <a className="brand" href="#inicio" onClick={go("inicio")} aria-label="Rodrigo Negrete — volver al inicio">
        <img className="radar-logo-img" src="/assets/radar-device.png" alt="" />
        <div><b>RODRIGO NEGRETE</b><span>DRAGON RADAR · DEV LAB</span></div>
      </a>
      <nav className={"hud-nav" + (menu ? " open" : "")} id="hud-menu" aria-label="Secciones">
        {NAV.map(([id, l]) => <a key={id} href={"#" + id} onClick={go(id)} className={active === id ? "on" : ""} aria-current={active === id ? "true" : undefined}>{l}</a>)}
      </nav>
      <div className="hud-right">
        <div className="tracker" title="Esferas del Dragón reunidas" aria-label={`Esferas reunidas: ${count} de 7`}>
          <span className="lbl">D.RADAR</span>
          <span className="cnt">{count}/7</span>
          <div className="slots" aria-hidden>
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <span key={s} className={"slot" + (isDone(s) ? " full" : "")} data-slot={s}>
                {isDone(s) && <img src={`/assets/db/ball${s}.webp`} alt="" />}
              </span>
            ))}
          </div>
        </div>
        <button className="btn solid hud-cta" data-snd onClick={() => scrollToId("contacto", -110)}>✉ Contactar</button>
        <button className="btn gold" onClick={recruiter} aria-label="Modo Reclutador" title="Modo Reclutador: reúne las 7 esferas ahora">⚡ <span className="rec-txt">Modo Reclutador</span></button>
        <button className="btn icon-btn" data-snd aria-label={m ? "Activar sonido" : "Silenciar sonido"} aria-pressed={!m}
          onClick={() => { const nm = !m; setMuted(nm); setM(nm); if (!nm) sfx("radar"); }}>
          {m ? "🔇" : "🔊"}
        </button>
        <button className="btn icon-btn menu-btn" aria-label="Menú" aria-expanded={menu} aria-controls="hud-menu" onClick={() => setMenu((v) => !v)}>
          <span className={"burger" + (menu ? " x" : "")} aria-hidden><i /><i /><i /></span>
        </button>
      </div>
      <div className="ki-bar" ref={ki} style={{ transform: "scaleX(0)" }} aria-hidden />
    </header>
  );
}
