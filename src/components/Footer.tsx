import { useState } from "react";
import { motion } from "framer-motion";
import { useBalls, sfx, DBText, Reveal } from "../lib";
import { CONTACT } from "../data";
import { scrollToId } from "./Hud";

const NAV: [string, string][] = [["perfil", "Perfil"], ["poderes", "Poderes"], ["sagas", "Sagas"], ["trayectoria", "Trayectoria"], ["shenron", "Invocar"]];

// Cada vía de contacto es un universo del Torneo del Poder
const rgb = (h: string) => { const n = parseInt(h.slice(1), 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; };
const UNIVERSES = [
  { n: 7, label: "Email", sub: "Respuesta en 24 h", href: `mailto:${CONTACT.email}`, c: "#ffcf2e" },
  { n: 2, label: "WhatsApp", sub: CONTACT.phone, href: `https://wa.me/${CONTACT.whatsapp}`, c: "#49f08a" },
  { n: 11, label: "LinkedIn", sub: "Conectemos", href: CONTACT.linkedin, c: "#2fb8ff" },
  { n: 6, label: "GitHub", sub: "@Ronegret", href: CONTACT.github, c: "#c38bff" },
  { n: 4, label: "CV", sub: "Versión completa", href: CONTACT.cv, c: "#ff6b6b" },
];
type U = { n: number; label: string; sub: string; href: string; c: string };
function Orb({ u, i }: { u: U; i: number }) {
  return (
    <motion.li initial={{ opacity: 0, scale: 0.35, y: 36 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, margin: "-6% 0px" }}
      transition={{ type: "spring", duration: 0.75, bounce: 0.38, delay: (i % 7) * 0.07 }}>
      <a className="orb" href={u.href} target={u.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener" data-cursor
        aria-label={`Universo ${u.n}: ${u.label}. ${u.sub}`} onClick={() => sfx("teleport")}
        style={{ ["--u" as any]: u.c, ["--ur" as any]: rgb(u.c), ["--f" as any]: `${6 + (i % 5) * 0.9}s`, ["--d" as any]: `${-(i % 5) * 1.3}s` }}>
        <span className="orb-halo" aria-hidden />
        <span className="orb-ring" aria-hidden><i><em /></i></span>
        <span className="orb-sphere" aria-hidden><i className="orb-swirl" /><i className="orb-shine" /><b>U{u.n}</b></span>
        <strong>{u.label}</strong>
        <small>{u.sub}</small>
      </a>
    </motion.li>
  );
}

const PORTALS = [
  { href: CONTACT.web, img: "portfolio", tag: "Universo principal", name: "rodrigonegrete.es", desc: "Mi portfolio completo: casos de estudio, laboratorio, trayectoria y CV.", cta: "Viajar al portfolio" },
  { href: "https://rodd.es", img: "rodd", tag: "Proyecto principal · Open source", name: "rodd.es", desc: "Biblioteca open source de 287 recursos web en 7 idiomas, lista para probar y copiar.", cta: "Viajar a rodd.es" },
];

/** Letras estilo logo de la serie: arco dorado con contorno negro y extrusión */
export function DBLogo() {
  const layers = [
    { dy: 14, fill: "#120400", stroke: "#120400", sw: 20 },
    { dy: 7, fill: "#b32400", stroke: "#000", sw: 16 },
    { dy: 0, fill: "url(#dbgold)", stroke: "#000", sw: 11 },
  ];
  return (
    <svg className="dbf-logo" viewBox="0 0 1000 410" role="img" aria-label="Rodrigo Negrete">
      <defs>
        <linearGradient id="dbgold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7b0" /><stop offset=".42" stopColor="#ffcf2e" /><stop offset="1" stopColor="#ff6a00" />
        </linearGradient>
        <path id="dbarc" d="M70 225 Q500 15 930 225" />
      </defs>
      <image href="/assets/db/ball4.webp" x="395" y="130" width="210" height="210" />
      {layers.map((l, i) => (
        <g key={i} transform={`translate(0 ${l.dy})`} fill={l.fill} stroke={l.stroke} strokeWidth={l.sw} strokeLinejoin="round" paintOrder="stroke">
          <text className="dbf-arc"><textPath href="#dbarc" startOffset="50%" textAnchor="middle">RODRIGO</textPath></text>
          <text className="dbf-sub" x="500" y="385" textAnchor="middle">NEGRETE</text>
        </g>
      ))}
    </svg>
  );
}

export default function Footer() {
  const { reset } = useBalls();
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(CONTACT.email); sfx("radar"); setCopied(true); setTimeout(() => setCopied(false), 2200); }
    catch { window.location.href = `mailto:${CONTACT.email}`; }   // sin permiso de portapapeles: abre el cliente de correo
  };
  return (
    <footer className="dbfoot" id="multiverso">
      <div className="wrap">
        <div className="dbf-head">
          <span className="dbf-kicker">Saga del multiverso</span>
          <h2><DBText text="Cruza a mis *otros universos*" /></h2>
          <p>Este portfolio es solo un capítulo. El resto de la historia vive aquí:</p>
        </div>

        <div className="dbf-portals">
          {PORTALS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
            <a className="dbf-portal" href={p.href} target="_blank" rel="noopener" data-cursor onClick={() => sfx("teleport")}>
              <span className="dbf-radar">
                <img className="dbf-radar-dev" src="/assets/radar-device.webp" alt="" loading="lazy" />
                <span className="dbf-scope">
                  <img src={`/assets/proj/${p.img}.webp`} alt={`Vista de ${p.name}`} loading="lazy" />
                  <i className="dbf-sweep" /><i className="dbf-cross" /><i className="dbf-blip b1" /><i className="dbf-blip b2" />
                </span>
              </span>
              <span className="dbf-ptag">{p.tag}</span>
              <b>{p.name}</b>
              <span className="dbf-pdesc">{p.desc}</span>
              <span className="dbf-go">{p.cta} ↗</span>
            </a>
            </Reveal>
          ))}
        </div>

        <h3 className="dbf-uh" id="contacto"><DBText text="Elige tu *universo*" /></h3>
        <p className="dbf-uhint">Cinco caminos para hablar conmigo. Cada universo, una puerta distinta.</p>
        <ul className="uni-main" aria-label="Vías de contacto">
          {UNIVERSES.map((u, i) => <Orb key={u.n} u={u} i={i} />)}
        </ul>

        <div className="dbf-copy">
          <span>¿Prefieres escribir ya?</span>
          <code>{CONTACT.email}</code>
          <button type="button" className="btn gold" data-snd onClick={copyEmail}>{copied ? "¡Copiado! ✓" : "Copiar email"}</button>
          <span className="sr-only" role="status">{copied ? "Email copiado al portapapeles" : ""}</span>
        </div>

        <div className="dbf-stage">
          <img className="dbf-rod" src="/assets/rod/look-up.webp" alt="" loading="lazy" />
          <DBLogo />
        </div>

        <div className="dbf-end">
          <span>¡Continuará!</span>
          <small>En el próximo episodio: tu proyecto y mi próxima transformación.</small>
        </div>

        <div className="dbf-meta">
          <nav aria-label="Secciones (pie)">
            {NAV.map(([id, l]) => <a key={id} className="btn dbf-nav" data-cursor href={"#" + id} onClick={(e) => { e.preventDefault(); scrollToId(id); }}>{l}</a>)}
          </nav>
          <span>© 2026 Rodrigo Negrete Aros · Capsule Corp Dev Lab · Barcelona</span>
          <button type="button" className="btn dbf-nav foot-reset" onClick={reset} data-cursor>⟲ Reiniciar búsqueda de esferas</button>
        </div>
      </div>
    </footer>
  );
}
