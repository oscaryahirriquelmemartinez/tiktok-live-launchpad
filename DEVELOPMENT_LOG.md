# LIVE Launchpad — Build Log

This is our running log of how we actually built this thing — what we
did in what order, what broke, what we decided to punt on, and the
prompts we used when we were pairing with AI tooling to move faster.
Think of it as the internal build diary that sits next to `PRD.md`
(what we're building and why) and `CHANGELOG.md` (what changed for
users).

> **A note on how we actually worked:** a good chunk of this build
> happened as fast prompt → generated component → look at it → fix it
> loops with AI pair-programming (Devin CLI, Claude Sonnet), not as a
> spec-first waterfall. Some people call that "vibecoding" and mean it
> as an insult — we just call it building fast under a hackathon clock.
> We're writing it down honestly here: several of the interaction
> decisions (motion timing, how dense the UI feels, how overlays stack)
> got figured out by building something, looking at it, and immediately
> deciding it was wrong, rather than being spec'd out ahead of time.
> That's just what a real timebox looks like.

---

## Phase 0 — Getting something on screen

**Commit `4347778` — "Initial commit: Live Launchpad MVP"**

Started from `create-next-app` (Next.js 16, App Router, Turbopack,
TypeScript, Tailwind v4, ESLint) and built the phone-shaped shell first —
`app/layout.tsx` locks the viewport to `max-w-[400px]`, kills overscroll
and text selection so it stops feeling like a website and starts feeling
like an app. Grabbed TikTok's brand colors as Tailwind theme tokens
(`tt-pink`, `tt-cyan`, `tt-bg` in `app/globals.css`) early so every screen
after this would automatically look consistent.

What actually shipped in this pass:
- `components/chrome.tsx` — the boring-but-necessary shared bits
  (`StatusBar`, `Avatar`, `VideoBackdrop`) every screen reuses.
- `components/ForYouScreen.tsx` — the feed itself, with counters that
  tick up live so it doesn't feel static from frame one.
- `components/SpikePromptModal.tsx` — the first version of the spike
  bottom-sheet.
- `components/RunsheetScreen.tsx` — the format picker, fully mocked at
  this point (`lib/data.ts`).
- `components/AudienceBridgeScreen.tsx` — the waiting room, with the
  viewer ramp and moderator picker.
- `components/LiveRoomScreen.tsx` — the LIVE room, running off a fixed
  24-message script that looped every 46 seconds, plus the first cut of
  the Copilot.
- `components/LiveSummaryScreen.tsx` — the recap screen.
- `lib/data.ts`, `lib/format.ts`, `lib/hooks.ts`, `lib/store.ts` — mocks,
  number formatting, timers/animation hooks, and the Zustand session
  store.

**What we actually asked the AI to build (paraphrased):**
> "Build a mobile-first Next.js simulation of the TikTok app that walks
> a creator from a viral short-video spike into their first LIVE.
> Stages: For You feed → spike detection prompt → AI-style runsheet
> picker → audience waiting room → LIVE room with a chat/gift simulation
> and an in-room Copilot → post-LIVE summary. Use Tailwind, Framer
> Motion, and Zustand for state. No real backend — everything mocked."

---

## Phase 1 — Making our own lives easier

**Commit `d592fab` — "Add auto-push watcher script"**

Added `scripts/auto-push.sh` and `npm run autopush` so we'd stop
manually running git commands every five minutes during the crunch.
Small, but it saved real time.

---

## Phase 2 — Fixing the Copilot after actually using it

**Commit `170a9d8` — "Copilot v2: reubicación superior, cadencia
relajada, opt-out, moderador de confianza y expectativas"**

We ran through the flow ourselves a few times and had a pretty short
list of "this is actively annoying" notes. This commit is us fixing all
of them in one pass:

1. **Moved the Copilot.** It used to sit somewhere it covered the
   creator's face on camera — obviously bad — so we pinned it right
   under the room header instead (`top-[94px]`).
2. **Slowed it down.** It used to fire way too often. Now it's a 7-second
   first delay and roughly 17 seconds after that
   (`COPILOT_FIRST_DELAY_MS`, `COPILOT_INTERVAL_MS` in `lib/data.ts`),
   with a 9-second auto-dismiss if nobody interacts.
3. **Added a real mute button.** "Silence this" (`muteCategory` in
   `lib/store.ts`) means that suggestion type just doesn't come back for
   the rest of the session. Nobody should have to keep dismissing the
   same nag.
4. **Added the moderator flow, both ends.** Picking a trusted moderator
   in the waiting room (`AudienceBridgeScreen.tsx`) and pinning them for
   next time from the recap screen (`LiveSummaryScreen.tsx`), both saved
   through `lib/store.ts`.
5. **Added the expectations banner in the waiting room.** We didn't want
   the "X people notified" number to read like a promise, so we added
   the "an estimated portion may join" framing.

**What we asked for (paraphrased):**
> "The Copilot currently covers the creator's face and fires too often.
> Move it to the top of the room, relax the suggestion cadence, and let
> the creator permanently silence a suggestion category. Also add a way
> to pick a trusted moderator before going live, and let them pin that
> moderator for future broadcasts from the summary screen. The Waiting
> Room should set expectations that not everyone watching the video will
> join the LIVE."

---

## Phase 3 — The "let's make this feel real" sprint

*(Not committed yet as of this writing — staged, ready to go.)*

Three separate things, done back to back in one session, none of which
touched each other:

### 3.1 Fixing overlapping UI (the z-index mess)
The big gift banner and the highlighted-question card in
`LiveRoomScreen.tsx` used to sit at hardcoded pixel offsets
(`top-[248px]`, `top-[300px]`). Under the wrong combination of state —
say, a big gift landing right when a question was already highlighted —
they'd visually stack on top of each other. We moved both into the same
flex stack the Copilot already lived in (`top-[94px]`) and let Framer
Motion's `layout` prop handle the reflow. Whole class of bug, gone, and
it didn't cost us anything in render performance.

### 3.2 Actually wiring up AI for the Runsheet
Added `app/api/generate-runsheet/route.ts`: a real Next.js route calling
`generateObject` from the `ai` SDK against `@ai-sdk/openai`
(`gpt-4o-mini`), with a Zod schema forcing exactly three well-shaped
formats back. We were strict about one thing here — **this can never
show the creator an error.** No API key, a failed call, whatever — the
route just says `{ ok: false }` and the client keeps its local mocks like
nothing happened. We also pinned the new dependencies
(`ai@7.0.77`, `@ai-sdk/openai@4.0.46`, `zod@4.4.3`) to specific versions
instead of letting them float to `latest`.

### 3.3 God Mode
Added `components/GodModeDrawer.tsx`, opened with `Shift + D` anywhere in
the app. Lets whoever's driving jump straight to any of the five stages
(auto-filling whatever a skipped stage would otherwise need), force the
next Copilot suggestion instead of waiting, and wipe local storage with
a two-step confirmation so we don't nuke state by accident. This is
strictly a demo/dev tool — it's not meant for real users to ever find.

**What we asked for (paraphrased):**
> "Execute a production sprint: fix the z-index collisions in the LIVE
> room by making the gift banner and highlighted question part of the
> same dynamic stack as the Copilot. Wire the Runsheet screen to a real
> Vercel AI SDK endpoint that generates the three formats via
> `generateObject`, with a strict, silent fallback to the local mocks if
> the AI call fails or no API key is present. Add a hidden 'God Mode'
> panel behind Shift+D for controlling the demo during a pitch — jump
> stages, force Copilot cues, and reset local storage. Verify with
> `npm run build` before finishing."

**Checked before calling it done:** `npm run build` (TypeScript + SSR,
clean) and `npm run lint` (clean) after each of the three pieces.

---

## Phase 4 — Making the LIVE room stop feeling like a loop

*(Also not committed yet — staged.)*

**The actual complaint that kicked this off:** the LIVE room worked, but
it was obviously fake if you watched it for more than a minute or two —
a 24-message script looping every 46 seconds starts repeating itself
almost immediately, and that kills the illusion the whole product
depends on for a good demo.

### 4.1 Ditching the fixed script
Killed `CHAT_SCRIPT` entirely. Replaced it with:
- `CHAT_MESSAGE_POOL` (`lib/data.ts`) — 195 message variants, built out
  of four combinable pieces (short reactions, questions, emoji chains,
  and shouted/emphasized versions of the reactions) instead of typing
  195 lines by hand.
- `generateUsername()` — mixes 44 name stems with 20 suffixes, with
  roughly a 55% chance of tacking on a number, so you get things like
  `user84729`, `maria.gzz`, `juanperez_23`.
- `REGULAR_VIEWERS` — 11 names that show up about 40% of the time so the
  room feels like it has actual regulars, not just a firehose of random
  strangers every message.
- `GIFT_CATALOG` / `randomGift()` — realistic gift odds (about 85% cheap
  roses, 15% something pricier), plus `generateViralSurgeGift()` which
  only hands out the expensive stuff (400+ diamonds) and is reserved for
  the God Mode surge button.

### 4.2 Making the timing feel less like a machine
Added `useOrganicChat` (`lib/hooks.ts`) to replace the old fixed
250ms interval that just replayed the script. Now each message gets a
random 50–600ms delay, and about 12% of the time it fires a burst of 3–5
messages at once to fake a real spike of excitement. It never does
anything heavier than building an object and handing it off — no network
calls, nothing that could cost a frame.

### 4.3 Getting the hearts out of the way, performance-wise
The floating "like" hearts used to live in `LiveRoomScreen`'s own state,
which meant every single heart tick re-rendered the whole LIVE room
around it — not great. Pulled it out into its own memoized `HeartsField`
component with its own timer, fully isolated. Each heart
(`FloatingHeart`) now animates through three keyframes for position,
scale, and opacity to fake a curved path, and un-mounts itself the moment
it's done so we never build up more than ~14 hearts on screen at once.

### 4.4 God Mode: Viral Surge
Added a "Force Viral Surge" button to `GodModeDrawer.tsx` that fires a
`window` `CustomEvent` and, in one click, triggers 15 chat messages
spread across about a second, 20 hearts at once, and one expensive gift —
so whoever's presenting can show off the room at its most exciting moment
on cue instead of waiting for it to happen naturally.

**What we asked for (paraphrased):**
> "The LIVE room simulation feels robotic and repetitive — comments loop
> too predictably. Replace the scripted chat with a procedurally
> generated pool of 150-200+ diverse messages (short reactions, emoji
> chains, questions, join events, sporadic gift drops) and a believable
> username generator. Rebuild the cadence as a stochastic engine with
> randomized 50-600ms delays and occasional 3-5 message bursts. Make the
> floating heart particles fully isolated so they never re-render the
> rest of the screen, and give the God Mode panel a 'Force Viral Surge'
> button that injects 15 messages in a second, 20 hearts, and one
> high-value gift. Keep it at 60fps, don't touch the Zustand store or
> the AI SDK integration, and verify the production build compiles
> cleanly."

**Checked before calling it done:** `npm run build` (clean) and
`npm run lint` (clean — fixed one unused-directive warning along the
way).

---

## Phase 5 — Patrón de Adaptador SDK + 5 verticales de contenido

*(No commiteado todavía — staged en working tree.)*

**El detonante:** el MVP vivía 100% de un perfil hardcodeado de cocina
(`CREATOR`, `VIRAL_VIDEO`, `CHAT_SCRIPT` en `lib/data.ts`). Para una demo
que se presenta a un comité de compliance corporativo, eso es un
problema: el producto no puede pretender ser "un caso de uso" cuando
TikTok LIVE cubre muchas comunidades distintas. Y no podemos pegar un
perfil real de TikTok arriba de todo sin implicar que esto es una
taxonomía oficial. Así que esta fase hizo dos cosas a la vez: abstrajo
toda la data detrás de un "SDK" en memoria, y la dividió en 5
verticales demostrables.

### 5.1 La capa `lib/tiktok-sdk/` (compliance adapter)

Creamos una carpeta nueva que es lo único que el resto de la app toca
para data:

- `lib/tiktok-sdk/types.ts` — los tipos del dominio (`Creator`,
  `ViralVideo`, `LiveSession`, `VerticalProfile`, `ViewerChannel`,
  `RunsheetFormat`, `ChatEvent`, `CopilotCue`...). Nada aquí llama a
  una API.
- `lib/tiktok-sdk/verticals.ts` — los 5 perfiles verticales completos
  (Beauty, Fashion, Food, DIY, Electronics). Cada uno trae su propio
  creador, video viral, formatos de runsheet, jerga de chat
  hiper-específica (`reactionLines` + `questionLines`), meta de regalos
  temática, reveal de la meta, teaser del Audience Bridge, cues del
  Copilot y pregunta destacada. ~585 líneas.
- `lib/tiktok-sdk/engine.ts` — el motor procedimental compartido entre
  verticales: `generateUsername()`, `randomIdentity()` (40% regulares /
  60% nuevos), `buildChatMessagePool()` (combina reacciones de la
  vertical + genéricas + énfasis + mayúsculas + cadenas de emojis),
  `randomGift()` (85% rosas / 15% catálogo), `generateViralSurgeGift()`
  (regalos de 400+ diamantes), `MAX_CHAT_NODES = 40`, cadencia del
  Copilot. ~199 líneas.
- `lib/tiktok-sdk/index.ts` — el adaptador público `TikTokSDK` con
  `Live.createSession()`, `Runsheet.getDefaultFormats()`,
  `Copilot.getCues()/getActions()/getHighlightedQuestion()`,
  `Bridge.getConfig()/getModCandidates()`, `Viewer.connect()`. Cada
  método paga una latencia simulada (`withLatency`, ~220–300ms) como si
  fuera un SDK real conectándose a TikTok LIVE, pero todo es local.

> **Por qué importa para compliance:** hoy cada método está respaldado
> por data 100% local. El día que exista un backend real, solo esta
> carpeta cambia — el resto de la app no se entera. Cero acoplamiento
> a bases de datos reales, cero fetch a un servidor externo.

### 5.2 Las 5 verticales

| id | Label | Creador | Video viral (resumen) | Meta de regalos |
|---|---|---|---|---|
| `beauty` | Beauty & Skincare | Cami (`cami.skin`) | Rutina coreana 5 pasos | 5K diamantes → revela "el sérum secreto" |
| `fashion` | Fashion & Styling | Valentina (`valentina.studio`) | Outfit recycling 1 prenda 5 looks | 8K diamantes → revela "el drop cápsula" |
| `food` | Food & Cooking | Fer (`fer.eats`) | Pasta en 60s que rompió | 3K diamantes → revela "la salsa secreta" |
| `diy` | Home DIY | Tomás (`tomas.builds`) | Habitación con $50 y cinta | 6K diamantes → revela "el hack del organizador" |
| `electronics` | Consumer Electronics | Kevin (`kevin.tech`) | Unboxing del gadget $20 | 10K diamantes → revela "el accesorio oculto" |

Cada vertical tiene su propio vocabulario de chat. Por ejemplo, Beauty
tiene "¿ese sérum sirve para piel grasa?", Food tiene "¿la salsa lleva
ajo?", DIY tiene "¿qué pintura usaste en la pared?", Electronics tiene
"¿cuánto tarda en cargar?". El pool se construye combinando esas líneas
con reacciones genéricas + énfasis + mayúsculas + cadenas de emojis, así
que cada vertical se siente distinta sin que nadie tenga que escribir
200 mensajes a mano.

### 5.3 `activeVertical` en el store

`lib/store.ts` ahora tiene `activeVertical: VerticalId` (default
`'beauty'`) y `setActiveVertical(v)`. Se persiste en localStorage junto
al moderador y las categorías silenciadas del Copilot.

### 5.4 Migración de los componentes a data dinámica

Esto fue la mayor parte del trabajo tedioso. Antes, cada pantalla
importaba `CREATOR` y `VIRAL_VIDEO` directamente de `lib/data.ts`.
Ahora `app/page.tsx` bootea una sesión con
`TikTokSDK.Live.createSession()` y le pasa los datos derivados del
perfil a cada pantalla como props:

- `ForYouScreen.tsx` — recibe `creator` y `viralVideo` como props.
- `SpikePromptModal.tsx` — recibe `viralVideo` dinámico.
- `RunsheetScreen.tsx` — recibe `viralVideo`, `defaultFormats` y el
  formato seleccionado.
- `AudienceBridgeScreen.tsx` — recibe `creator`, `viralVideo` y
  `format` dinámicos.
- `LiveRoomScreen.tsx` — recibe `sessionId`, `creator`, `giftGoal`,
  `format`, `startViewers`. Se conecta al canal del SDK
  (`TikTokSDK.Viewer.connect()`) para el chat orgánico.
- `LiveSummaryScreen.tsx` — recibe `creator` y `stats` dinámicos.

`app/page.tsx` muestra un "Conectando con TikTok LIVE…" mientras la
sesión mockeada "conecta" (~300ms de latencia simulada), para reforzar la
ilusión del adaptador.

### 5.5 Lo que NO está terminado en esta fase (gap analysis honesto)

1. **La ruta de IA sigue en OpenAI.** `app/api/generate-runsheet/route.ts`
   todavía usa `@ai-sdk/openai` con `gpt-4o-mini`. La migración a
   `gemini-1.5-flash` (con `vertical` en el body y prompt
   contextualizado por nicho) **no se completó** — la dependencia
   `@ai-sdk/google` no está instalada y no hay `GEMINI_API_KEY` en
   `.env.local`. La ruta sigue funcionando con su fallback silencioso a
   los mocks del SDK.
2. **El selector de vertical en God Mode no se construyó.**
   `GodModeDrawer.tsx` no tiene UI para elegir vertical. El store tiene
   `activeVertical`/`setActiveVertical`, pero nada lo lee todavía para
   regenerar la sesión.
3. **`page.tsx` no reacciona a `activeVertical`.** El bootstrap llama
   `TikTokSDK.Live.createSession()` sin argumento, así que siempre usa
   el default (`beauty`). Falta un `useEffect` que escuche
   `activeVertical` y vuelva a crear la sesión + reconectar el canal de
   chat sin recargar la página.
4. **`RunsheetFormat.id` tiene un desajuste de tipos.** El SDK usa
   `"qa" | "goal" | "immersive"`; la ruta de IA todavía valida
   `"qa" | "goal" | "cookalong"`. `tsc --noEmit` pasa porque la ruta no
   importa el tipo del SDK, pero es deuda técnica: hay que unificar a un
   tipo canónico.
5. **Lint:** 1 error (`react-hooks/set-state-in-effect` en
   `ForYouScreen.tsx:41`) + 6 warnings de exports no usados en
   `lib/tiktok-sdk/index.ts` (los exportamos para uso futuro pero
   nadie los importa todavía).

**Lo que sí está verde:**
- `npx tsc --noEmit` — pasa limpio.
- Los 5 perfiles verticales están completos y son navegables vía
  `getVerticalProfile(id)`.
- Toda la UI ya consume data dinámica del SDK en vez de imports
  estáticos de `lib/data.ts`.

**Lo que pedimos (parafraseado):**
> "Refactoriza la capa de datos del tiktok-sdk para soportar 5 perfiles
> verticales distintos. Conecta esta selección de vertical al estado
> global, adapta la ruta de IA (Gemini) para generar runsheets
> contextualizados según el nicho, y agrega un selector de vertical en
> el God Mode, asegurando un reporte final de ejecución."

**Leímos antes de implementar:** los PDFs de compliance de TikTok LIVE
en `~/Downloads` (`Comunidades y normas...`, `Comunidades, normas y
rasgos distintivos...`, `LIVE Launchpad.pdf`). Conclusiones clave que
guiaron el diseño: no existe un inventario oficial global de
comunidades LIVE; las reglas generales son transversales y las
verticales suman riesgo contextual; las penalidades pueden afectar
disponibilidad, recomendación, edad o monetización independientemente;
y la presentación no debe implicar que estos 5 perfiles mockeados son
una taxonomía oficial de TikTok ni que hay disponibilidad uniforme por
región, cuenta o dispositivo.

### 5.6 Aviso obligatorio de normas comunitarias (no opcional)

`AudienceBridgeScreen.tsx` muestra un modal **obligatorio** al presionar
"Iniciar LIVE" que bloquea la cuenta regresiva 3-2-1 hasta que el
creador acepta explícitamente ("Entendido, ir LIVE"). El texto es:

> ### ⚠️ Antes de hacer LIVE
>
> * 🚫 **Nada de desnudos, contenido sexual o violencia explícita.**
> * 🚫 **No insultes, amenaces, acoses ni discrimines a otras personas.**
> * ⚠️ **No hagas retos o actividades peligrosas, ilegales o que puedan causar daño.**
> * 🎁 **No engañes a tu audiencia ni manipules regalos, ventas, vistas o interacciones.**
> * 📵 **No transmitas contenido pregrabado, robado o de terceros sin autorización.**
>
> **Incumplir estas reglas puede resultar en una advertencia, la interrupción del LIVE o restricciones en tu cuenta.**

Esto no es opcional ni se puede saltar: el estado `guidelinesOpen`
controla el flujo y solo `setCountdown(3)` (que arranca el LIVE) se
ejecuta desde el botón "Entendido, ir LIVE". Ver líneas 393–467 de
`components/AudienceBridgeScreen.tsx`.

---

## Rules we kept holding ourselves to

1. **Fail quiet, not loud.** The only real external dependency we have
   (the Runsheet AI call) always degrades to a local mock instead of
   showing the creator an error. That was non-negotiable for us.
2. **Every simulation loop has a hard cap.** Chat, viewer count, hearts,
   Copilot cadence — none of them touch the network, and none of them
   grow the DOM without a limit (`MAX_CHAT_NODES = 40`, ~14 hearts max).
   These caps live in the code, not just in "we'll be careful."
3. **Don't break what's already working.** God Mode, the Runsheet API,
   and the organic chat engine were all built as additions — none of
   them changed another component's props, the Zustand store shape, or
   how the AI SDK integration works.
4. **Pin new dependencies.** New third-party packages got pinned to
   specific, already-published versions instead of floating to
   `latest`, since we didn't want to pull in something unvetted mid-build.
