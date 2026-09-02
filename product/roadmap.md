# Roadmap

## Shipped in V1 (this repo)

- Onboarding / pet selection (dog 🐶 or cat 🐱), no login required
- Dashboard: today's progress, streak, next-break countdown, games played today
- Settings: pet, working hours, break frequency (30/60/90 min, 2h, 3h), break duration (15/30/60s), per-game enable/disable (at least one required), game-selection mode (user chooses / random), reduced motion
- Elapsed-time-based reminder service, decoupled from React rendering (`src/services/timer`)
- Break prompt ("Let's Go!" / "Not Now") with non-judgmental dismissal
- Game selection screen with all four games as cards
- Four playable games, each with real MediaPipe tracking **and** a camera-free Demo Mode:
  - 🥊 Punch the Bag — hand tracking
  - 🥤 Drink Up — face/head tracking (simplified "look up" heuristic — see `docs/architecture.md`)
  - ⚽ Kick the Ball — pose tracking
  - 🖼️ Put Up the Poster — hand tracking
- Camera permission flow, privacy notice, and fallback error states (denied / unavailable / unsupported)
- Scoring, completion screens, and pet celebration messages
- Local persistence (`localStorage`) for settings and progress, structured behind a single `utils/storage.ts` so a real backend can be swapped in later
- Local-only analytics event log (`utils/analytics.ts`)
- Responsive layout, keyboard focus states, reduced-motion support
- Vercel-ready build (`vercel.json`, static Vite build)

## Should-have, not yet built

- Sound effects and confetti on completion
- Simple achievements
- Richer game history view

## Explicitly out of scope for V1 (see `product/PRD.md` section 34)

**V2 ideas:** more pets, pet customization / XP / levels, more games (Clean the Window, Catch the Birds, Water the Plant, Shoot the Basketball, Pop the Balloons, Sweep the Floor, Catch the Fish — see PRD section 31), more advanced motion tracking, better AR object interaction, desktop notifications, PWA support, user accounts, cloud sync.

**V3 ideas:** AI-personalized break recommendations, personalized game difficulty, movement-quality scoring, adaptive break schedules, weekly movement analytics, team/company mode, workplace wellness dashboard, multiplayer games.

## Known limitations to be upfront about

- **Drink Up's "look up" detection is a simplified heuristic** (nose-landmark height in frame), not true head-pitch estimation. It works as a game mechanic but isn't medical-grade posture tracking. See `docs/architecture.md` for the reasoning and how to improve it.
- **Kick the Ball detects an upward ankle-movement edge**, not literal foot-to-ball contact — there's no depth/3D ball physics in V1.
- Tracking quality depends on lighting, camera position, and browser support for WebAssembly + `getUserMedia`; Demo Mode exists precisely so the product is still fully experienceable when any of that isn't available.
- No automated test suite yet (manual test pass only — see `docs/setup.md`).

## Validation

Real usage data (break completion rate, per-game preference, skip rate, streak retention — PRD section 44) is intentionally left blank here. It should be filled in once the product has real users, rather than invented ahead of time.
