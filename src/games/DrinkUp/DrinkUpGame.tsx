import { useEffect, useRef, useState } from "react";
import type { GameScreenProps } from "../GameScreenProps";
import { useGameCountdown } from "../../hooks/useGameCountdown";
import { formatCountdown } from "../../utils/time";
import { ProgressBar } from "../../components/Progress/ProgressBar";
import "../games-common.css";

/**
 * "Looking up" is approximated as the nose landmark sitting in the
 * top portion of the frame — a simplified stand-in for true head-pitch
 * estimation, in line with PRD section 47 ("build a functional
 * simplified version, don't pretend it's more precise than it is").
 */
const LOOK_UP_Y_THRESHOLD = 0.42;

/**
 * Game 2 — Drink Up (PRD section 13). Face-tracking game: hold a
 * gentle "look up" position to drain the drink. Never requires
 * holding an uncomfortable position — progress simply pauses (never
 * reverses) when you look back down.
 */
export function DrinkUpGame({ frame, demoMode, durationSeconds, onComplete }: GameScreenProps) {
  const [level, setLevel] = useState(100);
  const [lookingUp, setLookingUp] = useState(false);
  const lastTick = useRef(Date.now());
  const finishedRef = useRef(false);
  const drainPerSecond = 100 / Math.max(6, durationSeconds * 0.8);

  const finish = (completedNaturally: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete({
      score: Math.round(100 - level),
      hits: completedNaturally ? 1 : level <= 0 ? 1 : 0,
      attempts: 1,
      durationSeconds,
    });
  };

  const remaining = useGameCountdown(durationSeconds, () => finish(false));

  useEffect(() => {
    const isUp = frame.nose !== null && frame.nose.y <= LOOK_UP_Y_THRESHOLD;
    setLookingUp(isUp);
    const now = Date.now();
    const dt = (now - lastTick.current) / 1000;
    lastTick.current = now;
    if (isUp) {
      setLevel((l) => Math.max(0, l - drainPerSecond * dt));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame]);

  useEffect(() => {
    if (level <= 0) finish(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  return (
    <>
      <div className="bb-game-hud">
        <span className="bb-game-hud-chip">⏱ {formatCountdown(remaining)}</span>
        <span className="bb-game-hud-chip">{Math.round(100 - level)}% done</span>
      </div>

      <span
        className="bb-game-anchor"
        style={{ left: "50%", top: lookingUp ? "35%" : "50%", transition: "top 300ms ease" }}
        aria-hidden="true"
      >
        🥤
      </span>

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "12%",
          transform: "translateX(-50%)",
          width: "60%",
        }}
      >
        <ProgressBar value={level} label={`Drink level: ${Math.round(level)}%`} color="linear-gradient(90deg,#ffb347,#ff6fa5)" />
      </div>

      <div className="bb-game-instruction">
        {demoMode
          ? "Press and hold, dragging up toward the top of the frame"
          : lookingUp
            ? "Nice! Keep looking up gently…"
            : "Look up to drink!"}
      </div>
    </>
  );
}
