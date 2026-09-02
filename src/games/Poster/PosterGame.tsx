import { useEffect, useRef, useState } from "react";
import type { GameScreenProps } from "../GameScreenProps";
import { firstPoint } from "../GameScreenProps";
import { useGameCountdown } from "../../hooks/useGameCountdown";
import { formatCountdown } from "../../utils/time";
import "../games-common.css";

const TOTAL_POSTERS = 4;
const PICKUP_SPOT = { x: 0.5, y: 0.78 };
const TARGET_SPOTS = [
  { x: 0.28, y: 0.22 },
  { x: 0.72, y: 0.2 },
  { x: 0.5, y: 0.18 },
  { x: 0.35, y: 0.25 },
];
const GRAB_RADIUS = 0.16;

/**
 * Game 4 — Put Up the Poster (PRD section 15). Hand-tracking game:
 * pick up the poster near the bottom, carry it (it follows your
 * hand), and place it on the highlighted wall spot near the top.
 */
export function PosterGame({ frame, demoMode, durationSeconds, onComplete }: GameScreenProps) {
  const [placed, setPlaced] = useState(0);
  const [carrying, setCarrying] = useState(false);
  const [targetIndex, setTargetIndex] = useState(0);
  const [justPlaced, setJustPlaced] = useState(false);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete({ score: placed * 25, hits: placed, attempts: TOTAL_POSTERS, durationSeconds });
  };

  const remaining = useGameCountdown(durationSeconds, finish);

  useEffect(() => {
    if (placed >= TOTAL_POSTERS) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed]);

  useEffect(() => {
    const point = firstPoint(frame.hands);
    if (!point) return;
    const target = TARGET_SPOTS[targetIndex % TARGET_SPOTS.length];

    if (!carrying) {
      if (Math.hypot(point.x - PICKUP_SPOT.x, point.y - PICKUP_SPOT.y) <= GRAB_RADIUS) {
        setCarrying(true);
      }
    } else if (Math.hypot(point.x - target.x, point.y - target.y) <= GRAB_RADIUS) {
      setCarrying(false);
      setJustPlaced(true);
      setTargetIndex((i) => i + 1);
      setPlaced((p) => p + 1);
      setTimeout(() => setJustPlaced(false), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame]);

  const point = firstPoint(frame.hands);
  const target = TARGET_SPOTS[targetIndex % TARGET_SPOTS.length];
  const posterPos = carrying && point ? point : PICKUP_SPOT;

  return (
    <>
      <div className="bb-game-hud">
        <span className="bb-game-hud-chip">⏱ {formatCountdown(remaining)}</span>
        <span className="bb-game-hud-chip">🖼️ {placed}/{TOTAL_POSTERS}</span>
      </div>

      {/* Highlighted wall target */}
      <div
        style={{
          position: "absolute",
          left: `${target.x * 100}%`,
          top: `${target.y * 100}%`,
          width: "18%",
          aspectRatio: "3/4",
          transform: "translate(-50%, -50%)",
          border: "3px dashed #fff",
          borderRadius: "8px",
          opacity: 0.8,
        }}
        aria-hidden="true"
      />

      {/* The poster itself */}
      <span
        className="bb-game-anchor"
        style={{ left: `${posterPos.x * 100}%`, top: `${posterPos.y * 100}%`, fontSize: "2.75rem" }}
        aria-hidden="true"
      >
        🖼️
      </span>

      {justPlaced && (
        <span className="bb-game-hit-label" style={{ left: `${target.x * 100}%`, top: `${target.y * 100}%` }}>
          POSTER PLACED! 🎉
        </span>
      )}

      {point && <div className="bb-game-pointer" style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }} />}

      <div className="bb-game-instruction">
        {!carrying
          ? demoMode
            ? "Move your mouse to the poster to pick it up"
            : "Reach toward the poster to pick it up!"
          : "Reach up to the highlighted spot!"}
      </div>
    </>
  );
}
