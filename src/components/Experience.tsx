import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { Reveal, More, DBText, CountUp } from "../lib";
import { EXPERIENCE, EDUCATION, IMPACT } from "../data";
import Splash from "./Splash";

export default function Experience() {
  const [allEdu, setAllEdu] = useState(false);
  const tl = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Camino de la Serpiente: la línea de ki se llena al avanzar y una esfera de energía marca por dónde vas
  useEffect(() => {
    const el = tl.current;
    if (!el || reduce) return;
    const prog = el.querySelector(".tl-prog"), orb = el.querySelector(".tl-orb");
    const st = { trigger: el, start: "top 62%", end: "bottom 62%", scrub: 0.4, invalidateOnRefresh: true };
    const a = gsap.fromTo(prog, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: st });
    const b = gsap.fromTo(orb, { y: 0 }, { y: () => el.offsetHeight - 12, ease: "none", scrollTrigger: st });
    const refresh = () => ScrollTrigger.refresh();                 // al abrir/cerrar un combate cambia la altura
    el.addEventListener("toggle", refresh, true);
    return () => { el.removeEventListener("toggle", refresh, true); [a, b].forEach((t) => { t.scrollTrigger?.kill(); t.kill(); }); };
  }, [reduce]);
  const edu = allEdu ? EDUCATION : EDUCATION.slice(0, 3);

  return (
    <section id="trayectoria" className="sec">
      <div className="wrap">
        <Splash scene="/assets/scenes/snake-way.webp" fig="/assets/rod/blue-suit.webp" figAlt="Rodrigo cargando ki con el aura azul de Super Saiyan Blue" ki sfx="¡BAM!" tag="Trayectoria de combate" title="Una transición *no convencional.*" pos="center 40%">
          <p>De la gestión B2B enterprise al diseño de producto con IA: un largo Camino de la Serpiente. Pulsa cada combate para ver el detalle.</p>
        </Splash>

        <Reveal>
          <ul className="impact" aria-label="Impacto clave">
            {IMPACT.map((m) => (
              <li key={m.l}><b><CountUp value={m.v} /></b><span>{m.l}</span><small>{m.s}</small></li>
            ))}
          </ul>
        </Reveal>

        <div className="tl" ref={tl}>
          <i className="tl-prog" aria-hidden /><i className="tl-orb" aria-hidden />
          {EXPERIENCE.map((x, i) => (
            <Reveal key={x.role + i} delay={i * 0.05}>
              <details className={"tl-item fold" + (x.now ? " now" : "")}>
                <summary data-cursor>
                  <span className="tl-when">{x.when}</span>
                  <h4>{x.role}</h4>
                  <span className="org">{x.org}</span>
                  <span className="tl-lead">{x.desc}</span>
                </summary>
                <div className="fold-body">
                  <ul className="tl-points">{x.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                  <div className="tl-tags">{x.tags.map((t) => <i key={t}>{t}</i>)}</div>
                </div>
              </details>
            </Reveal>
          ))}
        </div>

        <div style={{ margin: "76px 0 30px" }}>
          <Splash scene="/assets/scenes/kame-house.jpg" fig="/assets/rod/roshi.webp" figAlt="El Maestro Roshi, entrenador de la Kame House" sfx="¡ZAS!" tag="Kame House · Formación" title="Entrenamiento *académico.*" compact>
            <p>Cada maestro, un nuevo nivel de poder.</p>
          </Splash>
        </div>

        <div className="edu-grid">
          {edu.map((e, i) => (
            <Reveal key={e.title} delay={(i % 2) * 0.06}>
              <details className="edu fold">
                <summary data-cursor>
                  <span className={"st " + (e.state === "En curso" ? "cur" : "fin")}>{e.state.toUpperCase()}</span>
                  <h4>{e.title}</h4>
                  <span className="org">{e.org} · {e.when}</span>
                </summary>
                <div className="fold-body">
                  <p>{e.desc}</p>
                  {e.links && <div className="edu-links">{e.links.map(([t, u]) => <a key={u} className="btn" data-cursor href={u} target="_blank" rel="noopener">{t} ↗</a>)}</div>}
                </div>
              </details>
            </Reveal>
          ))}
        </div>
        <More open={allEdu} onToggle={() => setAllEdu((v) => !v)} more={EDUCATION.length - 3} label="Ver toda la formación" />
      </div>
    </section>
  );
}
