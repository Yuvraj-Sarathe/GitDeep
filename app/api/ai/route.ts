import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 180;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 150000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, prompt, systemInstruction, apiKey, endpoint, model } = body;

    if (provider === 'gemini') {
      return NextResponse.json({ error: 'Gemini should be called client-side' }, { status: 400 });
    }

    if (provider === 'ollama') {
      try {
        const response = await fetchWithTimeout(`${endpoint}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemInstruction || '' },
              { role: 'user', content: prompt }
            ],
            stream: false,
            temperature: 0
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Ollama OpenAI endpoint error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '{}';
        return NextResponse.json({ response: content });

      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error('Ollama request timed out after 150s. The model may be too slow or the prompt too large.');
        }

        const response = await fetchWithTimeout(`${endpoint}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model,
            prompt: prompt,
            system: systemInstruction,
            stream: false,
            options: { temperature: 0, num_ctx: 32768 },
            format: 'json'
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Ollama API error (${response.status}): ${errText}`);
        }

        const result = await response.json();
        return NextResponse.json({ response: result.response || '{}' });
      }
    }

    // Handle all OpenAI-compatible providers (nvidia, openai, groq, etc.)
    try {
      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: 0,
          max_tokens: 16384,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        const status = response.status;
        if (status === 413) throw new Error(`413: Prompt too large for this model's context window.`);
        if (status === 401) throw new Error(`401: Unauthorized — check your API key.`);
        if (status === 429) throw new Error(`429: Rate limited by provider.`);
        throw new Error(`API Error (${status}): ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      return NextResponse.json({ response: content });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 150s. Consider using a larger model or switching to Gemini.');
      }
      throw error;
    }

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
