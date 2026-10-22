import { useEffect, useState } from "react";
import { CONTACT } from "../data";
import { DBIcon } from "../lib";
import { scrollToId } from "./Hud";

/** Dock inferior para móvil/tablet: el contacto siempre a un toque. Se oculta en el hero (ya tiene sus botones)
 *  y cuando las opciones de contacto del footer ya están a la vista.
 *  Estilo Capsule Corp: placa oscura con aro dorado y tres botones con esfera del dragón e icono rojo. */
export default function ContactDock() {
  const [seen, setSeen] = useState<string[]>(["hero"]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      setSeen((v) => (e.isIntersecting ? (v.includes(e.target.id) ? v : [...v, e.target.id]) : v.filter((x) => x !== e.target.id)));
    }), { threshold: 0.05 });
    ["hero", "contacto"].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  const show = seen.length === 0;
  const ti = show ? 0 : -1;
  return (
    <div className={"cdock" + (show ? " on" : "")} role="region" aria-label="Acciones de contacto" aria-hidden={!show}>
      <button className="cd cd-main" tabIndex={ti} onClick={() => scrollToId("contacto", -110)}>
        <DBIcon name="mail" size={30} /><span>Contactar</span>
      </button>
      <a className="cd cd-wa" tabIndex={ti} aria-label="Escribir por WhatsApp" target="_blank" rel="noopener"
        href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.waText)}`}>
        <DBIcon name="chat" size={30} /><span>WhatsApp</span>
      </a>
      <a className="cd cd-cv" tabIndex={ti} aria-label="Ver el CV completo" target="_blank" rel="noopener" href={CONTACT.cv}>
        <DBIcon name="scroll" size={30} /><span>CV</span>
      </a>
    </div>
  );
}
