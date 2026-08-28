// ---------------------------------------------------------------------------
// LIVE Launchpad · Datos 100% mockeados (sin APIs, sin websockets)
// ---------------------------------------------------------------------------

export const CREATOR = {
  handle: "valen.cocina",
  name: "Valen",
  emoji: "👩‍🍳",
  followers: 48200,
};

export const VIRAL_VIDEO = {
  caption: "Pasta cremosa de ajo en 15 min y con 4 ingredientes 🍝✨",
  hashtags: ["#receta", "#pastafacil", "#cocinatiktok"],
  sound: "sonido original - valen.cocina",
  baselineViews: 34000,
  views: 412800,
  likesStart: 84300,
  comments: 1240,
  saves: 9800,
  shares: 4100,
  watchingNow: 2847,
  multiplier: 12,
};

// ---------------------------------------------------------------------------
// Runsheet: 3 formatos concretos autogenerados desde el video viral
// ---------------------------------------------------------------------------

export type RunsheetStep = { t: string; label: string };

export type RunsheetFormat = {
  id: "qa" | "goal" | "cookalong";
  tag: string;
  emoji: string;
  title: string;
  signal: string;
  best: string;
  steps: RunsheetStep[];
};

export const RUNSHEET_FORMATS: RunsheetFormat[] = [
  {
    id: "qa",
    tag: "Q&A EN VIVO",
    emoji: "💬",
    title: "Responde las preguntas de la receta",
    signal: "438 comentarios de tu video son preguntas sin responder",
    best: "Mejor para: retención",
    steps: [
      { t: "0–2'", label: "Saluda y muestra la pasta terminada" },
      { t: "2–12'", label: "Responde el chat · fija la receta 📌" },
      { t: "12–20'", label: "Trucos y errores más comunes" },
    ],
  },
  {
    id: "goal",
    tag: "META DE REGALOS",
    emoji: "🎁",
    title: "Desbloquea el ingrediente secreto",
    signal: "Las audiencias que llegan de un viral regalan 2.1× más",
    best: "Mejor para: monetización",
    steps: [
      { t: "0–3'", label: "Anuncia la meta: 500 Rosas 🌹" },
      { t: "3–15'", label: "Cocina y agradece cada regalo por nombre" },
      { t: "15–20'", label: "Revela el ingrediente secreto 🤫" },
    ],
  },
  {
    id: "cookalong",
    tag: "COOK-ALONG EXPRESS",
    emoji: "🍳",
    title: "Cocínala en vivo con tu audiencia",
    signal: "Los cook-along duplican el tiempo de visita promedio",
    best: "Mejor para: watch-time",
    steps: [
      { t: "0–2'", label: "Ingredientes en pantalla (fíjalos)" },
      { t: "2–15'", label: "Paso a paso en tiempo real" },
      { t: "15–20'", label: "Prueba final + reta a otro chef (PK)" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Audience Bridge
// ---------------------------------------------------------------------------

export const BRIDGE_PHASES = [
  "Buscando a quienes reaccionaron a tu video…",
  "Priorizando fans con afinidad a cocina…",
  "Enviando el aviso «está EN VIVO ahora»…",
  "Reservando tu sala…",
];

export const BRIDGE_TARGET = 1847;

// Avatares de audiencia que "vuelan" hacia la sala
export const BRIDGE_AVATARS = ["🧑‍🍳", "😍", "🍜", "🔥", "🐱", "💖", "🥑", "✨"];

// ---------------------------------------------------------------------------
// LIVE · guion de chat preprogramado (bucle) + cues del Copilot
// ---------------------------------------------------------------------------

export type ChatEvent = {
  at: number; // segundos desde el inicio del LIVE (dentro del bucle)
  kind: "chat" | "gift" | "join";
  user: string;
  avatar: string;
  hue: number;
  text?: string;
  gift?: { name: string; emoji: string; count: number; diamonds: number };
};

export const CHAT_SCRIPT: ChatEvent[] = [
  { at: 1, kind: "join", user: "sofi.badilla", avatar: "😄", hue: 280 },
  { at: 1.6, kind: "chat", user: "sofi.badilla", avatar: "😄", hue: 280, text: "llegué del video de la pasta 🍝🍝" },
  { at: 2.4, kind: "join", user: "el_tomi", avatar: "🔥", hue: 20 },
  { at: 3, kind: "chat", user: "camigrl", avatar: "💖", hue: 330, text: "RECETA PORFAVOR 🙏" },
  { at: 3.8, kind: "chat", user: "el_tomi", avatar: "🔥", hue: 20, text: "la receta completa porfa!!" },
  { at: 4.6, kind: "chat", user: "nico.eats", avatar: "🥑", hue: 140, text: "receta receta receta" },
  { at: 5.4, kind: "chat", user: "pau.rdz", avatar: "✨", hue: 200, text: "vengo del viral 😍 qué crema usaste?" },
  { at: 8, kind: "join", user: "lauta.mx", avatar: "🦁", hue: 45 },
  { at: 9.5, kind: "gift", user: "lauta.mx", avatar: "🦁", hue: 45, gift: { name: "Rosa", emoji: "🌹", count: 5, diamonds: 5 } },
  { at: 11, kind: "chat", user: "sofi.badilla", avatar: "😄", hue: 280, text: "se ve increíble 😭" },
  { at: 12.5, kind: "chat", user: "ferchef", avatar: "🧑‍🍳", hue: 100, text: "buen tip el del agua de cocción 👏" },
  { at: 15, kind: "chat", user: "maria.fit", avatar: "🐱", hue: 170, text: "¿se puede hacer sin crema? 🤔" },
  { at: 17, kind: "chat", user: "camigrl", avatar: "💖", hue: 330, text: "jajaja el gato atrás 😂" },
  { at: 19, kind: "gift", user: "rosa.vlc", avatar: "🌺", hue: 300, gift: { name: "Dona", emoji: "🍩", count: 2, diamonds: 60 } },
  { at: 21, kind: "join", user: "diego_af", avatar: "🎧", hue: 220 },
  { at: 22, kind: "chat", user: "diego_af", avatar: "🎧", hue: 220, text: "somos como 3 mil acá adentro 😳" },
  { at: 24, kind: "chat", user: "nico.eats", avatar: "🥑", hue: 140, text: "cuánto parmesano le pusiste?" },
  { at: 26.5, kind: "gift", user: "el_tomi", avatar: "🔥", hue: 20, gift: { name: "León", emoji: "🦁", count: 1, diamonds: 400 } },
  { at: 28.5, kind: "chat", user: "pau.rdz", avatar: "✨", hue: 200, text: "EL LEÓN 😱😱😱" },
  { at: 30, kind: "chat", user: "ferchef", avatar: "🧑‍🍳", hue: 100, text: "primera vez que la veo en vivo, un 10" },
  { at: 33, kind: "join", user: "vale.snz", avatar: "🌈", hue: 260 },
  { at: 34, kind: "chat", user: "vale.snz", avatar: "🌈", hue: 260, text: "me trajo la notificación 😍" },
  { at: 36, kind: "chat", user: "maria.fit", avatar: "🐱", hue: 170, text: "haz la versión picante 🌶️" },
  { at: 38.5, kind: "gift", user: "sofi.badilla", avatar: "😄", hue: 280, gift: { name: "Rosa", emoji: "🌹", count: 12, diamonds: 12 } },
  { at: 41, kind: "chat", user: "diego_af", avatar: "🎧", hue: 220, text: "quedé con hambre, ya vuelvo 🏃" },
  { at: 43, kind: "chat", user: "camigrl", avatar: "💖", hue: 330, text: "sigue así!! está buenísimo el live" },
];

export const CHAT_LOOP_SECONDS = 46;

export type CopilotCue = {
  at: number;
  id: "pin" | "thanks" | "question" | "goal" | "welcome";
  icon: string;
  title: string;
  detail: string;
  action: string;
};

export const COPILOT_CUES: CopilotCue[] = [
  {
    at: 6.5,
    id: "pin",
    icon: "📌",
    title: "El chat pide la receta",
    detail: "43 mensajes en 20 s piden la receta. Fíjala para que nadie la pierda.",
    action: "Fijar receta",
  },
  {
    at: 11.5,
    id: "thanks",
    icon: "🌹",
    title: "Regalo recibido",
    detail: "@lauta.mx envió 5 Rosas. Agradécele por su nombre, aumenta 3× la recompra.",
    action: "Agradecer a @lauta.mx",
  },
  {
    at: 16.5,
    id: "question",
    icon: "❓",
    title: "Pregunta destacada",
    detail: "@maria.fit pregunta: «¿se puede hacer sin crema?». Respóndela en voz alta.",
    action: "Mostrar pregunta",
  },
  {
    at: 28,
    id: "goal",
    icon: "🎯",
    title: "Pico de sala: +2.5K dentro",
    detail: "Es el mejor momento para anunciar tu meta de 500 Rosas 🌹.",
    action: "Anunciar meta",
  },
  {
    at: 35.5,
    id: "welcome",
    icon: "👋",
    title: "Ola de recién llegados",
    detail: "Están entrando ~300 personas desde tu video. Salúdalas y preséntate.",
    action: "Saludar a los nuevos",
  },
];

// Respuestas del creador que dispara cada acción del Copilot
export const COPILOT_ACTIONS: Record<CopilotCue["id"], { chat?: string; pin?: string }> = {
  pin: { pin: "📌 RECETA: 200 g pasta · 3 dientes de ajo · 200 ml crema · parmesano · perejil" },
  thanks: { chat: "¡@lauta.mx gracias por las 5 rosas! 🌹🙏 te leo con cariño" },
  question: { chat: "@maria.fit ¡sí! cámbiala por leche evaporada, queda igual de cremosa 😉" },
  goal: { chat: "🎯 META: si llegamos a 500 🌹 revelo el ingrediente secreto 🤫" },
  welcome: { chat: "¡Bienvenidos los que llegan del video de la pasta! 🍝 soy Valen 👋" },
};

export const LIVE_START_VIEWERS = 1847;
export const GIFT_GOAL = 500;
