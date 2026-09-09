# LIVE Launchpad — Product Requirements Doc

| | |
|---|---|
| **Status** | MVP prototype, front-end complete |
| **Built by** | Ana María Prada, Alan Tang, Farid Porte Petit, Oscar Riquelme |
| **Platform** | TikTok LIVE (mobile-first web prototype, Next.js App Router) |
| **Doc version** | 1.0 |
| **Last updated** | 2026-09-01 |

---

## 1. What we're building

Every short-video platform is great at telling a creator "hey, your video
is blowing up." None of them do anything useful with that moment. The
creator is left staring at a spike in their analytics with no idea what
to actually do about it, and by the time they figure it out, the spike is
gone.

**LIVE Launchpad** is our attempt to close that gap: the second a
creator's short video spikes, we hand them a broadcast plan, warm up a
room with people who already reacted to that exact video, and coach them
through the first few minutes so they're not improvising on camera in
front of strangers.

What we've actually built so far is a fully clickable, mobile-first
front-end prototype. It's not connected to a real backend yet — we'll get
to why that's fine for now and what it means for later — but every screen
in the flow works, animates, and behaves the way we want the real product
to feel. We also wired in a real AI call for the broadcast-planning step
(more on that below), so this isn't purely a static mockup.

### 1.1 Who this is for

- **Mainly: the "almost ready" creator.** Someone with a real niche
  audience (roughly 10K–500K followers), posting short-form video
  consistently, who occasionally has a video massively outperform their
  usual numbers. They've never done a LIVE, or tried once and it felt
  awkward. They have the audience to make a LIVE work — they just don't
  have the reps.
- **Secondary: whoever ends up moderating for them.** A top fan, a
  friend, another small creator — someone the creator trusts enough to
  hand pinning/spam duty to so they can focus on the camera instead of
  the chat.

---

## 2. The actual problem (and why we think it's four problems, not one)

We kept hearing the same four things from creators, in slightly different
words, and we think all four have to be solved together or the whole idea
falls apart:

1. **"I don't know what I'd even talk about."** There's no script. Going
   live means improvising for 20+ minutes with no plan, based on a video
   that just happened to catch fire.
2. **"I don't know how to run it once I'm there."** Even with a topic,
   most creators have never seen what "pin this comment now" or "thank
   this person for their gift by name" looks like in practice. There's no
   format, no playbook.
3. **"By the time I figure out I should go live, it's too late."** Spikes
   don't last. The gap between "this video is taking off" and "attention
   has already moved on" is minutes, not hours — and manually deciding to
   go live takes longer than that.
4. **"I'm scared of starting with zero people in the room."** This one
   came up constantly and we think it's the biggest blocker of the four.
   Nobody wants to hit "Go Live" and stare at an empty room. There's
   currently no way to pull the people who *just* engaged with your video
   into a LIVE before you start.

We didn't want to solve one of these and ship a half-answer. LIVE
Launchpad is built as one continuous flow specifically because each step
exists to knock out one of these four fears in order.

---

## 3. What's actually in the prototype

### 3.1 Spike Prompt
A bottom-sheet that shows up once a video crosses a "this is spiking"
threshold (view count, multiplier vs. that creator's normal baseline,
concurrent watchers). It's blunt about the opportunity ("your video is
12x your average, 2,847 people are watching it right now") and gives a
single obvious next step. If someone dismisses it, we don't nag — a pill
stays available on the feed so they can come back to it.

*Where it lives:* `components/SpikePromptModal.tsx`, triggered from
`app/page.tsx`. Right now it fires after a flat 5-second timer on the
feed — that's a stand-in for real spike detection, not the real thing
(see Section 5).

### 3.2 AI-generated Runsheet (the "what to say" / "how to say it" fix)
Once someone accepts the Spike Prompt, we look at the video's own data
(caption, hashtags, views, comment count, how far above baseline it is)
and hand back **three concrete broadcast formats** — a live Q&A angle
built for retention, a gifting-goal angle built for monetization, and a
cook-along angle built for watch time — each with an actual minute-by-
minute plan. Creator picks one and they're already moving. No blank page,
no "uh, what do I even say."

*Where it lives:* `components/RunsheetScreen.tsx` calls
`POST /app/api/generate-runsheet`, which is a real integration with the
**Vercel AI SDK** (`generateObject`, `@ai-sdk/openai`, `gpt-4o-mini`),
validated against a Zod schema so we always get back exactly the shape we
expect. If there's no API key configured, or the call fails, or it takes
too long, the endpoint just responds `{ ok: false }` and the client
quietly falls back to a set of hand-written mocks
(`RUNSHEET_FORMATS` in `lib/data.ts`) — the creator never sees an error.
We were pretty firm about this one: a demo (or a real product) can't
break just because an AI provider had a bad day.

### 3.3 Audience Bridge / Waiting Room (the "empty room" fix)
After picking a format, we start actively routing the creator's own
reactive audience — people who liked, commented, or shared the video that
just spiked — into a waiting room, with a live counter, a simulated push
notification ("🔴 valen.cocina is LIVE now"), and a banner that's upfront
about the fact that not everyone watching will actually join
("an estimated portion of the ~2,847 people watching may join — the
final number can vary"). We added that expectations banner specifically
because early feedback was that a raw number felt like an over-promise.

Two decisions get made once here and carried forward instead of being
re-asked every time:

- The **format**, carried over from the Runsheet step.
- The **trusted moderator** — a candidate list the creator can pick from
  to hand off pinning/spam duty before they even start.

A 3-2-1 countdown only unlocks once a minimum notified-audience number is
hit, so nobody starts from zero.

*Where it lives:* `components/AudienceBridgeScreen.tsx`.

### 3.4 LIVE Copilot (the "when to say it" fix)
Once the broadcast starts, an assistant surfaces one suggestion at a
time — pin the recipe, thank a gifter by name, surface a question that's
getting repeated in chat, announce a gifting goal, welcome a wave of new
joiners — anchored right under the room header so it never covers the
creator's face. We deliberately slowed this down after it first felt too
naggy: first suggestion at 7 seconds, then roughly every 17 seconds,
auto-dismissed after 9 seconds if ignored. Creators can permanently mute
a suggestion category for the rest of the session if it's not for them.
Every overlay that can appear in the room (the Copilot card, the "you
muted this" confirmation, the gift-goal bar, a pinned comment, a big gift
banner, a highlighted question) now lives in the same stacking container,
which fixed an annoying bug where two of these could visually collide.

*Where it lives:* `useCopilotMessages` (`lib/hooks.ts`), rendered inside
`components/LiveRoomScreen.tsx`.

### 3.5 Chat & gifting that doesn't feel scripted
We wanted the room to feel alive during demos, not like it's replaying a
tape. So chat messages, joins, and gifts come from a randomized engine
instead of a fixed loop: message timing is randomized between 50–600ms,
with occasional bursts of 3–5 messages back-to-back to fake a real spike
of excitement, usernames are generated on the fly and mixed with a
handful of recurring "regulars" so the room feels continuous rather than
purely random, and gifts follow a realistic distribution — mostly cheap
roses, rarely something expensive. The floating heart animation runs
completely on its own, isolated from the rest of the screen's state, so
it never causes the room to drop frames.

*Where it lives:* `useOrganicChat` (`lib/hooks.ts`), `HeartsField` /
`FloatingHeart` (`components/LiveRoomScreen.tsx`), the message/username/
gift pools in `lib/data.ts`.

### 3.6 Post-LIVE recap
When the broadcast ends, we show duration, peak viewers, diamonds earned,
new followers — and give the creator the option to pin the moderator who
just helped them for all future LIVEs, so that decision doesn't have to
be made from scratch every single time.

*Where it lives:* `components/LiveSummaryScreen.tsx`.

### 3.7 God Mode (our own tool, not a creator feature)
We built a hidden control panel (`Shift + D`) purely so we — or anyone
demoing this — can jump straight to any screen, force a Copilot
suggestion on demand, trigger a "Viral Surge" (15 chat messages in about
a second, 20 hearts at once, one big gift) to show off the room's peak
energy without waiting around, and wipe local state for a clean re-run.
This has nothing to do with the actual product and shouldn't ship to
real users.

*Where it lives:* `components/GodModeDrawer.tsx`.

---

## 4. How it's actually built

### 4.1 Stack, as it exists right now

| Layer | Tech | Notes |
|---|---|---|
| Framework | Next.js 16, App Router, Turbopack | one client-driven flow, `app/page.tsx` |
| UI | React 19, Tailwind CSS v4 | mobile shell capped at `max-w-[400px]` |
| Motion | Framer Motion | every transition, overlay, particle |
| Client state | Zustand + `persist` (localStorage) | moderator, muted Copilot categories, pinned flag |
| Generative AI | Vercel AI SDK + `@ai-sdk/openai`, Zod | server route, `generateObject`, falls back gracefully |
| Icons | lucide-react | |

We want to be straight about this: **there's no real backend and no
WebSocket/real-time transport right now.** Chat, gifts, viewer counts,
the audience ramp in the waiting room — all of that is faked on the
client with randomized timers and React state. We made that call
knowingly, because it means the whole demo runs offline, with zero infra,
which mattered a lot for a hackathon timeline. It's called out here so
this doc doesn't overstate what's actually running.

### 4.2 How the flow is wired

`app/page.tsx` steps through five states —
`feed → runsheet → bridge → live → summary` — with Framer Motion handling
the slide transitions between them. Each screen only gets the props it
actually needs (the chosen format, starting viewer count, end-of-LIVE
stats), so screens don't reach into each other's state.

### 4.3 How the Runsheet call actually works

```
RunsheetScreen (client)
  → POST /api/generate-runsheet  { caption, hashtags, views, comments, multiplier }
     → generateObject({ model: openai("gpt-4o-mini"), schema: ResponseSchema })
        → { ok: true, formats: RunsheetFormat[3] }   // it worked
        → { ok: false, reason }                       // no key / failed / timed out
  ← client checks the shape (isValidFormats) and swaps mocks for the AI
    output, or just keeps the local mocks if anything went wrong
```

We made a point of always returning HTTP 200 on the "no AI available"
path — a non-200 is reserved for genuine network failure — so the
client's own success/failure check is what actually decides the
fallback, not the status code.

### 4.4 What we're actually persisting

`lib/store.ts` is one Zustand store, saved to `localStorage` under
`live-launchpad-session`: the chosen moderator, which Copilot categories
got muted, and whether the moderator got pinned for next time. It
survives a page reload on the same browser, but it's tied to that one
device — nothing syncs across sessions or devices yet. That's the single
biggest thing standing between this and a real product (more below).

### 4.5 Performance rules we held ourselves to

- Chat never renders more than 40 messages at once (`MAX_CHAT_NODES`) —
  old ones get evicted, and rows are memoized so unrelated updates don't
  repaint the whole list.
- The floating hearts run in their own memoized component with their own
  timer, so heart animation ticks never re-render the LIVE room around
  them.
- Nothing inside a repeating loop (chat, viewer count, hearts) ever makes
  a network call. The Runsheet request is the only network call in the
  entire flow, and it happens exactly once.

---

## 5. What we didn't build (and why that's okay for now)

These next two things get referenced in how we talk about the product,
but **they are not in the codebase today.** We're calling that out
explicitly here instead of letting the doc imply otherwise.

### 5.1 Moving the "real-time" stuff to an actual backend (Supabase)
Right now the chat/gift/viewer simulation is a stand-in for what a real
deployment would need. The plan, when we get to it:
- **Supabase Realtime** as the actual transport for chat, gifts, and
  viewer presence — subscribing to a live channel instead of
  `useOrganicChat`'s client-side timers.
- **Supabase Postgres** as the real system of record for session
  history, moderator relationships, and Copilot preferences, replacing
  the `localStorage`-only setup in `lib/store.ts` with something that
  actually syncs across devices (behind Supabase Auth).
- **Supabase Edge Functions** as the natural place to run real spike
  detection instead of the flat 5-second timer we're using today.

### 5.2 Lottie for the animations that are too fancy to hand-code
Right now every celebratory moment (gift-goal completion, first-LIVE
milestone) is a hand-tuned Framer Motion keyframe sequence. At some point
we'll want designer-made, After Effects–sourced animations that go beyond
what's reasonable to hand-code — that's where Lottie comes in, without
blowing the 60fps budget from Section 4.5.

### 5.3 Actual spike detection
The Spike Prompt firing on a flat timer is purely a demo stand-in. A real
version needs an actual analytics pipeline — view velocity, multiplier
against a rolling baseline, concurrent watchers — feeding a decision
service, which is exactly the kind of thing the Edge Function in 5.1
would run.

---

## 6. How we'll know if this is working

| Metric | What it tells us |
|---|---|
| Spike-to-LIVE conversion rate | % of Spike Prompt views that turn into an actual broadcast |
| Time-to-LIVE | how long from "accepted the prompt" to "actually live" |
| Empty-room avoidance rate | % of first LIVEs that start with more than zero people already in |
| Copilot engagement rate | % of suggestions acted on vs. dismissed/muted |
| Moderator adoption rate | % of creators who pick a moderator and then pin them afterward |
