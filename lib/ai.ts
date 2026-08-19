import { GoogleGenAI, Type } from '@google/genai';
import { UserAssessmentData } from './github';
import { AppSettings } from './types';
import { checkSharedKeyLimit, recordSharedKeyCall } from './sharedKey';

export type AssessmentMode = 'employer' | 'developer';

export interface ProjectIdea {
  title: string;
  description: string;
  techStack: string[];
}

export interface MentorshipResult {
  mentorshipPlan: string;
  projectIdeas: ProjectIdea[];
}

export interface AssessmentResult {
  summary: string;
  tags: string[];
  timeline: {
    title: string;
    description: string;
    year: string;
  }[];
  growthMeter: number;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  metrics: {
    creativity: number;
    potential: number;
    aiUsage: number;
    security: number;
    professionalism: number;
    codeQuality: number;
  };
  weaknessMetrics: {
    buzzwordDensity: number;
    aiSlop: number;
    lackOfDocs: number;
    inconsistency: number;
    arrogance: number;
    poorArchitecture: number;
  };
  slopeAnalysis: {
    slopeTrajectory: string;
    slopeScore: number;
    consistencyRating: string;
    analysisSummary: string;
    burnoutRisk: string;
  };
  buzzwordAnalysis: {
    buzzwordsDetected: string[];
    actualTechStack: string[];
    buzzwordToRealityRatio: number;
    verdict: string;
    roastOrPraise: string;
  };
  behavioralAnalysis: {
    confidenceScore: number;
    arroganceScore: number;
    primaryArchetype: string;
    behavioralFlags: string[];
    vibeCheck: string;
  };
  hirabilityScore: number;
  hirabilityRoles: string[];
  notSuitedRoles: string[];
  detailedReport: string;
  mentorshipPlan?: string;
  projectIdeas: ProjectIdea[];
  repoAssessments: {
    repoName: string;
    repoScore: number;
    repoVerdict: string;
    repoAnalysis: string;
    keyHighlights: string[];
    redFlags: string[];
  }[];
}

export interface ComparisonCandidate {
  username: string;
  avatarUrl: string;
  assessment: AssessmentResult;
}

export interface ComparisonResult {
  candidates: {
    username: string;
    strengths: string[];
    weaknesses: string[];
    potential: number;
    bestSuitedRole: string;
    worstSuitedRole: string;
  }[];
  overallRanking: {
    username: string;
    recommendedFor: string;
  }[];
  verdict: string;
}

const ASSESSMENT_SYSTEM_PROMPT = "You are a professional GitHub Auditor. Tone: witty, analytical, brutally honest, slightly sarcastic (roast style). No mercy, no sugarcoating, no participation trophies — every profile gets the truth, served cold. NEVER soften a criticism by following it with praise of the same thing — no 'but', 'that said', 'to be fair', 'though'. Every verdict is committed and final; pick a lane per aspect and stay in it. YOU MUST OUTPUT ONLY VALID MINIFIED JSON. NO MARKDOWN OR HTML WRAPPERS.";
const COMPARISON_SYSTEM_PROMPT = "You are a professional GitHub Auditor comparing candidates. Tone: witty, analytical, brutally honest, slightly sarcastic (roast style). No mercy: weak candidates get roasted, ineligible candidates get rejected outright. OUTPUT ONLY VALID JSON.";

const assessmentSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    timeline: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, year: { type: Type.STRING } } } },
    growthMeter: { type: Type.NUMBER },
    swot: { type: Type.OBJECT, properties: { strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }, opportunities: { type: Type.ARRAY, items: { type: Type.STRING } }, threats: { type: Type.ARRAY, items: { type: Type.STRING } } } },
    metrics: { type: Type.OBJECT, properties: { creativity: { type: Type.NUMBER }, potential: { type: Type.NUMBER }, aiUsage: { type: Type.NUMBER }, security: { type: Type.NUMBER }, professionalism: { type: Type.NUMBER }, codeQuality: { type: Type.NUMBER } } },
    weaknessMetrics: { type: Type.OBJECT, properties: { buzzwordDensity: { type: Type.NUMBER }, aiSlop: { type: Type.NUMBER }, lackOfDocs: { type: Type.NUMBER }, inconsistency: { type: Type.NUMBER }, arrogance: { type: Type.NUMBER }, poorArchitecture: { type: Type.NUMBER } } },
    slopeAnalysis: { type: Type.OBJECT, properties: { slopeTrajectory: { type: Type.STRING }, slopeScore: { type: Type.NUMBER }, consistencyRating: { type: Type.STRING }, analysisSummary: { type: Type.STRING }, burnoutRisk: { type: Type.STRING } } },
    buzzwordAnalysis: { type: Type.OBJECT, properties: { buzzwordsDetected: { type: Type.ARRAY, items: { type: Type.STRING } }, actualTechStack: { type: Type.ARRAY, items: { type: Type.STRING } }, buzzwordToRealityRatio: { type: Type.NUMBER }, verdict: { type: Type.STRING }, roastOrPraise: { type: Type.STRING } } },
    behavioralAnalysis: { type: Type.OBJECT, properties: { confidenceScore: { type: Type.NUMBER }, arroganceScore: { type: Type.NUMBER }, primaryArchetype: { type: Type.STRING }, behavioralFlags: { type: Type.ARRAY, items: { type: Type.STRING } }, vibeCheck: { type: Type.STRING } } },
    hirabilityScore: { type: Type.NUMBER },
    hirabilityRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
    notSuitedRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
    detailedReport: { type: Type.STRING },
    mentorshipPlan: { type: Type.STRING },
    repoAssessments: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { repoName: { type: Type.STRING }, repoScore: { type: Type.NUMBER }, repoVerdict: { type: Type.STRING }, repoAnalysis: { type: Type.STRING }, keyHighlights: { type: Type.ARRAY, items: { type: Type.STRING } }, redFlags: { type: Type.ARRAY, items: { type: Type.STRING } } } } },
    projectIdeas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, techStack: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
  },
  required: ["summary", "tags", "timeline", "growthMeter", "swot", "metrics", "weaknessMetrics", "slopeAnalysis", "buzzwordAnalysis", "behavioralAnalysis", "hirabilityScore", "hirabilityRoles", "notSuitedRoles", "detailedReport", "repoAssessments", "projectIdeas"]
};

const comparisonSchema = {
  type: Type.OBJECT,
  properties: {
    candidates: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { username: { type: Type.STRING }, strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }, potential: { type: Type.NUMBER }, bestSuitedRole: { type: Type.STRING }, worstSuitedRole: { type: Type.STRING } } } },
    overallRanking: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { username: { type: Type.STRING }, recommendedFor: { type: Type.STRING } } } },
    verdict: { type: Type.STRING }
  }
};

const mentorshipSchema = {
  type: Type.OBJECT,
  properties: {
    mentorshipPlan: { type: Type.STRING },
    projectIdeas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, techStack: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
  },
  required: ["mentorshipPlan", "projectIdeas"]
};

const MENTORSHIP_SYSTEM_PROMPT = "You are a professional GitHub Auditor turned BRUTAL MENTOR. The assessment is already complete — your only job is to tell the developer exactly what to improve — code, repos, and presence — and what to build next. No re-scoring, no re-evaluating, no softening. Roast-style honesty: blunt, specific, actionable. Never contradict the assessment's verdicts and never walk back a criticism with 'but', 'that said', 'to be fair' — commit to every call. YOU MUST OUTPUT ONLY VALID MINIFIED JSON. NO MARKDOWN OR HTML WRAPPERS.";

async function callGemini(apiKey: string, model: string, systemMsg: string, userPrompt: string, schema: any): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  // Race against a hard timeout — a hung request must never leave the page
  // stuck on the loading animation forever.
  const response = await Promise.race([
    ai.models.generateContent({
      model,
      contents: userPrompt,
      config: { temperature: 0, topP: 1, topK: 1, systemInstruction: systemMsg, responseMimeType: "application/json", responseSchema: schema }
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini request timed out after 150s. Check your key and network, then try again.')), 150000)
    ),
  ]);
  return response.text || '{}';
}

async function callOllama(endpoint: string, model: string, systemMsg: string, userPrompt: string): Promise<string> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'ollama', prompt: userPrompt, systemInstruction: systemMsg, endpoint, model })
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Ollama API route error');
  }
  const result = await response.json();
  return result.response || '{}';
}

async function callAnthropic(endpoint: string, apiKey: string, model: string, systemMsg: string, userPrompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 150000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, system: systemMsg, messages: [{ role: 'user', content: userPrompt }], max_tokens: 16384, temperature: 0 }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Anthropic error (${response.status}): ${await response.text()}`);
    const data = await response.json();
    return data.content?.[0]?.text || '{}';
  } finally {
    clearTimeout(timeout);
  }
}

async function callOpenAICompatible(endpoint: string, apiKey: string, model: string, systemMsg: string, userPrompt: string): Promise<string> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'openai-compatible', prompt: userPrompt, systemInstruction: systemMsg, apiKey, model, endpoint })
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'API route error');
  }
  const result = await response.json();
  return result.response || '{}';
}

function getAISuggestion(error: Error, provider: string): string {
  // Shared-key errors are already written for the user — pass them through.
  if (provider === 'shared-gemini') return error.message;
  const msg = error.message.toLowerCase();
  if (msg.includes('timeout') || msg.includes('abort') || msg.includes('timed out')) {
    return `AI timed out. Switch to Gemini API or a larger local model like mistral or qwen2.5:7b.`;
  }
  if (msg.includes('413') || msg.includes('payload') || msg.includes('too large') || msg.includes('context length') || msg.includes('maximum context')) {
    return `Prompt exceeds context window. Switch to Gemini 3.6 Flash (1M tokens) or a model with 32K+ context.`;
  }
  if (msg.includes('json') || msg.includes('parse') || msg.includes('malformed')) {
    return `AI returned invalid JSON. Switch to Gemini API for native schema enforcement, or use a larger model.`;
  }
  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('api key')) {
    return `Authentication failed. Check your API key for ${provider}.`;
  }
  if (msg.includes('429') || msg.includes('rate limit')) {
    return `Rate limited by ${provider}. Wait and retry or switch providers.`;
  }
  if (msg.includes('echo') || msg.includes('input data')) {
    return `Model too small for this task. Switch to Gemini API or a larger local model.`;
  }
  return error.message;
}

// Errors worth rolling to the next shared key: traffic/quota overloads and
// bad-key auth failures. Anything else (malformed response, etc.) won't be
// fixed by switching keys, so it's rethrown immediately.
function isRetryableGeminiError(err: any): boolean {
  const msg = (err?.message || '').toLowerCase();
  return /429|500|502|503|529|resource_exhausted|quota|rate limit|rate_limit|overloaded|unavailable|too many requests|temporar|api key not valid|invalid api key|unauthorized|401/.test(msg);
}

async function callAI(settings: AppSettings, systemMsg: string, userPrompt: string, provider: 'assessment' | 'comparison' | 'mentorship'): Promise<string> {
  const providerType = settings.aiProvider;
  const schema = provider === 'assessment' ? assessmentSchema : provider === 'comparison' ? comparisonSchema : mentorshipSchema;
  switch (providerType) {
    case 'gemini': {
      const key = settings.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      if (!key) throw new Error('Gemini API key is required. No key? Star the repo on the home page to unlock the GitDeep Free Key.');
      return callGemini(key, settings.model || 'gemini-3.6-flash', systemMsg, userPrompt, schema);
    }
    case 'shared-gemini': {
      if (!settings.sharedKeyVerified || !settings.sharedKeyUsername) {
        throw new Error('GitDeep Free Key is locked — star the repository first. Open Settings → GitDeep Free Key to verify your star.');
      }
      const model = settings.model || 'gemini-3.6-flash';
      const estimatedTokens = Math.ceil((systemMsg.length + userPrompt.length) / 4);
      // Local budget check gives instant feedback without a round-trip; the
      // server proxy enforces the authoritative per-key budgets.
      const budget = checkSharedKeyLimit(estimatedTokens);
      if (!budget.allowed) throw new Error(budget.reason);
      const res = await fetch('/api/gemini-shared', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, systemInstruction: systemMsg, prompt: userPrompt, schema, estimatedTokens }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error || `Free Key request failed (${res.status}).`;
        // Traffic/quota failures (429/5xx/overloaded) mean "try again shortly";
        // anything else is a real config problem and gets passed through.
        if (isRetryableGeminiError({ message })) {
          throw new Error('GitDeep Free Key is overloaded right now — try again in a moment, or add your own key in Settings.');
        }
        throw new Error(message);
      }
      recordSharedKeyCall(estimatedTokens);
      return data.response || '{}';
    }
    case 'ollama': {
      if (!settings.apiEndpoint) throw new Error('Ollama endpoint is required.');
      return callOllama(settings.apiEndpoint, settings.model || 'llama3.2', systemMsg, userPrompt);
    }
    case 'anthropic': {
      if (!settings.apiKey) throw new Error('Anthropic API key is required.');
      if (!settings.apiEndpoint) throw new Error('Anthropic endpoint is required.');
      return callAnthropic(settings.apiEndpoint, settings.apiKey, settings.model || 'claude-sonnet-4-20250514', systemMsg, userPrompt);
    }
    default: {
      if (!settings.apiKey) throw new Error(`API key is required for ${providerType}.`);
      if (!settings.apiEndpoint) throw new Error(`API endpoint is required for ${providerType}.`);
      return callOpenAICompatible(settings.apiEndpoint, settings.apiKey, settings.model || 'gpt-4o', systemMsg, userPrompt);
    }
  }
}

export async function generateAssessment(
  data: UserAssessmentData, 
  settings: AppSettings, 
  mode: AssessmentMode,
  customQuestions: string = ''
): Promise<AssessmentResult> {
  const prompt = settings.promptSize === 'small' ? buildSmallPrompt(data, mode, customQuestions) : buildPrompt(data, mode, customQuestions);
  const rawResponse = await callAI(settings, ASSESSMENT_SYSTEM_PROMPT, prompt, 'assessment');

  try {
    const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    if (parsed.profile || parsed.topLanguages || parsed.recentRepos) {
      throw new Error('AI echoed input data instead of generating assessment');
    }
    
    const result = normalizeAssessment(parsed);
    const validation = validateAssessmentComplete(result);
    if (!validation.complete) {
      throw new Error(`Assessment incomplete: ${validation.reason}. Switch to Gemini 3.6 Flash or a model with 32K+ context for complete results.`);
    }
    return result;
  } catch (e: any) {
    const suggestion = getAISuggestion(e, settings.aiProvider);
    throw new Error(suggestion);
  }
}

function validateAssessmentComplete(result: AssessmentResult): { complete: boolean; reason: string } {
  const issues: string[] = [];
  if (!result.summary || result.summary.length < 20) issues.push('summary missing or too short');
  if (!result.detailedReport || result.detailedReport.length < 200) issues.push('detailed report truncated');
  if (!result.repoAssessments || result.repoAssessments.length === 0) issues.push('repo assessments missing');
  if (!result.timeline || result.timeline.length === 0) issues.push('career timeline missing');
  if (!result.hirabilityRoles || result.hirabilityRoles.length === 0) issues.push('hirability roles missing');
  if (!result.tags || result.tags.length === 0) issues.push('tags missing');

  // ALL FOUR SWOT quadrants are mandatory — a partial SWOT means the assessment
  // is incomplete, not that "no opportunities/threats exist".
  const swotQuadrants: Array<keyof AssessmentResult['swot']> = ['strengths', 'weaknesses', 'opportunities', 'threats'];
  const missingSwot = swotQuadrants.filter(k => !result.swot[k] || result.swot[k].length === 0);
  if (missingSwot.length > 0) {
    return {
      complete: false,
      reason: `SWOT incomplete — ${missingSwot.join(', ')} empty. All 4 SWOT quadrants (strengths, weaknesses, opportunities, threats) must be filled.`,
    };
  }

  if (issues.length >= 3) {
    return { complete: false, reason: issues.slice(0, 3).join('; ') };
  }
  return { complete: true, reason: '' };
}

function normalizeAssessment(raw: any): AssessmentResult {
  const m = (obj: any, defaults: Record<string, number>): Record<string, number> => {
    const d = { ...defaults };
    if (!obj || typeof obj !== 'object') return d;
    for (const key of Object.keys(defaults)) {
      if (typeof obj[key] === 'number') d[key] = obj[key];
    }
    return d;
  };
  return {
    summary: raw.summary || '',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
    growthMeter: typeof raw.growthMeter === 'number' ? raw.growthMeter : 50,
    swot: {
      strengths: Array.isArray(raw.swot?.strengths) ? raw.swot.strengths : [],
      weaknesses: Array.isArray(raw.swot?.weaknesses) ? raw.swot.weaknesses : [],
      opportunities: Array.isArray(raw.swot?.opportunities) ? raw.swot.opportunities : [],
      threats: Array.isArray(raw.swot?.threats) ? raw.swot.threats : [],
    },
    metrics: m(raw.metrics, { creativity: 50, potential: 50, aiUsage: 50, security: 50, professionalism: 50, codeQuality: 50 }) as AssessmentResult['metrics'],
    weaknessMetrics: m(raw.weaknessMetrics, { buzzwordDensity: 50, aiSlop: 50, lackOfDocs: 50, inconsistency: 50, arrogance: 50, poorArchitecture: 50 }) as AssessmentResult['weaknessMetrics'],
    slopeAnalysis: raw.slopeAnalysis ? { ...{ slopeTrajectory: 'Unknown', slopeScore: 5, consistencyRating: 'Unknown', analysisSummary: '', burnoutRisk: 'Unknown' }, ...raw.slopeAnalysis } : { slopeTrajectory: 'Unknown', slopeScore: 5, consistencyRating: 'Unknown', analysisSummary: '', burnoutRisk: 'Unknown' },
    buzzwordAnalysis: raw.buzzwordAnalysis ? { ...{ buzzwordsDetected: [], actualTechStack: [], buzzwordToRealityRatio: 5, verdict: '', roastOrPraise: '' }, ...raw.buzzwordAnalysis, buzzwordToRealityRatio: Math.min(10, Math.max(0, typeof raw.buzzwordAnalysis?.buzzwordToRealityRatio === 'number' ? raw.buzzwordAnalysis.buzzwordToRealityRatio : 5)) } : { buzzwordsDetected: [], actualTechStack: [], buzzwordToRealityRatio: 5, verdict: '', roastOrPraise: '' },
    behavioralAnalysis: raw.behavioralAnalysis ? { ...{ confidenceScore: 5, arroganceScore: 5, primaryArchetype: 'Unknown', behavioralFlags: [], vibeCheck: '' }, ...raw.behavioralAnalysis } : { confidenceScore: 5, arroganceScore: 5, primaryArchetype: 'Unknown', behavioralFlags: [], vibeCheck: '' },
    hirabilityScore: typeof raw.hirabilityScore === 'number' ? raw.hirabilityScore : 5,
    hirabilityRoles: Array.isArray(raw.hirabilityRoles) ? raw.hirabilityRoles : [],
    notSuitedRoles: Array.isArray(raw.notSuitedRoles) ? raw.notSuitedRoles : [],
    detailedReport: raw.detailedReport || '',
    mentorshipPlan: raw.mentorshipPlan,
    projectIdeas: Array.isArray(raw.projectIdeas) ? raw.projectIdeas.map((p: any) => ({
      title: p.title || '',
      description: p.description || '',
      techStack: Array.isArray(p.techStack) ? p.techStack : [],
    })) : [],
    repoAssessments: Array.isArray(raw.repoAssessments) ? raw.repoAssessments.map((r: any) => ({
      repoName: r.repoName || '',
      repoScore: typeof r.repoScore === 'number' ? r.repoScore : 5,
      repoVerdict: r.repoVerdict || '',
      repoAnalysis: r.repoAnalysis || '',
      keyHighlights: Array.isArray(r.keyHighlights) ? r.keyHighlights : [],
      redFlags: Array.isArray(r.redFlags) ? r.redFlags : [],
    })) : [],
  };
}

function buildPrompt(data: UserAssessmentData, mode: AssessmentMode, customQuestions: string): string {
  const userJson = JSON.stringify({
    profile: {
      name: data.name,
      username: data.username,
      bio: data.bio,
      company: data.company,
      location: data.location,
      blog: data.blog,
      email: data.email,
      twitterUsername: data.twitterUsername,
      hireable: data.hireable,
      followers: data.followers,
      following: data.following,
      publicRepos: data.publicRepos,
      createdAt: data.createdAt,
      totalStars: data.totalStars,
      totalMergedPRs: data.totalPrs,
    },
    topLanguages: data.languages,
    recentRepos: data.repos.map(r => ({
      name: r.name,
      url: r.url,
      description: r.description,
      stars: r.stars,
      forks: r.forks,
      language: r.language,
      topics: r.topics,
      isFork: r.isFork,
      hasReadme: r.hasReadme,
      readmeSnippet: r.readmeContent,
      hasLicense: r.hasLicense,
      licenseName: r.licenseName,
      defaultBranch: r.defaultBranch,
      updatedAt: r.updatedAt
    })),
    pullRequestsInOtherRepos: data.pullRequests
  }, null, 2);

  let basePrompt = `Analyze the following GitHub profile data:
  
${userJson}

---

## STAGE CONTEXT — INFORMATION ONLY, NEVER AN EXCUSE

Infer the developer's career stage from account age, bio, and activity (beginner / student / senior student / professional). Use it to decide WHAT to inspect and WHAT to roast — NEVER to lower the bar. There is no lenience anywhere in this audit. No participation trophies. A one-week-old account full of tutorial clones gets roasted just as hard as a five-year account full of todo apps. The stage only changes the flavor of the criticism, not the standards:

- **Beginner (<1 year account, <10 repos):** Zero original work, pure forks, no README anywhere, no sign of curiosity — call it out by name. A tutorial clone as the ONLY repo is not a portfolio, it is homework.
- **Student (1–3 year account, still learning):** Still only tutorial clones, zero deployment attempts, stagnant language stack — say it plainly. Some original projects and one decent README are the minimum expected; below that is a failing grade.
- **Senior student (3–5 year account with student signals):** No deployed project, no architecture thinking (just index.js and style.css), flagship repo with no meaningful README, zero external contributions — no mercy. The bar is real jobs now.
- **Professional (5+ year account, or company in bio, or references to real jobs):** Full professional standards — consistent activity, external PRs, production-grade repos, strong documentation. Anything less gets flagged hard.

Hirability is ALWAYS judged against real job standards — the same threshold for a student, a senior, and a first-year. "Tried their best" is the minimum, not a compliment. A first-year student applying for an internship clears the exact same bar as anyone else.

---

## CORE ASSESSMENT RULES

1. **Slope Detection:** Calculate the trajectory of their career from account creation to recent activity. Options: Rising Star, Steady Maintainer, Declining Activity, or Sporadic/Spiky. Assess burnout risk based on activity volume and gaps.

2. **Buzzword vs Reality:** Compare hype words (AI, LLM, Web3, Full-Stack, etc.) in bio/READMEs against the ACTUAL tech stack they write in (language stats + repo contents). Call it out directly — no softening. A bio claiming "AI Engineer" with only HTML/CSS repos is embarrassing and you should say so. Rate buzzwordToRealityRatio on a 0–10 scale (0 = all talk, no substance; 10 = perfect match between claims and code). Never exceed 10.

3. **Arrogance vs Confidence:** Analyze their vibe from PRs, READMEs, and bio. Confidence = assertive, constructive ("Please follow the contribution guidelines"). Arrogance = condescending, combative ("This is the ONLY correct way", gatekeeping). Assign behavioral flags. Don't soften toxic patterns.

4. **AI Usage Quality — DISTINGUISH SLOP FROM ORCHESTRATION:** Look for AI slop signals: excessive slash comments, generic purple/blue CSS gradients, cookie-cutter Tailwind patterns, broken links, heavy emoji spam in READMEs, buzzword salads with no technical depth. BUT — also detect genuine AI orchestration: intentional tech stack choices, production-grade architecture, ability to guide AI toward real results. If the latter is present, call it a strength explicitly with a ### 🤖 AI Partnership Assessment section in the detailedReport. This positively affects potential, aiUsage, and hirabilityScore.

5. **Missing Documentation:** Flag any repo with no README or empty description. Flag projects that show no signs of production-readiness. Repos that look like "I made this in 20 minutes and pushed" should be called out by name.

6. **Security Awareness:** Note any evidence of security-conscious thinking in their projects.

7. **Creative Credit:** If a project is genuinely novel, clever, or shows real initiative beyond tutorial-following, say so directly. Don't be stingy with credit when it's deserved.

8. **PR vs Owned Work:** Evaluate merged PRs in external repos heavily — this is the single strongest signal of real-world competence. A developer with zero external PRs but 50 repos is still an unknown quantity.

9. **Developer Tags:** Assign multiple archetype tags (e.g. "Frontend Dev", "Vibe Coder", "Backend", "Cybersecurity", "Script Kiddie", "AI Orchestrator", "Tutorial Cloner", etc.). Be accurate, not flattering.

10. **SWOT Analysis:** 3–4 bullet points each. Never leave any field empty. Opportunities are EXTERNAL market/role factors this developer could leverage — not self-improvement tips. Threats include market competition, skill gaps relative to peers, and trajectory risks.
    - **Employer mode:** Weaknesses and Threats must dominate. Opportunities describe where this candidate might fit in the market, with no optimism padding.
    - **Developer mode:** Opportunities and Strengths can include actionable growth advice and learning paths.

11. **Timeline & Growth Meter:** Create career phases (e.g. Beginner → Student Explorer → First Real Project → Contributor). Keep each phase to 2–3 lines. growthMeter (0–100) should reflect actual trajectory, not potential. A stagnant developer with 4 years and still doing todo apps gets a low growthMeter even if their future is bright.

12. **Hirability — DO NOT SOFTEN THIS:**
    - Expand criteria to differentiate internship vs full-time vs senior roles.
    - **DO NOT hesitate to mark someone as unsuitable for a role.** If they are not hire-ready, say so clearly in notSuitedRoles. "Junior Frontend Intern" should not appear in hirabilityRoles for a developer with no original work, no READMEs, and no consistency.
    - The hirability score must reflect real-world hiring standards and DEMONSTRATED SKILL — what their code proves they can do today. Never potential, never enthusiasm, never how impressive the README sounds. Score anchors, memorize them: 9+ = top 0.5% of GitHub developers (legendary, near-flawless); 8+ = top 2% (exceptional: external PRs + production-grade repos + real docs + multi-year consistency); 6.5–7 = genuinely strong and competitive; 5 = average developer, entry-level at best; 3–4 = weak — not hireable right now by most companies; 0–2 = empty or fake profile. The median real-world developer scores 4.5–5.5 — most profiles should land BELOW 6. When uncertain, score LOWER.

13. **Tone — ROAST STYLE, BRUTAL TRUTH, NO MERCY:**
    - Write like a professional GitHub Auditor: witty, analytical, slightly sarcastic. The profile gets roasted honestly; the developer gets the truth, not comfort.
    - Open the summary with a 1–2 sentence brutal but accurate roast of the profile (e.g. "48 repos, zero external PRs, and a bio promising 'AI Engineer' while the language stats scream HTML — the only thing artificial here is the intelligence.").
    - If the profile is weak, say it's weak and make it sting. The phrase "shows potential" is BANNED unless the trajectory genuinely supports it.
    - If the profile is strong, respect it without celebrating — a good profile earns a nod, not confetti.
    - Avoid filler sentences like "Overall, this developer shows promise." Either they do or they don't — be specific and be cutting.
    - Nuance is allowed: if something looks bad on the surface but is actually impressive when understood (e.g. AI orchestration producing production-grade output), use ***bold italic*** to flag this explicitly.
    - **NO BACKTRACKING — NEVER WALK BACK A ROAST.** A criticism stands alone. Never follow a critique with "but...", "that said...", "to be fair...", "in its defense...", "though...", "on the other hand...", "still, credit where due...", "which is nice...". If you call something weak, end the thought there. Do NOT rescue it in the same sentence, paragraph, or section.
    - **COMMIT TO EVERY VERDICT.** Weak is weak. Strong is strong. Pick a lane for each aspect of the profile and stay in it — never "X is bad... but also kind of good." If a genuine strength exists, state it as a strength in its own place; it must not contradict a roast you just delivered.
    - **ROAST WITH SPECIFICS, NOT BACKHANDED SUGAR.** Name the actual repo, README, PR, or stat in every criticism. Default to cutting. When in doubt, be harsher — this is an audit, not a performance review written by HR.

14. **STRUCTURED REPORT FORMAT:**
    - Use ## for major sections, ### for sub-topics.
    - Separate sections with --- dividers.
    - Use > **NOTE:** for important callouts.
    - Prefix: ⚠️ for warnings, ✅ for genuine positives, 🔍 for deep-dive observations.
    - Use **bold** for key metrics. Use ***bold italic*** for critical nuance that changes the read.
    - Keep the report punchy. No walls of text. Bullet points over paragraphs.
    - The detailedReport must NOT repeat per-repo breakdowns — those go in repoAssessments.

15. **PER-REPO ASSESSMENT:**
    - Score each non-fork repo independently (1.0–10.0).
    - Verdict: "Excellent", "Good", "Needs Work", or "Red Flag".
    - 2–3 sentence analysis, key highlights, red flags.
    - Apply the developer stage context here — a first-year student's first project gets judged against first-year standards, but a final-year student's "first project" style repo gets no mercy.

16. **SCORE STABILITY — FIXED 4-TIER BAND SYSTEM (HARSH CALIBRATION):**
    - Determine tier first from 3 hard signals: (a) merged PRs in external repos, (b) original non-fork repos with READMEs, (c) 6+ months of consistent activity.
    - 0/3 signals = Tier 1 (score 1.0–3.5). 1/3 = Tier 2 (3.6–5.9). 2/3 = Tier 3 (6.0–7.5). 3/3 = Tier 4 (7.6–9.5). A score above 7.5 requires ALL three signals. 10.0 is effectively unreachable — reserved for a profile with zero significant weaknesses.
    - Fine-tune ±0.4 within the band for quality factors — downgrade aggressively for critical weaknesses, never upgrade out of enthusiasm.
    - **MANDATORY SCORE CAPS (never exceed, regardless of signals):** no external merged PRs → 6.9; no original non-fork repo with a README → 4.9; no commits in the last 3 months or declining slope → 5.9; any critical weaknessMetric above 70 → 5.9 (two or more → 4.9); more than half of repos forked or README-less → 5.9; no tests in any repo → 6.9; account under 1 year with only tutorial clones → 3.9.
    - **7.0 is banned** everywhere. Use 6.9 or 7.1. This applies to every numeric field.
    - **STABILITY:** Decide the score ONCE from the evidence — identical evidence must produce an identical score. Maximum deviation between two assessments of the same profile: ±0.3.

17. **MODE PARITY:** hirabilityScore, metrics, weaknessMetrics, swot, tags, slopeAnalysis, buzzwordAnalysis, behavioralAnalysis, growthMeter, timeline, summary, detailedReport, repoAssessments, and projectIdeas must be IDENTICAL between modes. The mode ONLY controls whether mentorshipPlan is populated.

18. **MENTORSHIP PLAN (developer mode only):**
    - Do NOT write a generic "improve your READMEs and keep learning" plan.
    - Be specific to THIS developer's actual gaps:
      - Name specific languages or frameworks they should learn next, based on what their current stack is missing (e.g. "You're doing frontend-only work — you need to pick up Node.js or Python for a backend, because frontend-only devs are increasingly commoditized").
      - Suggest 2–3 concrete project IDEAS that would fill their portfolio gaps (not just "make a backend project" — say WHAT to build and WHY it would impress a recruiter).
      - If their READMEs are poor, rewrite one of their existing READMEs as a short example of what it should look like.
      - If their commit history is stale, give them a concrete 30-day challenge.
      - If they show arrogant patterns in their writing, call it out directly and give them a rephrased example.
      - The plan should feel like advice from a blunt mentor who genuinely wants them to level up, not a chatbot generating bullet points.
      - Populate projectIdeas with exactly 3 items ({title, description, techStack}): concrete projects that fill THIS developer's portfolio gaps. Say WHAT to build, WHY it would impress a recruiter, and WHICH specific technologies to use. Each idea must be distinct and tied to a weakness already identified — never generic "todo app" filler.

Your role (MODE-SPECIFIC — tone only, scores never change):
${mode === 'employer' ? 'BRUTAL HIRING ASSESSOR. You are a senior engineer advising a hiring manager, and your job is to protect the company from bad hires. Roast the weak, endorse the strong, reject the unready. No tips, no improvement advice, no cushioning, no mercy.' : 'BRUTAL MENTOR. Same scores and assessments as employer mode, same harsh tone — no sugarcoating. Additionally, populate mentorshipPlan with specific, actionable upgrade advice targeted at THIS developer\'s actual weaknesses — blunt and concrete enough to sting.'}

${customQuestions ? `Employer's custom question: "${customQuestions}" — answer this directly and honestly in the detailedReport under a ## Custom Assessment section.` : ''}

You MUST output ONLY a valid JSON object matching the requested schema exactly. No markdown outside the JSON. No preamble.
`;

  return basePrompt;
}

function buildSmallPrompt(data: UserAssessmentData, mode: AssessmentMode, customQuestions: string): string {
  const userJson = JSON.stringify({
    profile: {
      name: data.name, username: data.username, bio: data.bio, company: data.company,
      location: data.location, blog: data.blog, email: data.email, twitterUsername: data.twitterUsername,
      hireable: data.hireable, followers: data.followers, following: data.following,
      publicRepos: data.publicRepos, createdAt: data.createdAt, totalStars: data.totalStars, totalMergedPRs: data.totalPrs,
    },
    topLanguages: data.languages,
    recentRepos: data.repos.map(r => ({
      name: r.name, url: r.url, description: r.description, stars: r.stars, forks: r.forks,
      language: r.language, topics: r.topics, isFork: r.isFork,
      hasReadme: r.hasReadme, readmeSnippet: r.readmeContent, hasLicense: r.hasLicense,
      licenseName: r.licenseName, defaultBranch: r.defaultBranch, updatedAt: r.updatedAt
    })),
    pullRequestsInOtherRepos: data.pullRequests
  }, null, 2);

  let prompt = `Analyze this GitHub profile:
${userJson}

STAGE CONTEXT: Infer the developer's stage (beginner/student/senior student/professional) from account age and activity. Information only — NEVER an excuse. No lenience anywhere, for anyone, at any stage. A one-week-old account gets roasted as hard as a five-year account. Hirability scoring uses professional standards regardless of stage.

RULES:
1. Slope: Rising Star, Steady, Declining, or Sporadic? Assess burnout risk.
2. Buzzword vs Reality: Compare bio claims against actual language usage. Call out mismatches directly — no softening.
3. Arrogance vs Confidence: Flag toxic patterns honestly.
4. AI Usage: Detect slop OR quality orchestration. Call out superior orchestration as a strength.
5. Missing docs: Flag repos without READMEs by name.
6. Security mentions.
7. Credit genuinely novel ideas — not mediocre work dressed up as clever.
8. Evaluate merged PRs heavily. Zero external PRs = unproven.
9. Tags: Accurate archetype labels. "Tutorial Cloner" is valid.
10. SWOT: 2–3 bullets each, never empty. Opportunities = external market fit.
11. Timeline phases from account creation. growthMeter reflects actual trajectory, not potential.
12. Hirability: Use real hiring standards. Do not soften. A developer who is not hire-ready gets marked as such in notSuitedRoles. Be explicit.
13. Scores 1.0–10.0, HARSH scale: most real profiles land 3–6; 8+ = top 2% of GitHub developers; when uncertain, score LOWER. 7.0 is BANNED everywhere. Use 6.9 or 7.1. Tiers: 1.0–3.5 WEAK (0/3 hard signals), 3.6–5.9 AVERAGE (1/3), 6.0–7.5 STRONG (2/3), 7.6–9.5 EXCEPTIONAL (3/3). Hard signals: external merged PRs, original repos with READMEs, 6+ months consistent activity. Caps (never exceed): no external PRs → 6.9 max; no original README'd repo → 4.9 max; 3+ months inactive or declining slope → 5.9 max; critical weakness >70 → 5.9 max; most repos forked or README-less → 5.9 max; no tests anywhere → 6.9 max. Score must reflect demonstrated skill, never potential. Identical evidence → identical score (deviation ≤0.3).
14. Per-repo: Score 1–10, verdict, 1–2 sentence analysis. Stage-aware for quality, not for hirability.
15. Tone: ROAST STYLE — witty, analytical, slightly sarcastic, zero mercy. Open the summary with a 1-2 sentence brutal roast. If it's weak, make it sting. Banned: "shows potential", "overall a solid developer", participation-trophy praise, and ALL backtracking — never follow a critique with "but", "that said", "to be fair", "though", "in its defense", "on the other hand". Commit to every verdict; never rescue something you just roasted.

Mode: ${mode === 'employer' ? 'Brutally honest, roast style. No improvement tips. If unsuitable, say so clearly.' : 'Blunt mentor. Same scores, same harsh tone. Add mentorshipPlan with SPECIFIC language suggestions, concrete project ideas for this developer\'s actual gaps, direct feedback on their writing/tone, a repo portfolio audit (which repos to remove or archive, which to improve and exactly how, which to add next), and unconventional growth tactics for real stars/forks — launch posts, building in public, cross-posting tutorials, contributing to trending repos, pinning and renaming for discoverability; no fake stars, no spam. Not generic advice. Also output projectIdeas: exactly 3 objects {title, description, techStack} that fill those gaps.'}
${customQuestions ? `Custom Q: "${customQuestions}"` : ''}

Output ONLY valid JSON. No markdown wrappers. KEEP IT CONCISE. Output ONLY valid JSON.
`;

  return prompt;
}

function normalizeComparison(raw: any): ComparisonResult {
  return {
    candidates: Array.isArray(raw.candidates) ? raw.candidates.map((c: any) => ({
      username: c.username || '',
      strengths: Array.isArray(c.strengths) ? c.strengths : [],
      weaknesses: Array.isArray(c.weaknesses) ? c.weaknesses : [],
      potential: typeof c.potential === 'number' ? c.potential : 50,
      bestSuitedRole: c.bestSuitedRole || '',
      worstSuitedRole: c.worstSuitedRole || '',
    })) : [],
    overallRanking: Array.isArray(raw.overallRanking) ? raw.overallRanking.map((r: any) => ({
      username: r.username || '',
      recommendedFor: r.recommendedFor || '',
    })) : [],
    verdict: raw.verdict || '',
  };
}

function buildComparisonPrompt(candidates: ComparisonCandidate[], customQuestion: string): string {
  if (!candidates || candidates.length === 0) {
    return 'Produce a comparison result with empty candidates array and verdict "No candidates provided for comparison."';
  }
  const summaries = candidates.map(c => ({
    username: c.username,
    avatarUrl: c.avatarUrl,
    hirabilityScore: c.assessment.hirabilityScore,
    hirabilityRoles: c.assessment.hirabilityRoles,
    notSuitedRoles: c.assessment.notSuitedRoles,
    summary: c.assessment.summary,
    detailedReport: c.assessment.detailedReport?.substring(0, 500),
    strengths: c.assessment.swot.strengths,
    weaknesses: c.assessment.swot.weaknesses,
    opportunities: c.assessment.swot.opportunities,
    threats: c.assessment.swot.threats,
    growthMeter: c.assessment.growthMeter,
    metrics: c.assessment.metrics,
    weaknessMetrics: c.assessment.weaknessMetrics,
    buzzwordAnalysis: c.assessment.buzzwordAnalysis,
    slopeAnalysis: c.assessment.slopeAnalysis,
    behavioralAnalysis: c.assessment.behavioralAnalysis,
    tags: c.assessment.tags,
  }));

  return `Compare these GitHub developer candidates for hiring. Analyze them side by side and produce a structured comparison.

CANDIDATES:
${JSON.stringify(summaries, null, 2)}

${customQuestion ? `The employer has a specific question: "${customQuestion}" - answer it directly in the verdict field.` : 'Determine which candidate is best suited for which roles based on their assessment data.'}

INSTRUCTIONS:
- For each candidate, list their top strengths, top weaknesses, potential score (0-100), the role they are best suited for, and the role they are worst suited for.
- Provide an overall ranking where each candidate is assigned to roles they would excel at (e.g. "user1 is best for AI/ML engineering", "user2 is best for full-stack development").
- The verdict should summarize: either "All candidates are ineligible - move to the next batch of candidates" or specify which candidate(s) are recommended.
- Be brutally honest, roast style, no mercy. If none are good, say so and say exactly why each one fails.
- Output ONLY valid JSON. No markdown, no wrappers.
`;
}

function buildMentorshipPrompt(data: UserAssessmentData, cached: AssessmentResult): string {
  const userJson = JSON.stringify({
    profile: {
      name: data.name, username: data.username, bio: data.bio,
      followers: data.followers, following: data.following, publicRepos: data.publicRepos,
      createdAt: data.createdAt, totalStars: data.totalStars, totalMergedPRs: data.totalPrs,
    },
    topLanguages: data.languages,
    recentRepos: data.repos.slice(0, 15).map(r => ({
      name: r.name, description: r.description, stars: r.stars, forks: r.forks,
      language: r.language, isFork: r.isFork, hasReadme: r.hasReadme,
    })),
  }, null, 2);

  const cachedJson = JSON.stringify({
    hirabilityScore: cached.hirabilityScore,
    hirabilityRoles: cached.hirabilityRoles,
    notSuitedRoles: cached.notSuitedRoles,
    growthMeter: cached.growthMeter,
    summary: cached.summary,
    tags: cached.tags,
    swot: cached.swot,
    metrics: cached.metrics,
    weaknessMetrics: cached.weaknessMetrics,
    slopeAnalysis: cached.slopeAnalysis,
    buzzwordAnalysis: cached.buzzwordAnalysis,
    behavioralAnalysis: cached.behavioralAnalysis,
    repoAssessments: (cached.repoAssessments || []).map(r => ({ repoName: r.repoName, repoScore: r.repoScore, repoVerdict: r.repoVerdict })),
  }, null, 2);

  return `A developer has already been assessed in Employer Mode. Your job is NOT to re-score or re-evaluate them — it is to mentor them, brutally, on exactly what to improve and what to build next, using the completed assessment as ground truth.

## DEVELOPER PROFILE
${userJson}

## COMPLETED EMPLOYER ASSESSMENT (GROUND TRUTH — DO NOT CHANGE SCORES)
${cachedJson}

## INSTRUCTIONS
1. Accept every score, verdict, and weakness in the assessment as final. Never contradict or soften them. The scores do not change in mentor mode.
2. Write mentorshipPlan as Markdown using ## for sections and ### for sub-topics, separated by --- dividers. Use ⚠️ for warnings, ✅ for genuine positives, 🔍 for observations, **bold** for key points, > **NOTE:** for callouts. Structure it as:
   - ## What to Fix First — rank their top weaknesses by impact (tie each to a specific weaknessMetric or SWOT weakness from the assessment). One concrete fix per item, no vague advice.
   - ## Learning Path — name specific languages/frameworks based on what their current stack is MISSING (e.g. frontend-only devs need Node.js or Python; no tests means learning a testing framework). Justify each in one line.
   - ## Repo Portfolio: Remove, Add, Improve — audit the actual repos in the DEVELOPER PROFILE, naming them by name. REMOVE: which repos to delete or archive and why (dead experiments, zero-value junk, duplicates, embarrassing half-finished work). ADD: which gap-filling repos to create next and what each must demonstrate (tie to projectIdeas). IMPROVE: for every repo they keep, one concrete improvement — rewrite the README, write a real description, add docs/tests/CI, a demo link or screenshot. Never say "some of your repos" — always name the repo.
   - ## README & Repo Hygiene — if lackOfDocs is high or repos lack READMEs, rewrite one of their actual repos' READMEs as a short example of what it should look like.
   - ## 30-Day Challenge — if their commit history is stale or inconsistent, give a concrete 30-day challenge. Skip only if activity is already strong.
   - ## Communication & Tone — if arrogance is high, quote an arrogant pattern from their profile and give a rephrased, professional version.
   - ## Unconventional Growth Tactics — real, specific marketing moves to grow stars, forks, and followers: launch posts on X/LinkedIn when shipping, cross-post tutorials to dev.to/Hashnode, build in public (daily commits, visible progress), contribute meaningful PRs to trending repos in their niche so their name reaches thousands, rename and reword repos and descriptions for searchability, pin their best work, add OG images and badges, ship one small tool that solves a real problem and post it to HN/Product Hunt/relevant subreddits. Warn hard against fake stars, star-begging, and spammy self-promotion — the goal is getting their BEST work seen, not gaming numbers.
   - ## What You're Already Good At — 2-3 lines of honest credit tied to their actual strengths (no fluff, no participation trophies).
3. Output projectIdeas: exactly 3 concrete projects that fill THIS developer's portfolio gaps — these are the repos they should ADD next. For each: title, description (WHAT to build, WHY it would impress a recruiter, and WHICH of their weaknesses it addresses), and techStack (3-6 specific technologies). Ideas must be tied to the weaknesses in the assessment — not generic "todo app" filler.

Output ONLY valid JSON with keys: mentorshipPlan (string) and projectIdeas (array of {title, description, techStack}).
No markdown outside the JSON. No preamble.`;
}

export async function generateMentorship(
  data: UserAssessmentData,
  settings: AppSettings,
  cachedAssessment: AssessmentResult
): Promise<MentorshipResult> {
  const prompt = buildMentorshipPrompt(data, cachedAssessment);
  const rawResponse = await callAI(settings, MENTORSHIP_SYSTEM_PROMPT, prompt, 'mentorship');

  try {
    const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      mentorshipPlan: typeof parsed.mentorshipPlan === 'string' ? parsed.mentorshipPlan : '',
      projectIdeas: Array.isArray(parsed.projectIdeas) ? parsed.projectIdeas.map((p: any) => ({
        title: p.title || '',
        description: p.description || '',
        techStack: Array.isArray(p.techStack) ? p.techStack : [],
      })) : [],
    };
  } catch (e: any) {
    const suggestion = getAISuggestion(e, settings.aiProvider);
    throw new Error(suggestion);
  }
}

export async function compareCandidates(
  candidates: ComparisonCandidate[],
  settings: AppSettings,
  customQuestion: string = ''
): Promise<ComparisonResult> {
  const prompt = buildComparisonPrompt(candidates.slice(0, 5), customQuestion);
  const rawResponse = await callAI(settings, COMPARISON_SYSTEM_PROMPT, prompt, 'comparison');

  try {
    const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return normalizeComparison(JSON.parse(cleaned));
  } catch (e: any) {
    const suggestion = getAISuggestion(e, settings.aiProvider);
    throw new Error(suggestion);
  }
}
