import { NextResponse } from "next/server";

export async function GET() {
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY?.trim());
  const hasCompileWorker = Boolean(process.env.COMPILE_WORKER_URL?.trim());

  return NextResponse.json({
    ok: true,
    ready: hasOpenAi,
    features: {
      extract: hasOpenAi,
      mobiCompile: hasCompileWorker,
    },
    message: hasOpenAi
      ? "Service ready."
      : "OPENAI_API_KEY is not configured. Add it in Vercel project settings.",
  });
}
