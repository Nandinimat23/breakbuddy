import type { AnalyticsEvent, AnalyticsEventName } from "../types";

/**
 * Minimal local event log.
 *
 * V1 intentionally does not ship a real analytics integration (see
 * PRD section 43). This just gives the rest of the app a single,
 * consistent call site (`track(...)`) so that plugging in a real
 * analytics provider later is a one-file change.
 */

const MAX_EVENTS = 200;

function readEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem("breakbuddy:events");
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

export function track(name: AnalyticsEventName, payload?: Record<string, unknown>): void {
  const event: AnalyticsEvent = { name, timestamp: new Date().toISOString(), payload };
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event.name, payload ?? "");
  }
  try {
    const events = readEvents();
    events.push(event);
    while (events.length > MAX_EVENTS) events.shift();
    localStorage.setItem("breakbuddy:events", JSON.stringify(events));
  } catch {
    // Analytics should never break the app.
  }
}

export function getRecentEvents(): AnalyticsEvent[] {
  return readEvents();
}
