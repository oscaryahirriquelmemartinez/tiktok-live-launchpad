# LIVE Launchpad — Product Requirements Document

| **Status** | MVP (Prototype) |
| **Owner** | Ana María Prada, Alan Tang, Farid Porte Petit, Oscar Yahir Riquelme Martinez|
| **Platform** | TikTok LIVE (mobile, App Router web prototype) |
| **Document version** | 1.0 |
| **Last updated** | 2026-09-01 |

---

## 1. Executive Summary

**LIVE Launchpad** is a guided onboarding flow that converts a short-video
creator's viral traffic spike into their first LIVE broadcast, at the exact
moment audience attention is highest. Instead of asking a creator to
independently decide *whether*, *what*, and *how* to go live, the product
detects the spike, generates a ready-to-run broadcast plan, pre-warms a
waiting room with the creator's own reactive audience, and provides
real-time, in-broadcast coaching so the creator never has to improvise
alone.

The current codebase is a fully interactive, mobile-first front-end
prototype (Next.js App Router) that simulates the entire end-to-end
journey — from the "For You" feed to the post-LIVE recap — with realistic,
high-fidelity motion design, a generative AI integration for broadcast
planning, and a deterministic fallback path that guarantees the experience
never fails, even without network access or a configured AI provider.

### 1.1 Target Audience

- **Primary persona: the mid-tier short-video creator.** Creators with an
  established niche following (roughly 10K–500K followers) who post
  short-form video regularly but have little or no experience hosting a
  LIVE broadcast. They post consistently enough to occasionally produce a
  video that significantly outperforms their baseline (a "spike"), but
  lack the muscle memory, script, or confidence to capitalize on that
  moment in real time.
- **Secondary persona: the creator's trusted moderator.** A top fan, peer
  creator, or long-time follower who can be delegated pinning and spam
  moderation duties during the broadcast, reducing the cognitive load on
  the creator.

---

## 2. Problem Statement

Short-video platforms are exceptionally good at surfacing a creator's
viral moment; they are not good at helping the creator convert that moment
into a LIVE audience. Through creator interviews and platform behavior
analysis, four recurring pain points were identified as the primary
blockers preventing spike-to-LIVE conversion:

1. **"I don't know what to say."** Creators freeze when asked to plan LIVE
   content on the spot. There is no structured, data-informed script
   connecting the video that went viral to a concrete LIVE agenda.
2. **"I don't know how to say it."** Even with a topic, creators lack a
   repeatable presentation format (Q&A, cook-along, goal-based, etc.) and
   the in-the-moment cues (when to pin a comment, when to thank a gifter,
   when to announce a goal) that make a broadcast feel professional.
3. **"I don't know when to go live."** By the time a creator manually
   decides to start a broadcast, the traffic spike has often already
   cooled off. The window between "video goes viral" and "audience
   attention decays" is measured in minutes, not hours.
4. **"I'm afraid of the empty room."** The single biggest deterrent to a
   first LIVE is the fear of starting a broadcast with zero viewers. There
   is no mechanism today that proactively routes a creator's own reactive
   audience (people who just liked/commented/shared the spiking video)
   into the LIVE room before the creator presses "Go Live."

LIVE Launchpad directly addresses all four pain points with a single,
uninterrupted flow.

---

## 3. Core Features

### 3.1 Spike Prompt
A proactively surfaced, non-blocking bottom-sheet that appears when a
creator's video crosses a virality threshold (defined here as view count,
multiplier vs. baseline, and concurrent watchers). It quantifies the
opportunity ("your video is 12x your average, 2,847 people are watching
right now") and offers a single, low-friction CTA ("Go LIVE now") that
kicks off the rest of the flow. Creators who dismiss the prompt are not
penalized — a persistent re-entry pill remains available on the feed.

*Implementation:* `components/SpikePromptModal.tsx`, triggered from
`app/page.tsx` after a fixed dwell time on the feed (prototype uses a
5-second timer as a stand-in for a real spike-detection trigger).

### 3.2 AI-Generated Runsheet ("what to say" + "how to say it")
Upon accepting the Spike Prompt, the system analyzes the viral video's
metadata (caption, hashtags, view count, comment volume, multiplier) and
proposes **three concrete, time-boxed broadcast formats** — e.g., a live
Q&A optimized for retention, a gifting-goal format optimized for
monetization, and a "cook-along" format optimized for watch-time — each
with a minute-by-minute agenda. The creator picks one and moves on with a
plan already in hand; there is no blank page.

*Implementation:* `components/RunsheetScreen.tsx` requests a structured
runsheet from `POST /app/api/generate-runsheet`, which uses the **Vercel
AI SDK** (`generateObject`, `@ai-sdk/openai`, model `gpt-4o-mini`) with a
Zod-validated schema to guarantee shape correctness. If no API key is
configured, or the request fails or times out, the endpoint returns
`{ ok: false }` and the client transparently falls back to a curated local
mock (`RUNSHEET_FORMATS` in `lib/data.ts`) with **no visible error state**
to the creator. This fallback-first design was a deliberate reliability
requirement: the demo (and, by extension, the production experience) must
never break due to AI provider unavailability.

### 3.3 Audience Bridge / Waiting Room ("the empty room fear")
Once a format is selected, the app actively "bridges" the creator's
existing reactive audience (people who engaged with the spiking video)
into a pre-LIVE waiting room, with a live-updating notified-viewer counter,
a simulated native push notification, and an explicit **expectation-setting
banner** ("an estimated portion of the ~2,847 people currently watching
your video may join; the final number can vary") so creators calibrate
expectations rather than being surprised by variance. The waiting room
also surfaces two decisions made once and remembered thereafter:

- **Format confirmation** (carried over from the Runsheet step).
- **Trusted Moderator selection** — the creator can delegate comment
  pinning and spam moderation to a top fan or peer creator before the
  broadcast starts, addressing the "who helps me run this" concern.

A 3-2-1 countdown transitions the creator into the LIVE room only once a
minimum notified-audience threshold is met, reinforcing that they are
never starting from zero.

*Implementation:* `components/AudienceBridgeScreen.tsx`.

### 3.4 Real-Time LIVE Copilot ("when to say it")
During the broadcast, an in- context assistant surfaces exactly one
suggestion at a time — pin the recipe, thank a gifter by name, surface a
highlighted question, announce a gifting goal, welcome a wave of new
joiners — anchored below the room header so it never obstructs the
creator's face on camera. Suggestions are paced deliberately (first cue at
7s, every ~17s thereafter, auto-dismissed after 9s of inactivity) to avoid
notification fatigue, and creators can **opt out of a suggestion category
permanently** for the session (persisted opt-out list), giving them
control over the assistant's intrusiveness. All prior overlays (Copilot,
opt-out confirmation, gift goal, pinned comment, large gift banner,
highlighted question) share a single reflowing vertical stack, eliminating
z-index collisions between simultaneous overlays.

*Implementation:* `useCopilotMessages` (`lib/hooks.ts`), rendered inside
`components/LiveRoomScreen.tsx`.

### 3.5 Organic Chat & Gifting Simulation
To make the prototype's LIVE room feel authentic during demos and
usability testing, chat activity, joins, and gifting are generated by a
**stochastic engine** rather than a fixed, loopable script: message
delays are randomized (50–600ms) with occasional 3–5 message "bursts" to
mimic real excitement spikes, usernames are procedurally generated
(`generateUsername()`) and blended with a set of recurring "regular
viewers" for continuity, and gifts follow a realistic value distribution
(frequent low-value roses, rare high-value gifts). Floating "like" hearts
run in an isolated, memoized component so particle animation never
triggers a re-render of the broadcast screen, keeping the experience at a
steady 60fps.

*Implementation:* `useOrganicChat` (`lib/hooks.ts`), `HeartsField` /
`FloatingHeart` (`components/LiveRoomScreen.tsx`), procedural data pool in
`lib/data.ts`.

### 3.6 Post-LIVE Recap
On ending the broadcast, the creator sees a summary (duration, peak
viewers, diamonds earned, new followers) and is offered the option to
**pin the session's trusted moderator** for all future LIVEs, closing the
loop on the "who helps me run this" decision so it does not need to be
re-made every time.

*Implementation:* `components/LiveSummaryScreen.tsx`.

### 3.7 God Mode (internal demo/QA tooling)
A developer-only control panel (`Shift + D`) allows a presenter to jump
directly to any stage of the flow, force the next Copilot suggestion
on demand, trigger a "Viral Surge" (15 chat messages within ~1s, 20
simultaneous floating hearts, and one high-value gift) to showcase the
room's peak-excitement state on demand, and clear persisted local state
for a clean re-run. This tool is not part of the creator-facing product.

*Implementation:* `components/GodModeDrawer.tsx`.

---

## 4. Technical Architecture

### 4.1 Stack (as implemented today)

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | Single-page client flow driven by `app/page.tsx` |
| UI | React 19, Tailwind CSS v4 | Mobile-first, `max-w-[400px]` shell simulating a phone viewport |
| Motion | Framer Motion | All transitions, overlays, particle systems |
| Client state | Zustand + `persist` middleware (`localStorage`) | Session-scoped: chosen moderator, muted Copilot categories, moderator-pinned flag |
| Generative AI | Vercel AI SDK (`ai`, `@ai-sdk/openai`), Zod schemas | Server-side route handler, `generateObject`, graceful degradation |
| Icons | lucide-react | |

There is **no persistent backend datastore and no WebSocket/real-time
transport in the current implementation.** All "live" behavior (chat,
gifting, viewer counts, notified-audience ramp) is deterministically
simulated on the client using randomized timers (`setTimeout`/
`setInterval`) and in-memory React state. This is an intentional
prototype-stage decision that keeps the demo fully functional offline and
without any backend provisioning, and it is called out explicitly here so
the architecture section remains accurate to the shipped code.

### 4.2 Application Flow (State Machine)

`app/page.tsx` orchestrates five mutually exclusive stages —
`feed → runsheet → bridge → live → summary` — with directional,
spring-animated transitions (Framer Motion `AnimatePresence`). Each stage
is a self-contained component receiving only the props it needs
(selected runsheet format, starting viewer count, ending stats), keeping
cross-stage coupling minimal.

### 4.3 Generative Runsheet Pipeline

```
RunsheetScreen (client)
  → POST /api/generate-runsheet  { caption, hashtags, views, comments, multiplier }
     → generateObject({ model: openai("gpt-4o-mini"), schema: ResponseSchema })
        → { ok: true, formats: RunsheetFormat[3] }   // success path
        → { ok: false, reason }                       // missing key / failure / timeout
  ← client validates shape (isValidFormats) and swaps mocks → AI output,
    or silently keeps the local mocks (RUNSHEET_FORMATS) on any failure
```

The route always responds with HTTP 200 on the "no AI available" path by
design — a non-200 status is reserved for genuine transport failures,
ensuring the client's `fetch`/`try-catch` fallback logic is the single
source of truth for "did generation succeed," not the HTTP status code.

### 4.4 Local State Persistence

`lib/store.ts` defines a single Zustand store persisted under the
`live-launchpad-session` `localStorage` key, holding: the selected trusted
moderator, the list of Copilot suggestion categories the creator has
opted out of, and whether the moderator was pinned for future LIVEs. This
state intentionally survives page reloads within a browser but is
device-local — it is **not** synchronized across devices or sessions,
which is the primary gap addressed in the roadmap below.

### 4.5 Performance Constraints

- The chat surface caps rendered DOM nodes at 40 (`MAX_CHAT_NODES`), with
  the oldest messages evicted on overflow; chat rows are memoized
  (`React.memo`) so unrelated updates don't force a full list re-paint.
- The floating-heart particle system is isolated into its own memoized
  component with a self-contained interval, so its render cycle never
  propagates to the parent LIVE room tree.
- No network requests occur inside any interval-driven loop (chat,
  viewer-count, or heart-particle timers); the only network call in the
  entire flow is the one-shot Runsheet generation request.

---

## 5. Out of Scope / Roadmap (Phase 2)

The following capabilities are referenced in the product vision but are
**not present in the current codebase**. They are documented here as
forward-looking architecture, not as shipped functionality, to keep this
PRD an accurate reflection of the prototype.

### 5.1 Backend Real-Time Migration (Supabase)
The current chat/gifting/viewer simulation is a client-only stand-in for
what would, in production, be a genuine real-time transport. The intended
Phase 2 migration replaces the local stochastic engine with:
- **Supabase Realtime (Postgres logical replication / broadcast
  channels)** as the transport for chat messages, gift events, and viewer
  presence, replacing `useOrganicChat`'s client-side timers with a
  subscription to a live channel.
- **Supabase Postgres** as the system of record for session history,
  moderator relationships, and Copilot opt-out preferences — replacing the
  current `localStorage`-only persistence in `lib/store.ts` with a
  synced, multi-device source of truth (Supabase Auth would gate this).
- **Supabase Edge Functions** as the natural home for the spike-detection
  trigger that currently exists only as a fixed 5-second demo timer in
  `app/page.tsx`.

### 5.2 Motion/Asset Pipeline (Lottie)
Complex celebratory or onboarding animations (e.g., gift-goal completion,
first-LIVE milestone) are currently implemented as hand-tuned Framer
Motion keyframe sequences. A Lottie integration is planned for
designer-authored, After Effects–sourced animations that exceed what is
practical to hand-code in Framer Motion, without impacting the 60fps
performance budget established in Section 4.5.

### 5.3 Live Spike Detection
The Spike Prompt's trigger condition is currently a fixed timer for
demonstration purposes. Production spike detection requires a real
analytics pipeline (view velocity, multiplier vs. rolling baseline,
concurrent-watcher count) feeding a decision service — a natural fit for
the Supabase Edge Function described in 5.1.

---

## 6. Success Metrics (Product)

| Metric | Definition |
|---|---|
| Spike-to-LIVE conversion rate | % of Spike Prompt impressions that result in a started broadcast |
| Time-to-LIVE | Elapsed time from Spike Prompt acceptance to broadcast start |
| Empty-room avoidance rate | % of first-time LIVEs starting with >0 notified/bridged viewers |
| Copilot engagement rate | % of surfaced Copilot cues acted upon vs. dismissed/muted |
| Moderator adoption rate | % of creators who select a trusted moderator and later pin them post-LIVE |
