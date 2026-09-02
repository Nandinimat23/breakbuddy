import type { GameId, GameResult } from "../types";

export function computeAccuracy(hits: number, attempts: number): number {
  if (attempts <= 0) return 0;
  return Math.round((hits / attempts) * 100);
}

export function makeGameResult(params: {
  gameId: GameId;
  score: number;
  hits: number;
  attempts: number;
  durationSeconds: number;
  demoMode: boolean;
}): GameResult {
  return {
    ...params,
    accuracy: computeAccuracy(params.hits, params.attempts),
    completedAt: new Date().toISOString(),
  };
}
