# 🐉 Portfolio Rodrigo Negrete — Capsule Corp

Portfolio interactivo y gamificado (Dragon Ball Z + Capsule Corp) construido como app profesional.

**Stack:** Vite + React + TypeScript + **Framer Motion** + **GSAP (ScrollTrigger)** + **Lenis** (smooth scroll). Datos reales del CV (perfil, stack, proyectos, trayectoria, formación, referencias y contacto de rodrigonegrete.es).

## ✨ Concepto
> Tu evolución profesional **es** un power-up Saiyan. El vídeo de transformaciones vive **detrás del contenido** (canvas fijo) y sube de nivel con el scroll; tu CV real flota encima y cambia sincronizado con cada forma.

- **Personaje interactivo** en el hero (`src/components/Character3D.tsx`): imagen estática de alta calidad con un **aura de ki (canvas 2D) que se agita al pasar el ratón**, y al **hacer clic** un **destello** revela la **evolución** por las 6 formas (base → Super Saiyan → Fase 3 → Blue → Ultra Instinto → Fase 4). Cada forma muestra una **etapa real de estudios/carrera** (Fundamentos B2B+Web → UX/UI Neoland → Producto & Frontend → Máster IA Generativa UDIA → Agentes IA EBIS → AI Product Designer). El orden está en `ORDER`; las imágenes en `public/assets/forms/f1..f6.webp`.
- **Logo = Radar del Dragón** y **cursor = Radar del Dragón** que sigue el puntero (se oculta en táctil).
- **Evolución de fondo** (Normal → Super Saiyan → Blue → Ultra Instinto → SSJ4) sincronizada con las 5 etapas reales de tu carrera. La forma del vídeo y la tarjeta del CV coinciden fase a fase.
- **Secciones completas:** Hero · Perfil · Poderes (transformaciones) · Arsenal (stack con barras de ki) · Sagas (proyectos = cápsulas Hoi-Poi con explosión y holograma) · Trayectoria (timeline + formación) · Referencias · Invocación de Shen Long (contacto).
- **Gamificación:** 7 esferas del dragón escondidas, contador en el HUD, **Modo Reclutador** y desbloqueo de Shen Long a 7/7.
- **Escena protagonista con la mirada que sigue al cursor** (`MesaStage.tsx`, vídeos `mesa` / `mesa2`): **desactivada por ahora** (no se monta en `App.tsx`). El código, los fotogramas (`public/assets/mesa*/`) y los scripts (`tools/build-mesa*.py`) siguen en el repositorio: para recuperarla, importa `MesaStage` en `App.tsx` y ponla antes de `<Hero />`, y añade el `<link rel="preload">` del primer fotograma en `index.html`.
- **"Pide tu deseo"** (`WishFrame.tsx`): el formulario de contacto dentro de un panel de piedra rodeado por **Shen Long** (tu marco recortado con `tools/build-wish-frame.py`), con las 7 esferas latiendo, ojos rojos, rayos de energía entre esferas (canvas, solo visible en pantalla; se multiplican al acercarse al botón) y destellos de tormenta. El panel tiene una muesca donde asoma la cabeza, así el dragón se ve entero y sin cortes. En móvil el dragón se parte en cabeza y cola para no deformarse.
- **Poderes** con selector de fases (5 pasos con la línea de ki que avanza), escena más compacta y sin hueco vacío; **ficha de guerrero** como carné de identidad (foto con escaneo, nivel 9001, datos con esferas e idiomas con barras); **dock de contacto** móvil con esferas del dragón e iconos (Contactar · WhatsApp · CV).
- **Todo plegado por defecto** (experiencia, stack, competencias, referencias, formación): el resumen de cada desplegable lleva una frase humana y el detalle se abre a demanda. **Lo que sé hacer** usa la imagen del portátil con pegatinas (`SkillsBoard.tsx`): cada punto abre su área; las posiciones están en `COMPETENCIAS[].pin` (% sobre la imagen).
- **Contenido sincronizado con rodrigonegrete.es** (`src/data.ts`): stack completo (16 + 15 + 9 herramientas), competencias clave del CV en 5 desplegables, experiencia con los logros de cada puesto e **impacto clave** (287 recursos · −96 % · 27 nodos · +80 cuentas). Si actualizas el CV, edita `STACK`, `COMPETENCIAS`, `EXPERIENCE` e `IMPACT`.
- **Intro cinematográfica** (`TitleCard.tsx`, línea de tiempo GSAP): la bola del dragón se enciende, estalla con ondas de choque y las letras del nombre caen una a una; "Comenzar" toca la música de apertura.
- **Universo de fondo** (`SpaceBackground.tsx`): campo de partículas en canvas que reacciona al ratón (se apartan, hilos de constelación, onda de choque al hacer clic, estiramiento al hacer scroll rápido), nebulosa, planetas con parallax anclados a su sección y la cápsula de Goku cruzando el cielo.
- **Cabeceras tipo viñeta** (`Splash.tsx`): escena de fondo + personaje que sale del marco, con parallax por capas.
- **Puntos de calor de contacto:** botón *Contactar* en la barra (escritorio), dock inferior en móvil (Contactar · WhatsApp · CV), copiar email en el footer y radar pulsante en la cápsula principal.
- Responsive (desktop + móvil), accesibilidad (enlace "Saltar al contenido", foco visible, nombres accesibles) y `prefers-reduced-motion`.

## ▶️ Desarrollo
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera /dist (producción)
npm run preview    # sirve /dist
```

## 🚀 Deploy en Vercel
Vercel autodetecta Vite (build `npm run build`, output `dist`). Sin configuración:
```bash
npm i -g vercel
vercel           # preview
vercel --prod    # producción
```
O conecta el repo de GitHub en vercel.com.

## ✏️ Qué rellenar / revisar
- **CV en PDF:** coloca tu PDF en `public/assets/CV-Rodrigo-Negrete.pdf` (el botón "Descargar CV" ya apunta ahí).
- **LinkedIn:** confirma tu URL exacta en `src/data.ts` → `CONTACT.linkedin`.
- El resto (email, teléfono, WhatsApp, proyectos, experiencia, formación, referencias) ya está con tus **datos reales**. Edítalo en `src/data.ts`.

## 📁 Estructura
```
index.html              # entrada Vite
src/
  main.tsx  App.tsx      # setup Lenis+GSAP, provider de esferas, composición
  data.ts                # TODO el contenido real del CV (edítalo aquí)
  lib.tsx                # contexto esferas, audio (Howler), SVG esfera, Reveal, DBText (letras animadas)
  index.css              # sistema de diseño (cómic DBZ: contornos, sombras duras, Luckiest Guy)
  components/
    Loader / TitleCard      # radar de carga + cartela cinematográfica con música
    SpaceBackground         # partículas, nebulosa, planetas, cápsula de Goku
    Splash                  # cabecera de sección (escena + personaje, parallax)
    EvolutionBackground     # canvas de frames (fondo) + sync con scroll
    Hero / Profile / Transformations / Stack / Projects / Experience / References / Shenron
    Footer / ContactDock / Hud / CursorAvatar / DragonBalls / Character3D
public/assets/
  frames/ (192 jpg)      # secuencia del vídeo de evolución
  forms/ caps/ db/ proj/ # personaje, cápsulas, esferas y capturas (WebP)
  rod/ scenes/ space/    # ilustraciones recortadas, escenas y objetos del fondo
  sfx/                   # sonidos (mp3 aportados + wav sintetizados)
tools/                   # pipelines reproducibles (ver abajo)
_source/                 # originales (no se versiona ni se despliega)
```

## 🛠️ Pipelines de assets (`tools/`)
| Script | Qué hace |
|---|---|
| `build-sfx-user.py` | Recorta, añade fundidos y ajusta el nivel (por pico) de los mp3 de `_source/sfx` -> `public/assets/sfx` (requiere ffmpeg) |
| `fix-pockets.py` | Convierte en transparencia los huecos blancos encerrados (p. ej. entre brazo y torso) |
| `build-nuevas2.py` | Recorta y optimiza las ilustraciones de `_source/nuevas2` (cutouts WebP, escenas) |
| `build-wish-frame.py` | Recorta el marco de Shen Long (`_source/wish/frame.png`) y mide esferas y ojos -> `public/assets/wish/frame.webp` + `src/wishFrame.ts` |
| `cutout.py` | Recorte genérico de fondo blanco con sombra translúcida |
| `build-mesa2.py` | Recorta la oficina del vídeo `mesa2` (GrabCut + máscara de rayos), elige fotogramas por mirada y exporta WebP con transparencia + `src/mesa2Gaze.ts` (requiere ffmpeg y opencv) |
| `build-mesa.py` | Elige los fotogramas de `_source/mesa/mesa.mp4` según la mirada, los exporta a WebP y genera `src/mesaGaze.ts` (requiere ffmpeg) |
| `build-capsules.py` | Genera las 16 cápsulas Hoi-Poi |
| `build-space.py` | Genera la nebulosa procedural |
| `clean-balls.py` | Limpia las 7 esferas del dragón (`public/assets/db/ball1..7.webp`): ajusta una elipse al arco superior y deja transparente la peana blanca de debajo. Parte de los originales en `_source/db-backup`, así que se puede repetir |

## 🎬 Remotion (imagen para compartir y teaser)
La carpeta `remotion/` es un proyecto aparte (no entra en el build de la web) que usa los mismos assets y la misma tipografía:
```bash
cd remotion
npm install
npm run assets   # copia a remotion/public los assets de la web
npm run og       # imagen Open Graph 1200x630 -> out/og.jpg  (copiar a public/og.jpg)
npm run teaser   # teaser vertical 1080x1920, 14 s, con la música de apertura -> out/teaser.mp4
npx remotion studio   # previsualizar y ajustar las composiciones
```

## 🎞️ Regenerar los frames (si cambias el vídeo)
```bash
ffmpeg -i tu-video.mp4 -vf "select=not(mod(n\,5)),scale=900:-2" -vsync 0 -q:v 4 public/assets/frames/f%04d.jpg -y
```
Ajusta `FRAMES` en `src/components/EvolutionBackground.tsx` si cambia el número, y los `at` de `TRANSFORMATIONS` en `src/data.ts` (punto 0–1 del scroll donde cambia cada forma).
