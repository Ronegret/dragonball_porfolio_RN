import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { PROJECTS, PROJECT_CATS, LAB } from "../data";
import { Reveal, hexA, sfx, fadeOutSfx, More, DBText } from "../lib";
import Splash from "./Splash";

function capsuleBurst(x: number, y: number, color: string) {
  const wrap = document.createElement("div");
  wrap.className = "burst"; wrap.style.left = x + "px"; wrap.style.top = y + "px";
  document.body.appendChild(wrap);
  const flash = document.createElement("div"); flash.className = "flash"; wrap.appendChild(flash);
  const ring = document.createElement("div"); ring.className = "ring"; ring.style.borderColor = color || "#fff"; wrap.appendChild(ring);
  gsap.fromTo(flash, { scale: 0, opacity: 1 }, { scale: 6, opacity: 0, duration: 0.45, ease: "power2.out" });
  gsap.fromTo(ring, { scale: 0, opacity: 0.9 }, { scale: 8, opacity: 0, duration: 0.6, ease: "power2.out" });
  for (let k = 0; k < 16; k++) {
    const p = document.createElement("div"); p.className = "puff"; wrap.appendChild(p);
    const ang = (k / 16) * Math.PI * 2 + Math.random() * 0.6, dist = 55 + Math.random() * 95, sz = 24 + Math.random() * 40;
    p.style.width = p.style.height = sz + "px";
    gsap.set(p, { x: 0, y: 0, scale: 0.3, opacity: 0.95 });
    gsap.to(p, { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - 8, scale: 1.3 + Math.random(), opacity: 0, rotation: Math.random() * 160 - 80, duration: 0.6 + Math.random() * 0.35, ease: "power2.out" });
  }
  gsap.delayedCall(1.1, () => wrap.remove());
}

export default function Projects() {
  const [cat, setCat] = useState("Todos");
  const [sel, setSel] = useState<number | null>(null);
  const [allCaps, setAllCaps] = useState(false);
  const [allLab, setAllLab] = useState(false);
  // la cápsula principal late como un radar hasta que el visitante la abre por primera vez
  const [seen, setSeen] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem("rn_caps") || "[]"); } catch { return []; } });
  const filtered = PROJECTS.filter((p) => cat === "Todos" || p.cat === cat);
  const list = allCaps ? filtered : filtered.slice(0, 10);

  useEffect(() => {
    if (sel === null) fadeOutSfx("capsule");        // al cerrar el proyecto el tema se apaga con un fundido
    document.body.classList.toggle("lock", sel !== null);
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setSel(null); };
    window.addEventListener("keydown", esc);
    return () => { document.body.classList.remove("lock"); window.removeEventListener("keydown", esc); };
  }, [sel]);

  const open = (gi: number, e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    capsuleBurst(r.left + r.width / 2, r.top + r.height / 2, PROJECTS[gi].cap);
    sfx("capsule");        // tema de Vegeta al abrir una cápsula
    if (!seen.includes(gi)) { const n = [...seen, gi]; setSeen(n); try { localStorage.setItem("rn_caps", JSON.stringify(n)); } catch { /* sin almacenamiento */ } }
    el.style.transition = "transform .18s"; el.style.transform = "scale(.35) translateY(8px)";
    setTimeout(() => { el.style.transform = ""; setSel(gi); }, 300);
  };

  const p = sel !== null ? PROJECTS[sel] : null;
  const drag = useDragControls();
  const sheet = typeof window !== "undefined" && window.matchMedia("(max-width:760px)").matches;   // en móvil el proyecto se abre como hoja inferior

  return (
    <section id="sagas" className="sec">
      <div className="wrap">
        <Splash scene="/assets/scenes/battle.jpg" sfx="¡POOF!" tag="Sagas · Estuche de cápsulas Hoi-Poi" title="Mis batallas, *encapsuladas.*">
          <p>Proyectos propios, prototipos y productos lanzados donde muestro research, arquitectura, UI, automatización y criterio de negocio. Haz clic en una cápsula para abrir su holograma.</p>
        </Splash>

        <Reveal>
          <div className="cap-filters">
            {PROJECT_CATS.map((c) => (
              <button key={c} className={c === cat ? "on" : ""} data-cursor onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        </Reveal>

        <div className="cap-grid">
          {list.map((pr, i) => {
            const gi = PROJECTS.indexOf(pr);
            return (
              <Reveal key={pr.name} delay={(i % 6) * 0.05}>
                <button className={"capsule" + (pr.star && !seen.includes(gi) ? " hot" : "")} style={{ ["--cap" as any]: pr.cap }} data-cursor
                  aria-label={`Cápsula ${String(gi + 1).padStart(2, "0")}: ${pr.name}. Abrir proyecto`}
                  onClick={(e) => open(gi, e)}>
                  <img src={`/assets/caps/cap${String(gi + 1).padStart(2, "0")}.webp`} alt="" draggable={false} />
                  {pr.star && <span className="star" title="Proyecto destacado">★</span>}
                  <span className="nm"><b>{String(gi + 1).padStart(2, "0")}</b> {pr.name}</span>
                </button>
              </Reveal>
            );
          })}
        </div>
        <More open={allCaps} onToggle={() => setAllCaps((v) => !v)} more={filtered.length - 10} label="Ver todas las cápsulas" />
        <div className="cap-hint"><span className="cc-logo" style={{ width: 18, height: 18 }} /> *POOF* — cada cápsula guarda un proyecto real.</div>

        <Splash scene="/assets/scenes/office.webp" sfx="¡BZZT!" tag="Laboratorio de Capsule Corp" title="Webs y experimentos *en vivo.*" side="right" compact className="lab-head">
          <p>Además de los casos, mantengo un laboratorio de webs y herramientas reales para validar UX, IA aplicada, automatización, SEO y medición.</p>
        </Splash>
        <ul className="lab-grid">
          {(allLab ? LAB : LAB.slice(0, 4)).map((l, i) => (
            <li key={l.name}>
              <Reveal delay={(i % 4) * 0.06} style={{ height: "100%" }}>
                <a className="lab-card" data-cursor href={l.url} target="_blank" rel="noopener">
                  <span className="lab-img"><img src={`/assets/proj/${l.img}.webp`} alt={`Vista previa de ${l.name}`} loading="lazy" /></span>
                  <span className="lab-tag">{l.tag}</span>
                  <b>{l.name}</b>
                  <span className="lab-desc">{l.desc}</span>
                  <span className="lab-go">Visitar ↗</span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
        <More open={allLab} onToggle={() => setAllLab((v) => !v)} more={LAB.length - 4} label="Ver todo el laboratorio" />
      </div>

      {/* el modal va en <body>: dentro de la sección (isolation) quedaba por debajo de la barra superior y del dock */}
      {createPortal(
        <AnimatePresence>
          {p && (
            <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} onClick={(e) => { if (e.target === e.currentTarget) setSel(null); }}>
              <motion.div className="pmodal" role="dialog" aria-modal="true" aria-labelledby="pm-title"
                style={{ ["--cap" as any]: p.cap, ["--capsoft" as any]: hexA(p.cap, 0.18) }}
                {...(sheet
                  ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: { type: "spring", duration: 0.5, bounce: 0.12 },
                      drag: "y" as const, dragListener: false, dragControls: drag, dragConstraints: { top: 0, bottom: 0 }, dragElastic: { top: 0, bottom: 0.6 },
                      onDragEnd: (_: unknown, i: { offset: { y: number }; velocity: { y: number } }) => { if (i.offset.y > 110 || i.velocity.y > 600) setSel(null); } }
                  : { initial: { opacity: 0, transform: "translateY(16px) scale(0.94)" }, animate: { opacity: 1, transform: "translateY(0px) scale(1)" },
                      exit: { opacity: 0, transform: "translateY(8px) scale(0.97)" }, transition: { type: "spring", duration: 0.45, bounce: 0.15 } })}>
                <button className="pm-grab" aria-hidden tabIndex={-1} onPointerDown={(e) => drag.start(e)}><i /></button>
                <button className="close" data-cursor onClick={() => setSel(null)} aria-label="Cerrar">✕</button>
                <div className="pm-media" onPointerDown={(e) => { if (sheet) drag.start(e); }}>
                  <img src={`/assets/proj/${p.img}.webp`} alt={`${p.name} — imagen del proyecto`} />
                  <img className="pm-cap" src={`/assets/caps/cap${String(sel! + 1).padStart(2, "0")}.webp`} alt="" />
                  <span className="pm-no">Nº{String(sel! + 1).padStart(2, "0")}</span>
                </div>
                <div className="pm-body">
                  <div className="pm-scroll">
                    <div className="pm-tag">{p.tag} · {p.year}</div>
                    <h3 id="pm-title">{p.name}</h3>
                    <p className="pm-sub">{p.title}</p>
                    <p className="pm-desc">{p.desc}</p>
                    <dl className="pm-meta">
                      <div><dt>Mi papel</dt><dd>{p.role}</dd></div>
                      <div><dt>Categoría</dt><dd>{p.cat}</dd></div>
                    </dl>
                    <div className="pm-chips">{p.tech.map((t) => <i key={t}>{t}</i>)}</div>
                  </div>
                  <div className="pm-cta">
                    <a className="btn solid" data-cursor href={p.caseUrl} target="_blank" rel="noopener">Ver caso completo ↗</a>
                    {p.live && <a className="btn gold" data-cursor href={p.live} target="_blank" rel="noopener">{p.liveLabel ?? "Ver en vivo"} ↗</a>}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}
