import { Reveal, isWide, DBText } from "../lib";
import { PROFILE, LANGS, CONTACT } from "../data";
import Splash from "./Splash";

export default function Profile() {
  return (
    <section id="perfil" className="sec">
      <div className="wrap">
        <Splash scene="/assets/scenes/barcelona.webp" sfx="¡SCAN!" tag="Scouter · Lectura de combate" title="Diseño de producto con *IA aplicada.*" pos="62% 40%" className="narrow">
          <p>Base de operaciones: Barcelona, a la sombra de la Sagrada Familia. Desde aquí entreno cada día producto, UX y automatización con IA.</p>
        </Splash>

        <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 44, alignItems: "center" }} className="perfil-grid">
          <Reveal>
            <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
              <div className="hero-ring r1" style={{ width: "min(80%,340px)" }} />
              <img src="/assets/rod/portrait.webp" alt="Rodrigo Negrete con su camiseta de Capsule Corp"
                style={{ width: "min(88%,360px)", filter: "drop-shadow(0 26px 46px rgba(0,0,0,.6))", position: "relative", zIndex: 2 }} />
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p style={{ color: "var(--ink)", fontSize: 17, lineHeight: 1.7, marginTop: 0 }}>
                Soy Rodrigo, diseñador de producto especializado en <b>IA aplicada</b> y automatización de procesos.
                Diseño, construyo y despliego <b>agentes IA</b> (Botpress, Vapi, Claude/GPT/Gemini), flujos de
                <b> hiperautomatización</b> (Make, n8n) y producto digital con IA integrada como parte del flujo — no como añadido.
              </p>
            </Reveal>

            <details className="fold perfil-more" open={isWide()}>
              <summary data-cursor><img className="fiche-ava" src="/assets/rod/vest.webp" alt="" loading="lazy" /><span className="fiche-txt"><span className="tl-when">FICHA TÉCNICA DEL GUERRERO</span><h4>Ubicación, modalidad, disponibilidad e idiomas</h4></span></summary>
              <div className="fold-body">
            <Reveal delay={0.1}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, margin: "26px 0" }} className="perfil-data">
                {[
                  ["Ubicación", PROFILE.location],
                  ["Modalidad", "Remoto · Híbrido BCN"],
                  ["Disponibilidad", "Inmediata"],
                  ["Objetivo", "Empleo estable + proyectos UX/IA"],
                ].map(([k, v]) => (
                  <div key={k} style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 16, background: "var(--panel)" }}>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: ".12em", color: "var(--mut)", display: "block", marginBottom: 6 }}>{k.toUpperCase()}</span>
                    <b style={{ fontSize: 14 }}>{v}</b>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div style={{ display: "flex", gap: 26, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: ".16em", color: "var(--mut)" }}>IDIOMAS</span>
                {LANGS.map((l) => (
                  <div key={l.l}>
                    <b style={{ fontSize: 15 }}>{l.l}</b>
                    <span style={{ color: "var(--accent)", fontFamily: "var(--f-mono)", fontSize: 12, marginLeft: 8 }}>{l.lv}</span>
                  </div>
                ))}
              </div>
            </Reveal>
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
