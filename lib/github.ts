import { Octokit } from 'octokit';

export interface RepoData {
  name: string;
  description: string;
  url: string;
  homepage: string;
  stars: number;
  forks: number;
  updatedAt: string;
  hasReadme: boolean;
  readmeContent?: string;
  hasLicense: boolean;
  licenseName?: string;
  language: string;
  topics: string[];
  isFork: boolean;
  defaultBranch: string;
}

export interface PRData {
  title: string;
  repo: string;
  state: 'merged' | 'closed' | 'open';
  createdAt: string;
  mergedAt: string;
  url: string;
  linesAdded: number;
  linesDeleted: number;
}

export interface UserAssessmentData {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  company: string;
  blog: string;
  location: string;
  email: string;
  twitterUsername: string;
  linkedinUrl: string;
  leetcodeUrl: string;
  instagramUrl: string;
  hireable: boolean;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string;
  totalStars: number;
  totalPrs: number;
  repos: RepoData[];
  pullRequests: PRData[];
  languages: Record<string, number>;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  data: UserAssessmentData;
  timestamp: number;
}

function getCachedProfile(username: string): UserAssessmentData | null {
  try {
    const raw = sessionStorage.getItem(`github-profile-${username}`);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(`github-profile-${username}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCachedProfile(username: string, data: UserAssessmentData): void {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    sessionStorage.setItem(`github-profile-${username}`, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable — skip caching
  }
}

async function checkRateLimit(octokit: Octokit): Promise<{ remaining: number; limit: number; reset: Date } | null> {
  try {
    const { data } = await octokit.rest.rateLimit.get();
    const core = data.resources.core;
    return { remaining: core.remaining, limit: core.limit, reset: new Date(core.reset * 1000) };
  } catch {
    return null; // rate limit endpoint itself can fail (e.g. on older GitHub Enterprise)
  }
}

function extractUrl(text: string, domain: string): string {
  const patterns = [
    new RegExp(`https?://(?:www\\.)?${domain}\\/[^\\s,)]+`, 'i'),
    new RegExp(`(?:https?://)?(?:www\\.)?${domain}\\/[^\\s,)]+`, 'i'),
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      let url = m[0];
      if (!url.startsWith('http')) url = `https://${url}`;
      return url;
    }
  }
  return '';
}

/** Friendly error suggesting a GitHub PAT when likely rate limited. */
function makeRateLimitError(originalMessage: string): Error {
  const msg = `GitHub API rate limit reached. ${originalMessage}\n\nTo analyze more profiles, add a GitHub Personal Access Token in Settings → GitHub PAT Token (5000 req/hr instead of 60).`;
  return new Error(msg);
}

export async function fetchGitHubProfile(username: string, token: string): Promise<UserAssessmentData> {
  // 0. Check sessionStorage cache first
  const cached = getCachedProfile(username);
  if (cached) {
    return cached;
  }

  const octokit = new Octokit({ auth: token || undefined });

  // 0b. Check remaining rate limit early (best-effort)
  const rateInfo = await checkRateLimit(octokit);
  const isLowOnRequests = rateInfo && rateInfo.remaining < 10;
  if (isLowOnRequests) {
    console.warn(
      `⚠ GitHub API rate limit: ${rateInfo!.remaining}/${rateInfo!.limit} remaining (resets at ${rateInfo!.reset.toLocaleTimeString()}). ` +
      'Consider adding a GitHub PAT token in Settings for higher limits.'
    );
  }

  // 1. Fetch user profile
  let user;
  try {
    const { data } = await octokit.rest.users.getByUsername({ username });
    user = data;
  } catch (err: any) {
    if (err.status === 403 || err.status === 429) throw makeRateLimitError(err.message);
    throw new Error(`Failed to fetch GitHub profile: ${err.message}`);
  }

  const bioText = [user.blog || '', user.bio || ''].join(' ');
  let linkedinUrl = extractUrl(bioText, 'linkedin\\.com');
  let leetcodeUrl = extractUrl(bioText, 'leetcode\\.com');
  let instagramUrl = extractUrl(bioText, 'instagram\\.com');

  if (!instagramUrl) {
    const igUsername = user.bio?.match(/ig:\s*@?([a-zA-Z0-9_.]+)/i);
    if (igUsername) instagramUrl = `https://instagram.com/${igUsername[1]}`;
  }

  // 2. Fetch repos
  let reposRaw;
  try {
    const { data } = await octokit.rest.repos.listForUser({
      username,
      per_page: 100,
      sort: 'pushed',
    });
    reposRaw = data;
  } catch (err: any) {
    if (err.status === 403 || err.status === 429) throw makeRateLimitError(err.message);
    throw new Error(`Failed to fetch repositories: ${err.message}`);
  }

  // Aggregate languages from repo list metadata (zero additional API calls)
  const languageCounts: Record<string, number> = {};
  const reposToAssess = reposRaw.filter(r => !r.fork).slice(0, 15);
  const totalStars = reposToAssess.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);

  // Fire every README request at once and wait only for the slowest one,
  // instead of serializing 15 full round trips. Same pattern as
  // collectDeploymentSignals in lib/ai.ts; 15 concurrent requests is nowhere
  // near the 5000/hr tokenized limit.
  const repos: RepoData[] = await Promise.all(
    reposToAssess.map(async (r) => {
      // Use r.language from the repo list — no extra API call needed
      if (r.language) {
        languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
      }

      let readmeContent = '';
      let hasReadme = false;
      try {
        if ((r.size ?? 0) > 0) {
          const { data: readmeRaw } = await octokit.rest.repos.getReadme({
            owner: username,
            repo: r.name,
            mediaType: {
              format: 'raw',
            },
          });
          hasReadme = true;
          readmeContent = (readmeRaw as unknown as string).substring(0, 1500);
        }
      } catch (e) {
        // no readme
      }

      return {
        name: r.name,
        description: r.description || '',
        url: r.html_url,
        homepage: r.homepage || '',
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        updatedAt: r.updated_at || '',
        hasReadme,
        readmeContent,
        hasLicense: !!r.license,
        licenseName: r.license?.name,
        language: r.language || 'Unknown',
        topics: r.topics || [],
        isFork: r.fork,
        defaultBranch: r.default_branch || 'main',
      };
    })
  );

  // 3. Fetch PRs (merged in other repos)
  const prs: PRData[] = [];
  let totalPrs = 0;
  try {
    const q = `is:pr author:${username} is:merged`;
    const { data: searchPrs } = await octokit.rest.search.issuesAndPullRequests({
      q,
      per_page: 15,
      sort: 'created',
      order: 'desc'
    });
    
    totalPrs = searchPrs.total_count || 0;

    for (const item of searchPrs.items) {
      const repoUrlParts = item.repository_url.split('/');
      const repoName = repoUrlParts.slice(-2).join('/');
      
      prs.push({
        title: item.title,
        repo: repoName,
        state: 'merged',
        createdAt: item.created_at,
        mergedAt: item.closed_at || '',
        url: item.html_url,
        linesAdded: 0, 
        linesDeleted: 0,
      });
    }
  } catch (e: any) {
    if (e.status === 403 || e.status === 429) {
      console.warn("PR search rate limited — continuing without PR data. Add a GitHub PAT for higher limits.");
    } else {
      console.warn("Failed to fetch PRs", e);
    }
  }

  const result: UserAssessmentData = {
    username: user.login,
    name: user.name || '',
    avatarUrl: user.avatar_url,
    bio: user.bio || '',
    company: user.company || '',
    blog: user.blog || '',
    location: user.location || '',
    email: user.email || '',
    twitterUsername: (user as any).twitter_username || '',
    linkedinUrl,
    leetcodeUrl,
    instagramUrl,
    hireable: user.hireable || false,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    createdAt: user.created_at,
    totalStars,
    totalPrs,
    repos,
    pullRequests: prs,
    languages: languageCounts,
  };

  // 4. Cache the result
  if (typeof sessionStorage !== 'undefined') {
    setCachedProfile(username, result);
  }

  return result;
}
