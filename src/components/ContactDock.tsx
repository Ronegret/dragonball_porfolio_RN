import { useEffect, useState } from "react";
import { CONTACT } from "../data";
import { scrollToId } from "./Hud";
import { sfx } from "../lib";

/** Dock inferior para móvil/tablet: el contacto siempre a un toque. Se oculta en el hero (ya tiene sus botones)
 *  y cuando las opciones de contacto del footer ya están a la vista. */
export default function ContactDock() {
  const [vis, setVis] = useState({ hero: true, contact: false });
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const key = e.target.id === "hero" ? "hero" : "contact";
      setVis((v) => (v[key] === e.isIntersecting ? v : { ...v, [key]: e.isIntersecting }));
    }), { threshold: 0.05 });
    ["hero", "contacto"].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  const show = !vis.hero && !vis.contact;
  return (
    <div className={"cdock" + (show ? " on" : "")} role="region" aria-label="Acciones de contacto" aria-hidden={!show}>
      <button className="btn solid cd-main" tabIndex={show ? 0 : -1} onClick={() => { sfx("teleport"); scrollToId("contacto", -110); }}>✉ Contactar</button>
      <a className="btn cd-wa" tabIndex={show ? 0 : -1} aria-label="Escribir por WhatsApp" target="_blank" rel="noopener"
        href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.waText)}`}>WhatsApp</a>
      <a className="btn cd-cv" tabIndex={show ? 0 : -1} target="_blank" rel="noopener" href={CONTACT.cv}>CV</a>
    </div>
  );
}
