import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TRANSFORMATIONS } from "../data";

gsap.registerPlugin(ScrollTrigger);
const FRAMES = 192;

/** Canvas fijo de la evolución, DETRÁS del contenido. Sube de nivel con el scroll
 *  de la sección "Poderes" y sincroniza aura + fase con las transformaciones. */
export default function EvolutionBackground() {
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = cv.current!;
    const ctx = canvas.getContext("2d")!;
    const frames: HTMLImageElement[] = [];
    let cw = 0, ch = 0, dpr = 1, cur = -1;

    // los 6 MB de fotogramas se piden solo cuando "Poderes" está cerca, para no competir con el hero
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      for (let i = 1; i <= FRAMES; i++) {
        const im = new Image();
        im.src = `/assets/frames/f${String(i).padStart(4, "0")}.jpg`;
        im.onload = () => { if ((cur < 0 ? 0 : cur) === i - 1) draw(i - 1, true); };   // pinta el fotograma pedido en cuanto llega
        frames.push(im);
      }
    }, { rootMargin: "1500px 0px" });
    io.observe(canvas);
    function size() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = r.width; ch = r.height;
      canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(cur < 0 ? 0 : cur, true);
    }
    function draw(idx: number, force = false) {
      idx = Math.max(0, Math.min(FRAMES - 1, idx));
      const im = frames[idx];
      if (!im || !im.naturalWidth) { cur = idx; return; }
      if (idx === cur && !force) return;
      cur = idx;
      const s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
      const dw = im.naturalWidth * s, dh = im.naturalHeight * s;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(im, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }
    window.addEventListener("resize", size);
    size();

    let curPhase = -1;
    const setPhase = (p: number) => {
      let i = 0;
      for (let k = 0; k < TRANSFORMATIONS.length; k++) if (p >= TRANSFORMATIONS[k].at) i = k;
      if (i === curPhase) return;
      curPhase = i;
      const t = TRANSFORMATIONS[i];
      document.documentElement.style.setProperty("--aura", t.aura);
      document.documentElement.style.setProperty("--aura-soft", t.soft);
      window.dispatchEvent(new CustomEvent("evo-phase", { detail: i }));
    };

    const st = ScrollTrigger.create({
      trigger: ".evo-track", start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: (self) => { draw(Math.round(self.progress * (FRAMES - 1))); setPhase(self.progress); },
    });
    setPhase(0);
    const rf = setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => { io.disconnect(); window.removeEventListener("resize", size); clearTimeout(rf); st.kill(); };
  }, []);

  return (
    <>
      <canvas ref={cv} className="evo-canvas" aria-label="Vídeo de mi evolución: de forma base a Super Saiyan 4" role="img" />
      <div className="evo-aura" />
    </>
  );
}
