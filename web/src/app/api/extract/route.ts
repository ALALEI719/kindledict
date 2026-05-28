import { NextResponse } from "next/server";

import { extractEntries } from "@/lib/extract-entries";
import { getAccountAccessStateFromCookieHeader } from "@/lib/supabase/server";
import type { ExtractRequest } from "@/lib/types";
import { getTrialStateFromCookieHeader, mergeAccessState } from "@/lib/trial-access";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExtractRequest;
    const cookieHeader = request.headers.get("cookie");
    const access = mergeAccessState(
      getTrialStateFromCookieHeader(cookieHeader),
      await getAccountAccessStateFromCookieHeader(cookieHeader),
    );

    if (body.usageMode !== "sample" && body.usageMode !== "paid") {
      if (!access.freeChapterRemaining) {
        throw new Error(
          "Your free chapter has already been used. Purchase KindleDict to keep generating dictionaries.",
        );
      }
      if (body.generationScope && body.generationScope !== "selected-chapter") {
        throw new Error(
          "Full-book and multi-chapter generation are part of the paid plan. Start with one free chapter, then purchase to keep going.",
        );
      }
    }

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
