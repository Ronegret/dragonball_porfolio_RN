import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { setMuted, playIntroMusic } from "../lib";
import TitleCard from "./TitleCard";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
// assets que deben estar listos antes de entrar
const PRELOAD = [
  "/assets/radar-device.png",
  ...[1, 2, 5, 3, 4, 6].map((i) => `/assets/forms/f${i}.webp`),
  ...[1, 2, 3, 4, 5, 6, 7].map((i) => `/assets/db/ball${i}.webp`),
];
// posición (% dentro de la pantalla del radar) de cada esfera detectada
const BLIPS = [[30, 34], [66, 26], [74, 58], [42, 70], [22, 56], [56, 44], [60, 78]];

export default function Loader() {
  const [show, setShow] = useState(() => { try { return !sessionStorage.getItem("rn_intro"); } catch { return true; } });
  const [p, setP] = useState(0);
  const [ready, setReady] = useState(false);   // radar completo -> cartela de título con intro musical
  const [launch, setLaunch] = useState(false);
  const reduce = useReducedMotion();
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!show) return;
    document.body.classList.add("lock");
    const stop = setTimeout(() => (window as any).lenis?.stop(), 0);
    let done = 0, alive = true;
    const t0 = performance.now(), MIN = reduce ? 400 : 2200;
    const finish = () => {
      if (!alive) return;
      alive = false; setP(1);
      try { sessionStorage.setItem("rn_intro", "1"); } catch {}
      setTimeout(() => setShow(false), reduce ? 0 : 450);
    };
    finishRef.current = finish;
    PRELOAD.forEach((src) => { const im = new Image(); im.onload = im.onerror = () => { done++; }; im.src = src; });
    const tick = () => {
      if (!alive) return;
      const timeP = Math.min(1, (performance.now() - t0) / MIN);
      setP(Math.min(done / PRELOAD.length, timeP));
      if (done >= PRELOAD.length && timeP >= 1) { setP(1); setReady(true); } else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const safety = setTimeout(() => setReady(true), 8000); // red lenta: no bloquear nunca la entrada
    return () => { alive = false; clearTimeout(stop); clearTimeout(safety); };
  }, [show, reduce]);

  useEffect(() => {
    if (!ready || launch) return;
    const auto = setTimeout(() => finishRef.current(), 14000);   // la cinematica dura ~5 s: si nadie pulsa, entra sola y en silencio
    return () => clearTimeout(auto);
  }, [ready, launch]);

  const start = () => {   // el clic es el gesto que desbloquea el audio: suena la intro y entramos
    setMuted(false); playIntroMusic(); setLaunch(true);
    setTimeout(() => finishRef.current(), reduce ? 200 : 1700);
  };
  const silent = () => { setMuted(true); finishRef.current(); };

  useEffect(() => {
    if (show) return;
    document.body.classList.remove("lock");
    (window as any).lenis?.start();
  }, [show]);

  const found = Math.min(7, Math.floor(p * 7 + 0.0001));

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="loader" role="status" aria-live="polite"
          exit={{ opacity: 0, transform: "scale(1.04)" }} transition={{ duration: 0.6, ease: EASE_OUT }}>
          {!ready ? (
            <>
              <div className="loader-radar">
                <img src="/assets/radar-device.png" alt="" />
                <div className="loader-scope" aria-hidden>
                  <span className="loader-sweep" />
                  {BLIPS.slice(0, found).map(([x, y], i) => (
                    <motion.i key={i} style={{ left: x + "%", top: y + "%" }}
                      initial={{ opacity: 0, transform: "translate(-50%,-50%) scale(0.6)" }}
                      animate={{ opacity: 1, transform: "translate(-50%,-50%) scale(1)" }}
                      transition={{ duration: 0.3, ease: EASE_OUT }} />
                  ))}
                </div>
              </div>
              <p className="loader-title">RADAR DEL DRAGÓN</p>
              <p className="loader-sub">{found < 7 ? `Rastreando esferas del dragón… ${found}/7` : "¡7 esferas localizadas!"}</p>
              <div className="loader-bar"><i style={{ transform: `scaleX(${p})` }} /></div>
              <button className="loader-skip" onClick={() => finishRef.current()}>Saltar intro</button>
            </>
          ) : (
            <TitleCard launch={launch} onStart={start} onSilent={silent} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
