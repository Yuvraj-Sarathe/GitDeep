// Server-only star verification for the GitDeep Free Key.
//
// Since GitHub's June 2026 access restrictions, star data is only available to
// a repository's own admins/collaborators — the old unauthenticated
// "GET /users/{username}/starred/{owner}/{repo}" check now returns 404 for
// everyone, starrers included. The reliable way to prove someone starred is to
// list the repo's stargazers using the owner's token and look the username up.
// The owner token lives in GITHUB_STAR_CHECK_TOKEN (server-only) and never
// reaches the client. DO NOT import this file from any client component.

const SHARED_REPO_OWNER = 'Yuvraj-Sarathe';
const SHARED_REPO_NAME = 'GitDeep';

export interface StarCheckResult {
  starred: boolean;
  message?: string;
}

// The owner can never be listed as a starrer of their own repo, but the Free
// Key is theirs anyway — always exempt.
function isOwner(username: string): boolean {
  return username.trim().toLowerCase() === SHARED_REPO_OWNER.toLowerCase();
}

// Fetches all stargazers (paginated) with the owner's token and reports
// whether the username appears. Failures return a clear message instead of
// guessing, so the callback page can explain rather than deny silently.
export async function checkStarrer(username: string): Promise<StarCheckResult> {
  if (!username || !username.trim()) {
    return { starred: false, message: 'No GitHub username was returned by the OAuth flow.' };
  }
  if (isOwner(username)) {
    return { starred: true };
  }

  const token = process.env.GITHUB_STAR_CHECK_TOKEN;
  if (!token) {
    return {
      starred: false,
      message: 'Star verification is not configured on this deployment — the owner needs to set GITHUB_STAR_CHECK_TOKEN.',
    };
  }

  const base = `https://api.github.com/repos/${SHARED_REPO_OWNER}/${SHARED_REPO_NAME}/stargazers?per_page=100`;
  let page = 1;
  for (let i = 0; i < 10; i++) {
    let res: Response;
    try {
      res = await fetch(`${base}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
        cache: 'no-store',
      });
    } catch {
      return { starred: false, message: 'Could not reach GitHub to verify the star — check your connection and try again.' };
    }

    if (res.status === 401 || res.status === 403) {
      return {
        starred: false,
        message: 'The star-check token is invalid or lacks permission — the owner needs to fix GITHUB_STAR_CHECK_TOKEN.',
      };
    }
    if (!res.ok) {
      return { starred: false, message: `Star verification failed (${res.status}) — try again in a moment.` };
    }

    const users: { login?: string }[] = await res.json();
    if (users.some(u => u.login && u.login.toLowerCase() === username.trim().toLowerCase())) {
      return { starred: true };
    }
    if (users.length < 100) break; // last page
    const link = res.headers.get('link') || '';
    if (!/rel="?next"?/.test(link)) break; // no further pages
    page += 1;
  }
  return { starred: false };
}