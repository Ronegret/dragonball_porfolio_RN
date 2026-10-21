import { useEffect, useRef } from "react";

/** Universo animado de fondo: estrellas a tres profundidades, estrellas fugaces, galaxias de otros
 *  universos, el planeta Namek con sus tres soles, la nave espacial de Goku y la nave de Freezer.
 *  Todo con animaciones CSS de transform/opacity (van en el compositor, sin coste en el hilo principal). */
export default function SpaceBackground() {
  const ref = useRef<HTMLDivElement>(null);

  // parallax de las estrellas con el scroll; el módulo del alto de la tesela hace el bucle infinito
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const layers = [...ref.current!.querySelectorAll<HTMLElement>("[data-depth]")];
    let raf = 0;
    const paint = () => {
      raf = 0;
      const y = window.scrollY;
      layers.forEach((l) => { l.style.transform = `translate3d(0,${-((y * Number(l.dataset.depth)) % 420)}px,0)`; });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(paint); };
    window.addEventListener("scroll", on, { passive: true });
    paint();
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="bg-layer space" ref={ref} aria-hidden>
      {[["s1", 0.03], ["s2", 0.07], ["s3", 0.13]].map(([c, d]) => (
        <div key={c} className={"sp-par " + c} data-depth={d}><div className="sp-stars" /></div>
      ))}

      <span className="shoot sh1" /><span className="shoot sh2" /><span className="shoot sh3" />

      <div className="galaxy g1"><i /></div>
      <div className="galaxy g2"><i /></div>
      <div className="galaxy g3"><i /></div>

      <div className="namek-sys">
        <span className="sun su1" /><span className="sun su2" /><span className="sun su3" />
        <div className="namek"><div className="namek-map" /><div className="namek-clouds" /></div>
      </div>

      {/* nave espacial de Goku: cruza el cielo con estela de fuego */}
      <div className="pod-fly">
        <span className="pod-trail" />
        <svg className="pod" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="podg" cx="35%" cy="30%"><stop offset="0" stopColor="#fff" /><stop offset=".6" stopColor="#cfd6e6" /><stop offset="1" stopColor="#6f7891" /></radialGradient>
            <radialGradient id="podw" cx="40%" cy="35%"><stop offset="0" stopColor="#ffb3b3" /><stop offset=".5" stopColor="#e0383b" /><stop offset="1" stopColor="#5e0b12" /></radialGradient>
          </defs>
          <circle cx="50" cy="50" r="40" fill="url(#podg)" stroke="#000" strokeWidth="3" />
          <path d="M14 58 Q50 80 86 58" fill="none" stroke="#56607a" strokeWidth="3" />
          <circle cx="57" cy="43" r="18" fill="url(#podw)" stroke="#262b36" strokeWidth="5" />
          <ellipse cx="38" cy="28" rx="11" ry="6" fill="#fff" opacity=".75" />
        </svg>
      </div>

      {/* nave de Freezer: pasa lenta y lejana, con las luces parpadeando */}
      <div className="ship-fly">
        <svg className="ship" viewBox="0 0 200 124">
          <defs>
            <radialGradient id="shipg" cx="45%" cy="25%"><stop offset="0" stopColor="#fbf8ff" /><stop offset=".6" stopColor="#c9c0dc" /><stop offset="1" stopColor="#6c5f88" /></radialGradient>
            <linearGradient id="domeg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3eefc" /><stop offset="1" stopColor="#a395c0" /></linearGradient>
          </defs>
          <path d="M62 96 L50 118 M138 96 L150 118 M100 100 L100 122" stroke="#3b3350" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="100" cy="68" rx="94" ry="34" fill="url(#shipg)" stroke="#000" strokeWidth="3" />
          <path d="M38 62 Q100 -8 162 62 Z" fill="url(#domeg)" stroke="#000" strokeWidth="3" />
          <g className="ship-lights" fill="#ffcf2e" stroke="#000" strokeWidth="1.5">
            {[24, 46, 68, 90, 112, 134, 156, 176].map((x) => <circle key={x} cx={x} cy={x < 40 || x > 165 ? 72 : 76} r="5.5" />)}
          </g>
        </svg>
      </div>
    </div>
  );
}
