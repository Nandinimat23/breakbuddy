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

  // `onExpire` is a fresh closure every render (it captures the game's
  // current score/hits/etc). The interval below is only set up once
  // per mount, so without this ref it would keep calling the very
  // first render's `onExpire` — reporting whatever the score was at
  // t=0 (i.e. always 0) once time actually runs out. Keeping the
  // latest callback in a ref and calling *that* from the interval is
  // what makes the final score/hits accurate.
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const left = Math.max(0, durationSeconds - elapsed);
      setRemaining(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(id);
        onExpireRef.current();
      }
    }, 100);
    return () => clearInterval(id);
  }, [durationSeconds]);

  return remaining;
}
