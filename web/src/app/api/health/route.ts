import { NextResponse } from "next/server";

import { hasCompileWorker } from "@/lib/compile-worker";
import { isByokRequired, resolveServerCredentials } from "@/lib/llm-credentials";
import { LLM_PRESETS } from "@/lib/llm-presets";
import { getAccountAccessStateFromCookieHeader } from "@/lib/supabase/server";
import { getTrialStateFromCookieHeader, mergeAccessState } from "@/lib/trial-access";

export async function GET(request: Request) {
  const server = resolveServerCredentials();
  const byokRequired = isByokRequired();
  const mobiCompile = hasCompileWorker();
  const cookieHeader = request.headers.get("cookie");
  const access = mergeAccessState(
    getTrialStateFromCookieHeader(cookieHeader),
    await getAccountAccessStateFromCookieHeader(cookieHeader),
  );

  const accountState = await getAccountAccessStateFromCookieHeader(cookieHeader);

  return NextResponse.json({
    ok: true,
    ready: Boolean(server) && !byokRequired,
    account: {
      configured: accountState.configured,
      signedIn: accountState.signedIn,
      email: accountState.email,
      paid: accountState.paid,
      planSlug: accountState.planSlug,
    },
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
    access,
    llm: server && !byokRequired
      ? {
          provider: server.provider,
          model: server.model,
          source: "server",
        }
      : null,
    message: byokRequired
      ? "Add your own API key to start generating dictionaries."
      : server
        ? "KindleDict is ready."
        : "Add your API key below, or configure server-side AI credentials.",
  });
}
