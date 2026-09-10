// ---------------------------------------------------------------------------
// LIVE Launchpad · perfil de vertical (Food & Cooking)
// Trae: creador, video viral, formatos de runsheet, jerga de chat
// hiper-específica, meta de regalos temática y contenido del Copilot.
// 100% mockeado — sin llamadas a APIs ni bases de datos reales.
// ---------------------------------------------------------------------------

import type { CopilotActionMap, CopilotCue, VerticalId, VerticalProfile } from "./types";

/** Arma los 5 cues estándar del Copilot con textos propios de la vertical. */
function buildCopilotCues(opts: {
  pinDetail: string;
  thanksHandle: string;
  questionUser: string;
  questionDetail: string;
  goalDetail: string;
  welcomeDetail: string;
}): CopilotCue[] {
  return [
    {
      at: 6.5,
      id: "pin",
      icon: "📌",
      title: "El chat pide más detalles",
      detail: opts.pinDetail,
      action: "Fijar detalles",
    },
    {
      at: 11.5,
      id: "thanks",
      icon: "🌹",
      title: "Regalo recibido",
      detail: `@${opts.thanksHandle} envió 5 Rosas. Agradécele por su nombre, aumenta 3× la recompra.`,
      action: `Agradecer a @${opts.thanksHandle}`,
    },
    {
      at: 16.5,
      id: "question",
      icon: "❓",
      title: "Pregunta destacada",
      detail: opts.questionDetail,
      action: "Mostrar pregunta",
    },
    {
      at: 28,
      id: "goal",
      icon: "🎯",
      title: "Pico de sala: +2.5K dentro",
      detail: opts.goalDetail,
      action: "Anunciar meta",
    },
    {
      at: 35.5,
      id: "welcome",
      icon: "👋",
      title: "Ola de recién llegados",
      detail: opts.welcomeDetail,
      action: "Saludar a los nuevos",
    },
  ];
}

function buildCopilotActions(opts: {
  pin: string;
  thanksHandle: string;
  questionReply: string;
  goalChat: string;
  welcomeChat: string;
}): CopilotActionMap {
  return {
    pin: { pin: opts.pin },
    thanks: { chat: `¡@${opts.thanksHandle} gracias por las 5 rosas! 🌹🙏 te leo con cariño` },
    question: { chat: opts.questionReply },
    goal: { chat: opts.goalChat },
    welcome: { chat: opts.welcomeChat },
  };
}

// ---------------------------------------------------------------------------
// Food & Cooking
// ---------------------------------------------------------------------------

const FOOD: VerticalProfile = {
  id: "food",
  label: "Food & Cooking",
  emoji: "🍝",
  creator: { handle: "valen.cocina", name: "Valen", emoji: "👩‍🍳", followers: 48200 },
  viralVideo: {
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
  },
  bridgeTeaser: "La pasta del video que acabas de ver… ¡en vivo! 🍝",
  runsheetFormats: [
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
      id: "immersive",
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
  ],
  giftGoal: 500,
  giftGoalReveal: "el ingrediente secreto",
  reactionLines: [
    "que rico se ve", "necesito esa receta", "esto es oro", "en serio esto sale tan rico?",
    "hambre a las 3am por tu culpa", "esto hay que intentarlo", "dónde compraste esa olla",
    "el gato roba cámara 😹", "la crema se ve perfecta", "yo también uso ajo así",
    "cuánto cuesta hacerla", "grande valen", "se me hace agua la boca",
    "esto necesita más ajo", "yo le pondría más queso", "la textura se ve perfecta",
  ],
  questionLines: [
    "¿se puede hacer sin crema?", "¿cuánto tiempo se cocina la pasta?",
    "¿qué tipo de queso usaste?", "¿esto rinde para cuántas personas?",
    "¿se puede congelar?", "¿sirve con otra pasta?", "¿cuánto ajo le pusiste en total?",
    "¿se puede hacer vegano?", "¿qué marca de crema usas?", "¿el parmesano es necesario?",
    "¿se puede hacer con pasta integral?", "¿puedo hacerlo sin gluten?",
  ],
  highlightedQuestion: { user: "maria.fit", text: "¿se puede hacer sin crema? 🤔" },
  copilotCues: buildCopilotCues({
    pinDetail: "43 mensajes en 20 s piden la receta. Fíjala para que nadie la pierda.",
    thanksHandle: "lauta.mx",
    questionUser: "maria.fit",
    questionDetail: "@maria.fit pregunta: «¿se puede hacer sin crema?». Respóndela en voz alta.",
    goalDetail: "Es el mejor momento para anunciar tu meta de 500 Rosas 🌹.",
    welcomeDetail: "Están entrando ~300 personas desde tu video. Salúdalas y preséntate.",
  }),
  copilotActions: buildCopilotActions({
    pin: "📌 RECETA: 200 g pasta · 3 dientes de ajo · 200 ml crema · parmesano · perejil",
    thanksHandle: "lauta.mx",
    questionReply: "@maria.fit ¡sí! cámbiala por leche evaporada, queda igual de cremosa 😉",
    goalChat: "🎯 META: si llegamos a 500 🌹 revelo el ingrediente secreto 🤫",
    welcomeChat: "¡Bienvenidos los que llegan del video de la pasta! 🍝 soy Valen 👋",
  }),
};

export const VERTICAL_PROFILES: Record<VerticalId, VerticalProfile> = {
  food: FOOD,
};

export const VERTICAL_LIST: VerticalProfile[] = [FOOD];

export const DEFAULT_VERTICAL: VerticalId = "food";

export function getVerticalProfile(vertical: VerticalId): VerticalProfile {
  return VERTICAL_PROFILES[vertical] ?? VERTICAL_PROFILES[DEFAULT_VERTICAL];
}
