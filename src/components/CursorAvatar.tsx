import { useEffect, useRef } from "react";

/** Cursor: Radar del Dragón que sigue el ratón con inercia; se activa sobre elementos interactivos. */
export default function CursorAvatar() {
  const wrap = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  // estallido de ki al pulsar un elemento interactivo (ratón y táctil)
  useEffect(() => {
    const down = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.("a,button,.capsule,.dball,[data-cursor],summary,select,label");
      if (!el) return;
      const ki = getComputedStyle(el).getPropertyValue("--ki").trim() || "73,240,138";
      const b = document.createElement("span");
      b.className = "click-ki"; b.style.left = e.clientX + "px"; b.style.top = e.clientY + "px"; b.style.setProperty("--ki", ki);
      b.innerHTML = "<i></i><i></i>" + Array.from({ length: 10 }, (_, k) => `<em style="--r:${k * 36 + Math.random() * 14}deg"></em>`).join("");
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 700);
    };
    window.addEventListener("pointerdown", down);
    return () => window.removeEventListener("pointerdown", down);
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    document.body.classList.add("cursor-hidden");
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my, raf = 0;

    const mm = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${mx}px,${my}px)`;
      const t = e.target as Element | null;
      const near = !!(t && t.closest && t.closest("a,button,.capsule,.dball,[data-cursor],input,select,textarea"));
      wrap.current?.classList.toggle("near", near);
    };
    window.addEventListener("mousemove", mm);

    const loop = () => {
      rx += (mx - rx) * 0.22; ry += (my - ry) * 0.22;
      if (wrap.current) wrap.current.style.transform = `translate(${rx}px,${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => { window.removeEventListener("mousemove", mm); cancelAnimationFrame(raf); document.body.classList.remove("cursor-hidden"); };
  }, []);

  return (
    <>
      <div className="dradar-wrap" ref={wrap} aria-hidden>
        <svg viewBox="0 0 64 64">
          <circle className="scope" cx="32" cy="32" r="22" fill="rgba(6,19,13,.5)" strokeWidth="1.5" />
          <circle cx="32" cy="32" r="14" fill="none" stroke="rgba(73,240,138,.3)" strokeWidth="1" />
          <line x1="32" y1="10" x2="32" y2="54" stroke="rgba(73,240,138,.25)" strokeWidth="1" />
          <line x1="10" y1="32" x2="54" y2="32" stroke="rgba(73,240,138,.25)" strokeWidth="1" />
          <g className="rsweep2"><path className="sw" d="M32 32 L32 10 A22 22 0 0 1 51 21 Z" opacity=".3" /></g>
          <circle cx="40" cy="22" r="2" fill="var(--radar)" />
          <circle className="ping" cx="32" cy="32" r="22" strokeWidth="2" />
          <g className="lock" fill="none" strokeWidth="2.5" strokeLinecap="round">
            <path d="M4 14 V4 H14" /><path d="M50 4 H60 V14" /><path d="M60 50 V60 H50" /><path d="M14 60 H4 V50" />
          </g>
        </svg>
      </div>
      <div className="cursor-dot" ref={dot} />
    </>
  );
}
