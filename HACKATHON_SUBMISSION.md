# LIVE Launchpad — Hackathon Submission

| | |
|---|---|
| **Project** | LIVE Launchpad |
| **Track** | TikTok Global Hackathon |
| **Repository** | `oscaryahirriquelmemartinez/tiktok-live-launchpad` |
| **Submission status** | MVP Prototype (functional, front-end complete) |
| **Companion documents** | `PRD.md`, `DEVELOPMENT_LOG.md`, `CHANGELOG.md` |

---

## 1. One-Line Pitch

LIVE Launchpad converts a creator's short-video viral spike into their
first TikTok LIVE broadcast — generating a ready-to-run runsheet,
pre-warming a waiting room with the creator's own reactive audience, and
coaching them in real time so they never have to improvise alone.

---

## 2. Team & Ownership

| Name | Ownership Area |
|---|---|
| **Alan Tang** | Product & Design Owner |
| **Farid Porte Petit** | Strategy & Market Validation Owner |
| **Ana Maria Prada** | Research & Problem Validation Owner |
| **Oscar Riquelme** | Creator Insights & Beta Planning Owner |

> **Note on attribution methodology:** the sections below map each team
> member's declared ownership area to the corresponding artifact in this
> submission. The project's version-controlled implementation history
> (`DEVELOPMENT_LOG.md`, `git log`) reflects the engineering execution
> phase and does not itself carry per-person commit attribution; the
> matrix below should be treated as a **role-to-deliverable** map, not a
> claim of specific line-level authorship.

### 2.1 Contribution Matrix (Role → Deliverable)

| Owner | Ownership Area | Primary Deliverable(s) in this Submission |
|---|---|---|
| **Alan Tang** | Product & Design | Section 3 ("Core Features") and Section 4.2 ("Application Flow") of `PRD.md` — the five-stage interaction model (Spike Prompt → Runsheet → Waiting Room → LIVE Room → Recap), overlay choreography, and the motion/visual design language (Tailwind theme tokens, Framer Motion transition system) implemented across `components/*.tsx`. |
| **Farid Porte Petit** | Strategy & Market Validation | Section 6 ("Success Metrics") of `PRD.md` and the market framing in Section 1 ("Executive Summary") — the business case for spike-to-LIVE conversion as a growth lever, and the KPI set (conversion rate, time-to-LIVE, empty-room avoidance rate) the product is designed to move. |
| **Ana Maria Prada** | Research & Problem Validation | Section 2 ("Problem Statement") of `PRD.md` — the four validated creator pain points ("what to say," "how to say it," "when to go live," "empty room fear") that this MVP's feature set is directly designed to resolve. |
| **Oscar Riquelme** | Creator Insights & Beta Planning | Section 1.1 ("Target Audience") and Section 5 ("Roadmap / Phase 2") of `PRD.md`, the engineering build log (`DEVELOPMENT_LOG.md`), and this submission's Gap Analysis (Section 5 below) — translating creator-facing insight into the phased beta/production plan. |

*(This matrix intentionally does not assign specific source files or
commits to individuals beyond what is stated above, per the project's
single-contributor git history at the time of this submission. Each
owner is encouraged to expand their row with specific artifacts —
interview notes, market research decks, beta cohort plans — ahead of
final judging.)*

---

## 3. Build Log Summary

Full detail lives in `DEVELOPMENT_LOG.md`. Condensed timeline:

| Phase | Summary | Git Reference |
|---|---|---|
| 0 | Repository scaffold: Next.js 16 App Router shell, five-stage flow, mock data layer | `4347778` |
| 1 | Tooling: automated push watcher for rapid iteration | `d592fab` |
| 2 | Copilot v2: repositioning, cadence relaxation, per-category opt-out, trusted moderator flow, waiting-room expectation-setting | `170a9d8` |
| 3 | Production sprint: z-index/layout hardening, Vercel AI SDK-generated runsheets with silent fallback, "God Mode" demo control panel | staged, pending commit |
| 4 | Hyperrealism sprint: procedural chat/gift simulation, stochastic cadence engine, isolated particle rendering, "Viral Surge" demo trigger | staged, pending commit |

### 3.1 AI-Attributed Prompts

This build used AI pair-programming (Devin CLI, Claude Sonnet models) in
short, iterative **Rapid UI/UX Prototyping** cycles. The governing prompts
for each phase, reproduced from `DEVELOPMENT_LOG.md`:

- **Phase 0:** *"Build a mobile-first Next.js simulation of the TikTok
  app that walks a creator from a viral short-video spike into their
  first LIVE... Use Tailwind, Framer Motion, and Zustand for state. No
  real backend — everything mocked."*
- **Phase 2:** *"The Copilot currently covers the creator's face and
  fires too often. Move it to the top of the room, relax the suggestion
  cadence, and let the creator permanently silence a suggestion
  category... The Waiting Room should set expectations that not everyone
  watching the video will join the LIVE."*
- **Phase 3:** *"Execute a production sprint: fix the z-index collisions
  in the LIVE room... Wire the Runsheet screen to a real Vercel AI SDK
  endpoint... with a strict, silent fallback to the local mocks... Add a
  hidden 'God Mode' panel behind Shift+D for controlling the demo during
  a pitch."*
- **Phase 4:** *"The LIVE room simulation feels robotic and repetitive...
  Replace the scripted chat with a procedurally generated pool of
  150-200+ diverse messages... Rebuild the cadence as a stochastic
  engine... Keep it at 60fps, don't touch the Zustand store or the AI SDK
  integration."*

Each phase was closed out with an automated build/lint verification pass
(`npm run build`, `npm run lint`) before being considered complete.

---

## 4. Panelist Access Guide

### 4.1 Local Evaluation (recommended for judging)

```bash
git clone https://github.com/oscaryahirriquelmemartinez/tiktok-live-launchpad.git
cd tiktok-live-launchpad
npm install
npm run dev
```

Open `http://localhost:3000`. The experience is a self-contained,
mobile-width simulation (max 400px viewport) — no login, no seeded data,
and no backend provisioning is required to evaluate the full flow.

- **Optional:** set `OPENAI_API_KEY` in `.env.local` to evaluate the live
  Vercel AI SDK–generated runsheets; without it, the app **automatically
  and silently** falls back to curated local runsheet mocks — this is
  expected behavior, not a bug, and is documented in `PRD.md` Section
  4.3.
- **God Mode (presenter/panelist shortcut):** press **`Shift + D`** on
  any screen to open an internal control panel that lets a panelist jump
  directly to any stage of the flow (Feed / Runsheet / Waiting Room /
  LIVE Room / Post-LIVE) without replaying the full onboarding sequence,
  force a LIVE Copilot suggestion on demand, or trigger a "Viral Surge"
  to instantly observe the LIVE room at peak chat/gifting activity.

### 4.2 Hosted Evaluation

A Vercel project (`tiktok-live-launchpad`) is linked to this repository
for continuous deployment. **The production URL is intentionally not
listed in this document** pending confirmation from the team of the
canonical domain to hand to judges — the team should insert the verified
`https://<project>.vercel.app` (or custom domain) URL here before final
submission, rather than relying on an unverified guess.

---

## 5. MVP Gap Analysis (Preview)

A full, prioritized breakdown is delivered separately in the chat
response accompanying this document. In summary, the current prototype
is front-end complete but has no persistent backend, no automated test
coverage, no analytics instrumentation, and no authentication layer —
all required before a genuine creator-facing beta. See the chat output
for the complete, categorized punch list.

---

## 6. Submission Checklist

- [x] Functional end-to-end prototype (Feed → Runsheet → Waiting Room →
  LIVE Room → Post-LIVE Recap)
- [x] `PRD.md` — product requirements and roadmap
- [x] `DEVELOPMENT_LOG.md` — engineering build log with attributed prompts
- [x] `CHANGELOG.md` — user-facing change history
- [x] `HACKATHON_SUBMISSION.md` — this document
- [ ] Verified hosted demo URL for judges (pending team confirmation)
- [ ] Team-authored expansion of the Contribution Matrix (Section 2.1)
  with specific research/strategy artifacts
