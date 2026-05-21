import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export type LlmProviderName = "google" | "openai-compatible";

export interface LlmConfig {
  provider: LlmProviderName;
  model: string;
  ready: boolean;
  setupHint: string;
}

function resolveProviderName(): LlmProviderName | null {
  const explicit = process.env.LLM_PROVIDER?.trim().toLowerCase();
  if (explicit === "google" || explicit === "gemini") return "google";
  if (explicit === "openai" || explicit === "openai-compatible") {
    return "openai-compatible";
  }

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) return "google";
  if (
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.OPENAI_COMPAT_API_KEY?.trim()
  ) {
    return "openai-compatible";
  }

  return null;
}

export function getLlmConfig(): LlmConfig {
  const provider = resolveProviderName();

  if (provider === "google") {
    const ready = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim());
    return {
      provider: "google",
      model:
        process.env.GOOGLE_CHAT_MODEL?.trim() ||
        process.env.GEMINI_MODEL?.trim() ||
        "gemini-2.0-flash",
      ready,
      setupHint:
        "Set GOOGLE_GENERATIVE_AI_API_KEY from Google AI Studio (free tier available, no OpenAI account needed).",
    };
  }

  if (provider === "openai-compatible") {
    const ready = Boolean(
      process.env.OPENAI_API_KEY?.trim() ||
        process.env.OPENAI_COMPAT_API_KEY?.trim(),
    );
    return {
      provider: "openai-compatible",
      model: process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini",
      ready,
      setupHint:
        "Set OPENAI_API_KEY. For DeepSeek/Moonshot/OpenRouter, also set OPENAI_COMPAT_BASE_URL.",
    };
  }

  return {
    provider: "google",
    model: "gemini-2.0-flash",
    ready: false,
    setupHint:
      "No LLM key found. Easiest without foreign payment: GOOGLE_GENERATIVE_AI_API_KEY (Gemini). Alternative: DeepSeek with OPENAI_COMPAT_BASE_URL.",
  };
}

export function getExtractionModel(): LanguageModel {
  const config = getLlmConfig();

  if (!config.ready) {
    throw new Error(config.setupHint);
  }

  if (config.provider === "google") {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    return google(config.model);
  }

  const apiKey =
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.OPENAI_COMPAT_API_KEY?.trim();

  const openai = createOpenAI({
    apiKey,
    baseURL: process.env.OPENAI_COMPAT_BASE_URL?.trim() || undefined,
  });

  return openai(config.model);
}
