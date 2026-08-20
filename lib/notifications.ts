"use client";

const NOTIFICATION_ICON = '/icon.png';

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Ask the browser for notification permission. Returns true once granted.
 * Safe to call anywhere — returns false when unsupported or already denied,
 * and calling it from a click handler makes the permission prompt show
 * reliably. Never throws.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

/**
 * Show an OS-level notification. Only fires when the browser permission is
 * granted AND the tab is in the background — we never ping someone who is
 * literally watching the screen. Clicking the notification returns the user
 * to the tab. Never throws, so a notification problem can't break the
 * assessment flow.
 */
export function notifyAnalysisComplete(title: string, body: string): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  if (!document.hidden) return;
  try {
    const notification = new Notification(title, { body, icon: NOTIFICATION_ICON, tag: 'gitdeep-analysis' });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    // Auto-dismiss so finished analyses don't stack up on screen.
    setTimeout(() => notification.close(), 10000);
  } catch {
    // Some environments throw while constructing a Notification — ignore.
  }
}