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
// LIVE · motor de chat orgánico (100% procedimental, sin guion ni websockets)
// ---------------------------------------------------------------------------
//
// En vez de un guion fijo en bucle (que se sentía robótico y repetitivo),
// generamos eventos de chat al vuelo combinando: un pool masivo (150-200+)
// de mensajes diversos, un generador de usernames creíbles, un puñado de
// "regulares" recurrentes para dar sensación de continuidad, y un catálogo
// de regalos con probabilidades realistas (muchas rosas, pocos regalos caros).
// Ver `useOrganicChat` en lib/hooks.ts para la cadencia estocástica.

export type ChatEvent = {
  at: number; // legado: usado solo por eventos manuales (Copilot, God Mode)
  kind: "chat" | "gift" | "join";
  user: string;
  avatar: string;
  hue: number;
  text?: string;
  gift?: { name: string; emoji: string; count: number; diamonds: number };
};

export function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

// ---- Usernames -------------------------------------------------------------

const USERNAME_STEMS = [
  "user", "maria", "juan", "valen", "santi", "camila", "nico", "sofi", "diego",
  "pau", "fer", "rosa", "lauta", "mica", "tomas", "flor", "male", "coty",
  "bruno", "renzo", "jose", "ana", "gaby", "leo", "isa", "kevin", "yani",
  "naty", "rodri", "juanperez", "carla", "emi", "bel", "dani", "cris", "fabi",
  "ceci", "lucia", "martina", "facu", "vale", "ivan", "checo", "pame", "aless",
];

const USERNAME_SUFFIXES = [
  "", "", "_", ".gzz", ".rdz", ".ok", "cocina", "fit", "eats", "vlc", "_af",
  "snz", ".oficial", "_tv", "_mx", "_ar", "_cl", "_co", "22", "23",
];

/** Genera un handle creíble ("user84729", "maria.gzz", "juanperez_23"...). */
export function generateUsername(): string {
  const stem = pick(USERNAME_STEMS);
  const suffix = pick(USERNAME_SUFFIXES);
  const withNumber = Math.random() > 0.45;
  return `${stem}${suffix}${withNumber ? randomInt(1, 99999) : ""}`;
}

export const AUDIENCE_AVATARS = [
  "😄", "🔥", "💖", "🥑", "✨", "🦁", "🐱", "🌈", "🎧", "🌺", "🧑‍🍳", "🤩",
  "😎", "🥳", "👀", "🙌", "🌻", "🍀", "⭐", "🦋", "😻", "🐸", "🍕", "🎈",
];

/** Espectadores "regulares" que reaparecen para dar sensación de continuidad. */
type RegularViewer = { handle: string; avatar: string; hue: number };
const REGULAR_VIEWERS: RegularViewer[] = [
  { handle: "sofi.badilla", avatar: "😄", hue: 280 },
  { handle: "el_tomi", avatar: "🔥", hue: 20 },
  { handle: "camigrl", avatar: "💖", hue: 330 },
  { handle: "nico.eats", avatar: "🥑", hue: 140 },
  { handle: "pau.rdz", avatar: "✨", hue: 200 },
  { handle: "lauta.mx", avatar: "🦁", hue: 45 },
  { handle: "ferchef", avatar: "🧑‍🍳", hue: 100 },
  { handle: "maria.fit", avatar: "🐱", hue: 170 },
  { handle: "rosa.vlc", avatar: "�", hue: 300 },
  { handle: "diego_af", avatar: "🎧", hue: 220 },
  { handle: "vale.snz", avatar: "🌈", hue: 260 },
];

/** Devuelve {user, avatar, hue}: 40% un regular recurrente, 60% alguien nuevo. */
function randomIdentity(): { user: string; avatar: string; hue: number } {
  if (Math.random() < 0.4) {
    const r = pick(REGULAR_VIEWERS);
    return { user: r.handle, avatar: r.avatar, hue: r.hue };
  }
  return { user: generateUsername(), avatar: pick(AUDIENCE_AVATARS), hue: randomInt(0, 359) };
}

// ---- Pool masivo de mensajes (150-200+) ------------------------------------

const REACTION_LINES = [
  "wow", "no puede ser", "que rico se ve", "estoy llorando", "necesito esa receta",
  "primera vez que te veo en vivo", "me trajo la notificación", "llegué del video viral",
  "esto es oro", "en serio esto sale tan rico?", "se ve buenísimo", "hambre a las 3am por tu culpa",
  "esto hay que intentarlo", "sos una genia", "dónde compraste esa olla", "el gato roba cámara �",
  "la crema se ve perfecta", "yo también uso ajo así", "cuánto cuesta hacerla", "grande valen",
  "no sabía que cocinabas tan bien", "esto se hizo viral por algo", "justo lo que buscaba",
  "guardando este live", "screenshot a la receta", "esto es mejor que un restaurante",
  "hola desde argentina 🇦🇷", "hola desde mexico �🇽", "hola desde colombia 🇨🇴", "hola desde chile 🇨🇱",
  "hola desde peru 🇵🇪", "se me hace agua la boca", "esto necesita más ajo", "yo le pondría más queso",
  "la textura se ve perfecta", "cuánto rinde la receta", "sirve para cuántas personas",
  "puedo usar otra pasta", "esto es más facil de lo que pensé", "creo que lo voy a intentar hoy",
  "recién llegué que me perdí", "alguien tiene el resumen", "no manden spam porfa",
  "el chat va muy rápido jajaja", "no alcanzo a leer todo", "salu2 desde el trabajo escondido",
  "en la oficina viendo esto en secreto", "esto debería ser ilegal de rico", "receta porfavor 🙏",
  "la receta completa porfa!!", "receta receta receta", "vengo del viral 😍 qué crema usaste?",
  "buen tip el del agua de cocción 👏", "jajaja el gato atrás 😂", "somos como 3 mil acá adentro 😳",
  "cuánto parmesano le pusiste?", "primera vez que la veo en vivo, un 10", "me trajo la notificación 😍",
  "haz la versión picante 🌶️", "quedé con hambre, ya vuelvo 🏃", "sigue así!! está buenísimo el live",
];

const QUESTION_LINES = [
  "¿se puede hacer sin crema?", "¿cuánto tiempo se cocina la pasta?", "¿qué tipo de queso usaste?",
  "¿esto rinde para cuántas personas?", "¿se puede congelar?", "¿sirve con otra pasta?",
  "¿cuánto ajo le pusiste en total?", "¿se puede hacer vegano?", "¿qué marca de crema usas?",
  "¿esto es para cuántos minutos de cocción?", "¿puedo usar leche en vez de crema?",
  "¿el parmesano es necesario?", "¿a qué hora empezaste a cocinar?", "¿vas a subir la receta escrita?",
  "¿cuál es el secreto de la textura?", "¿se puede hacer con pasta integral?",
  "¿cuántas calorías tiene?", "¿puedo hacerlo sin gluten?", "¿qué perejil usaste, fresco o seco?",
  "¿vendes cursos de cocina?",
];

const EMOJI_CHAIN_UNITS = ["🔥", "😭", "💀", "❤️", "🙏", "👏", "😍", "🤤", "✨", "😂", "🌹", "💖", "😱", "🥵", "💯"];

function buildEmojiChains(): string[] {
  const chains: string[] = [];
  for (const e of EMOJI_CHAIN_UNITS) {
    chains.push(e.repeat(2), e.repeat(3));
  }
  return chains; // 15 * 2 = 30 combinaciones
}

/** Multiplica el pool base con variantes (mayúsculas, énfasis) sin perder naturalidad. */
function buildChatMessagePool(): string[] {
  const emphasis = REACTION_LINES.map((r) => `${r}!!`);
  const shouting = REACTION_LINES.filter((r) => r.length <= 22 && !/[🙏😹���]/u.test(r)).map((r) =>
    r.toUpperCase()
  );
  return [...REACTION_LINES, ...QUESTION_LINES, ...buildEmojiChains(), ...emphasis, ...shouting];
}

/** Pool masivo de mensajes de chat: 150-200+ variantes generadas programáticamente. */
export const CHAT_MESSAGE_POOL: string[] = buildChatMessagePool();

// ---- Catálogo de regalos ----------------------------------------------------

type GiftKind = { name: string; emoji: string; diamondsPerUnit: number };

const GIFT_CATALOG: GiftKind[] = [
  { name: "Rosa", emoji: "🌹", diamondsPerUnit: 1 },
  { name: "Corazón", emoji: "💗", diamondsPerUnit: 5 },
  { name: "Helado", emoji: "🍦", diamondsPerUnit: 10 },
  { name: "Dona", emoji: "�", diamondsPerUnit: 30 },
  { name: "León", emoji: "🦁", diamondsPerUnit: 400 },
  { name: "Cohete", emoji: "🚀", diamondsPerUnit: 500 },
  { name: "Universo", emoji: "🌌", diamondsPerUnit: 1000 },
];

/** Regalos de alto valor reservados para momentos especiales (God Mode: Viral Surge). */
const HIGH_VALUE_GIFTS = GIFT_CATALOG.filter((g) => g.diamondsPerUnit >= 400);

function randomGift(): { name: string; emoji: string; count: number; diamonds: number } {
  // 85% rosas esporádicas de bajo valor, 15% algo del catálogo variado.
  if (Math.random() < 0.85) {
    const count = randomInt(1, 20);
    return { name: "Rosa", emoji: "🌹", count, diamonds: count };
  }
  const g = pick(GIFT_CATALOG.slice(1));
  const count = randomInt(1, 3);
  return { name: g.name, emoji: g.emoji, count, diamonds: g.diamondsPerUnit * count };
}

/** Genera un evento de chat aleatorio: mayormente comentarios, algo de joins, poco de regalos. */
export function generateRandomChatEvent(): ChatEvent {
  const identity = randomIdentity();
  const roll = Math.random();

  if (roll < 0.1) {
    return { at: 0, kind: "join", ...identity };
  }
  if (roll < 0.16) {
    return { at: 0, kind: "gift", ...identity, gift: randomGift() };
  }
  return { at: 0, kind: "chat", ...identity, text: pick(CHAT_MESSAGE_POOL) };
}

/** Regalo de alto valor para el "Viral Surge" de God Mode. */
export function generateViralSurgeGift(): ChatEvent {
  const identity = randomIdentity();
  const g = pick(HIGH_VALUE_GIFTS);
  return {
    at: 0,
    kind: "gift",
    ...identity,
    gift: { name: g.name, emoji: g.emoji, count: 1, diamonds: g.diamondsPerUnit },
  };
}

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

// ---------------------------------------------------------------------------
// Copilot · cadencia relajada (una sugerencia cada ~17 s, la primera a los 7 s)
// ---------------------------------------------------------------------------

export const COPILOT_FIRST_DELAY_MS = 7000;
export const COPILOT_INTERVAL_MS = 17000;

// ---------------------------------------------------------------------------
// Moderador de confianza · seguidores candidatos (Waiting Room)
// ---------------------------------------------------------------------------

export type ModCandidate = {
  handle: string;
  avatar: string;
  hue: number;
  meta: string;
  badge?: string;
};

export const MOD_CANDIDATES: ModCandidate[] = [
  {
    handle: "mod_helper",
    avatar: "🛡️",
    hue: 205,
    meta: "Te sigue hace 2 años · modera otros 3 canales",
    badge: "Recomendado",
  },
  {
    handle: "sofi.badilla",
    avatar: "😄",
    hue: 280,
    meta: "Top fan · comenta en todos tus videos",
  },
  {
    handle: "ferchef",
    avatar: "🧑‍🍳",
    hue: 100,
    meta: "Creador de cocina · 12K seguidores",
  },
  {
    handle: "el_tomi",
    avatar: "🔥",
    hue: 20,
    meta: "Envió 3 regalos este mes",
  },
];
