"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Briefcase, Code, HelpCircle, ArrowUpRight,
  Github, Zap, Shield, Users, GitBranch, Star, Terminal,
  ChevronRight,
} from 'lucide-react';
import { SettingsModal } from '@/components/SettingsModal';
import Image from 'next/image';
import logo from './logo.png';
import type { ComparisonCandidate } from '@/lib/ai';

/* ── small, self-contained components ───────────────────────── */

function StatPill({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-3 border-r border-white/[0.06] last:border-r-0">
      <span className={`text-xl font-bold tabular-nums ${color}`}>{value}</span>
      <span className="text-[10px] uppercase tracking-widest text-white/30 mt-0.5">{label}</span>
    </div>
  );
}

function FeatureChip({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] text-xs text-white/40">
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {label}
    </div>
  );
}

const EXAMPLE_USERS = ['torvalds', 'gaearon', 'sindresorhus', 'addyosmani', 'tj'];

const FLOW_STEPS = [
  {
    step: '01',
    icon: Github,
    title: 'Enter a GitHub username',
    desc: 'Paste any public handle — yours, a candidate\'s, or a dev you admire.',
    chipBg: 'bg-[#58A6FF]/15',
    chipBorder: 'border-[#58A6FF]/40',
    iconColor: 'text-[#58A6FF]',
    glow: 'shadow-[0_0_20px_rgba(88,166,255,0.25)]',
  },
  {
    step: '02',
    icon: Zap,
    title: 'AI reads the full profile',
    desc: 'Repos, commits, stars, language spread — every signal that matters.',
    chipBg: 'bg-[#8957E5]/15',
    chipBorder: 'border-[#8957E5]/40',
    iconColor: 'text-[#A371F7]',
    glow: 'shadow-[0_0_20px_rgba(137,87,229,0.3)]',
  },
  {
    step: '03',
    icon: Terminal,
    title: 'Get a brutally honest report',
    desc: 'Strengths, red flags, growth gaps, and a hire-ability verdict. No mercy.',
    chipBg: 'bg-[#2EA043]/15',
    chipBorder: 'border-[#2EA043]/40',
    iconColor: 'text-[#46E363]',
    glow: 'shadow-[0_0_20px_rgba(46,160,67,0.25)]',
  },
];

/* Looping, gif-like "how it works" flow card */
function HowItWorksFlow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % FLOW_STEPS.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="double-bezel relative">
      <div className="inner p-6 md:p-8 relative overflow-hidden">
        {/* travelling scanline for a "gif" feel */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#8957E5]/[0.07] to-transparent"
          style={{ animation: 'shimmer 5s linear infinite' }}
          aria-hidden="true"
        />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#8957E5]/15 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#A371F7]" aria-hidden="true" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">How it works</h2>
          </div>
          <span className="text-[10px] font-mono text-white/25 tabular-nums">
            {String(active + 1).padStart(2, '0')} / {String(FLOW_STEPS.length).padStart(2, '0')}
          </span>
        </div>

        <div className="relative">
          {/* rail */}
          <div className="absolute left-[21px] top-3 bottom-3 w-px bg-white/[0.08]" aria-hidden="true" />
          {/* looping beam */}
          <div className="flow-beam absolute left-[19px] top-0 w-[5px] h-20 rounded-full bg-gradient-to-b from-transparent via-[#8957E5]/70 to-transparent" aria-hidden="true" />

          <div className="space-y-1">
            {FLOW_STEPS.map(({ icon: Icon, title, desc, chipBg, chipBorder, iconColor, glow }, i) => {
              const isActive = i === active;
              return (
                <div key={title} className={`relative flex gap-4 py-2.5 premium-transition ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`relative z-10 w-11 h-11 rounded-xl border flex items-center justify-center premium-transition ${isActive ? `${chipBg} ${chipBorder} ${glow}` : 'bg-white/[0.03] border-white/[0.06]'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? iconColor : 'text-white/35'}`} aria-hidden="true" />
                    {isActive && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#46E363] animate-pulse" aria-hidden="true" />}
                  </div>
                  <div className="pt-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-white/30">{FLOW_STEPS[i].step}</span>
                      <h3 className={`text-sm font-bold premium-transition ${isActive ? 'text-white' : 'text-white/45'}`}>{title}</h3>
                    </div>
                    <p className="text-xs text-white/35 leading-relaxed mt-1">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
          <span className="text-[10px] uppercase tracking-widest text-white/25">Session-only · nothing stored</span>
          <span className="text-[10px] font-mono text-[#A371F7]">auto-loop</span>
        </div>
      </div>
    </div>
  );
}

/* ── main page ──────────────────────────────────────────────── */

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState<'employer' | 'developer'>('employer');
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [savedAssessments, setSavedAssessments] = useState<ComparisonCandidate[]>([]);

  // Read this tab's session cache: previously generated assessments.
  useEffect(() => {
    let loaded: ComparisonCandidate[] = [];
    try {
      const stored: ComparisonCandidate[] = JSON.parse(sessionStorage.getItem('assessedCandidates') || '[]');
      loaded = stored.slice().reverse(); // newest first
    } catch {
      loaded = [];
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedAssessments(loaded);
  }, []);

  const clearAssessments = () => {
    try { sessionStorage.removeItem('assessedCandidates'); } catch {}
    setSavedAssessments([]);
  };

  const taglines = [
    'Assess any GitHub profile in seconds.',
    'Spot top talent before the interview.',
    'Know your own blind spots. Grow faster.',
    'Brutal honesty. Actionable insights.',
  ];

  useEffect(() => {
    const t = setInterval(() => setTaglineIdx(i => (i + 1) % taglines.length), 3000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    router.push(`/assessment?user=${encodeURIComponent(username.trim())}&mode=${mode}`);
  };

  const fillExample = (u: string) => setUsername(u);

  return (
    <>
      <div className="grain" />

      {/* ── Floating nav ──────────────────────────────────────── */}
      <nav className="animate-fade-up fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="glass rounded-full px-5 py-2 flex items-center gap-6 shadow-2xl">
          <span className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Image src={logo} alt="GitDeep" width={20} height={20} className="rounded" />
            <span className="hidden sm:inline">GitDeep</span>
          </span>
          <div className="w-px h-4 bg-white/10" />
          <a
            href="/help"
            className="text-xs text-white/50 hover:text-white premium-transition flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" /> Guide
          </a>
          <div className="w-px h-4 bg-white/10" />
          <SettingsModal inline />
        </div>
      </nav>

      {/* ── Page body ─────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center min-h-[100dvh] px-4 pb-16 pt-28 md:pt-36">
        <div className="w-full max-w-5xl mx-auto">

          {/* ── Hero ──────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-14 md:mb-16 animate-fade-up">
            {/* Left — heading, subheading, description */}
            <div className="text-left">
              {/* badge */}
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8957E5] animate-pulse" />
                AI-Powered GitHub Analysis
              </span>

              {/* headline — pure white, no gradient */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-5">
                Deep-read any&nbsp;
                <span className="inline-flex items-center gap-3">
                  <Github className="w-9 h-9 md:w-11 md:h-11 text-white/60 inline-block align-middle" aria-hidden="true" />
                  GitHub
                </span>
                <br />
                <span className="text-white">profile in seconds</span>
              </h1>

              {/* subheading */}
              <p key={taglineIdx} className="text-sm md:text-base text-white/50 leading-relaxed mb-4 animate-fade-in">
                {taglines[taglineIdx]}
              </p>

              {/* description */}
              <p className="text-sm md:text-base text-white/35 leading-relaxed max-w-lg">
                GitDeep reads a GitHub profile the way a senior hiring manager would — repos, commits, stars, language spread, and the story between them — then hands you a brutally honest verdict you can actually act on. No sign-up, no storage. Just the truth.
              </p>

              {/* feature chips */}
              <div className="flex flex-wrap items-center gap-2 mt-6">
                <FeatureChip icon={Shield} label="Privacy first" />
                <FeatureChip icon={Zap} label="No sign-up" />
                <FeatureChip icon={Users} label="12 AI providers" />
                <FeatureChip icon={GitBranch} label="Session-only" />
                <FeatureChip icon={Star} label="Open source" />
              </div>
            </div>

            {/* Right — looping "how it works" flow */}
            <div className="animate-fade-up delay-150">
              <HowItWorksFlow />
            </div>
          </div>

          {/* ── Stats bar ─────────────────────────────────────── */}
          <div className="animate-fade-up delay-100 mb-8 md:mb-10">
            <div className="double-bezel">
              <div className="inner !py-0 !px-0">
                <div className="flex flex-wrap justify-center divide-x divide-white/[0.06]">
                  <StatPill value="12+" label="AI Providers" color="text-[#58A6FF]" />
                  <StatPill value="2" label="Analysis Modes" color="text-[#8957E5]" />
                  <StatPill value="100%" label="Open Source" color="text-[#2EA043]" />
                  <StatPill value="0" label="Data Stored" color="text-white/60" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Bento grid ────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 animate-fade-up delay-200">

            {/* Mode selection */}
            <div className="md:col-span-7">
              <div className="double-bezel h-full">
                <div className="inner h-full">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center text-[9px] font-bold text-white/40">1</span>
                    Select Perspective
                  </span>
                  <div className="grid grid-cols-2 gap-3">

                    {/* Employer */}
                    <button
                      onClick={() => setMode('employer')}
                      className={`group relative text-left p-5 rounded-xl border premium-transition ${
                        mode === 'employer'
                          ? 'border-[#2EA043]/50 bg-[#2EA043]/[0.06]'
                          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
                      }`}
                      aria-pressed={mode === 'employer'}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center premium-transition group-hover:scale-105 ${
                          mode === 'employer' ? 'bg-[#2EA043]/20' : 'bg-white/[0.04]'
                        }`}>
                          <Briefcase className={`w-5 h-5 ${mode === 'employer' ? 'text-[#46E363]' : 'text-white/40'}`} aria-hidden="true" />
                        </div>
                        <ArrowUpRight className={`w-4 h-4 premium-transition ${
                          mode === 'employer' ? 'text-[#46E363] opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-40'
                        }`} aria-hidden="true" />
                      </div>
                      <div className="text-sm font-bold text-white mb-1">Employer Mode</div>
                      <div className="text-xs text-white/40 leading-relaxed">Hirability verdict &amp; weakness analysis</div>
                      {mode === 'employer' && (
                        <div className="absolute bottom-3 right-3 w-5 h-5 rounded-full bg-[#2EA043] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </button>

                    {/* Developer */}
                    <button
                      onClick={() => setMode('developer')}
                      className={`group relative text-left p-5 rounded-xl border premium-transition ${
                        mode === 'developer'
                          ? 'border-[#58A6FF]/50 bg-[#58A6FF]/[0.06]'
                          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
                      }`}
                      aria-pressed={mode === 'developer'}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center premium-transition group-hover:scale-105 ${
                          mode === 'developer' ? 'bg-[#58A6FF]/20' : 'bg-white/[0.04]'
                        }`}>
                          <Code className={`w-5 h-5 ${mode === 'developer' ? 'text-[#58A6FF]' : 'text-white/40'}`} aria-hidden="true" />
                        </div>
                        <ArrowUpRight className={`w-4 h-4 premium-transition ${
                          mode === 'developer' ? 'text-[#58A6FF] opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-40'
                        }`} aria-hidden="true" />
                      </div>
                      <div className="text-sm font-bold text-white mb-1">Mentor Mode</div>
                      <div className="text-xs text-white/40 leading-relaxed">What to improve &amp; what to build next</div>
                      {mode === 'developer' && (
                        <div className="absolute bottom-3 right-3 w-5 h-5 rounded-full bg-[#58A6FF] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </button>

                  </div>

                  {/* Mode description strip */}
                  <div className={`mt-3 rounded-xl px-4 py-3 text-xs leading-relaxed premium-transition ${
                    mode === 'employer'
                      ? 'bg-[#2EA043]/[0.05] border border-[#2EA043]/20 text-[#46E363]/70'
                      : 'bg-[#58A6FF]/[0.05] border border-[#58A6FF]/20 text-[#58A6FF]/70'
                  }`}>
                    {mode === 'employer'
                      ? '🔍 Evaluates code quality, project depth, consistency, and red flags a hiring manager cares about.'
                      : '🚀 Reuses the employer assessment to tell you exactly what to improve, what to learn, and what to build next — no re-scoring.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Username input */}
            <div className="md:col-span-5">
              <div className="double-bezel h-full">
                <div className="inner h-full flex flex-col gap-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center text-[9px] font-bold text-white/40">2</span>
                    Enter Username
                  </span>

                  <form onSubmit={handleAnalyze} className="flex-1 flex flex-col gap-3">
                    {/* Input */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Github className="w-4 h-4 text-white/30" aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        name="github-username"
                        autoComplete="off"
                        spellCheck={false}
                        className="w-full h-14 pl-11 pr-4 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50 focus:border-[#58A6FF]/50 focus:bg-white/[0.06] premium-transition text-sm text-white placeholder-white/20 font-mono"
                        placeholder="github-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        aria-label="GitHub username"
                      />
                    </div>

                    {/* Example profiles */}
                    <div>
                      <p className="text-[10px] text-white/25 mb-2 uppercase tracking-widest">Try an example</p>
                      <div className="flex flex-wrap gap-1.5">
                        {EXAMPLE_USERS.map(u => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => fillExample(u)}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.07] text-[11px] font-mono text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.06] premium-transition"
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#58A6FF]/10 to-[#8957E5]/10 border border-white/[0.1] hover:border-[#58A6FF]/40 premium-transition btn-press mt-auto"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#58A6FF]/20 to-[#8957E5]/20 opacity-0 group-hover:opacity-100 premium-transition" />
                      <div className="relative flex items-center justify-between px-6 py-4">
                        <span className="text-sm font-bold text-white/80 group-hover:text-white premium-transition">
                          Generate Assessment
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/[0.06] group-hover:bg-[#58A6FF]/30 flex items-center justify-center premium-transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          <ArrowUpRight className="w-4 h-4 text-white/60 group-hover:text-white premium-transition" aria-hidden="true" />
                        </div>
                      </div>
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>

          {/* ── Previous assessments (session cache) ─────────── */}
          {savedAssessments.length > 0 && (
            <div className="mt-8 animate-fade-up delay-300">
              <div className="double-bezel">
                <div className="inner p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Previous Assessments</h2>
                      <p className="text-[11px] text-white/30 mt-1">Kept in this tab only — close the tab and they&apos;re gone. Nothing is transferred or stored on a server.</p>
                    </div>
                    <button
                      type="button"
                      onClick={clearAssessments}
                      className="text-[10px] text-white/30 hover:text-[#FF7B72] uppercase tracking-widest premium-transition shrink-0 mt-1"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {savedAssessments.map((c) => {
                      const isMentor = !!c.assessment.mentorshipPlan;
                      const score = c.assessment.hirabilityScore ?? 0;
                      const scoreColor = score >= 7.6 ? 'text-[#46E363]' : score >= 4 ? 'text-[#E3B341]' : 'text-[#FF7B72]';
                      return (
                        <button
                          key={c.username}
                          onClick={() => router.push(`/assessment?user=${encodeURIComponent(c.username)}&mode=${isMentor ? 'developer' : 'employer'}`)}
                          className="group flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#58A6FF]/40 premium-transition text-left"
                        >
                          <img src={c.avatarUrl} alt={c.username} width={48} height={48} loading="lazy" className="w-10 h-10 rounded-full border border-white/10 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white truncate">@{c.username}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold shrink-0 ${isMentor ? 'bg-[#58A6FF]/15 text-[#58A6FF]' : 'bg-[#2EA043]/15 text-[#46E363]'}`}>
                                {isMentor ? 'Mentor' : 'Employer'}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/35 line-clamp-2 mt-0.5 leading-snug">{c.assessment.summary || 'Assessment ready.'}</p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 shrink-0">
                            <span className={`text-lg font-black tabular-nums ${scoreColor}`}>{score.toFixed(1)}</span>
                            <span className="text-[9px] uppercase tracking-widest text-white/25">/10</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 premium-transition shrink-0" aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Providers footer strip ────────────────────────── */}
          <div className="mt-8 animate-fade-up delay-400">
            <div className="double-bezel">
              <div className="inner !py-3 !px-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#58A6FF]" aria-hidden="true" />
                    No database
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2EA043]" aria-hidden="true" />
                    Session-based
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8957E5]" aria-hidden="true" />
                    Privacy first
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {['gemini', 'openai', 'anthropic', 'ollama', 'groq', 'grok'].map((p) => (
                      <div
                        key={p}
                        title={p}
                        className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[8px] text-white/40 font-mono"
                      >
                        {p.slice(0, 2)}
                      </div>
                    ))}
                  </div>
                  <a
                    href="/settings"
                    className="text-[10px] text-white/25 hover:text-[#58A6FF] premium-transition flex items-center gap-0.5"
                  >
                    12 providers <ChevronRight className="w-3 h-3" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
