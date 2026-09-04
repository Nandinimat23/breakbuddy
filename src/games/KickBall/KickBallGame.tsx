import { useEffect, useRef, useState } from "react";
import type { GameScreenProps } from "../GameScreenProps";
import { useGameCountdown } from "../../hooks/useGameCountdown";
import { usePetReaction } from "../../hooks/usePetReaction";
import { formatCountdown } from "../../utils/time";
import { GameHUD, PetCorner } from "../../components/GameHUD/GameHUD";
import { SoccerBall } from "../../assets/gameArt/GameArt";
import "../games-common.css";
import "./KickBallGame.css";

const KICK_TOLERANCE_X = 0.22;
const KICK_COOLDOWN_MS = 700;
// Kick detection is based on how far the leg point has risen within a
// short rolling window, not on crossing some fixed absolute Y value.
// An absolute threshold assumes the tracked landmark (ankle) always
// rests near the bottom of frame — but MediaPipe sometimes falls back
// to the knee (see MotionTrackingService), which rests much higher up,
// and every user sits at a different distance from their camera. A
// "did it move up fast enough" check works the same regardless of
// which landmark or framing is in play.
const RISE_WINDOW_MS = 350;
const MIN_RISE = 0.07; // normalized units (~7% of frame height) within the window
const GOAL_ZONES = [0.25, 0.5, 0.75];
const GOAL_MESSAGES = ["GOAL! Amazing kick! ⚽", "Woohoo! Nice shot!", "You've got this!"];
const MISS_MESSAGES = ["Just wide — try again!", "So close!", "Almost there!"];
const REST_Y = 0.8;
const GOAL_Y = 0.22;
const DRIBBLE_MIN_X = 0.24;
const DRIBBLE_MAX_X = 0.76;
const FLIGHT_MS = 380;

/**
 * Game 3 — Kick the Ball (PRD section 14). Pose-tracking game: the
 * ball sits near your feet and nudges left/right as you shift your
 * leg toward it (a "dribble" feel), then a rapid upward ankle
 * movement (edge-detected, not just "leg is up") kicks it — it
 * animates flying to wherever the goal currently is before resetting.
 */
export function KickBallGame({ frame, demoMode, durationSeconds, petId, onComplete }: GameScreenProps) {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [goalX, setGoalX] = useState(0.5);
  const [feedback, setFeedback] = useState<"goal" | "miss" | null>(null);
  const [ballPos, setBallPos] = useState({ x: 0.5, y: REST_Y });
  const [flying, setFlying] = useState(false);
  const history = useRef<{ y: number; t: number }[]>([]);
  const lastKickAt = useRef(0);
  const finishedRef = useRef(false);
  const flyingRef = useRef(false);
  const { reaction, react } = usePetReaction();

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete({ score, hits, attempts, durationSeconds });
  };

  const remaining = useGameCountdown(durationSeconds, finish);

  useEffect(() => {
    const ankle = frame.ankles[0] ?? frame.ankles[1];
    if (!ankle) return;

    // Dribble: while the ball is on the ground, let it drift toward
    // whichever side the player's leg is on, so it feels nudged
    // rather than glued in place.
    if (!flyingRef.current) {
      const dribbleX = Math.min(DRIBBLE_MAX_X, Math.max(DRIBBLE_MIN_X, ankle.x));
      setBallPos((p) => ({ x: p.x + (dribbleX - p.x) * 0.25, y: REST_Y }));
    }

    const now = Date.now();
    history.current.push({ y: ankle.y, t: now });
    // Keep only the recent window; a couple of extra entries past the
    // cutoff are fine since we just need the oldest-in-window sample.
    while (history.current.length > 1 && now - history.current[0].t > RISE_WINDOW_MS) {
      history.current.shift();
    }
    const oldest = history.current[0];
    const rise = oldest ? oldest.y - ankle.y : 0; // positive = moved up
    const cooledDown = now - lastKickAt.current > KICK_COOLDOWN_MS;

    if (rise >= MIN_RISE && cooledDown && !flyingRef.current) {
      history.current = [];
      lastKickAt.current = now;
      const kickedFromX = ballPos.x;
      const scored = Math.abs(kickedFromX - goalX) <= KICK_TOLERANCE_X;
      setAttempts((a) => a + 1);
      flyingRef.current = true;
      setFlying(true);
      setBallPos({ x: goalX, y: GOAL_Y });

      if (scored) {
        setHits((h) => h + 1);
        setScore((s) => s + 20);
        setFeedback("goal");
        react(GOAL_MESSAGES[Math.floor(Math.random() * GOAL_MESSAGES.length)]);
      } else {
        setFeedback("miss");
        react(MISS_MESSAGES[Math.floor(Math.random() * MISS_MESSAGES.length)]);
      }

      const nextGoalX = GOAL_ZONES[Math.floor(Math.random() * GOAL_ZONES.length)];
      setTimeout(() => {
        setGoalX(nextGoalX);
        setBallPos({ x: 0.5, y: REST_Y });
        flyingRef.current = false;
        setFlying(false);
      }, FLIGHT_MS);
      setTimeout(() => setFeedback(null), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame]);

  return (
    <>
      <GameHUD
        timeLabel={formatCountdown(remaining)}
        lowTime={remaining <= 5}
        scoreValue={score}
        statLabel="GOALS"
        statValue={`${hits}/${attempts}`}
      />

      {/* Goal net */}
      <div
        style={{
          position: "absolute",
          left: `${goalX * 100}%`,
          top: "20%",
          transform: "translateX(-50%)",
          width: "34%",
          height: "18%",
          border: "4px solid #fff",
          borderBottom: "none",
          borderRadius: "6px 6px 0 0",
          opacity: 0.85,
        }}
        aria-hidden="true"
      />

      <div
        className={`bb-kickball-ball ${flying ? "is-flying" : ""}`}
        style={{ left: `${ballPos.x * 100}%`, top: `${ballPos.y * 100}%` }}
        aria-hidden="true"
      >
        <SoccerBall />
      </div>

      {feedback && (
        <span
          className="bb-game-hit-label"
          style={{ left: `${goalX * 100}%`, top: "35%", color: feedback === "goal" ? "#ffe14d" : "#ff8080" }}
        >
          {feedback === "goal" ? "GOAL! 🎉" : "Just wide!"}
        </span>
      )}

      <PetCorner petId={petId} reaction={reaction} />

      <div className="bb-game-instruction">
        {demoMode
          ? "Move your mouse to the ball, then flick it up to kick!"
          : "Step toward the ball, then raise your leg quickly to kick!"}
      </div>
    </>
  );
}
