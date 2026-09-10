// ---------------------------------------------------------------------------
// LIVE Launchpad · tipos compartidos de la capa "TikTokSDK"
// Todo esto describe la forma de los datos mockeados — nada aquí llama a una
// API real ni a una base de datos. Ver `lib/tiktok-sdk/index.ts` para el
// adaptador que expone estos tipos con latencia de red simulada.
// ---------------------------------------------------------------------------

export type VerticalId = "food";

export type Creator = {
  handle: string;
  name: string;
  emoji: string;
  followers: number;
};

export type ViralVideo = {
  caption: string;
  hashtags: string[];
  sound: string;
  baselineViews: number;
  views: number;
  likesStart: number;
  comments: number;
  saves: number;
  shares: number;
  watchingNow: number;
  multiplier: number;
};

export type RunsheetStep = { t: string; label: string };

export type RunsheetFormat = {
  id: "qa" | "goal" | "immersive";
  tag: string;
  emoji: string;
  title: string;
  signal: string;
  best: string;
  steps: RunsheetStep[];
};

export type ChatEvent = {
  at: number; // legado: usado solo por eventos manuales (Copilot, God Mode)
  kind: "chat" | "gift" | "join";
  user: string;
  avatar: string;
  hue: number;
  text?: string;
  gift?: { name: string; emoji: string; count: number; diamonds: number };
};

export type CopilotCue = {
  at: number;
  id: "pin" | "thanks" | "question" | "goal" | "welcome";
  icon: string;
  title: string;
  detail: string;
  action: string;
};

export type CopilotActionMap = Record<CopilotCue["id"], { chat?: string; pin?: string }>;

export type ModCandidate = {
  handle: string;
  avatar: string;
  hue: number;
  meta: string;
  badge?: string;
};

export type HighlightedQuestion = { user: string; text: string };

/** Todo el contenido que muta al cambiar de vertical (Beauty, Fashion, Food, DIY, Electronics). */
export type VerticalProfile = {
  id: VerticalId;
  label: string;
  emoji: string;
  creator: Creator;
  viralVideo: ViralVideo;
  /** Texto de la notificación push simulada en el Audience Bridge. */
  bridgeTeaser: string;
  runsheetFormats: RunsheetFormat[];
  giftGoal: number;
  /** Qué se revela al llegar a la meta de regalos (ej. "el sérum secreto"). */
  giftGoalReveal: string;
  reactionLines: string[];
  questionLines: string[];
  copilotCues: CopilotCue[];
  copilotActions: CopilotActionMap;
  highlightedQuestion: HighlightedQuestion;
};

export type LiveConfig = {
  defaultStartViewers: number;
  giftGoal: number;
};

export type LiveSession = {
  sessionId: string;
  vertical: VerticalId;
  creator: Creator;
  viralVideo: ViralVideo;
  liveConfig: LiveConfig;
};

/** Canal de viewer ya "conectado" (simula un WebSocket de TikTok LIVE). */
export type ViewerChannel = {
  vertical: VerticalId;
  next: () => ChatEvent;
};
