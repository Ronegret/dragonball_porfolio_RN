import { Reveal, DBText } from "../lib";
import { REFERENCES } from "../data";
import Splash from "./Splash";

export default function References() {
  return (
    <section id="referencias" className="sec">
      <div className="wrap">
        <Splash scene="/assets/scenes/namek-land.webp" fig="/assets/rod/jacket.webp" figAlt="Rodrigo Negrete" sfx="¡WOW!" tag="Aliados · Referencias verificadas" title="Lo que dicen quienes han *trabajado conmigo.*">
          <p>Opiniones reales de colaboradores y clientes. Solo publico referencias con permiso explícito de cada persona.</p>
        </Splash>

        <div className="ref-grid">
          {REFERENCES.map((r, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <details className="ref fold">
                <summary data-cursor>
                  <div className="stars">★★★★★</div>
                  <div className="who">
                    <span className="av">{r.who.replace(/\./g, "")}</span>
                    <div><b>{r.who}</b><span>{r.role}</span></div>
                  </div>
                </summary>
                <div className="fold-body"><p>«{r.text}»</p></div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
