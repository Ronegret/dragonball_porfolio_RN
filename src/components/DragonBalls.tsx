import { useEffect, useRef } from "react";
import { useBalls } from "../lib";

// cada visita las esferas se esconden en sitios distintos: 7 de estas zonas, a una altura y lado al azar
const ZONES = ["inicio", "hero", "perfil", "poderes", "stack", "sagas", "trayectoria", "referencias", "multiverso"];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
function randomSpots(): [string, number, number][] {
  const z = [...ZONES];
  for (let i = z.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [z[i], z[j]] = [z[j], z[i]]; }
  // siempre en los márgenes (izquierda o derecha) para no tapar contenido
  return z.slice(0, 7).map((id) => [id, Math.random() < 0.5 ? rnd(1.5, 5) : rnd(89, 94), rnd(8, 82)]);
}

export default function DragonBalls() {
  const { collect, isDone } = useBalls();
  const nodes = useRef<HTMLDivElement[]>([]);
  const collectRef = useRef(collect);
  collectRef.current = collect;

  useEffect(() => {
    const made: HTMLDivElement[] = [];
    randomSpots().forEach(([id, left, top], idx) => {
      const star = idx + 1;
      const sec = document.getElementById(id);
      if (!sec) return;
      if (getComputedStyle(sec).position === "static") sec.style.position = "relative";
      const b = document.createElement("div");
      b.className = "dball";
      b.dataset.star = String(star);
      b.style.left = left + "%"; b.style.top = top + "%";
      b.style.animationDelay = idx * 0.4 + "s";
      b.title = `Esfera de ${star} estrella${star > 1 ? "s" : ""}`;
      b.innerHTML = `<img src="/assets/db/ball${star}.webp" alt="" draggable="false" style="width:100%;height:100%;display:block">`;
      b.addEventListener("click", () => collectRef.current(star, b));
      sec.appendChild(b);
      made.push(b);
    });
    nodes.current = made;
    return () => made.forEach((n) => n.remove());
  }, []);

  useEffect(() => {
    nodes.current.forEach((n) => { n.style.display = isDone(Number(n.dataset.star)) ? "none" : ""; });
  });

  return null;
}
