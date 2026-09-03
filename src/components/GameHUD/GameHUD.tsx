import { getPet } from "../../data/pets";
import type { PetId } from "../../types";
import type { PetReactionState } from "../../hooks/usePetReaction";
import "./GameHUD.css";

export interface GameHUDProps {
  /** e.g. "00:24" */
  timeLabel: string;
  /** Pulses the timer chip red when time is running low. */
  lowTime?: boolean;
  scoreLabel?: string;
  scoreValue?: number | string;
  statLabel?: string;
  statValue?: string | number;
}

/**
 * The top HUD strip shown during gameplay: a score chip (left), a
 * timer chip (center), and an optional game-specific stat chip
 * (right, e.g. "COMBO x6" or "GOALS 3/5"). Matches the score/timer
 * badge treatment from the product mockups.
 */
export function GameHUD({ timeLabel, lowTime, scoreLabel = "SCORE", scoreValue, statLabel, statValue }: GameHUDProps) {
  return (
    <div className="bb-hud">
      {scoreValue !== undefined ? (
        <div className="bb-hud-chip">
          <span className="bb-hud-chip-label">{scoreLabel}</span>
          <span className="bb-hud-chip-value">{scoreValue}</span>
        </div>
      ) : (
        <span aria-hidden="true" />
      )}

      <div className={`bb-hud-chip bb-hud-chip--timer ${lowTime ? "is-low" : ""}`}>
        <span className="bb-hud-chip-icon" aria-hidden="true">
          ⏱
        </span>
        <span className="bb-hud-chip-value bb-hud-mono">{timeLabel}</span>
      </div>

      {statValue !== undefined ? (
        <div className="bb-hud-chip">
          <span className="bb-hud-chip-label">{statLabel}</span>
          <span className="bb-hud-chip-value">{statValue}</span>
        </div>
      ) : (
        <span aria-hidden="true" />
      )}
    </div>
  );
}

export interface PetCornerProps {
  petId: PetId;
  reaction?: PetReactionState | null;
}

/**
 * The pet companion that sits in the corner during gameplay and
 * pops up a short encouragement bubble on scoring events, mirroring
 * the "Great punch!" / "Nice kick!" moments from the mockups.
 */
export function PetCorner({ petId, reaction }: PetCornerProps) {
  const pet = getPet(petId);
  return (
    <div className="bb-hud-pet">
      {reaction && (
        <div key={reaction.key} className="bb-hud-pet-bubble">
          {reaction.text}
        </div>
      )}
      <img src={pet.image} alt={pet.name} className="bb-hud-pet-avatar" />
    </div>
  );
}
