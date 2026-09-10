# LIVE Launchpad — Flow

Two diagrams live here:

1. **Process flow** — how the app moves a creator through the five
   stages, what data each stage reads, and where the SDK adapter sits.
2. **Creator journey** — the same flow told from the creator's point of
   view (what they see, what they decide, what the system does for
   them).

Both reflect the current state of the repo, including the Phase 5
vertical SDK work. Items marked **(pending)** are designed but not yet
wired — see `DEVELOPMENT_LOG.md` Phase 5 for the gap analysis.

---

## 1. Process flow (system view)

```
                        ┌───────────────────────────────────┐
                        │   Zustand store (lib/store.ts)    │
                        │   activeVertical  (default beauty)│
                        │   moderator · mutedCategories      │
                        │   moderatorPinned                  │
                        └───────────────┬───────────────────┘
                                        │ setActiveVertical(v)
                                        │  (pending: God Mode picker)
                                        v
 ┌────────────────────────────────────────────────────────────────┐
 │            lib/tiktok-sdk/  (compliance adapter)                │
 │                                                                 │
 │  verticals.ts ── 5 VerticalProfile (beauty/fashion/food/diy/   │
 │                   electronics): creator, viralVideo, chat pool, │
 │                   giftGoal, runsheetFormats, copilotCues        │
 │                                                                 │
 │  engine.ts ────── generateUsername, randomIdentity,            │
 │                   buildChatMessagePool, randomGift,             │
 │                   generateViralSurgeGift, MAX_CHAT_NODES=40    │
 │                                                                 │
 │  index.ts ─────── TikTokSDK.Live.createSession(vertical)        │
 │                   TikTokSDK.Runsheet.getDefaultFormats(vertical)│
 │                   TikTokSDK.Copilot.getCues/getActions(vertical) │
 │                   TikTokSDK.Bridge.getConfig/getModCandidates    │
 │                   TikTokSDK.Viewer.connect(sessionId, vertical)  │
 │                   (todo con latencia simulada ~220-300ms,        │
 │                    cero fetch a backend real)                    │
 └───────────────────────────────┬────────────────────────────────┘
                                 │ LiveSession { creator, viralVideo,
                                 │   liveConfig, sessionId, vertical }
                                 v
 ┌────────────────────────────────────────────────────────────────┐
 │                     app/page.tsx                                │
 │  boot: TikTokSDK.Live.createSession()  →  session              │
 │        TikTokSDK.Runsheet.getDefaultFormats() → defaultFormats │
 │  (pending: re-crear sesión cuando activeVertical cambie,        │
 │   sin recargar la página)                                       │
 └───────────────────────────────┬────────────────────────────────┘
                                 │
   ┌─────────────────────────────┴─────────────────────────────┐
   │                    5 STAGES (AnimatePresence)              │
   │                                                           │
   │  feed ──> runsheet ──> bridge ──> live ──> summary         │
   │                                                           │
   │  cada stage recibe props derivadas del perfil activo:     │
   │   creator, viralVideo, format, giftGoal, sessionId...    │
   └─────────────────────────────┬─────────────────────────────┘
                                 │
                                 v
 ┌────────────────────────────────────────────────────────────────┐
 │  app/api/generate-runsheet/route.ts                            │
 │  POST { caption, hashtags, views, comments, multiplier,       │         │  (pending: + vertical)                                        │
 │  hoy: OpenAI gpt-4o-mini  →  3 RunsheetFormat                  │
 │  (pending: Gemini 1.5 Flash con prompt por nicho)             │
 │  fallback silencioso: { ok:false } → mocks del SDK            │
 └────────────────────────────────────────────────────────────────┘
```

### Data ownership at a glance

| Layer | File | Owns | Real backend? |
|---|---|---|---|
| State | `lib/store.ts` | `activeVertical`, moderator, muted cues | no (localStorage) |
| Adapter | `lib/tiktok-sdk/index.ts` | session, formats, cues, channel | no (in-memory) |
| Profiles | `lib/tiktok-sdk/verticals.ts` | the 5 verticals' content | no (static) |
| Engine | `lib/tiktok-sdk/engine.ts` | procedural chat/gifts/usernames | no (pure fns) |
| AI route | `app/api/generate-runsheet/route.ts` | runsheet generation | yes (optional, OpenAI today) |
| UI | `components/*.tsx`, `app/page.tsx` | renders props from the SDK | no |

---

## 2. Creator journey (user view)

```
┌─────────────────────────────────────────────────────────────────┐
│  1 · FEED  (ForYouScreen)                                        │
│  ─────────────────────────────                                   │
│  El creador ve su propio video viral subiendo en tiempo real.    │
│  Contadores de views/likes/comments/saves/watchingNow tick up.   │
│  A los 5s aparece el Spike Prompt (modal invasivo).              │
│                                                                  │
│  "Tu video está rompiendo — 13x tu promedio. ¿Vamos en vivo?"    │
│  [Aceptar]  [Ahora no]                                           │
│                                                                  │
│  data: session.creator, session.viralVideo (del perfil activo)   │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Aceptar
                               v
┌─────────────────────────────────────────────────────────────────┐
│  2 · RUNSHEET  (RunsheetScreen)                                  │
│  ─────────────────────────────                                   │
│  El creador elige 1 de 3 formatos de escaleta para su LIVE de     │
│  ~20 min. Los 3 formatos vienen del perfil de la vertical (o de  │
│  la IA si hay API key).                                          │
│                                                                  │
│  [Q&A EN VIVO]  [META DE REGALOS]  [FORMATO INMERSIVO]           │
│  cada uno con signal, "mejor para:", y 3 steps temporales.       │
│                                                                  │
│  data: defaultFormats (SDK), viralVideo (para contexto del prompt)│
│  AI: POST /api/generate-runsheet  →  fallback a mocks si falla    │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Continuar
                               v
┌─────────────────────────────────────────────────────────────────┐
│  3 · AUDIENCE BRIDGE / Waiting Room  (AudienceBridgeScreen)      │
│  ─────────────────────────────                                   │
│  El sistema "busca" a quienes reaccionaron al video y les avisa. │
│  4 fases animadas, contador de notificados, avatares.           │
│  Banner de expectativas: "una porción estimada puede sumarse".   │
│  El creador elige un moderador de confianza (opcional).          │
│  Advertencias de community guidelines visibles.                 │
│                                                                  │
│  ⚠️ AVISO OBLIGATORIO de normas (modal que bloquea el LIVE):     │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Antes de hacer LIVE                                     │    │
│  │  🚫 Nada de desnudos, contenido sexual o violencia       │    │
│  │     explícita.                                            │    │
│  │  🚫 No insultes, amenaces, acoses ni discrimines.        │    │
│  │  ⚠️ No hagas retos o actividades peligrosas, ilegales o   │    │
│  │     que puedan causar daño.                               │    │
│  │  🎁 No engañes a tu audiencia ni manipules regalos,      │    │
│  │     ventas, vistas o interacciones.                      │    │
│  │  📵 No transmitas contenido pregrabado, robado o de      │    │
│  │     terceros sin autorización.                           │    │
│  │  Incumplir estas reglas puede resultar en advertencia,   │    │
│  │  interrupción del LIVE o restricciones en tu cuenta.     │    │
│  └──────────────────────────────────────────────────────────┘    │
│  El creador DEBE pulsar "Entendido, ir LIVE" para continuar.     │
│                                                                  │
│  data: creator, viralVideo, format, bridgeTeaser (del perfil)   │
│  store: setModerator()                                           │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Empezar LIVE (startViewers)
                               v
┌─────────────────────────────────────────────────────────────────┐
│  4 · LIVE ROOM  (LiveRoomScreen)                                  │
│  ─────────────────────────────                                   │
│  La sala en vivo. Chat orgánico procedural (50-600ms de delay,  │
│  bursts de 3-5 msg ~12% de las veces), regalos, hearts aislados, │
│  Copilot con cadencia relajada (7s primero, ~17s después).       │
│  DOM cap: MAX_CHAT_NODES = 40. Meta de regalos temática.         │
│                                                                  │
│  Canal: TikTokSDK.Viewer.connect() → ViewerChannel.next()        │
│  pool de chat = buildChatMessagePool(reactionLines, questionLines)│
│  del perfil de la vertical activa.                               │
│                                                                  │
│  God Mode (Shift+D): forzar Copilot, Ráfaga Viral, saltar stage. │
│  (pending: selector de vertical aquí)                           │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Terminar LIVE (LiveStats)
                               v
┌─────────────────────────────────────────────────────────────────┐
│  5 · POST-LIVE SUMMARY  (LiveSummaryScreen)                      │
│  ─────────────────────────────                                   │
│  Recap: duración, pico de viewers, diamantes, nuevos seguidores. │
│  "Lo lograste, {creator.name}".                                  │
│  El creador puede fijar al moderador para futuros LIVEs.         │
│  Botón de reiniciar la demo.                                     │
│                                                                  │
│  data: creator (del perfil), stats (de LiveRoomScreen)           │
│  store: setModeratorPinned(), resetSession()                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Reiniciar
                               v
                          (vuelve al FEED)
```

### What changes per vertical

When the active vertical switches (today via the store; **pending**:
God Mode picker + reactive session rebuild), the following all change
without a page reload:

| What | Source |
|---|---|
| Creator (handle, name, emoji, followers) | `profile.creator` |
| Viral video (caption, hashtags, views, sound) | `profile.viralVideo` |
| Chat vocabulary (reactions + questions) | `profile.reactionLines` + `profile.questionLines` |
| Gift goal + reveal | `profile.giftGoal` + `profile.giftGoalReveal` |
| Runsheet formats (the 3 options) | `profile.runsheetFormats` |
| Copilot cues + actions | `profile.copilotCues` + `profile.copilotActions` |
| Highlighted question | `profile.highlightedQuestion` |
| Bridge teaser | `profile.bridgeTeaser` |

The chat engine itself (`engine.ts`) is vertical-agnostic — it just
consumes whatever pool the active profile hands it via
`buildChatMessagePool()`. That's what keeps the DOM cap (`MAX_CHAT_NODES
= 40`) and the 60fps behavior stable regardless of which vertical is
active.

---

## 3. The 5 verticals at a glance

| Vertical | Creator | Viral video (caption, abridged) | Gift goal | Chat vibe |
|---|---|---|---|---|
| 💄 Beauty & Skincare | Cami (`cami.skin`) | Rutina coreana 5 pasos | 5K 💎 → "el sérum secreto" | "¿sirve para piel grasa?", "qué SPF usas?" |
| 👗 Fashion & Styling | Valentina (`valentina.studio`) | Outfit recycling, 1 prenda 5 looks | 8K 💎 → "el drop cápsula" | "link de la chaqueta?", "talla real?" |
| 🍝 Food & Cooking | Fer (`fer.eats`) | Pasta en 60s | 3K 💎 → "la salsa secreta" | "¿lleva ajo?", "sin gluten?" |
| 🔨 Home DIY | Tomás (`tomas.builds`) | Habitación con $50 y cinta | 6K 💎 → "el hack del organizador" | "qué pintura usaste?", "medidas?" |
| 📱 Consumer Electronics | Kevin (`kevin.tech`) | Unboxing del gadget $20 | 10K 💎 → "el accesorio oculto" | "¿cuánto tarda en cargar?", "compatible con?" |

> **Compliance note:** these are demo profiles built for this prototype.
> They are **not** an official TikTok taxonomy. TikTok does not publish
> an exhaustive global directory of LIVE communities, and availability
> of LIVE features varies by region, account, and device. See
> `DEVELOPMENT_LOG.md` Phase 5 for the compliance reasoning and
> `AudienceBridgeScreen.tsx` for the in-app community-guideline
> warnings.
