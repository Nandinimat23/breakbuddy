import "./ProgressBar.css";

export interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  color?: string;
}

export function ProgressBar({ value, label, color }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="bb-progress" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="bb-progress-track">
        <div
          className="bb-progress-fill"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
      {label && <span className="bb-progress-label">{label}</span>}
    </div>
  );
}
