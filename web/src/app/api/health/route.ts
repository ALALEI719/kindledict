import { NextResponse } from "next/server";

import { hasCompileWorker } from "@/lib/compile-worker";
import { isByokRequired, resolveServerCredentials } from "@/lib/llm-credentials";
import { LLM_PRESETS } from "@/lib/llm-presets";

export async function GET() {
  const server = resolveServerCredentials();
  const byokRequired = isByokRequired();
  const mobiCompile = hasCompileWorker();

  return NextResponse.json({
    ok: true,
    ready: Boolean(server) && !byokRequired,
    beta: {
      byokRequired,
      presets: LLM_PRESETS.map((preset) => ({
        id: preset.id,
        label: preset.label,
        description: preset.description,
        provider: preset.provider,
        model: preset.model,
        baseUrl: preset.baseUrl,
        keyUrl: preset.keyUrl,
      })),
    },
    features: {
      extract: true,
      mobiCompile,
      hostedAi: Boolean(server) && !byokRequired,
    },
    llm: server && !byokRequired
      ? {
          provider: server.provider,
          model: server.model,
          source: "server",
        }
      : null,
    message: byokRequired
      ? "Public beta ready. Add your own API key to start generating dictionaries."
      : server
        ? "Service ready."
        : "Add your API key below, or configure server-side AI credentials.",
  });
}
