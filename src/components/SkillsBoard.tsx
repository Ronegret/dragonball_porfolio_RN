import { useRef, useState } from "react";
import { COMPETENCIAS } from "../data";
import { DBIcon, Reveal } from "../lib";

/** "Lo que sé hacer": el portátil con las pegatinas de mis herramientas, y a su lado las 5 áreas plegadas.
 *  Cada punto del portátil abre el área que le corresponde (una a la vez, para no abrumar). */
export default function SkillsBoard() {
  const [active, setActive] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const refs = useRef<(HTMLDetailsElement | null)[]>([]);

  const pick = (i: number) => {
    setTouched(true);
    if (active === i) { setActive(null); return; }
    setActive(i);
    // en pantallas estrechas la lista queda debajo de la imagen: lleva la vista hasta el área abierta
    if (window.matchMedia("(max-width:900px)").matches) {
      setTimeout(() => {
        const el = refs.current[i]; if (!el) return;
        const l = (window as any).lenis;
        if (l) l.scrollTo(el, { offset: -140 }); else el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 140);
    }
  };

  return (
    <div className="skills">
      <Reveal>
        <figure className="skills-scene">
          <img className="sk-img" src="/assets/scenes/lab-desk.webp" loading="lazy" decoding="async"
            alt="Rodrigo pensando frente a su portátil, cubierto de pegatinas de las herramientas que usa: ChatGPT, Claude, n8n, Make, Gemini, HTML, CSS, JavaScript, Photoshop y Figma, en el laboratorio de Capsule Corp." />
          {COMPETENCIAS.map((c, i) => (
            <button key={c.group} type="button" data-cursor aria-pressed={active === i} aria-label={`${c.group}: ver detalle`}
              className={"sk-pin" + (active === i ? " on" : "") + (c.pin[0] > 70 ? " r" : "")}
              style={{ left: c.pin[0] + "%", top: c.pin[1] + "%" }} onClick={() => pick(i)}>
              <i aria-hidden /><span className="sk-lab" aria-hidden>{c.group}</span>
            </button>
          ))}
          <figcaption className={"sk-hint" + (touched ? " off" : "")} aria-hidden>Pulsa un punto del portátil</figcaption>
        </figure>
      </Reveal>

      <div className="skills-list">
        {COMPETENCIAS.map((c, i) => (
          <Reveal key={c.group} delay={i * 0.06}>
            <details ref={(el) => { refs.current[i] = el; }} className={"comp-item fold" + (active === i ? " on" : "")} open={active === i}
              onToggle={(e) => {
                const o = e.currentTarget.open;
                if (o && active !== i) setActive(i); else if (!o && active === i) setActive(null);
              }}>
              <summary data-cursor>
                <DBIcon name={c.icon} size={40} />
                <span className="ci-txt"><b>{c.group}</b><small>{c.blurb}</small></span>
                <span className="ct">{c.items.length}</span>
              </summary>
              <div className="fold-body">
                <ul className="comp-chips">{c.items.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            </details>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
