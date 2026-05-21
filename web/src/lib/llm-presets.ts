import type { LlmProviderName } from "./llm";

export type LlmPresetId =
  | "google"
  | "deepseek"
  | "moonshot"
  | "openai"
  | "openrouter"
  | "custom";

export interface LlmPreset {
  id: LlmPresetId;
  label: string;
  description: string;
  provider: LlmProviderName;
  model: string;
  baseUrl: string;
  keyUrl: string;
  keyHint: string;
}

export const LLM_PRESETS: LlmPreset[] = [
  {
    id: "google",
    label: "Google Gemini",
    description: "Free tier available. Best default for public beta.",
    provider: "google",
    model: "gemini-2.5-flash",
    baseUrl: "",
    keyUrl: "https://aistudio.google.com/apikey",
    keyHint: "Starts with AIza…",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    description: "OpenAI-compatible API with domestic payment options.",
    provider: "openai-compatible",
    model: "deepseek-chat",
    baseUrl: "https://api.deepseek.com/v1",
    keyUrl: "https://platform.deepseek.com/api_keys",
    keyHint: "DeepSeek API key",
  },
  {
    id: "moonshot",
    label: "Moonshot (Kimi)",
    description: "OpenAI-compatible Kimi API.",
    provider: "openai-compatible",
    model: "moonshot-v1-8k",
    baseUrl: "https://api.moonshot.cn/v1",
    keyUrl: "https://platform.moonshot.cn/console/api-keys",
    keyHint: "Moonshot API key",
  },
  {
    id: "openai",
    label: "OpenAI",
    description: "Official OpenAI API.",
    provider: "openai-compatible",
    model: "gpt-4o-mini",
    baseUrl: "",
    keyUrl: "https://platform.openai.com/api-keys",
    keyHint: "Starts with sk-…",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    description: "One key for many models via OpenAI-compatible gateway.",
    provider: "openai-compatible",
    model: "google/gemini-2.5-flash",
    baseUrl: "https://openrouter.ai/api/v1",
    keyUrl: "https://openrouter.ai/keys",
    keyHint: "OpenRouter API key",
  },
  {
    id: "custom",
    label: "Custom OpenAI-compatible",
    description: "Any gateway that accepts OpenAI-style chat requests.",
    provider: "openai-compatible",
    model: "",
    baseUrl: "",
    keyUrl: "",
    keyHint: "Your provider API key",
  },
];

export function getLlmPreset(id: string): LlmPreset {
  return LLM_PRESETS.find((preset) => preset.id === id) ?? LLM_PRESETS[0]!;
}
