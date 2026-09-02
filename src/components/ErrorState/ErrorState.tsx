import { Button } from "../Button/Button";
import "./ErrorState.css";

export interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  onDemoMode?: () => void;
}

/** Shared error UI for camera/tracking failures (PRD section 18 & 41). */
export function ErrorState({ title, message, onRetry, onDemoMode }: ErrorStateProps) {
  return (
    <div className="bb-error-state card" role="alert">
      <span className="bb-error-state-icon" aria-hidden="true">
        📷
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="bb-error-state-actions">
        {onRetry && <Button onClick={onRetry}>Try Again</Button>}
        {onDemoMode && (
          <Button variant="secondary" onClick={onDemoMode}>
            Play Demo
          </Button>
        )}
      </div>
    </div>
  );
}
