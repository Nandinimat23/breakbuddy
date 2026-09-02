import { useEffect, useState } from "react";
import { ReminderService } from "../services/timer/ReminderService";
import type { BreakBuddySettings } from "../types";

/**
 * React adapter around ReminderService (see src/services/timer).
 * Keeps a single long-lived service instance across re-renders and
 * exposes just what the UI needs: whether a break is due, and how
 * long until the next one.
 */
export function useReminderTimer(settings: BreakBuddySettings) {
  const [service] = useState(
    () =>
      new ReminderService({
        workingHours: settings.workingHours,
        intervalMinutes: settings.breakFrequencyMinutes,
      }),
  );

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
    },
    completeBreak: () => {
      setBreakDue(false);
      service.resetTimer();
    },
    pauseNotifications: () => service.pauseNotifications(),
  };
}
