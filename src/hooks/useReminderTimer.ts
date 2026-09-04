import { useEffect, useState } from "react";
import { ReminderService } from "../services/timer/ReminderService";
import type { BreakBuddySettings } from "../types";
import { loadNextBreakAt, saveNextBreakAt } from "../utils/storage";

/**
 * React adapter around ReminderService (see src/services/timer).
 * Keeps a single long-lived service instance across re-renders and
 * exposes just what the UI needs: whether a break is due, and how
 * long until the next one.
 *
 * This is meant to be called exactly once, at the top of the app (see
 * AppContext) — not per-page. Calling it inside a page component would
 * mean navigating away and back recreates the service from scratch,
 * silently resetting the countdown every time.
 */
export function useReminderTimer(settings: BreakBuddySettings) {
  const [service] = useState(() => {
    // Survive a full page reload / the tab being closed and reopened:
    // if we already had a schedule in flight and it's still in the
    // future, pick up where it left off instead of restarting the
    // countdown from "now".
    const persisted = loadNextBreakAt();
    const initialNextBreakAt = persisted && persisted > Date.now() ? persisted : undefined;
    const svc = new ReminderService(
      { workingHours: settings.workingHours, intervalMinutes: settings.breakFrequencyMinutes },
      initialNextBreakAt,
    );
    saveNextBreakAt(svc.getNextBreakAt());
    return svc;
  });

  const [msRemaining, setMsRemaining] = useState(() => service.msUntilNextBreak());
  const [breakDue, setBreakDue] = useState(false);

  useEffect(() => {
    service.updateConfig({
      workingHours: settings.workingHours,
      intervalMinutes: settings.breakFrequencyMinutes,
    });
  }, [service, settings.workingHours, settings.breakFrequencyMinutes]);

  useEffect(() => {
    service.start();
    const offTick = service.onTick(() => setMsRemaining(service.msUntilNextBreak()));
    const offDue = service.onBreakDue(() => setBreakDue(true));
    return () => {
      offTick();
      offDue();
      service.stop();
    };
  }, [service]);

  return {
    msRemaining,
    breakDue,
    dismissBreak: () => {
      setBreakDue(false);
      service.snooze();
      saveNextBreakAt(service.getNextBreakAt());
    },
    completeBreak: () => {
      setBreakDue(false);
      service.resetTimer();
      saveNextBreakAt(service.getNextBreakAt());
    },
    pauseNotifications: () => service.pauseNotifications(),
  };
}
