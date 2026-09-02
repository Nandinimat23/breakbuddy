import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PETS } from "../../data/pets";
import type { PetId } from "../../types";
import { Button } from "../../components/Button/Button";
import { useAppContext } from "../../context/AppContext";
import { useOnboarding } from "../../hooks/useLocalStorageFlag";
import "./Onboarding.css";

/** Landing / first-run screen (PRD section 6): pick your pet. */
export function Onboarding() {
  const { updateSettings } = useAppContext();
  const { completeOnboarding } = useOnboarding();
  const [selected, setSelected] = useState<PetId>("dog");
  const navigate = useNavigate();

  const handleChoose = () => {
    updateSettings({ pet: selected });
    completeOnboarding();
    navigate("/dashboard");
  };

  return (
    <div className="page bb-onboarding">
      <div className="bb-onboarding-hero">
        <span className="eyebrow">BreakBuddy 🐾</span>
        <h1>Meet your BreakBuddy</h1>
        <p className="bb-onboarding-sub">
          Your tiny desk companion that helps you move during long work sessions.
        </p>
      </div>

      <div className="bb-onboarding-pets" role="radiogroup" aria-label="Choose your pet">
        {PETS.map((pet) => (
          <button
            key={pet.id}
            role="radio"
            aria-checked={selected === pet.id}
            className={`bb-onboarding-pet ${selected === pet.id ? "is-selected" : ""}`}
            onClick={() => setSelected(pet.id)}
          >
            <span className="bb-onboarding-pet-emoji">{pet.emoji}</span>
            <span className="bb-onboarding-pet-name">{pet.name}</span>
            <span className="bb-onboarding-pet-tagline">{pet.tagline}</span>
            <span className="bb-onboarding-pet-traits">
              {pet.personality.join(" · ")}
            </span>
          </button>
        ))}
      </div>

      <Button size="lg" onClick={handleChoose} className="bb-onboarding-cta">
        Choose this pet
      </Button>

      <p className="disclaimer">
        Move comfortably and make sure you have enough space around you. Stop if anything feels
        uncomfortable. BreakBuddy is a wellness tool, not medical advice.
      </p>
    </div>
  );
}
