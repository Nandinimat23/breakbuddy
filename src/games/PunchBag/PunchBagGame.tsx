import { useEffect, useRef, useState } from "react";
import type { GameScreenProps } from "../GameScreenProps";
import { firstPoint } from "../GameScreenProps";
import { useGameCountdown } from "../../hooks/useGameCountdown";
import { usePetReaction } from "../../hooks/usePetReaction";
import { formatCountdown } from "../../utils/time";
import { GameHUD, PetCorner } from "../../components/GameHUD/GameHUD";
import { PunchingBag } from "../../assets/gameArt/GameArt";
import "../games-common.css";
import "./PunchBagGame.css";

// Target spots land on the punching bag's surface (PRD section 12
// example sequence), a tighter cluster than a free-floating target
// since they need to visually sit on the bag illustration.
const SPOTS = [
  { x: 0.46, y: 0.4 },
  { x: 0.54, y: 0.52 },
  { x: 0.47, y: 0.64 },
  { x: 0.53, y: 0.46 },
  { x: 0.5, y: 0.58 },
];

const HIT_RADIUS = 0.11;
const TARGET_LIFESPAN_MS = 2200;
const HIT_COOLDOWN_MS = 350;
const HIT_MESSAGES = ["Great punch! 🥊", "Keep it up!", "Nice one!", "You're on fire!"];

/**
 * Game 1 — Punch the Bag (PRD section 12). Hand-tracking game: hit
 * the floating target before it expires and it moves to a new spot.
 * Tracks a combo streak that resets on a miss, shown in the HUD.
 */
export function PunchBagGame({ frame, demoMode, durationSeconds, petId, onComplete }: GameScreenProps) {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [combo, setCombo] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [justHit, setJustHit] = useState(false);
  const spawnedAt = useRef(Date.now());
  const lastHitAt = useRef(0);
  const finishedRef = useRef(false);
  const { reaction, react } = usePetReaction();

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
        setCombo(0);
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
      setCombo((c) => {
        const next = c + 1;
        if (next > 0 && next % 3 === 0) react(`Combo x${next}! 🔥`);
        else react(HIT_MESSAGES[Math.floor(Math.random() * HIT_MESSAGES.length)]);
        return next;
      });
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
      <GameHUD
        timeLabel={formatCountdown(remaining)}
        lowTime={remaining <= 5}
        scoreValue={score}
        statLabel="COMBO"
        statValue={`x${combo}`}
      />

      <div className="bb-punchbag-bag" aria-hidden="true">
        <PunchingBag />
      </div>

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

      <PetCorner petId={petId} reaction={reaction} />

      <div className="bb-game-instruction">
        {demoMode ? "Move your mouse over the targets" : "Punch toward the glowing target!"}
      </div>
    </>
  );
}
