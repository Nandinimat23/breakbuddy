import type { GameDefinition } from "../../types";
import "./GameCard.css";

export interface GameCardProps {
  game: GameDefinition;
  onSelect: (id: GameDefinition["id"]) => void;
}

export function GameCard({ game, onSelect }: GameCardProps) {
  return (
    <button className="bb-game-card" onClick={() => onSelect(game.id)}>
      <span className="bb-game-card-emoji" aria-hidden="true">
        {game.emoji}
      </span>
      <span className="bb-game-card-name">{game.name}</span>
      <span className="bb-game-card-tagline">{game.tagline}</span>
    </button>
  );
}
