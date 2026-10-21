import { Reveal, isWide, DBText } from "../lib";
import { REFERENCES } from "../data";

export default function References() {
  return (
    <section id="referencias" className="sec">
      <div className="wrap">
        <Reveal>
          <div className="sec-head" data-sfx="¡WOW!">
            <div className="sec-tag">Aliados · Referencias verificadas</div>
            <h2><DBText text="Lo que dicen quienes han *trabajado conmigo.*" /></h2>
            <p>Opiniones reales de colaboradores y clientes. Solo publico referencias con permiso explícito de cada persona.</p>
          </div>
        </Reveal>

        <div className="ref-grid">
          {REFERENCES.map((r, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <details className="ref fold" open={i === 0 || isWide()}>
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
