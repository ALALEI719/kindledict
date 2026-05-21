import { NextResponse } from "next/server";

import {
  buildDictionaryFiles,
  defaultConfigFromRequest,
} from "@/lib/build-dictionary";
import { createDictionaryZip } from "@/lib/create-zip";
import type { BuildRequest } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BuildRequest;

    const config = {
      ...defaultConfigFromRequest({
        bookTitle: body.config.book_title,
        chapterLabel: body.config.chapter_label,
      }),
      ...body.config,
    };

    const files = buildDictionaryFiles(body.entries, config);
    const zipBlob = await createDictionaryZip(files);
    const buffer = Buffer.from(await zipBlob.arrayBuffer());

    const slug = (config.chapter_label || "chapter")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="kindledict-${slug || "dictionary"}.zip"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to build dictionary.";
    console.error("[build]", error);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
