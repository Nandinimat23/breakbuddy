import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { BreakBuddySettings, GameId, GameResult, ProgressState } from "../types";
import { loadProgress, loadSettings, saveProgress, saveSettings } from "../utils/storage";

interface AppContextValue {
  settings: BreakBuddySettings;
  updateSettings: (patch: Partial<BreakBuddySettings>) => void;
  progress: ProgressState;
  recordGameResult: (result: GameResult) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

/**
 * App-wide settings + progress state.
 *
 * This is the one place components read/write persisted state from.
 * Under the hood it delegates to utils/storage.ts (localStorage today,
 * swappable for a real backend later without touching any component).
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BreakBuddySettings>(() => loadSettings());
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  const updateSettings = useCallback((patch: Partial<BreakBuddySettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const recordGameResult = useCallback((result: GameResult) => {
    setProgress((prev) => {
      const gameCount = (prev.today.gamesPlayed[result.gameId] ?? 0) + 1;
      const today = {
        ...prev.today,
        breaksCompleted: prev.today.breaksCompleted + 1,
        movementSeconds: prev.today.movementSeconds + result.durationSeconds,
        gamesPlayed: { ...prev.today.gamesPlayed, [result.gameId]: gameCount },
      };

      const todayKey = today.date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().slice(0, 10);
      const continuesStreak = prev.lastCompletedDate === yesterdayKey || prev.lastCompletedDate === todayKey;
      const streakDays = prev.lastCompletedDate === todayKey
        ? prev.streakDays
        : continuesStreak
          ? prev.streakDays + 1
          : 1;

      const next: ProgressState = {
        today,
        streakDays,
        lastCompletedDate: todayKey,
        history: [...prev.history, result].slice(-100),
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({ settings, updateSettings, progress, recordGameResult }),
    [settings, updateSettings, progress, recordGameResult],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within <AppProvider>");
  return ctx;
}

export function isGameEnabled(settings: BreakBuddySettings, id: GameId): boolean {
  return settings.enabledGames.includes(id);
}
