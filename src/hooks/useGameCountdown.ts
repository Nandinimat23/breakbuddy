import { useEffect, useRef, useState } from "react";

/**
 * Elapsed-time-based countdown shared by every game (mirrors the
 * approach used in ReminderService — see PRD section 23). Calling
 * `onExpire` is left to the caller so each game can decide whether
 * running out the clock counts as a "complete" or just ends the round.
 */
export function useGameCountdown(durationSeconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const left = Math.max(0, durationSeconds - elapsed);
      setRemaining(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(id);
        onExpire();
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSeconds]);

  return remaining;
}
