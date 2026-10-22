import { Reveal, DBIcon } from "../lib";
import { PROFILE, LANGS, CONTACT } from "../data";
import Splash from "./Splash";

const LEVEL: Record<string, number> = { Nativo: 100, C1: 85, B2: 72, B1: 58, A2: 38, A1: 22 };

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
              <img className="perfil-ava" src="/assets/rod/portrait.webp" alt="Rodrigo Negrete con su camiseta de Capsule Corp" loading="lazy" decoding="async"
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

            <details className="ficha" open>
              <summary data-cursor>
                <span className="ficha-tag"><i className="cc-logo" aria-hidden /> Ficha de guerrero <em>Nº 0001</em></span>
                <span className="ficha-lvl">NIVEL <b>9001</b></span>
                <span className="ficha-chev" aria-hidden />
              </summary>
              <div className="ficha-body">
                <div className="ficha-id">
                  <div className="ficha-photo">
                    <img src="/assets/rod/vest.webp" alt="Rodrigo Negrete con el chaleco de Capsule Corp" loading="lazy" />
                    <i className="ficha-scan" aria-hidden />
                    <span className="ficha-live"><i aria-hidden /> Activo</span>
                  </div>
                  <div className="ficha-who"><b>{PROFILE.name}</b><small>AI Product Designer</small></div>
                </div>
                <ul className="ficha-stats">
                  {([["globe", "Ubicación", PROFILE.location], ["bolt", "Modalidad", "Remoto · Híbrido BCN"], ["calendar", "Disponibilidad", "Inmediata"], ["star", "Objetivo", "Empleo estable + proyectos UX/IA"]] as const).map(([ic, k, v]) => (
                    <li key={k}><DBIcon name={ic} size={38} /><span><span className="fs-k">{k}</span><span className="fs-v">{v}</span></span></li>
                  ))}
                </ul>
                <div className="ficha-langs">
                  <span className="fl-h">Idiomas · técnicas de comunicación</span>
                  {LANGS.map((l) => (
                    <div key={l.l} className="fl"><b>{l.l}</b><em>{l.lv}</em><span className="fl-bar"><i style={{ ["--w" as any]: LEVEL[l.lv] ?? 50 }} /></span></div>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
