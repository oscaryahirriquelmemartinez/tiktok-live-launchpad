# LIVE Launchpad — Development Log & Build Record

This document records the chronological engineering history of LIVE
Launchpad: architectural decisions, AI-assisted development phases, and
the prompts used to drive each phase. It is intended as an internal
build log, complementary to `PRD.md` (scope/requirements) and
`CHANGELOG.md` (user-facing change history).

> **Note on methodology:** Several phases of this build used AI pair-
> programming (Devin CLI, model: Claude Sonnet) in a **Rapid UI/UX
> Prototyping** loop — short iterative cycles of prompt → generated
> component → visual review → refinement — rather than a traditional
> up-front spec-to-implementation waterfall. This is documented
> transparently below as **Heuristic Interface Synchronization**: each
> visual/interaction pass was validated against the target TikTok LIVE
> interaction model and corrected iteratively, rather than derived from a
> static design spec. This approach was deliberately chosen for a
> hackathon timeline where interaction feel (motion timing, information
> density, overlay choreography) could not be fully specified up front.

---

## Phase 0 — Repository Initialization

**Commit `4347778` — "Initial commit: Live Launchpad MVP"**

Scaffolded via `create-next-app` (Next.js 16, App Router, Turbopack,
TypeScript, Tailwind CSS v4, ESLint). Established the mobile-first shell
(`app/layout.tsx`: fixed `max-w-[400px]` viewport, disabled overscroll and
text selection to emulate a native app surface) and the core design
tokens (`app/globals.css`: `tt-pink`, `tt-cyan`, `tt-bg` custom theme
colors matching TikTok's brand palette).

Delivered in this phase:
- `components/chrome.tsx` — shared primitives (`StatusBar`, `Avatar`,
  `VideoBackdrop`) reused across every screen.
- `components/ForYouScreen.tsx` — the "For You" feed entry point, with
  live-incrementing engagement counters as a baseline virality cue.
- `components/SpikePromptModal.tsx` — the initial Spike Prompt bottom
  sheet.
- `components/RunsheetScreen.tsx` — runsheet analysis/selection screen,
  initially backed entirely by static mocks (`lib/data.ts`).
- `components/AudienceBridgeScreen.tsx` — Waiting Room with viewer ramp
  simulation and moderator selection sheet.
- `components/LiveRoomScreen.tsx` — LIVE broadcast screen with a
  fixed, looping scripted chat (`CHAT_SCRIPT`, 24 entries, 46-second
  loop), gifting, and a first version of the LIVE Copilot.
- `components/LiveSummaryScreen.tsx` — Post-LIVE recap screen.
- `lib/data.ts`, `lib/format.ts`, `lib/hooks.ts`, `lib/store.ts` — mock
  data, deterministic number formatting, animation/timer hooks, and
  Zustand-backed session persistence.

**Attributed prompt (paraphrased, Rapid UI/UX Prototyping):**
> "Build a mobile-first Next.js simulation of the TikTok app that walks a
> creator from a viral short-video spike into their first LIVE. Stages:
> For You feed → spike detection prompt → AI-style runsheet picker →
> audience waiting room → LIVE room with a chat/gift simulation and an
> in-room Copilot → post-LIVE summary. Use Tailwind, Framer Motion, and
> Zustand for state. No real backend — everything mocked."

---

## Phase 1 — Tooling

**Commit `d592fab` — "Add auto-push watcher script"**

Added `scripts/auto-push.sh` and the `npm run autopush` convenience
script to reduce manual git friction during the rapid-iteration phase of
the hackathon build.

---

## Phase 2 — Copilot v2: Placement, Cadence, Opt-Out, Moderator, Expectations

**Commit `170a9d8` — "Copilot v2: reubicación superior, cadencia
relajada, opt-out, moderador de confianza y expectativas"**

This phase converted four pieces of product feedback into shipped
behavior:

1. **Copilot repositioning.** Moved the LIVE Copilot card from its
   original placement to a fixed slot directly beneath the room header
   (`top-[94px]`), so suggestions never obscure the creator's face on
   camera — a direct response to usability feedback that the initial
   placement felt intrusive.
2. **Cadence relaxation.** Replaced an aggressive suggestion cadence with
   a first cue at 7s and a steady-state interval of ~17s
   (`COPILOT_FIRST_DELAY_MS`, `COPILOT_INTERVAL_MS` in `lib/data.ts`),
   plus a 9-second auto-dismiss, to reduce notification fatigue.
3. **Per-category opt-out.** Added a persistent "Silence this" action
   (`muteCategory` in `lib/store.ts`) so a dismissed suggestion type never
   resurfaces for the rest of the session.
4. **Trusted Moderator selection + Post-LIVE pinning.** Added the
   moderator-candidate bottom sheet in the Waiting Room
   (`AudienceBridgeScreen.tsx`) and the "pin for future LIVEs" toggle in
   the Post-LIVE recap (`LiveSummaryScreen.tsx`), both backed by
   `lib/store.ts`.
5. **Waiting Room expectation-setting.** Added the "an estimated portion
   of concurrent viewers may join" banner to reduce surprise around
   notified-audience variance.

**Attributed prompt (paraphrased, Heuristic Interface Synchronization):**
> "The Copilot currently covers the creator's face and fires too often.
> Move it to the top of the room, relax the suggestion cadence, and let
> the creator permanently silence a suggestion category. Also add a way
> to pick a trusted moderator before going live, and let them pin that
> moderator for future broadcasts from the summary screen. The Waiting
> Room should set expectations that not everyone watching the video will
> join the LIVE."

---

## Phase 3 — Production Sprint: Generative Runsheets, God Mode, Layout Hardening

*(Uncommitted at time of writing; staged for the next commit.)*

This phase focused on three independent, non-overlapping workstreams
executed in a single session:

### 3.1 Layout hardening (z-index collision fix)
The large gift banner and the highlighted-question overlay in
`LiveRoomScreen.tsx` previously used hardcoded absolute offsets
(`top-[248px]`, `top-[300px]`) that could visually collide with the
Copilot/goal/pinned-comment stack above them under specific state
combinations. Both overlays were migrated into the existing flex-column
stack (`top-[94px]`), with Framer Motion `layout` animating the reflow
when overlays enter or exit. This removed an entire class of
positioning bugs without introducing any additional render cost.

### 3.2 Generative Runsheet integration (Vercel AI SDK)
Added `app/api/generate-runsheet/route.ts`: a Next.js Route Handler using
`generateObject` (`ai` SDK) against `@ai-sdk/openai` (`gpt-4o-mini`), with
a Zod schema enforcing exactly three structured runsheet formats. The
route is designed to **never surface an error to the client** — a missing
`OPENAI_API_KEY` or any generation failure returns `{ ok: false }` with
HTTP 200, and `RunsheetScreen.tsx` silently retains its local mock data
(`RUNSHEET_FORMATS`) in that case. Dependency versions (`ai@7.0.77`,
`@ai-sdk/openai@4.0.46`, `zod@4.4.3`) were deliberately pinned to releases
with an established track record rather than floating to `latest`.

### 3.3 God Mode (internal demo control panel)
Added `components/GodModeDrawer.tsx`, activated via a global `Shift + D`
listener, enabling a presenter to: jump directly to any of the five
flow stages (auto-filling the runsheet format / session stats defaults a
skipped stage would otherwise require), force the next Copilot suggestion
on demand, and clear all persisted local state with a two-step
confirmation. This tool is explicitly excluded from the creator-facing
product surface.

**Attributed prompt (paraphrased):**
> "Execute a production sprint: fix the z-index collisions in the LIVE
> room by making the gift banner and highlighted question part of the
> same dynamic stack as the Copilot. Wire the Runsheet screen to a real
> Vercel AI SDK endpoint that generates the three formats via
> `generateObject`, with a strict, silent fallback to the local mocks if
> the AI call fails or no API key is present. Add a hidden 'God Mode'
> panel behind Shift+D for controlling the demo during a pitch — jump
> stages, force Copilot cues, and reset local storage. Verify with
> `npm run build` before finishing."

**Verification performed:** `npm run build` (TypeScript + SSR, zero
errors) and `npm run lint` (zero warnings) after each workstream.

---

## Phase 4 — Hyperrealism & Organic Chaos Sprint

*(Uncommitted at time of writing; staged for the next commit.)*

**Problem framed by design/QA review:** the LIVE room's chat simulation,
while functionally complete, was visually flat — a fixed 24-message
script looping every 46 seconds reads as repetitive within the first two
loop cycles, undermining the "viral LIVE" illusion the product depends on
for demo credibility.

### 4.1 Procedural chat data
Removed the fixed `CHAT_SCRIPT` loop entirely. Replaced it with:
- `CHAT_MESSAGE_POOL` (`lib/data.ts`) — 195 message variants assembled
  programmatically from four composable sources (short reactions,
  questions, emoji chains, and emphasis/uppercase variants of the
  reaction set), rather than hand-authored one-by-one.
- `generateUsername()` — combines 44 name stems with 20 suffixes and a
  ~55% chance of an appended numeric ID, producing handles such as
  `user84729`, `maria.gzz`, `juanperez_23`.
- `REGULAR_VIEWERS` — 11 recurring handles surfaced ~40% of the time to
  preserve a sense of audience continuity, blended with freshly generated
  identities the remaining ~60%.
- `GIFT_CATALOG` / `randomGift()` — realistic gifting value distribution
  (≈85% low-value roses, ≈15% mid/high-value gifts), plus
  `generateViralSurgeGift()` reserved for high-value gifts (≥400
  diamonds) used exclusively by the God Mode "Viral Surge" action.

### 4.2 Stochastic cadence engine
Added `useOrganicChat` (`lib/hooks.ts`), replacing the previous fixed
250ms interval scripted-playback loop. Each message is scheduled with a
randomized 50–600ms delay, with a ~12% chance per tick of firing a 3–5
message "burst" to emulate genuine excitement spikes. The hook performs
no network or heavy synchronous work inside its timer callback — it only
constructs plain objects and forwards them to a caller-supplied handler —
preserving the 60fps performance budget.

### 4.3 Isolated particle system
Extracted the floating-heart ("like") animation out of
`LiveRoomScreen`'s top-level state into a self-contained, memoized
`HeartsField` component with its own internal interval. This was a
deliberate performance correction: the previous implementation drove
heart particles from parent-level state, meaning every particle tick
re-rendered the entire LIVE room tree. Each `FloatingHeart` now animates
along a three-keyframe path (position, scale, opacity) approximating a
bezier trajectory, and self-unmounts after its transition completes,
keeping the DOM particle count bounded (≤14 concurrent hearts).

### 4.4 God Mode: Viral Surge
Extended `GodModeDrawer.tsx` with a "Force Viral Surge" action that, via a
`window` `CustomEvent`, simultaneously triggers: 15 chat messages spaced
across ~1 second, a burst of 20 floating hearts, and a single high-value
gift — giving a presenter an on-demand way to demonstrate the room's
peak-excitement state during a live pitch.

**Attributed prompt (paraphrased):**
> "The LIVE room simulation feels robotic and repetitive — comments loop
> too predictably. Replace the scripted chat with a procedurally
> generated pool of 150-200+ diverse messages (short reactions, emoji
> chains, questions, join events, sporadic gift drops) and a believable
> username generator. Rebuild the cadence as a stochastic engine with
> randomized 50-600ms delays and occasional 3-5 message bursts. Make the
> floating heart particles fully isolated so they never re-render the
> rest of the screen, and give the God Mode panel a 'Force Viral Surge'
> button that injects 15 messages in a second, 20 hearts, and one
> high-value gift. Keep it at 60fps, don't touch the Zustand store or the
   AI SDK integration, and verify the production build compiles cleanly."

**Verification performed:** `npm run build` (zero errors) and
`npm run lint` (zero warnings, one auto-fixed unused-directive warning)
after implementation.

---

## Engineering Principles Observed Across All Phases

1. **Fail silent, never fail visible.** Every external dependency
   (the Runsheet generation endpoint) degrades to a local, deterministic
   mock without a user-visible error state.
2. **Performance budget enforced per-feature.** No interval- or timer-
   driven simulation loop (chat, viewer count, heart particles, Copilot
   cadence) performs network I/O or unbounded DOM growth; explicit caps
   (`MAX_CHAT_NODES = 40`, ≤14 concurrent heart particles) are enforced at
   the data-structure level, not just visually.
3. **Read-before-write on every existing surface.** New capabilities
   (God Mode, the Runsheet API, the organic chat engine) were additive:
   no unrelated component's public props, the Zustand store shape, or the
   AI SDK integration were altered by later phases.
4. **Dependency pinning discipline.** New third-party dependencies were
   pinned to specific, previously-published versions rather than floating
   ranges, to avoid pulling in unvetted releases during a time-boxed
   build.
