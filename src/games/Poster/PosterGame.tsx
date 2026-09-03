import { useEffect, useRef, useState } from "react";
import type { GameScreenProps } from "../GameScreenProps";
import { firstPoint } from "../GameScreenProps";
import { useGameCountdown } from "../../hooks/useGameCountdown";
import { usePetReaction } from "../../hooks/usePetReaction";
import { formatCountdown } from "../../utils/time";
import { GameHUD, PetCorner } from "../../components/GameHUD/GameHUD";
import { POSTER_DESIGNS, PosterArt } from "../../assets/posters/PosterArt";
import "../games-common.css";
import "./PosterGame.css";

const TOTAL_POSTERS = POSTER_DESIGNS.length;
const PICKUP_SPOT = { x: 0.5, y: 0.8 };
const TARGET_SPOTS = [
  { x: 0.26, y: 0.24 },
  { x: 0.74, y: 0.22 },
  { x: 0.5, y: 0.2 },
  { x: 0.36, y: 0.26 },
];
const GRAB_RADIUS = 0.16;
const PLACEMENT_MESSAGES = ["Perfect placement! 🎉", "Looking great!", "Nice reach!", "Room's looking cozy!"];

/**
 * Game 4 — Put Up the Poster (PRD section 15). Hand-tracking game:
 * pick up the poster near the bottom, carry it (it follows your
 * hand), and place it on the highlighted wall spot near the top.
 * Cycles through 4 real poster designs (not emoji) one at a time.
 */
export function PosterGame({ frame, demoMode, durationSeconds, petId, onComplete }: GameScreenProps) {
  const [placed, setPlaced] = useState(0);
  const [carrying, setCarrying] = useState(false);
  const [targetIndex, setTargetIndex] = useState(0);
  const [justPlaced, setJustPlaced] = useState(false);
  const finishedRef = useRef(false);
  const { reaction, react } = usePetReaction();

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete({ score: placed * 25, hits: placed, attempts: TOTAL_POSTERS, durationSeconds });
  };

  const remaining = useGameCountdown(durationSeconds, finish);

  useEffect(() => {
    if (placed === 0) react("Let's decorate this wall! 🖼️");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      react(PLACEMENT_MESSAGES[Math.floor(Math.random() * PLACEMENT_MESSAGES.length)]);
      setTimeout(() => setJustPlaced(false), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame]);

  const point = firstPoint(frame.hands);
  const currentDesign = POSTER_DESIGNS[targetIndex % TOTAL_POSTERS].id;
  const target = TARGET_SPOTS[targetIndex % TARGET_SPOTS.length];
  const posterPos = carrying && point ? point : PICKUP_SPOT;

  return (
    <>
      <GameHUD
        timeLabel={formatCountdown(remaining)}
        lowTime={remaining <= 5}
        scoreValue={placed * 25}
        statLabel="POSTERS"
        statValue={`${placed}/${TOTAL_POSTERS}`}
      />

      {/* Already-placed posters stay visible on the wall */}
      {TARGET_SPOTS.slice(0, placed).map((spot, i) => (
        <div
          key={i}
          className="bb-poster-mounted"
          style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
        >
          <PosterArt design={POSTER_DESIGNS[i].id} />
        </div>
      ))}

      {/* Highlighted wall target */}
      {placed < TOTAL_POSTERS && (
        <div
          className={`bb-poster-target ${justPlaced ? "is-placed" : ""}`}
          style={{ left: `${target.x * 100}%`, top: `${target.y * 100}%` }}
          aria-hidden="true"
        />
      )}

      {/* The poster itself, carried or waiting at the pickup spot */}
      {placed < TOTAL_POSTERS && (
        <div
          className={`bb-poster-carried ${carrying ? "is-carried" : ""}`}
          style={{ left: `${posterPos.x * 100}%`, top: `${posterPos.y * 100}%` }}
          aria-hidden="true"
        >
          <PosterArt design={currentDesign} />
        </div>
      )}

      {justPlaced && (
        <span className="bb-game-hit-label" style={{ left: `${target.x * 100}%`, top: `${target.y * 100}%` }}>
          Placed! ✨
        </span>
      )}

      {point && <div className="bb-game-pointer" style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }} />}

      <div className="bb-poster-progress" aria-hidden="true">
        {POSTER_DESIGNS.map((d, i) => (
          <span key={d.id} className={`bb-poster-dot ${i < placed ? "is-done" : ""}`} />
        ))}
      </div>

      <PetCorner petId={petId} reaction={reaction} />

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
