import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns/promises';

/**
 * Server-side webfetch proxy for deployment checks.
 *
 * The assessment flow wants to know whether a developer's project URLs
 * actually resolve to live sites. Browsers cannot fetch arbitrary URLs
 * (CORS), so the client POSTs the target URL here and we fetch it server-side.
 *
 * Because the URL is user-supplied, this route is hardened against SSRF:
 *  - http/https schemes only
 *  - literal private/loopback/link-local IPv4 and ALL IPv6 literals rejected
 *  - DNS is resolved and every A/AAAA record is vetted (rejects hostnames
 *    that resolve to private ranges, e.g. metadata services)
 *  - redirects are followed manually (max 3) and each hop is re-vetted
 *  - 10s timeout, 200KB response cap
 *
 * Always returns 200 with a structured result; a "dead site" is DATA here
 * (the whole point of the check), not a server error.
 */
export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 10_000;
const MAX_BYTES = 200_000;

function isPrivateIpv4(ip: string): boolean {
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    (a === 169 && b === 254) ||           // link-local incl. AWS metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224                              // multicast + reserved
  );
}

type HostVerdict = 'ok' | 'blocked' | 'dns-failed';

/** Rejects private/loopback hosts, both literal and via DNS resolution. */
async function hostVerdict(hostname: string): Promise<HostVerdict> {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return 'blocked';
  if (h.includes(':')) return 'blocked'; // IPv6 literals: blocked outright (too many private variants)
  if (isPrivateIpv4(h)) return 'blocked';
  try {
    const addrs = await dns.lookup(h, { all: true, verbatim: true });
    for (const a of addrs) {
      const ip = a.address;
      if (ip.includes(':')) return 'blocked';
      if (isPrivateIpv4(ip)) return 'blocked';
    }
  } catch {
    return 'dns-failed';
  }
  return 'ok';
}

async function readCapped(res: Response): Promise<string> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (total < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        total += value.length;
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    buf.set(c, off);
    off += c.length;
  }
  return new TextDecoder('utf-8').decode(buf);
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMeta(text: string, contentType: string): { title: string; snippet: string } {
  if (!(contentType || '').includes('html')) {
    return { title: '', snippet: text.replace(/\s+/g, ' ').trim().slice(0, 250) };
  }
  const titleMatch = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]).slice(0, 120) : '';
  return { title, snippet: stripTags(text).slice(0, 250) };
}

/** Hosting placeholders / parked / under-construction signals. Heuristic only — the AI gets the raw evidence too. */
const PLACEHOLDER_RE =
  /default (web )?page|under construction|coming soon|is parked|site is (not set up|not configured|unavailable|down)|plesk|hostinger|cpanel|godaddy|welcome to nginx|apache2 default|it works!|index of \//i;

interface SiteResult {
  url: string;
  reachable: boolean;
  status: number | null;
  contentType: string;
  title: string;
  snippet: string;
  looksLive: boolean;
  note: string;
}

async function fetchSite(urlStr: string): Promise<SiteResult> {
  let current = urlStr;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let parsed: URL;
    try {
      parsed = new URL(current);
    } catch {
      return { url: urlStr, reachable: false, status: null, contentType: '', title: '', snippet: '', looksLive: false, note: 'invalid URL' };
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { url: urlStr, reachable: false, status: null, contentType: '', title: '', snippet: '', looksLive: false, note: 'blocked: unsupported protocol' };
    }
    const verdict = await hostVerdict(parsed.hostname);
    if (verdict === 'blocked') {
      return { url: urlStr, reachable: false, status: null, contentType: '', title: '', snippet: '', looksLive: false, note: 'blocked: URL points to a private/internal host' };
    }
    if (verdict === 'dns-failed') {
      return { url: urlStr, reachable: false, status: null, contentType: '', title: '', snippet: '', looksLive: false, note: 'DNS lookup failed' };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(current, {
        signal: controller.signal,
        redirect: 'manual',
        headers: { 'user-agent': 'Mozilla/5.0 (GitDeep Deployment Checker)' },
      });
    } catch (e: any) {
      const note = e?.name === 'AbortError' ? 'timed out' : 'connection failed';
      return { url: urlStr, reachable: false, status: null, contentType: '', title: '', snippet: '', looksLive: false, note };
    } finally {
      clearTimeout(timer);
    }

    const status = res.status;
    if (status >= 300 && status < 400) {
      const location = res.headers.get('location');
      res.body?.cancel().catch(() => {});
      if (!location) {
        return { url: urlStr, reachable: false, status, contentType: res.headers.get('content-type') || '', title: '', snippet: '', looksLive: false, note: 'redirect without location' };
      }
      try {
        current = new URL(location, current).toString();
      } catch {
        return { url: urlStr, reachable: false, status: null, contentType: '', title: '', snippet: '', looksLive: false, note: 'invalid redirect target' };
      }
      continue;
    }

    const text = await readCapped(res);
    const contentType = res.headers.get('content-type') || '';
    const { title, snippet } = extractMeta(text, contentType);
    const looksLive =
      status >= 200 && status < 400 &&
      (title.length > 0 || snippet.length > 0) &&
      !PLACEHOLDER_RE.test(`${title} ${snippet}`);

    return { url: urlStr, reachable: true, status, contentType, title, snippet, looksLive, note: '' };
  }

  return { url: urlStr, reachable: false, status: null, contentType: '', title: '', snippet: '', looksLive: false, note: 'too many redirects' };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const url = typeof body?.url === 'string' ? body.url.trim() : '';
    if (!url) return NextResponse.json({ url: '', reachable: false, note: 'missing url' });
    if (url.length > 2048) return NextResponse.json({ url, reachable: false, note: 'url too long' });
    return NextResponse.json(await fetchSite(url));
  } catch {
    return NextResponse.json({ url: '', reachable: false, note: 'internal error' });
  }
}