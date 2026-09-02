import { useEffect, useRef, useState } from "react";
import type { GameScreenProps } from "../GameScreenProps";
import { firstPoint } from "../GameScreenProps";
import { useGameCountdown } from "../../hooks/useGameCountdown";
import { formatCountdown } from "../../utils/time";
import "../games-common.css";

// Reachable target spots (PRD section 12 example sequence), kept close
// to center so no extreme reach is required.
const SPOTS = [
  { x: 0.3, y: 0.3 }, // top left
  { x: 0.7, y: 0.28 }, // top right
  { x: 0.5, y: 0.45 }, // center
  { x: 0.32, y: 0.62 }, // lower left
  { x: 0.68, y: 0.55 }, // right
];

const HIT_RADIUS = 0.13;
const TARGET_LIFESPAN_MS = 2200;
const HIT_COOLDOWN_MS = 350;

/**
 * Game 1 — Punch the Bag (PRD section 12). Hand-tracking game: hit
 * the floating target before it expires and it moves to a new spot.
 */
export function PunchBagGame({ frame, demoMode, durationSeconds, onComplete }: GameScreenProps) {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [justHit, setJustHit] = useState(false);
  const spawnedAt = useRef(Date.now());
  const lastHitAt = useRef(0);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete({ score, hits, attempts, durationSeconds });
  };

  const remaining = useGameCountdown(durationSeconds, finish);

  // Target expiry -> counts as a miss, respawn elsewhere.
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - spawnedAt.current > TARGET_LIFESPAN_MS) {
        setAttempts((a) => a + 1);
        setTargetIndex((i) => (i + 1 + Math.floor(Math.random() * 3)) % SPOTS.length);
        spawnedAt.current = Date.now();
      }
    }, 200);
    return () => clearInterval(id);
  }, []);

  // Collision detection against the live/demo pointer.
  useEffect(() => {
    const point = firstPoint(frame.hands);
    if (!point) return;
    if (Date.now() - lastHitAt.current < HIT_COOLDOWN_MS) return;
    const target = SPOTS[targetIndex];
    const dist = Math.hypot(point.x - target.x, point.y - target.y);
    if (dist <= HIT_RADIUS) {
      lastHitAt.current = Date.now();
      spawnedAt.current = Date.now();
      setScore((s) => s + 10);
      setHits((h) => h + 1);
      setAttempts((a) => a + 1);
      setTargetIndex((i) => (i + 1 + Math.floor(Math.random() * 3)) % SPOTS.length);
      setJustHit(true);
      setTimeout(() => setJustHit(false), 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame]);

  const target = SPOTS[targetIndex];
  const pointer = firstPoint(frame.hands);

  return (
    <>
      <div className="bb-game-hud">
        <span className="bb-game-hud-chip">⏱ {formatCountdown(remaining)}</span>
        <span className="bb-game-hud-chip">Score: {score}</span>
      </div>

      <span className="bb-game-anchor" style={{ left: "50%", top: "68%" }} aria-hidden="true">
        🥊
      </span>

      <div
        className={`bb-game-target ${justHit ? "is-hit" : ""}`}
        style={{ left: `${target.x * 100}%`, top: `${target.y * 100}%` }}
      />
      {justHit && (
        <span
          className="bb-game-hit-label"
          style={{ left: `${target.x * 100}%`, top: `${target.y * 100}%` }}
        >
          HIT! +10
        </span>
      )}

      {pointer && (
        <div className="bb-game-pointer" style={{ left: `${pointer.x * 100}%`, top: `${pointer.y * 100}%` }} />
      )}

      <div className="bb-game-instruction">
        {demoMode ? "Move your mouse over the targets" : "Punch toward the glowing target!"}
      </div>
    </>
  );
}
