import type { BreakBuddySettings, ProgressState } from "../types";
import { DEFAULT_ENABLED_GAMES } from "../games/registry";

/**
 * Thin localStorage wrapper.
 *
 * Everything in the app that needs to persist goes through here so
 * that swapping localStorage for a real backend (e.g. Supabase) later
 * only means editing this one file — no component should ever call
 * `localStorage` directly.
 */

const KEYS = {
  onboarded: "breakbuddy:onboarded",
  settings: "breakbuddy:settings",
  progress: "breakbuddy:progress",
  events: "breakbuddy:events",
  cameraGranted: "breakbuddy:cameraGranted",
  nextBreakAt: "breakbuddy:nextBreakAt",
} as const;

export const DEFAULT_SETTINGS: BreakBuddySettings = {
  pet: "dog",
  workingHours: { start: "10:00", end: "18:00" },
  breakFrequencyMinutes: 120,
  breakDurationSeconds: 30,
  enabledGames: DEFAULT_ENABLED_GAMES,
  gameSelectionMode: "user-chooses",
  reducedMotion: false,
  cameraPermissionMode: "ask-once",
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyDay(): ProgressState["today"] {
  return { date: todayKey(), breaksCompleted: 0, movementSeconds: 0, gamesPlayed: {} };
}

export const DEFAULT_PROGRESS: ProgressState = {
  today: emptyDay(),
  streakDays: 0,
  lastCompletedDate: null,
  history: [],
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // localStorage can throw in private-browsing/quota-exceeded situations.
    // BreakBuddy should never crash because it couldn't persist a preference.
    console.warn(`[storage] failed to write "${key}"`, err);
  }
}

export function hasOnboarded(): boolean {
  return localStorage.getItem(KEYS.onboarded) === "true";
}

export function setOnboarded(): void {
  safeWrite(KEYS.onboarded, true);
}

export function loadSettings(): BreakBuddySettings {
  return safeParse(localStorage.getItem(KEYS.settings), DEFAULT_SETTINGS);
}

export function saveSettings(settings: BreakBuddySettings): void {
  safeWrite(KEYS.settings, settings);
}

export function loadProgress(): ProgressState {
  const stored = safeParse<ProgressState>(localStorage.getItem(KEYS.progress), DEFAULT_PROGRESS);
  // Roll over to a fresh day if the stored "today" is stale.
  if (stored.today.date !== todayKey()) {
    stored.today = emptyDay();
  }
  return stored;
}

export function saveProgress(progress: ProgressState): void {
  safeWrite(KEYS.progress, progress);
}

export function resetAllData(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

/**
 * Remembers that the player has already gone through BreakBuddy's own
 * "Camera required" consent step once. Once true, camera-based games
 * skip straight to requesting the camera instead of showing the modal
 * again every time — the browser itself already remembers the actual
 * OS-level permission grant, so re-explaining it on every break is
 * just friction. Settings still offers a way to forget this and see
 * the explanation again.
 */
export function hasCameraPermission(): boolean {
  return localStorage.getItem(KEYS.cameraGranted) === "true";
}

export function setCameraPermissionGranted(): void {
  safeWrite(KEYS.cameraGranted, true);
}

export function forgetCameraPermission(): void {
  localStorage.removeItem(KEYS.cameraGranted);
}

/**
 * When the next automatic break is due (epoch ms). Persisted so the
 * countdown survives a page reload or the tab being closed and
 * reopened — without this, whoever leaves BreakBuddy open in the
 * background and never touches the tab again would find the schedule
 * silently reset every time the app happens to remount.
 */
export function loadNextBreakAt(): number | null {
  const raw = localStorage.getItem(KEYS.nextBreakAt);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function saveNextBreakAt(timestamp: number): void {
  safeWrite(KEYS.nextBreakAt, timestamp);
}
