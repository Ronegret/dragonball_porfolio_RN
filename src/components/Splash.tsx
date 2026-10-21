import { ReactNode, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { Reveal, DBText } from "../lib";

gsap.registerPlugin(ScrollTrigger);

/** Cabecera de sección como viñeta de cómic: escena de fondo + personaje que "sale" del marco.
 *  Las dos capas se mueven a distinta velocidad con el scroll (parallax) para dar profundidad. */
export default function Splash({ scene, fig, figAlt = "", sfx, tag, title, pos = "right center", side, compact, className = "", children }: {
  scene: string; fig?: string; figAlt?: string; sfx: string; tag: string; title: string; pos?: string; side?: "right"; compact?: boolean; className?: string; children?: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = box.current;
    if (reduce || !el) return;
    const mk = (target: Element | null, from: number, to: number) => target
      ? gsap.fromTo(target, { yPercent: from }, { yPercent: to, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } })
      : null;
    const tweens = [mk(el.querySelector(".splash-bg img"), -4, 4), mk(el.querySelector(".splash-fig"), 5, -5)];
    return () => tweens.forEach((t) => { t?.scrollTrigger?.kill(); t?.kill(); });
  }, [reduce]);

  return (
    <Reveal>
      <div ref={box} className={"sec-head splash" + (fig ? " has-fig" : "") + (side ? " img-" + side : "") + (compact ? " compact" : "") + (className ? " " + className : "")} data-sfx={sfx}>
        <div className="splash-bg" aria-hidden>
          <img src={scene} alt="" loading="lazy" decoding="async" style={{ objectPosition: pos }} />
        </div>
        {fig && <img className="splash-fig" src={fig} alt={figAlt} loading="lazy" decoding="async" />}
        <div className="sec-tag">{tag}</div>
        <h2><DBText text={title} /></h2>
        {children}
      </div>
    </Reveal>
  );
}
