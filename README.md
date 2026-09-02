# BreakBuddy 🐾

**Don't just take a break. Play one.**
*Your virtual pet that makes you move.*

## Problem

People who work at a desk spend hours sitting and staring at a laptop. Most know they should move more, but conventional reminders — calendar pings, desktop notifications, "stand up and stretch," Pomodoro timers — are easy to ignore. They interrupt without giving you a reason to actually participate. The real problem isn't that people forget to take breaks; it's that they lack an engaging, low-friction reason to interrupt their work and move.

## Solution

BreakBuddy is a desktop-first web app with a virtual pet (a cheerful dog 🐶 or a playful cat 🐱) that shows up on a schedule you configure and invites you into a 15–30 second movement game — using your webcam to detect real movement, right in the browser. Punch a virtual bag, "drink" something to stretch your neck, kick a ball, or reach up to hang a poster. No camera? No problem — **Demo Mode** lets you play with just a mouse, no permission required.

**Core loop:** Work → Pet appears → Choose a game → Move → Game responds in real time → Complete → Pet celebrates → Back to work.

## Demo

**[Try BreakBuddy Live](https://breakbuddy.vercel.app)** — *link goes live after the first Vercel deploy, see [docs/setup.md](docs/setup.md).*

## Features

- 🥊 **Punch the Bag** — hand-tracking; hit moving targets before they expire
- 🥤 **Drink Up** — face-tracking; look up gently to drain a virtual drink and stretch your neck
- ⚽ **Kick the Ball** — pose-tracking; a quick leg movement kicks toward a moving goal
- 🖼️ **Put Up the Poster** — hand-tracking; carry a poster to a highlighted wall spot
- Two pets with distinct personalities, a fully configurable break schedule, a progress dashboard with streaks, and **Demo Mode** for camera-free play
- Everything runs and persists locally in your browser — no login, no backend, no data leaves your machine

## How it works

```
Work
 ↓
Pet appears
 ↓
Choose game
 ↓
Camera (or Demo Mode)
 ↓
Move
 ↓
Game responds
 ↓
Complete
 ↓
Back to work
```

## Technology

- **React 19 + TypeScript**, built with **Vite**
- **React Router** for client-side navigation
- **Camera APIs** (`getUserMedia`) for local webcam access
- **[MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe/solutions/vision)** (`@mediapipe/tasks-vision`) for on-device hand, pose, and face landmark tracking — all inference runs in-browser via WebAssembly; no video frame is ever uploaded
- **localStorage** for settings/progress persistence (structured so a real backend can be swapped in later — see `docs/architecture.md`)
- **GitHub + Vercel** for source control and zero-config static deployment

## AI-assisted development

This project was built end-to-end through AI-assisted development, starting from a detailed product requirements document (`product/PRD.md`) rather than an empty repo. AI assistance was used for:

- **Architecture** — translating the PRD's feature list into a folder structure and a shared "game contract" (`src/games/GameScreenProps.ts`) so new games can be added without touching existing code
- **UI generation** — every component and page (onboarding, dashboard, settings, the four games, camera permission and error states) was scaffolded and styled from the PRD's described screens
- **Motion tracking integration** — wiring MediaPipe's hand/pose/face landmarkers into a single `MotionTrackingService` abstraction, with a parallel Demo Mode pointer so the same game code works with or without a camera
- **Coding & debugging** — iterating through `tsc`, `oxlint`, and `vite build` until the codebase type-checked and built cleanly
- **Documentation** — this README plus `product/` and `docs/` were generated alongside the code, and are meant to be kept in sync with it going forward using the same AI-assisted workflow

## Product thinking

- **Problem statement, hypothesis, and target user:** see [`product/product-hypothesis.md`](product/product-hypothesis.md)
- **Full requirements/spec this was built from:** see [`product/PRD.md`](product/PRD.md)
- **What shipped in V1 vs. what's next (and known limitations):** see [`product/roadmap.md`](product/roadmap.md)
- **How the codebase is organized and why:** see [`docs/architecture.md`](docs/architecture.md)

## Local setup

```bash
git clone https://github.com/Nandinimat23/breakbuddy.git
cd breakbuddy
npm install
npm run dev
```

Full instructions, available scripts, a manual test checklist, and Vercel deployment steps are in [`docs/setup.md`](docs/setup.md).

## Privacy

BreakBuddy only requests camera access when you open a camera-based game, and stops the camera the moment the game ends. Movement detection runs entirely on-device; no video frame is ever stored or sent to a server. See PRD section 17/40 in [`product/PRD.md`](product/PRD.md).

## Product safety

BreakBuddy is a wellness/productivity tool, not a medical device — it does not diagnose, treat, or prevent any condition. Movements are designed to be gentle; stop if anything feels uncomfortable.

## License

[MIT](LICENSE)
