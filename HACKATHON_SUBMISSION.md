# LIVE Launchpad — Hackathon Submission

| | |
|---|---|
| **Project** | LIVE Launchpad |
| **Track** | TikTok Global Hackathon |
| **Repo** | `oscaryahirriquelmemartinez/tiktok-live-launchpad` |
| **Where we're at** | MVP prototype — front-end works across 5 content verticals, backend is intentionally still fake |
| **Other docs in this repo** | `PRD.md`, `DEVELOPMENT_LOG.md`, `CHANGELOG.md` |

---

## 1. The pitch, in one breath

The second a creator's short video spikes, LIVE Launchpad hands them a
broadcast plan, fills the room with the people who already reacted to
that exact video, and coaches them through the first few minutes on
camera — so going live for the first time doesn't mean improvising alone
in front of strangers.

---

## 2. Who did what

| Name | What they owned |
|---|---|
| **Alan Tang** | Product & Design |
| **Farid Porte Petit** | Strategy & Market Validation |
| **Ana Maria Prada** | Research & Problem Validation |
| **Oscar Riquelme** | Creator Insights & Beta Planning |

A quick honesty note on this table: our git history right now only has
one committer on it (the engineering execution ran through one machine),
so we're not going to pretend the commit log tells you who did what.
What we're doing instead is mapping each person's actual ownership area
to the part of the PRD/product that came out of it. That's a role-to-
deliverable map, not a claim about who typed which line of code.

### 2.1 Who owns what, concretely

| Owner | Area | What that turned into in this submission |
|---|---|---|
| **Alan Tang** | Product & Design | The five-stage flow and how it feels — Spike Prompt → Runsheet → Waiting Room → LIVE Room → Recap — plus the overlay behavior and the whole motion/visual language (the Tailwind theme, the Framer Motion transitions) you see across every screen in `components/*.tsx`. That's Sections 3 and 4.2 of `PRD.md`. |
| **Farid Porte Petit** | Strategy & Market Validation | The business case for why spike-to-LIVE conversion is worth building at all, and the metrics we're actually going to judge ourselves by (conversion rate, time-to-LIVE, empty-room avoidance). That's Sections 1 and 6 of `PRD.md`. |
| **Ana Maria Prada** | Research & Problem Validation | The four pain points the whole product is a response to — "what to say," "how to say it," "when to go live," and the empty-room fear. That's Section 2 of `PRD.md`, and honestly the reason the rest of the doc exists. |
| **Oscar Riquelme** | Creator Insights & Beta Planning | Who this is actually for (Section 1.1), what we're punting to a Phase 2 backend (Section 5), the engineering build log (`DEVELOPMENT_LOG.md`), and the gap-analysis list below — turning "what creators told us" into an actual sequenced plan. |

*(Again — this isn't claiming line-level authorship, it's mapping
ownership to output. If Alan, Farid, or Ana Maria want to attach actual
artifacts — research notes, market decks, design files — to their row
before judging, that'd make this a lot stronger.)*

---

## 3. What we actually built, in order

Full version is in `DEVELOPMENT_LOG.md`. Short version:

| Phase | What happened | Commit |
|---|---|---|
| 0 | Got the whole five-screen flow up and running on mocks | `4347778` |
| 1 | Added a script to stop manually pushing every five minutes | `d592fab` |
| 2 | Fixed the Copilot after actually using it — placement, pacing, mute, moderator flow, expectations banner | `170a9d8` |
| 3 | Fixed a UI overlap bug, wired real AI into the Runsheet, built God Mode for demos | staged, not committed yet |
| 4 | Rebuilt the chat/gift simulation so the room stops feeling like a loop | staged, not committed yet |
| 5 | Abstracted all data behind an in-memory "TikTokSDK" adapter and split it into 5 content verticals (Beauty, Fashion, Food, DIY, Electronics) | staged, not committed yet |

### 3.1 The prompts we actually used

A lot of this got built through fast prompt → generated code → look at
it → fix it cycles with AI pair-programming (Devin CLI, Claude Sonnet
models), rather than writing a full spec up front and building to it.
Here's what we actually typed, phase by phase (pulled straight from
`DEVELOPMENT_LOG.md`):

- **Phase 0:** *"Build a mobile-first Next.js simulation of the TikTok
  app that walks a creator from a viral short-video spike into their
  first LIVE... Use Tailwind, Framer Motion, and Zustand for state. No
  real backend — everything mocked."*
- **Phase 2:** *"The Copilot currently covers the creator's face and
  fires too often. Move it to the top of the room, relax the suggestion
  cadence, and let the creator permanently silence a suggestion
  category... The Waiting Room should set expectations that not
  everyone watching the video will join the LIVE."*
- **Phase 3:** *"Execute a production sprint: fix the z-index collisions
  in the LIVE room... Wire the Runsheet screen to a real Vercel AI SDK
  endpoint... with a strict, silent fallback to the local mocks... Add a
  hidden 'God Mode' panel behind Shift+D for controlling the demo during
  a pitch."*
- **Phase 4:** *"The LIVE room simulation feels robotic and repetitive...
  Replace the scripted chat with a procedurally generated pool of
  150-200+ diverse messages... Rebuild the cadence as a stochastic
  engine... Keep it at 60fps, don't touch the Zustand store or the AI
  SDK integration."*
- **Phase 5:** *"Refactoriza la capa de datos del tiktok-sdk para
  soportar 5 perfiles verticales distintos. Conecta esta selección de
  vertical al estado global, adapta la ruta de IA (Gemini) para generar
  runsheets contextualizados según el nicho, y agrega un selector de
  vertical en el God Mode."*

Every phase got closed out with `npm run build` and `npm run lint`
before we called it done — we didn't want to hand off broken code just
because the feature demoed fine once.

---

## 4. How to actually check this out

### 4.1 Running it locally (this is the one we'd actually recommend)

```bash
git clone https://github.com/oscaryahirriquelmemartinez/tiktok-live-launchpad.git
cd tiktok-live-launchpad
npm install
npm run dev
```

Then open `http://localhost:3000`. It's a self-contained phone-width
simulation — no login, no data to seed, nothing to configure to see the
whole flow work end to end.

- **5 content verticals:** the data layer (`lib/tiktok-sdk/`) ships 5
  complete demo profiles — Beauty & Skincare, Fashion & Styling, Food &
  Cooking, Home DIY, and Consumer Electronics. Each one has its own
  creator, viral video, chat vocabulary, gift goal, Copilot cues and
  runsheet formats. The active vertical lives in the Zustand store
  (`activeVertical`) and the SDK adapter (`TikTokSDK`) builds a session
  from whichever profile is selected. **Important honesty note:** these
 5 verticals are demo profiles we built, **not** an official TikTok
  taxonomy — TikTok does not publish an exhaustive global directory of
  LIVE communities, and availability varies by region, account and
  device. See `DEVELOPMENT_LOG.md` Phase 5 for the compliance reasoning.
- **Mandatory community guidelines gate:** before any LIVE starts,
  `AudienceBridgeScreen.tsx` shows a blocking modal the creator **must**
  accept ("Entendido, ir LIVE") — it cannot be skipped. The text:

  > ### ⚠️ Antes de hacer LIVE
  > * 🚫 **Nada de desnudos, contenido sexual o violencia explícita.**
  > * 🚫 **No insultes, amenaces, acoses ni discrimines a otras personas.**
  > * ⚠️ **No hagas retos o actividades peligrosas, ilegales o que puedan causar daño.**
  > * 🎁 **No engañes a tu audiencia ni manipules regalos, ventas, vistas o interacciones.**
  > * 📵 **No transmitas contenido pregrabado, robado o de terceros sin autorización.**
  >
  > **Incumplir estas reglas puede resultar en una advertencia, la interrupción del LIVE o restricciones en tu cuenta.**
- **Optional:** drop an `OPENAI_API_KEY` into `.env.local` if you want to
  see the real AI-generated runsheets instead of the local mocks. Without
  it, the app quietly falls back to the mocks — that's expected, not
  broken (see `PRD.md`, Section 4.3). *(Note: the planned migration to
  Gemini 1.5 Flash is not yet wired — see Section 5.)*
- **If you want to skip around instead of playing through the whole
  flow:** hit `Shift + D` on any screen. That opens a panel that lets you
  jump straight to any stage, force a Copilot suggestion instead of
  waiting for it, or fire off a "Viral Surge" to instantly see the LIVE
  room at its busiest.

### 4.2 Hosted version

There's a Vercel project (`tiktok-live-launchpad`) already linked to
this repo. We're deliberately **not** putting a URL here yet — we'd
rather leave this blank and have someone on the team drop in the actual,
verified domain before this goes to judges than guess at one and be
wrong.

---

## 5. Where the MVP still falls short

Short version: this is front-end complete and nothing else yet. No real
backend, no tests, no analytics, no auth.

**Phase 5 (vertical SDK) — what's done vs. what's still open:**

- [x] In-memory `TikTokSDK` adapter (`lib/tiktok-sdk/`) with simulated
  latency, no real backend.
- [x] 5 complete vertical profiles (Beauty, Fashion, Food, DIY,
  Electronics) with creator, video, chat pool, gift goal, Copilot cues.
- [x] `activeVertical` + `setActiveVertical` in the Zustand store.
- [x] All UI screens consume dynamic SDK data instead of hardcoded
  `lib/data.ts` imports.
- [x] `npx tsc --noEmit` passes clean.
- [ ] **Gemini migration:** the runsheet API route
  (`app/api/generate-runsheet/route.ts`) still calls OpenAI
  `gpt-4o-mini`. The move to `gemini-1.5-flash` with vertical-aware
  prompting is **not** wired — `@ai-sdk/google` isn't installed and no
  `GEMINI_API_KEY` is configured. The route still degrades silently to
  SDK mocks, so the demo works either way.
- [ ] **God Mode vertical selector:** `GodModeDrawer.tsx` doesn't yet
  expose a picker. The store has the setter but nothing reads it to
  rebuild the session.
- [ ] **Reactive session rebuild:** `app/page.tsx` bootstraps the
  session once with the default vertical; it doesn't yet watch
  `activeVertical` to recreate the session + reconnect the chat
  channel without a page reload.
- [ ] **Runsheet type unification:** the SDK uses
  `"qa" | "goal" | "immersive"` while the AI route validates
  `"qa" | "goal" | "cookalong"`. Needs one canonical type.
- [ ] **Lint:** 1 error (`set-state-in-effect` in `ForYouScreen.tsx`)
  + 6 unused-export warnings in `lib/tiktok-sdk/index.ts`.

The full breakdown of remaining gaps is in `DEVELOPMENT_LOG.md`, Phase 5.

---

## 6. Where things stand

- [x] Whole flow works end to end (Feed → Runsheet → Waiting Room → LIVE
  Room → Recap)
- [x] 5 content verticals behind an in-memory SDK adapter
  (`lib/tiktok-sdk/`)
- [x] `PRD.md` — what we're building and why
- [x] `DEVELOPMENT_LOG.md` — how we actually built it, prompts included
- [x] `CHANGELOG.md` — what changed, for anyone tracking it
- [x] `HACKATHON_SUBMISSION.md` — this doc
- [x] `FLOW.md` — process flow + creator journey diagram
- [ ] Gemini 1.5 Flash migration for the runsheet API
- [ ] God Mode vertical selector + reactive session rebuild
- [ ] Real, verified demo URL for judges (waiting on the team to confirm)
- [ ] Alan / Farid / Ana Maria adding their own specific artifacts to
  Section 2.1
