import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadLuckiest } from "@remotion/google-fonts/LuckiestGuy";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

// las fuentes bloquean el render hasta estar listas (sin parpadeos de tipografía)
export const { fontFamily: DB } = loadLuckiest();
export const { fontFamily: INTER } = loadInter("normal", { weights: ["500", "700"], subsets: ["latin"] });

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const OUT = Easing.bezier(0.23, 1, 0.32, 1);          // el mismo ease-out que usa la web
export const ramp = (frame: number, a: number, b: number, from = 0, to = 1, easing = OUT) =>
  interpolate(frame, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** Letra del logotipo: capa trasera (contorno + extrusión) y capa delantera con degradado dorado */
export const Letter: React.FC<{ ch: string; size: number }> = ({ ch, size }) => (
  <span style={{ display: "inline-grid", fontFamily: DB, fontSize: size, lineHeight: 1.05 }}>
    <span style={{ gridArea: "1/1", color: "#000", WebkitTextStroke: `${size * 0.2}px #000`, textShadow: `0 ${size * 0.09}px 0 #b32400, 0 ${size * 0.17}px 0 #120400, 0 ${size * 0.24}px ${size * 0.3}px rgba(0,0,0,.55)` }}>{ch}</span>
    <span style={{ gridArea: "1/1", background: "linear-gradient(180deg,#fff8b4 0%,#ffd23a 44%,#ff8a1a 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{ch}</span>
  </span>
);

/** Palabra que cae letra a letra con rebote. settled = todas las letras ya en su sitio (imagen fija) */
export const Word: React.FC<{ text: string; size: number; start?: number; arch?: boolean; settled?: boolean }> = ({ text, size, start = 0, arch = false, settled = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = (text.length - 1) / 2;
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: size * 0.025 }}>
      {[...text].map((ch, i) => {
        const f = settled ? 999 : frame - start - i * 2.2;
        const p = spring({ frame: f, fps, config: { damping: 9, stiffness: 140, mass: 0.7 } });
        const y = interpolate(p, [0, 1], [-size * 2.4, 0]), sc = interpolate(p, [0, 1], [2.8, 1]), rot = interpolate(p, [0, 1], [(i % 2 ? 1 : -1) * 24, 0]);
        const op = settled ? 1 : ramp(f, 0, 3);
        const d = i - c;
        return (
          <span key={i} style={{ display: "inline-block", transform: `translateY(${arch ? (d * d - c * c) * size * 0.03 : 0}px) rotate(${arch ? d * 4.6 : 0}deg)` }}>
            <span style={{ display: "inline-block", opacity: op, transform: `translateY(${y}px) scale(${sc}) rotate(${rot}deg)` }}>
              <Letter ch={ch} size={size} />
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Rayos dorados que giran detrás del título */
export const Rays: React.FC<{ opacity?: number; cx?: string; cy?: string }> = ({ opacity = 1, cx = "50%", cy = "46%" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: cx, top: cy, width: "170vmax", height: "170vmax", marginLeft: "-85vmax", marginTop: "-85vmax", transform: `rotate(${frame * 0.4}deg)`,
        background: "repeating-conic-gradient(from 0deg, rgba(255,206,70,.26) 0 4deg, transparent 4deg 12deg)",
        WebkitMaskImage: "radial-gradient(closest-side, #000 6%, transparent 52%)", maskImage: "radial-gradient(closest-side, #000 6%, transparent 52%)" }} />
    </AbsoluteFill>
  );
};

/** Fondo: nebulosa con deriva lenta y velo oscuro */
export const Nebula: React.FC<{ veil?: number }> = ({ veil = 0.35 }) => {
  const frame = useCurrentFrame();
  const s = 1.05 + frame * 0.0006;
  return (
    <AbsoluteFill style={{ background: "#07050f" }}>
      <Img src={staticFile("nebula.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${s})` }} />
      <AbsoluteFill style={{ background: `rgba(7,5,15,${veil})` }} />
    </AbsoluteFill>
  );
};

/** Cartela amarilla de cómic */
export const Caption: React.FC<{ children: React.ReactNode; rotate?: number; style?: React.CSSProperties }> = ({ children, rotate = -2, style }) => (
  <div style={{ background: "#ffcf2e", color: "#0a0a0a", border: "6px solid #000", boxShadow: "12px 12px 0 #000", padding: "22px 34px", transform: `rotate(${rotate}deg)`, ...style }}>{children}</div>
);

/** Título blanco con contorno negro y sombra roja dura */
export const Inked: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({ children, size, color = "#fff", style }) => (
  <div style={{ fontFamily: DB, fontSize: size, lineHeight: 1.04, color, WebkitTextStroke: `${size * 0.05}px #000`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.07}px 0 #c4122f, 0 ${size * 0.12}px 0 #000`, textAlign: "center", ...style }}>{children}</div>
);

/** Destello blanco de cambio de viñeta */
export const PanelFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 2, 9], [0.95, 0.95, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 46%, #fff 0, #fff6c4 40%, rgba(255,200,70,.7) 100%)", opacity: op, pointerEvents: "none" }} />;
};
