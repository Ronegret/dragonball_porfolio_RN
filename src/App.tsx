import { useEffect } from "react";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { BallsProvider, primeAudio } from "./lib";
import CursorAvatar from "./components/CursorAvatar";
import Hud, { scrollToId } from "./components/Hud";
import Footer from "./components/Footer";
import ContactDock from "./components/ContactDock";
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
import SpaceBackground from "./components/SpaceBackground";
import Safe from "./components/Safe";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  // el contexto de audio bloquea ~0,3 s al crearse: se hace con la web ociosa (radar de carga), no en mitad de la cartela
  useEffect(() => { ((window as any).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 1200)))(primeAudio, { timeout: 2000 }); }, []);

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
    <MotionConfig reducedMotion="user">
    <BallsProvider>
      <Loader />
      <a className="skip-link" href="#perfil" onClick={(e) => { e.preventDefault(); scrollToId("perfil"); }}>Saltar al contenido</a>
      <div className="bg-layer bg-tint" />
      <Safe><SpaceBackground /></Safe>
      <Safe><CursorAvatar /></Safe>
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
      <ContactDock />
      <Safe><DragonBalls /></Safe>
    </BallsProvider>
    </MotionConfig>
  );
}
