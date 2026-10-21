import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal, DBIcon, More, isWide, DBText } from "../lib";
import { STACK } from "../data";

export default function Stack() {
  const [all, setAll] = useState(false);
  const hidden = STACK.reduce((n, c) => n + Math.max(0, c.tools.length - 5), 0);
  return (
    <section id="stack" className="sec">
      <div className="wrap">
        <Reveal>
          <div className="sec-head splash" data-sfx="¡KAME!" style={{ ["--scene" as any]: "url(/assets/scenes/kaio-planet.jpg)" }}>
            <div className="sec-tag">Arsenal · Técnicas dominadas</div>
            <h2><DBText text="Herramientas usadas en *proyectos reales.*" /></h2>
            <p>Técnicas entrenadas en el planeta de Kaio-sama. Stack práctico para investigar, prototipar, lanzar, automatizar y medir. Presentado con foco en uso real, no como una lista inflada de expertise.</p>
          </div>
        </Reveal>

        <div className="stack-grid">
          {STACK.map((col, ci) => (
            <Reveal key={col.group} delay={ci * 0.08}>
              <details className="stack-col fold" open={ci === 0 || isWide()}>
                <summary className="h" data-cursor>
                  <b className="stack-title"><DBIcon name={col.icon} size={40} /> {col.group}</b>
                  <span className="ct">{col.count}</span>
                </summary>
                {(all ? col.tools : col.tools.slice(0, 5)).map((t) => (
                  <div className="tool" key={t.n}>
                    <div className="t"><b>{t.n}</b><span>{t.lv}</span></div>
                    <div className="ki">
                      <motion.i style={{ display: "block", height: "100%" }}
                        initial={{ width: 0 }} whileInView={{ width: t.k + "%" }}
                        viewport={{ once: true }} transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }} />
                    </div>
                  </div>
                ))}
              </details>
            </Reveal>
          ))}
        </div>
        <More open={all} onToggle={() => setAll((v) => !v)} more={hidden} label="Ver todas las técnicas" />
      </div>
    </section>
  );
}
