import { NextResponse } from "next/server";

import {
  buildDictionaryFiles,
  defaultConfigFromRequest,
} from "@/lib/build-dictionary";
import { createDictionaryZip } from "@/lib/create-zip";
import { extractEntries } from "@/lib/extract-entries";
import type { GenerateRequest } from "@/lib/types";

export const maxDuration = 300;

async function compileWithWorker(
  files: Record<string, string>,
): Promise<ArrayBuffer | null> {
  const workerUrl = process.env.COMPILE_WORKER_URL?.replace(/\/$/, "");
  const workerSecret = process.env.COMPILE_WORKER_SECRET;

  if (!workerUrl) return null;

  const response = await fetch(`${workerUrl}/compile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(workerSecret ? { Authorization: `Bearer ${workerSecret}` } : {}),
    },
    body: JSON.stringify({ files }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Compile worker failed: ${detail.slice(0, 200)}`);
  }

  return response.arrayBuffer();
}

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
    const mobiBuffer = await compileWithWorker({ ...files });

    if (mobiBuffer) {
      const slug = (config.chapter_label || "chapter")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      return new NextResponse(mobiBuffer, {
        headers: {
          "Content-Type": "application/x-mobipocket-ebook",
          "Content-Disposition": `attachment; filename="kindledict-${slug || "dictionary"}.mobi"`,
          "X-KindleDict-Entries": String(entries.length),
        },
      });
    }

    const zipBlob = await createDictionaryZip(files);
    const zipBuffer = Buffer.from(await zipBlob.arrayBuffer());
    const slug = (config.chapter_label || "chapter")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="kindledict-${slug || "dictionary"}.zip"`,
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
