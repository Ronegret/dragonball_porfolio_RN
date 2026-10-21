import { motion } from "framer-motion";
import { PROFILE, STATS } from "../data";
import { scrollToId } from "./Hud";
import Character3D from "./Character3D";

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
              <span className="ln" key={i}>
                <motion.span style={{ display: "block" }} className={i === 2 ? "em" : ""}
                  initial={{ y: "115%" }} animate={{ y: 0 }}
                  transition={{ duration: 0.85, delay: 0.15 + i * 0.12, ease: [0.22, 0.61, 0.36, 1] }}>
                  {line}
                </motion.span>
              </span>
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
          </motion.div>

          <motion.div className="hero-stats"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }}>
            {STATS.map((s) => (
              <div className="st" key={s.l}><b>{s.n}</b><span>{s.l}</span></div>
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
