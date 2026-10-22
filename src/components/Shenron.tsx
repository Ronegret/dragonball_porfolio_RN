import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion, animate } from "framer-motion";
import { useBalls, DBIcon, DBText } from "../lib";
import { CONTACT, PROFILE, LANGS } from "../data";
import WishFrame from "./WishFrame";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const mailto = (subject: string, body: string) =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

const INTERVIEW = mailto(
  "Entrevista — reuní las 7 esferas 🐉",
  "Hola Rodrigo,\n\nHe visto tu portfolio y me gustaría agendar una entrevista para el puesto de: \n\nEmpresa: \nDisponibilidad para la llamada: \n\n¡Gracias!",
);

/** Contador de nivel de poder (scouter) que termina en el clásico "¡más de 9000!". */
function PowerLevel() {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setN(9001); return; }
    const c = animate(0, 9001, { duration: 1.6, ease: EASE_OUT, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, reduce]);
  return (
    <span ref={ref} className="pl">
      <b>{n.toLocaleString("es-ES")}</b>
      {n >= 9001 && <motion.em initial={{ opacity: 0, transform: "scale(0.9)" }} animate={{ opacity: 1, transform: "scale(1)" }} transition={{ duration: 0.3, ease: EASE_OUT }}>¡MÁS DE 9000!</motion.em>}
    </span>
  );
}

export default function Shenron() {
  const { unlocked, count, isDone, recruiter } = useBalls();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(CONTACT.email); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { window.location.href = `mailto:${CONTACT.email}`; }
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const g = (n: string) => (f.elements.namedItem(n) as HTMLInputElement)?.value || "";
    window.location.href = mailto(`Deseo desde tu portfolio — ${g("name")}`,
      `Nombre: ${g("name")}\nContacto: ${g("contact")}\nDeseo: ${g("wish")}\n\n${g("msg")}`);
  };

  const LINKS = [
    { ic: "chat", t: "WhatsApp", s: CONTACT.phone, href: `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.waText)}` },
    { ic: "in", t: "LinkedIn", s: "rodrigonegretearos", href: CONTACT.linkedin },
    { ic: "code", t: "GitHub", s: "Ronegret · código y agentes", href: CONTACT.github },
    { ic: "scroll", t: "CV completo", s: "rodrigonegrete.es/cv", href: CONTACT.cv },
    { ic: "globe", t: "Web principal", s: "rodrigonegrete.es", href: CONTACT.web },
    { ic: "star", t: "Rodd.es", s: "Biblioteca open source", href: "https://rodd.es/" },
  ];

  return (
    <section id="shenron" className={unlocked ? "is-open" : ""}>
      <div className="wrap">
        <AnimatePresence mode="wait">
          {!unlocked ? (
            <motion.div key="lock" className="shen-lock" exit={{ opacity: 0, transform: "scale(0.98)" }} transition={{ duration: 0.25, ease: EASE_OUT }}>
              <img className="shen-rod" src="/assets/rod/radar.webp" alt="Rodrigo rastreando las esferas con el Radar del Dragón" loading="lazy" />
              <div className="shen-lock-body">
              <div className="shen-balls" aria-label={`Llevas ${count} de 7 esferas`}>
                {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <img key={s} src={`/assets/db/ball${s}.webp`} alt="" className={isDone(s) ? "got" : ""} />
                ))}
              </div>
              <h2><DBText text="El cielo aún está *en calma…*" /></h2>
              <p>Reúne las <b>7 esferas del dragón</b> escondidas por la web para invocar a Shen Long y desbloquear todas mis vías de contacto. Llevas <b>{count} de 7</b>.</p>
              <button className="btn gold" data-cursor onClick={recruiter}>⚡ Soy reclutador: reunirlas ahora</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="open" className="shen-open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <span className="shen-flash" aria-hidden />
              <motion.img className="shen-img" src="/assets/shenron.jpg" alt="Shen Long emerge de las 7 esferas del dragón"
                initial={{ opacity: 0, transform: "scale(0.96)" }} animate={{ opacity: 1, transform: "scale(1)" }}
                transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 }} />
              <div className="shen-title">
                <motion.img className="shen-kneel" src="/assets/rod/kneel-balls.webp" alt="Rodrigo con las 7 esferas del dragón reunidas"
                  initial={{ opacity: 0, transform: "translateY(28px) scale(0.94)" }} animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
                  transition={{ type: "spring", duration: 0.7, bounce: 0.3, delay: 0.6 }} />
                <div>
                  <h2><DBText text="HAS REUNIDO LAS *7 ESFERAS*" /></h2>
                  <p className="shen-says">«Dime tu deseo, y te lo concederé.»</p>
                </div>
              </div>

              <div className="shen-wishes">
                <a className="btn solid big" data-cursor href={INTERVIEW}><DBIcon name="calendar" size={34} /> Deseo una entrevista con Rodrigo</a>
                <a className="btn gold big" data-cursor target="_blank" rel="noopener" href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.waText)}`}><DBIcon name="chat" size={34} /> Hablar ya por WhatsApp</a>
                <a className="btn big" data-cursor target="_blank" rel="noopener" href={CONTACT.cv}><DBIcon name="scroll" size={34} /> Ver CV completo</a>
              </div>

              <div className="scouter">
                <div className="scouter-head"><span className="dot" /> LECTURA DE SCOUTER · GUERRERO IDENTIFICADO</div>
                <div className="scouter-body">
                <div className="scouter-scan" aria-hidden>
                  <img src="/assets/rod/suit-full.webp" alt="" loading="lazy" />
                  <i className="scan-line" />
                </div>
                <div className="scouter-grid">
                  <div><span>NOMBRE</span><b>{PROFILE.name}</b></div>
                  <div><span>CLASE</span><b>{PROFILE.roles}</b></div>
                  <div><span>DISPONIBILIDAD</span><b className="ok">Inmediata · Full-time / Freelance</b></div>
                  <div><span>BASE</span><b>{PROFILE.location} · Remoto EU</b></div>
                  <div><span>IDIOMAS</span><b>{LANGS.map((l) => `${l.l} ${l.lv}`).join(" · ")}</b></div>
                  <div><span>NIVEL DE PODER</span><PowerLevel /></div>
                </div>
                </div>
              </div>

              <motion.ul className="links" initial="h" whileInView="s" viewport={{ once: true, margin: "-10% 0px" }}
                variants={{ s: { transition: { staggerChildren: 0.06 } } }}>
                <motion.li variants={{ h: { opacity: 0, transform: "translateY(18px)" }, s: { opacity: 1, transform: "translateY(0px)", transition: { duration: 0.45, ease: EASE_OUT } } }}>
                  <button className="link-card" data-cursor onClick={copyEmail} aria-live="polite">
                    <DBIcon name="mail" /><div><b>{copied ? "¡Email copiado!" : "Copiar email"}</b><span>{CONTACT.email}</span></div>
                  </button>
                </motion.li>
                {LINKS.map((l) => (
                  <motion.li key={l.t} variants={{ h: { opacity: 0, transform: "translateY(18px)" }, s: { opacity: 1, transform: "translateY(0px)", transition: { duration: 0.45, ease: EASE_OUT } } }}>
                    <a className="link-card" data-cursor target="_blank" rel="noopener" href={l.href}>
                      <DBIcon name={l.ic} /><div><b>{l.t}</b><span>{l.s}</span></div>
                    </a>
                  </motion.li>
                ))}
              </motion.ul>

              <WishFrame>
                <form className="wish-panel" onSubmit={submit}>
                  <span className="wp-shell" aria-hidden><i className="wp-bg" /></span>
                  <div className="wp-head">
                    <h3 className="wp-title">Pide tu deseo</h3>
                    <p>Rellénalo y se abrirá tu email con el mensaje listo para enviar.</p>
                  </div>
                  <div className="field f-name"><label htmlFor="w-name">Tu nombre</label><input id="w-name" name="name" required placeholder="Bulma Brief" autoComplete="name" /></div>
                  <div className="field f-contact"><label htmlFor="w-contact">Email o teléfono de contacto</label><input id="w-contact" name="contact" required placeholder="tucorreo@empresa.com" autoComplete="email" /></div>
                  <div className="field f-wish"><label htmlFor="w-wish">Tu deseo</label>
                    <select id="w-wish" name="wish">
                      <option>Deseo contratar a Rodrigo en mi equipo</option>
                      <option>Deseo automatizar mi empresa con Agentes IA</option>
                      <option>Deseo una web / UX-UI de alto impacto</option>
                      <option>Otro (lo cuento abajo)</option>
                    </select>
                  </div>
                  <div className="field f-msg"><label htmlFor="w-msg">Mensaje</label><textarea id="w-msg" name="msg" placeholder="Cuéntame el puesto o proyecto…" /></div>
                  <button className="wish-go" type="submit" data-cursor><span>Invocar contacto →</span></button>
                </form>
              </WishFrame>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
