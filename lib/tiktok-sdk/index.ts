// ---------------------------------------------------------------------------
// LIVE Launchpad · "TikTokSDK" — capa de adaptador de compliance
//
// Todo el producto habla con esta capa, nunca directamente con los mocks de
// `lib/tiktok-sdk/verticals.ts` / `engine.ts`. Hoy cada método está respaldado
// por datos 100% locales con una pequeña latencia simulada (como si fuera un
// SDK real conectándose a TikTok LIVE); el día que haya un backend real, solo
// esta carpeta cambia — el resto de la app no debería enterarse.
//
// Cero acoplamiento a bases de datos reales. Nada de esto hace fetch a un
// servidor externo.
// ---------------------------------------------------------------------------

import {
  BRIDGE_AVATARS,
  BRIDGE_PHASES,
  BRIDGE_TARGET,
  buildChatMessagePool,
  COPILOT_FIRST_DELAY_MS,
  COPILOT_INTERVAL_MS,
  generateRandomChatEvent,
  generateViralSurgeGift,
  LIVE_START_VIEWERS,
  MAX_CHAT_NODES,
  MOD_CANDIDATES,
  randomInt,
} from "./engine";
import { DEFAULT_VERTICAL, getVerticalProfile, VERTICAL_LIST } from "./verticals";
import type {
  CopilotActionMap,
  CopilotCue,
  LiveSession,
  ModCandidate,
  RunsheetFormat,
  VerticalId,
  ViewerChannel,
} from "./types";

export type {
  ChatEvent,
  CopilotActionMap,
  CopilotCue,
  Creator,
  HighlightedQuestion,
  LiveConfig,
  LiveSession,
  ModCandidate,
  RunsheetFormat,
  RunsheetStep,
  VerticalId,
  VerticalProfile,
  ViewerChannel,
  ViralVideo,
} from "./types";

export { VERTICAL_LIST, DEFAULT_VERTICAL, getVerticalProfile } from "./verticals";
export {
  randomInt,
  generateViralSurgeGift,
  MAX_CHAT_NODES,
  COPILOT_FIRST_DELAY_MS,
  COPILOT_INTERVAL_MS,
  BRIDGE_AVATARS,
  BRIDGE_PHASES,
  BRIDGE_TARGET,
  MOD_CANDIDATES,
} from "./engine";

/** Simula la latencia de red de un SDK real (nunca bloquea más de ~300ms). */
function withLatency<T>(value: T, ms = 260): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let sessionSeq = 0;

export const TikTokSDK = {
  Live: {
    /** Crea una sesión de LIVE mockeada para la vertical activa. */
    async createSession(vertical: VerticalId = DEFAULT_VERTICAL): Promise<LiveSession> {
      const profile = getVerticalProfile(vertical);
      sessionSeq += 1;
      return withLatency({
        sessionId: `session_${vertical}_${sessionSeq}`,
        vertical,
        creator: profile.creator,
        viralVideo: profile.viralVideo,
        liveConfig: {
          defaultStartViewers: LIVE_START_VIEWERS,
          giftGoal: profile.giftGoal,
        },
      });
    },
  },

  Runsheet: {
    /** Los 3 formatos mockeados por defecto (fallback si la IA no responde). */
    async getDefaultFormats(vertical: VerticalId = DEFAULT_VERTICAL): Promise<RunsheetFormat[]> {
      return withLatency(getVerticalProfile(vertical).runsheetFormats, 180);
    },
  },

  Copilot: {
    async getCues(vertical: VerticalId = DEFAULT_VERTICAL): Promise<CopilotCue[]> {
      return withLatency(getVerticalProfile(vertical).copilotCues, 0);
    },
    async getActions(vertical: VerticalId = DEFAULT_VERTICAL): Promise<CopilotActionMap> {
      return withLatency(getVerticalProfile(vertical).copilotActions, 0);
    },
    async getHighlightedQuestion(vertical: VerticalId = DEFAULT_VERTICAL) {
      return withLatency(getVerticalProfile(vertical).highlightedQuestion, 0);
    },
  },

  Bridge: {
    async getConfig(vertical: VerticalId = DEFAULT_VERTICAL) {
      const profile = getVerticalProfile(vertical);
      return withLatency({
        phases: BRIDGE_PHASES,
        target: BRIDGE_TARGET,
        avatars: BRIDGE_AVATARS,
        teaser: profile.bridgeTeaser,
      });
    },
    async getModCandidates(): Promise<ModCandidate[]> {
      return withLatency(MOD_CANDIDATES, 0);
    },
  },

  Viewer: {
    /**
     * "Conecta" un canal de viewer para una vertical, como un WebSocket real:
     * el `connect()` paga la latencia inicial, pero `next()`/`surge()` no
     * agregan nada — solo generan el próximo evento del pool ya cargado en
     * memoria para esa vertical.
     */
    async connect(sessionId: string, vertical: VerticalId = DEFAULT_VERTICAL): Promise<ViewerChannel> {
      const profile = getVerticalProfile(vertical);
      const chatMessagePool = buildChatMessagePool(profile.reactionLines, profile.questionLines);
      return withLatency(
        {
          vertical,
          next: () => generateRandomChatEvent(chatMessagePool),
        },
        220
      );
    },
  },
};
