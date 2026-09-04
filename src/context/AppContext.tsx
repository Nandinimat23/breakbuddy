import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BreakBuddySettings, GameId, GameResult, ProgressState } from "../types";
import { loadProgress, loadSettings, saveProgress, saveSettings } from "../utils/storage";
import { useReminderTimer } from "../hooks/useReminderTimer";
import { getPet, randomMessage } from "../data/pets";
import { pickRandomGame } from "../games/registry";
import { showBreakNotification } from "../utils/notifications";
import { track } from "../utils/analytics";

interface AppContextValue {
  settings: BreakBuddySettings;
  updateSettings: (patch: Partial<BreakBuddySettings>) => void;
  progress: ProgressState;
  recordGameResult: (result: GameResult) => void;
  /** Reminder timer — a single app-lifetime instance (see useReminderTimer). */
  msUntilNextBreak: number;
  breakDue: boolean;
  dismissBreak: () => void;
  /** Call when a break's game actually finishes, to reschedule the next one. */
  completeBreak: () => void;
  /** Starts a break: tracks it, pauses the reminder, and jumps into a
   * game directly (Random mode) or the picker (User chooses). Shared
   * by the manual "Take a break now" button, the in-app BreakPrompt,
   * and the desktop notification's click handler so they all agree on
   * how a break gets started. */
  startBreak: () => void;
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
  const navigate = useNavigate();

  // A single reminder timer for the whole app session — called here,
  // at the top, rather than inside a page component. Pages come and
  // go (Dashboard <-> GamePlay <-> Settings) but this needs to keep
  // ticking and stay able to fire a break regardless of which page is
  // currently on screen.
  const reminder = useReminderTimer(settings);

  const startBreak = useCallback(() => {
    track("break_started");
    reminder.pauseNotifications();
    // "Random" mode skips the picker screen entirely — by the time
    // you're starting a break you're already committed to playing
    // something; the picker is only useful when you actually want to
    // choose.
    if (settings.gameSelectionMode === "random") {
      navigate(`/break/${pickRandomGame(settings.enabledGames)}`);
    } else {
      navigate("/break");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, settings.gameSelectionMode, settings.enabledGames]);

  // Desktop notification: the in-app pet bubble only helps if someone
  // is actually looking at this tab. Most of the time they're working
  // in a different window, so when a break becomes due while this tab
  // is hidden/unfocused, also fire a native OS notification. Clicking
  // it jumps straight into a break, same as "Let's Go!".
  const startBreakRef = useRef(startBreak);
  useEffect(() => {
    startBreakRef.current = startBreak;
  });
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (!reminder.breakDue) {
      notifiedRef.current = false;
      return;
    }
    if (notifiedRef.current) return;
    if (document.visibilityState === "visible" && document.hasFocus()) return;
    notifiedRef.current = true;
    const pet = getPet(settings.pet);
    showBreakNotification(
      `${pet.name} says it's break time! 🐾`,
      randomMessage(pet.messages.intro),
      pet.image,
      () => startBreakRef.current(),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminder.breakDue]);

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
    () => ({
      settings,
      updateSettings,
      progress,
      recordGameResult,
      msUntilNextBreak: reminder.msRemaining,
      breakDue: reminder.breakDue,
      dismissBreak: reminder.dismissBreak,
      completeBreak: reminder.completeBreak,
      startBreak,
    }),
    [settings, updateSettings, progress, recordGameResult, reminder, startBreak],
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
