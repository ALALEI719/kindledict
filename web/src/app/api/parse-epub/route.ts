import { NextResponse } from "next/server";

import { MAX_EPUB_BYTES, parseEpubBuffer } from "@/lib/parse-epub";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "No EPUB file uploaded." },
        { status: 400 },
      );
    }

    if (!file.name.toLowerCase().endsWith(".epub")) {
      return NextResponse.json(
        { ok: false, error: "Please upload a .epub file." },
        { status: 400 },
      );
    }

    if (file.size > MAX_EPUB_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: "EPUB is too large. Use a single chapter or paste text instead (max 15 MB).",
        },
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const parsed = await parseEpubBuffer(buffer);

    return NextResponse.json({
      ok: true,
      title: parsed.title,
      chapters: parsed.chapters.map((chapter) => ({
        id: chapter.id,
        label: chapter.label,
        textLength: chapter.text.length,
        preview: chapter.text.slice(0, 180),
      })),
      // Full chapter text returned for client-side selection (not stored server-side)
      chapterTexts: parsed.chapters.map((chapter) => ({
        id: chapter.id,
        label: chapter.label,
        text: chapter.text,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse EPUB.";
    console.error("[parse-epub]", error);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
