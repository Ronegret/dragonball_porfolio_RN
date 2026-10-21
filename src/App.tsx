import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { BallsProvider, useBalls } from "./lib";
import { CONTACT } from "./data";
import CursorAvatar from "./components/CursorAvatar";
import Hud, { scrollToId } from "./components/Hud";
import Hero from "./components/Hero";
import Profile from "./components/Profile";
import Transformations from "./components/Transformations";
import Stack from "./components/Stack";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import References from "./components/References";
import Shenron from "./components/Shenron";
import DragonBalls from "./components/DragonBalls";
import Loader from "./components/Loader";

gsap.registerPlugin(ScrollTrigger);

function Footer() {
  const { reset } = useBalls();
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: ".16em", color: "var(--mut)", marginBottom: 12 }}>CONTACTO DIRECTO</div>
            <a href={`mailto:${CONTACT.email}`} style={{ display: "block", fontSize: 15, marginBottom: 6 }}>{CONTACT.email}</a>
            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener" style={{ display: "block", fontSize: 15, color: "var(--mut)" }}>{CONTACT.phone}</a>
          </div>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: ".16em", color: "var(--mut)", marginBottom: 12 }}>NAVEGACIÓN</div>
            {[["perfil", "Perfil"], ["poderes", "Poderes"], ["sagas", "Sagas"], ["trayectoria", "Trayectoria"], ["shenron", "Invocar"]].map(([id, l]) => (
              <a key={id} href={"#" + id} onClick={(e) => { e.preventDefault(); scrollToId(id); }} style={{ display: "block", fontSize: 14, color: "var(--mut)", marginBottom: 5, cursor: "pointer" }}>{l}</a>
            ))}
          </div>
        </div>
        <div className="continua" aria-hidden>
          <span>CONTINUARÁ…</span>
          <small>En el próximo capítulo: tu proyecto y mi próxima transformación.</small>
        </div>
        <div className="foot-name">RODRIGO NEGRETE</div>
        <div className="meta">
          <span>© 2026 Rodrigo Negrete Aros · Capsule Corp Dev Lab · Barcelona</span>
          <span><button type="button" className="foot-reset" onClick={reset} data-cursor>⟲ Reiniciar búsqueda de esferas</button></span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    (window as any).lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(raf); lenis.destroy(); delete (window as any).lenis; };
  }, []);

  return (
    <BallsProvider>
      <Loader />
      <div className="bg-layer bg-tint" />
      <div className="bg-layer bg-grid" />
      <CursorAvatar />
      <Hud />
      <main>
        <Hero />
        <Profile />
        <Transformations />
        <Stack />
        <Projects />
        <Experience />
        <References />
        <Shenron />
      </main>
      <Footer />
      <DragonBalls />
    </BallsProvider>
  );
}
