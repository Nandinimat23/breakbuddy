import { useEffect, useState } from "react";
import type { PetId } from "../../types";
import { getPet, randomMessage } from "../../data/pets";
import "./Pet.css";

export interface PetProps {
  petId: PetId;
  /** "idle" = small corner companion. "intro"/"celebrate" show a speech bubble. */
  mood?: "idle" | "intro" | "celebrate";
  message?: string;
  size?: "sm" | "lg";
}

/**
 * The floating pet companion (PRD section 24).
 *
 * Renders near the bottom-right corner, bounces gently, and shows a
 * speech bubble with a randomized message. Never blocks the primary
 * work interface — it's purely decorative/positioned via CSS, so
 * pages that need the full pet+bubble presentation (onboarding,
 * break prompt, completion screen) render it inline instead.
 */
export function Pet({ petId, mood = "idle", message, size = "sm" }: PetProps) {
  const pet = getPet(petId);
  const [resolvedMessage] = useState(
    () => message ?? (mood === "celebrate" ? randomMessage(pet.messages.completion) : randomMessage(pet.messages.intro)),
  );

  useEffect(() => {
    // Placeholder for future pet "wake up" sound effects (PRD Phase 8 polish).
  }, [mood]);

  return (
    <div className={`bb-pet bb-pet--${size} bb-pet--${mood}`}>
      {mood !== "idle" && (
        <div className="bb-pet-bubble" role="status">
          {message ?? resolvedMessage}
        </div>
      )}
      <div className="bb-pet-avatar" aria-label={`${pet.name} the ${pet.id}`}>
        {pet.emoji}
      </div>
    </div>
  );
}
