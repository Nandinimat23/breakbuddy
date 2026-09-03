import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { useReminderTimer } from "../../hooks/useReminderTimer";
import { getPet } from "../../data/pets";
import { getGameDefinition } from "../../games/registry";
import { formatDuration } from "../../utils/time";
import { Button } from "../../components/Button/Button";
import { Pet } from "../../components/Pet/Pet";
import { BreakPrompt } from "../../components/BreakPrompt/BreakPrompt";
import { track } from "../../utils/analytics";
import "./Dashboard.css";

/** Main dashboard (PRD section 19). */
export function Dashboard() {
  const { settings, progress } = useAppContext();
  const { msRemaining, breakDue, dismissBreak, pauseNotifications } = useReminderTimer(settings);
  const navigate = useNavigate();
  const pet = getPet(settings.pet);

  const handleLetsGo = () => {
    track("break_started");
    pauseNotifications();
    navigate("/break");
  };

  const handleNotNow = () => {
    track("break_dismissed");
    dismissBreak();
  };

  const gamesPlayedToday = Object.entries(progress.today.gamesPlayed) as [
    keyof typeof progress.today.gamesPlayed,
    number,
  ][];

  return (
    <div className="page bb-dashboard">
      <header className="bb-dashboard-header">
        <div>
          <h1>🐾 BreakBuddy</h1>
          <p className="bb-dashboard-sub">Your movement companion</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/settings")}>
          Settings
        </Button>
      </header>

      <section className="card bb-dashboard-card">
        <span className="eyebrow">Today's progress</span>
        <div className="bb-dashboard-stats">
          <div>
            <strong>{progress.today.breaksCompleted}</strong>
            <span>breaks completed</span>
          </div>
          <div>
            <strong>{Math.round(progress.today.movementSeconds / 60)}</strong>
            <span>minutes of movement</span>
          </div>
          <div>
            <strong>🔥 {progress.streakDays}</strong>
            <span>day streak</span>
          </div>
        </div>
      </section>

      <section className="card bb-dashboard-card">
        <span className="eyebrow">Next break</span>
        <p className="bb-dashboard-next-break">
          Next break in {formatDuration(msRemaining)}
        </p>
      </section>

      {gamesPlayedToday.length > 0 && (
        <section className="card bb-dashboard-card">
          <span className="eyebrow">Today's games</span>
          <ul className="bb-dashboard-game-list">
            {gamesPlayedToday.map(([gameId, count]) => {
              const def = getGameDefinition(gameId);
              return (
                <li key={gameId}>
                  {def.emoji} {def.name} — {count}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Button variant="secondary" onClick={handleLetsGo} className="bb-dashboard-manual-break">
        Take a break now
      </Button>

      {!breakDue && (
        <div className="bb-dashboard-pet-corner">
          <Pet petId={settings.pet} mood="idle" />
        </div>
      )}

      {breakDue && <BreakPrompt petId={pet.id} onLetsGo={handleLetsGo} onNotNow={handleNotNow} />}
    </div>
  );
}
