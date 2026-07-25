"use client";

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchGitHubProfile, UserAssessmentData } from '@/lib/github';
import { generateAssessment, AssessmentMode, AssessmentResult, compareCandidates, ComparisonCandidate, ComparisonResult } from '@/lib/ai';
import { useStore } from '@/lib/store';
import { SettingsModal } from '@/components/SettingsModal';
import { ArrowLeft, Loader2, Send, Linkedin, Twitter, Target, Zap, Shield, AlertTriangle, Code2, Instagram, ExternalLink, GitCompare, X, Check, HelpCircle } from 'lucide-react';
import { AiLoadingNote } from '@/components/AiLoadingNote';
import ReactMarkdown from 'react-markdown';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

function AssessmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { settings } = useStore();
  
  const username = searchParams.get('user');
  const mode = (searchParams.get('mode') as AssessmentMode) || 'employer';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubData, setGithubData] = useState<UserAssessmentData | null>(null);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [savedCandidates, setSavedCandidates] = useState<ComparisonCandidate[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const [compareQuestion, setCompareQuestion] = useState('');
  const [newCompareUser, setNewCompareUser] = useState('');
  const [addingToCompare, setAddingToCompare] = useState(false);
  const [showCompletenessWarning, setShowCompletenessWarning] = useState(false);
  const prevAssessmentRef = useRef<AssessmentResult | null>(null);
  const prevGithubDataRef = useRef<UserAssessmentData | null>(null);

  // Derive showCompletenessWarning during render (not in an effect) to avoid
  // ESLint react-hooks/set-state-in-effect.
  if (assessment && assessment !== prevAssessmentRef.current) {
    prevAssessmentRef.current = assessment;
    const hasMissing = !assessment.summary || assessment.summary.length < 20 ||
      !assessment.detailedReport || assessment.detailedReport.length < 200 ||
      !assessment.repoAssessments || assessment.repoAssessments.length === 0 ||
      !assessment.timeline || assessment.timeline.length === 0 ||
      !assessment.swot.strengths || assessment.swot.strengths.length === 0;
    if (hasMissing !== showCompletenessWarning) setShowCompletenessWarning(hasMissing);
  }

  // Derive savedCandidates during render (not in an effect).
  if (assessment && githubData && (assessment !== prevAssessmentRef.current || githubData !== prevGithubDataRef.current)) {
    prevGithubDataRef.current = githubData;
    const stored: ComparisonCandidate[] = JSON.parse(sessionStorage.getItem('assessedCandidates') || '[]');
    const entry: ComparisonCandidate = { username: githubData.username, avatarUrl: githubData.avatarUrl, assessment };
    const idx = stored.findIndex((c: ComparisonCandidate) => c.username === githubData.username);
    if (idx >= 0) stored[idx] = entry;
    else stored.push(entry);
    try { sessionStorage.setItem('assessedCandidates', JSON.stringify(stored)); } catch {}
    if (stored.length !== savedCandidates.length || stored.some((c, i) => c.username !== savedCandidates[i]?.username)) {
      setSavedCandidates(stored);
    }
  }

  useEffect(() => {
    if (!username) return;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const ghData = await fetchGitHubProfile(username!, settings.githubToken);
        setGithubData(ghData);

        const aiResponse = await generateAssessment(ghData, settings, mode);
        setAssessment(aiResponse);
        
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An unknown error occurred. Make sure your API keys and endpoints are correct.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, mode, settings.githubToken, settings.aiProvider, settings.apiKey, settings.apiEndpoint, settings.model]);


  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || !githubData) return;
    
    setAskingQuestion(true);
    try {
      const response = await generateAssessment(githubData, settings, mode, customQuestion);
      setAssessment(prev => {
        if (!prev) return response;
        return {
          ...response,
          detailedReport: prev.detailedReport + `\n\n---\n\n### Q: ${customQuestion}\n\n${response.detailedReport}`,
        };
      });
      setCustomQuestion('');
    } catch (err: any) {
      alert("Error asking question: " + err.message);
    } finally {
      setAskingQuestion(false);
    }
  };

  const handleAddToCompare = async () => {
    if (!newCompareUser.trim()) return;
    setAddingToCompare(true);
    try {
      const ghData = await fetchGitHubProfile(newCompareUser.trim(), settings.githubToken);
      const result = await generateAssessment(ghData, settings, 'employer');
      const entry: ComparisonCandidate = { username: ghData.username, avatarUrl: ghData.avatarUrl, assessment: result };

      const stored = JSON.parse(sessionStorage.getItem('assessedCandidates') || '[]');
      const idx = stored.findIndex((c: ComparisonCandidate) => c.username === ghData.username);
      if (idx >= 0) stored[idx] = entry;
      else stored.push(entry);
      try { sessionStorage.setItem('assessedCandidates', JSON.stringify(stored)); } catch {}
      setSavedCandidates([...stored]);
      setSelectedForCompare(prev => [...prev, ghData.username]);
      setNewCompareUser('');
    } catch (err: any) {
      alert('Failed to assess: ' + err.message);
    } finally {
      setAddingToCompare(false);
    }
  };

  function getTextFromChildren(children: React.ReactNode): string {
    let text = '';
    React.Children.forEach(children, (child) => {
      if (typeof child === 'string') text += child;
      else if (typeof child === 'number') text += String(child);
      else if (React.isValidElement(child)) text += getTextFromChildren((child.props as any).children);
    });
    return text;
  }

  const markdownComponents = {
    p: ({ children, ...props }: any) => {
      const text = getTextFromChildren(children);
      if (text?.startsWith('⚠️')) {
        return <p className="text-[#FF7B72] flex items-start gap-2 text-sm leading-relaxed mb-4"><span>{children}</span></p>;
      }
      if (text?.startsWith('✅')) {
        return <p className="text-[#46E363] flex items-start gap-2 text-sm leading-relaxed mb-4"><span>{children}</span></p>;
      }
      if (text?.startsWith('🔍')) {
        return <p className="text-[#79C0FF] flex items-start gap-2 text-sm leading-relaxed mb-4"><span>{children}</span></p>;
      }
      return <p className="text-[#C9D1D9] text-sm leading-relaxed mb-4">{children}</p>;
    },
    blockquote: ({ children, ...props }: any) => {
      const text = getTextFromChildren(children);
      if (text?.includes('NOTE:')) {
        return (
          <blockquote className="border-l-4 border-[#E3B341] bg-[#E3B341]/10 py-3 px-4 rounded-r-lg my-4 text-sm text-[#C9D1D9]">
            {children}
          </blockquote>
        );
      }
      return (
        <blockquote className="border-l-4 border-[#A371F7] bg-[#A371F7]/10 py-2 px-4 rounded-r-lg my-4 text-sm text-[#C9D1D9]">
          {children}
        </blockquote>
      );
    },
    h2: ({ children, ...props }: any) => <h2 className="text-sm font-bold text-[#58A6FF] uppercase tracking-widest mb-4 mt-10 first:mt-0 border-b border-[#30363D] pb-2">{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 className="text-xs font-bold text-[#E3B341] uppercase tracking-wider mb-2 mt-8">{children}</h3>,
    hr: () => <hr className="border-[#21262D] my-6" />,
    strong: ({ children, ...props }: any) => {
      const text = getTextFromChildren(children);
      const isBoldItalic = props.node?.children?.[0]?.italic;
      if (isBoldItalic || text?.includes('***')) {
        return <strong className="bg-[#E3B341]/30 text-[#E3B341] px-1.5 py-0.5 rounded font-bold italic">{children}</strong>;
      }
      return <strong className="bg-[#E3B341]/20 text-[#E3B341] px-1.5 py-0.5 rounded font-bold">{children}</strong>;
    },
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-[#0D1117] pb-20">
        <header className="bg-[#161B22] border-b border-[#30363D] sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-[#21262D] border border-[#30363D] rounded-md animate-pulse" />
              <div className="h-5 w-48 bg-[#21262D] rounded animate-pulse" />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI is running… fun rotating one-liner */}
          <div className="col-span-1 lg:col-span-12">
            <AiLoadingNote />
          </div>
          {/* Left skeleton */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 shadow-xl">
              <div className="h-3 w-20 bg-[#21262D] rounded animate-pulse mb-4" />
              <div className="space-y-3 mb-6">
                <div className="h-3 w-full bg-[#21262D] rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-[#21262D] rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-[#21262D] rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="h-16 bg-[#0D1117] border border-[#30363D] rounded animate-pulse" />
                <div className="h-16 bg-[#0D1117] border border-[#30363D] rounded animate-pulse" />
                <div className="h-16 bg-[#0D1117] border border-[#30363D] rounded col-span-2 animate-pulse" />
              </div>
              <div className="h-10 w-32 bg-[#21262D] rounded animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-6 w-24 bg-[#21262D] rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-[#21262D] rounded animate-pulse" />
                  <div className="h-5 w-20 bg-[#21262D] rounded animate-pulse" />
                  <div className="h-5 w-14 bg-[#21262D] rounded animate-pulse" />
                </div>
              </div>
            </div>
          </aside>

          {/* Center skeleton */}
          <section className="lg:col-span-6 space-y-6">
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 shadow-2xl">
              <div className="h-5 w-48 bg-[#21262D] rounded animate-pulse mb-4" />
              <div className="space-y-2 mb-8">
                <div className="h-3 w-full bg-[#21262D] rounded animate-pulse" />
                <div className="h-3 w-full bg-[#21262D] rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-[#21262D] rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-[#21262D] rounded animate-pulse" />
              </div>
              <div className="h-5 w-36 bg-[#21262D] rounded animate-pulse mb-4" />
              <div className="space-y-4 relative pl-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#21262D] border-4 border-[#161B22] animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 bg-[#21262D] rounded animate-pulse" />
                      <div className="h-3 w-48 bg-[#21262D] rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right skeleton */}
          <aside className="lg:col-span-3 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 shadow-lg text-center">
                <div className="h-3 w-28 bg-[#21262D] rounded animate-pulse mx-auto mb-3" />
                <div className="h-48 bg-[#21262D] rounded animate-pulse" />
              </div>
            ))}
          </aside>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-screen bg-[#0D1117] flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4">
        <div className="bg-[#F85149]/20 text-[#F85149] p-6 rounded-xl border border-[#F85149]/50 mb-6 w-full shadow-[0_0_15px_rgba(248,81,73,0.1)]">
          <h2 className="font-bold text-lg mb-2 font-mono flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" aria-hidden="true"/> ANALYSIS FAILED
          </h2>
          <p className="font-mono text-sm">{error}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-[#8B949E] hover:text-white font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Go Back
          </button>
          <SettingsModal />
        </div>
      </div>
    );
  }

  if (!githubData || !assessment) return null;

  // Language Chart — data from repo primary language metadata (zero API calls)
  const COLORS = ['#F1E05A', '#3178C6', '#E34C26', '#563D7C', '#3572A5', '#B07219'];
  const langData = Object.keys(githubData.languages).map((key, index) => ({
    name: key,
    value: githubData.languages[key],
    color: COLORS[index % COLORS.length]
  })).sort((a, b) => b.value - a.value).slice(0, 6); // Top 6

  const strengthRadarData = [
    { subject: 'Creativity', A: assessment.metrics.creativity, fullMark: 100 },
    { subject: 'Potential', A: assessment.metrics.potential, fullMark: 100 },
    { subject: 'AI Usage', A: assessment.metrics.aiUsage, fullMark: 100 },
    { subject: 'Security', A: assessment.metrics.security, fullMark: 100 },
    { subject: 'Pro', A: assessment.metrics.professionalism, fullMark: 100 },
    { subject: 'Code', A: assessment.metrics.codeQuality, fullMark: 100 },
  ];

  const weaknessRadarData = [
    { subject: 'Buzzwords', A: assessment.weaknessMetrics.buzzwordDensity, fullMark: 100 },
    { subject: 'AI Slop', A: assessment.weaknessMetrics.aiSlop, fullMark: 100 },
    { subject: 'No Docs', A: assessment.weaknessMetrics.lackOfDocs, fullMark: 100 },
    { subject: 'Consistency', A: assessment.weaknessMetrics.inconsistency, fullMark: 100 },
    { subject: 'Arrogance', A: assessment.weaknessMetrics.arrogance, fullMark: 100 },
    { subject: 'Architecture', A: assessment.weaknessMetrics.poorArchitecture, fullMark: 100 },
  ];

  return (
    <div className="h-dvh flex flex-col bg-[#0D1117]">
      <header className="bg-[#161B22] border-b border-[#30363D] shrink-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} aria-label="Back to homepage" className="p-2 bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] rounded-md transition-colors text-[#C9D1D9]">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-lg text-white truncate font-mono">
                {githubData.name || githubData.username}
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${mode === 'employer' ? 'bg-[#238636] border-[#2EA043] text-white' : 'bg-[#1F6FEB]/20 border-[#1F6FEB]/50 text-[#58A6FF]'}`}>
                {mode === 'employer' ? 'Employer Mode' : 'Developer Mode'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#8B949E] font-mono">
            <span>REPOS: <span className="text-white">{githubData.publicRepos}</span></span>
            <span>FOLLOWERS: <span className="text-[#58A6FF]">{githubData.followers}</span></span>
            <a href="/help" aria-label="Help guide" className="p-1.5 bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] rounded-md transition-colors text-[#8B949E] hover:text-[#58A6FF]" title="Help & Guide">
              <HelpCircle className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      {showCompletenessWarning && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="bg-[#E3B341]/10 border border-[#E3B341]/30 rounded-xl p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-[#E3B341] text-lg leading-none mt-0.5" aria-hidden="true">⚠</span>
              <div>
                <p className="text-sm font-bold text-[#E3B341]">Some assessment sections may be incomplete</p>
                <p className="text-xs text-[#C9D1D9] mt-1">For best results, use Gemini 2.5 Flash (1M context) or a model with 32K+ context and high token output limits. <a href="/settings" className="text-[#58A6FF] hover:underline">Adjust settings</a></p>
              </div>
            </div>
            <button onClick={() => setShowCompletenessWarning(false)} className="p-1 hover:bg-[#E3B341]/20 rounded transition-colors text-[#E3B341]/60 hover:text-[#E3B341]" aria-label="Dismiss warning">
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-hidden max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* Left Sidebar: Profile & Hirability */}
        <aside className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto overscroll-behavior-contain">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 shadow-xl relative overflow-hidden group hover:border-[#8B949E] transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2EA043] via-[#58A6FF] to-[#8957E5]"></div>
            
            <div className="mb-4 pb-4 border-b border-[#30363D]">
              <span className="text-[10px] text-[#8B949E] font-bold uppercase tracking-widest block mb-1">GitHub Bio</span>
              <p className="text-xs text-[#C9D1D9] italic">
                {githubData.bio ? `"${githubData.bio}"` : "No bio provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-[#30363D]">
               <div className="bg-[#0D1117] border border-[#30363D] rounded p-2 text-center">
                  <span className="block text-[9px] text-[#8B949E] uppercase mb-1">Total Stars</span>
                  <span className="text-[#E3B341] font-bold text-sm font-mono">{githubData.totalStars}</span>
               </div>
               <div className="bg-[#0D1117] border border-[#30363D] rounded p-2 text-center">
                  <span className="block text-[9px] text-[#8B949E] uppercase mb-1">Merged PRs</span>
                  <span className="text-[#A371F7] font-bold text-sm font-mono">{githubData.totalPrs}</span>
               </div>
               <div className="bg-[#0D1117] border border-[#30363D] rounded p-2 text-center col-span-2">
                  <span className="block text-[9px] text-[#8B949E] uppercase mb-1">Account Age</span>
                  <span className="text-[#58A6FF] font-bold text-sm font-mono">{Math.max(0, new Date().getFullYear() - new Date(githubData.createdAt).getFullYear())} Years</span>
               </div>
            </div>

            <div className="flex flex-col mb-4">
              <h1 className="text-xs font-bold uppercase tracking-widest text-[#8B949E] mb-1">Hirability Score</h1>
              <div className="flex items-end gap-1">
                <div className="text-6xl font-mono font-black text-white">{assessment.hirabilityScore > 10 ? (assessment.hirabilityScore / 10).toFixed(1) : parseFloat(assessment.hirabilityScore.toString()).toFixed(1)}</div>
                <div className="text-xl text-[#2EA043] font-mono pb-1">/ 10</div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[#8B949E] uppercase font-bold text-[10px] block mb-1">Suited Roles</span>
                <div className="flex gap-1 flex-wrap">
                  {assessment.hirabilityRoles?.map(r => (
                    <span key={r} className="px-2 py-0.5 bg-[#2EA043]/10 border border-[#2EA043]/30 text-[#46E363] rounded tracking-tight">{r}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[#8B949E] uppercase font-bold text-[10px] block mb-1">Not Suited</span>
                <div className="flex gap-1 flex-wrap">
                  {assessment.notSuitedRoles?.map(r => (
                    <span key={r} className="px-2 py-0.5 bg-[#F85149]/10 border border-[#F85149]/30 text-[#FF7B72] rounded tracking-tight">{r}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#30363D]">
              <span className="text-[#8B949E] uppercase font-bold text-[10px] block mb-2">Developer Tags</span>
              <div className="flex gap-2 flex-wrap">
                {assessment.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-[#1F2428] border border-[#30363D] text-[#C9D1D9] text-[10px] rounded uppercase font-bold tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            </div>

          {mode === 'employer' && (
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 shadow-lg">
              <button
                onClick={() => { setShowCompare(true); setComparisonResult(null); setSelectedForCompare([]); }}
                className="w-full flex items-center justify-center gap-2 bg-[#1F6FEB] hover:bg-[#388BFD] text-white text-xs font-bold py-3 px-4 rounded-lg transition-colors uppercase tracking-widest"
              >
                <GitCompare className="w-4 h-4" aria-hidden="true" /> Compare Candidates
                {savedCandidates.length > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{savedCandidates.length} saved</span>}
              </button>
            </div>
          )}

          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 shadow-lg">
            <h3 className="font-bold text-white text-xs uppercase mb-4 tracking-widest flex items-center gap-2"><Target className="w-4 h-4 text-[#58A6FF]" aria-hidden="true"/> Contact Graph</h3>
            <ul className="space-y-3 text-xs font-mono">
              <li className="flex justify-between items-center py-2 border-b border-[#30363D] last:border-0">
                <span className="text-[#8B949E]">GitHub</span>
                <a href={`https://github.com/${githubData.username}`} target="_blank" rel="noopener noreferrer" className="text-[#58A6FF] hover:underline font-bold">@{(githubData.username)}</a>
              </li>
              {githubData.blog && (
                <li className="flex justify-between items-center py-2 border-b border-[#30363D] last:border-0">
                  <span className="text-[#8B949E]">Website</span>
                  <a href={(githubData.blog.startsWith('http') ? githubData.blog : `https://${githubData.blog}`)} target="_blank" rel="noopener noreferrer" className="text-[#58A6FF] hover:underline font-bold max-w-[150px] truncate">{githubData.blog}</a>
                </li>
              )}
              {githubData.linkedinUrl && (
                <li className="flex justify-between items-center py-2 border-b border-[#30363D] last:border-0">
                  <span className="text-[#8B949E] flex items-center gap-1"><Linkedin className="w-3 h-3" aria-hidden="true"/> LinkedIn</span>
                  <a href={githubData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#58A6FF] hover:underline font-bold max-w-[150px] truncate">Profile</a>
                </li>
              )}
              {githubData.leetcodeUrl && (
                <li className="flex justify-between items-center py-2 border-b border-[#30363D] last:border-0">
                  <span className="text-[#8B949E] flex items-center gap-1"><Code2 className="w-3 h-3" aria-hidden="true"/> LeetCode</span>
                  <a href={githubData.leetcodeUrl} target="_blank" rel="noopener noreferrer" className="text-[#58A6FF] hover:underline font-bold max-w-[150px] truncate">Profile</a>
                </li>
              )}
              {githubData.instagramUrl && (
                <li className="flex justify-between items-center py-2 border-b border-[#30363D] last:border-0">
                  <span className="text-[#8B949E] flex items-center gap-1"><Instagram className="w-3 h-3" aria-hidden="true"/> Instagram</span>
                  <a href={githubData.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-[#58A6FF] hover:underline font-bold max-w-[150px] truncate">Profile</a>
                </li>
              )}
              {githubData.twitterUsername && (
                <li className="flex justify-between items-center py-2 border-b border-[#30363D] last:border-0">
                  <span className="text-[#8B949E] flex items-center gap-1"><Twitter className="w-3 h-3" aria-hidden="true"/> Twitter</span>
                  <a href={`https://twitter.com/${githubData.twitterUsername}`} target="_blank" rel="noopener noreferrer" className="text-[#58A6FF] hover:underline font-bold max-w-[150px] truncate">@{githubData.twitterUsername}</a>
                </li>
              )}
            </ul>
          </div>
        </aside>

        {/* Center Main: Detailed Report & SWOT */}
        <section className="lg:col-span-6 space-y-6 overflow-y-auto overscroll-behavior-contain">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2 font-mono uppercase tracking-widest"><Zap className="inline w-5 h-5 text-[#E3B341] pb-1" aria-hidden="true"/> Executive Summary</h2>
            <p className="text-[#C9D1D9] text-sm leading-relaxed mb-6">{assessment.summary}</p>

            <div className="mb-8 relative">
              <div className="flex items-center justify-between mb-4 border-b border-[#30363D] pb-2">
                 <h2 className="text-lg font-bold text-white font-mono uppercase tracking-widest">Career Timeline</h2>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#8B949E] uppercase tracking-widest">Growth Potential</span>
                    <div className="w-24 h-2 bg-[#0D1117] border border-[#30363D] rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-[#2EA043] to-[#58A6FF]" style={{ width: `${assessment.growthMeter}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-[#58A6FF]">{assessment.growthMeter}%</span>
                 </div>
              </div>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#30363D] before:to-transparent">
                {assessment.timeline && assessment.timeline.map((phase, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#161B22] bg-[#21262D] text-[#8B949E] group-hover:text-[#58A6FF] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                      <div className="w-2 h-2 bg-[#58A6FF] rounded-full"></div>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0D1117] border border-[#30363D] p-4 rounded-xl shadow">
                      <div className="flex items-center justify-between mb-1">
                         <h3 className="font-bold text-[#C9D1D9] text-sm">{phase.title}</h3>
                         <span className="text-[10px] text-[#58A6FF] font-mono px-2 py-0.5 bg-[#58A6FF]/10 rounded-full">{phase.year}</span>
                      </div>
                      <p className="text-xs text-[#8B949E]">{phase.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-lg font-bold text-white mb-4 font-mono uppercase tracking-widest border-b border-[#30363D] pb-2 mt-8">SWOT Analysis</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2EA043]/10 border border-[#2EA043]/30 rounded-lg p-4">
                <h4 className="text-[#46E363] text-xs font-bold uppercase mb-2">Strengths</h4>
                <ul className="text-xs text-[#C9D1D9] space-y-1 list-disc list-inside">
                  {assessment.swot.strengths?.map((t, idx) => <li key={idx} className="break-words">{t}</li>)}
                </ul>
              </div>
              <div className="bg-[#F85149]/10 border border-[#F85149]/30 rounded-lg p-4">
                <h4 className="text-[#FF7B72] text-xs font-bold uppercase mb-2">Weaknesses</h4>
                <ul className="text-xs text-[#C9D1D9] space-y-1 list-disc list-inside">
                  {assessment.swot.weaknesses?.map((t, idx) => <li key={idx} className="break-words">{t}</li>)}
                </ul>
              </div>
              <div className="bg-[#58A6FF]/10 border border-[#58A6FF]/30 rounded-lg p-4">
                <h4 className="text-[#79C0FF] text-xs font-bold uppercase mb-2">Opportunities</h4>
                <ul className="text-xs text-[#C9D1D9] space-y-1 list-disc list-inside">
                  {assessment.swot.opportunities?.map((t, idx) => <li key={idx} className="break-words">{t}</li>)}
                </ul>
              </div>
              <div className="bg-[#8957E5]/10 border border-[#8957E5]/30 rounded-lg p-4">
                <h4 className="text-[#A371F7] text-xs font-bold uppercase mb-2">Threats</h4>
                <ul className="text-xs text-[#C9D1D9] space-y-1 list-disc list-inside">
                  {assessment.swot.threats?.map((t, idx) => <li key={idx} className="break-words">{t}</li>)}
                </ul>
              </div>
            </div>

            {assessment.slopeAnalysis && (
              <>
                <h2 className="text-lg font-bold text-white mb-4 font-mono uppercase tracking-widest border-b border-[#30363D] pb-2 mt-8">Advanced AI Insights</h2>
                
                <div className="space-y-6">
                  {/* Slope Detection */}
                  <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4">
                    <h3 className="text-sm font-bold text-[#58A6FF] uppercase mb-3 flex items-center gap-2"><Target className="w-4 h-4" aria-hidden="true"/> Career Slope Detection</h3>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-[#161B22] border border-[#30363D] rounded p-2 text-center">
                        <span className="block text-[#8B949E] text-[10px] uppercase">Trajectory</span>
                        <span className="text-[#C9D1D9] text-xs font-bold">{assessment.slopeAnalysis.slopeTrajectory}</span>
                      </div>
                      <div className="bg-[#161B22] border border-[#30363D] rounded p-2 text-center">
                        <span className="block text-[#8B949E] text-[10px] uppercase">Consistency</span>
                        <span className="text-[#C9D1D9] text-xs font-bold">{assessment.slopeAnalysis.consistencyRating}</span>
                      </div>
                      <div className="bg-[#161B22] border border-[#30363D] rounded p-2 text-center">
                        <span className="block text-[#8B949E] text-[10px] uppercase">Burnout Risk</span>
                        <span className="text-[#C9D1D9] text-xs font-bold">{assessment.slopeAnalysis.burnoutRisk}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#8B949E]">{assessment.slopeAnalysis.analysisSummary}</p>
                  </div>

                  {/* Buzzword Analyzer */}
                  <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4">
                    <h3 className="text-sm font-bold text-[#E3B341] uppercase mb-3 flex items-center gap-2"><Zap className="w-4 h-4" aria-hidden="true"/> Buzzword vs Reality</h3>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-[#C9D1D9]"><strong>Verdict:</strong> {assessment.buzzwordAnalysis.verdict}</span>
                      <span className="text-[10px] bg-[#161B22] border border-[#30363D] px-2 py-1 rounded">Ratio: {assessment.buzzwordAnalysis.buzzwordToRealityRatio.toFixed(1)}/10</span>
                    </div>
                    <p className="text-xs text-[#8B949E] italic mb-3">&quot;{assessment.buzzwordAnalysis.roastOrPraise}&quot;</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-[#8B949E] uppercase block mb-1">Detected Buzzwords</span>
                        <div className="flex flex-wrap gap-1">
                          {assessment.buzzwordAnalysis.buzzwordsDetected?.map((b, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 bg-[#F85149]/10 text-[#FF7B72] border border-[#F85149]/20 rounded">{b}</span>)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8B949E] uppercase block mb-1">Actual Stack</span>
                        <div className="flex flex-wrap gap-1">
                          {assessment.buzzwordAnalysis.actualTechStack?.map((b, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 bg-[#2EA043]/10 text-[#46E363] border border-[#2EA043]/20 rounded">{b}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Behavioral Analysis */}
                  <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4">
                    <h3 className="text-sm font-bold text-[#A371F7] uppercase mb-3 flex items-center gap-2"><Shield className="w-4 h-4" aria-hidden="true"/> Arrogance vs Confidence</h3>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                       <div className="flex items-center justify-between bg-[#161B22] border border-[#30363D] rounded p-2">
                        <span className="text-[#8B949E] text-[10px] uppercase">Confidence</span>
                        <span className="text-[#58A6FF] text-xs font-bold">{assessment.behavioralAnalysis.confidenceScore}/10</span>
                       </div>
                       <div className="flex items-center justify-between bg-[#161B22] border border-[#30363D] rounded p-2">
                        <span className="text-[#8B949E] text-[10px] uppercase">Arrogance</span>
                        <span className="text-[#F85149] text-xs font-bold">{assessment.behavioralAnalysis.arroganceScore}/10</span>
                       </div>
                    </div>
                    <p className="text-xs text-[#C9D1D9] mb-2"><strong>Archetype:</strong> {assessment.behavioralAnalysis.primaryArchetype}</p>
                    <p className="text-xs text-[#8B949E] mb-3">{assessment.behavioralAnalysis.vibeCheck}</p>
                    <div>
                        <span className="text-[10px] text-[#8B949E] uppercase block mb-1">Behavioral Flags</span>
                        <ul className="text-[10px] text-[#C9D1D9] space-y-1 list-disc list-inside">
                          {assessment.behavioralAnalysis.behavioralFlags?.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>

          {/* Per-Repo Assessment */}
          {assessment.repoAssessments && assessment.repoAssessments.length > 0 && (
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 shadow-2xl">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest font-mono mb-4 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#58A6FF]" aria-hidden="true" /> Per-Repo Assessment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessment.repoAssessments.map((repo, idx) => {
                  const scoreColor = repo.repoScore >= 7 ? 'text-[#46E363]' : repo.repoScore >= 4 ? 'text-[#E3B341]' : 'text-[#FF7B72]';
                  const verdictColor = repo.repoScore >= 7 ? 'bg-[#2EA043]/10 border-[#2EA043]/30 text-[#46E363]' : repo.repoScore >= 4 ? 'bg-[#E3B341]/10 border-[#E3B341]/30 text-[#E3B341]' : 'bg-[#F85149]/10 border-[#F85149]/30 text-[#FF7B72]';
                  return (
                    <div key={idx} className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4 hover:border-[#8B949E] transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Code2 className="w-4 h-4 text-[#8B949E] shrink-0" aria-hidden="true" />
                          <a
                            href={`https://github.com/${username}/${repo.repoName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-[#58A6FF] hover:underline truncate"
                          >
                            {repo.repoName}
                          </a>
                          <ExternalLink className="w-3 h-3 text-[#8B949E] shrink-0" aria-hidden="true" />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-lg font-mono font-black ${scoreColor}`}>{(repo.repoScore ?? 0).toFixed(1)}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${verdictColor}`}>{repo.repoVerdict || 'N/A'}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#8B949E] leading-relaxed">{repo.repoAnalysis}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-[#161B22] border border-[#30363D] rounded-xl flex flex-col shadow-2xl overflow-hidden h-full md:min-h-[800px]">
            <div className="p-4 border-b border-[#30363D] bg-[#21262D] sticky top-0 z-10 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest font-mono">
                Detailed Assessment Output
              </h2>
              <span className="text-[10px] text-[#8B949E] px-2 py-1 bg-[#0D1117] border border-[#30363D] rounded-full">RAW LOG</span>
            </div>
            <div className="p-6 overflow-y-auto w-full custom-scrollbar">
              <div className="text-sm leading-relaxed">
                <ReactMarkdown components={markdownComponents}>{assessment.detailedReport?.replace(/\\n/g, '\n\n') || ''}</ReactMarkdown>
              </div>
            </div>
          </div>

          {assessment.mentorshipPlan && mode === 'developer' && (
            <div className="bg-[#161B22] border border-[#1F6FEB]/50 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-[#1F6FEB]/30 bg-[#1F6FEB]/10 sticky top-0 z-10 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#58A6FF]" aria-hidden="true" />
                <h2 className="text-sm font-bold text-white uppercase tracking-widest font-mono">Mentorship & Upgrade Plan</h2>
              </div>
              <div className="p-6">
                <div className="text-sm leading-relaxed">
                  <ReactMarkdown components={markdownComponents}>{assessment.mentorshipPlan}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

        </section>

        {/* Right Sidebar: Radars & Langs & Ask */}
        <aside className="lg:col-span-3 space-y-6 overflow-y-auto overscroll-behavior-contain">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 shadow-lg text-center">
            <h3 className="font-bold text-white text-xs uppercase mb-1 tracking-widest"><Shield className="w-4 h-4 inline pb-0.5 text-[#2EA043]" aria-hidden="true"/> Core Competencies</h3>
            <p className="text-[10px] text-[#8B949E] mb-2">Capabilities based on profile</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={60} data={strengthRadarData}>
                  <PolarGrid stroke="#30363D" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#8B949E', fontSize: 10 }} />
                  <Radar name="Strength" dataKey="A" stroke="#2EA043" fill="#2EA043" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', borderColor: '#30363D', color: '#fff' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 shadow-lg text-center">
            <h3 className="font-bold text-[#FF7B72] text-xs uppercase mb-1 tracking-widest"><AlertTriangle className="w-4 h-4 inline pb-0.5" aria-hidden="true"/> Risk Factors</h3>
            <p className="text-[10px] text-[#8B949E] mb-2">Vulnerabilities in behavior/code</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={60} data={weaknessRadarData}>
                  <PolarGrid stroke="#30363D" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#8B949E', fontSize: 10 }} />
                  <Radar name="Weakness" dataKey="A" stroke="#F85149" fill="#F85149" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', borderColor: '#30363D', color: '#fff' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 shadow-lg">
            <h3 className="font-bold text-white text-xs uppercase mb-1 tracking-widest text-center">Language Distribution</h3>
            {langData.length > 0 ? (
              <div className="h-48 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={langData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {langData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#161B22', borderColor: '#30363D', color: '#fff' }} formatter={(value: any) => { const n = Number(value); return [n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n) + ' repo' + (n === 1 ? '' : 's'), 'Repos']; }} />
                    <Legend wrapperStyle={{ fontSize: '10px', color: '#8B949E' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-[#8B949E] text-xs text-center mt-4">No language data.</p>
            )}
          </div>

          <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4 border-dashed relative">
            <h3 className="font-bold text-white mb-2 uppercase text-[11px] tracking-widest font-mono text-[#E3B341]">Consult the AI</h3>
            <p className="text-[10px] text-[#8B949E] mb-4 leading-relaxed">Ask specific questions about this developer&apos;s suitability for a role or specific tech stacks.</p>
              <form onSubmit={handleAskQuestion} className="relative">
              <input 
                type="text" 
                name="custom-question"
                autoComplete="off"
                spellCheck={false}
                aria-label="Ask a custom question about this developer"
                value={customQuestion}
                onChange={e => setCustomQuestion(e.target.value)}
                placeholder="Good fit for Startup CTO?…"
                className="w-full bg-[#161B22] border border-[#30363D] text-[11px] rounded py-3 pl-3 pr-10 outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF] text-white focus:border-[#58A6FF] transition-colors placeholder-[#484F58]"
                disabled={askingQuestion}
              />
              <button 
                type="submit" 
                disabled={askingQuestion || !customQuestion.trim()}
                className="absolute right-2 top-2 text-[#58A6FF] disabled:opacity-50 hover:text-white transition-colors"
               >
                {askingQuestion ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
              </button>
            </form>
          </div>
        </aside>

      </main>

      {showCompare && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center pt-8 pb-8 overflow-y-auto" style={{ overscrollBehaviorY: 'contain' }}>
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#161B22] z-10 p-4 border-b border-[#30363D] flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-[#58A6FF]" aria-hidden="true" /> Compare Candidates
              </h2>
              <button onClick={() => setShowCompare(false)} aria-label="Close compare modal" className="p-1.5 bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] rounded-md transition-colors text-[#C9D1D9]">
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6">
              {!comparisonResult ? (
                <>
                  <p className="text-xs text-[#8B949E] mb-4">Select up to 5 candidates to compare side by side.</p>
                  
                  {savedCandidates.length === 0 ? (
                    <p className="text-[#F85149] text-sm">No candidates saved yet. Assess some profiles first.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                      {savedCandidates.map((c) => {
                        const selected = selectedForCompare.includes(c.username);
                        const disabled = !selected && selectedForCompare.length >= 5;
                        return (
                          <button
                            key={c.username}
                            onClick={() => {
                              setSelectedForCompare(prev =>
                                selected ? prev.filter(u => u !== c.username) : [...prev, c.username]
                              );
                            }}
                            disabled={disabled && !selected}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors duration-300 ${
                              selected
                                ? 'bg-[#1F6FEB]/20 border-[#1F6FEB] text-white'
                                : 'bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:border-[#8B949E] disabled:opacity-30'
                            }`}
                          >
                            <img src={c.avatarUrl} alt={c.username} width={48} height={48} loading="lazy" className="w-12 h-12 rounded-full border-2 border-[#30363D]" />
                            <span className="text-xs font-bold truncate max-w-full">@{c.username}</span>
                            <span className="text-[10px] font-mono">{(c.assessment.hirabilityScore ?? 0).toFixed(1)}/10</span>
                            {selected && <Check className="w-4 h-4 text-[#58A6FF]" aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="border-t border-[#30363D] pt-4 mb-4">
                    <p className="text-xs text-[#8B949E] mb-2">Or add a new developer to compare:</p>
                    <div className="flex gap-2">
                      <input
                        value={newCompareUser}
                        onChange={e => setNewCompareUser(e.target.value)}
                        placeholder="GitHub username"
                        name="new-compare-user"
                        autoComplete="off"
                        spellCheck={false}
                        aria-label="GitHub username to compare"
                        className="flex-1 bg-[#0D1117] border border-[#30363D] text-xs rounded-lg py-2.5 px-3 outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF] text-white focus:border-[#58A6FF] transition-colors placeholder-[#484F58]"
                        onKeyDown={e => e.key === 'Enter' && handleAddToCompare()}
                        disabled={addingToCompare}
                      />
                      <button
                        onClick={handleAddToCompare}
                        disabled={addingToCompare || !newCompareUser.trim() || selectedForCompare.length >= 5}
                        className="bg-[#238636] hover:bg-[#2EA043] disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors uppercase tracking-widest flex items-center gap-2 whitespace-nowrap"
                      >
                        {addingToCompare ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ExternalLink className="w-3 h-3" aria-hidden="true" />}
                        Assess & Add
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <input
                      value={compareQuestion}
                      onChange={e => setCompareQuestion(e.target.value)}
                      placeholder="Ask AI: which candidate is best for a specific role?"
                      name="compare-question"
                      autoComplete="off"
                      spellCheck={false}
                      aria-label="Question for candidate comparison"
                      className="flex-1 bg-[#0D1117] border border-[#30363D] text-xs rounded-lg py-2.5 px-3 outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF] text-white focus:border-[#58A6FF] transition-colors placeholder-[#484F58]"
                    />
                    <button
                      onClick={async () => {
                        if (selectedForCompare.length < 2) return;
                        setComparing(true);
                        try {
                          const selected = savedCandidates.filter(c => selectedForCompare.includes(c.username));
                          const result = await compareCandidates(selected, settings, compareQuestion);
                          setComparisonResult(result);
                        } catch (err: any) {
                          alert("Comparison failed: " + err.message);
                        } finally {
                          setComparing(false);
                        }
                      }}
                      disabled={selectedForCompare.length < 2 || comparing}
                      className="bg-[#1F6FEB] hover:bg-[#388BFD] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors uppercase tracking-widest"
                    >
                      {comparing ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : `Compare ${selectedForCompare.length} Candidates`}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={`mb-6 p-4 rounded-xl border text-sm font-bold text-center ${
                    (comparisonResult.verdict || '').toLowerCase().includes('ineligible')
                      ? 'bg-[#F85149]/20 border-[#F85149]/50 text-[#FF7B72]'
                      : 'bg-[#2EA043]/20 border-[#2EA043]/50 text-[#46E363]'
                  }`}>
                    {comparisonResult.verdict}
                  </div>

                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left text-[#8B949E] uppercase tracking-widest font-bold p-3 border-b border-[#30363D] w-32">Parameter</th>
                          {comparisonResult.candidates.map(c => (
                            <th key={c.username} className="text-center p-3 border-b border-[#30363D]">
                              <div className="flex flex-col items-center gap-1">
                                <img src={savedCandidates.find(s => s.username === c.username)?.avatarUrl || ''} alt={c.username} width={40} height={40} loading="lazy" className="w-10 h-10 rounded-full border-2 border-[#30363D]" />
                                <span className="text-[#58A6FF] font-bold">@{c.username}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-[#30363D]">
                          <td className="p-3 text-[#46E363] font-bold uppercase tracking-wider">Strengths</td>
                          {comparisonResult.candidates.map(c => (
                            <td key={c.username} className="p-3"><ul className="list-disc list-inside text-[#C9D1D9] space-y-0.5">{c.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></td>
                          ))}
                        </tr>
                        <tr className="border-b border-[#30363D]">
                          <td className="p-3 text-[#FF7B72] font-bold uppercase tracking-wider">Weaknesses</td>
                          {comparisonResult.candidates.map(c => (
                            <td key={c.username} className="p-3"><ul className="list-disc list-inside text-[#C9D1D9] space-y-0.5">{c.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul></td>
                          ))}
                        </tr>
                        <tr className="border-b border-[#30363D]">
                          <td className="p-3 text-[#E3B341] font-bold uppercase tracking-wider">Potential</td>
                          {comparisonResult.candidates.map(c => (
                            <td key={c.username} className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-lg font-mono font-black text-white">{c.potential}</span>
                                <span className="text-[10px] text-[#8B949E]">/100</span>
                              </div>
                              <div className="w-full h-1.5 bg-[#0D1117] rounded-full mt-1">
                                <div className="h-full bg-gradient-to-r from-[#2EA043] to-[#58A6FF] rounded-full" style={{ width: `${c.potential}%` }}></div>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-[#30363D]">
                          <td className="p-3 text-[#58A6FF] font-bold uppercase tracking-wider">Best Role</td>
                          {comparisonResult.candidates.map(c => (
                            <td key={c.username} className="p-3 text-center"><span className="px-2 py-1 bg-[#2EA043]/10 border border-[#2EA043]/30 text-[#46E363] rounded text-[10px] font-bold">{c.bestSuitedRole}</span></td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-3 text-[#F85149] font-bold uppercase tracking-wider">Worst Role</td>
                          {comparisonResult.candidates.map(c => (
                            <td key={c.username} className="p-3 text-center"><span className="px-2 py-1 bg-[#F85149]/10 border border-[#F85149]/30 text-[#FF7B72] rounded text-[10px] font-bold">{c.worstSuitedRole}</span></td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {comparisonResult.overallRanking.length > 0 && (
                    <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4 mb-4">
                      <h3 className="text-xs font-bold text-[#E3B341] uppercase tracking-widest mb-3">Combined Ranking</h3>
                      <ul className="space-y-2">
                        {comparisonResult.overallRanking.map((r, i) => (
                          <li key={i} className="flex items-center gap-3 text-xs text-[#C9D1D9]">
                            <span className="w-6 h-6 rounded-full bg-[#1F6FEB] text-white font-bold flex items-center justify-center text-[10px]">{i + 1}</span>
                            <span className="font-bold text-[#58A6FF]">@{r.username}</span>
                            <span className="text-[#8B949E]">—</span>
                            <span>{r.recommendedFor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <input
                      value={compareQuestion}
                      onChange={e => setCompareQuestion(e.target.value)}
                      placeholder="Ask AI a follow-up about these candidates…"
                      name="compare-followup"
                      autoComplete="off"
                      spellCheck={false}
                      aria-label="Follow-up question about candidates"
                      className="flex-1 bg-[#0D1117] border border-[#30363D] text-xs rounded-lg py-2.5 px-3 outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF] text-white focus:border-[#58A6FF] transition-colors placeholder-[#484F58]"
                    />
                    <button
                      onClick={async () => {
                        setComparing(true);
                        try {
                          const selected = savedCandidates.filter(c => selectedForCompare.includes(c.username));
                          const result = await compareCandidates(selected, settings, compareQuestion);
                          setComparisonResult(result);
                        } catch (err: any) {
                          alert("Comparison failed: " + err.message);
                        } finally {
                          setComparing(false);
                        }
                      }}
                      disabled={comparing}
                      className="bg-[#1F6FEB] hover:bg-[#388BFD] disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors uppercase tracking-widest flex items-center gap-2"
                    >
                      {comparing ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-3 h-3" aria-hidden="true" />} Ask AI
                    </button>
                    <button
                      onClick={() => setComparisonResult(null)}
                      className="text-[#8B949E] hover:text-white text-xs font-bold transition-colors uppercase tracking-widest"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <SettingsModal />
    </div>
  );
}

export default function Assessment() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D1117] flex justify-center items-center px-4">
        <AiLoadingNote variant="inline" />
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  );
}
