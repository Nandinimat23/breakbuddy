/**
 * Thin wrapper around the browser's native Notification API.
 *
 * Why this exists: the in-app BreakPrompt (pet bubble in the corner)
 * only helps if someone is actually looking at the BreakBuddy tab.
 * Most of the time they're working in a completely different window —
 * so when a break becomes due while the tab is hidden/unfocused, we
 * also fire a real OS-level notification. Clicking it focuses the tab
 * and jumps straight into a game.
 *
 * No service worker is used — a plain `Notification` still shows as a
 * native OS notification as long as the browser (with this tab open
 * somewhere) is running, which is all BreakBuddy needs.
 */

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

/** Must be called from a user gesture (e.g. a button click) in most browsers. */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  return Notification.requestPermission();
}

/**
 * Fires a native notification if permission has been granted. No-ops
 * silently otherwise (unsupported browser, never asked, or denied) —
 * the in-app prompt is always the fallback.
 */
export function showBreakNotification(title: string, body: string, icon: string, onOpen: () => void): void {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;
  const notification = new Notification(title, { body, icon, tag: "breakbuddy-break" });
  notification.onclick = () => {
    window.focus();
    onOpen();
    notification.close();
  };
}
