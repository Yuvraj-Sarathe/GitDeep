// GitHub OAuth helpers for the GitDeep Free Key (star-to-unlock) flow.
// Identity comes from the OAuth token — never from a typed username — so
// nobody can claim a starrer's account. The client secret stays server-side
// in the /api/github-oauth/exchange route; this module only handles the
// browser-side navigation and the short-lived CSRF/return context.

const STATE_KEY = 'gitdeep-star-state';
const RETURN_KEY = 'gitdeep-star-return';
const RUN_KEY = 'gitdeep-star-run';

export function getOAuthClientId(): string {
  return process.env.NEXT_PUBLIC_GITHUB_OAUTH_CLIENT_ID || '';
}

export function isOAuthConfigured(): boolean {
  return !!getOAuthClientId();
}

function makeState(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export interface PendingStarReturn {
  path: string;
  action?: 'run' | 'none';
}

// Kick off the OAuth dance. Returns the GitHub authorize URL, or null when the
// deployment has no OAuth app configured (the caller shows a fallback message).
export function startGitHubAuth(pending: PendingStarReturn): string | null {
  const clientId = getOAuthClientId();
  if (!clientId) return null;
  const state = makeState();
  // Must match the callback URL registered on the GitHub OAuth App exactly.
  // The redirect route at /api/auth/callback/github forwards to the real
  // callback page at /auth/callback, preserving the code/state params.
  const redirectUri = `${window.location.origin}/api/auth/callback/github`;
  try {
    sessionStorage.setItem(STATE_KEY, state);
    sessionStorage.setItem(RETURN_KEY, JSON.stringify(pending));
  } catch {
    // Private/blocked sessionStorage — OAuth still works, we just lose the
    // return context and fall back to the caller's default path.
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user',
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

// CSRF check: the callback only proceeds if the state echoes back exactly.
export function validateStarState(state: string | null): boolean {
  if (!state) return false;
  let saved: string | null = null;
  try {
    saved = sessionStorage.getItem(STATE_KEY);
  } catch {
    return false;
  }
  return !!saved && saved === state;
}

export function getPendingStarReturn(): PendingStarReturn | null {
  try {
    const raw = sessionStorage.getItem(RETURN_KEY);
    return raw ? (JSON.parse(raw) as PendingStarReturn) : null;
  } catch {
    return null;
  }
}

export function clearStarPending(): void {
  try {
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(RETURN_KEY);
  } catch {}
}

// When the pending action was 'run' (assessment deep link with no key), the
// callback sets a flag so the assessment page knows to kick off the run on
// mount instead of loading from cache.
export function setStarRunPending(): void {
  try {
    sessionStorage.setItem(RUN_KEY, '1');
  } catch {}
}

export function takeStarRunPending(): boolean {
  try {
    if (sessionStorage.getItem(RUN_KEY) === '1') {
      sessionStorage.removeItem(RUN_KEY);
      return true;
    }
  } catch {}
  return false;
}