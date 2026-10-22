import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal, DBIcon, More } from "../lib";
import { STACK } from "../data";
import SkillsBoard from "./SkillsBoard";
import Splash from "./Splash";

export default function Stack() {
  const [all, setAll] = useState(false);
  // "Ver todas" también abre las tres columnas; plegarlas de nuevo es cosa del visitante
  const toggleAll = () => {
    if (!all) document.querySelectorAll<HTMLDetailsElement>(".stack-col").forEach((d) => { d.open = true; });
    setAll((v) => !v);
  };
  const hidden = STACK.reduce((n, c) => n + Math.max(0, c.tools.length - 5), 0);
  return (
    <section id="stack" className="sec">
      <div className="wrap">
        <Splash scene="/assets/scenes/kaio-planet.jpg" fig="/assets/rod/team.webp" figAlt="Rodrigo con su equipo: Goku, Vegeta, Beerus y las IA que usa a diario" sfx="¡KAME!" tag="Arsenal · Técnicas dominadas" title="Herramientas usadas en *proyectos reales.*">
          <p>Técnicas entrenadas en el planeta de Kaio-sama, con un equipo de IA a mi lado. Stack práctico para investigar, prototipar, lanzar, automatizar y medir, con foco en uso real, no en una lista inflada de expertise.</p>
        </Splash>

        <div className="stack-grid">
          {STACK.map((col, ci) => (
            <Reveal key={col.group} delay={ci * 0.08}>
              <details className="stack-col fold">
                <summary className="h" data-cursor>
                  <b className="stack-title"><DBIcon name={col.icon} size={40} /> {col.group}</b>
                  <span className="ct">{col.count}</span>
                </summary>
                {(all ? col.tools : col.tools.slice(0, 5)).map((t) => (
                  <div className="tool" key={t.n}>
                    <div className="t"><b>{t.n}</b><span>{t.lv}</span></div>
                    <div className="ki">
                      <motion.i style={{ display: "block", height: "100%", width: t.k + "%", transformOrigin: "0 50%" }}
                        initial={{ transform: "scaleX(0)" }} whileInView={{ transform: "scaleX(1)" }}
                        viewport={{ once: true }} transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }} />
                    </div>
                  </div>
                ))}
              </details>
            </Reveal>
          ))}
        </div>
        <More open={all} onToggle={toggleAll} more={hidden} label="Ver todas las técnicas" />

        <Reveal>
          <div className="comp-head">
            <span className="sec-tag">Competencias clave</span>
            <h3 className="comp-title">Lo que sé hacer</h3>
            <p>Las áreas que domino. Pulsa un punto del portátil o abre cada área para ver el detalle.</p>
          </div>
        </Reveal>
        <SkillsBoard />
      </div>
    </section>
  );
}
