import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { PETS } from "../../data/pets";
import { GAME_DEFINITIONS } from "../../games/registry";
import type { BreakFrequencyMinutes, BreakDurationSeconds, GameId, GameSelectionMode } from "../../types";
import { Button } from "../../components/Button/Button";
import { resetAllData } from "../../utils/storage";
import "./Settings.css";

const FREQUENCY_OPTIONS: { value: BreakFrequencyMinutes; label: string }[] = [
  { value: 30, label: "Every 30 minutes" },
  { value: 60, label: "Every 60 minutes" },
  { value: 90, label: "Every 90 minutes" },
  { value: 120, label: "Every 2 hours" },
  { value: 180, label: "Every 3 hours" },
];

const DURATION_OPTIONS: { value: BreakDurationSeconds; label: string }[] = [
  { value: 15, label: "15 sec" },
  { value: 30, label: "30 sec" },
  { value: 60, label: "60 sec" },
];

/** Settings page (PRD sections 9 & 20). */
export function Settings() {
  const { settings, updateSettings } = useAppContext();
  const navigate = useNavigate();

  const toggleGame = (id: GameId) => {
    const enabled = settings.enabledGames.includes(id);
    if (enabled && settings.enabledGames.length === 1) return; // at least one game must stay enabled
    const next = enabled
      ? settings.enabledGames.filter((g) => g !== id)
      : [...settings.enabledGames, id];
    updateSettings({ enabledGames: next });
  };

  return (
    <div className="page bb-settings">
      <header className="bb-settings-header">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <h1>Settings</h1>
      </header>

      <section className="card stack">
        <span className="eyebrow">Pet</span>
        <div className="row">
          {PETS.map((pet) => (
            <button
              key={pet.id}
              className={`bb-settings-pet ${settings.pet === pet.id ? "is-selected" : ""}`}
              onClick={() => updateSettings({ pet: pet.id })}
              aria-pressed={settings.pet === pet.id}
            >
              {pet.emoji} {pet.name}
            </button>
          ))}
        </div>
      </section>

      <section className="card stack">
        <span className="eyebrow">Working hours</span>
        <div className="row bb-settings-time-row">
          <label className="stack">
            Start
            <input
              type="time"
              value={settings.workingHours.start}
              onChange={(e) =>
                updateSettings({ workingHours: { ...settings.workingHours, start: e.target.value } })
              }
            />
          </label>
          <label className="stack">
            End
            <input
              type="time"
              value={settings.workingHours.end}
              onChange={(e) =>
                updateSettings({ workingHours: { ...settings.workingHours, end: e.target.value } })
              }
            />
          </label>
        </div>
      </section>

      <section className="card stack">
        <span className="eyebrow">Break frequency</span>
        <div className="bb-settings-chip-group">
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`bb-settings-chip ${settings.breakFrequencyMinutes === opt.value ? "is-selected" : ""}`}
              onClick={() => updateSettings({ breakFrequencyMinutes: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card stack">
        <span className="eyebrow">Break duration</span>
        <div className="bb-settings-chip-group">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`bb-settings-chip ${settings.breakDurationSeconds === opt.value ? "is-selected" : ""}`}
              onClick={() => updateSettings({ breakDurationSeconds: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card stack">
        <span className="eyebrow">Games</span>
        {GAME_DEFINITIONS.map((game) => (
          <label key={game.id} className="bb-settings-checkbox-row">
            <input
              type="checkbox"
              checked={settings.enabledGames.includes(game.id)}
              onChange={() => toggleGame(game.id)}
            />
            {game.emoji} {game.name}
          </label>
        ))}
        <p className="bb-settings-hint">At least one game must remain enabled.</p>
      </section>

      <section className="card stack">
        <span className="eyebrow">Game selection</span>
        <div className="bb-settings-chip-group">
          {(["user-chooses", "random"] as GameSelectionMode[]).map((mode) => (
            <button
              key={mode}
              className={`bb-settings-chip ${settings.gameSelectionMode === mode ? "is-selected" : ""}`}
              onClick={() => updateSettings({ gameSelectionMode: mode })}
            >
              {mode === "user-chooses" ? "User chooses" : "Random"}
            </button>
          ))}
        </div>
      </section>

      <section className="card stack">
        <span className="eyebrow">Accessibility</span>
        <label className="bb-settings-checkbox-row">
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
          />
          Reduce motion
        </label>
      </section>

      <Button
        variant="danger"
        onClick={() => {
          if (confirm("Reset all BreakBuddy data on this device?")) {
            resetAllData();
            window.location.href = "/";
          }
        }}
      >
        Reset all data
      </Button>
    </div>
  );
}
