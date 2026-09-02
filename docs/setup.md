# Local setup

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (ships with Node)
- A webcam, if you want to try the real camera-based games (Demo Mode works without one)

## Install & run

```bash
git clone https://github.com/Nandinimat23/breakbuddy.git
cd breakbuddy
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`) in Chrome. Camera access requires a "secure context" — `localhost` counts as one, so this works out of the box in dev.

## Available scripts

| Command           | What it does                                  |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Start the Vite dev server with hot reload      |
| `npm run build`    | Type-check (`tsc -b`) and build for production |
| `npm run preview`  | Serve the production build locally             |
| `npm run lint`     | Run `oxlint` over the codebase                 |

## Manual test pass (PRD section 45 / 49)

There's no automated test suite yet (see `product/roadmap.md`). Before shipping a change, click through:

1. Onboarding → pick a pet → land on the Dashboard
2. Settings → change working hours, break frequency/duration, disable a game (confirm at least one must stay enabled), toggle reduced motion — refresh the page and confirm everything persisted
3. Dashboard → **Take a break now** → game selection → pick each of the four games in turn
4. For each game: **Enable Camera** (grant permission and confirm it tracks you) *and* **Play Demo** (confirm it's fully playable with just a mouse)
5. Deny camera permission once on purpose and confirm the error state + **Play Demo** fallback appears
6. Complete a game and confirm the score screen, pet message, and "today's progress" on the Dashboard update
7. Check the browser console for errors throughout

## Deploying to Vercel

1. Push the repo to GitHub (see the root `README.md`).
2. In Vercel, **Add New → Project**, import the `breakbuddy` repo. Vercel auto-detects the Vite framework preset — no configuration needed (`vercel.json` handles client-side routing).
3. Deploy. Camera access requires HTTPS, which Vercel provides by default, so the real camera-based games work on the deployed URL exactly as they do on `localhost`.
