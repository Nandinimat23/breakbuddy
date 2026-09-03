import { useEffect, useRef, useState } from "react";
import type { GameScreenProps } from "../GameScreenProps";
import { firstPoint } from "../GameScreenProps";
import { useGameCountdown } from "../../hooks/useGameCountdown";
import { usePetReaction } from "../../hooks/usePetReaction";
import { formatCountdown } from "../../utils/time";
import { GameHUD, PetCorner } from "../../components/GameHUD/GameHUD";
import { JuiceGlass } from "../../assets/gameArt/GameArt";
import "../games-common.css";
import "./DrinkUpGame.css";

/**
 * "Looking up" is approximated as the nose landmark sitting in the
 * top portion of the frame — a simplified stand-in for true head-pitch
 * estimation, in line with PRD section 47 ("build a functional
 * simplified version, don't pretend it's more precise than it is").
 */
const LOOK_UP_Y_THRESHOLD = 0.42;
const PICKUP_SPOT = { x: 0.5, y: 0.84 };
const GRAB_RADIUS = 0.17;

/**
 * Game 2 — Drink Up (PRD section 13). Hand + face tracking game:
 * reach for the glass to pick it up, carry it toward your mouth, then
 * hold a gentle "look up" position to drink it. Never requires
 * holding an uncomfortable position — progress simply pauses (never
 * reverses) when you look back down or let go.
 */
export function DrinkUpGame({ frame, demoMode, durationSeconds, petId, onComplete }: GameScreenProps) {
  const [level, setLevel] = useState(100);
  const [held, setHeld] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const lastTick = useRef(Date.now());
  const finishedRef = useRef(false);
  const milestoneRef = useRef(new Set<number>());
  const lastHandPos = useRef(PICKUP_SPOT);
  const { reaction, react } = usePetReaction();
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
    if (!held) react("Pick up your drink! 🥤");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hand = firstPoint(frame.hands);
    if (hand) lastHandPos.current = hand;

    if (!held) {
      if (hand && Math.hypot(hand.x - PICKUP_SPOT.x, hand.y - PICKUP_SPOT.y) <= GRAB_RADIUS) {
        setHeld(true);
        react("Now tilt back and drink!");
      }
      return;
    }

    const isUp = frame.nose !== null && frame.nose.y <= LOOK_UP_Y_THRESHOLD;
    setLookingUp(isUp);
    const now = Date.now();
    const dt = (now - lastTick.current) / 1000;
    lastTick.current = now;
    if (isUp) {
      setLevel((l) => Math.max(0, l - drainPerSecond * dt));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, held]);

  useEffect(() => {
    const done = Math.round(100 - level);
    if (done >= 50 && !milestoneRef.current.has(50)) {
      milestoneRef.current.add(50);
      react("Almost there!");
    }
    if (level <= 0) {
      react("Yay! You did it! 🎉");
      finish(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const glassPos = held ? lastHandPos.current : PICKUP_SPOT;

  return (
    <>
      <GameHUD
        timeLabel={formatCountdown(remaining)}
        lowTime={remaining <= 5}
        scoreValue={`${Math.round(100 - level)}%`}
        scoreLabel="DONE"
      />

      <div
        className={`bb-drinkup-glass ${held ? "is-held" : "is-waiting"} ${lookingUp ? "is-drinking" : ""}`}
        style={{ left: `${glassPos.x * 100}%`, top: `${glassPos.y * 100}%` }}
        aria-hidden="true"
      >
        <JuiceGlass level={level} />
      </div>

      {!held && <div className="bb-drinkup-pickup-ring" style={{ left: `${PICKUP_SPOT.x * 100}%`, top: `${PICKUP_SPOT.y * 100}%` }} aria-hidden="true" />}

      <PetCorner petId={petId} reaction={reaction} />

      <div className="bb-game-instruction">
        {!held
          ? demoMode
            ? "Move your mouse to the glass to pick it up"
            : "Reach toward your drink to pick it up!"
          : demoMode
            ? "Press and hold your mouse button to tilt back and drink"
            : lookingUp
              ? "Nice! Keep looking up gently…"
              : "Bring it to your mouth and tilt your head back!"}
      </div>
    </>
  );
}
