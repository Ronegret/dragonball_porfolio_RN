import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { INTER, Nebula, Rays, Word, Inked } from "./ui";

/** Imagen para compartir el enlace (Open Graph / LinkedIn / WhatsApp): 1200x630 */
export const OG: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: INTER }}>
    <Nebula veil={0.2} />
    <AbsoluteFill style={{ background: "radial-gradient(700px 520px at 28% 52%, rgba(255,150,40,.28), transparent 70%), radial-gradient(900px 600px at 80% 50%, rgba(80,140,255,.28), transparent 70%)" }} />
    <Rays opacity={0.7} cx="27%" cy="48%" />

    {/* Rodrigo con el aura azul, saliendo por la derecha */}
    <Img src={staticFile("blue-suit.webp")} style={{ position: "absolute", right: 38, bottom: -26, height: 690, filter: "drop-shadow(0 0 40px rgba(70,150,255,.55))" }} />

    <div style={{ position: "absolute", left: 64, top: 52, background: "#c4122f", color: "#fff", border: "4px solid #000", boxShadow: "6px 6px 0 #000", padding: "8px 18px", fontWeight: 700, fontSize: 21, letterSpacing: 4, textTransform: "uppercase", transform: "rotate(-2deg)" }}>
      Saga del diseño de producto
    </div>

    <div style={{ position: "absolute", left: 28, top: 118, width: 740, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Word text="RODRIGO" size={150} arch settled />
      <div style={{ position: "relative", width: 740, height: 0 }}>
        <Img src={staticFile("ball4.webp")} style={{ position: "absolute", left: 322, top: -28, width: 100, height: 100, zIndex: 3 }} />
      </div>
      <div style={{ marginTop: 46 }}><Word text="NEGRETE" size={118} settled /></div>
    </div>

    <div style={{ position: "absolute", left: 70, bottom: 58, width: 640 }}>
      <Inked size={40} style={{ textAlign: "left" }}>AI Product Designer</Inked>
      <div style={{ marginTop: 12, fontSize: 23, fontWeight: 500, color: "#e8dcff" }}>UX/UI · Agentes IA · Automatización · Barcelona</div>
    </div>
  </AbsoluteFill>
);
