"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { checkStarStatus, SHARED_REPO_OWNER, SHARED_REPO_NAME, SHARED_REPO_URL } from '@/lib/sharedKey';
import { validateStarState, getPendingStarReturn, clearStarPending, setStarRunPending } from '@/lib/starAuth';
import { Loader2, Star, Check, AlertTriangle } from 'lucide-react';

// Landing page for the GitHub OAuth redirect. Verifies the star, persists the
// verified identity into settings, switches the app to the Free Key, and sends
// the user back where they came from. Failures are explained here instead of
// bouncing back with a cryptic query string.
export default function StarCallbackPage() {
  const router = useRouter();
  const { updateSettings } = useStore();
  const [phase, setPhase] = useState<'checking' | 'success' | 'denied' | 'error'>('checking');
  const [detail, setDetail] = useState('');
  const fallbackRef = useRef('/');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const state = params.get('state');
    const code = params.get('code');
    const pending = getPendingStarReturn();
    fallbackRef.current = pending?.path || '/';
    const action = pending?.action || 'none';

    (async () => {
      // Defer one microtask: none of the state updates below may run
      // synchronously inside the effect body.
      await Promise.resolve();

      if (!code || !validateStarState(state)) {
        setDetail('The verification link was invalid or expired. Go back and try again.');
        clearStarPending();
        setPhase('error');
        return;
      }

      try {
        const res = await fetch('/api/github-oauth/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            redirectUri: `${window.location.origin}/api/auth/callback/github`,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.username) {
          throw new Error(data.error || 'Verification failed.');
        }
        const username: string = data.username;

        const star = await checkStarStatus(username);
        if (!star.starred) {
          setDetail(star.message || `@${username} has not starred the repo yet.`);
          clearStarPending();
          setPhase('denied');
          return;
        }

        // Identity proven by OAuth — persist it and activate the Free Key so
        // the next assessment runs without the visitor's own key.
        updateSettings({
          sharedKeyVerified: true,
          sharedKeyUsername: username,
          aiProvider: 'shared-gemini',
          model: 'gemini-3.6-flash',
        });
        if (action === 'run') setStarRunPending();
        setPhase('success');
        setTimeout(() => router.replace(fallbackRef.current), 1200);
      } catch (err: any) {
        setDetail(err.message || 'Verification failed.');
        clearStarPending();
        setPhase('error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 min-h-[80dvh] flex items-center justify-center px-4">
      <div className="double-bezel relative w-full max-w-md">
        <div className="inner text-center py-6">
          {phase === 'checking' && (
            <>
              <Loader2 className="w-8 h-8 text-[#E3B341] animate-spin mx-auto mb-4" aria-hidden="true" />
              <h1 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Verifying your star…</h1>
              <p className="text-xs text-white/40">Checking the repo with GitHub&apos;s API — a second, tops.</p>
            </>
          )}

          {phase === 'success' && (
            <>
              <div className="w-12 h-12 rounded-full bg-[#2EA043]/15 border border-[#2EA043]/40 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-[#46E363]" aria-hidden="true" />
              </div>
              <h1 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Star verified — Free Key active</h1>
              <p className="text-xs text-white/40">Sending you back…</p>
            </>
          )}

          {phase === 'denied' && (
            <>
              <div className="w-12 h-12 rounded-full bg-[#FF7B72]/10 border border-[#FF7B72]/30 flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-[#FF7B72]" aria-hidden="true" />
              </div>
              <h1 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Not a starrer yet</h1>
              <p className="text-xs text-[#C9D1D9] leading-relaxed mb-4">{detail}</p>
              <div className="flex flex-col gap-2">
                <a
                  href={SHARED_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-[#E3B341]/10 border border-[#E3B341]/30 text-[#E3B341] text-xs font-bold uppercase tracking-wider px-5 py-2.5 hover:bg-[#E3B341]/20 premium-transition"
                >
                  Star {SHARED_REPO_OWNER}/{SHARED_REPO_NAME}
                </a>
                <button
                  type="button"
                  onClick={() => router.replace(fallbackRef.current)}
                  className="text-xs text-white/40 hover:text-white premium-transition py-1"
                >
                  Back to GitDeep
                </button>
              </div>
            </>
          )}

          {phase === 'error' && (
            <>
              <div className="w-12 h-12 rounded-full bg-[#FF7B72]/10 border border-[#FF7B72]/30 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-[#FF7B72]" aria-hidden="true" />
              </div>
              <h1 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Verification failed</h1>
              <p className="text-xs text-[#C9D1D9] leading-relaxed mb-4">{detail}</p>
              <button
                type="button"
                onClick={() => router.replace(fallbackRef.current)}
                className="text-xs text-white/40 hover:text-white premium-transition"
              >
                Back to GitDeep
              </button>
            </>
          )}

          <p className="text-[10px] text-white/30 mt-6">
            <Link href="/" className="hover:text-white/60 premium-transition">GitDeep</Link> · nothing stored · identity never leaves this device
          </p>
        </div>
      </div>
    </div>
  );
}