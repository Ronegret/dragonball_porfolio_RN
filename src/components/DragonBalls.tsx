import { useEffect, useRef } from "react";
import { useBalls } from "../lib";

// [sección, left%, top%] — una esfera por sección
const SPOTS: [string, number, number][] = [
  ["hero", 4, 44], ["perfil", 92, 16], ["poderes", 85, 20],
  ["stack", 95, 42], ["sagas", 94, 8], ["trayectoria", 95, 26], ["referencias", 92, 80],
];

export default function DragonBalls() {
  const { collect, isDone } = useBalls();
  const nodes = useRef<HTMLDivElement[]>([]);
  const collectRef = useRef(collect);
  collectRef.current = collect;

  useEffect(() => {
    const made: HTMLDivElement[] = [];
    SPOTS.forEach(([id, left, top], idx) => {
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
