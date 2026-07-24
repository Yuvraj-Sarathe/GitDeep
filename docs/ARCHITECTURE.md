# GitDeep Architecture Documentation

This document describes the design, tech stack, data flow, and directory layout of the GitDeep application.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **Charts**: Recharts 3.8
- **GitHub API**: Octokit 5.0
- **AI SDKs**: `@google/genai`, native fetch for OpenAI/Ollama compatible endpoints
- **Markdown Rendering**: react-markdown 10.1

---

## Project Structure

```text
GitDeep/
├── app/
│   ├── page.tsx              # Home page (username input)
│   ├── assessment/page.tsx   # Assessment results page
│   ├── help/page.tsx         # Help & documentation page
│   ├── layout.tsx            # Root layout with navigation & footer
│   ├── globals.css           # Global styles & Tailwind definitions
│   └── api/ai/route.ts       # Stateless Next.js API route proxy for Ollama / OpenAI-compatible requests
├── components/
│   └── SettingsModal.tsx     # Configuration modal (API keys, models)
├── lib/
│   ├── ai.ts                 # AI prompts & provider execution logic
│   ├── github.ts             # Octokit GitHub data fetching logic
│   ├── store.tsx             # Context provider for user settings
│   ├── types.ts              # Core TypeScript type definitions
│   └── utils.ts              # Utility helpers
├── docs/                     # Detailed documentation files
├── public/                   # Static assets & icons
└── package.json
```

---

## Data Flow & Request Boundaries

1. **User Input & Navigation**: User submits a GitHub username on `app/page.tsx` and is redirected to `/assessment?user=<username>&mode=<employer|developer>`.
2. **GitHub Data Fetching**: `fetchGitHubProfile()` in `lib/github.ts` fetches public profile data, top non-fork repositories, README snippets, and merged PRs via the GitHub REST API.
3. **AI Execution Path**:
   - **Direct Client-Side**: Calls to **Google Gemini** (`@google/genai`) and **Anthropic** execute directly from the user's browser.
   - **Server Proxy Handler (`app/api/ai/route.ts`)**: Calls to **Ollama** and **OpenAI-compatible** endpoints are proxied through a stateless Next.js API route to bypass browser CORS restrictions and forward request headers securely.
   - **Deployment Limitation for Ollama**: When GitDeep is deployed on hosted cloud platforms (e.g. Vercel), server-side route requests targeting `http://localhost:11434` execute on the hosting server rather than the user's local machine. For hosted deployments, running GitDeep locally (`npm run dev` / Docker) is recommended. If exposing a local Ollama instance via a tunnel (e.g., ngrok or Cloudflare Tunnel), **access control must be configured** (such as HTTP Basic Auth, IP allowlists, or Cloudflare Access), as Ollama's default localhost API lacks built-in authentication and should never be exposed unauthenticated to the public internet.
4. **Parsing & Normalization**: AI JSON responses are parsed and normalized into a standard `AssessmentResult` structure.
5. **Rendering & Session Storage**: Results are displayed dynamically with Recharts and saved to tab-scoped `sessionStorage` for candidate comparisons.
