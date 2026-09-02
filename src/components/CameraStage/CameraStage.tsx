import type { ReactNode } from "react";
import "./CameraStage.css";

export interface CameraStageProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  active: boolean;
  demoMode: boolean;
  children?: ReactNode;
}

/**
 * The camera/game frame shared by every camera-based game: shows the
 * mirrored webcam feed with an SVG overlay layer on top for virtual
 * game objects (targets, ball, poster, drink). In demo mode it shows
 * a neutral placeholder stage instead of a live feed.
 */
export function CameraStage({ videoRef, active, demoMode, children }: CameraStageProps) {
  return (
    <div className="bb-camera-stage">
      {!demoMode ? (
        <video
          ref={videoRef}
          className="bb-camera-video"
          autoPlay
          playsInline
          muted
          aria-label="Live camera preview used for movement detection"
        />
      ) : (
        <div className="bb-camera-demo-bg" aria-hidden="true" />
      )}
      {demoMode && <span className="bb-camera-demo-badge">Demo Mode — Camera not required</span>}
      <div className="bb-camera-overlay">{active && children}</div>
    </div>
  );
}
