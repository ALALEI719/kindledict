import {
  isByokRequired,
  resolveLlmCredentials,
  resolveServerCredentials,
} from "./llm-credentials";
import type { ClientLlmConfig } from "./types";

export type LlmProviderName = "google" | "openai-compatible";

export interface LlmConfig {
  provider: LlmProviderName;
  model: string;
  ready: boolean;
  setupHint: string;
  byokRequired: boolean;
  serverConfigured: boolean;
}

export function getLlmConfig(client?: ClientLlmConfig | null): LlmConfig {
  const byokRequired = isByokRequired();
  const server = resolveServerCredentials();

  try {
    const resolved = resolveLlmCredentials(client);
    return {
      provider: resolved.provider,
      model: resolved.model,
      ready: true,
      setupHint:
        resolved.source === "client"
          ? "Using your API key for this request."
          : "Server AI provider configured.",
      byokRequired,
      serverConfigured: Boolean(server),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI provider not configured.";
    return {
      provider: server?.provider ?? "google",
      model: server?.model ?? "gemini-2.5-flash",
      ready: false,
      setupHint: message,
      byokRequired,
      serverConfigured: Boolean(server),
    };
  }
}
