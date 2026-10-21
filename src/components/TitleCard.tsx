import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "framer-motion";
import { preloadSfx } from "../lib";

/** Cartela de título de la intro, estilo apertura de anime: la bola del dragón se enciende con latidos,
 *  estalla en un destello con ondas de choque y chispas, y las letras del nombre caen una a una.
 *  Línea de tiempo GSAP (determinista, como un compositor de frames). */

function Word({ text, arch }: { text: string; arch: boolean }) {
  const c = (text.length - 1) / 2;
  return (
    <span className={"tcw " + (arch ? "tcw-a" : "tcw-b")} aria-hidden>
      {[...text].map((ch, i) => {
        const d = i - c;
        // la palabra de arriba dibuja un arco (como el logo de la serie); la de abajo va recta
        const y = arch ? (d * d - c * c) * 0.03 : 0, r = arch ? d * 4.6 : 0;
        return (
          <span key={i} className="tcl" style={{ transform: `translateY(${y}em) rotate(${r}deg)` }}>
            <span className="tcl-in"><i className="b">{ch}</i><i className="f">{ch}</i></span>
          </span>
        );
      })}
    </span>
  );
}

const SPARKS = Array.from({ length: 26 }, (_, i) => i);

export default function TitleCard({ launch, onStart, onSilent }: { launch: boolean; onStart: () => void; onSilent: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => { preloadSfx("intro"); }, []);   // la música se descarga mientras suena la animación

  useLayoutEffect(() => {
    if (reduce) return;
    let cancelled = false;
    // sin la fuente cargada las letras saltarían de tipografía a mitad de la animación
    const fonts = (document as any).fonts;
    const ready = fonts?.load ? Promise.race([fonts.load('100px "Luckiest Guy"'), new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
    ready.then(() => {
      if (cancelled || !root.current) return;
      ctxRef.current = gsap.context(() => {
        const q = gsap.utils.selector(root.current!);
        const tl = gsap.timeline();
        gsap.set(q(".tc-spark"), { opacity: 0 });

        tl.fromTo(q(".tc-bg"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0)
          // 1) la bola aparece pequeña y se enciende con dos latidos de luz
          .fromTo(q(".tc-ball"), { scale: 0, opacity: 0, y: 50 }, { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.7)" }, 0.2)
          .fromTo(q(".tc-halo"), { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 0.8, duration: 0.7, ease: "power2.out" }, 0.25)
          .to(q(".tc-ball"), { scale: 1.15, duration: 0.16, yoyo: true, repeat: 1, ease: "power2.out" }, 1)
          .to(q(".tc-halo"), { scale: 1.55, opacity: 1, duration: 0.16, yoyo: true, repeat: 1 }, 1)
          .to(q(".tc-ball img"), { filter: "brightness(2.2) saturate(1.3)", duration: 0.16, yoyo: true, repeat: 1 }, 1)
          .to(q(".tc-ball"), { scale: 1.28, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }, 1.32)
          .to(q(".tc-halo"), { scale: 2.1, opacity: 1, duration: 0.2, yoyo: true, repeat: 1 }, 1.32)
          .to(q(".tc-ball img"), { filter: "brightness(3.2) saturate(1.4)", duration: 0.2, yoyo: true, repeat: 1 }, 1.32)
          // 2) estallido: destello, ondas de choque, rayos, chispas y sacudida de pantalla
          .addLabel("boom", 1.85)
          .to(q(".tc-flash"), { opacity: 1, duration: 0.07 }, "boom")
          .to(q(".tc-flash"), { opacity: 0, duration: 0.6, ease: "power2.out" }, "boom+=0.07")
          .fromTo(q(".tc-ring"), { scale: 0.15, opacity: 1 }, { scale: 5, opacity: 0, duration: 1.2, stagger: 0.14, ease: "power2.out" }, "boom")
          .fromTo(q(".tc-rays"), { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "power3.out" }, "boom")
          .fromTo(q(".tc-stage-in"), { x: 0, y: 0 }, { x: () => gsap.utils.random(-7, 7), y: () => gsap.utils.random(-7, 7), duration: 0.045, repeat: 7, yoyo: true, ease: "none" }, "boom")
          .set(q(".tc-stage-in"), { x: 0, y: 0 }, "boom+=0.4")
          .fromTo(q(".tc-spark"), { x: 0, y: 0, opacity: 1, scale: () => gsap.utils.random(0.6, 1.6) },
            { x: () => gsap.utils.random(-340, 340), y: () => gsap.utils.random(-280, 280), opacity: 0, duration: () => gsap.utils.random(0.8, 1.5), ease: "power3.out", stagger: 0.008 }, "boom")
          // 3) el nombre cae letra a letra con rebote; la segunda palabra entra desde los lados
          .fromTo(q(".tcw-a .tcl-in"), { yPercent: -170, scale: 2.8, rotate: () => gsap.utils.random(-28, 28), opacity: 0 },
            { yPercent: 0, scale: 1, rotate: 0, opacity: 1, duration: 0.55, ease: "back.out(2.2)", stagger: 0.075 }, "boom+=0.08")
          .fromTo(q(".tcw-b .tcl-in"), { xPercent: (i: number) => (i % 2 ? 150 : -150), scale: 1.7, opacity: 0 },
            { xPercent: 0, scale: 1, opacity: 1, duration: 0.5, ease: "power4.out", stagger: 0.06 }, "boom+=0.55")
          .fromTo(q(".tc-saga"), { opacity: 0, y: -26, rotate: -14, scale: 1.4 }, { opacity: 1, y: 0, rotate: -2, scale: 1, duration: 0.55, ease: "back.out(2)" }, "boom+=0.95")
          // 4) brillo que recorre las letras y subtítulo
          .fromTo(q(".tcl-in .f"), { backgroundPosition: "160% 0, 0 0" }, { backgroundPosition: "-60% 0, 0 0", duration: 1, ease: "power2.inOut", stagger: 0.04 }, "boom+=1.15")
          .fromTo(q(".tc-sub"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, "boom+=1.4")
          .fromTo(q(".tc-actions > *"), { opacity: 0, y: 18, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.8)", stagger: 0.1 }, "boom+=1.7");

        // 5) en reposo: la bola flota y respira, el brillo vuelve a pasar cada pocos segundos
        gsap.to(q(".tc-ball"), { y: -9, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3.6 });
        gsap.to(q(".tc-halo"), { opacity: 0.55, scale: 1.12, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3.6 });
        gsap.timeline({ repeat: -1, repeatDelay: 3.2, delay: 5.2 })
          .fromTo(q(".tcl-in .f"), { backgroundPosition: "160% 0, 0 0" }, { backgroundPosition: "-60% 0, 0 0", duration: 0.9, ease: "power2.inOut", stagger: 0.04 });
      }, root);
    });
    return () => { cancelled = true; ctxRef.current?.revert(); };
  }, [reduce]);

  // al pulsar "Comenzar": segundo destello y el logo se lanza hacia la cámara
  useEffect(() => {
    if (!launch || reduce || !root.current) return;
    const q = gsap.utils.selector(root.current);
    const tl = gsap.timeline();
    tl.to(q(".tc-name"), { scale: 1.35, duration: 0.55, ease: "power2.in" }, 0)
      .to(q(".tc-rays"), { scale: 1.8, rotate: "+=25", duration: 0.55, ease: "power2.in" }, 0)
      .to(q(".tc-sub,.tc-actions,.tc-saga"), { opacity: 0, duration: 0.2 }, 0)
      .to(q(".tc-flash"), { opacity: 1, duration: 0.3, ease: "power2.in" }, 0.25);
    return () => { tl.kill(); };
  }, [launch, reduce]);

  return (
    <div ref={root} className={"tc-stage" + (reduce ? " static" : "")}>
      <div className="tc-bg" aria-hidden />
      <div className="tc-rays" aria-hidden />
      <div className="tc-stage-in">
        <span className="tc-saga">Saga del diseño de producto · Episodio 1</span>
        <h1 className="tc-name" aria-label="Rodrigo Negrete">
          <Word text="RODRIGO" arch />
          <span className="tc-ball" aria-hidden>
            <span className="tc-halo" />
            <img src="/assets/db/ball4.webp" alt="" />
          </span>
          <Word text="NEGRETE" arch={false} />
        </h1>
        <p className="tc-sub">AI Product Designer · UX/UI · Automatización con IA</p>
        <div className="tc-actions">
          <button className="btn gold tc-start" onClick={onStart} autoFocus>▶ Comenzar la aventura</button>
          <button className="loader-skip" onClick={onSilent}>Entrar sin sonido</button>
        </div>
      </div>
      <span className="tc-ring" aria-hidden /><span className="tc-ring r2" aria-hidden />
      {SPARKS.map((i) => <span key={i} className="tc-spark" aria-hidden />)}
      <div className="tc-flash" aria-hidden />
    </div>
  );
}
