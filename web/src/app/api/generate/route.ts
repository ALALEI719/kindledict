import { NextResponse } from "next/server";

import {
  buildDictionaryFiles,
  defaultConfigFromRequest,
} from "@/lib/build-dictionary";
import { compileWithWorker } from "@/lib/compile-worker";
import { createDictionaryZip } from "@/lib/create-zip";
import { extractEntries } from "@/lib/extract-entries";
import type { GenerateRequest } from "@/lib/types";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const entries = await extractEntries(body);

    const config = {
      ...defaultConfigFromRequest({
        bookTitle: body.bookTitle,
        chapterLabel: body.chapterLabel,
      }),
      ...body.config,
    };

    const files = buildDictionaryFiles(entries, config);
    const slug = (config.chapter_label || "chapter")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const baseFilename = `kindledict-${slug || "dictionary"}`;
    const mobi = await compileWithWorker(files, `${baseFilename}.mobi`);

    if (mobi) {
      return new NextResponse(mobi.buffer, {
        headers: {
          "Content-Type": "application/x-mobipocket-ebook",
          "Content-Disposition": `attachment; filename="${mobi.filename}"`,
          "X-KindleDict-Entries": String(entries.length),
          "X-KindleDict-Format": "mobi",
        },
      });
    }

    const zipBlob = await createDictionaryZip(files);
    const zipBuffer = Buffer.from(await zipBlob.arrayBuffer());

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${baseFilename}.zip"`,
        "X-KindleDict-Entries": String(entries.length),
        "X-KindleDict-Format": "source-zip",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate dictionary.";
    console.error("[generate]", error);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
