import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { Caption, DB, INTER, Inked, Nebula, PanelFlash, Rays, Word, clamp01, ramp } from "./ui";

/** Teaser vertical 1080x1920 @30 fps, 14 s: apertura con la bola del dragón, 4 viñetas y llamada a la acción */
export const TEASER_FRAMES = 420;
const S1 = 100, S2 = 80, S3 = 80, S4 = 80, S5 = 80;

/* ---------- 1) apertura: la bola se enciende, estalla y cae el nombre ---------- */
const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const BOOM = 46;
  const appear = spring({ frame: frame - 4, fps, config: { damping: 11, stiffness: 120 } });
  const beat = (f0: number, amp: number) => Math.sin(Math.PI * clamp01((frame - f0) / 9)) * amp;   // latido de luz
  const pulse = beat(22, 0.15) + beat(34, 0.28);
  const bright = 1 + beat(22, 0.9) + beat(34, 1.8);
  const flash = frame < BOOM ? 0 : ramp(frame, BOOM, BOOM + 14, 1, 0);
  const ring = (d: number) => ramp(frame, BOOM + d, BOOM + d + 34, 0.15, 5.2);
  const ringOp = (d: number) => ramp(frame, BOOM + d, BOOM + d + 34, 1, 0);
  const shake = frame >= BOOM && frame < BOOM + 9 ? Math.sin(frame * 9) * (BOOM + 9 - frame) * 1.6 : 0;
  return (
    <AbsoluteFill style={{ background: "#07050f" }}>
      <AbsoluteFill style={{ background: "radial-gradient(760px 640px at 50% 46%, rgba(255,150,40,.32), transparent 70%), radial-gradient(1300px 1000px at 50% 50%, rgba(120,60,220,.34), transparent 70%)" }} />
      <Rays opacity={ramp(frame, BOOM, BOOM + 30)} />
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${-shake * 0.7}px)` }}>
        {/* anillos de choque */}
        {[0, 5].map((d, k) => (
          <div key={k} style={{ position: "absolute", left: 540 - 130, top: 880 - 130, width: 260, height: 260, borderRadius: "50%", border: `7px solid ${k ? "rgba(160,220,255,.9)" : "rgba(255,236,150,.95)"}`, opacity: frame < BOOM ? 0 : ringOp(d), transform: `scale(${ring(d)})` }} />
        ))}
        {/* el logotipo: RODRIGO arriba, la bola en medio, NEGRETE abajo */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Word text="RODRIGO" size={196} start={BOOM + 2} arch />
          <div style={{ marginTop: 118 }}><Word text="NEGRETE" size={160} start={BOOM + 16} /></div>
        </div>
        <div style={{ position: "absolute", left: 540 - 125, top: 880 - 125 + (1 - appear) * 80 - 20, width: 250, height: 250, zIndex: 3, transform: `scale(${appear * (1 + pulse)})` }}>
          <div style={{ position: "absolute", inset: "-70%", borderRadius: "50%", opacity: ramp(frame, 8, 22) * (0.6 + pulse), background: "radial-gradient(circle, rgba(255,250,200,.95) 0, rgba(255,176,50,.7) 22%, rgba(255,120,20,.28) 42%, transparent 66%)" }} />
          <Img src={staticFile("ball4.webp")} style={{ width: "100%", height: "100%", position: "relative", filter: `brightness(${bright}) saturate(${1 + pulse})` }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", fontFamily: INTER, fontWeight: 700, fontSize: 40, letterSpacing: 3, color: "#e4d8ff", opacity: ramp(frame, BOOM + 40, BOOM + 54) }}>
          AI Product Designer · UX/UI · Automatización con IA
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 46%, #fff 0, #fff6c4 28%, rgba(255,200,70,.65) 58%, rgba(255,200,70,0) 85%)", opacity: flash }} />
    </AbsoluteFill>
  );
};

/* ---------- 2) Barcelona: Rodrigo cruzando el cielo ---------- */
const Barcelona: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cap = spring({ frame: frame - 14, fps, config: { damping: 12, stiffness: 130 } });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Img src={staticFile("barcelona.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${64 + frame * 0.05}% 40%`, transform: `scale(${1.14 + frame * 0.0016})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,5,15,.15) 40%, rgba(7,5,15,.92) 100%)" }} />
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 190, transform: `translateY(${(1 - cap) * 260}px)`, opacity: cap }}>
        <Caption rotate={-2}>
          <div style={{ fontFamily: DB, fontSize: 104, lineHeight: 1 }}>AI PRODUCT DESIGNER</div>
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 38, marginTop: 10 }}>Barcelona · Remoto UE · Full-time y freelance</div>
        </Caption>
      </div>
      <PanelFlash />
    </AbsoluteFill>
  );
};

/* ---------- 3) evolución: cámara de gravedad y cifras ---------- */
const Gravity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stats: [number, string, string][] = [[17, "+", "años de combate B2B"], [50, "+", "herramientas dominadas"], [11, "", "casos de estudio reales"]];
  return (
    <AbsoluteFill>
      <Nebula veil={0.25} />
      <Rays opacity={0.55} cy="40%" />
      <div style={{ position: "absolute", top: 120, left: 0, right: 0 }}><Inked size={118}>Mi evolución,<br />fase a fase</Inked></div>
      <Img src={staticFile("gravity.webp")} style={{ position: "absolute", left: -170, top: 470, width: 1420, transform: `scale(${1 + frame * 0.0012})`, opacity: ramp(frame, 4, 18) }} />
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 130, display: "flex", flexDirection: "column", gap: 22 }}>
        {stats.map(([n, suf, label], i) => {
          const p = spring({ frame: frame - 18 - i * 11, fps, config: { damping: 13, stiffness: 140 } });
          const v = Math.round(interpolate(frame, [20 + i * 11, 44 + i * 11], [0, n], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
          return (
            <Caption key={i} rotate={i % 2 ? 1.4 : -1.4} style={{ display: "flex", alignItems: "baseline", gap: 22, padding: "14px 30px", transform: `rotate(${i % 2 ? 1.4 : -1.4}deg) translateX(${(1 - p) * (i % 2 ? 700 : -700)}px)` }}>
              <span style={{ fontFamily: DB, fontSize: 96 }}>{v}{suf}</span>
              <span style={{ fontFamily: INTER, fontWeight: 700, fontSize: 38 }}>{label}</span>
            </Caption>
          );
        })}
      </div>
      <PanelFlash />
    </AbsoluteFill>
  );
};

/* ---------- 4) el equipo: Rodrigo con las IA y los guerreros Z ---------- */
const Team: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 90 } });
  const tools = ["Claude", "GPT", "Gemini", "Make", "n8n", "Figma"];
  return (
    <AbsoluteFill>
      <Nebula veil={0.3} />
      <div style={{ position: "absolute", top: 150, left: 0, right: 0 }}><Inked size={124}>Diseño con<br />IA y agentes</Inked></div>
      <Img src={staticFile("team.webp")} style={{ position: "absolute", left: -90, top: 640, width: 1260, transform: `translateX(${(1 - enter) * 900}px) scale(${1 + frame * 0.0009})`, filter: "drop-shadow(0 20px 40px rgba(0,0,0,.6))" }} />
      <div style={{ position: "absolute", left: 50, right: 50, bottom: 150, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18 }}>
        {tools.map((t, i) => {
          const p = spring({ frame: frame - 26 - i * 4, fps, config: { damping: 12, stiffness: 160 } });
          return <div key={t} style={{ fontFamily: INTER, fontWeight: 700, fontSize: 44, color: "#0a0a0a", background: "#49f08a", border: "5px solid #000", boxShadow: "8px 8px 0 #000", padding: "10px 28px", borderRadius: 999, transform: `scale(${p}) rotate(${(i % 2 ? 1 : -1) * 2}deg)` }}>{t}</div>;
        })}
      </div>
      <PanelFlash />
    </AbsoluteFill>
  );
};

/* ---------- 5) llamada a la acción: las 7 esferas orbitando ---------- */
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = spring({ frame: frame - 14, fps, config: { damping: 10, stiffness: 120 } });
  const url = spring({ frame: frame - 40, fps, config: { damping: 14, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ background: "#07050f" }}>
      <AbsoluteFill style={{ background: "radial-gradient(900px 700px at 50% 42%, rgba(255,150,40,.35), transparent 70%), radial-gradient(1300px 1000px at 50% 50%, rgba(120,60,220,.34), transparent 70%)" }} />
      <Rays opacity={0.9} cy="42%" />
      {[1, 2, 3, 4, 5, 6, 7].map((n, i) => {
        const a = (frame * 1.9 + i * (360 / 7)) * (Math.PI / 180), r = 380 * ramp(frame, 0, 26);
        return <Img key={n} src={staticFile(`ball${n}.webp`)} style={{ position: "absolute", width: 118, height: 118, left: 540 - 59 + Math.cos(a) * r, top: 800 - 59 + Math.sin(a) * r * 0.62, filter: "drop-shadow(0 0 22px rgba(255,170,40,.9))" }} />;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, transform: `scale(${title}) rotate(${(1 - title) * -8}deg)` }}>
        <Inked size={150} color="#ffcf2e">¿HABLAMOS?</Inked>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1230, display: "flex", flexDirection: "column", alignItems: "center", gap: 26, opacity: url, transform: `translateY(${(1 - url) * 80}px)` }}>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 46, color: "#e4d8ff", textAlign: "center" }}>Reúne las 7 esferas e invoca a Shen Long</div>
        <Caption rotate={-1.5} style={{ padding: "20px 40px" }}>
          <div style={{ fontFamily: DB, fontSize: 50 }}>db.rodrigonegrete.es</div>
        </Caption>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 40, color: "#ffcf2e" }}>Proyecto estrella: rodd.es</div>
      </div>
      <PanelFlash />
    </AbsoluteFill>
  );
};

export const Teaser: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={S1}><Opening /></Sequence>
      <Sequence from={S1} durationInFrames={S2}><Barcelona /></Sequence>
      <Sequence from={S1 + S2} durationInFrames={S3}><Gravity /></Sequence>
      <Sequence from={S1 + S2 + S3} durationInFrames={S4}><Team /></Sequence>
      <Sequence from={S1 + S2 + S3 + S4} durationInFrames={S5}><Cta /></Sequence>
      {/* música de apertura, con fundido final */}
      <Audio src={staticFile("intro.mp3")} volume={(f) => interpolate(f, [0, 12, TEASER_FRAMES - 2 * fps, TEASER_FRAMES], [0, 0.9, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
};
