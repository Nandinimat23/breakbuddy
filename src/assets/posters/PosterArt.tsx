/**
 * Poster artwork for the "Put Up the Poster" game.
 *
 * These are real hand-drawn SVG illustrations (not emoji) so the
 * player picks up and places an actual picture, matching the framed
 * flower-poster look from the product mockups. Each design is a
 * self-contained component so the game can render "the poster the
 * player is currently carrying" as a real visual, not a placeholder.
 */

import type { ReactNode } from "react";

export type PosterDesignId = "pink-flower" | "sunflower" | "purple-flowers" | "tulips";

export interface PosterDesign {
  id: PosterDesignId;
  name: string;
}

export const POSTER_DESIGNS: PosterDesign[] = [
  { id: "pink-flower", name: "Pink Flower" },
  { id: "sunflower", name: "Sunflower" },
  { id: "purple-flowers", name: "Purple Flowers" },
  { id: "tulips", name: "Tulips" },
];

function PosterFrame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" role="img">
      <rect x="4" y="4" width="192" height="252" rx="14" fill="#fdf8ef" stroke="#e7dcc4" strokeWidth="4" />
      {children}
    </svg>
  );
}

function PinkFlower() {
  return (
    <PosterFrame>
      <g transform="translate(100,150)">
        <rect x="-4" y="10" width="8" height="70" rx="4" fill="#4caf7d" />
        <path d="M -4 55 Q -34 45 -30 20 Q -6 24 -4 55 Z" fill="#5fbf8f" />
        <path d="M 4 65 Q 34 58 32 34 Q 8 36 4 65 Z" fill="#4caf7d" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-30"
            rx="16"
            ry="26"
            fill="#ff86b3"
            transform={`rotate(${deg}) translate(0,0)`}
          />
        ))}
        <circle cx="0" cy="0" r="15" fill="#ffce54" />
      </g>
    </PosterFrame>
  );
}

function Sunflower() {
  return (
    <PosterFrame>
      <g transform="translate(100,155)">
        <rect x="-4" y="15" width="8" height="65" rx="4" fill="#4a9d5f" />
        <path d="M -4 60 Q -32 52 -28 30 Q -6 32 -4 60 Z" fill="#5cb271" />
        {Array.from({ length: 12 }).map((_, i) => {
          const deg = i * 30;
          return (
            <ellipse
              key={deg}
              cx="0"
              cy="-34"
              rx="12"
              ry="30"
              fill="#ffc93c"
              transform={`rotate(${deg})`}
            />
          );
        })}
        <circle cx="0" cy="0" r="22" fill="#8a5a2b" />
        <circle cx="-6" cy="-4" r="2" fill="#5c3a1a" />
        <circle cx="4" cy="2" r="2" fill="#5c3a1a" />
        <circle cx="-2" cy="8" r="2" fill="#5c3a1a" />
        <circle cx="8" cy="-6" r="2" fill="#5c3a1a" />
      </g>
    </PosterFrame>
  );
}

function PurpleFlowers() {
  const cluster = (x: number, scale: number) => (
    <g transform={`translate(${x},0) scale(${scale})`}>
      <rect x="-3" y="-6" width="6" height="85" rx="3" fill="#4caf7d" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="0" cy="-15" rx="10" ry="15" fill="#a78bfa" transform={`rotate(${deg})`} />
      ))}
      <circle cx="0" cy="0" r="6.5" fill="#7c5cff" />
    </g>
  );
  return (
    <PosterFrame>
      <g transform="translate(100,190)">
        {cluster(-34, 0.9)}
        {cluster(0, 1.1)}
        {cluster(34, 0.9)}
      </g>
    </PosterFrame>
  );
}

function Tulips() {
  const petal = (rotate: number, color: string) => (
    <path
      d="M0,0 C -15,-6 -15,-32 0,-42 C 15,-32 15,-6 0,0 Z"
      fill={color}
      transform={`rotate(${rotate})`}
    />
  );
  const tulip = (x: number, stemHeight: number, color: string) => (
    <g transform={`translate(${x},0)`}>
      <rect x="-3" y="-18" width="6" height={stemHeight} rx="3" fill="#4a9d5f" />
      <path d="M -3 -10 Q -20 -14 -18 6 Q -4 4 -3 -10 Z" fill="#5cb271" />
      <g transform="translate(0,-18)">
        {petal(-20, color)}
        {petal(0, color)}
        {petal(20, color)}
      </g>
    </g>
  );
  return (
    <PosterFrame>
      <g transform="translate(100,235)">
        {tulip(-32, 90, "#e0483e")}
        {tulip(0, 115, "#d5372f")}
        {tulip(32, 90, "#e0483e")}
      </g>
    </PosterFrame>
  );
}

export function PosterArt({ design }: { design: PosterDesignId }) {
  switch (design) {
    case "pink-flower":
      return <PinkFlower />;
    case "sunflower":
      return <Sunflower />;
    case "purple-flowers":
      return <PurpleFlowers />;
    case "tulips":
      return <Tulips />;
    default:
      return <PinkFlower />;
  }
}
