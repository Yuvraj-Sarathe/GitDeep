// Server-only module for the GitDeep Free Key (star-to-unlock) shared Gemini
// pool. The raw keys live here — in server-only env vars — and calls are
// proxied through /api/gemini-shared, so the keys NEVER enter the client
// bundle and cannot be extracted from the site's JavaScript.
// DO NOT import this file from any client component.

import { GoogleGenAI } from '@google/genai';

// Keys come from env WITHOUT the NEXT_PUBLIC_ prefix: they're read by the
// server only. The client never sees them.
function collectSharedKeys(): string[] {
  const slots = [
    process.env.SHARED_GEMINI_KEY_1,
    process.env.SHARED_GEMINI_KEY_2,
    process.env.SHARED_GEMINI_KEY_3,
  ];
  const keys = slots.filter((k): k is string => !!k && k.trim() !== '');
  if (keys.length === 0) {
    // Legacy single-key setup still works until the owner migrates to slots.
    const legacy = process.env.SHARED_GEMINI_KEY;
    if (legacy && legacy.trim() !== '') keys.push(legacy);
  }
  return keys;
}

const SHARED_KEYS = collectSharedKeys();

// Server-side budget PER shared key, kept inside Gemini's free-tier limits.
// This is the backstop for the public proxy route: even with no auth, a key
// can only burn its own budget before the pool rolls away from it.
export const SHARED_KEY_RPM_LIMIT = 10;      // requests per minute per key
export const SHARED_KEY_RPD_LIMIT = 500;     // requests per day per key
export const SHARED_KEY_TPM_LIMIT = 250000;  // estimated tokens per minute per key

interface UsageEntry {
  t: number;
  tokens: number;
}

const usage = new Map<number, UsageEntry[]>();

function dayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function prune(index: number): UsageEntry[] {
  const start = dayStart();
  const entries = (usage.get(index) || []).filter(e => e.t >= start);
  usage.set(index, entries);
  return entries;
}

function isOverLimit(index: number, estimatedTokens: number): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const entries = prune(index);
  const lastMinute = entries.filter(e => now - e.t < 60_000);
  if (lastMinute.length >= SHARED_KEY_RPM_LIMIT) {
    return { allowed: false, reason: `over the ${SHARED_KEY_RPM_LIMIT}-req/min budget` };
  }
  if (entries.length >= SHARED_KEY_RPD_LIMIT) {
    return { allowed: false, reason: `over the ${SHARED_KEY_RPD_LIMIT}-req/day budget` };
  }
  const tpm = lastMinute.reduce((sum, e) => sum + e.tokens, 0);
  if (tpm + estimatedTokens > SHARED_KEY_TPM_LIMIT) {
    return { allowed: false, reason: 'over the ~250K-tokens/min budget' };
  }
  return { allowed: true };
}

function recordCall(index: number, estimatedTokens: number): void {
  prune(index).push({ t: Date.now(), tokens: estimatedTokens });
}

// Rolling selection: the key that served fewest requests in the last minute.
function pickKey(): number {
  const now = Date.now();
  const perKey = Array.from({ length: SHARED_KEYS.length }, (_, i) =>
    prune(i).filter(e => now - e.t < 60_000).length
  );
  return perKey.indexOf(Math.min(...perKey));
}

// Errors worth rolling to the next shared key: traffic/quota overloads and
// bad-key auth failures. Anything else is rethrown immediately.
function isRetryable(err: any): boolean {
  const msg = (err?.message || '').toLowerCase();
  return /429|500|502|503|529|resource_exhausted|quota|rate limit|rate_limit|overloaded|unavailable|too many requests|temporar|api key not valid|invalid api key|unauthorized|401/.test(msg);
}

async function callGeminiWithKey(apiKey: string, model: string, systemMsg: string, userPrompt: string, schema: any): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const config: any = {
    temperature: 0,
    topP: 1,
    topK: 1,
    systemInstruction: systemMsg,
    responseMimeType: 'application/json',
  };
  if (schema) config.responseSchema = schema;
  // Race against a hard timeout — a hung request must never leave the visitor
  // stuck on the loading animation forever.
  const response = await Promise.race([
    ai.models.generateContent({ model, contents: userPrompt, config }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini request timed out after 150s. The shared key may be overloaded — try again in a moment.')), 150000)
    ),
  ]);
  return response.text || '{}';
}

// Rolling pool: start on the least-busy key and, when one is over budget or
// buckles under traffic (quota/429/5xx), roll to the next. Keys never leave
// this module. Returns the raw JSON text the model produced.
export async function runSharedGemini(
  model: string,
  systemMsg: string,
  userPrompt: string,
  schema: any,
  estimatedTokens: number
): Promise<string> {
  if (SHARED_KEYS.length === 0) {
    throw new Error('GitDeep Free Key is not configured on this deployment — the owner needs to set SHARED_GEMINI_KEY_1 (or the legacy SHARED_GEMINI_KEY).');
  }
  const failures: string[] = [];
  for (let i = 0; i < SHARED_KEYS.length; i++) {
    const keyIndex = (pickKey() + i) % SHARED_KEYS.length;
    const limit = isOverLimit(keyIndex, estimatedTokens);
    if (!limit.allowed) {
      failures.push('budget');
      continue;
    }
    try {
      const text = await callGeminiWithKey(SHARED_KEYS[keyIndex], model, systemMsg, userPrompt, schema);
      recordCall(keyIndex, estimatedTokens);
      return text;
    } catch (e: any) {
      if (!isRetryable(e)) throw e;
      failures.push('traffic');
    }
  }
  if (failures.every(f => f === 'budget')) {
    throw new Error('GitDeep Free Key has hit its shared budget right now — wait a minute, or add your own key in Settings.');
  }
  throw new Error(`GitDeep Free Key is overloaded right now — all ${SHARED_KEYS.length} keys are busy. Try again in a moment, or add your own key in Settings.`);
}