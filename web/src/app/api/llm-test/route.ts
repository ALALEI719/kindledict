import { NextResponse } from "next/server";

import { getExtractionModel, resolveLlmCredentials } from "@/lib/llm-credentials";
import { generateText } from "ai";
import type { LlmTestRequest } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LlmTestRequest;
    const credentials = resolveLlmCredentials(body.llm);
    const model = getExtractionModel(credentials);

    await generateText({
      model,
      prompt: 'Reply with exactly the word "ready".',
    });

    return NextResponse.json({
      ok: true,
      provider: credentials.provider,
      model: credentials.model,
      source: credentials.source,
      message: "API key works.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "API key test failed.";
    console.error("[llm-test]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
