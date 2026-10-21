import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { TRANSFORMATIONS } from "../data";
import { Reveal } from "../lib";
import EvolutionBackground from "./EvolutionBackground";

export default function Transformations() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const h = (e: Event) => setI((e as CustomEvent).detail as number);
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
  const { scrollYProgress } = useScroll({ target: banner, offset: ["start end", "end start"] });
  const poseT = useTransform(scrollYProgress, [0, 1], reduce
    ? ["translateY(0%) scale(1.1)", "translateY(0%) scale(1.1)"]
    : ["translateY(-10%) scale(1.18)", "translateY(10%) scale(1.18)"]);

  return (
    <section id="poderes">
      <div className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <Reveal>
            <div className="sec-head" data-sfx="¡FWOOSH!">
              <div className="sec-tag">Transformaciones · Niveles de poder</div>
              <h2>Mi evolución profesional, fase a fase.</h2>
              <p>Cada transformación es una etapa real de mi carrera. Haz scroll: el aura cambia detrás de ti y mi currículum sube de nivel contigo — de la forma base hasta el máximo.</p>
            </div>
          </Reveal>
          <div className="ultra-banner" ref={banner}>
            <motion.img src="/assets/ultra-pose.jpg" alt="Rodrigo concentrando su ki antes de transformarse" style={{ transform: poseT }} />
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
            <h2>{t.title}</h2>
          </div>
          <div className="evo-dots">
            {TRANSFORMATIONS.map((_, k) => (
              <b key={k} className={k === i ? "on" : ""} data-cursor onClick={() => goToPhase(k)} />
            ))}
          </div>
          <div className="evo-stage">
          <div className="evo-screen">
            <EvolutionBackground />
            <span className="evo-screen-tag">● REC · SCOUTER</span>
            <span className="evo-screen-lvl">{t.form}</span>
          </div>
          <div className="evo-cards">
            {TRANSFORMATIONS.map((tr, k) => (
              <div key={k} className={"evo-card" + (k === i ? " on" : "")}>
                <div className="ft">▲ {tr.form} <span>· {tr.sub}</span></div>
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
