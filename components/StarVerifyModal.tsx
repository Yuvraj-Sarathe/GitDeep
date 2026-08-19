"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { SHARED_REPO_OWNER, SHARED_REPO_NAME, SHARED_REPO_URL, SHARED_KEY_RPM_LIMIT, SHARED_KEY_RPD_LIMIT } from '@/lib/sharedKey';
import { isOAuthConfigured, startGitHubAuth } from '@/lib/starAuth';
import { Star, X, Check, Github } from 'lucide-react';

interface StarVerifyModalProps {
  open: boolean;
  onClose: () => void;
  pendingAction?: 'run' | 'none';
}

export default function StarVerifyModal({ open, onClose, pendingAction = 'none' }: StarVerifyModalProps) {
  const { settings } = useStore();
  // Verified state comes straight from the store — updateSettings flips it,
  // so the UI and the enforcement gate can never disagree.
  const verified = settings.sharedKeyVerified;
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleContinue = () => {
    setMessage('');
    const url = startGitHubAuth({ path: window.location.href, action: pendingAction });
    if (!url) {
      setMessage('GitHub verification is not configured on this deployment yet. Add your own key in Settings instead.');
      return;
    }
    // Top-level navigation: GitHub authorizes, redirects to /auth/callback,
    // and the callback sends the user back to this same URL — now verified.
    window.location.href = url;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Star verification" className="double-bezel relative w-full max-w-md">
        <div className="inner">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#E3B341]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Unlock the Free Key</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] flex items-center justify-center premium-transition text-white/40 hover:text-white"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!verified ? (
            <>
              <p className="text-xs text-white/40 leading-relaxed mb-4">
                The <span className="text-white/70 font-semibold">GitDeep Free Key</span> is a shared Gemini key for people who support the project.
                Star{' '}
                <a href={SHARED_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-[#E3B341] hover:underline font-mono">
                  {SHARED_REPO_OWNER}/{SHARED_REPO_NAME}
                </a>{' '}
                on GitHub, then verify with your account below.
              </p>

              <button
                type="button"
                onClick={handleContinue}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#E3B341]/10 border border-[#E3B341]/30 text-[#E3B341] text-xs font-bold uppercase tracking-wider hover:bg-[#E3B341]/20 premium-transition btn-press"
              >
                <Github className="w-4 h-4" />
                Continue with GitHub
              </button>
              <p className="text-[10px] text-white/30 mt-2 leading-relaxed">
                Opens GitHub&apos;s sign-in (read-only profile access). Your username is taken from the OAuth token — typed usernames can&apos;t be faked, and nothing is stored.
              </p>

              {message && <p className="text-[11px] text-[#FF7B72] mt-2">{message}</p>}

              <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <p className="text-[10px] text-white/35 leading-relaxed">
                  Shared key: {SHARED_KEY_RPM_LIMIT} req/min and {SHARED_KEY_RPD_LIMIT} req/day per key
                  {`, auto-rotating across the shared pool when busy.`}
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[#2EA043]/30 bg-[#2EA043]/[0.06] px-4 py-3">
              <p className="text-sm text-white/80 flex items-center gap-2">
                <Check className="w-4 h-4 text-[#46E363] shrink-0" />
                <span>Star verified — @{settings.sharedKeyUsername}</span>
              </p>
              <p className="text-[11px] text-white/40 mt-1.5">
                The Free Key is active — {SHARED_KEY_RPM_LIMIT} req/min and {SHARED_KEY_RPD_LIMIT} req/day per key
                {`, auto-rotating across the shared pool when busy.`}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-5">
            {verified ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[#E3B341]/10 border border-[#E3B341]/30 text-[#E3B341] text-xs font-bold uppercase tracking-wider px-5 py-2.5 hover:bg-[#E3B341]/20 premium-transition"
              >
                Done
              </button>
            ) : (
              <span className="text-[10px] text-white/30">Needs an internet connection — GitHub handles the sign-in.</span>
            )}
            <button type="button" onClick={onClose} className="text-xs text-white/40 hover:text-white premium-transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}