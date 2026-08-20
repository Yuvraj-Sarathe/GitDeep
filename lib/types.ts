export type AIProvider =
  | 'gemini'
  | 'shared-gemini'
  | 'ollama'
  | 'openai'
  | 'anthropic'
  | 'openrouter'
  | 'grok'
  | 'groq'
  | 'mistral'
  | 'deepseek'
  | 'qwen'
  | 'kimi'
  | 'nvidia';

export type PromptSize = 'full' | 'small';

export interface AIProviderInfo {
  id: AIProvider;
  label: string;
  defaultEndpoint: string;
  defaultModel: string;
  docsUrl: string;
  needsKey: boolean;
  needsEndpoint: boolean;
  isOpenAICompatible: boolean;
}

export const AI_PROVIDERS: AIProviderInfo[] = [
  { id: 'gemini', label: 'Gemini API', defaultEndpoint: '', defaultModel: 'gemini-3.6-flash', docsUrl: 'https://aistudio.google.com/apikey', needsKey: true, needsEndpoint: false, isOpenAICompatible: false },
  { id: 'shared-gemini', label: 'GitDeep Free Key (Star)', defaultEndpoint: '', defaultModel: 'gemini-3.6-flash', docsUrl: '', needsKey: false, needsEndpoint: false, isOpenAICompatible: false },
  { id: 'ollama', label: 'Local Ollama', defaultEndpoint: 'http://localhost:11434', defaultModel: 'llama3.2', docsUrl: '', needsKey: false, needsEndpoint: true, isOpenAICompatible: false },
  { id: 'openai', label: 'OpenAI', defaultEndpoint: 'https://api.openai.com/v1/chat/completions', defaultModel: 'gpt-4o', docsUrl: 'https://platform.openai.com/api-keys', needsKey: true, needsEndpoint: true, isOpenAICompatible: true },
  { id: 'anthropic', label: 'Anthropic', defaultEndpoint: 'https://api.anthropic.com/v1/messages', defaultModel: 'claude-sonnet-4-20250514', docsUrl: 'https://console.anthropic.com/settings/keys', needsKey: true, needsEndpoint: false, isOpenAICompatible: false },
  { id: 'openrouter', label: 'OpenRouter', defaultEndpoint: 'https://openrouter.ai/api/v1/chat/completions', defaultModel: 'openai/gpt-4o', docsUrl: 'https://openrouter.ai/keys', needsKey: true, needsEndpoint: true, isOpenAICompatible: true },
  { id: 'grok', label: 'Grok (xAI)', defaultEndpoint: 'https://api.x.ai/v1/chat/completions', defaultModel: 'grok-3', docsUrl: 'https://console.x.ai', needsKey: true, needsEndpoint: true, isOpenAICompatible: true },
  { id: 'groq', label: 'Groq', defaultEndpoint: 'https://api.groq.com/openai/v1/chat/completions', defaultModel: 'llama-3.3-70b-versatile', docsUrl: 'https://console.groq.com/keys', needsKey: true, needsEndpoint: true, isOpenAICompatible: true },
  { id: 'mistral', label: 'Mistral AI', defaultEndpoint: 'https://api.mistral.ai/v1/chat/completions', defaultModel: 'mistral-large-latest', docsUrl: 'https://console.mistral.ai/api-keys/', needsKey: true, needsEndpoint: true, isOpenAICompatible: true },
  { id: 'deepseek', label: 'DeepSeek', defaultEndpoint: 'https://api.deepseek.com/chat/completions', defaultModel: 'deepseek-chat', docsUrl: 'https://platform.deepseek.com/api_keys', needsKey: true, needsEndpoint: true, isOpenAICompatible: true },
  { id: 'qwen', label: 'Qwen (Alibaba)', defaultEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', defaultModel: 'qwen-plus', docsUrl: 'https://bailian.console.aliyun.com/', needsKey: true, needsEndpoint: true, isOpenAICompatible: true },
  { id: 'kimi', label: 'Kimi (Moonshot)', defaultEndpoint: 'https://api.moonshot.cn/v1/chat/completions', defaultModel: 'moonshot-v1-8k', docsUrl: 'https://platform.moonshot.cn/console/api-keys', needsKey: true, needsEndpoint: true, isOpenAICompatible: true },
  { id: 'nvidia', label: 'NVIDIA NIM', defaultEndpoint: 'https://integrate.api.nvidia.com/v1/chat/completions', defaultModel: 'meta/llama-3.3-70b-instruct', docsUrl: 'https://build.nvidia.com/', needsKey: true, needsEndpoint: true, isOpenAICompatible: true },
];

export interface AppSettings {
  githubToken: string;
  aiProvider: AIProvider;
  apiKey: string;
  apiEndpoint: string;
  model: string;
  promptSize: PromptSize;
  notifyOnComplete: boolean;
  sharedKeyVerified: boolean;
  sharedKeyUsername: string;
}

export const defaultSettings: AppSettings = {
  githubToken: '',
  aiProvider: 'gemini',
  apiKey: '',
  apiEndpoint: '',
  model: 'gemini-3.6-flash',
  promptSize: 'full',
  notifyOnComplete: true,
  sharedKeyVerified: false,
  sharedKeyUsername: '',
};
