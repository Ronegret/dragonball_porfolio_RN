// ===== Datos reales del CV de Rodrigo Negrete (fuente: rodrigonegrete.es) =====
// Marco narrativo Dragon Ball: su evolución profesional = sus transformaciones.

export const PROFILE = {
  name: "Rodrigo Negrete",
  role: "AI Product Designer · UX/UI + Automatización IA",
  kicker: "Guerrero Z del diseño de producto con IA",
  headline: ["Diseño flujos,", "interfaces y", "automatizaciones."],
  tagline:
    "Diseño producto digital con IA, agentes conversacionales y automatizaciones. UX/UI (Neoland), Máster en Agentes IA (EBIS) y +17 años en B2B enterprise (Telefónica): sé qué hace falta para que un producto funcione en el mundo real.",
  location: "Barcelona, España",
  status: ["Disponible ahora", "Barcelona · Remoto EU", "Full-time · Freelance"],
  roles: "AI Product Designer · AI Automation Specialist · Design Technologist",
  // descripción en clave Dragon Ball (hero)
  saga: "Entrené UX/UI en la cámara del tiempo de Neoland, desbloqueé el Máster en Agentes IA de EBIS y llevo +17 años de combate en B2B enterprise. Mi técnica especial: productos con IA que funcionan en el mundo real.",
};

export const STATS = [
  { n: "2+", l: "años enfocado en UX/IA" },
  { n: "11", l: "casos de estudio" },
  { n: "50+", l: "herramientas usadas" },
  { n: "17+", l: "años en negocio B2B" },
];

export const LANGS = [
  { l: "Español", lv: "Nativo" },
  { l: "Inglés", lv: "B2" },
  { l: "Catalán", lv: "A2" },
];

// ===== Transformaciones (orden del vídeo + evolución real de carrera) =====
// at = punto de scroll [0-1] donde la forma cambia en pantalla (sincronizado con el vídeo)
export const TRANSFORMATIONS = [
  {
    at: 0.0,
    form: "FORMA BASE",
    sub: "El origen",
    title: "Negocio B2B & Fundamentos Web",
    aura: "#9fb6d4",
    soft: "rgba(159,182,212,.35)",
    text: "El punto de partida: +17 años en B2B enterprise (Movistar/Telefónica) gestionando grandes cuentas, más la base técnica de desarrollo web. Business acumen + código.",
    skills: ["B2B Enterprise", "HTML/CSS/JS", "WordPress", "Negociación", "Operaciones"],
    power: 45,
  },
  {
    at: 0.19,
    form: "SUPER SAIYAN",
    sub: "El primer estallido",
    title: "Diseño UX / UI",
    aura: "#ffb800",
    soft: "rgba(255,184,0,.38)",
    text: "Bootcamp UX/UI en Neoland (600+ horas). Design Thinking, user research, Figma, Design Systems y Lean UX aplicados a proyectos reales de negocio.",
    skills: ["Figma", "Design Systems", "User Research", "Prototipado", "Lean UX"],
    power: 64,
  },
  {
    at: 0.38,
    form: "SUPER SAIYAN BLUE",
    sub: "Poder bajo control",
    title: "Producto Digital & Frontend",
    aura: "#2fb8ff",
    soft: "rgba(47,184,255,.38)",
    text: "Del diseño al producto en producción. React, Tailwind, Framer Motion, Three.js y WebGL para construir, no solo maquetar. Productos propios lanzados de principio a fin.",
    skills: ["React · Vite", "Tailwind", "Framer Motion", "Three.js", "Vercel"],
    power: 80,
  },
  {
    at: 0.66,
    form: "ULTRA INSTINTO",
    sub: "El cuerpo se mueve solo",
    title: "IA Generativa",
    aura: "#d7e6f2",
    soft: "rgba(215,230,242,.42)",
    text: "Especialización en IA Generativa (UDIA). Prompt engineering avanzado, dominio de LLMs y generación de activos visuales, voz y vídeo con IA integrada en el flujo.",
    skills: ["LLMs", "Prompt Engineering", "Claude · GPT · Gemini", "Imagen/Vídeo IA", "RAG"],
    power: 92,
  },
  {
    at: 0.82,
    form: "SUPER SAIYAN 4 · MÁXIMO",
    sub: "Mi nivel actual",
    title: "Agentes IA & Hiperautomatización",
    aura: "#ff4d4d",
    soft: "rgba(255,77,77,.4)",
    text: "Máster EBIS en Agentes IA e Hiperautomatización (cert. en blockchain Polygon). Diseño, construyo y despliego agentes autónomos con Make, n8n, Botpress y Vapi trabajando 24/7.",
    skills: ["Make", "n8n", "Botpress", "Vapi", "Agentes autónomos"],
    power: 100,
  },
];

// ===== Stack real agrupado, con nivel de uso (ki) =====
export const STACK = [
  {
    group: "IA & Automatización",
    icon: "bolt",
    count: "18+ tools",
    tools: [
      { n: "Claude (Opus 4.5 · Sonnet · Haiku)", lv: "Uso diario", k: 100 },
      { n: "Claude Code · Agent SDK", lv: "Uso diario", k: 100 },
      { n: "OpenAI (GPT-4o · GPT-5 · o3)", lv: "Uso diario", k: 95 },
      { n: "Google AI Studio · Gemini 2.5", lv: "Uso frecuente", k: 85 },
      { n: "GitHub Copilot", lv: "Uso frecuente", k: 82 },
      { n: "Antigravity (Google IDE agent)", lv: "Uso frecuente", k: 80 },
      { n: "Make (Integromat)", lv: "Uso frecuente", k: 90 },
      { n: "n8n", lv: "Uso frecuente", k: 90 },
      { n: "Botpress", lv: "Proyecto real", k: 80 },
      { n: "Vapi (Voice AI)", lv: "Proyecto real", k: 78 },
      { n: "Vertex AI · Google Cloud", lv: "Uso práctico", k: 68 },
      { n: "Cursor", lv: "Uso práctico", k: 70 },
      { n: "Nano Banana · Whisk", lv: "Uso práctico", k: 66 },
      { n: "ElevenLabs · Suno", lv: "Uso práctico", k: 70 },
      { n: "Midjourney · Firefly", lv: "Uso práctico", k: 66 },
      { n: "UiPath", lv: "Base técnica", k: 55 },
    ],
  },
  {
    group: "Design & Frontend",
    icon: "pen",
    count: "16+ tools",
    tools: [
      { n: "Figma · Prototipado + Design Systems", lv: "Uso diario", k: 100 },
      { n: "VS Code · entorno principal", lv: "Uso diario", k: 95 },
      { n: "HTML5 · CSS3 · JavaScript", lv: "Uso frecuente", k: 90 },
      { n: "React · Vite · Next.js", lv: "Conocimientos sólidos", k: 82 },
      { n: "Framer · Framer Motion", lv: "Proyecto real", k: 85 },
      { n: "Tailwind CSS · shadcn/ui", lv: "Uso frecuente", k: 88 },
      { n: "WordPress · Elementor", lv: "Proyecto real", k: 85 },
      { n: "Three.js · Spline · WebGL", lv: "Proyecto real", k: 72 },
      { n: "Node.js · Firebase · Supabase", lv: "Uso práctico", k: 70 },
      { n: "Vercel · GitHub · CI/CD", lv: "Uso frecuente", k: 84 },
      { n: "Stitch (Google UI generator)", lv: "Uso práctico", k: 68 },
      { n: "Pomelli · Mixboard", lv: "Uso práctico", k: 64 },
      { n: "Shopify · Liquid", lv: "Proyecto real", k: 76 },
      { n: "Adobe Illustrator · Photoshop", lv: "Uso práctico", k: 75 },
      { n: "Angular · Vue", lv: "Base técnica", k: 55 },
    ],
  },
  {
    group: "CRO & Operations",
    icon: "chart",
    count: "9 tools",
    tools: [
      { n: "Google Workspace (Docs, Sheets, Slides)", lv: "Uso diario", k: 95 },
      { n: "Google Analytics 4", lv: "Uso frecuente", k: 82 },
      { n: "Excel Avanzado · Power BI", lv: "Uso frecuente", k: 85 },
      { n: "Notion · Linear · Jira", lv: "Uso frecuente", k: 86 },
      { n: "Hotjar · FullStory", lv: "Uso práctico", k: 72 },
      { n: "PostHog · Vercel Analytics", lv: "Uso práctico", k: 70 },
      { n: "Google Search Console · Tag Manager", lv: "Uso práctico", k: 74 },
      { n: "Salesforce · HubSpot", lv: "Base técnica", k: 60 },
      { n: "Trello", lv: "Uso práctico", k: 70 },
    ],
  },
];

// ===== Competencias clave (CV de rodrigonegrete.es/cv): lo que sé hacer, por áreas =====
export const COMPETENCIAS = [
  { group: "Diseño de producto", icon: "pen", items: ["Product Discovery", "User Research", "Usability Testing", "Information Architecture", "Wireframing", "Prototipado interactivo", "Design Thinking", "Lean UX", "Design Systems", "Design Tokens", "Figma", "Accesibilidad WCAG 2.1 AA"] },
  { group: "IA aplicada", icon: "bolt", items: ["Generative AI", "Large Language Models (OpenAI, Claude, Gemini)", "Prompt Engineering", "RAG", "Embeddings", "AI Agents", "Conversational AI", "Voice AI", "LangChain", "Vector DB"] },
  { group: "Automatización & Low-code", icon: "code", items: ["Make (Integromat)", "n8n", "Botpress", "Vapi", "Zapier", "Supabase", "Firebase", "REST APIs", "Webhooks", "Hyperautomation", "RPA"] },
  { group: "Frontend aplicado", icon: "globe", items: ["HTML", "CSS", "JavaScript (ES6+)", "React", "Next.js", "Tailwind CSS", "Vite", "WordPress", "Elementor", "Shopify", "Git", "Vercel"] },
  { group: "Analítica & Negocio", icon: "chart", items: ["Google Analytics 4", "Hotjar", "Power BI", "Excel avanzado", "A/B testing", "CRO", "Gestión B2B enterprise", "KPIs", "Stakeholder management", "Agile / Scrum"] },
];

// ===== Proyectos = Cápsulas Hoi-Poi (los 16 casos de rodrigonegrete.es, mismo orden) =====
const SITE = "https://www.rodrigonegrete.es";
export type Project = {
  name: string; tag: string; cat: string; year: string; title: string; desc: string; role: string;
  tech: string[]; img: string; caseUrl: string; live?: string; liveLabel?: string; cap: string; star?: boolean;
};
export const PROJECTS: Project[] = [
  { name: "Rodd.es", tag: "Proyecto principal · Open source", cat: "Producto", year: "2026", star: true, cap: "#e0383b", img: "rodd",
    title: "Biblioteca open source multilingüe de 287 recursos web",
    desc: "Directorio abierto en 7 idiomas nativos (ES · EN · CA · FR · IT · DE · PT) con efectos, animaciones, componentes React, microinteracciones, fondos animados y escenas 3D listos para probar en vivo, editar y copiar el código.",
    role: "Concepto, diseño, desarrollo y lanzamiento", tech: ["React", "WebGL", "Three.js", "Framer Motion", "7 idiomas", "Vercel"],
    caseUrl: `${SITE}/rodd-es/`, live: "https://rodd.es", liveLabel: "rodd.es" },
  { name: "AEM Planner", tag: "Cliente real · En producción", cat: "Producto", year: "2026", star: true, cap: "#2f8bff", img: "aem",
    title: "Un sistema operativo para bodas",
    desc: "App web para Algo Entre Manos: tres personas coordinan hasta 12 bodas al año en fincas sin cobertura. Panel operativo, portal privado para la pareja, plano de mesas interactivo, generador de contratos, presupuesto por plazos y dossieres imprimibles.",
    role: "Research UX, sistema de diseño y desarrollo end-to-end", tech: ["Product design", "PWA offline-first", "Design system", "IA como herramienta"],
    caseUrl: `${SITE}/aem/`, live: "https://aem.rodd.es/", liveLabel: "aem.rodd.es" },
  { name: "ZODI", tag: "Caso destacado · AI product", cat: "IA & Auto.", year: "2026", star: true, cap: "#ffcc1f", img: "zodi",
    title: "Oráculo astral con IA y humor ácido",
    desc: "Producto digital completo para horóscopo, tarot, carta natal, numerología y comunidad: IA personalizada, 17 tipos de lectura, 4 tonos de respuesta, planes premium y una marca visual memorable.",
    role: "Producto, UX writing, marca y PWA", tech: ["AI product", "PWA", "UX writing", "Freemium"],
    caseUrl: `${SITE}/zodi/`, live: "https://zodi.aibueno.es", liveLabel: "zodi.aibueno.es" },
  { name: "Dedícalo Play", tag: "Juego musical", cat: "Producto", year: "2025", cap: "#22b573", img: "dedicalo-play",
    title: "El juego musical para jugar con amigos",
    desc: "App multijugador donde dedicas canciones, acumulas puntos y compites con amigos en tiempo real.",
    role: "UX, branding, mecánicas de juego y lanzamiento", tech: ["React", "Supabase", "Tiempo real", "IA"],
    caseUrl: `${SITE}/dedicalo-play/`, live: "https://play.dedicalo.es", liveLabel: "play.dedicalo.es" },
  { name: "Just Enjoy", tag: "TFM · Máster EBIS", cat: "IA & Auto.", year: "2026", cap: "#9b4dff", img: "just-enjoy",
    title: "Hiperautomatización para viajes",
    desc: "Plataforma del Máster EBIS que automatiza preferencias, vuelos, hotel, actividades, mapa, PDF y refinamiento con agentes IA y datos reales.",
    role: "Arquitectura de agentes y automatización", tech: ["n8n · 27 nodos", "GPT-4.1", "Next.js", "Supabase", "SerpAPI", "Tavily"],
    caseUrl: `${SITE}/just-enjoy/`, live: "https://www.loom.com/share/d6427541f9764c5580b900ef168f33aa", liveLabel: "Vídeo demo" },
  { name: "Iberdata", tag: "Business case · Máster EBIS", cat: "IA & Auto.", year: "2026", cap: "#ff7a1f", img: "iberdata",
    title: "Oficina de IA y Automatización (CoE)",
    desc: "Business case para una empresa de 450 empleados: Centro de Excelencia, gobierno, arquitectura, dos pilotos, sprints, KPIs y riesgos en 12 semanas.",
    role: "Estrategia, gobierno y pilotos IA", tech: ["n8n", "RAG", "OpenAI API", "Playwright", "Supabase"],
    caseUrl: `${SITE}/iberdata/` },
  { name: "ZODI BTO", tag: "Prototipo IA", cat: "IA & Auto.", year: "2025", cap: "#e83e9a", img: "zodi-bto",
    title: "Oráculo conversacional",
    desc: "Primer prototipo de ZODI: terminal de consulta con Botpress, personalidad mística, memoria contextual y tono honesto antes de escalar al producto PWA actual.",
    role: "Diseño conversacional y personaje IA", tech: ["Botpress", "UX writing", "WordPress"],
    caseUrl: `${SITE}/zodi-bto/` },
  { name: "Invitoo", tag: "Founder · Wedding tech", cat: "Producto", year: "2025", cap: "#22c4d6", img: "invitoo",
    title: "Invitaciones digitales con IA",
    desc: "Marca propia creada desde cero: UX/UI, web, RSVP, automatizaciones, canciones generadas con IA, animaciones e invitaciones interactivas personalizadas.",
    role: "Founder único: producto, marca y automatización", tech: ["Suno", "React", "Make", "UX/UI"],
    caseUrl: `${SITE}/invitoo/`, live: "https://invitoo.es/", liveLabel: "invitoo.es" },
  { name: "PDF Rodd", tag: "UX tool", cat: "UX / UI", year: "2025", cap: "#6fdc2a", img: "pdf-rodd",
    title: "Editor PDF gratuito y rápido",
    desc: "Herramienta web para editar, firmar, resaltar, corregir y comprimir PDFs desde el navegador. Minimalista, funcional y sin instalación.",
    role: "Diseño y desarrollo", tech: ["PDF.js", "PDF-lib", "Fabric.js", "Descarga local"],
    caseUrl: `${SITE}/pdf-rodd/` },
  { name: "Estudio CCSE", tag: "EdTech · UX/UI", cat: "UX / UI", year: "2024", cap: "#9aa3ad", img: "ccse",
    title: "Simulador para la nacionalidad española",
    desc: "Herramienta para estudiar la prueba CCSE con preguntas verificadas, interfaz accesible y simulador en vivo en GitHub Pages.",
    role: "UX/UI y desarrollo", tech: ["Contenido verificado", "Mobile-first", "GitHub Pages"],
    caseUrl: `${SITE}/ccse/` },
  { name: "Dedícalo", tag: "IA generativa · UX emocional", cat: "IA & Auto.", year: "2024", cap: "#1fc995", img: "dedicalo",
    title: "Canciones personalizadas con IA",
    desc: "Producto propio para convertir historias en canciones: brainstorming, benchmark, flujo de 3 pasos, audio IA, portadas, vídeo y entrega emocional.",
    role: "Producto, UX y producción con IA", tech: ["Suno / Udio", "WordPress", "CapCut", "7 demos"],
    caseUrl: `${SITE}/dedicalo/`, live: "https://dedicalo.es/", liveLabel: "dedicalo.es" },
  { name: "ParaTuMundo", tag: "E-commerce · UX research", cat: "UX / UI", year: "2024", cap: "#e8602c", img: "paratumundo",
    title: "Estrategia UX para marketplace",
    desc: "Research competitivo, DAFO, 33 encuestas, personas, journey map, arquitectura de información y prototipo Figma para un e-commerce multicategoría.",
    role: "UX research y prototipado", tech: ["Figma", "Shopify", "BigBuy", "33 encuestas"],
    caseUrl: `${SITE}/paratumundo/`, live: "https://www.figma.com/proto/LoTEI5mt1UGSJ1DT62duMO/Rodrigo.Negrete---Reto-2-?page-id=1%3A867&type=design&node-id=202-721&viewport=496%2C1412%2C0.67&t=X6TV8sWRONi6Gl51-1&scaling=min-zoom&starting-point-node-id=180%3A633", liveLabel: "Prototipo Figma" },
  { name: "Te Atiendo", tag: "Gastro-tech · Service design", cat: "UX / UI", year: "2024", cap: "#d6f000", img: "teatiendo",
    title: "UX para servicio en mesa",
    desc: "Producto para restaurantes: research, DAFO, benchmarking, journey map, gamificación del staff, feedback en tiempo real y prototipo Figma con 90% de validación.",
    role: "UX research y service design", tech: ["Figma", "20 encuestas", "Gamificación"],
    caseUrl: `${SITE}/te-atiendo/` },
  { name: "Aquae", tag: "App móvil", cat: "UX / UI", year: "2024", cap: "#3b49ff", img: "aquae",
    title: "App para el ahorro de agua",
    desc: "Aplicación móvil para la sostenibilidad que usa gamificación y ciencia de datos para incentivar el ahorro hídrico.",
    role: "UX/UI en equipo", tech: ["Figma", "Gamificación", "Datos"],
    caseUrl: `${SITE}/aquae/`, live: "https://www.figma.com/proto/bI3ukZLYRVVqQZEuXEmfpu/Grupo-4---Ahorro-del-agua?page-id=31%3A858&node-id=32-860&starting-point-node-id=317%3A3931&t=bkkPBYHQtmpH9FEq-1", liveLabel: "Prototipo Figma" },
  { name: "Travel of Vapers", tag: "Branding · Packaging", cat: "Marca", year: "2023", cap: "#d23ad8", img: "travel-of-vapers",
    title: "Marca sensorial de producto físico",
    desc: "Identidad visual, packaging, sistema de 21 sabores/destinos, marketing social, venta directa, eventos y logística nacional.",
    role: "Marca, packaging y operaciones", tech: ["Photoshop", "21 destinos", "Escala nacional"],
    caseUrl: `${SITE}/travel-of-vapers/` },
  { name: "Tomapoly", tag: "UX físico · Branding", cat: "Marca", year: "2023", cap: "#e9dfc4", img: "tomapoly",
    title: "UX aplicado a un juego físico",
    desc: "Gamificación física: mecánicas sociales, tablero de 113 casillas, packaging waterproof, preprensa, testing y producción audiovisual.",
    role: "Diseño de juego, marca y producción", tech: ["113 casillas", "PVC", "Photoshop", "Premiere"],
    caseUrl: `${SITE}/tomapoly/` },
];

export const PROJECT_CATS = ["Todos", "IA & Auto.", "Producto", "UX / UI", "Marca"];

// ===== Laboratorio de Capsule Corp (webs y experimentos en vivo) =====
export const LAB = [
  { name: "AIbueno.es", tag: "Proyecto IA boutique · Activo", desc: "Agencia de IA y desarrollo web en Barcelona: webs, apps móviles y agentes de IA.", img: "aibueno", url: "https://aibueno.es" },
  { name: "Jukaa Tattoo", tag: "Premium · Ink Network", desc: "Identidad oscura y premium. Booking online y galería de artistas.", img: "jukaa", url: "https://jukaatattoo.rodd.es" },
  { name: "Ink Madrid", tag: "Urban · Ink Network", desc: "Estilo urbano, orientado a conversión con CTA de booking prominente.", img: "inkmadrid", url: "https://inkmadrid.rodd.es" },
  { name: "Ink BCN", tag: "Minimalista · Ink Network", desc: "Estética minimalista barcelonesa. Layout limpio y alta legibilidad.", img: "inkbcn", url: "https://inkbcn.rodd.es" },
  { name: "Alto Foco Studio", tag: "Agencia · Lead gen IA", desc: "Plataforma minimalista con IA que captura leads cualificados.", img: "altofoco", url: "https://altofoco.rodd.es" },
  { name: "Vortex Immersive", tag: "UX lab · WebGL", desc: "Experimento 3D interactivo con WPO extremo para 60fps fluidos.", img: "vortex", url: "https://vortex.rodd.es" },
  { name: "La Óptica Online", tag: "E-commerce · CRO", desc: "Prototipo e-commerce orientado a conversión. Checkout optimizado.", img: "laoptica", url: "https://laopticaonline.rodd.es" },
];

// ===== Trayectoria de combate (experiencia real) =====
export const EXPERIENCE = [
  { role: "AI Product Designer & Automation Consultant", org: "Proyectos propios / Freelance · Barcelona · Remoto",
    when: "Sep 2024 — hoy", now: true,
    desc: "Diseño producto digital e implanto flujos de IA aplicada para clientes propios y proyectos personales, del research a la puesta en producción.",
    points: [
      "Diseñé y construí AEM Planner, app web PWA offline-first para la wedding planner Algo Entre Manos (3 personas, 12 bodas al año): panel operativo, portal privado de la pareja, plano de mesas interactivo, generador de contratos y presupuesto por plazos. Reduje el peso de datos un 96 % (3,76 MB → 0,13 MB) y validé zonas táctiles ≥44×44 px con auditoría automatizada en 3 breakpoints.",
      "Publiqué Rodd.es, biblioteca open source multilingüe (7 idiomas nativos) de 287 recursos web: efectos, shaders WebGL, componentes React y escenas 3D con live preview. Research de competencia (Shadcn, Motion.dev, React Bits), arquitectura de 6 categorías y lanzamiento en Vercel.",
      "Lancé ZODI, producto IA en producción (PWA): 17 tipos de lectura, 4 tonos de respuesta, modelo freemium y comunidad. Stack: Botpress + Make + OpenAI + WordPress; UX writing propio y arquitectura conversacional.",
      "Dirigí Dedícalo Play, juego musical multijugador en tiempo real (React + Supabase + GenAI): UX, branding, mecánicas de juego y lanzamiento end-to-end.",
      "Fundé Invitoo como founder único de wedding-tech con IA: invitaciones digitales, RSVP automatizado, canciones generadas con IA (Suno) y publicación web.",
      "Desplegué 8+ sitios de la red rodd.es para experimentar con IA generativa, CRO, WPO y arquitectura multisite.",
    ],
    tags: ["Product Design", "Design Systems", "AI Agents", "Make · n8n", "React"] },
  { role: "Gestor de Cobros Empresas +Orange", org: "Abai · Cliente Orange Empresas · Barcelona · rol simultáneo",
    when: "2024 — hoy", now: true,
    desc: "Gestión de cartera B2B para empresas +Orange: seguimiento de deuda, incidencias, acuerdos de pago y coordinación operativa con criterio de negocio, datos y automatizaciones ligeras.",
    points: [
      "Gestiono cartera corporativa B2B con trazabilidad de incidencias y acuerdos de pago con clientes enterprise.",
      "Automatizo reporting y seguimiento con Excel avanzado, Google Workspace y Notion para reducir tiempos operativos.",
    ],
    tags: ["Cobros B2B", "Orange Empresas", "Excel", "Operaciones"] },
  { role: "Coordinador Operativo Nacional", org: "Garden España · Barcelona", when: "2022 — 2024",
    desc: "Coordinación operativa en Garden España: seguimiento de incidencias, comunicación entre equipos, organización de procesos y mejora de trazabilidad con herramientas digitales.",
    points: [
      "Coordiné operaciones de una red nacional de tiendas: incidencias, logística, documentación y comunicación entre áreas.",
      "Digitalicé protocolos internos con herramientas colaborativas, mejorando la trazabilidad y la estandarización.",
    ],
    tags: ["Team Leadership", "Digital Transformation", "Agile"] },
  { role: "Senior Enterprise Account Manager", org: "Movistar Empresas (Telefónica) · Santiago, Chile", when: "2008 — 2019",
    desc: "Gestión de cartera de 80+ cuentas corporativas de alto valor. Retención de clientes VIP, negociación de contratos enterprise y diseño de estrategias de fidelización a largo plazo.",
    points: [
      "Gestioné una cartera de más de 80 cuentas corporativas enterprise: retención de clientes VIP, negociación de contratos y fidelización a largo plazo.",
      "Es la base actual de mi business acumen y de mi trato con stakeholders enterprise, que hoy aplico diseñando productos B2B con IA.",
    ],
    tags: ["Enterprise Sales", "KAM", "B2B Strategy", "Customer Retention"] },
];

// ===== Impacto clave (CV) =====
export const IMPACT = [
  { v: "287", l: "recursos open source publicados en Rodd.es", s: "7 idiomas nativos" },
  { v: "−96%", l: "peso de datos en AEM Planner", s: "3,76 MB → 0,13 MB" },
  { v: "27", l: "nodos n8n en Just Enjoy", s: "TFM calificado 10/10" },
  { v: "+80", l: "cuentas enterprise B2B gestionadas", s: "Movistar / Telefónica" },
];

// ===== Formación (cámara de gravedad) =====
export const EDUCATION: { title: string; org: string; when: string; state: string; desc: string; links?: [string, string][] }[] = [
  { title: "Máster en Agentes de IA e Hiperautomatización", org: "EBIS Business Techschool · Barcelona",
    when: "Ago. 2026", state: "Finalizado",
    desc: "TFM sobre hiperautomatización con agentes IA y examen final del CoE IA. Certificado oficial en blockchain pública Polygon (ref. Y1D458ZGS2).",
    links: [["Certificado (PDF)", `${SITE}/assets/legacy/Certificado%20EBIS%20IA.pdf`], ["Verificar en blockchain", "https://polygonscan.com/tx/0x240e0561b003e8095fec82147e41b091cfc064b9e8b77a3cd2f864b6b5b54274"]] },
  { title: "Especialización en IA Generativa", org: "UDIA (Universidad de IA)", when: "2025 — 2026", state: "En curso",
    desc: "Prompt engineering avanzado, fine-tuning de modelos y producción de activos digitales con herramientas generativas de última generación." },
  { title: "Bootcamp UX/UI Design — Professional Track", org: "Neoland Madrid", when: "2024", state: "Finalizado",
    desc: "Design Thinking, User Research, Figma, Design Systems, Agile UX y Lean UX. 600+ horas de práctica intensiva con proyectos reales.",
    links: [["Certificado (PDF)", `${SITE}/assets/legacy/Neoland.pdf`]] },
  { title: "Diseño Web Multimedia y Marketing Digital", org: "CIPSA · Barcelona", when: "2020 — 2022", state: "Finalizado",
    desc: "Front-end development, HTML/CSS/JS, WordPress, Digital Marketing, SEO/SEM y fundamentos de UX aplicados a negocios digitales." },
  { title: "Técnico en Administración Financiera", org: "Duoc UC · Santiago, Chile", when: "2014 — 2016", state: "Finalizado",
    desc: "Título Técnico de Nivel Superior. Contabilidad, gestión financiera, análisis de estados financieros y administración de operaciones. Base de business acumen que aplico hoy diseñando producto B2B con IA.",
    links: [["Certificado (PDF)", `${SITE}/assets/legacy/Duoc.pdf`]] },
];

// ===== Referencias verificadas (reales) =====
export const REFERENCES = [
  { text: "Mientras todos entregaban lo mínimo, él pulía cada detalle como si fuera a salir en producción al día siguiente. Tiene algo distinto que es difícil de explicar — es criterio real.",
    who: "L.D.", role: "Compañero · Programa de Diseño UX/UI" },
  { text: "Me presentó el proyecto con datos y retorno potencial — no con sensaciones. En tres meses conseguimos más leads cualificados online que en todo el año anterior combinado.",
    who: "C.H.", role: "Director · Despacho Profesional" },
  { text: "Escucha de verdad, no impone. El resultado fue exactamente lo que necesitábamos. Y siguió disponible para iteraciones sin dramas ni costes extras.",
    who: "C.A.", role: "Fundadora · Proyecto e-commerce" },
];

// ===== Contacto real =====
export const CONTACT = {
  email: "rodrigo.negrete.aros@gmail.com",
  phone: "+34 653 567 610",
  whatsapp: "34653567610",
  linkedin: "https://www.linkedin.com/in/rodrigonegretearos/",
  github: "https://github.com/Ronegret",
  web: "https://www.rodrigonegrete.es/",
  cv: "https://www.rodrigonegrete.es/cv/",
  waText: "Hola Rodrigo, reuní las 7 esferas del dragón en tu web y quiero hablar contigo...",
};
