// Copia al proyecto Remotion los assets de la web que usan las composiciones (evita duplicarlos en git).
import { copyFileSync, mkdirSync } from "node:fs";
import { basename } from "node:path";

const from = "../public/assets/";
const files = [
  ...[1, 2, 3, 4, 5, 6, 7].map((n) => `db/ball${n}.webp`),
  "rod/blue-suit.webp", "rod/team.webp", "rod/kneel-balls.webp",
  "scenes/barcelona.webp", "scenes/gravity.webp", "space/nebula.webp", "sfx/intro.mp3",
];
mkdirSync("public", { recursive: true });
for (const f of files) copyFileSync(from + f, "public/" + basename(f));
console.log(`${files.length} assets copiados a remotion/public`);
