import { useState } from "react";
import { hasOnboarded, setOnboarded } from "../utils/storage";

/** Tracks whether the user has completed pet selection (PRD section 6). */
export function useOnboarding() {
  const [onboarded, setOnboardedState] = useState(hasOnboarded);
  const completeOnboarding = () => {
    setOnboarded();
    setOnboardedState(true);
  };
  return { onboarded, completeOnboarding };
}
