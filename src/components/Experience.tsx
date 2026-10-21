import { useState } from "react";
import { Reveal, More, DBText } from "../lib";
import { EXPERIENCE, EDUCATION } from "../data";

export default function Experience() {
  const [allEdu, setAllEdu] = useState(false);
  const edu = allEdu ? EDUCATION : EDUCATION.slice(0, 3);

  return (
    <section id="trayectoria" className="sec">
      <div className="wrap">
        <Reveal>
          <div className="sec-head splash" data-sfx="¡BAM!" style={{ ["--scene" as any]: "url(/assets/scenes/battle.jpg)" }}>
            <div className="sec-tag">Trayectoria de combate</div>
            <h2><DBText text="Una transición *no convencional.*" /></h2>
            <p>De la gestión B2B enterprise al diseño de producto con IA. Pulsa cada combate para ver el detalle.</p>
          </div>
        </Reveal>

        <div className="tl">
          {EXPERIENCE.map((x, i) => (
            <Reveal key={x.role + i} delay={i * 0.05}>
              <details className={"tl-item fold" + (x.now ? " now" : "")} open={i === 0}>
                <summary data-cursor>
                  <span className="tl-when">{x.when}</span>
                  <h4>{x.role}</h4>
                  <span className="org">{x.org}</span>
                </summary>
                <div className="fold-body">
                  <p>{x.desc}</p>
                  <div className="tl-tags">{x.tags.map((t) => <i key={t}>{t}</i>)}</div>
                </div>
              </details>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="sec-head" data-sfx="¡ZAS!" style={{ margin: "70px 0 26px" }}>
            <div className="sec-tag">Cámara de gravedad · Formación</div>
            <h2 style={{ fontSize: "clamp(26px,3.6vw,40px)" }}><DBText text="Entrenamiento *académico.*" /></h2>
          </div>
        </Reveal>

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
