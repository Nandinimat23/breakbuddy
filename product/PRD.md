# BreakBuddy — Product Requirements & Build Specification

> Source of truth for what BreakBuddy V1 is and why. This is the original product spec the codebase was built from — if code and this document disagree, treat that as a bug (in the code, the doc, or both) and reconcile them.

## 0. Role & intent

Build a complete, functional, deployable MVP called **BreakBuddy** — not a static mockup. The code must be clean, modular, well documented, easy for a non-engineer Product Manager to understand and modify with AI coding tools, suitable for a public GitHub repository, deployable on Vercel, responsive on laptop/desktop, and structured so additional games and features can be added later without rewriting the application.

## 1. Product name

**BreakBuddy** 🐾 — *"Don't just take a break. Play one."* (alt: *"Your virtual pet that makes you move."*)

## 2. Product overview

BreakBuddy is a desktop-first web app for people who sit at a laptop for long stretches. Instead of a generic "take a break" reminder, a virtual pet appears at configured intervals and invites the user into a short interactive movement game. The user picks one of four movement-based mini-games that use the laptop camera; virtual objects appear in the camera frame and the user physically moves to interact with them. On completion, the pet celebrates and disappears.

**Core loop:** Work → Pet Appears → Choose Game → Move → Complete → Pet Celebrates → Return to Work

## 3. Problem statement

People who work or study at desks spend hours sitting, and conventional reminders (calendar pings, desktop notifications, "stand up and stretch," Pomodoro timers) are easy to dismiss because they interrupt without giving an engaging reason to participate. The real problem isn't "people forget to take breaks" — it's that **people lack an engaging, low-friction reason to interrupt their work and move.** BreakBuddy turns the break itself into a 30–60 second game.

## 4. Product hypothesis

**If** short movement breaks are presented as interactive mini-games through a friendly virtual pet, **then** users will be more willing to interrupt their work and complete the movement activity, compared with passive reminders.

Core assumption: the break should feel like *"I'm playing a 30-second game,"* not *"I'm being told to exercise."*

## 5. Target users

Desk-based knowledge workers: PMs, engineers, designers, analysts, students, writers, remote/office workers — anyone on a webcam-enabled laptop/desktop, at a desk, in a browser. V1 is desktop-first.

## 6. Core user journey (first-time user)

1. Landing screen: **"Meet your BreakBuddy 🐾"** — *"Your tiny desk companion that helps you move during long work sessions."* User picks 🐶 Dog or 🐱 Cat and taps **Choose this pet**.
2. User enters the main app. The pet appears at the bottom corner. The user can configure their break schedule.

## 7. Pet system

Two selectable pets:

- **🐶 Dog** — Cheerful, Energetic, Encouraging
- **🐱 Cat** — Playful, Slightly sarcastic, Cute

The pet floats near the bottom-right corner and never blocks the primary work interface.

## 8. Break reminder system

Default working hours **10:00 AM – 6:00 PM**, default break frequency **every 2 hours** (≈10, 12, 2, 4, 6). Fully configurable, not hard-coded.

## 9. Reminder configuration (Settings)

- **Working hours** — start/end time pickers (default 10:00 AM / 6:00 PM).
- **Break frequency** — 30 min / 60 min / 90 min / 2 hr / 3 hr (default 2 hr). Architecture allows more intervals later.

## 10. Break behavior

When the interval is reached, the pet appears with a message (e.g. *"Hey! You've been working for a while. Ready for a tiny movement break?"*) and two buttons: **Let's Go!** → opens game selection; **Not Now** → dismisses the pet and the timer keeps running (no repeated nagging immediately after dismissal).

## 11. Game selection

**"Pick your break 🎮"** — four cards, exactly one selected:

- 🥊 **Punch the Bag** — move your arms
- 🥤 **Drink Up** — stretch your neck
- ⚽ **Kick the Ball** — move your legs
- 🖼️ **Put Up the Poster** — reach and stretch

## 12. Game 1 — Punch the Bag

**Objective:** arm/upper-body movement. A virtual punching bag and a target appear; the user punches toward the target (hand tracking); on hit, **HIT! +10** and the target relocates. 30 seconds. Targets stay within reasonable reach — no extreme movement required. Completion: score + pet celebration ("POW! You crushed it!") → **Done**, which returns to the dashboard and resets the reminder timer.

## 13. Game 2 — Drink Up

Uses a **fictional** drink (water/juice/smoothie/energy drink/potion) — never alcohol. **Objective:** encourage looking up/away from the downward laptop posture. The user raises a virtual drink and holds a gentle "look up" position; the drink level drains as they do. ~15–20 seconds, never requiring an uncomfortable neck hold. Pet: *"Cheers! Nice stretch."*

## 14. Game 3 — Kick the Ball

**Objective:** leg movement, breaking a static seated posture. A virtual ball and goal appear (left/center/right); the user kicks (pose/leg tracking); the ball responds to a detected kick-like movement. 30 seconds, multiple kick opportunities, no unsafe/extreme kicks required. Shows *"Make sure you have enough space around you before moving"* before starting. Completion shows goals scored (e.g. *"4/5 successful kicks"*) and pet: *"Nice kick!"*

## 15. Game 4 — Put Up the Poster

**Objective:** overhead reach, upper-body movement. A poster appears; the user's hand "picks it up" (hand tracking), the poster follows the hand, and the user reaches up to a highlighted wall spot to place it. Repeats 3–4 times. Pet: *"Room decorated! 🎉"*

## 16. Camera / motion tracking

Browser-based camera access → local motion tracking → game logic, using a browser-compatible computer-vision library (MediaPipe) for hand, pose, and face/head tracking. Processing happens locally in the browser wherever practical; raw camera footage is never uploaded.

## 17. Privacy

Before opening the camera, show: **"Camera required — BreakBuddy uses your camera to detect your movement during the game. Your camera feed is processed for gameplay and should not be stored."** with **Enable Camera** / **Cancel**. Camera permission is requested only when a camera-based game starts, the camera turns off when the game ends, and nothing is stored or uploaded.

## 18. Camera fallback

If permission is denied, the camera is unavailable, there's no camera, or tracking fails, show *"Camera access is unavailable"* with **Try Again** and **Play Demo Mode** (simulated movement, no camera required).

## 19. Main dashboard

Shows the pet in the bottom corner, today's progress (breaks completed, minutes of movement, streak), next-break countdown, today's games played, and a **Settings** button.

## 20. Settings

Pet choice, working hours, break frequency (30/60/90 min, 2 hr, 3 hr), break duration (15/30/60 sec, default 30), per-game enable/disable (**at least one game must remain enabled**), and game-selection mode: **User chooses** (default, shows the picker every time) or **Random** (auto-picks from enabled games).

## 21. Data storage

V1 keeps things simple: user preferences and progress persist to **browser local storage** (selected pet, working hours, break interval/duration, enabled games, selection mode, completed-break count, game scores, streak). No backend introduced unnecessarily — but the code is structured so a real database (e.g. Supabase) can be swapped in later behind the same storage interface.

## 22. No login in V1

No email, password, Google login, or account creation. The user opens the app and uses it immediately. Authentication is a future feature.

## 23. Timer logic

The reminder system is **elapsed-time based**, not dependent solely on UI render ticks, so it survives backgrounded tabs and re-renders. Completing a break resets the timer. This lives in a dedicated timer/reminder service, not inside a UI component.

## 24. Pet appearance

The pet enters with a small bounce animation and a speech bubble, and disappears after completion. Intro and completion messages are drawn randomly from a pool per pet, so the pet feels alive without being repetitive or annoying.

## 25. UX principles

Extremely low friction (pet appears → click → choose game → start, in seconds), short (15–60s games), playful (feels like a game, not a health app), non-judgmental (never shames a skipped break), safe (no extreme movement), minimal interruption (disappears once the break is done).

## 26. Design direction

Friendly, playful, minimal, modern, slightly gamified: soft rounded cards, clean typography, generous whitespace, subtle animation, friendly pet illustrations, clear CTAs. Closer to *"a cute productivity companion + casual game"* than a workout/medical app.

## 27. Responsive design

Primary target is desktop/laptop; the UI should also work on tablet and smaller screens. Camera-based games clearly communicate when the available screen size is insufficient.

## 28. Accessibility

Keyboard navigation, visible focus states, sufficient contrast, accessible buttons/labels, camera-permission explanations, reduced-motion support, and clear error messages. Animation is never essential to understanding the interface.

## 29. Application architecture

React + TypeScript, with a clean, feature-oriented component structure (`components/`, `pages/`, `games/`, `services/`, `utils/`, `types/`, `assets/`) — see `docs/architecture.md` for how the shipped code maps to this.

## 30. Game architecture

Every game follows a common contract: `id`, `name`, `description`, `duration`, `trackingType`, plus lifecycle hooks equivalent to `start()` / `update()` / `complete()` / `reset()`. The goal: a future game (e.g. *"Clean the Window"*) should be addable without rewriting the app. See `docs/architecture.md`.

## 31. Future game ideas (not built in V1)

Clean the Window, Catch the Birds, Water the Plant, Shoot the Basketball, Pop the Balloons, Sweep the Floor, Catch the Fish.

## 32. V1 feature priority — must have

Landing/onboarding · two selectable pets · dashboard · configurable working hours · configurable reminder interval · pet reminder · game selection · four game screens · camera access · motion tracking where technically feasible · virtual game objects · game scoring · completion state · pet celebration · timer reset · local persistence · settings · responsive UI · GitHub-ready code · Vercel deployment compatibility.

## 33. Should have (if time permits)

Streak, daily break counter, game history, randomized pet messages, random game selection, demo mode, sound effects, confetti, simple achievements.

## 34. Future features (explicitly out of scope for V1)

**V2:** more pets, pet customization/XP/levels, more games, more advanced motion tracking, better AR object interaction, desktop notifications, PWA support, user accounts, cloud sync.
**V3:** AI-personalized break recommendations, personalized difficulty, movement-quality scoring, adaptive schedules, weekly analytics, team/company mode, workplace wellness dashboard, multiplayer games.

## 35. AI product positioning

The app itself isn't a chatbot — the AI story is in *how it was built* (AI-assisted coding, debugging, product development) and in its use of computer vision / motion tracking for interactive game design. Documented in the root `README.md`.

## 36. GitHub requirements

Public repo named `breakbuddy`, containing `README.md`, `src/`, `public/`, `package.json`, config files, `product/{PRD.md, product-hypothesis.md, roadmap.md}`, `docs/{architecture.md, setup.md}`, a `.gitignore`, and an `.env.example` with placeholder values only. No API keys, secrets, passwords, or credentials committed.

## 37. README requirements

Problem, solution, demo link placeholder, feature list, "how it works" flow, technology list, an explanation of the AI-assisted development process, product-thinking summary, and local setup instructions.

## 38. GitHub development workflow

The repo should be clonable and modifiable via an AI coding agent for requests like "add another pet," "change the reminder interval," "add a new movement game," "change the pet messages," or "make Punch the Bag 45 seconds instead of 30" — without needing a rewrite.

## 39. Deployment

Local development → GitHub → Vercel → public website. No paid server required for the MVP.

## 40. Security & privacy

No camera footage stored or uploaded; movement tracking runs locally/in-browser; no secrets in frontend code; no unnecessary third-party services; camera access requested only when needed.

## 41. Error states

Camera denied, camera unavailable, motion tracking unavailable, browser incompatibility, and in-game failure (with a **Restart Game** option) all get explicit, friendly UI states. Skipping a break is always just a dismissal — never a guilt trip.

## 42. Demo mode

Critical for portfolio/recruiter use: **Play Demo** lets someone experience the mechanics via click/tap, with no camera permission required, clearly labeled **"Demo Mode — Camera not required."** The real camera-based mode stays the primary experience.

## 43. Analytics

No complex analytics integration in V1 — just a simple local event log (`break_triggered`, `break_started`, `game_selected`, `game_completed`, `game_skipped`, `camera_permission_granted`, `camera_permission_denied`, `game_score`) that a future version can wire up to a real analytics provider.

## 44. Product metrics (for the *future*, live product)

**Primary:** Break Completion Rate (% of triggered breaks actually completed). **Secondary:** break acceptance rate, game completion rate, average game duration, repeat usage, DAU/WAU, breaks per user, game preference, skip rate, streak retention.

## 45. Success criteria for the MVP

Pet selection, configurable working hours/frequency, pet appears on schedule, four selectable games, camera can be requested, at least one game has functional real movement detection, virtual objects respond to movement, scoring, completion, pet celebration, return to dashboard, timer reset, settings persist across refresh, publicly deployable, clonable/runnable by someone else, no exposed credentials.

## 46. Development strategy (how this was actually built)

Built in phases rather than all at once: (1) foundation — routing, design system, onboarding, dashboard, settings, storage, timer; (2) game framework — selection screen, shared game contract, scoring, completion screen; (3) camera — permission, preview, start/stop, error states, demo mode; (4)–(7) MediaPipe motion tracking wired into each of the four games in turn; (8) polish; (9) testing; (10) deployment. See `product/roadmap.md` for what shipped in V1 versus what's next.

## 47. Implementation principle

Don't pretend tracking works if it doesn't. Where a fully robust AR interaction wasn't reliable to build in the MVP, ship a functional simplified version, and keep the tracking layer (`MotionTrackingService`) cleanly separated from game logic so it can be improved later without touching the games themselves.

## 48. Product safety

BreakBuddy does not diagnose, treat, or prevent medical conditions — it's a wellness/productivity tool encouraging short, gentle movement. No extreme stretching, forced neck positions, dangerous kicking, excessive repetitions, or high-intensity exercise. A disclaimer is shown at onboarding: *"Move comfortably and make sure you have enough space around you. Stop if anything feels uncomfortable."*

## 49. Final user experience

User is working → pet appears with an invite → **Let's Go** → pick a game → camera opens → user moves → the game responds in real time → completion screen with score → **Back to Work** → pet disappears, timer resets, user keeps working.

## 50. Portfolio requirement

This is a Product Manager portfolio project as much as a coding one: the problem, user insight, hypothesis, solution, MVP scope, and how AI was used throughout (UI generation, coding, debugging, architecture, motion-tracking integration, documentation) are documented across this `product/` folder and the root README, with space left for real future user-testing results rather than invented metrics.

## 51. Final build instruction

Ship a publicly deployable BreakBuddy MVP: put it on GitHub, deploy it, let people use it themselves, and keep it easy to continue developing with AI coding tools.
