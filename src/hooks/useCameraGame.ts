import { useEffect, useRef, useState } from "react";
import { CameraError, CameraService } from "../services/camera/CameraService";
import { MotionTrackingService, type TrackingFrame } from "../services/motionTracking/MotionTrackingService";
import type { TrackingType } from "../types";
import { track } from "../utils/analytics";
import { setCameraPermissionGranted } from "../utils/storage";

export type CameraGameStatus =
  | "idle"
  | "requesting-permission"
  | "loading-model"
  | "ready"
  | "error"
  | "demo";

/**
 * Manages the full camera + MediaPipe lifecycle for a single game
 * screen: request permission -> attach stream -> load the right
 * MediaPipe model -> stream normalized landmark frames -> tear
 * everything down on unmount.
 *
 * Camera access is only requested when this hook mounts (i.e. once
 * the player has actually opened a camera-based game), and the
 * stream + models are always released on cleanup — nothing is kept
 * running once the game screen closes (PRD section 17).
 */
export function useCameraGame(trackingType: TrackingType) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<CameraService | null>(null);
  const trackingRef = useRef<MotionTrackingService | null>(null);
  const [status, setStatus] = useState<CameraGameStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [frame, setFrame] = useState<TrackingFrame>({ hands: [], ankles: [], nose: null, timestamp: 0 });

  const cleanup = () => {
    trackingRef.current?.dispose();
    trackingRef.current = null;
    cameraRef.current?.stop();
    cameraRef.current = null;
  };

  const start = async () => {
    setStatus("requesting-permission");
    setErrorMessage("");
    const camera = new CameraService();
    cameraRef.current = camera;
    try {
      const stream = await camera.requestCamera();
      track("camera_permission_granted");
      setCameraPermissionGranted();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus("loading-model");
      const tracking = new MotionTrackingService();
      trackingRef.current = tracking;
      await tracking.init(trackingType);
      tracking.onFrame(setFrame);
      if (videoRef.current) tracking.start(videoRef.current);

      setStatus("ready");
    } catch (err) {
      if (err instanceof CameraError && err.reason === "denied") {
        track("camera_permission_denied");
      }
      const message = err instanceof Error ? err.message : "We couldn't access your camera.";
      setErrorMessage(message);
      setStatus("error");
      cleanup();
    }
  };

  const enterDemoMode = () => {
    cleanup();
    setStatus("demo");
  };

  /** Explicitly release the camera/tracking as soon as a game finishes,
   * rather than waiting for this component to unmount (PRD section 17:
   * "Camera should turn off when the game ends"). */
  const stopCamera = () => {
    cleanup();
    setStatus("idle");
  };

  useEffect(() => cleanup, []);

  return { videoRef, status, errorMessage, frame, start, enterDemoMode, stopCamera };
}
