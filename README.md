# 🐉 Portfolio Rodrigo Negrete — Capsule Corp

Portfolio interactivo y gamificado (Dragon Ball Z + Capsule Corp) construido como app profesional.

**Stack:** Vite + React + TypeScript + **Framer Motion** + **GSAP (ScrollTrigger)** + **Lenis** (smooth scroll). Datos reales del CV (perfil, stack, proyectos, trayectoria, formación, referencias y contacto de rodrigonegrete.es).

## ✨ Concepto
> Tu evolución profesional **es** un power-up Saiyan. El vídeo de transformaciones vive **detrás del contenido** (canvas fijo) y sube de nivel con el scroll; tu CV real flota encima y cambia sincronizado con cada forma.

- **Personaje interactivo** en el hero (`src/components/Character3D.tsx`): imagen estática de alta calidad con un **aura de ki (canvas 2D) que se agita al pasar el ratón**, y al **hacer clic** un **destello** revela la **evolución** por las 6 formas (base → Super Saiyan → Fase 3 → Blue → Ultra Instinto → Fase 4). Cada forma muestra una **etapa real de estudios/carrera** (Fundamentos B2B+Web → UX/UI Neoland → Producto & Frontend → Máster IA Generativa UDIA → Agentes IA EBIS → AI Product Designer). El orden está en `ORDER`; las imágenes en `public/assets/forms/f1..f6.png`.
- **Logo = Radar del Dragón** y **cursor = Radar del Dragón** que sigue el puntero (se oculta en táctil).
- **Evolución de fondo** (Normal → Super Saiyan → Blue → Ultra Instinto → SSJ4) sincronizada con las 5 etapas reales de tu carrera. La forma del vídeo y la tarjeta del CV coinciden fase a fase.
- **Secciones completas:** Hero · Perfil · Poderes (transformaciones) · Arsenal (stack con barras de ki) · Sagas (proyectos = cápsulas Hoi-Poi con explosión y holograma) · Trayectoria (timeline + formación) · Referencias · Invocación de Shen Long (contacto).
- **Gamificación:** 7 esferas del dragón escondidas, contador en el HUD, **Modo Reclutador** y desbloqueo de Shen Long a 7/7.
- Responsive (desktop + móvil) y `prefers-reduced-motion`.

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
  lib.tsx                # contexto esferas, audio, SVG esfera, Reveal (Framer Motion)
  index.css              # sistema de diseño (negro profundo, HUD, auras DBZ)
  components/
    EvolutionBackground.tsx  # canvas de frames (fondo) + sync con scroll
    CursorAvatar.tsx         # cursor-personaje
    Hero / Profile / Transformations / Stack / Projects / Experience / References / Shenron / Hud / DragonBalls
public/assets/
  frames/ (192 jpg)      # secuencia del vídeo de evolución
  hero-avatar.png, about-avatar.png, headshot.png, kame-*.jpg
_source/                 # material original (vídeo mp4, jpgs, index v1) — no se despliega
```

## 🎞️ Regenerar los frames (si cambias el vídeo)
```bash
ffmpeg -i tu-video.mp4 -vf "select=not(mod(n\,5)),scale=900:-2" -vsync 0 -q:v 4 public/assets/frames/f%04d.jpg -y
```
Ajusta `FRAMES` en `src/components/EvolutionBackground.tsx` si cambia el número, y los `at` de `TRANSFORMATIONS` en `src/data.ts` (punto 0–1 del scroll donde cambia cada forma).
