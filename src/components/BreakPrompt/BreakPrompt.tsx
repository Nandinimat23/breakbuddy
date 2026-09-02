import { getPet, randomMessage } from "../../data/pets";
import type { PetId } from "../../types";
import { Button } from "../Button/Button";
import "./BreakPrompt.css";

export interface BreakPromptProps {
  petId: PetId;
  onLetsGo: () => void;
  onNotNow: () => void;
}

/**
 * The corner prompt shown when the reminder timer fires
 * (PRD section 10 — Break Behavior).
 */
export function BreakPrompt({ petId, onLetsGo, onNotNow }: BreakPromptProps) {
  const pet = getPet(petId);
  const message = randomMessage(pet.messages.intro);

  return (
    <div className="bb-break-prompt" role="alertdialog" aria-label="Break reminder">
      <div className="bb-break-prompt-bubble">
        <p className="bb-break-prompt-text">{message}</p>
        <p className="bb-break-prompt-sub">Ready for a tiny movement break?</p>
        <div className="bb-break-prompt-actions">
          <Button onClick={onLetsGo}>Let's Go!</Button>
          <Button variant="ghost" onClick={onNotNow}>
            Not Now
          </Button>
        </div>
      </div>
      <div className="bb-break-prompt-avatar" aria-hidden="true">
        {pet.emoji}
      </div>
    </div>
  );
}
