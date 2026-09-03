/**
 * Hand-drawn SVG illustrations used inside the camera-based games, in
 * place of plain emoji. Each is a small self-contained component so
 * games can size/position/animate them like any other element.
 */

export function SoccerBall({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Soccer ball">
      <circle cx="50" cy="50" r="47" fill="#f7f7f7" stroke="#cfcfcf" strokeWidth="2" />
      <polygon points="50,32 61,40 57,53 43,53 39,40" fill="#232323" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <polygon
          key={deg}
          points="50,10 58,18 55,29 45,29 42,18"
          fill="#232323"
          opacity="0.9"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="47" fill="none" stroke="#232323" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export function PunchingBag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 240" className={className} role="img" aria-label="Punching bag">
      {/* ceiling mount */}
      <rect x="45" y="0" width="30" height="10" rx="3" fill="#4a4a52" />
      {/* chain */}
      <line x1="60" y1="10" x2="60" y2="46" stroke="#8b8b93" strokeWidth="4" />
      <circle cx="60" cy="18" r="4" fill="none" stroke="#8b8b93" strokeWidth="3" />
      <circle cx="60" cy="30" r="4" fill="none" stroke="#8b8b93" strokeWidth="3" />
      <circle cx="60" cy="42" r="4" fill="none" stroke="#8b8b93" strokeWidth="3" />
      {/* bag top cap */}
      <path d="M22 46 Q60 30 98 46 L98 62 Q60 50 22 62 Z" fill="#2b2b2f" />
      {/* bag body */}
      <path
        d="M22 58 Q18 140 30 210 Q60 226 90 210 Q102 140 98 58 Q60 46 22 58 Z"
        fill="#9c2b2b"
      />
      <path
        d="M22 58 Q18 140 30 210 Q60 226 90 210 Q102 140 98 58"
        fill="none"
        stroke="#7a1f1f"
        strokeWidth="3"
      />
      {/* straps */}
      <path d="M20 92 Q60 104 100 92" fill="none" stroke="#2b2b2f" strokeWidth="6" opacity="0.8" />
      <path d="M20 150 Q60 162 100 150" fill="none" stroke="#2b2b2f" strokeWidth="6" opacity="0.8" />
      {/* bottom cap */}
      <ellipse cx="60" cy="212" rx="30" ry="10" fill="#2b2b2f" />
      {/* highlight */}
      <path d="M30 70 Q26 130 35 190" fill="none" stroke="#c85a5a" strokeWidth="5" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
}

export interface JuiceGlassProps {
  /** 0 (empty) to 100 (full). */
  level: number;
  className?: string;
  color?: string;
}

export function JuiceGlass({ level, className, color = "#ffb03c" }: JuiceGlassProps) {
  const clamped = Math.max(0, Math.min(100, level));
  // Glass interior spans roughly y=18 (top) to y=118 (bottom) in the 140-tall viewBox.
  const interiorTop = 18;
  const interiorBottom = 118;
  const fillTop = interiorBottom - (clamped / 100) * (interiorBottom - interiorTop);

  return (
    <svg viewBox="0 0 100 140" className={className} role="img" aria-label="Glass of juice">
      <defs>
        <clipPath id="glassClip">
          <path d="M28 18 L72 18 L66 118 Q50 124 34 118 Z" />
        </clipPath>
      </defs>
      {/* liquid */}
      <g clipPath="url(#glassClip)">
        <rect x="20" y={fillTop} width="60" height={interiorBottom - fillTop + 10} fill={color} />
        <rect x="20" y={fillTop} width="60" height="4" fill="#fff" opacity="0.35" />
      </g>
      {/* glass outline */}
      <path
        d="M28 18 L72 18 L66 118 Q50 124 34 118 Z"
        fill="none"
        stroke="#d9d9e3"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* glass shine */}
      <line x1="34" y1="26" x2="30" y2="104" stroke="#fff" strokeWidth="3" opacity="0.5" strokeLinecap="round" />
      {/* straw */}
      <line x1="62" y1="4" x2="48" y2="60" stroke="#ff6fa5" strokeWidth="6" strokeLinecap="round" />
      <line x1="62" y1="4" x2="48" y2="60" stroke="#ffe1ee" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
