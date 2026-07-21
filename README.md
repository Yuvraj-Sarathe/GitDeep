# GitDeep

An AI-powered GitHub profile analyzer that delivers brutal, honest assessments of any developer's work — from code quality to career trajectory.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://gitdeep.vercel.app)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)

**🚀 [Try GitDeep Live →](https://gitdeep.vercel.app)**

GitDeep is a client-side web application that uses advanced AI models to evaluate GitHub profiles with unprecedented depth. Unlike traditional portfolio scanners, GitDeep performs behavioral analysis, buzzword detection, career slope tracking, and per-repository assessments to give you the full picture.

---

## ✨ Features

### 🎯 Dual Assessment Modes

- **Employer Mode**: Brutal hirability analysis with no sugar-coating. Evaluates weaknesses, red flags, buzzword density, and provides a 1-10 hirability score with role recommendations.
- **Developer Mode**: Same honest assessment plus a detailed mentorship plan with actionable improvement steps, project suggestions, and learning paths.

### 🔍 Deep Analysis Capabilities

- **Career Slope Detection**: Tracks trajectory from account creation to present — Rising Star, Steady Maintainer, Declining Activity, or Sporadic patterns. Includes burnout risk assessment.
- **Buzzword vs Reality Check**: Compares bio/README hype words against actual code. Detects when developers claim "AI/ML expert" but write basic CRUD apps.
- **AI Usage Quality Assessment**: Distinguishes lazy AI slop (generic gradients, broken links, emoji spam) from high-quality AI orchestration (production-grade architecture, intentional tech choices).
- **Behavioral Analysis**: Confidence vs Arrogance scoring. Detects toxic patterns in PRs and communication style.
- **Per-Repository Scoring**: Each repo gets an independent 1-10 score with verdict, key highlights, and red flags.
- **SWOT Analysis**: Strengths, Weaknesses, Opportunities (market positioning), and Threats.
- **Merged PR Analysis**: Evaluates contributions to external repositories, not just owned repos.

### 🔒 Privacy-First Architecture

- **No Database**: 100% session-based. Zero data storage on servers.
- **Client-Side Processing**: All AI calls happen from your browser. Your API keys never touch our servers.
- **No Tracking**: No analytics, no cookies, no telemetry.

### 🤖 AI Provider Flexibility

Choose from 12+ AI providers:

- **Cloud**: Gemini (free tier), OpenAI, Anthropic, Groq, DeepSeek, Mistral, OpenRouter, Grok, Qwen, Kimi, NVIDIA NIM
- **Local**: Ollama (run models like Llama 3.1, Qwen 2.5, Mistral locally)

### 📊 Rich Visualizations

- Language distribution pie charts
- Strength/weakness radar charts
- Career timeline with growth meter
- Comparative candidate analysis (Employer Mode)

### 🔧 Advanced Features

- **GitHub PAT Support**: Analyze private repos and increase API rate limits
- **Custom Questions**: Ask the AI specific questions about a candidate's suitability
- **Candidate Comparison**: Compare up to 5 developers side-by-side with AI-powered ranking
- **Prompt Size Options**: Full (1200 tokens) for cloud models, Small (400 tokens) for weak local models

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- An AI provider API key (Gemini recommended — has free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/Yuvraj-Sarathe/GitDeep.git
cd GitDeep

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Configuration

**Get an API Key (Recommended: Gemini)**

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API Key" → Create API key (free tier available)
3. Copy the key

**Configure in App**

1. Click the Settings gear icon (bottom-right or top navigation)
2. Select AI Provider: Gemini API
3. Paste your API key
4. Model: `gemini-2.5-flash` (default)
5. Prompt Size: Full (recommended)

**Optional: GitHub PAT Token**

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Generate token with `repo` and `user` scopes
3. Add in Settings → GitHub PAT Token field
4. Benefits: Higher API rate limits, private repo analysis, more PR data

### Usage

1. Enter a GitHub username (e.g., `torvalds`)
2. Choose mode: Employer (hiring) or Developer (mentorship)
3. Click Generate Assessment
4. Wait 10-30 seconds for analysis
5. Review the detailed report, metrics, and recommendations

---

## 🐳 Docker Deployment

```bash
# Build the image
docker build -t gitdeep .

# Run the container
docker run -p 3000:3000 gitdeep
```

Access at [http://localhost:3000](http://localhost:3000)

---

## 🧠 Using Local AI Models (Ollama)

For complete privacy and no API costs, run AI models locally.

### Setup Ollama

**1. Install Ollama**

Download from [ollama.com](https://ollama.com) and install for your OS (Windows/Mac/Linux).

**2. Pull a Model**

```bash
# Recommended for 8GB RAM (best balance)
ollama pull qwen2.5:7b

# Alternative: Mistral 7B
ollama pull mistral

# For 16GB+ RAM (better quality)
ollama pull llama3.1:8b

# ⚠️ NOT recommended (too small for this task)
# ollama pull phi
# ollama pull llama3.2:1b
```

**3. Start Ollama Server**

```bash
ollama serve
```

Keep this terminal running.

**4. Configure GitDeep**

- Settings → AI Provider → Local Ollama
- Endpoint: `http://localhost:11434`
- Model: `qwen2.5:7b`
- Prompt Size: Full (if using 7B+ model)

---

## 🎯 Model Recommendations

Choose a model based on your available resources and desired assessment depth. All models listed below have been tested for compatibility with GitDeep's prompt system.

### Cloud Models (Recommended)

| Model | Provider | Prompt Size | Employer Mode | Status | Notes |
|---|---|---|---|---|---|
| Gemini 2.5 Flash | Google | Full | ✅ Yes | ✅ Working | Best overall — free tier available |
| GPT-4o | OpenAI | Full | ✅ Yes | ✅ Working | Premium option, high accuracy |
| Claude Sonnet 4 | Anthropic | Full | ✅ Yes | ✅ Working | Premium option, strong reasoning |

### Local Models (via Ollama)

| Model | Min RAM | Prompt Size | Employer Mode | Status | Notes |
|---|---|---|---|---|---|
| Llama 3.1 8B | 16 GB | Full | ✅ Yes | ✅ Working | Strong local option |
| Gemma 2 9B | 16 GB | Full | ✅ Yes | ✅ Working | Strong local option |
| Qwen 2.5 7B | 8 GB | Full | ✅ Yes | ✅ Working | Best balance for 8GB systems |
| Mistral 7B | 8 GB | Full | ✅ Yes | ✅ Working | Solid mid-tier alternative |
| Phi-3 Mini | 4 GB | Small | ❌ No | ⚠️ Partial | Produces shallow output; use Small prompt |
| Llama 3.2 3B | 4 GB | Small | ❌ No | ⚠️ Partial | Often omits SWOT/red-flags sections |
| Llama 3.2 1B | 4 GB | Small | ❌ No | ❌ Not Working | Consistently returns malformed JSON |

### Not Recommended

| Model | Reason |
|---|---|
| Phi-1 | Too small — produces unreliable output |
| TinyLlama | Too small — produces unreliable output |
| Llama 3.2 1B | Returns broken/empty JSON even on Small prompt |

> **Important:** Models under 7B parameters produce inaccurate results, including wrong scores, missing red flags, and shallow analysis. Use a cloud model or a 7B+ local model for reliable assessments.

---

## 🔬 Ollama & Small Model Testing Observations

> **Contributed by [@karrisanthoshigayatri](https://github.com/karrisanthoshigayatri) — ECSoC'26**

This section documents real-world observations from testing GitDeep with Ollama and various smaller models. Results are based on analyzing the same public GitHub profile across all models to ensure a fair comparison.

### How GitDeep Talks to Ollama

GitDeep uses a **two-stage connection strategy** (`app/api/ai/route.ts`):

1. **Primary**: Tries the OpenAI-compatible endpoint (`/v1/chat/completions`) — works with Ollama v0.2+
2. **Fallback**: If that fails, retries via Ollama's native `/api/generate` endpoint with `format: 'json'` forced

This means GitDeep is resilient to Ollama version differences, but you should still keep Ollama up to date for best results.

### Prompt Size — Why It Matters for Local Models

GitDeep offers two prompt sizes (configurable in Settings):

| Setting | Token Count | Best For |
|---|---|---|
| Full | ~1200 tokens | Cloud models, 7B+ local models |
| Small | ~400 tokens | 3B–6B local models |

**Always use Small prompt for models under 7B.** Full prompt on a 3B model causes incomplete responses and JSON truncation, which breaks the assessment parser entirely.

### Model-by-Model Results

#### ✅ `qwen2.5:7b` — **Recommended for local use**
- Both Employer and Developer modes produce structured, complete output
- SWOT, hirability score, per-repo scoring, and red flags all populate correctly
- Response time: ~45–90 seconds on a mid-range GPU (RTX 3060 or similar)
- Minor hallucination risk on low-data profiles (accounts with <5 repos)
- **Use Full prompt**

#### ✅ `mistral:7b` — **Solid alternative**
- Produces well-structured output in both modes
- Slightly weaker on behavioral analysis compared to Qwen 2.5
- Occasionally gives a score of exactly 7.0 (the prompt explicitly tells it not to — small models sometimes ignore this instruction)
- Response time: ~50–100 seconds
- **Use Full prompt**

#### ✅ `llama3.1:8b` — **Good, but slow**
- Assessment quality is good; handles the full prompt reliably
- Noticeably slower than Qwen 2.5 or Mistral on equivalent hardware
- Works best on 16 GB RAM systems; may swap on 8 GB
- **Use Full prompt**

#### ⚠️ `phi3:mini` — **Partial / use with caution**
- Only use with Small prompt — the full prompt causes truncated JSON output
- Hirability score and basic career slope do appear in output
- SWOT analysis is shallow (1-line entries instead of detailed bullets)
- Red flags section frequently empty even for obviously problematic profiles
- Behavioral analysis section is missing or generic
- **Use Small prompt only; do not rely on Employer Mode results**

#### ⚠️ `llama3.2:3b` — **Partial / unreliable for assessments**
- Completes the request but frequently omits entire sections (SWOT, red flags, per-repo scores)
- Score output is present but reasoning is thin
- Developer mode (mentorship) works better than Employer mode at this size
- Occasionally returns plain text instead of JSON, causing a parse failure
- **Use Small prompt; expect incomplete assessments**

#### ❌ `llama3.2:1b` — **Not working**
- Returns malformed or empty JSON on both Full and Small prompts
- Assessment page shows a parse error / blank result
- Not recommended at all — the model is simply too small to follow the structured output instruction

### Key Takeaways

- **7B is the minimum viable size** for a usable GitDeep assessment. Below that, JSON compliance breaks down and sections are silently dropped.
- The **Small prompt mode** is a meaningful improvement for 3B–6B models — it at least gets a parseable response — but output quality is still noticeably worse than 7B+.
- **Ollama's OpenAI-compatible endpoint** (`/v1/chat/completions`) works out of the box with recent Ollama versions. The native `/api/generate` fallback ensures older installs still connect.
- **Response times** can reach 2–3 minutes on CPU-only setups even for 7B models. The app has a built-in 150-second timeout — if you're on CPU, switch to a cloud model or the Small prompt.
- **Groq (cloud)** is a practical middle ground if you want Llama/Mistral quality without local hardware requirements — it's free-tier, fast, and uses the same OpenAI-compatible format.

### Troubleshooting Ollama

| Symptom | Likely Cause | Fix |
|---|---|---|
| "Ollama request timed out after 150s" | Model too slow / prompt too large | Switch to Small prompt or a faster model |
| Blank assessment / parse error | Model returned non-JSON text | Use a 7B+ model; enable Small prompt for smaller ones |
| "Ollama API error (404)" | Model not pulled yet | Run `ollama pull <model-name>` |
| "Ollama API error (500)" | Ollama server not running | Run `ollama serve` in a terminal |
| Missing SWOT / red flags sections | Model too small to follow full instruction | Use Small prompt; upgrade to 7B model |
| Score is exactly 7.0 | Model ignoring the "never exactly 7.0" instruction | Known quirk of smaller models; use 7B+ for reliable scoring |

### Custom Prompt for Ultra-Small Models

If your local model is still too small even for the "Small" prompt size:

1. Clone the repository locally (do **not** use the deployed website)
2. Use an external LLM (ChatGPT, Claude, Gemini) to shorten the prompts in `lib/ai.ts`
3. Find the `buildPrompt()` and `buildSmallPrompt()` functions
4. Ask the LLM: *"Condense this assessment prompt to 200 tokens while keeping core evaluation criteria"*
5. Replace the prompt strings in `lib/ai.ts` with the shortened versions
6. Run `npm run dev` and test at [http://localhost:3000](http://localhost:3000)

> **CRITICAL:** Do NOT deploy this modified version — it's for local testing only.
> **⚠️ Warning:** Ultra-compressed prompts will produce significantly less accurate assessments. This is a last resort for experimentation only.

---

## 📖 How It Works

### Assessment Logic

**1. Data Collection** (via GitHub API)

- User profile (bio, location, company, social links)
- Top 15 non-fork repositories
- README contents (first 1500 chars per repo)
- Language statistics (actual byte counts)
- Merged pull requests in external repos
- Account age and activity patterns

**2. AI Analysis** (1200-token instruction prompt)

- 3-tier band scoring system (1-4 Weak, 5-7 Average, 8-10 Strong)
- Hard signals: (a) merged PRs, (b) original repos with READMEs, (c) 6+ months consistency
- Behavioral pattern detection
- Buzzword extraction and tech stack verification
- AI slop detection vs quality orchestration
- Career trajectory calculation
- Per-repo independent scoring

**3. Output Generation**

- Hirability score (1.0-10.0, never exactly 7.0)
- SWOT analysis (all 4 fields always populated)
- Detailed markdown report with structured sections
- Radar charts for strengths/weaknesses
- Timeline visualization
- Role recommendations

### Score Stability

The hirability score uses a fixed 3-tier band system to ensure consistency:

- Maximum deviation between assessments of the same profile: ±1.0
- Temperature locked to 0 for deterministic output
- Band determined by presence/absence of 3 hard signals
- Fine-tuning within band based on quality factors

---

## ⚠️ Known Limitations & Drawbacks

### Current Issues

**Small Model Performance**
- Models under 7B parameters (Phi, Llama 3.2 1B/3B, TinyLlama) produce unreliable results
- Small prompt mode (400 tokens) sacrifices depth and accuracy
- Status: Actively working on optimizing small prompts for employer mode

**API Rate Limits**
- GitHub API: 60 requests/hour without token, 5000 with token
- Search API (for PRs): 10 requests/min without token, 30 with token
- Analyzing multiple candidates quickly can hit limits

**PR Data Limitations**
- Only fetches top 15 merged PRs (GitHub Search API limit)
- Cannot access PR diff details without individual API calls (would hit rate limits)
- Lines added/deleted currently set to 0

**README Truncation**
- Only first 1500 characters of each README analyzed
- Large documentation may be incompletely assessed

**Language Detection**
- Relies on GitHub's language detection (can be inaccurate for mixed projects)
- Generated/vendor code may skew language percentages

**Private Repo Analysis**
- Requires GitHub PAT token with appropriate scopes
- Token must be manually entered (no OAuth flow)

**Session Storage Limits**
- Assessed candidates stored in browser session storage (~5-10MB limit)
- Clearing browser data loses comparison history
- Private/incognito mode may block session storage

**AI Hallucinations**
- AI may occasionally infer details not present in data
- Behavioral analysis based on limited text samples (READMEs, bio)
- Confidence scores are AI estimates, not measured metrics

**No Real-Time Updates**
- Assessment is a snapshot at analysis time
- Must re-run to see updated profile data

**Context Window Constraints**
- Full prompt + profile data can exceed 8K tokens for prolific developers
- May require switching to models with larger context (32K+)

### Planned Improvements

- [ ] Optimize small prompt for employer mode accuracy
- [ ] Add caching layer for GitHub API responses
- [ ] Implement progressive README loading
- [ ] Add PR diff analysis (with rate limit handling)
- [ ] Export assessment reports as PDF/Markdown
- [ ] Add assessment history persistence (localStorage)
- [ ] Implement OAuth flow for GitHub authentication
- [ ] Add support for GitLab and Bitbucket profiles

---

## 🤝 Contributing

Help is appreciated! GitDeep is actively being improved, and contributions are welcome.

### How to Contribute

**Report Issues**
- Found a bug? Open an issue
- Include: Steps to reproduce, expected vs actual behavior, browser/OS, AI provider used

**Request Features**
- Have an idea? Open a feature request
- Describe the use case and expected behavior

**Submit Pull Requests**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Current Focus Areas

- **Small Model Optimization**: Making 3B-7B models produce employer-grade assessments
- **Prompt Engineering**: Reducing token count while maintaining analysis depth
- **Rate Limit Handling**: Smarter API call batching and caching
- **UI/UX Improvements**: Better mobile responsiveness, loading states

### Development Guidelines

- Follow existing code style (ESLint config provided)
- Test with multiple AI providers before submitting
- Update README if adding new features
- Keep client-side architecture (no server-side data storage)

---

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **Charts**: Recharts 3.8
- **GitHub API**: Octokit 5.0
- **AI SDKs**: Google GenAI, native fetch for others
- **Markdown**: react-markdown 10.1

### Project Structure

```
GitDeep/
├── app/
│   ├── page.tsx              # Home page (username input)
│   ├── assessment/page.tsx   # Assessment results page
│   ├── help/page.tsx         # Help & documentation
│   ├── layout.tsx            # Root layout with footer
│   ├── globals.css           # Global styles
│   └── api/ai/route.ts       # Server-side AI proxy (Ollama, OpenAI-compatible)
├── components/
│   └── SettingsModal.tsx     # Settings configuration UI
├── lib/
│   ├── ai.ts                 # AI provider logic & prompt engineering
│   ├── github.ts             # GitHub API data fetching
│   ├── store.tsx             # React Context for settings
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # Utility functions
├── public/
│   └── icon.svg              # Favicon
└── package.json
```

### Data Flow

1. User enters GitHub username → `app/page.tsx`
2. Navigate to `/assessment?user=username&mode=employer`
3. `fetchGitHubProfile()` calls GitHub API → `lib/github.ts`
4. `generateAssessment()` sends data to AI → `lib/ai.ts`
5. AI response parsed and normalized → `AssessmentResult`
6. Results rendered with charts and markdown → `app/assessment/page.tsx`
7. Session storage saves candidate for comparison

---

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details. Any distributed modifications must remain open-source under the same terms.

## 👨‍💻 Developer

**Yuvraj Sarathe**

- 🐙 GitHub: [@Yuvraj-Sarathe](https://github.com/Yuvraj-Sarathe)
- 🌐 Portfolio: [yuvraj-sarathe.github.io/Portfolio](https://yuvraj-sarathe.github.io/Portfolio)
- 💼 LinkedIn: [yuvraj-sarathe](https://linkedin.com/in/yuvraj-sarathe)
- 🧩 LeetCode: [Yuvraj_Sarathe](https://leetcode.com/Yuvraj_Sarathe)

## 👥 Contributors

<!-- readme: contributors -start -->
<!-- readme: contributors -end -->

## 🙏 Acknowledgments

- GitHub API for comprehensive developer data
- Google Gemini for reliable free-tier AI access
- Ollama community for local model support
- Next.js team for excellent developer experience

## 📞 Support

If you find GitDeep useful, please ⭐ star the repository!

For questions or issues:

- Open an issue on GitHub Issues
- Check the Help Page for detailed documentation
- Try the live app at [gitdeep.vercel.app](https://gitdeep.vercel.app)