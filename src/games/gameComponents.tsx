import type { ComponentType } from "react";
import type { GameId } from "../types";
import type { GameScreenProps } from "./GameScreenProps";
import { PunchBagGame } from "./PunchBag/PunchBagGame";
import { DrinkUpGame } from "./DrinkUp/DrinkUpGame";
import { KickBallGame } from "./KickBall/KickBallGame";
import { PosterGame } from "./Poster/PosterGame";

/**
 * Maps each GameId to its implementation component. This is the only
 * file (besides games/registry.ts) that needs an entry when a new
 * game is added.
 */
export const GAME_COMPONENTS: Record<GameId, ComponentType<GameScreenProps>> = {
  "punch-bag": PunchBagGame,
  "drink-up": DrinkUpGame,
  "kick-ball": KickBallGame,
  poster: PosterGame,
};
