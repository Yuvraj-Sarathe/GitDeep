"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Briefcase, Code, HelpCircle, ArrowUpRight,
  Github, Zap, Shield, Users, GitBranch, Star, Terminal,
  ChevronRight,
} from 'lucide-react';
import { SettingsModal } from '@/components/SettingsModal';
import DotField from '@/components/DotField';
import Image from 'next/image';
import logo from './logo.png';

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

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Github,
    title: 'Enter a GitHub username',
    desc: 'Paste any public GitHub handle — yours, a candidate\'s, or a dev you admire.',
    color: 'text-[#58A6FF]',
    bg: 'bg-[#58A6FF]/10',
  },
  {
    step: '02',
    icon: Zap,
    title: 'AI reads the full profile',
    desc: 'Repos, commit history, stars, language spread — every signal that matters.',
    color: 'text-[#8957E5]',
    bg: 'bg-[#8957E5]/10',
  },
  {
    step: '03',
    icon: Terminal,
    title: 'Get a brutally honest report',
    desc: 'Strengths, red flags, growth gaps, and an overall hire-ability verdict.',
    color: 'text-[#2EA043]',
    bg: 'bg-[#2EA043]/10',
  },
];

/* ── main page ──────────────────────────────────────────────── */

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState<'employer' | 'developer'>('employer');
  const [taglineIdx, setTaglineIdx] = useState(0);

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

      {/* Background dot field */}
      <div className="fixed inset-0 z-0">
        <DotField
          dotRadius={2.5}
          dotSpacing={20}
          bulgeStrength={110}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
          gradientFrom="rgba(138, 87, 229, 0.6)"
          gradientTo="rgba(88, 166, 255, 0.5)"
        />
      </div>

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
          <div className="text-center mb-10 md:mb-14 animate-fade-up">
            {/* badge */}
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#58A6FF] animate-pulse" />
              AI-Powered GitHub Analysis
            </span>

            {/* headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-tight text-white leading-[1] max-w-4xl mx-auto mb-5">
              Deep-read any&nbsp;
              <span className="inline-flex items-center gap-3">
                <Github className="w-9 h-9 md:w-12 md:h-12 text-white/60 inline-block align-middle" aria-hidden="true" />
                GitHub
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58A6FF] via-[#8957E5] to-[#58A6FF] bg-[length:200%] animate-gradient-x">
                profile in seconds
              </span>
            </h1>

            {/* rotating tagline */}
            <p
              key={taglineIdx}
              className="text-sm md:text-base text-white/45 max-w-md mx-auto leading-relaxed animate-fade-in"
            >
              {taglines[taglineIdx]}
            </p>

            {/* feature chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <FeatureChip icon={Shield} label="Privacy first" />
              <FeatureChip icon={Zap} label="No sign-up" />
              <FeatureChip icon={Users} label="12 AI providers" />
              <FeatureChip icon={GitBranch} label="Session-only" />
              <FeatureChip icon={Star} label="Open source" />
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
                      <div className="text-sm font-bold text-white mb-1">Developer Mode</div>
                      <div className="text-xs text-white/40 leading-relaxed">Growth roadmap &amp; mentorship insights</div>
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
                      : '🚀 Identifies skill gaps, suggests learning paths, and highlights your strongest areas to double down on.'}
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

          {/* ── How it works ──────────────────────────────────── */}
          <div className="mt-10 md:mt-14 animate-fade-up delay-300">
            <div className="text-center mb-6">
              <h2 className="text-xs uppercase tracking-[0.25em] text-white/30 font-medium">How it works</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color, bg }) => (
                <div key={step} className="double-bezel group hover:scale-[1.02] premium-transition">
                  <div className="inner">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${bg} premium-transition group-hover:scale-110`}>
                        <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold ${color} opacity-60 uppercase tracking-widest`}>{step}</span>
                        <h3 className="text-sm font-bold text-white mt-0.5 mb-1">{title}</h3>
                        <p className="text-xs text-white/35 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
