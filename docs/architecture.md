# Architecture

This document explains how the code is organized and *why*, so that a non-engineer PM (or an AI coding agent working on their behalf) can find the right file to change quickly. If you just want to make a specific change, jump to "Common changes" at the bottom.

## Folder layout

```
src/
  components/     Small, reusable, presentational pieces (Button, Modal, Pet, GameCard, ...)
  pages/          One folder per route/screen (Onboarding, Dashboard, GameSelection, GamePlay, Settings)
  games/          One folder per game, plus the shared game contract and registry
  services/       Framework-agnostic logic: timer, camera, motion tracking
  hooks/          React glue between services/games and components
  context/        App-wide state (settings + progress), backed by localStorage
  utils/          Small pure helpers: storage, time formatting, scoring, analytics
  types/          Shared TypeScript types — the "shape" of the whole app in one file
  data/           Static content: pet definitions and messages
  styles/         Design tokens (theme.css) and global layout/reset (global.css)
```

## The big picture

```
ReminderService (elapsed-time timer)
        │  "a break is due"
        ▼
useReminderTimer (React hook)
        │
        ▼
Dashboard  ──"Let's Go!"──▶  GameSelection  ──pick a game──▶  GamePlay
                                                                   │
                                                    ┌──────────────┴──────────────┐
                                                    ▼                             ▼
                                          CameraService + MotionTrackingService   Demo Mode
                                          (real camera + MediaPipe landmarks)     (mouse/touch pointer)
                                                    │                             │
                                                    └──────────────┬──────────────┘
                                                                   ▼
                                                     TrackingFrame { hands, ankles, nose }
                                                                   │
                                                                   ▼
                                                   Game component (PunchBagGame, KickBallGame, ...)
                                                                   │  onComplete(result)
                                                                   ▼
                                                     AppContext.recordGameResult → localStorage
```

The key design decision (per `product/PRD.md` section 47) is the seam between **tracking** and **game logic**: every game receives the same shape of data (`TrackingFrame`, from `src/services/motionTracking/MotionTrackingService.ts`) whether it came from a real webcam + MediaPipe model, or from a simulated mouse/touch pointer in Demo Mode (`src/hooks/useDemoPointer.ts`). A game component never imports MediaPipe or `getUserMedia` directly — it just reads normalized `{x, y}` points and decides what counts as a hit.

## The game contract

Every game is a React component with the same props (`src/games/GameScreenProps.ts`):

```ts
interface GameScreenProps {
  frame: TrackingFrame;        // latest hand/ankle/nose points, live or simulated
  demoMode: boolean;
  durationSeconds: number;
  reducedMotion: boolean;
  onComplete: (result) => void; // score, hits, attempts, durationSeconds
}
```

Games are registered in two places:

1. **`src/games/registry.ts`** — static metadata (id, name, emoji, tagline, tracking type, default duration). This drives the game-selection cards and the settings enable/disable list.
2. **`src/games/gameComponents.tsx`** — maps each game id to its component.

### Adding a fifth game

1. Add a `GameDefinition` to `src/games/registry.ts`.
2. Create `src/games/YourGame/YourGame.tsx` implementing `GameScreenProps`. Copy the structure of `src/games/PunchBag/PunchBagGame.tsx` as a starting point — it's the simplest of the four.
3. Register it in `src/games/gameComponents.tsx`.

Nothing else needs to change — the selection screen, settings page, scoring, and the camera/demo-mode plumbing all read from the registry and the shared contract.

## Motion tracking

`src/services/motionTracking/MotionTrackingService.ts` wraps [MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) (`@mediapipe/tasks-vision`), loading the model that matches a game's `trackingType`:

| trackingType | MediaPipe model      | Used by                          |
| ------------ | --------------------- | --------------------------------- |
| `hand`       | HandLandmarker         | Punch the Bag, Put Up the Poster |
| `pose`       | PoseLandmarker (lite)  | Kick the Ball                    |
| `face`       | FaceLandmarker         | Drink Up                         |

Models and the WASM runtime are fetched from Google's public MediaPipe CDN at runtime (see the `CDN_WASM`/`*_MODEL` constants) — nothing is bundled into the app, and no video frame is ever sent anywhere; all inference runs locally via WebAssembly.

**Known simplification:** Drink Up approximates "looking up" using the vertical position of the nose landmark in the frame, not true head-pitch estimation. It's a functional, honest stand-in — not a claim of clinical accuracy — and is called out in code comments and in `product/roadmap.md`. Kick the Ball similarly detects an edge (ankle moving upward past a threshold) rather than literal foot-to-ball contact physics.

## Timer

`src/services/timer/ReminderService.ts` is a plain TypeScript class (no React) that tracks "time until next break due" using `Date.now()`, not accumulated `setInterval` ticks — so it stays accurate even if the tab is backgrounded. `src/hooks/useReminderTimer.ts` is the thin React wrapper that a component actually uses.

## Persistence

`src/utils/storage.ts` is the *only* file that talks to `localStorage`. `src/context/AppContext.tsx` is the only place components read/write settings and progress. To swap in a real backend (e.g. Supabase) later, change `storage.ts`'s implementation — nothing else in the app needs to know.

## Design system

`src/styles/theme.css` defines every color, spacing, radius, and font-size value as a CSS custom property. Components use plain CSS files (one per component) that reference those variables — no CSS framework dependency, and re-theming the whole app means editing one file.
