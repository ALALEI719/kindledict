import { NextResponse } from "next/server";

import { extractEntries } from "@/lib/extract-entries";
import type { ExtractRequest } from "@/lib/types";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExtractRequest;
    const entries = await extractEntries(body);

    return NextResponse.json({
      ok: true,
      count: entries.length,
      entries,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to extract entries.";
    console.error("[extract]", error);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
