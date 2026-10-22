import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { TRANSFORMATIONS } from "../data";
import { Reveal, DBText } from "../lib";
import EvolutionBackground from "./EvolutionBackground";
import Splash from "./Splash";

const STEP_FULL = ["Forma base", "Super Saiyan", "Super Saiyan Blue", "Ultra Instinto", "Super Saiyan 4"];
const STEP_SHORT = ["Base", "SSJ", "Blue", "Ultra", "SSJ4"];

export default function Transformations() {
  const [i, setI] = useState(0);
  const [pulse, setPulse] = useState(0);
  const last = useRef(0);

  useEffect(() => {
    const h = (e: Event) => { const d = (e as CustomEvent).detail as number; setI(d); if (d !== last.current) { last.current = d; setPulse((n) => n + 1); } };   // destello de ki en cada cambio de fase (sin sonido)
    window.addEventListener("evo-phase", h);
    return () => window.removeEventListener("evo-phase", h);
  }, []);

  const goToPhase = (k: number) => {
    const track = document.querySelector<HTMLElement>(".evo-track");
    if (!track) return;
    const y = track.getBoundingClientRect().top + window.scrollY + (track.offsetHeight - window.innerHeight) * Math.min(0.98, TRANSFORMATIONS[k].at + 0.05);
    const l = (window as any).lenis;
    if (l) l.scrollTo(y); else window.scrollTo(0, y);
  };

  const t = TRANSFORMATIONS[i];
  const banner = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // parallax de la pose con ScrollTrigger (solo calcula durante el scroll)
  useEffect(() => {
    const img = banner.current?.querySelector("img");
    if (!img) return;
    if (reduce) { gsap.set(img, { scale: 1.1 }); return; }
    const tw = gsap.fromTo(img, { yPercent: -10, scale: 1.18 }, { yPercent: 10, scale: 1.18, ease: "none",
      scrollTrigger: { trigger: banner.current, start: "top bottom", end: "bottom top", scrub: true } });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); };
  }, [reduce]);

  return (
    <section id="poderes">
      <div className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <Splash scene="/assets/scenes/gravity.webp" sfx="¡FWOOSH!" tag="Transformaciones · Niveles de poder" title="Mi evolución profesional, *fase a fase.*" pos="75% 8%" className="narrow">
            <p>Cada transformación es una etapa real de mi carrera. Haz scroll: el aura cambia detrás de ti y mi currículum sube de nivel contigo, de la forma base hasta el máximo.</p>
          </Splash>
          <div className="ultra-banner" ref={banner}>
            <img src="/assets/ultra-pose.jpg" alt="Rodrigo concentrando su ki antes de transformarse" loading="lazy" decoding="async" />
            <Reveal className="ultra-copy">
              <span>Concentrando el ki…</span>
              <p>Ningún nivel se regala: cada transformación la desbloqueé entrenando — estudio, proyectos reales y +17 años de batalla en B2B.</p>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="evo-track">
        <div className="evo-sticky">
          <div className="evo-top">
            <div className="pno">FASE 0{i + 1} / 05 · {t.form}</div>
            <h2><DBText key={t.title} text={t.title} /></h2>
          </div>
          <div className="evo-steps" role="group" aria-label="Fases de mi evolución">
            <span className="es-line" aria-hidden><i className="es-fill" style={{ transform: `scaleX(${i / (TRANSFORMATIONS.length - 1)})` }} /></span>
            {TRANSFORMATIONS.map((tr, k) => (
              <button key={k} type="button" data-cursor className={"es" + (k < i ? " done" : "") + (k === i ? " on" : "")} style={{ ["--c" as any]: tr.aura }}
                aria-current={k === i ? "step" : undefined} aria-label={`Fase ${k + 1}: ${STEP_FULL[k]}`} onClick={() => goToPhase(k)}>
                <b>{k + 1}</b>
                <span className="es-full">{STEP_FULL[k]}</span><span className="es-short">{STEP_SHORT[k]}</span>
              </button>
            ))}
          </div>
          <div className="evo-stage">
          <div className="evo-screen">
            <EvolutionBackground />
            <span className="evo-screen-tag">● REC · SCOUTER</span>
            <span className="evo-screen-lvl">{t.form}</span>
            {pulse > 0 && <span key={pulse} className="evo-burst" aria-hidden><i /><i /><b /></span>}
          </div>
          <div className="evo-cards">
            {TRANSFORMATIONS.map((tr, k) => (
              <div key={k} className={"evo-card" + (k === i ? " on" : "")}>
                <div className="ft">▲ {tr.form} <span>{tr.sub}</span></div>
                <h3>Fase {k + 1} · {tr.title}</h3>
                <p>{tr.text}</p>
                <div className="sk">{tr.skills.map((s) => <i key={s}>{s}</i>)}</div>
                <div className="pw">NIVEL DE PODER <div className="bar"><i style={{ width: tr.power + "%" }} /></div> {tr.power}%</div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
