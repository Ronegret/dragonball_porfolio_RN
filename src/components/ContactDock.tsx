import { useEffect, useState } from "react";
import { CONTACT } from "../data";
import { scrollToId } from "./Hud";

/** Dock inferior para móvil/tablet: el contacto siempre a un toque. Se oculta en el hero (ya tiene sus botones)
 *  y cuando las opciones de contacto del footer ya están a la vista. */
export default function ContactDock() {
  const [seen, setSeen] = useState<string[]>(["inicio"]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      setSeen((v) => (e.isIntersecting ? (v.includes(e.target.id) ? v : [...v, e.target.id]) : v.filter((x) => x !== e.target.id)));
    }), { threshold: 0.05 });
    ["inicio", "hero", "contacto"].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  const show = seen.length === 0;
  return (
    <div className={"cdock" + (show ? " on" : "")} role="region" aria-label="Acciones de contacto" aria-hidden={!show}>
      <button className="btn solid cd-main" tabIndex={show ? 0 : -1} onClick={() => scrollToId("contacto", -110)}>✉ Contactar</button>
      <a className="btn cd-wa" tabIndex={show ? 0 : -1} aria-label="Escribir por WhatsApp" target="_blank" rel="noopener"
        href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.waText)}`}>WhatsApp</a>
      <a className="btn cd-cv" tabIndex={show ? 0 : -1} target="_blank" rel="noopener" href={CONTACT.cv}>CV</a>
    </div>
  );
}
