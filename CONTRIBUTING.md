# Contributing to GitDeep

First off, thanks for wanting to contribute. GitDeep is an active project, and every bit of help matters. This document lays out the exact rules so your PR doesn't get rejected for avoidable reasons.

---

## Table of Contents

- [Development Environment](#development-environment)
- [Branching Strategy](#branching-strategy)
- [Code Style & Quality](#code-style--quality)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code Review Checklist](#code-review-checklist)

---

## Development Environment

### Prerequisites

- **Node.js** 18.18.0+ (use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to manage versions)
- **npm** (ships with Node.js)
- A GitHub account (for contributing, testing with real profiles)
- An AI provider API key (Gemini recommended — free tier available)

### Setup Steps

```bash
# 1. Fork the repository on GitHub.

# 2. Clone your fork
git clone https://github.com/<YOUR_USERNAME>/GitDeep.git
cd GitDeep

# 3. Add the upstream remote
git remote add upstream https://github.com/Yuvraj-Sarathe/GitDeep.git

# 4. Install dependencies
npm install

# 5. Copy environment variables
cp .env.example .env.local

# 6. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values. At minimum you need an API key for an AI provider:

```env
# Get a free key at https://aistudio.google.com/apikey
GEMINI_API_KEY="your-gemini-api-key"
```

For higher GitHub rate limits, also set:

```env
# Generate at GitHub → Settings → Developer settings → Personal access tokens
GIT_PAT_TOKEN="your-github-pat"
```

---

## Branching Strategy

```
main ──► feature/your-feature
      └──► fix/your-bug-fix
      └──► refactor/your-refactor
      └──► docs/your-doc-change
```

- **Always create a feature branch from `main`.** Never commit directly to `main`.
- Branch naming convention:
  - `feature/<short-description>` — new functionality
  - `fix/<short-description>` — bug fixes
  - `refactor/<short-description>` — code restructuring
  - `docs/<short-description>` — documentation changes
  - `chore/<short-description>` — tooling, CI, dependencies
- Keep branches short-lived. If a branch lives longer than a week, rebase it onto `main`.
- Delete your branch after it's merged.

```bash
git checkout main
git pull upstream main
git checkout -b feature/my-new-feature
```

---

## Code Style & Quality

This project enforces strict code quality. PRs that violate these rules will be asked to fix before review.

### 1. Run the Linter

```bash
npm run lint
```

The project uses **ESLint 9** with `eslint-config-next`. All warnings and errors must be resolved before submission. Do not disable lint rules without an explicit comment explaining why.

### 2. TypeScript Strictness

`tsconfig.json` has `strict: true`. This means:

- No `any` types (use `unknown` if you really must)
- No implicit `any` on parameters or returns
- All nullable values must be handled (use optional chaining and nullish coalescing)

### 3. Formatting

This project does not ship a Prettier config — the ESLint rules handle formatting. If you prefer Prettier, run it manually, but ESLint output overrides any formatting preference.

### 4. Client-Side Only

GitDeep is a **100% client-side** application. Do not introduce:

- Server-side databases or state
- Server-side data storage
- Telemetry, analytics, or tracking code
- Cookies (session storage is fine)

### 5. Styling

- Use **Tailwind CSS 4** utility classes. Avoid writing custom CSS unless absolutely necessary.
- Custom CSS goes in `app/globals.css` using the `@theme` directive or standard CSS.
- Follow the existing dark color palette (`#1A1A2E`, `#58A6FF`, etc.).

### 6. AI Provider Code

When adding or modifying AI provider logic in `lib/ai.ts`:

- Test with **at least two different providers** (one cloud, one local).
- Do not hard-code provider-specific logic in the assessment pipeline.
- Keep prompt engineering in the `buildPrompt()` / `buildSmallPrompt()` functions.

---

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short description>

[optional body]
```

**Types:**
- `feat` — new feature
- `fix` — bug fix
- `refactor` — code change that neither fixes a bug nor adds a feature
- `docs` — documentation only
- `chore` — tooling, dependencies, CI
- `style` — formatting, missing semicolons (no production code change)
- `perf` — performance improvement
- `test` — adding or fixing tests

**Examples:**
```
feat: add support for GitLab profile analysis
fix: handle empty README in repository scoring
docs: update API reference in README
chore: upgrade Next.js to 15.4.10
```

Keep commits atomic — one logical change per commit.

---

## Pull Request Process

Follow these steps exactly. Deviations will result in the PR being marked as "Changes Requested" until corrected.

### Step 1: Sync Your Branch

Before opening a PR, ensure your branch is up to date with upstream `main`:

```bash
git checkout main
git pull upstream main
git checkout your-branch
git rebase main
git push --force-with-lease
```

### Step 2: Verify Locally

Run these commands and confirm they all pass:

```bash
npm run lint       # Zero errors, zero warnings
npm run build      # Production build succeeds
```

### Step 3: Write a Good PR Title & Description

**Title format:** `[type]: brief description` (e.g., `[feat]: add Ollama health check endpoint`)

**Description must include:**
- What the change does
- Why it's needed (link to issue if applicable)
- How you tested it (which AI providers, which GitHub profiles)
- Screenshots (for UI changes)
- Any breaking changes or migration steps

### Step 4: Open the PR

1. Push your branch to your fork:

   ```bash
   git push origin your-branch
   ```

2. Go to [github.com/Yuvraj-Sarathe/GitDeep/pulls](https://github.com/Yuvraj-Sarathe/GitDeep/pulls)
3. Click **"New Pull Request"** → **"Compare across forks"**
4. Select:
   - **base repository:** `Yuvraj-Sarathe/GitDeep`
   - **base:** `main`
   - **head repository:** `<YOUR_USERNAME>/GitDeep`
   - **compare:** `your-branch`
5. Fill in the template, attach the checklist below, and submit.

### Step 5: Address Feedback

- A maintainer will review your PR within a few days.
- If changes are requested, make them on your branch and push again — the PR updates automatically.
- After addressing all feedback, re-request review via GitHub's review interface (not a new comment).

### Step 6: Merge

- Maintainers will squash-merge your PR into `main`.
- Once merged, delete your feature branch both locally and on your fork.

---

## Code Review Checklist

Reviewers will check for each of these. Make sure your PR satisfies all:

### Architecture & Design
- [ ] No server-side data storage introduced
- [ ] Follows the existing data flow (GitHub → AI → Render)
- [ ] No hard-coded provider-specific logic outside `lib/ai.ts`

### Code Quality
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] No `any` types
- [ ] No unused imports or variables
- [ ] Error handling is in place (especially for API calls)

### Testing
- [ ] Tested with at least one cloud AI provider (Gemini, OpenAI, etc.)
- [ ] Tested with a real GitHub profile (both active and inactive)
- [ ] Edge cases handled: empty response, rate-limit errors, missing data

### UI (if applicable)
- [ ] Responsive on mobile and desktop
- [ ] Loading states shown during async operations
- [ ] Error states shown with actionable messages

### Documentation
- [ ] README updated if adding new features
- [ ] New environment variables documented in `.env.example`
- [ ] TypeScript types added or updated for new interfaces

---

## Questions?

Open a [Discussion](https://github.com/Yuvraj-Sarathe/GitDeep/discussions) or an [Issue](https://github.com/Yuvraj-Sarathe/GitDeep/issues) — we're happy to help you get started.
