import { useEffect, useRef } from "react";
import { motion, animate, useReducedMotion } from "framer-motion";
import { PROFILE, STATS } from "../data";
import { scrollToId } from "./Hud";
import Character3D from "./Character3D";
import { DBText } from "../lib";

/** "50+" -> cuenta de 0 a 50 y mantiene el sufijo */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const m = value.match(/^(\d+)(.*)$/);
    if (!m || reduce) return;
    const [, num, suf] = m;
    const c = animate(0, Number(num), { duration: 1.2, delay: 1, ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v) + suf; } });
    return () => c.stop();
  }, [value, reduce]);
  return <span ref={ref}>{reduce ? value : value.replace(/^\d+/, "0")}</span>;
}

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <motion.div className="hero-status"
            initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}>
            {PROFILE.status.map((s, i) => (
              <motion.span key={i} className={"chip" + (i === 0 ? " live" : "")}
                variants={{ h: { opacity: 0, y: 10 }, s: { opacity: 1, y: 0 } }}>{s}</motion.span>
            ))}
          </motion.div>

          <h1>
            {PROFILE.headline.map((line, i) => (
              <span className="ln" key={i}><DBText text={i === 2 ? `*${line}*` : line} /></span>
            ))}
          </h1>

          <motion.p className="hero-lead"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }}>
            <b>{PROFILE.kicker}.</b> {PROFILE.saga} Reúne las <b>7 esferas del dragón</b> escondidas en la web e invoca a Shen Long para pedirme tu deseo.
          </motion.p>

          <motion.div className="hero-cta"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.72, duration: 0.7 }}>
            <button className="btn solid" onClick={() => scrollToId("poderes")}>Ver mi evolución ↓</button>
            <button className="btn" onClick={() => scrollToId("sagas")}>Abrir mis cápsulas</button>
            <button className="btn gold" onClick={() => scrollToId("contacto", -110)}>✉ Contactar</button>
          </motion.div>

          <motion.div className="hero-stats"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }}>
            {STATS.map((s) => (
              <div className="st" key={s.l}><b><CountUp value={s.n} /></b><span>{s.l}</span></div>
            ))}
          </motion.div>
        </div>

        <div className="hero-art">
          <div className="hero-ring r2" />
          <div className="hero-ring r1" />
          <Character3D />
        </div>
      </div>
      <div className="scroll-hint">SCROLL<div className="tri" /></div>
    </section>
  );
}
