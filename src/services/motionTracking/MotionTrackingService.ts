import {
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
  FaceLandmarker,
  type HandLandmarkerResult,
  type PoseLandmarkerResult,
  type FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";
import type { TrackingType } from "../../types";

/**
 * Normalized point in [0, 1] video space, (0,0) = top-left.
 * Games work entirely in this normalized space so they don't care
 * about the actual camera resolution.
 */
export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface TrackingFrame {
  /** One point per detected hand (wrist landmark), mirrored to feel natural. */
  hands: NormalizedPoint[];
  /** Ankle points (left/right), used by Kick the Ball. */
  ankles: NormalizedPoint[];
  /** Nose / head point, used by Drink Up. */
  nose: NormalizedPoint | null;
  timestamp: number;
}

type FrameListener = (frame: TrackingFrame) => void;

const CDN_WASM =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";

const HAND_MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const POSE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

/**
 * Wraps MediaPipe's tasks-vision models behind one small, game-agnostic
 * interface: `TrackingFrame`.
 *
 * This is the seam described in PRD section 47:
 *
 *   MotionTrackingService -> hand/ankle/nose coordinates -> Game Engine
 *   -> collision detection -> score
 *
 * Games never touch MediaPipe directly. If a specific model fails to
 * load (flaky network, unsupported browser, no WebGL, etc.) this
 * service surfaces that as a normal rejected promise so the calling
 * screen can fall back to Demo Mode instead of crashing.
 *
 * All inference runs locally in the browser via WebAssembly — no
 * video frame ever leaves the device.
 */
export class MotionTrackingService {
  private handLandmarker: HandLandmarker | null = null;
  private poseLandmarker: PoseLandmarker | null = null;
  private faceLandmarker: FaceLandmarker | null = null;
  private rafHandle: number | null = null;
  private listeners = new Set<FrameListener>();
  private video: HTMLVideoElement | null = null;
  private lastVideoTime = -1;

  async init(kind: TrackingType): Promise<void> {
    if (kind === "none") return;
    const vision = await FilesetResolver.forVisionTasks(CDN_WASM);

    const needsHand = kind === "hand" || kind === "hand-face";
    const needsPose = kind === "pose";
    const needsFace = kind === "face" || kind === "hand-face";

    if (needsHand && !this.handLandmarker) {
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: HAND_MODEL, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 1,
      });
    }
    if (needsPose && !this.poseLandmarker) {
      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: POSE_MODEL, delegate: "GPU" },
        runningMode: "VIDEO",
        numPoses: 1,
      });
    }
    if (needsFace && !this.faceLandmarker) {
      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: FACE_MODEL, delegate: "GPU" },
        runningMode: "VIDEO",
        numFaces: 1,
      });
    }
  }

  start(video: HTMLVideoElement): void {
    this.video = video;
    const loop = () => {
      this.rafHandle = requestAnimationFrame(loop);
      this.processFrame();
    };
    this.rafHandle = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.rafHandle) cancelAnimationFrame(this.rafHandle);
    this.rafHandle = null;
    this.video = null;
  }

  onFrame(listener: FrameListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispose(): void {
    this.stop();
    this.handLandmarker?.close();
    this.poseLandmarker?.close();
    this.faceLandmarker?.close();
    this.handLandmarker = null;
    this.poseLandmarker = null;
    this.faceLandmarker = null;
    this.listeners.clear();
  }

  private processFrame(): void {
    const video = this.video;
    if (!video || video.readyState < 2) return;
    if (video.currentTime === this.lastVideoTime) return;
    this.lastVideoTime = video.currentTime;

    const now = performance.now();
    const frame: TrackingFrame = { hands: [], ankles: [], nose: null, timestamp: now };

    if (this.handLandmarker) {
      const result: HandLandmarkerResult = this.handLandmarker.detectForVideo(video, now);
      frame.hands = (result.landmarks ?? []).map((lm) => mirrorX(lm[9])); // middle-finger MCP ~ palm center
    }

    if (this.poseLandmarker) {
      const result: PoseLandmarkerResult = this.poseLandmarker.detectForVideo(video, now);
      const pose = result.landmarks?.[0];
      if (pose) {
        // Ankles (27/28) are frequently out of frame on a typical
        // laptop webcam — MediaPipe still returns a landmark for them,
        // but it's an unreliable extrapolated guess with a low
        // `visibility` score once the actual body part is off-screen.
        // Knees (25/26) are visible in far more real-world framings and
        // still capture a "leg raised to kick" motion well, so prefer
        // whichever pair is actually visible, ankles first.
        const isVisible = (p: { visibility: number } | undefined) => p && p.visibility > 0.5;
        const ankles = [pose[27], pose[28]].filter(isVisible);
        const knees = [pose[25], pose[26]].filter(isVisible);
        const legs = ankles.length ? ankles : knees;
        frame.ankles = legs.map(mirrorX);
      }
    }

    if (this.faceLandmarker) {
      const result: FaceLandmarkerResult = this.faceLandmarker.detectForVideo(video, now);
      const face = result.faceLandmarks?.[0];
      if (face) {
        frame.nose = mirrorX(face[1]); // landmark 1 ~= nose tip
      }
    }

    this.listeners.forEach((fn) => fn(frame));
  }
}

/** Mirror x so movement feels like a mirror (raise your right hand -> moves right on screen). */
function mirrorX(point: { x: number; y: number }): NormalizedPoint {
  return { x: 1 - point.x, y: point.y };
}
