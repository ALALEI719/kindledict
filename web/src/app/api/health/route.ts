import { NextResponse } from "next/server";

import { getLlmConfig } from "@/lib/llm";

export async function GET() {
  const llm = getLlmConfig();
  const hasCompileWorker = Boolean(process.env.COMPILE_WORKER_URL?.trim());

  return NextResponse.json({
    ok: true,
    ready: llm.ready,
    features: {
      extract: llm.ready,
      mobiCompile: hasCompileWorker,
    },
    llm: {
      provider: llm.provider,
      model: llm.model,
    },
    message: llm.ready ? "Service ready." : llm.setupHint,
  });
}
