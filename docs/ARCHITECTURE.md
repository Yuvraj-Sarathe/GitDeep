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
│   └── api/ai/route.ts       # Server-side proxy for Ollama / OpenAI endpoints
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

## Data Flow Pipeline

1. **User Input**: User submits a GitHub username on the landing page (`app/page.tsx`).
2. **Navigation**: User is redirected to `/assessment?user=<username>&mode=<employer|developer>`.
3. **GitHub Data Fetching**: `fetchGitHubProfile()` in `lib/github.ts` collects user bio, public repos, README snippets, commit patterns, and merged PRs.
4. **AI Generation**: `generateAssessment()` in `lib/ai.ts` compiles prompt instructions and sends data to the configured AI provider.
5. **Parsing & Normalization**: Output is parsed into a structured `AssessmentResult` object.
6. **Rendering**: Results page (`app/assessment/page.tsx`) displays metrics, SWOT analysis, radar charts, and mentorship advice.
7. **Session Storage**: Candidate results are saved in session storage for candidate comparison features.
