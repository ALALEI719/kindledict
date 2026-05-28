import { NextResponse } from "next/server";

import {
  buildDictionaryFiles,
  defaultConfigFromRequest,
} from "@/lib/build-dictionary";
import { compileWithWorker } from "@/lib/compile-worker";
import { createDictionaryZip } from "@/lib/create-zip";
import {
  createTrialCookieValue,
  getTrialCookieMaxAge,
  getTrialCookieName,
  getTrialStateFromCookieHeader,
} from "@/lib/trial-access";
import type { BuildRequest } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BuildRequest;
    const access = getTrialStateFromCookieHeader(request.headers.get("cookie"));

    if (body.usageMode !== "sample" && body.usageMode !== "paid" && !access.freeChapterRemaining) {
      throw new Error(
        "Your free chapter has already been used. Purchase KindleDict to keep generating dictionaries.",
      );
    }

    const config = {
      ...defaultConfigFromRequest({
        bookTitle: body.config.book_title,
        chapterLabel: body.config.chapter_label,
      }),
      ...body.config,
    };

    const files = buildDictionaryFiles(body.entries, config);
    const slug = (config.chapter_label || "chapter")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const baseFilename = `kindledict-${slug || "dictionary"}`;
    const shouldConsumeFreeChapter =
      body.usageMode === "free-chapter" && access.freeChapterRemaining;

    const applyTrialCookie = (response: NextResponse<ArrayBuffer | Buffer>) => {
      if (!shouldConsumeFreeChapter) return response;
      response.cookies.set(getTrialCookieName(), createTrialCookieValue(true), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: getTrialCookieMaxAge(),
      });
      response.headers.set("X-KindleDict-Free-Chapter-Consumed", "true");
      return response;
    };

    try {
      const mobi = await compileWithWorker(files, `${baseFilename}.mobi`);

      if (mobi) {
        return applyTrialCookie(new NextResponse(mobi.buffer, {
          headers: {
            "Content-Type": "application/x-mobipocket-ebook",
            "Content-Disposition": `attachment; filename="${mobi.filename}"`,
            "X-KindleDict-Format": "mobi",
          },
        }));
      }
    } catch (error) {
      if (process.env.COMPILE_WORKER_FALLBACK_ZIP?.trim() === "false") {
        throw error;
      }
      console.error("[build:compile-worker]", error);
    }

    const zipBlob = await createDictionaryZip(files);
    const buffer = Buffer.from(await zipBlob.arrayBuffer());

    return applyTrialCookie(new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${baseFilename}.zip"`,
        "X-KindleDict-Format": "source-zip",
      },
    }));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to build dictionary.";
    console.error("[build]", error);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
