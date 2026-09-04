import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { PETS, getPet } from "../../data/pets";
import { GAME_DEFINITIONS } from "../../games/registry";
import type {
  BreakFrequencyMinutes,
  BreakDurationSeconds,
  CameraPermissionMode,
  GameId,
  GameSelectionMode,
} from "../../types";
import { Button } from "../../components/Button/Button";
import { resetAllData } from "../../utils/storage";
import { getNotificationPermission, requestNotificationPermission } from "../../utils/notifications";
import "./Settings.css";

const CAMERA_MODE_OPTIONS: { value: CameraPermissionMode; title: string; description: string }[] = [
  {
    value: "ask-once",
    title: "Ask once",
    description:
      "Show the camera explanation the first time, then start the camera right away on every break after that.",
  },
  {
    value: "ask-always",
    title: "Ask every time",
    description: "Show the camera explanation and require a tap to enable the camera before every game.",
  },
];

const FREQUENCY_OPTIONS: { value: BreakFrequencyMinutes; label: string }[] = [
  { value: 15, label: "Every 15 minutes" },
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
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission());

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
  };

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
              <img src={pet.image} alt="" className="bb-settings-pet-thumb" />
              {pet.name}
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
        <span className="eyebrow">Camera</span>
        <div className="bb-settings-radio-group" role="radiogroup" aria-label="Camera permission prompts">
          {CAMERA_MODE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`bb-settings-radio-option ${settings.cameraPermissionMode === opt.value ? "is-selected" : ""}`}
            >
              <input
                type="radio"
                name="cameraPermissionMode"
                checked={settings.cameraPermissionMode === opt.value}
                onChange={() => updateSettings({ cameraPermissionMode: opt.value })}
              />
              <span>
                <span className="bb-settings-radio-option-title">{opt.title}</span>
                <span className="bb-settings-radio-option-desc">{opt.description}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="bb-settings-hint">
          Either way, your camera feed is processed locally in your browser and is never stored
          or uploaded.
        </p>
      </section>

      <section className="card stack">
        <span className="eyebrow">Notifications</span>
        {notifPermission === "unsupported" && (
          <p className="bb-settings-hint">Your browser doesn't support desktop notifications.</p>
        )}
        {notifPermission === "granted" && (
          <p className="bb-settings-hint">
            🔔 Desktop notifications are on — {getPet(settings.pet).name} will alert you even if
            you're working in another window.
          </p>
        )}
        {notifPermission === "denied" && (
          <p className="bb-settings-hint">
            Notifications are blocked. Enable them for this site in your browser's settings to get
            break alerts while you're working elsewhere.
          </p>
        )}
        {notifPermission === "default" && (
          <>
            <p className="bb-settings-hint">
              Since you won't always be looking at this tab, turn on desktop notifications so{" "}
              {getPet(settings.pet).name} can reach you even when you're working in another
              window.
            </p>
            <Button onClick={handleEnableNotifications}>Enable desktop notifications</Button>
          </>
        )}
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
