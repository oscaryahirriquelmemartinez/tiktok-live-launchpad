// ---------------------------------------------------------------------------
// LIVE Launchpad · perfiles de vertical (Beauty, Fashion, Food, DIY, Electronics)
// Cada perfil trae: creador, video viral, formatos de runsheet, jerga de chat
// hiper-específica, meta de regalos temática y contenido del Copilot.
// 100% mockeado — sin llamadas a APIs ni bases de datos reales.
// ---------------------------------------------------------------------------

import type { CopilotActionMap, CopilotCue, VerticalId, VerticalProfile } from "./types";

/** Arma los 5 cues estándar del Copilot con textos propios de cada vertical. */
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
// 1) Beauty & Skincare
// ---------------------------------------------------------------------------

const BEAUTY: VerticalProfile = {
  id: "beauty",
  label: "Beauty & Skincare",
  emoji: "💄",
  creator: { handle: "cami.skin", name: "Cami", emoji: "💄", followers: 61200 },
  viralVideo: {
    caption: "Rutina coreana de 5 pasos que cambió mi piel en 2 semanas ✨🧴",
    hashtags: ["#skincare", "#rutinacoreana", "#pielsana"],
    sound: "sonido original - cami.skin",
    baselineViews: 29000,
    views: 388400,
    likesStart: 71200,
    comments: 980,
    saves: 15200,
    shares: 5200,
    watchingNow: 2210,
    multiplier: 13,
  },
  bridgeTeaser: "Mi rutina completa, paso a paso… ¡en vivo! 🧴✨",
  runsheetFormats: [
    {
      id: "qa",
      tag: "Q&A EN VIVO",
      emoji: "💬",
      title: "Responde las preguntas de tu rutina",
      signal: "512 comentarios de tu video preguntan por productos sin responder",
      best: "Mejor para: retención",
      steps: [
        { t: "0–2'", label: "Saluda y muestra la piel del resultado" },
        { t: "2–12'", label: "Responde el chat · fija la rutina 📌" },
        { t: "12–20'", label: "Errores comunes de skincare" },
      ],
    },
    {
      id: "goal",
      tag: "META DE REGALOS",
      emoji: "🎁",
      title: "Desbloquea el sérum secreto",
      signal: "Las audiencias que llegan de un viral regalan 2.1× más",
      best: "Mejor para: monetización",
      steps: [
        { t: "0–3'", label: "Anuncia la meta: 450 Rosas 🌹" },
        { t: "3–15'", label: "Aplica la rutina y agradece cada regalo por nombre" },
        { t: "15–20'", label: "Revela el sérum secreto 🤫" },
      ],
    },
    {
      id: "immersive",
      tag: "GET READY WITH ME",
      emoji: "🧴",
      title: "Arma tu rutina en vivo con tu audiencia",
      signal: "Los GRWM en vivo duplican el tiempo de visita promedio",
      best: "Mejor para: watch-time",
      steps: [
        { t: "0–2'", label: "Productos en pantalla (fíjalos)" },
        { t: "2–15'", label: "Paso a paso en tiempo real" },
        { t: "15–20'", label: "Antes/después + reta a otra creadora (PK)" },
      ],
    },
  ],
  giftGoal: 450,
  giftGoalReveal: "el sérum secreto",
  reactionLines: [
    "esa piel brilla demasiado", "necesito ese sérum ya", "mi piel te necesita",
    "cuánto cuesta el tónico", "esto es piel de porcelana", "el glow es real",
    "hidratación nivel dios", "dónde compraste el limpiador",
    "esto sí es skincare de verdad", "mi rutina da vergüenza comparada con esta",
    "se nota que cuida su piel", "esto merece una rutina de 10 pasos",
    "el efecto glass skin es real", "mi cara pide auxilio viendo esto",
  ],
  questionLines: [
    "¿qué SPF usas de día?", "¿sirve para piel grasa?",
    "¿en qué orden se aplican los productos?", "¿esto es para piel sensible?",
    "¿el retinol se puede usar de día?", "¿cuánto tiempo hay que esperar entre pasos?",
    "¿esto sirve para el acné?", "¿qué marca es el sérum?",
    "¿puedo usarlo si tengo rosácea?", "¿vendes tu rutina en PDF?",
    "¿cada cuánto exfolias?", "¿esto es coreano o k-beauty real?",
  ],
  highlightedQuestion: { user: "maria.fit", text: "¿sirve para piel grasa? 🤔" },
  copilotCues: buildCopilotCues({
    pinDetail: "43 mensajes en 20 s piden la lista de productos. Fíjala para que nadie la pierda.",
    thanksHandle: "lauta.mx",
    questionUser: "maria.fit",
    questionDetail: "@maria.fit pregunta: «¿sirve para piel grasa?». Respóndela en voz alta.",
    goalDetail: "Es el mejor momento para anunciar tu meta de 450 Rosas 🌹.",
    welcomeDetail: "Están entrando ~300 personas desde tu video. Salúdalas y preséntate.",
  }),
  copilotActions: buildCopilotActions({
    pin: "📌 RUTINA: limpiador · tónico · sérum vitamina C · hidratante · protector solar SPF50",
    thanksHandle: "lauta.mx",
    questionReply: "@maria.fit ¡sí! usa una versión gel del hidratante, no reseca 😉",
    goalChat: "🎯 META: si llegamos a 450 🌹 revelo el sérum secreto 🤫",
    welcomeChat: "¡Bienvenidos los que llegan del video de skincare! 🧴 soy Cami 👋",
  }),
};

// ---------------------------------------------------------------------------
// 2) Fashion & Styling
// ---------------------------------------------------------------------------

const FASHION: VerticalProfile = {
  id: "fashion",
  label: "Fashion & Styling",
  emoji: "👗",
  creator: { handle: "flor.styling", name: "Flor", emoji: "👗", followers: 54300 },
  viralVideo: {
    caption: "Transformé 1 blazer en 5 looks diferentes 🔥👠",
    hashtags: ["#outfit", "#styling", "#modatiktok"],
    sound: "sonido original - flor.styling",
    baselineViews: 27000,
    views: 356000,
    likesStart: 68300,
    comments: 1120,
    saves: 11400,
    shares: 4700,
    watchingNow: 2490,
    multiplier: 13,
  },
  bridgeTeaser: "5 looks con una sola prenda… ¡armados en vivo! 👗✨",
  runsheetFormats: [
    {
      id: "qa",
      tag: "Q&A EN VIVO",
      emoji: "💬",
      title: "Responde qué marca es cada prenda",
      signal: "389 comentarios de tu video preguntan de dónde es la ropa",
      best: "Mejor para: retención",
      steps: [
        { t: "0–2'", label: "Saluda y muestra el look terminado" },
        { t: "2–12'", label: "Responde el chat · fija el outfit 📌" },
        { t: "12–20'", label: "Errores comunes al combinar prendas" },
      ],
    },
    {
      id: "goal",
      tag: "META DE REGALOS",
      emoji: "🎁",
      title: "Desbloquea el outfit sorpresa",
      signal: "Las audiencias que llegan de un viral regalan 2.1× más",
      best: "Mejor para: monetización",
      steps: [
        { t: "0–3'", label: "Anuncia la meta: 480 Rosas 🌹" },
        { t: "3–15'", label: "Arma looks y agradece cada regalo por nombre" },
        { t: "15–20'", label: "Revela el outfit sorpresa 🤫" },
      ],
    },
    {
      id: "immersive",
      tag: "STYLE THIS WITH ME",
      emoji: "👠",
      title: "Pruébatelo en vivo con tu audiencia",
      signal: "Los try-on en vivo duplican el tiempo de visita promedio",
      best: "Mejor para: watch-time",
      steps: [
        { t: "0–2'", label: "Prendas en pantalla (fíjalas)" },
        { t: "2–15'", label: "Prueba de looks en tiempo real" },
        { t: "15–20'", label: "Votación final + reta a otra creadora (PK)" },
      ],
    },
  ],
  giftGoal: 480,
  giftGoalReveal: "el outfit sorpresa",
  reactionLines: [
    "ese blazer es todo", "dónde compraste esas botas", "el outfit del año",
    "necesito ese armario", "esto es alta costura de tiktok", "el styling es perfecto",
    "cuánto costó el look completo", "combinación perfecta de colores",
    "esto se ve carísimo pero no lo es", "el fit le queda increíble",
    "necesito ese blazer en mi clóset", "esto sí es tener buen ojo para la moda",
  ],
  questionLines: [
    "¿de qué marca es el blazer?", "¿dónde compraste los aretes?",
    "¿esto es talla grande friendly?", "¿cuánto costó el outfit completo?",
    "¿tienes el link de las botas?", "¿esto se puede usar de día?",
    "¿qué zapatos combinarías con esto?", "¿vendes tus looks armados?",
    "¿esto se ve bien en tallas curvy?", "¿cuál es tu tienda favorita?",
  ],
  highlightedQuestion: { user: "maria.fit", text: "¿esto es talla grande friendly? 🤔" },
  copilotCues: buildCopilotCues({
    pinDetail: "38 mensajes en 20 s piden la lista de prendas. Fíjala para que nadie la pierda.",
    thanksHandle: "lauta.mx",
    questionUser: "maria.fit",
    questionDetail: "@maria.fit pregunta: «¿esto es talla grande friendly?». Respóndela en voz alta.",
    goalDetail: "Es el mejor momento para anunciar tu meta de 480 Rosas 🌹.",
    welcomeDetail: "Están entrando ~300 personas desde tu video. Salúdalas y preséntate.",
  }),
  copilotActions: buildCopilotActions({
    pin: "📌 LOOK: blazer negro · top básico · jean recto · botines · aretes dorados",
    thanksHandle: "lauta.mx",
    questionReply: "@maria.fit ¡sí! esta marca llega hasta talla XXL 😉",
    goalChat: "🎯 META: si llegamos a 480 🌹 revelo el outfit sorpresa 🤫",
    welcomeChat: "¡Bienvenidos los que llegan del video del blazer! 👗 soy Flor 👋",
  }),
};

// ---------------------------------------------------------------------------
// 3) Food & Cooking
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

// ---------------------------------------------------------------------------
// 4) Home & DIY
// ---------------------------------------------------------------------------

const DIY: VerticalProfile = {
  id: "diy",
  label: "Home & DIY",
  emoji: "🛠️",
  creator: { handle: "nico.hazlo", name: "Nico", emoji: "🛠️", followers: 39800 },
  viralVideo: {
    caption: "Transformé un mueble viejo en 20 min con $10 🔨✨",
    hashtags: ["#diy", "#hazlotumismo", "#reciclaje"],
    sound: "sonido original - nico.hazlo",
    baselineViews: 21000,
    views: 298000,
    likesStart: 52300,
    comments: 860,
    saves: 13900,
    shares: 3900,
    watchingNow: 1980,
    multiplier: 14,
  },
  bridgeTeaser: "El paso a paso completo del mueble… ¡en vivo! 🔨",
  runsheetFormats: [
    {
      id: "qa",
      tag: "Q&A EN VIVO",
      emoji: "💬",
      title: "Responde qué materiales usaste",
      signal: "301 comentarios de tu video preguntan por los materiales",
      best: "Mejor para: retención",
      steps: [
        { t: "0–2'", label: "Saluda y muestra el mueble terminado" },
        { t: "2–12'", label: "Responde el chat · fija los materiales 📌" },
        { t: "12–20'", label: "Errores comunes al restaurar" },
      ],
    },
    {
      id: "goal",
      tag: "META DE REGALOS",
      emoji: "🎁",
      title: "Desbloquea el plano secreto",
      signal: "Las audiencias que llegan de un viral regalan 2.1× más",
      best: "Mejor para: monetización",
      steps: [
        { t: "0–3'", label: "Anuncia la meta: 420 Rosas 🌹" },
        { t: "3–15'", label: "Construye y agradece cada regalo por nombre" },
        { t: "15–20'", label: "Revela el plano secreto 🤫" },
      ],
    },
    {
      id: "immersive",
      tag: "BUILD IT LIVE",
      emoji: "🔨",
      title: "Constrúyelo en vivo con tu audiencia",
      signal: "Los build-along duplican el tiempo de visita promedio",
      best: "Mejor para: watch-time",
      steps: [
        { t: "0–2'", label: "Materiales en pantalla (fíjalos)" },
        { t: "2–15'", label: "Paso a paso en tiempo real" },
        { t: "15–20'", label: "Resultado final + reta a otro maker (PK)" },
      ],
    },
  ],
  giftGoal: 420,
  giftGoalReveal: "el plano secreto",
  reactionLines: [
    "esto es una genialidad", "con $10 hizo esto??", "necesito ese taladro",
    "el antes y después es una locura", "esto se ve profesional",
    "cuánto costó en total", "dónde compraste la pintura",
    "esto le da nueva vida a cualquier mueble", "el acabado quedó impecable",
    "necesito ese taller en mi casa", "esto es puro talento con las manos",
  ],
  questionLines: [
    "¿qué taladro usas?", "¿cuánto tiempo tardaste en total?",
    "¿sirve para principiantes?", "¿qué tipo de pintura usaste?",
    "¿necesito herramientas caras?", "¿esto lo puedo hacer sin taller?",
    "¿el plano lo compartes?", "¿cuánto costó el proyecto completo?",
    "¿qué lija usaste primero?", "¿esto resiste la intemperie?",
  ],
  highlightedQuestion: { user: "maria.fit", text: "¿sirve para principiantes? 🤔" },
  copilotCues: buildCopilotCues({
    pinDetail: "35 mensajes en 20 s piden la lista de materiales. Fíjala para que nadie la pierda.",
    thanksHandle: "lauta.mx",
    questionUser: "maria.fit",
    questionDetail: "@maria.fit pregunta: «¿sirve para principiantes?». Respóndela en voz alta.",
    goalDetail: "Es el mejor momento para anunciar tu meta de 420 Rosas 🌹.",
    welcomeDetail: "Están entrando ~300 personas desde tu video. Salúdalas y preséntate.",
  }),
  copilotActions: buildCopilotActions({
    pin: "📌 MATERIALES: lija · pintura acrílica · tornillos · taladro · barniz",
    thanksHandle: "lauta.mx",
    questionReply: "@maria.fit ¡sí! empieza con lo básico, el taladro es lo único imprescindible 😉",
    goalChat: "🎯 META: si llegamos a 420 🌹 revelo el plano secreto 🤫",
    welcomeChat: "¡Bienvenidos los que llegan del video del mueble! 🔨 soy Nico 👋",
  }),
};

// ---------------------------------------------------------------------------
// 5) Consumer Electronics
// ---------------------------------------------------------------------------

const ELECTRONICS: VerticalProfile = {
  id: "electronics",
  label: "Consumer Electronics",
  emoji: "🎧",
  creator: { handle: "seba.tech", name: "Seba", emoji: "🎧", followers: 72500 },
  viralVideo: {
    caption: "Unboxing del GPU que rompe el mercado en 2025 💻🔥",
    hashtags: ["#tech", "#unboxing", "#gaming"],
    sound: "sonido original - seba.tech",
    baselineViews: 38000,
    views: 501200,
    likesStart: 93400,
    comments: 1560,
    saves: 8700,
    shares: 6200,
    watchingNow: 3120,
    multiplier: 13,
  },
  bridgeTeaser: "El benchmark completo del GPU… ¡en vivo! 💻",
  runsheetFormats: [
    {
      id: "qa",
      tag: "Q&A EN VIVO",
      emoji: "💬",
      title: "Responde qué specs tiene",
      signal: "612 comentarios de tu video preguntan por las specs",
      best: "Mejor para: retención",
      steps: [
        { t: "0–2'", label: "Saluda y muestra el unboxing terminado" },
        { t: "2–12'", label: "Responde el chat · fija las specs 📌" },
        { t: "12–20'", label: "Errores comunes al armar un PC" },
      ],
    },
    {
      id: "goal",
      tag: "META DE REGALOS",
      emoji: "🎁",
      title: "Desbloquea el benchmark sorpresa",
      signal: "Las audiencias que llegan de un viral regalan 2.1× más",
      best: "Mejor para: monetización",
      steps: [
        { t: "0–3'", label: "Anuncia la meta: 520 Rosas 🌹" },
        { t: "3–15'", label: "Arma y agradece cada regalo por nombre" },
        { t: "15–20'", label: "Revela el benchmark sorpresa 🤫" },
      ],
    },
    {
      id: "immersive",
      tag: "BUILD & BENCH LIVE",
      emoji: "💻",
      title: "Arma el PC en vivo con tu audiencia",
      signal: "Los build-along duplican el tiempo de visita promedio",
      best: "Mejor para: watch-time",
      steps: [
        { t: "0–2'", label: "Specs en pantalla (fíjalas)" },
        { t: "2–15'", label: "Armado paso a paso en tiempo real" },
        { t: "15–20'", label: "Benchmark final + reta a otro tech creator (PK)" },
      ],
    },
  ],
  giftGoal: 520,
  giftGoalReveal: "el benchmark sorpresa",
  reactionLines: [
    "qué GPU es esa", "cuántos FPS da en 4K", "necesito esa build",
    "el precio va a doler", "esto rompe la meta actual", "cuánto consume de watts",
    "se ve una bestia", "esto es una locura de rendimiento",
    "necesito hacer upgrade ya", "esto justifica el precio",
    "los benchmarks no mienten", "esto le gana a cualquier consola",
  ],
  questionLines: [
    "¿qué GPU es esa?", "¿cuántos FPS da en 4K?", "¿cuánto consume de energía?",
    "¿es compatible con mi mother?", "¿vale la pena el upgrade?",
    "¿cuánto cuesta en tu país?", "¿corre bien con RTX on?",
    "¿hiciste benchmark de temperatura?", "¿qué fuente de poder recomiendas?",
    "¿esto sirve para edición de video?",
  ],
  highlightedQuestion: { user: "maria.fit", text: "¿vale la pena el upgrade? 🤔" },
  copilotCues: buildCopilotCues({
    pinDetail: "51 mensajes en 20 s piden las specs completas. Fíjalas para que nadie las pierda.",
    thanksHandle: "lauta.mx",
    questionUser: "maria.fit",
    questionDetail: "@maria.fit pregunta: «¿vale la pena el upgrade?». Respóndela en voz alta.",
    goalDetail: "Es el mejor momento para anunciar tu meta de 520 Rosas 🌹.",
    welcomeDetail: "Están entrando ~300 personas desde tu video. Salúdalas y preséntate.",
  }),
  copilotActions: buildCopilotActions({
    pin: "📌 SPECS: GPU RTX-class · 16GB VRAM · 320W TDP · PCIe 5.0",
    thanksHandle: "lauta.mx",
    questionReply: "@maria.fit depende de tu build actual, pero en 1440p+ el salto se nota mucho 😉",
    goalChat: "🎯 META: si llegamos a 520 🌹 revelo el benchmark sorpresa 🤫",
    welcomeChat: "¡Bienvenidos los que llegan del video del unboxing! 💻 soy Seba 👋",
  }),
};

export const VERTICAL_PROFILES: Record<VerticalId, VerticalProfile> = {
  beauty: BEAUTY,
  fashion: FASHION,
  food: FOOD,
  diy: DIY,
  electronics: ELECTRONICS,
};

export const VERTICAL_LIST: VerticalProfile[] = [BEAUTY, FASHION, FOOD, DIY, ELECTRONICS];

export const DEFAULT_VERTICAL: VerticalId = "beauty";

export function getVerticalProfile(vertical: VerticalId): VerticalProfile {
  return VERTICAL_PROFILES[vertical] ?? VERTICAL_PROFILES[DEFAULT_VERTICAL];
}
