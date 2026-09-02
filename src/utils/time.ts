import type { WorkingHours } from "../types";

/** Parse "HH:mm" into minutes since midnight. */
export function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function isWithinWorkingHours(hours: WorkingHours, date: Date = new Date()): boolean {
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const start = parseTimeToMinutes(hours.start);
  const end = parseTimeToMinutes(hours.end);
  if (start === end) return true; // degenerate config: treat as "always on"
  if (start < end) return nowMinutes >= start && nowMinutes <= end;
  // Overnight range (e.g. 22:00 - 06:00)
  return nowMinutes >= start || nowMinutes <= end;
}

/** Format milliseconds as "Xh Ym" / "Ym" for the "next break in..." UI. */
export function formatDuration(ms: number): string {
  if (ms <= 0) return "any moment now";
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

/** Format seconds as "00:SS" / "MM:SS" for in-game countdowns. */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

export function to12Hour(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}
