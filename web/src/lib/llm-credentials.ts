import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

import { getLlmPreset } from "./llm-presets";
import type { LlmProviderName } from "./llm";
import type { ClientLlmConfig } from "./types";

export interface ResolvedLlmCredentials {
  provider: LlmProviderName;
  apiKey: string;
  model: string;
  baseUrl?: string;
  source: "client" | "server";
}

function getServerGoogleApiKey(): string {
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    ""
  );
}

function looksLikeGoogleApiKey(value: string): boolean {
  return value.startsWith("AIza") && value.length >= 30;
}

function looksLikeGenericApiKey(value: string): boolean {
  return value.trim().length >= 8;
}

export function isByokRequired(): boolean {
  if (process.env.KINDLE_DICT_BYOK_REQUIRED?.trim() === "true") {
    return true;
  }
  return !resolveServerCredentials();
}

export function resolveServerCredentials(): ResolvedLlmCredentials | null {
  const explicit = process.env.LLM_PROVIDER?.trim().toLowerCase();
  const googleKey = getServerGoogleApiKey();
  const openaiKey =
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.OPENAI_COMPAT_API_KEY?.trim() ||
    "";

  if (
    explicit === "google" ||
    explicit === "gemini" ||
    (!explicit && googleKey)
  ) {
    if (!looksLikeGoogleApiKey(googleKey)) return null;
    return {
      provider: "google",
      apiKey: googleKey,
      model:
        process.env.GOOGLE_CHAT_MODEL?.trim() ||
        process.env.GEMINI_MODEL?.trim() ||
        "gemini-2.5-flash",
      source: "server",
    };
  }

  if (
    explicit === "openai" ||
    explicit === "openai-compatible" ||
    (!explicit && openaiKey)
  ) {
    if (!looksLikeGenericApiKey(openaiKey)) return null;
    return {
      provider: "openai-compatible",
      apiKey: openaiKey,
      model: process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini",
      baseUrl: process.env.OPENAI_COMPAT_BASE_URL?.trim() || undefined,
      source: "server",
    };
  }

  return null;
}

export function normalizeClientLlmConfig(
  input?: ClientLlmConfig | null,
): ResolvedLlmCredentials | null {
  if (!input?.apiKey?.trim()) return null;

  const preset = getLlmPreset(input.presetId || "google");
  const provider = input.provider || preset.provider;
  const apiKey = input.apiKey.trim();
  const model = input.model?.trim() || preset.model;
  const baseUrl = input.baseUrl?.trim() || preset.baseUrl || undefined;

  if (provider === "google") {
    if (!looksLikeGoogleApiKey(apiKey)) {
      throw new Error(
        "Gemini API key looks invalid. It should start with AIza and come from Google AI Studio.",
      );
    }
    if (!model) {
      throw new Error("Choose a Gemini model, for example gemini-2.5-flash.");
    }
    return {
      provider: "google",
      apiKey,
      model,
      source: "client",
    };
  }

  if (!looksLikeGenericApiKey(apiKey)) {
    throw new Error("API key looks too short. Check your provider dashboard.");
  }
  if (!model) {
    throw new Error("Enter a model name for your provider.");
  }
  if (preset.id === "custom" && !baseUrl) {
    throw new Error("Custom providers need a base URL, e.g. https://api.example.com/v1");
  }

  return {
    provider: "openai-compatible",
    apiKey,
    model,
    baseUrl,
    source: "client",
  };
}

export function resolveLlmCredentials(
  client?: ClientLlmConfig | null,
): ResolvedLlmCredentials {
  const normalizedClient = client?.apiKey?.trim()
    ? normalizeClientLlmConfig(client)
    : null;

  if (normalizedClient) return normalizedClient;

  if (isByokRequired()) {
    throw new Error(
      "This deployment requires your own API key. Add one below — we do not store it on our servers.",
    );
  }

  const server = resolveServerCredentials();
  if (server) return server;

  throw new Error(
    "No AI provider configured. Add your API key below, or configure server-side keys for self-hosting.",
  );
}

export function getExtractionModel(
  credentials: ResolvedLlmCredentials,
): LanguageModel {
  if (credentials.provider === "google") {
    const google = createGoogleGenerativeAI({
      apiKey: credentials.apiKey,
    });
    return google(credentials.model);
  }

  const openai = createOpenAI({
    apiKey: credentials.apiKey,
    baseURL: credentials.baseUrl || undefined,
  });
  return openai(credentials.model);
}

export function getPublicBetaInfo() {
  return {
    byokRequired: isByokRequired(),
    providers: getLlmPreset("google").label,
  };
}
