import type { NormalizedPoint, TrackingFrame } from "../services/motionTracking/MotionTrackingService";
import type { GameResult, PetId } from "../types";

/**
 * The contract every game component implements (PRD section 30).
 *
 * A game receives normalized interaction points — either real
 * MediaPipe landmarks (live mode) or a simulated pointer (demo mode,
 * see useDemoPointer) — and reports back a result when it finishes.
 * It never talks to the camera or MediaPipe directly; that separation
 * is what makes it possible to add a fifth game later without
 * touching the tracking layer at all.
 */
export interface GameScreenProps {
  /** Latest tracking data. Null hands/ankles/nose simply means "not detected this frame". */
  frame: TrackingFrame;
  /** True when running without a camera (mouse/touch stands in for the tracked point). */
  demoMode: boolean;
  /** Configured break duration in seconds (PRD settings: 15/30/60s). */
  durationSeconds: number;
  reducedMotion: boolean;
  /** The player's chosen companion, so games can show pet reaction bubbles. */
  petId: PetId;
  onComplete: (result: Omit<GameResult, "gameId" | "completedAt" | "demoMode" | "accuracy">) => void;
}

export function emptyFrame(): TrackingFrame {
  return { hands: [], ankles: [], nose: null, timestamp: 0 };
}

export function firstPoint(points: NormalizedPoint[]): NormalizedPoint | null {
  return points[0] ?? null;
}
