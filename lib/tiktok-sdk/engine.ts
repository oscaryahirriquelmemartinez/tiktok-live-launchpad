// ---------------------------------------------------------------------------
// LIVE Launchpad · motor procedimental compartido entre verticales
// (usernames, avatares, catálogo de regalos, cadencia del Copilot).
// Nada de esto es específico de una vertical — lo específico vive en
// `lib/tiktok-sdk/verticals.ts`.
// ---------------------------------------------------------------------------

import type { ChatEvent, ModCandidate } from "./types";

export function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function pick<T>(arr: readonly T[]): T {
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
  { handle: "rosa.vlc", avatar: "🌺", hue: 300 },
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

const EMOJI_CHAIN_UNITS = ["🔥", "😭", "💀", "❤️", "🙏", "👏", "😍", "🤤", "✨", "😂", "🌹", "💖", "😱", "🥵", "💯"];

function buildEmojiChains(): string[] {
  const chains: string[] = [];
  for (const e of EMOJI_CHAIN_UNITS) {
    chains.push(e.repeat(2), e.repeat(3));
  }
  return chains; // 15 * 2 = 30 combinaciones
}

const GENERIC_REACTIONS = [
  "wow", "no puede ser", "estoy llorando", "primera vez que te veo en vivo",
  "me trajo la notificación", "llegué del video viral", "esto es oro",
  "se ve buenísimo", "sos una genia", "no sabía que hacías esto tan bien",
  "esto se hizo viral por algo", "justo lo que buscaba", "guardando este live",
  "screenshot a esto", "hola desde argentina 🇦🇷", "hola desde mexico 🇲🇽",
  "hola desde colombia 🇨🇴", "hola desde chile 🇨🇱", "hola desde peru 🇵🇪",
  "recién llegué que me perdí", "alguien tiene el resumen", "no manden spam porfa",
  "el chat va muy rápido jajaja", "no alcanzo a leer todo",
  "salu2 desde el trabajo escondido", "en la oficina viendo esto en secreto",
  "primera vez que la veo en vivo, un 10", "sigue así!! está buenísimo el live",
  "somos como 3 mil acá adentro 😳",
];

/**
 * Multiplica el pool base de una vertical con variantes (énfasis, mayúsculas)
 * sin perder naturalidad. Combina reacciones genéricas + reacciones y
 * preguntas específicas de la vertical + cadenas de emojis.
 */
export function buildChatMessagePool(reactionLines: string[], questionLines: string[]): string[] {
  const allReactions = [...reactionLines, ...GENERIC_REACTIONS];
  const emphasis = allReactions.map((r) => `${r}!!`);
  const shouting = allReactions
    .filter((r) => r.length <= 22 && !/[🙏😹]/u.test(r))
    .map((r) => r.toUpperCase());
  return [...allReactions, ...questionLines, ...buildEmojiChains(), ...emphasis, ...shouting];
}

// ---- Catálogo de regalos ----------------------------------------------------

type GiftKind = { name: string; emoji: string; diamondsPerUnit: number };

const GIFT_CATALOG: GiftKind[] = [
  { name: "Rosa", emoji: "🌹", diamondsPerUnit: 1 },
  { name: "Corazón", emoji: "💗", diamondsPerUnit: 5 },
  { name: "Helado", emoji: "🍦", diamondsPerUnit: 10 },
  { name: "Dona", emoji: "🍩", diamondsPerUnit: 30 },
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

/** Genera un evento de chat aleatorio a partir del pool de una vertical. */
export function generateRandomChatEvent(chatMessagePool: readonly string[]): ChatEvent {
  const identity = randomIdentity();
  const roll = Math.random();

  if (roll < 0.1) {
    return { at: 0, kind: "join", ...identity };
  }
  if (roll < 0.16) {
    return { at: 0, kind: "gift", ...identity, gift: randomGift() };
  }
  return { at: 0, kind: "chat", ...identity, text: pick(chatMessagePool) };
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

// ---------------------------------------------------------------------------
// Audience Bridge (genérico entre verticales)
// ---------------------------------------------------------------------------

export const BRIDGE_PHASES = [
  "Buscando a quienes reaccionaron a tu video…",
  "Priorizando fans con afinidad al tema…",
  "Enviando el aviso «está EN VIVO ahora»…",
  "Reservando tu sala…",
];

export const BRIDGE_TARGET = 1847;
export const BRIDGE_AVATARS = ["🧑‍🍳", "😍", "🍜", "🔥", "🐱", "💖", "🥑", "✨"];

export const MOD_CANDIDATES: ModCandidate[] = [
  {
    handle: "mod_helper",
    avatar: "🛡️",
    hue: 205,
    meta: "Te sigue hace 2 años · modera otros 3 canales",
    badge: "Recomendado",
  },
  { handle: "sofi.badilla", avatar: "😄", hue: 280, meta: "Top fan · comenta en todos tus videos" },
  { handle: "ferchef", avatar: "🧑‍🍳", hue: 100, meta: "Creador · 12K seguidores" },
  { handle: "el_tomi", avatar: "🔥", hue: 20, meta: "Envió 3 regalos este mes" },
];

// ---------------------------------------------------------------------------
// Copilot · cadencia relajada (una sugerencia cada ~17 s, la primera a los 7 s)
// ---------------------------------------------------------------------------

export const COPILOT_FIRST_DELAY_MS = 7000;
export const COPILOT_INTERVAL_MS = 17000;

export const LIVE_START_VIEWERS = 1847;

export const MAX_CHAT_NODES = 40;
