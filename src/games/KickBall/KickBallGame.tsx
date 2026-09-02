import { useEffect, useRef, useState } from "react";
import type { GameScreenProps } from "../GameScreenProps";
import { useGameCountdown } from "../../hooks/useGameCountdown";
import { formatCountdown } from "../../utils/time";
import "../games-common.css";

const KICK_Y_THRESHOLD = 0.55; // upper half of frame = "leg raised"
const KICK_TOLERANCE_X = 0.22;
const KICK_COOLDOWN_MS = 700;
const GOAL_ZONES = [0.25, 0.5, 0.75];

/**
 * Game 3 — Kick the Ball (PRD section 14). Pose-tracking game: a
 * rapid upward ankle movement (edge-detected, not just "leg is up")
 * counts as one kick; landing near the current goal position scores.
 */
export function KickBallGame({ frame, demoMode, durationSeconds, onComplete }: GameScreenProps) {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [goalX, setGoalX] = useState(0.5);
  const [feedback, setFeedback] = useState<"goal" | "miss" | null>(null);
  const prevY = useRef<number | null>(null);
  const lastKickAt = useRef(0);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete({ score, hits, attempts, durationSeconds });
  };

  const remaining = useGameCountdown(durationSeconds, finish);

  useEffect(() => {
    const ankle = frame.ankles[0] ?? frame.ankles[1];
    if (!ankle) return;
    const wasBelow = prevY.current !== null && prevY.current > KICK_Y_THRESHOLD;
    const isAbove = ankle.y <= KICK_Y_THRESHOLD;
    const cooledDown = Date.now() - lastKickAt.current > KICK_COOLDOWN_MS;

    if (wasBelow && isAbove && cooledDown) {
      lastKickAt.current = Date.now();
      const scored = Math.abs(ankle.x - goalX) <= KICK_TOLERANCE_X;
      setAttempts((a) => a + 1);
      if (scored) {
        setHits((h) => h + 1);
        setScore((s) => s + 20);
        setFeedback("goal");
      } else {
        setFeedback("miss");
      }
      setGoalX(GOAL_ZONES[Math.floor(Math.random() * GOAL_ZONES.length)]);
      setTimeout(() => setFeedback(null), 500);
    }
    prevY.current = ankle.y;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame]);

  return (
    <>
      <div className="bb-game-hud">
        <span className="bb-game-hud-chip">⏱ {formatCountdown(remaining)}</span>
        <span className="bb-game-hud-chip">
          ⚽ {hits}/{attempts}
        </span>
      </div>

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

      <span className="bb-game-anchor" style={{ left: "50%", top: "78%" }} aria-hidden="true">
        ⚽
      </span>

      {feedback && (
        <span
          className="bb-game-hit-label"
          style={{ left: `${goalX * 100}%`, top: "35%", color: feedback === "goal" ? "#ffe14d" : "#ff8080" }}
        >
          {feedback === "goal" ? "GOAL! 🎉" : "Just wide!"}
        </span>
      )}

      <div className="bb-game-instruction">
        {demoMode
          ? "Move your mouse up quickly to kick toward the goal!"
          : "Raise your leg quickly to kick toward the goal!"}
      </div>
    </>
  );
}
