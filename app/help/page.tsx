"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Github, Zap, Shield, Target, AlertTriangle, GitCompare, Settings, Code2, ExternalLink, History } from 'lucide-react';

export default function HelpPage() {
  const router = useRouter();

  const sections = [
    {
      id: 'getting-started',
      icon: <Zap className="w-5 h-5 text-[#E3B341]" />,
      title: 'Getting Started',
      content: (
        <div className="space-y-3 text-sm text-[#C9D1D9] leading-relaxed">
          <p>This app uses AI to analyze any public GitHub profile and produces a detailed assessment including hirability score, SWOT analysis, career slope detection, buzzword checks, behavioral analysis, and per-repo evaluation.</p>
          <p><strong className="text-white">Quick start:</strong> Enter a GitHub username, choose a mode, click Generate Assessment. That&apos;s it.</p>
          <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#2EA043]/20 border border-[#2EA043]/30 text-[#46E363] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
              <div>
                <span className="text-white font-bold">Employer Mode</span>
                <p className="text-[#8B949E] text-xs">Brutal hirability check. Evaluates qualities, failures, deficiencies, and risk factors. <strong className="text-[#FF7B72]">Zero improvement tips.</strong> Use for hiring decisions.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#58A6FF]/20 border border-[#58A6FF]/30 text-[#58A6FF] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
              <div>
                <span className="text-white font-bold">Mentor Mode</span>
                <p className="text-[#8B949E] text-xs">Same scores as employer mode, but adds a <strong className="text-[#58A6FF]">mentorship plan</strong> with specific upgrade instructions and <strong className="text-[#A371F7]">project ideas</strong> — improving READMEs, reducing arrogance, learning paths. From the employer view, hit <strong className="text-white">&quot;Want guidance?&quot;</strong> to jump here instantly, reusing the assessment already done.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'setup',
      icon: <Settings className="w-5 h-5 text-[#58A6FF]" />,
      title: 'Setting Up API Keys & Providers',
      content: (
        <div className="space-y-4 text-sm text-[#C9D1D9] leading-relaxed">
          <p>Click the <strong className="text-white">green gear button</strong> (bottom-right) to open Settings. You need at least one AI provider configured.</p>

          <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#2EA043]"></span> Gemini (Recommended — Free Tier Available)</h4>
            <ol className="space-y-1.5 text-xs text-[#8B949E] list-decimal list-inside">
              <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-[#58A6FF] hover:underline">Google AI Studio</a></li>
              <li>Click &quot;Get API Key&quot; → Create API key (free tier works)</li>
              <li>Paste the key in Settings → API Key field</li>
              <li>Model: <code className="text-[#E3B341]">gemini-2.5-flash</code> (default, fast, 1M context)</li>
            </ol>
          </div>

          <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#A371F7]"></span> Other Cloud Providers</h4>
            <p className="text-xs text-[#8B949E] mb-2">Each provider&apos;s &quot;Get API key →&quot; link is shown in the Settings dropdown when selected.</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { name: 'OpenAI', model: 'gpt-4o', url: 'https://platform.openai.com/api-keys' },
                { name: 'Anthropic', model: 'claude-sonnet-4', url: 'https://console.anthropic.com/settings/keys' },
                { name: 'OpenRouter', model: 'openai/gpt-4o', url: 'https://openrouter.ai/keys' },
                { name: 'Groq', model: 'llama-3.3-70b', url: 'https://console.groq.com/keys' },
                { name: 'DeepSeek', model: 'deepseek-chat', url: 'https://platform.deepseek.com/api_keys' },
                { name: 'Mistral', model: 'mistral-large', url: 'https://console.mistral.ai/api-keys/' },
              ].map(p => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-[#161B22] border border-[#30363D] rounded hover:border-[#58A6FF] transition-colors">
                  <ExternalLink className="w-3 h-3 text-[#58A6FF] shrink-0" />
                  <div>
                    <span className="text-[#C9D1D9] font-bold">{p.name}</span>
                    <p className="text-[10px] text-[#8B949E]">{p.model}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#E3B341]"></span> GitHub PAT (Optional)</h4>
            <ol className="space-y-1.5 text-xs text-[#8B949E] list-decimal list-inside">
              <li>Go to GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens</li>
              <li>Generate a token with <code className="text-[#E3B341]">repo</code> and <code className="text-[#E3B341]">user</code> scopes</li>
              <li>Paste in Settings → GitHub PAT Token field</li>
              <li>Benefits: higher API rate limits, private repo analysis</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'ollama-setup',
      icon: <Code2 className="w-5 h-5 text-[#58A6FF]" />,
      title: 'Setting Up Ollama (Local Models)',
      content: (
        <div className="space-y-3 text-sm text-[#C9D1D9] leading-relaxed">
          <p>If you want to run AI locally (no cloud dependency), use Ollama.</p>
          <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 space-y-2 text-xs">
            <p className="text-white font-medium">Step 1: Install Ollama</p>
            <p className="text-[#8B949E]">Download from <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-[#58A6FF] hover:underline">ollama.com</a> and install.</p>
            <div className="border-t border-[#30363D] pt-2 mt-2">
              <p className="text-white font-medium">Step 2: Pull a model</p>
              <p className="text-[#8B949E] mb-2">Open terminal and run:</p>
              <div className="bg-[#0D1117] border border-[#30363D] rounded p-3 font-mono text-[11px] space-y-1">
                <p className="text-[#46E363]"># Recommended — good balance of quality & speed (8GB RAM):</p>
                <p className="text-white">ollama pull qwen2.5:7b</p>
                <p className="text-[#46E363]"># Also good, slightly smaller:</p>
                <p className="text-white">ollama pull mistral</p>
                <p className="text-[#46E363]"># For powerful machines (16GB+ RAM):</p>
                <p className="text-white">ollama pull llama3.1:8b</p>
                <p className="text-[#F85149]"># NOT recommended — too small for this task:</p>
                <p className="text-white opacity-50">ollama pull phi  # or llama3.2:1b, tinyllama</p>
              </div>
            </div>
            <div className="border-t border-[#30363D] pt-2 mt-2">
              <p className="text-white font-medium">Step 3: Start Ollama</p>
              <p className="text-[#8B949E]">Run <code className="text-[#E3B341]">ollama serve</code> in terminal. Keep it running.</p>
            </div>
            <div className="border-t border-[#30363D] pt-2 mt-2">
              <p className="text-white font-medium">Step 4: Configure the app</p>
              <p className="text-[#8B949E]">Settings → AI Provider → <strong className="text-white">Local Ollama</strong>, Endpoint: <code className="text-[#E3B341]">http://localhost:11434</code>, Model: <code className="text-[#E3B341]">qwen2.5:7b</code></p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'choosing-model',
      icon: <Target className="w-5 h-5 text-[#FF7B72]" />,
      title: 'Choosing a Model — Critical Guidance',
      content: (
        <div className="space-y-3 text-sm text-[#C9D1D9] leading-relaxed">
          <div className="bg-[#F85149]/10 border border-[#F85149]/30 rounded-lg p-4">
            <h4 className="text-[#FF7B72] font-bold flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Important: Why Model Choice Matters</h4>
            <p className="text-xs">The assessment prompt is complex — ~1,200 tokens of detailed instructions plus all profile data. Small models (Phi, Llama 3.2 1B/3B, TinyLlama) produce <strong className="text-[#FF7B72]">highly inaccurate results</strong> including wrong scores, missing red flags, and useless SWOT analysis. The task requires understanding nuanced code patterns, behavior signals, and career trajectory — small models cannot do this.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#30363D]">
                  <th className="text-left text-[#8B949E] uppercase tracking-widest font-bold p-3">Scenario</th>
                  <th className="text-left text-[#8B949E] uppercase tracking-widest font-bold p-3">Recommended</th>
                  <th className="text-left text-[#8B949E] uppercase tracking-widest font-bold p-3">Prompt Size</th>
                  <th className="text-left text-[#8B949E] uppercase tracking-widest font-bold p-3">Fits Employer Mode?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#30363D] bg-[#2EA043]/5">
                  <td className="p-3 text-white font-bold">Best Overall</td>
                  <td className="p-3">Gemini 2.5 Flash (free tier)</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-[#2EA043]/10 text-[#46E363] rounded text-[10px] font-bold">Full</span></td>
                  <td className="p-3"><span className="text-[#46E363] font-bold">Yes ✅</span></td>
                </tr>
                <tr className="border-b border-[#30363D] bg-[#2EA043]/5">
                  <td className="p-3 text-white font-bold">Premium Cloud</td>
                  <td className="p-3">GPT-4o, Claude Sonnet 4, DeepSeek V3</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-[#2EA043]/10 text-[#46E363] rounded text-[10px] font-bold">Full</span></td>
                  <td className="p-3"><span className="text-[#46E363] font-bold">Yes ✅</span></td>
                </tr>
                <tr className="border-b border-[#30363D] bg-[#2EA043]/5">
                  <td className="p-3 text-white font-bold">Local — Strong (16GB RAM)</td>
                  <td className="p-3">Llama 3.1 8B (128K ctx), Gemma 2 9B</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-[#2EA043]/10 text-[#46E363] rounded text-[10px] font-bold">Full</span></td>
                  <td className="p-3"><span className="text-[#46E363] font-bold">Yes ✅</span></td>
                </tr>
                <tr className="border-b border-[#30363D] bg-[#2EA043]/5">
                  <td className="p-3 text-white font-bold">Local — Mid (8GB RAM)</td>
                  <td className="p-3">Qwen 2.5 7B, Mistral 7B (32K ctx)</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-[#2EA043]/10 text-[#46E363] rounded text-[10px] font-bold">Full</span></td>
                  <td className="p-3"><span className="text-[#46E363] font-bold">Yes ✅</span></td>
                </tr>
                <tr className="border-b border-[#30363D] bg-[#E3B341]/5">
                  <td className="p-3 text-white font-bold">Local — Weak</td>
                  <td className="p-3">Phi-3, Llama 3.2 3B</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-[#E3B341]/10 text-[#E3B341] rounded text-[10px] font-bold">Small</span></td>
                  <td className="p-3"><span className="text-[#FF7B72] font-bold">No ❌</span></td>
                </tr>
                <tr className="border-b border-[#30363D] bg-[#F85149]/10">
                  <td className="p-3 text-white font-bold">Too Small</td>
                  <td className="p-3">Phi-1, Llama 3.2 1B, TinyLlama</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-[#F85149]/10 text-[#FF7B72] rounded text-[10px] font-bold">Small</span></td>
                  <td className="p-3"><span className="text-[#FF7B72] font-bold">No ❌</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-[#58A6FF]/10 border border-[#58A6FF]/30 rounded-lg p-4">
            <h4 className="text-[#58A6FF] font-bold mb-1">Prompt Size Setting</h4>
            <p className="text-xs text-[#8B949E]">Found in Settings → <strong className="text-white">Prompt Size</strong>:</p>
            <ul className="text-xs text-[#8B949E] list-disc list-inside mt-1 space-y-0.5">
              <li><strong className="text-[#46E363]">Full (default):</strong> ~1,200 token instruction prompt. In-depth analysis. <strong className="text-white">Required for employer mode.</strong></li>
              <li><strong className="text-[#E3B341]">Small:</strong> ~400 token instruction prompt. For weak local models only. <strong className="text-[#FF7B72]">Not suitable for employer mode</strong> — use only in mentor mode if you have no other option.</li>
            </ul>
          </div>

          <div className="bg-[#F85149]/10 border border-[#F85149]/30 rounded-lg p-4 mt-3">
            <h4 className="text-[#FF7B72] font-bold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Ultra-Small Models (Last Resort)</h4>
            <p className="text-xs text-[#8B949E] mb-2">If your model is still too small even for the &quot;Small&quot; prompt:</p>
            <ol className="text-xs text-[#8B949E] list-decimal list-inside space-y-1">
              <li><strong className="text-white">Clone the repository</strong> to your local machine (do NOT use the deployed website)</li>
              <li><strong className="text-white">Use an external LLM</strong> (ChatGPT, Claude, Gemini) to shorten the prompts in <code className="text-[#E3B341]">lib/ai.ts</code></li>
              <li>Find the <code className="text-[#E3B341]">buildPrompt()</code> and <code className="text-[#E3B341]">buildSmallPrompt()</code> functions</li>
              <li>Ask the LLM: <em className="text-[#58A6FF]">&quot;Condense this assessment prompt to 200 tokens while keeping core evaluation criteria&quot;</em></li>
              <li>Replace the prompt strings in <code className="text-[#E3B341]">lib/ai.ts</code> with shortened versions</li>
              <li>Run <code className="text-[#E3B341]">npm run dev</code> and test at <code className="text-[#E3B341]">http://localhost:3000</code></li>
              <li><strong className="text-[#FF7B72]">CRITICAL:</strong> Do NOT deploy this modified version — local testing only</li>
            </ol>
            <p className="text-[10px] text-[#FF7B72] mt-2 font-bold">⚠️ Warning: Ultra-compressed prompts produce significantly less accurate assessments. This is for experimentation only.</p>
          </div>
        </div>
      )
    },
    {
      id: 'score-stability',
      icon: <Shield className="w-5 h-5 text-[#46E363]" />,
      title: 'Score Stability & Accuracy',
      content: (
        <div className="space-y-3 text-sm text-[#C9D1D9] leading-relaxed">
          <p>The hirability score uses a <strong className="text-white">4-tier band system</strong> — deliberately harsh and grounded in <strong className="text-white">demonstrated skill, never potential</strong>:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#F85149]/10 border border-[#F85149]/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-[#FF7B72]">1.0–3.5</div>
              <div className="text-[#FF7B72] font-bold mt-1">EMPTY / WEAK</div>
              <p className="text-[10px] text-[#8B949E] mt-1">Forked everything, no docs, no real work, no signal</p>
            </div>
            <div className="bg-[#E3B341]/10 border border-[#E3B341]/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-[#E3B341]">3.6–5.9</div>
              <div className="text-[#E3B341] font-bold mt-1">AVERAGE</div>
              <p className="text-[10px] text-[#8B949E] mt-1">Some original work, mixed quality, moderate activity — the realistic middle</p>
            </div>
            <div className="bg-[#E3B341]/10 border border-[#E3B341]/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-[#E3B341]">6.0–7.5</div>
              <div className="text-[#E3B341] font-bold mt-1">STRONG</div>
              <p className="text-[10px] text-[#8B949E] mt-1">Original repos, real READMEs, consistent activity — clearly above the average dev</p>
            </div>
            <div className="bg-[#2EA043]/10 border border-[#2EA043]/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-[#46E363]">7.6–9.5</div>
              <div className="text-[#46E363] font-bold mt-1">ELITE</div>
              <p className="text-[10px] text-[#8B949E] mt-1">Needs ALL hard signals: external PRs, original repos, sustained activity</p>
            </div>
          </div>
          <p className="text-xs text-[#8B949E]">The AI is anchored to reality: <strong className="text-white">9+ means the top ~0.5% of developers</strong>, 8+ means the top ~2%, a real median developer lands around <strong className="text-white">4.5–5.5</strong>, and <strong className="text-white">most profiles score below 6</strong>. A 10 is effectively unreachable, and when in doubt the AI scores <strong className="text-[#FF7B72]">lower</strong>, not higher.</p>
          <p className="text-xs text-[#8B949E]">The AI uses <strong className="text-white">3 hard signals</strong> to place the band: (a) merged PRs in external repos, (b) original non-fork repos with READMEs, (c) &gt;6 months of consistent activity. It is also bound by <strong className="text-white">mandatory caps</strong>: no external PRs → max 6.9; no original documented repo → max 4.9; 3+ months inactive or declining → max 5.9; no tests anywhere → max 6.9. The maximum score deviation between runs of the same profile is <strong className="text-[#E3B341]">±0.3</strong>.</p>
        </div>
      )
    },
    {
      id: 'compare',
      icon: <GitCompare className="w-5 h-5 text-[#58A6FF]" />,
      title: 'Comparing Candidates',
      content: (
        <div className="space-y-3 text-sm text-[#C9D1D9] leading-relaxed">
          <p>The compare feature is available in <strong className="text-white">employer mode only</strong>.</p>
          <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <span className="text-[#46E363] font-bold shrink-0">1.</span>
              <div>
                <span className="text-white font-bold">Assess profiles</span>
                <p className="text-[#8B949E]">Each assessed profile is auto-saved to session storage. Assess multiple candidates.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#46E363] font-bold shrink-0">2.</span>
              <div>
                <span className="text-white font-bold">Open Compare</span>
                <p className="text-[#8B949E]">Click <strong className="text-white">&quot;Compare Candidates&quot;</strong> in the left sidebar on any assessment page.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#46E363] font-bold shrink-0">3.</span>
              <div>
                <span className="text-white font-bold">Select or add candidates</span>
                <p className="text-[#8B949E]">Pick up to 5 from the saved list. Or type a new GitHub username and click <strong className="text-white">&quot;Assess & Add&quot;</strong> to analyze a new developer on the fly.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#46E363] font-bold shrink-0">4.</span>
              <div>
                <span className="text-white font-bold">Compare or ask AI</span>
                <p className="text-[#8B949E]">Click <strong className="text-white">&quot;Compare N Candidates&quot;</strong> for a full table: Strengths, Weaknesses, Potential, Best/Worst role. Or type a custom question like <em className="text-[#58A6FF]">&quot;Who is best for a Startup CTO role?&quot;</em></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#46E363] font-bold shrink-0">5.</span>
              <div>
                <span className="text-white font-bold">AI verdict</span>
                <p className="text-[#8B949E]">The AI can say all candidates are ineligible — <em className="text-[#FF7B72]">&quot;Move to the next batch of candidates&quot;</em> — or recommend specific candidates for specific roles.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'session-cache',
      icon: <History className="w-5 h-5 text-[#58A6FF]" />,
      title: 'Saved Assessments (Session Cache)',
      content: (
        <div className="space-y-3 text-sm text-[#C9D1D9] leading-relaxed">
          <p>Every assessment you generate is cached <strong className="text-white">in your browser only</strong>, so you can reopen it without paying for another AI call.</p>
          <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <span className="text-[#46E363] font-bold shrink-0">1.</span>
              <div>
                <span className="text-white font-bold">See your history</span>
                <p className="text-[#8B949E]">The <strong className="text-white">home page</strong> lists every profile assessed this session with its hirability score and mode. Click one to reopen it instantly — the cached result loads without a new AI call.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#46E363] font-bold shrink-0">2.</span>
              <div>
                <span className="text-white font-bold">Reassess for fresh data</span>
                <p className="text-[#8B949E]">Use <strong className="text-white">&quot;Reassess Profile&quot;</strong> (left sidebar on any assessment) to force a brand-new GitHub fetch + AI run when the profile has changed.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#FF7B72] font-bold shrink-0">3.</span>
              <div>
                <span className="text-white font-bold">Session-only — cannot be transferred</span>
                <p className="text-[#8B949E]">This cache lives in session storage: it survives reloads while the tab stays open, but <strong className="text-[#FF7B72]">closing the tab or switching browsers/devices wipes it</strong>. Nothing is stored on a server and nothing can be transferred. Use <strong className="text-white">&quot;Export as Markdown&quot;</strong> to keep a permanent copy.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#46E363] font-bold shrink-0">4.</span>
              <div>
                <span className="text-white font-bold">Clear it</span>
                <p className="text-[#8B949E]">A <strong className="text-white">&quot;Clear all&quot;</strong> button on the home page empties the session cache at any time.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'understanding',
      icon: <Zap className="w-5 h-5 text-[#58A6FF]" />,
      title: 'Understanding the Assessment',
      content: (
        <div className="space-y-3 text-sm text-[#C9D1D9] leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
              <h4 className="text-white font-bold mb-1">Hirability Score</h4>
              <p className="text-[#8B949E]">1-10 based on merged PRs, README quality, tech stack coherence, consistency, and originality. Scored harshly — most profiles sit below 6.</p>
            </div>
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
              <h4 className="text-white font-bold mb-1">SWOT Analysis</h4>
              <p className="text-[#8B949E]">Strengths, Weaknesses, Opportunities (market factors), Threats. All four quadrants are <strong className="text-[#FF7B72]">mandatory</strong> — an assessment missing any one is rejected and retried.</p>
            </div>
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
              <h4 className="text-white font-bold mb-1">Career Slope</h4>
              <p className="text-[#8B949E]">Trajectory: Rising Star, Steady Maintainer, Declining Activity, or Sporadic/Spiky. Includes burnout risk assessment.</p>
            </div>
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
              <h4 className="text-white font-bold mb-1">Buzzword vs Reality</h4>
              <p className="text-[#8B949E]">Bio hype words checked against actual code. A &quot;buzzword to reality ratio&quot; with a cheeky roast or praise.</p>
            </div>
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
              <h4 className="text-white font-bold mb-1">AI Partnership Assessment</h4>
              <p className="text-[#8B949E]">Distinguishes lazy AI slop from productive AI orchestration. Heavy but smart AI use is flagged as a <strong className="text-[#46E363]">strength</strong>.</p>
            </div>
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
              <h4 className="text-white font-bold mb-1">Behavioral Analysis</h4>
              <p className="text-[#8B949E]">Arrogance vs Confidence score. Archetype classification. Vibe check and behavioral flags.</p>
            </div>
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
              <h4 className="text-white font-bold mb-1">Per-Repo Assessment</h4>
              <p className="text-[#8B949E]">Each of the 15 most recent non-fork repos scored 1-10 independently with verdict and analysis.</p>
            </div>
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
              <h4 className="text-white font-bold mb-1">RAW LOG</h4>
              <p className="text-[#8B949E]">Full detailed report in markdown. Structured with headers, dividers, and color-coded emoji prefixes.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      icon: <AlertTriangle className="w-5 h-5 text-[#F85149]" />,
      title: 'Troubleshooting',
      content: (
        <div className="space-y-3 text-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#30363D]">
                  <th className="text-left text-[#8B949E] uppercase tracking-widest font-bold p-3">Error</th>
                  <th className="text-left text-[#8B949E] uppercase tracking-widest font-bold p-3">Fix</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI timed out', 'Switch to Gemini cloud or a larger local model (Qwen 2.5 7B, Mistral 7B). Small models are too slow for this task.'],
                  ['Prompt exceeds context', 'Switch to Gemini 2.5 Flash (1M tokens). Or use the Small prompt size setting for limited models.'],
                  ['Invalid JSON from AI', 'Switch to Gemini API (native JSON schema enforcement). Most reliable for structured output.'],
                  ['401 Unauthorized', 'Check that your API key in Settings is correct and has not expired.'],
                  ['Rate limited', 'Wait and retry. Add a GitHub PAT token for higher API limits.'],
                  ['Model echoes input', 'The model is too small for this task. Switch to Gemini or Qwen 2.5 7B.'],
                  ['Ollama not connecting', 'Run `ollama serve` in terminal. Check endpoint URL (default: http://localhost:11434). Pull the model first with `ollama pull qwen2.5:7b`.'],
                  ['SWOT incomplete', 'The model returned an assessment missing one of the four SWOT quadrants. Retry — if it persists, switch to a stronger model (Gemini 2.5 Flash or a model with 32K+ context).'],
                  ['No candidates saved', 'Assess some profiles first. They auto-save to session storage and appear under Previous Assessments on the home page.'],
                  ['Session storage error', 'You are likely in private/incognito browsing mode. Switch to normal mode.'],
                ].map(([err, fix], i) => (
                  <tr key={i} className="border-b border-[#30363D]">
                    <td className="p-3 text-[#FF7B72] font-bold whitespace-nowrap">{err}</td>
                    <td className="p-3 text-[#C9D1D9]">{fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'tips',
      icon: <Target className="w-5 h-5 text-[#E3B341]" />,
      title: 'Getting Better Results',
      content: (
        <div className="space-y-3 text-sm text-[#C9D1D9] leading-relaxed">
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <span className="text-[#46E363] font-bold shrink-0">→</span>
              <span><strong className="text-white">Use cloud models</strong> for the most accurate assessments. Gemini 2.5 Flash has a free tier and handles the full prompt effortlessly.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#46E363] font-bold shrink-0">→</span>
              <span><strong className="text-white">Add a GitHub PAT</strong> for access to more data — higher API rate limits, private repo analysis, more PR results.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#46E363] font-bold shrink-0">→</span>
              <span><strong className="text-white">Use &quot;Consult the AI&quot;</strong> on the assessment page to ask specific questions about a candidate&apos;s suitability for a particular role.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#46E363] font-bold shrink-0">→</span>
              <span><strong className="text-white">Use comparison custom questions</strong> to ask the AI which candidate fits a specific role. The AI considers all candidates&apos; data and gives a ranked recommendation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#46E363] font-bold shrink-0">→</span>
              <span><strong className="text-white">Keep the prompt size on &quot;Full&quot;</strong> unless you have a very small model (Phi, Llama 3.2 1B/3B). The small prompt sacrifices depth for token budget.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#46E363] font-bold shrink-0">→</span>
              <span><strong className="text-white">Reopen cached assessments</strong> from the Previous Assessments list on the home page — the result loads instantly with no new AI call. Hit <strong className="text-white">Reassess Profile</strong> only when the GitHub profile has actually changed.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#46E363] font-bold shrink-0">→</span>
              <span><strong className="text-white">Run multiple assessments</strong> to verify consistency. Score deviation should be at most ±0.3. If it jumps more, switch to a more capable model.</span>
            </li>
          </ul>
        </div>
      )
    },
  ];

  return (
    <div className="flex-1 min-h-screen pb-20">
      <header className="bg-[#161B22] border-b border-[#30363D] sticky top-0 z-40 shadow-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2 bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] rounded-md transition-colors text-[#C9D1D9]">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="font-bold text-lg text-white font-mono tracking-tight">
              Help & Guide
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8B949E] bg-[#0D1117] border border-[#30363D] px-2 py-1 rounded-full">v0.1</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {sections.map((section) => (
          <div key={section.id} id={section.id} className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 font-mono uppercase tracking-widest flex items-center gap-2 border-b border-[#30363D] pb-3">
              {section.icon}
              {section.title}
            </h2>
            {section.content}
          </div>
        ))}

        <div className="text-center text-xs text-[#8B949E] pt-4">
          <p>Still need help? Check the project&apos;s README or open an issue on GitHub.</p>
          <p className="mt-1">All data stays in your browser — no servers, no databases, no tracking.</p>
          <p className="mt-4 text-white/40">Built with ❤️ by <a href="https://github.com/Yuvraj-Sarathe" target="_blank" rel="noopener noreferrer" className="text-[#58A6FF] hover:underline">Yuvraj Sarathe</a></p>
        </div>
      </main>
    </div>
  );
}
