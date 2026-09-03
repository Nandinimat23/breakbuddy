/**
 * Core shared types for BreakBuddy.
 *
 * Keeping all cross-cutting types in one file makes it easy for a
 * non-engineer (or an AI coding tool) to see the whole "shape" of the
 * app's data at a glance before touching any feature code.
 */

// ---------------------------------------------------------------------------
// Pet
// ---------------------------------------------------------------------------

export type PetId = "dog" | "cat";

export interface PetDefinition {
  id: PetId;
  name: string;
  emoji: string;
  /** Portrait artwork shown throughout the app instead of the emoji. */
  image: string;
  tagline: string;
  personality: string[];
  messages: {
    intro: string[];
    completion: string[];
  };
}

// ---------------------------------------------------------------------------
// Games
// ---------------------------------------------------------------------------

/** The kind of camera-based tracking a game relies on. */
export type TrackingType = "hand" | "pose" | "face" | "hand-face" | "none";

export type GameId = "punch-bag" | "drink-up" | "kick-ball" | "poster";

/**
 * Static metadata about a game. This is what powers the game selection
 * cards and the settings "enable/disable games" list. Adding a new game
 * to the product starts with adding one of these to games/registry.ts.
 */
export interface GameDefinition {
  id: GameId;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  trackingType: TrackingType;
  /** Default duration in seconds. */
  duration: number;
}

/** Result reported by a game when the player finishes or exits. */
export interface GameResult {
  gameId: GameId;
  score: number;
  hits: number;
  attempts: number;
  accuracy: number; // 0-100
  durationSeconds: number;
  completedAt: string; // ISO timestamp
  demoMode: boolean;
}

// ---------------------------------------------------------------------------
// Settings (persisted to localStorage)
// ---------------------------------------------------------------------------

export type BreakFrequencyMinutes = 30 | 60 | 90 | 120 | 180;
export type BreakDurationSeconds = 15 | 30 | 60;
export type GameSelectionMode = "user-chooses" | "random";

export interface WorkingHours {
  /** 24h "HH:mm" format, e.g. "10:00" */
  start: string;
  end: string;
}

/**
 * Controls whether BreakBuddy's own "Camera required" explanation
 * modal is shown before every camera-based game, or only the first
 * time. Either way, the browser's own camera permission is requested
 * normally — this only governs our in-app consent step.
 */
export type CameraPermissionMode = "ask-once" | "ask-always";

export interface BreakBuddySettings {
  pet: PetId;
  workingHours: WorkingHours;
  breakFrequencyMinutes: BreakFrequencyMinutes;
  breakDurationSeconds: BreakDurationSeconds;
  enabledGames: GameId[];
  gameSelectionMode: GameSelectionMode;
  reducedMotion: boolean;
  cameraPermissionMode: CameraPermissionMode;
}

// ---------------------------------------------------------------------------
// Progress (persisted to localStorage)
// ---------------------------------------------------------------------------

export interface DailyProgress {
  /** "YYYY-MM-DD" */
  date: string;
  breaksCompleted: number;
  movementSeconds: number;
  gamesPlayed: Partial<Record<GameId, number>>;
}

export interface ProgressState {
  today: DailyProgress;
  streakDays: number;
  lastCompletedDate: string | null;
  history: GameResult[];
}

// ---------------------------------------------------------------------------
// Analytics (local-only event log, see utils/analytics.ts)
// ---------------------------------------------------------------------------

export type AnalyticsEventName =
  | "break_triggered"
  | "break_started"
  | "break_dismissed"
  | "game_selected"
  | "game_completed"
  | "game_skipped"
  | "camera_permission_granted"
  | "camera_permission_denied"
  | "game_score";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  timestamp: string;
  payload?: Record<string, unknown>;
}
