import { GoogleGenAI, Type } from '@google/genai';
import { UserAssessmentData } from './github';
import { AppSettings } from './types';

export type AssessmentMode = 'employer' | 'developer';

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

const ASSESSMENT_SYSTEM_PROMPT = "You are an expert tech recruiter and senior engineering manager evaluating a candidate's GitHub profile. YOU MUST OUTPUT ONLY VALID MINIFIED JSON. NO MARKDOWN OR HTML WRAPPERS.";
const COMPARISON_SYSTEM_PROMPT = "You are an expert tech recruiter comparing candidates. OUTPUT ONLY VALID JSON.";

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
    repoAssessments: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { repoName: { type: Type.STRING }, repoScore: { type: Type.NUMBER }, repoVerdict: { type: Type.STRING }, repoAnalysis: { type: Type.STRING }, keyHighlights: { type: Type.ARRAY, items: { type: Type.STRING } }, redFlags: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
  },
  required: ["summary", "tags", "timeline", "growthMeter", "swot", "metrics", "weaknessMetrics", "slopeAnalysis", "buzzwordAnalysis", "behavioralAnalysis", "hirabilityScore", "hirabilityRoles", "notSuitedRoles", "detailedReport", "repoAssessments"]
};

const comparisonSchema = {
  type: Type.OBJECT,
  properties: {
    candidates: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { username: { type: Type.STRING }, strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }, potential: { type: Type.NUMBER }, bestSuitedRole: { type: Type.STRING }, worstSuitedRole: { type: Type.STRING } } } },
    overallRanking: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { username: { type: Type.STRING }, recommendedFor: { type: Type.STRING } } } },
    verdict: { type: Type.STRING }
  }
};

async function callGemini(apiKey: string, model: string, systemMsg: string, userPrompt: string, schema: any): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: { temperature: 0, topP: 1, topK: 1, systemInstruction: systemMsg, responseMimeType: "application/json", responseSchema: schema }
  });
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
  const msg = error.message.toLowerCase();
  if (msg.includes('timeout') || msg.includes('abort') || msg.includes('timed out')) {
    return `AI timed out. Switch to Gemini API or a larger local model like mistral or qwen2.5:7b.`;
  }
  if (msg.includes('413') || msg.includes('payload') || msg.includes('too large') || msg.includes('context length') || msg.includes('maximum context')) {
    return `Prompt exceeds context window. Switch to Gemini 2.5 Flash (1M tokens) or a model with 32K+ context.`;
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

async function callAI(settings: AppSettings, systemMsg: string, userPrompt: string, provider: 'assessment' | 'comparison'): Promise<string> {
  const providerType = settings.aiProvider;
  switch (providerType) {
    case 'gemini': {
      const key = settings.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      if (!key) throw new Error('Gemini API key is required.');
      return callGemini(key, settings.model || 'gemini-2.5-flash', systemMsg, userPrompt, provider === 'assessment' ? assessmentSchema : comparisonSchema);
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
      throw new Error(`Assessment incomplete: ${validation.reason}. Switch to Gemini 2.5 Flash or a model with 32K+ context for complete results.`);
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
  if (!result.swot.strengths || result.swot.strengths.length === 0) issues.push('SWOT strengths empty');
  if (!result.swot.weaknesses || result.swot.weaknesses.length === 0) issues.push('SWOT weaknesses empty');
  if (!result.hirabilityRoles || result.hirabilityRoles.length === 0) issues.push('hirability roles missing');
  if (!result.tags || result.tags.length === 0) issues.push('tags missing');

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

## CONTEXT-AWARE DEVELOPER STAGE ASSESSMENT (STRICT MODE)

Before scoring anything, infer the developer's career stage from their account age, bio, and activity. However, you MUST hold everyone to a high standard.
- **First-year student / Beginner:** Basic CRUD apps are expected, but penalize heavily for pure forks/copies, no READMEs, and spaghetti code. Do not give out high scores just for trying. 
- **Student (1–3 year account):** Penalize severely for tutorial clones, lack of deployment, and stagnant tech stacks.
- **Final-year student / Senior student:** Must show deployed projects and architectural thinking. If it's just index.js and style.css, mark them as unhirable for anything beyond absolute entry-level.
- **Professional / Working developer:** Evaluated against elite professional standards — zero lenience. Missing tests, poor docs, or stale repos drop the score massively.

**CRITICAL:** Hiring is about job standards, not the developer's current life stage. The bar does not lower because they are a student. Be ruthless in your assessment of actual code quality.

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
    - **DO NOT hesitate to mark someone as unsuitable for a role.** If they are not hire-ready, say so clearly in notSuitedRoles. 
    - The hirability score must reflect elite real-world hiring standards. A score of 4 means "not hireable right now." Call it out. Be extremely critical of poor code structure and lack of tests.

13. **Tone — BE BRUTALLY HONEST, NOT A PRESS RELEASE:**
    - Write like a highly critical senior engineer reviewing a resume. Do not be artificially nice.
    - If the profile is weak, say it's weak. Do not hide behind phrases like "shows potential" unless they genuinely are a rising star.
    - Be professional, but do not sugarcoat deficiencies. Blunt and direct is the goal.

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

16. **SCORE STABILITY — FIXED 3-TIER BAND SYSTEM:**
    - Determine tier first from 3 hard signals: (a) merged PRs in external repos, (b) original non-fork repos with READMEs, (c) 6+ months of consistent activity.
    - 0/3 signals = Tier 1 (score 1–4). 1/3 = Tier 2 (4–6). 2–3/3 = Tier 3 (8–10).
    - **THE SCORE 7 (7.0, 7.1, 7.5, 7.9) IS STRICTLY BANNED.** Do not give out any 7s. If they are mediocre, they get a 5 or 6. If they are great, they get an 8+. Force a strong opinion.
    - Maximum deviation between two assessments of the same profile: ±1.0.

17. **MODE PARITY:** hirabilityScore, metrics, weaknessMetrics, swot, tags, slopeAnalysis, buzzwordAnalysis, behavioralAnalysis, growthMeter, timeline, summary, detailedReport, and repoAssessments must be IDENTICAL between modes. The mode ONLY controls whether mentorshipPlan is populated.

18. **MENTORSHIP PLAN (developer mode only):**
    - Do NOT write a generic "improve your READMEs and keep learning" plan.
    - Be specific to THIS developer's actual gaps:
      - Name specific languages or frameworks they should learn next, based on what their current stack is missing (e.g. "You're doing frontend-only work — you need to pick up Node.js or Python for a backend, because frontend-only devs are increasingly commoditized").
      - Suggest 2–3 concrete project IDEAS that would fill their portfolio gaps (not just "make a backend project" — say WHAT to build and WHY it would impress a recruiter).
      - If their READMEs are poor, rewrite one of their existing READMEs as a short example of what it should look like.
      - If their commit history is stale, give them a concrete 30-day challenge.
      - If they show arrogant patterns in their writing, call it out directly and give them a rephrased example.
      - The plan should feel like advice from a blunt mentor who genuinely wants them to level up, not a chatbot generating bullet points.

Your role (MODE-SPECIFIC — tone only, scores never change):
${mode === 'employer' ? 'BRUTALLY HONEST HIRING ASSESSOR. You are a senior engineer advising a hiring manager. Your job is to protect the company from bad hires. If the developer is not ready, say so. No tips, no improvement advice, no cushioning. If they are unsuitable, be clear.' : 'BLUNT MENTOR. Same scores and assessments as employer mode. Additionally, populate mentorshipPlan with specific, actionable upgrade advice targeted at THIS developer\'s actual weaknesses — not generic career advice.'}

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

STAGE CONTEXT: Infer the developer's stage from account age. Hold everyone to a highly critical professional standard. No free passes for being a student.

RULES:
1. Slope: Rising Star, Steady, Declining, or Sporadic?
2. Buzzword vs Reality: Call out mismatches directly. 
3. Arrogance vs Confidence: Flag toxic patterns.
4. AI Usage: Detect slop OR quality orchestration.
5. Missing docs: Flag repos without READMEs by name. Penalize severely.
6. Security mentions.
7. Credit genuinely novel ideas — not mediocre work.
8. Evaluate merged PRs heavily. Zero external PRs = unproven.
9. Tags: Accurate archetype labels.
10. SWOT: 2–3 bullets each, never empty.
11. Timeline phases from account creation.
12. Hirability: Brutally honest. If not hire-ready, say so clearly.
13. Scores 1.0–10.0. **THE SCORE 7 IS COMPLETELY BANNED (no 7.0, 7.5, etc).** Force a strong opinion (6 or lower for mediocre, 8+ for strong).
14. Per-repo: Score 1–10, verdict, 1–2 sentence analysis. Be highly critical.
15. Tone: Write like a highly critical senior engineer. No sugarcoating.

Mode: ${mode === 'employer' ? 'Brutally honest. No improvement tips. If unsuitable, say so clearly.' : 'Blunt mentor. Same scores. Add mentorshipPlan with SPECIFIC language suggestions, concrete project ideas for this developer\'s actual gaps, and direct feedback on their writing/tone — not generic advice.'}
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
- Be brutally honest. If none are good, say so.
- Output ONLY valid JSON. No markdown, no wrappers.
`;
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
