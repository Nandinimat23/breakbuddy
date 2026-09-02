import type { GameDefinition, GameId } from "../types";

/**
 * Game catalogue — the single source of truth for which games exist.
 *
 * To add a new game to BreakBuddy:
 *   1. Add a GameDefinition entry here.
 *   2. Create a component in src/games/<YourGame>/ that implements
 *      the shared game-screen contract (see games/GameScreenProps.ts).
 *   3. Register the component in games/gameComponents.tsx.
 *
 * Nothing else in the app (selection screen, settings, dashboard,
 * scoring) needs to change — they all read from this list.
 */
export const GAME_DEFINITIONS: GameDefinition[] = [
  {
    id: "punch-bag",
    name: "Punch the Bag",
    emoji: "🥊",
    tagline: "Move your arms",
    description: "Hit as many targets as you can before time runs out.",
    trackingType: "hand",
    duration: 30,
  },
  {
    id: "drink-up",
    name: "Drink Up",
    emoji: "🥤",
    tagline: "Stretch your neck",
    description: "Look up and finish your drink to stretch your neck.",
    trackingType: "face",
    duration: 18,
  },
  {
    id: "kick-ball",
    name: "Kick the Ball",
    emoji: "⚽",
    tagline: "Move your legs",
    description: "Kick the ball into the goal. Use your legs and aim!",
    trackingType: "pose",
    duration: 30,
  },
  {
    id: "poster",
    name: "Put Up the Poster",
    emoji: "🖼️",
    tagline: "Reach and stretch",
    description: "Pick up the poster and place it on the wall.",
    trackingType: "hand",
    duration: 30,
  },
];

export const DEFAULT_ENABLED_GAMES: GameId[] = GAME_DEFINITIONS.map((g) => g.id);

export function getGameDefinition(id: GameId): GameDefinition {
  const def = GAME_DEFINITIONS.find((g) => g.id === id);
  if (!def) throw new Error(`Unknown game id: ${id}`);
  return def;
}
