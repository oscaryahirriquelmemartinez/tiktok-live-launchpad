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
