# Local AI Models & Ollama Setup

This guide provides detailed setup instructions, model compatibility benchmarks, and observations for running GitDeep with local AI models via Ollama.

---

## Setting Up Ollama

For privacy and zero API costs, you can run AI models locally using Ollama.

### 1. Installation

Download and install Ollama for your operating system from [Ollama Official Website](https://ollama.com).

### 2. Pulling Models

Run the following commands in your terminal to pull recommended models:

```bash
# Best overall balance for 8GB RAM systems
ollama pull qwen2.5:7b

# Mid-tier alternative
ollama pull mistral

# Recommended for 16GB+ RAM systems
ollama pull llama3.1:8b
```

### 3. Start the Ollama Server

```bash
ollama serve
```

Keep this terminal running while using GitDeep.

### 4. Configure GitDeep Settings

1. Click the Settings gear icon in GitDeep.
2. Set AI Provider to **Local Ollama**.
3. Endpoint: `http://localhost:11434`
4. Model: `qwen2.5:7b` (or your chosen model)
5. Prompt Size: **Full** (for 7B+ models) or **Small** (for <7B models)

---

## Model Recommendations & Compatibility

All models listed below have been tested for compatibility with GitDeep.

### Cloud Models

| Model | Provider | Prompt Size | Employer Mode | Status | Notes |
|---|---|---|---|---|---|
| Gemini 2.5 Flash | Google | Full | Yes | Working | Best overall — free tier available |
| GPT-4o | OpenAI | Full | Yes | Working | High accuracy |
| Claude Sonnet 4 | Anthropic | Full | Yes | Working | Strong reasoning |

### Local Models (Ollama)

| Model | Min RAM | Prompt Size | Employer Mode | Status | Notes |
|---|---|---|---|---|---|
| Llama 3.1 8B | 16 GB | Full | Yes | Working | Strong local option |
| Gemma 2 9B | 16 GB | Full | Yes | Working | Strong local option |
| Qwen 2.5 7B | 8 GB | Full | Yes | Working | Best balance for 8GB systems |
| Mistral 7B | 8 GB | Full | Yes | Working | Solid mid-tier alternative |
| Phi-3 Mini | 4 GB | Small | No | Partial | Shallow output; use Small prompt |
| Llama 3.2 3B | 4 GB | Small | No | Partial | Omits SWOT/red-flags sections |
| Llama 3.2 1B | 4 GB | Small | No | Not Working | Consistently returns malformed JSON |

### Not Recommended

- **Phi-1**: Too small — unreliable output.
- **TinyLlama**: Too small — unreliable output.
- **Llama 3.2 1B**: Returns broken/empty JSON even on Small prompt.

---

## Ollama & Small Model Testing Observations

Contributed by [karrisanthoshigayatri GitHub Profile](https://github.com/karrisanthoshigayatri) (ECSoC'26).

### How GitDeep Connects to Ollama

GitDeep uses a two-stage connection strategy in `app/api/ai/route.ts`:
1. **Primary**: OpenAI-compatible endpoint (`/v1/chat/completions`) for Ollama v0.2+.
2. **Fallback**: Retries via native `/api/generate` with forced `format: 'json'`.

### Prompt Size Impact

- **Full (~1200 tokens)**: Recommended for cloud models and 7B+ local models.
- **Small (~400 tokens)**: Required for 3B-6B local models to prevent JSON truncation.

### Model Performance Summary

- **qwen2.5:7b (Recommended)**: Structured, complete output for both Employer and Developer modes. Response time ~45-90s on mid-range GPU.
- **mistral:7b**: Well-structured output, slightly weaker behavioral analysis. Response time ~50-100s.
- **llama3.1:8b**: High quality assessment, handles full prompt reliably. Slower on 8GB RAM setups.
- **phi3:mini / llama3.2:3b**: Require Small prompt. Frequently omit detailed sections or produce thin output.
- **llama3.2:1b**: Not working due to malformed JSON responses.

### Troubleshooting Ollama

| Symptom | Cause | Resolution |
|---|---|---|
| Timeout after 150s | Model speed or prompt size | Switch to Small prompt or cloud provider |
| Blank assessment / parse error | Non-JSON text output | Use 7B+ model and check prompt settings |
| API Error 404 | Model not pulled | Run `ollama pull <model-name>` |
| API Error 500 | Ollama server not running | Run `ollama serve` |
| Missing SWOT / red flags | Model context capacity | Upgrade to 7B+ model |
