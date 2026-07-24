# GitDeep

An AI-powered GitHub profile analyzer that delivers brutal, honest assessments of developer code quality, behavioral patterns, and career trajectory.

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://gitdeep.vercel.app)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![Local Models Guide](https://img.shields.io/badge/Docs-Local_Models-orange)](docs/LOCAL_MODELS.md)
[![Architecture Docs](https://img.shields.io/badge/Docs-Architecture-purple)](docs/ARCHITECTURE.md)

Try out the [GitDeep Live Application](https://gitdeep.vercel.app) directly in your browser.

GitDeep is a client-side web application using advanced AI models to evaluate GitHub profiles with behavioral analysis, buzzword detection, career trajectory tracking, and per-repository assessments.

---

## Features

- **Dual Assessment Modes**: Employer Mode (hirability analysis and scoring) and Developer Mode (mentorship and actionable guidance).
- **Deep Analysis**: Career slope detection, buzzword vs reality verification, AI usage quality assessment, behavioral pattern detection, and per-repository scoring.
- **Privacy-Focused Architecture**: Session-based execution with zero server database storage, telemetry, or tracking. Gemini and Anthropic calls are executed directly client-side, while requests to Ollama and OpenAI-compatible providers pass through a stateless Next.js API proxy (`app/api/ai/route.ts`) to avoid CORS restrictions without persisting API keys or data.
- **AI Provider Flexibility**: Supports 12+ cloud and local AI providers including Google Gemini, OpenAI, Anthropic, Groq, DeepSeek, OpenRouter, and local Ollama instances.
- **Rich Visualizations**: Interactive radar charts, career timeline meters, language distributions, and comparative candidate analysis.

---

## Quick Start

### Prerequisites

- Node.js 18.18.0+ and npm
- An AI provider API key (Google Gemini recommended for free tier)

### Installation

```bash
git clone https://github.com/Yuvraj-Sarathe/GitDeep.git
cd GitDeep
npm install
npm run dev
```

Access the local development server at [GitDeep Local Host](http://localhost:3000).

### Configuration

1. Visit [Google AI Studio API Key Setup](https://aistudio.google.com/) to obtain a free API key.
2. Open GitDeep Settings (gear icon in the navigation bar).
3. Select your AI Provider (e.g., Gemini API), enter your key, and select your target model.
4. (Optional) Provide a GitHub Personal Access Token (PAT) under Settings to increase GitHub API rate limits (from 60 to 5,000 requests/hour).

---

## Model Configuration

Choose a model based on hardware and assessment requirements:

| Provider | Recommended Model | Prompt Size | Employer Mode | Notes |
|---|---|---|---|---|
| Google | Gemini 2.5 Flash | Full | Yes | Recommended default (free tier available) |
| OpenAI | GPT-4o | Full | Yes | High accuracy and reasoning |
| Anthropic | Claude Sonnet 4 | Full | Yes | Excellent analysis quality |
| Ollama | Qwen 2.5 7B | Full | Yes | Recommended for local 8GB RAM systems |
| Ollama | Llama 3.1 8B | Full | Yes | Recommended for local 16GB RAM systems |

For detailed model benchmarks, small model optimization, and local setup steps, refer to the [Ollama & Local Models Guide](docs/LOCAL_MODELS.md).

---

## Docker Deployment

Build and run GitDeep in a container:

```bash
docker build -t gitdeep .
docker run -p 3000:3000 gitdeep
```

Open the application at [GitDeep Local Host Container](http://localhost:3000).

---

## Architecture & How It Works

GitDeep uses Next.js 15, TypeScript, Tailwind CSS, and Octokit:

1. **Data Collection**: Client fetches public profile data, non-fork repository metadata, README snippets, and merged PRs via the GitHub REST API.
2. **AI Processing**: Gemini and Anthropic requests are called directly from the browser; Ollama and OpenAI-compatible requests are proxied via the Next.js API route (`app/api/ai/route.ts`) to manage headers and avoid CORS issues.
3. **Visualization**: Formats structured JSON responses into hirability scores, SWOT matrices, radar charts, and mentorship steps.

For a full technical overview and directory layout, see [Architecture Documentation](docs/ARCHITECTURE.md).

---

## Known Limitations

- **Small Models**: Local models under 7B parameters may yield incomplete or shallow responses.
- **GitHub Rate Limits**: Unauthenticated GitHub API calls are limited to 60 requests per hour; using a Personal Access Token increases this to 5,000 requests per hour.

For a detailed list of constraints and upcoming features, see [Limitations & Roadmap](docs/LIMITATIONS.md).

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for development environment setup, code style standards, and pull request procedures.

---

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

---

## Developer

**Yuvraj Sarathe**

- [![GitHub](https://img.shields.io/badge/GitHub-Yuvraj--Sarathe-black)](https://github.com/Yuvraj-Sarathe)
- [![Portfolio](https://img.shields.io/badge/Portfolio-Website-blue)](https://yuvraj-sarathe.github.io/Portfolio)
- [![LinkedIn](https://img.shields.io/badge/LinkedIn-yuvraj--sarathe-blue)](https://linkedin.com/in/yuvraj-sarathe)
- [![LeetCode](https://img.shields.io/badge/LeetCode-Yuvraj__Sarathe-orange)](https://leetcode.com/Yuvraj_Sarathe)

---

## Contributors

<table>
<tr>
<td align="center"><a href="https://github.com/Yuvraj-Sarathe"><img src="https://avatars.githubusercontent.com/u/216678101?s=80" width="80" style="border-radius:50%" alt="Yuvraj-Sarathe"><br><sub><b>Yuvraj-Sarathe</b></sub></a></td>
<td align="center"><a href="https://github.com/MILAN-123865"><img src="https://avatars.githubusercontent.com/u/196552402?s=80" width="80" style="border-radius:50%" alt="MILAN-123865"><br><sub><b>MILAN-123865</b></sub></a></td>
<td align="center"><a href="https://github.com/PrathamReddy888"><img src="https://avatars.githubusercontent.com/u/219442049?s=80" width="80" style="border-radius:50%" alt="PrathamReddy888"><br><sub><b>PrathamReddy888</b></sub></a></td>
<td align="center"><a href="https://github.com/karrisanthoshigayatri"><img src="https://avatars.githubusercontent.com/u/268634585?s=80" width="80" style="border-radius:50%" alt="karrisanthoshigayatri"><br><sub><b>karrisanthoshigayatri</b></sub></a></td>
<td align="center"><a href="https://github.com/preranaanand07"><img src="https://avatars.githubusercontent.com/u/241425799?s=80" width="80" style="border-radius:50%" alt="preranaanand07"><br><sub><b>preranaanand07</b></sub></a></td>
</tr>
</table>

---

## Acknowledgments

- GitHub API for data access
- Google Gemini for free-tier AI capabilities
- Ollama for local model integration
- Next.js and Vercel for web infrastructure

---

## Support

- Open an issue on [GitHub Issues](https://github.com/Yuvraj-Sarathe/GitDeep/issues)
- Access the live application at [GitDeep Live Application](https://gitdeep.vercel.app)
