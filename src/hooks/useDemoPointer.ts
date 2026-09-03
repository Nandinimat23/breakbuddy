import { useEffect, useRef, useState } from "react";
import type { NormalizedPoint, TrackingFrame } from "../services/motionTracking/MotionTrackingService";

/**
 * Demo Mode input (PRD section 42): lets a recruiter/portfolio
 * visitor experience the game mechanics with mouse/touch instead of
 * a camera. Tracks pointer position within a container as a
 * normalized point and shapes it into a TrackingFrame that looks
 * just like what MotionTrackingService would produce, so games don't
 * need a separate demo code path.
 */
export function useDemoPointer(
  containerRef: React.RefObject<HTMLElement | null>,
  kind: "hand" | "pose" | "face" | "hand-face",
) {
  const [frame, setFrame] = useState<TrackingFrame>({ hands: [], ankles: [], nose: null, timestamp: 0 });
  const pressedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const toPoint = (clientX: number, clientY: number): NormalizedPoint => {
      const rect = el.getBoundingClientRect();
      return {
        x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
      };
    };

    const apply = (point: NormalizedPoint) => {
      const timestamp = performance.now();
      if (kind === "hand") setFrame({ hands: [point], ankles: [], nose: null, timestamp });
      else if (kind === "pose") setFrame({ hands: [], ankles: [point], nose: null, timestamp });
      else if (kind === "hand-face") {
        // The cursor always stands in for the carrying hand; holding
        // the mouse button down additionally stands in for tilting
        // the head back to drink.
        setFrame({ hands: [point], ankles: [], nose: pressedRef.current ? point : null, timestamp });
      } else setFrame({ hands: [], ankles: [], nose: pressedRef.current ? point : null, timestamp });
    };

    const onMove = (e: PointerEvent) => apply(toPoint(e.clientX, e.clientY));
    const onDown = (e: PointerEvent) => {
      pressedRef.current = true;
      apply(toPoint(e.clientX, e.clientY));
    };
    const onUp = () => {
      pressedRef.current = false;
      if (kind === "face" || kind === "hand-face") setFrame((f) => ({ ...f, nose: null }));
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [containerRef, kind]);

  return frame;
}
