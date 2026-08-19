import { NextRequest, NextResponse } from 'next/server';
import { runSharedGemini } from '@/lib/sharedKeyServer';

export const maxDuration = 180;

// Server-only proxy for the GitDeep Free Key. The shared Gemini keys live in
// server-only env vars (SHARED_GEMINI_KEY_1..3) and never reach the client
// bundle. Per-key budgets in sharedKeyServer.ts cap what this public endpoint
// can burn, so even an attacker hammering it directly can't exhaust more than
// the pool's own limits — and can never extract a key.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, systemInstruction, prompt, schema, estimatedTokens } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Missing prompt.' }, { status: 400 });
    }

    const response = await runSharedGemini(
      typeof model === 'string' && model ? model : 'gemini-3.6-flash',
      typeof systemInstruction === 'string' ? systemInstruction : '',
      prompt,
      schema && typeof schema === 'object' ? schema : undefined,
      typeof estimatedTokens === 'number' && Number.isFinite(estimatedTokens) ? estimatedTokens : 0
    );

    return NextResponse.json({ response });
  } catch (err: any) {
    console.error('Shared Gemini route error:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}