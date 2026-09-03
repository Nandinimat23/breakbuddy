import { useEffect, useState } from "react";

export interface PetReactionState {
  text: string;
  key: number;
}

/**
 * Drives the short-lived speech-bubble message shown next to the pet
 * companion during gameplay (e.g. "Great punch!", "Nice kick!").
 * Calling `react(text)` always re-triggers the pop-in animation, even
 * if the same message fires twice in a row, because each call bumps
 * an internal key used to remount the bubble.
 */
export function usePetReaction(autoHideMs = 1600) {
  const [state, setState] = useState<PetReactionState | null>(null);

  const react = (text: string) => {
    setState((prev) => ({ text, key: (prev?.key ?? 0) + 1 }));
  };

  useEffect(() => {
    if (!state) return;
    const timeout = setTimeout(() => setState(null), autoHideMs);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return { reaction: state, react };
}
