# LIVE Launchpad — Hackathon Submission

| | |
|---|---|
| **Project** | LIVE Launchpad |
| **Track** | TikTok Global Hackathon |
| **Repo** | `oscaryahirriquelmemartinez/tiktok-live-launchpad` |
| **Where we're at** | MVP prototype — front-end is fully working, backend is intentionally still fake |
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

- **Optional:** drop an `OPENAI_API_KEY` into `.env.local` if you want to
  see the real AI-generated runsheets instead of the local mocks. Without
  it, the app quietly falls back to the mocks — that's expected, not
  broken (see `PRD.md`, Section 4.3).
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
backend, no tests, no analytics, no auth. The full breakdown is in the
chat response that came with this doc, sorted by how much it'd hurt to
ship without it.

---

## 6. Where things stand

- [x] Whole flow works end to end (Feed → Runsheet → Waiting Room → LIVE
  Room → Recap)
- [x] `PRD.md` — what we're building and why
- [x] `DEVELOPMENT_LOG.md` — how we actually built it, prompts included
- [x] `CHANGELOG.md` — what changed, for anyone tracking it
- [x] `HACKATHON_SUBMISSION.md` — this doc
- [ ] Real, verified demo URL for judges (waiting on the team to confirm)
- [ ] Alan / Farid / Ana Maria adding their own specific artifacts to
  Section 2.1
