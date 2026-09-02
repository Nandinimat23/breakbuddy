export type CameraErrorReason = "denied" | "unavailable" | "insecure-context" | "unsupported";

export class CameraError extends Error {
  reason: CameraErrorReason;
  constructor(reason: CameraErrorReason, message: string) {
    super(message);
    this.reason = reason;
  }
}

/**
 * Thin wrapper around getUserMedia.
 *
 * BreakBuddy never uploads or stores camera frames (PRD section 17/40):
 * the MediaStream produced here is only ever attached to a local
 * <video> element and read frame-by-frame in memory by
 * MotionTrackingService. Nothing in this file (or anywhere else in
 * the app) sends video data over the network.
 */
export class CameraService {
  private stream: MediaStream | null = null;

  static isSupported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function"
    );
  }

  static isSecureContext(): boolean {
    return typeof window !== "undefined" && window.isSecureContext;
  }

  async requestCamera(): Promise<MediaStream> {
    if (!CameraService.isSecureContext()) {
      throw new CameraError(
        "insecure-context",
        "Camera access requires HTTPS (or localhost during development).",
      );
    }
    if (!CameraService.isSupported()) {
      throw new CameraError("unsupported", "Your browser may not support this feature.");
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      return this.stream;
    } catch (err) {
      const domErr = err as DOMException;
      if (domErr?.name === "NotAllowedError" || domErr?.name === "PermissionDeniedError") {
        throw new CameraError("denied", "Camera access is required for this game.");
      }
      throw new CameraError("unavailable", "We couldn't access your camera.");
    }
  }

  stop(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  getStream(): MediaStream | null {
    return this.stream;
  }
}
