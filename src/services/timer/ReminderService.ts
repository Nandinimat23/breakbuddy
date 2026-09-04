import type { WorkingHours } from "../../types";
import { isWithinWorkingHours } from "../../utils/time";

export interface ReminderServiceConfig {
  workingHours: WorkingHours;
  intervalMinutes: number;
}

type Listener = () => void;

/** How far out "Not Now" pushes the next reminder. */
const SNOOZE_MINUTES = 5;

/**
 * Dedicated timer/reminder service (PRD section 23).
 *
 * Deliberately framework-agnostic: it does not depend on React, so
 * it keeps running correctly across re-renders and is easy to unit
 * test on its own. `useReminderTimer` (in src/hooks) is the thin React
 * adapter around this class.
 *
 * The timer is based on elapsed wall-clock time (Date.now()), not on
 * a fixed number of setInterval ticks, so it stays accurate even if
 * the tab is backgrounded and the browser throttles timers.
 */
export class ReminderService {
  private config: ReminderServiceConfig;
  private nextBreakAt: number;
  private tickHandle: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<Listener>();
  private dueListeners = new Set<Listener>();
  private paused = false;

  constructor(config: ReminderServiceConfig, initialNextBreakAt?: number) {
    this.config = config;
    this.nextBreakAt = initialNextBreakAt ?? Date.now() + config.intervalMinutes * 60_000;
  }

  /** Epoch ms of the next scheduled break — callers persist this so the
   * schedule survives a reload instead of restarting from "now" every
   * time the app happens to remount. */
  getNextBreakAt(): number {
    return this.nextBreakAt;
  }

  start(): void {
    if (this.tickHandle) return;
    this.tickHandle = setInterval(() => this.tick(), 1000);
  }

  stop(): void {
    if (this.tickHandle) clearInterval(this.tickHandle);
    this.tickHandle = null;
  }

  /**
   * Snooze without completing a game ("Not Now"). Pushes the next
   * reminder a few minutes out — without this, `nextBreakAt` stays in
   * the past and the very next tick would immediately re-fire the
   * prompt again instead of actually deferring it.
   */
  snooze(): void {
    this.nextBreakAt = Date.now() + SNOOZE_MINUTES * 60_000;
    this.paused = false;
  }

  /** Pause countdown notifications while a break/game is actively in progress. */
  pauseNotifications(): void {
    this.paused = true;
  }

  resumeNotifications(): void {
    this.paused = false;
  }

  updateConfig(config: Partial<ReminderServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /** Called when a break is completed successfully — resets the countdown. */
  resetTimer(): void {
    this.nextBreakAt = Date.now() + this.config.intervalMinutes * 60_000;
    this.paused = false;
    this.notify(this.listeners);
  }

  msUntilNextBreak(): number {
    return Math.max(0, this.nextBreakAt - Date.now());
  }

  onTick(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Fired exactly once when a break becomes due. */
  onBreakDue(listener: Listener): () => void {
    this.dueListeners.add(listener);
    return () => this.dueListeners.delete(listener);
  }

  private tick(): void {
    this.notify(this.listeners);
    if (this.paused) return;
    if (!isWithinWorkingHours(this.config.workingHours)) return;
    if (Date.now() >= this.nextBreakAt) {
      this.paused = true; // avoid re-firing every second while the prompt is showing
      this.notify(this.dueListeners);
    }
  }

  private notify(set: Set<Listener>): void {
    set.forEach((fn) => fn());
  }
}
