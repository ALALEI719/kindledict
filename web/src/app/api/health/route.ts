import { NextResponse } from "next/server";

export async function GET() {
  const hasLlmKey = Boolean(
    process.env.OPENAI_API_KEY?.trim() ||
      process.env.OPENAI_COMPAT_API_KEY?.trim(),
  );
  const hasCompileWorker = Boolean(process.env.COMPILE_WORKER_URL?.trim());
  const usesCompatGateway = Boolean(process.env.OPENAI_COMPAT_BASE_URL?.trim());

  return NextResponse.json({
    ok: true,
    ready: hasLlmKey,
    features: {
      extract: hasLlmKey,
      mobiCompile: hasCompileWorker,
    },
    llm: {
      provider: usesCompatGateway ? "openai-compatible" : "openai",
      model: process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini",
    },
    message: hasLlmKey
      ? "Service ready."
      : "Set OPENAI_API_KEY in Vercel. Compatible gateways also work with OPENAI_COMPAT_BASE_URL.",
  });
}
