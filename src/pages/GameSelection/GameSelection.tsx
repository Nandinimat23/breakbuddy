import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { GAME_DEFINITIONS } from "../../games/registry";
import { GameCard } from "../../components/GameCard/GameCard";
import { Button } from "../../components/Button/Button";
import type { GameId } from "../../types";
import "./GameSelection.css";

/** "Pick your break" screen (PRD section 11). */
export function GameSelection() {
  const { settings } = useAppContext();
  const navigate = useNavigate();

  const enabledGames = GAME_DEFINITIONS.filter((g) => settings.enabledGames.includes(g.id));

  const handleSelect = (id: GameId) => {
    navigate(`/break/${id}`);
  };

  return (
    <div className="page bb-game-selection">
      <Button variant="ghost" onClick={() => navigate("/dashboard")}>
        ← Back
      </Button>
      <h1>Pick your break 🎮</h1>
      <p className="bb-game-selection-sub">
        Make sure you have enough space around you before moving.
      </p>
      <div className="bb-game-selection-grid">
        {enabledGames.map((game) => (
          <GameCard key={game.id} game={game} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}
