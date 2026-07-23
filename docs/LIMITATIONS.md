# GitDeep Limitations & Roadmap

This document outlines current technical limitations and planned feature improvements for GitDeep.

---

## Known Technical Limitations

### Small Model Performance
- Models under 7B parameters (Phi, Llama 3.2 1B/3B, TinyLlama) can produce truncated or unparseable output.
- The Small prompt mode (~400 tokens) reduces prompt context size to accommodate weaker local models.

### API Rate Limits
- **GitHub Unauthenticated API**: 60 requests/hour.
- **GitHub Authenticated (PAT)**: 5000 requests/hour.
- **Search API (PRs)**: 10 requests/min unauthenticated, 30 requests/min with PAT.

### Data Scope
- **PR Data**: Limited to top 15 merged PRs per user via Search API.
- **README Parsing**: Truncated to first 1500 characters per repo to conserve context tokens.
- **Language Detection**: Dependent on GitHub linguistic statistics; vendor scripts can skew data.

### Storage & Session Scope
- Assessed profiles stored in browser session storage (~5MB limit).
- Clearing browser cache removes saved candidate history.

---

## Planned Roadmap

- [ ] Small prompt optimization for employer mode accuracy
- [ ] Response caching layer for GitHub API requests
- [ ] Progressive README loading for deep documentation analysis
- [ ] PR diff analysis with rate-limit safeguards
- [ ] Export assessment reports as PDF and Markdown files
- [ ] Local storage persistence for assessment history
- [ ] GitHub OAuth authentication flow
- [ ] Support for GitLab and Bitbucket profiles
