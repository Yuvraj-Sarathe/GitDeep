// GitDeep shared Gemini keys — unlocked by starring the repository.
// NOTE: the keys themselves live SERVER-ONLY (lib/sharedKeyServer.ts, env vars
// SHARED_GEMINI_KEY_1..3) and are proxied through /api/gemini-shared. This
// client module holds NO key material — only the soft star gate and a local
// session budget that gives instant "wait a minute" feedback. The real per-key
// budgets are enforced server-side; this is a good-faith gate, not security.

export const SHARED_REPO_OWNER = 'Yuvraj-Sarathe';
export const SHARED_REPO_NAME = 'GitDeep';
export const SHARED_REPO_URL = `https://github.com/${SHARED_REPO_OWNER}/${SHARED_REPO_NAME}`;

// Client-side budget for the Free Key pool as a whole (per browser session).
// The server enforces the authoritative per-key limits; this just prevents
// pointless round-trips when this visitor is already over the shared budget.
export const SHARED_KEY_RPM_LIMIT = 10;      // requests per minute
export const SHARED_KEY_RPD_LIMIT = 500;     // requests per day
export const SHARED_KEY_TPM_LIMIT = 250000;  // estimated tokens per minute

const USAGE_KEY = 'gitdeep-shared-key-usage';

interface UsageEntry {
  t: number;
  tokens: number;
}

function readUsage(): UsageEntry[] {
  try {
    const raw = sessionStorage.getItem(USAGE_KEY);
    return raw ? (JSON.parse(raw) as UsageEntry[]) : [];
  } catch {
    return [];
  }
}

function writeUsage(entries: UsageEntry[]): void {
  try {
    sessionStorage.setItem(USAGE_KEY, JSON.stringify(entries));
  } catch {
    // sessionStorage unavailable (private mode) — calls just aren't tracked.
  }
}

function dayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function getSharedKeyUsage(): { rpm: number; rpd: number; tpm: number } {
  const now = Date.now();
  const start = dayStart();
  const entries = readUsage().filter(e => e.t >= start);
  const lastMinute = entries.filter(e => now - e.t < 60_000);
  return {
    rpm: lastMinute.length,
    rpd: entries.length,
    tpm: lastMinute.reduce((sum, e) => sum + e.tokens, 0),
  };
}

export function checkSharedKeyLimit(estimatedTokens: number): { allowed: boolean; reason?: string } {
  const usage = getSharedKeyUsage();
  if (usage.rpm >= SHARED_KEY_RPM_LIMIT) {
    return {
      allowed: false,
      reason: `GitDeep shared key is over its ${SHARED_KEY_RPM_LIMIT}-request-per-minute budget. Wait a minute, or add your own key in Settings.`,
    };
  }
  if (usage.rpd >= SHARED_KEY_RPD_LIMIT) {
    return {
      allowed: false,
      reason: `GitDeep shared key has hit its ${SHARED_KEY_RPD_LIMIT}-request-per-day budget. Come back tomorrow, or add your own key in Settings.`,
    };
  }
  if (usage.tpm + estimatedTokens > SHARED_KEY_TPM_LIMIT) {
    return {
      allowed: false,
      reason: 'GitDeep shared key is over its ~250K-tokens-per-minute budget. Wait a minute, or add your own key in Settings.',
    };
  }
  return { allowed: true };
}

export function recordSharedKeyCall(estimatedTokens: number): void {
  const entries = readUsage();
  entries.push({ t: Date.now(), tokens: estimatedTokens });
  writeUsage(entries.filter(e => e.t >= dayStart())); // prune anything older than today
}