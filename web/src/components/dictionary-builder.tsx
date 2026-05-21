"use client";

import { useMemo, useState } from "react";

import type { DictionaryEntry } from "@/lib/types";

type Step = "form" | "preview";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function DictionaryBuilder() {
  const [step, setStep] = useState<Step>("form");
  const [bookTitle, setBookTitle] = useState("");
  const [chapterLabel, setChapterLabel] = useState("");
  const [chapterId, setChapterId] = useState("ch01");
  const [chapterText, setChapterText] = useState("");
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<"zip" | "mobi" | null>(
    null,
  );

  const entryCountLabel = useMemo(() => {
    if (entries.length === 0) return "";
    return `${entries.length} entries ready`;
  }, [entries.length]);

  async function handleExtract() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterText,
          bookTitle,
          chapterLabel,
          chapterId,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Extraction failed.");
      }

      setEntries(data.entries);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setDownloadFormat(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterText,
          bookTitle,
          chapterLabel,
          chapterId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Generation failed.");
      }

      const format =
        response.headers.get("X-KindleDict-Format") === "source-zip"
          ? "zip"
          : "mobi";
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const slug = slugify(chapterLabel || chapterId || "dictionary");
      anchor.href = url;
      anchor.download = `kindledict-${slug}.${format === "zip" ? "zip" : "mobi"}`;
      anchor.click();
      URL.revokeObjectURL(url);
      setDownloadFormat(format);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadZipFromPreview() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries,
          config: {
            title: `${bookTitle || "My Book"} — ${chapterLabel || "Chapter"} Companion Dictionary`,
            book_title: bookTitle || "My Book",
            chapter_label: chapterLabel || "Chapter 1",
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Build failed.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `kindledict-${slugify(chapterLabel || chapterId)}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
      setDownloadFormat("zip");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--accent-dark)]">
          Kindle fictionary builder
        </p>
        <h1 className="font-serif text-3xl font-bold text-[var(--text)] sm:text-4xl">
          Turn a chapter into a Kindle dictionary
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          Paste one chapter. We extract names, places, and book-specific terms,
          then package a Kindle-compatible dictionary you can sideload.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {downloadFormat && (
        <div className="mb-6 rounded-xl border border-[var(--green)]/30 bg-[#edf7f1] px-4 py-3 text-sm text-[var(--green)]">
          {downloadFormat === "mobi"
            ? "Downloaded .mobi file. Copy it to your Kindle documents/dictionaries/ folder."
            : "Downloaded source ZIP. Open dict.opf in Kindle Previewer 3 and export as .mobi."}
        </div>
      )}

      {step === "form" && (
        <div className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Book title</span>
              <input
                value={bookTitle}
                onChange={(event) => setBookTitle(event.target.value)}
                placeholder="A Clash of Kings"
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Chapter label</span>
              <input
                value={chapterLabel}
                onChange={(event) => setChapterLabel(event.target.value)}
                placeholder="Chapter 4 (Arya IV)"
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Chapter id (optional)</span>
            <input
              value={chapterId}
              onChange={(event) => setChapterId(event.target.value)}
              placeholder="ak-ch04"
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 sm:max-w-xs"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Chapter text</span>
            <textarea
              value={chapterText}
              onChange={(event) => setChapterText(event.target.value)}
              rows={14}
              placeholder="Paste the full chapter text here..."
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 font-serif leading-relaxed"
            />
          </label>

          <p className="text-xs text-[var(--muted)]">
            For personal study only. Use text you have the right to process. We
            do not store your chapter after the request completes.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading || chapterText.trim().length < 100}
              onClick={handleExtract}
              className="rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold text-white hover:bg-[var(--accent-dark)] disabled:opacity-50"
            >
              {loading ? "Working..." : "Extract entries"}
            </button>
            <button
              type="button"
              disabled={loading || chapterText.trim().length < 100}
              onClick={() => handleGenerate()}
              className="rounded-lg border-2 border-[var(--accent)] px-5 py-2.5 font-semibold text-[var(--accent)] hover:bg-[rgba(196,92,38,0.08)] disabled:opacity-50"
            >
              {loading ? "Working..." : "One-click generate & download"}
            </button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Preview entries</h2>
              <p className="text-sm text-[var(--muted)]">{entryCountLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Edit chapter
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <ul className="divide-y divide-[var(--border)]">
              {entries.map((entry) => (
                <li key={entry.word} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <strong>{entry.word}</strong>
                    <span className="rounded-full bg-[rgba(196,92,38,0.12)] px-2 py-0.5 text-xs font-medium text-[var(--accent-dark)]">
                      {entry.category}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {entry.definition}
                  </p>
                  {entry.inflections && entry.inflections.length > 0 && (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Also: {entry.inflections.join(", ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={handleDownloadZipFromPreview}
              className="rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold text-white hover:bg-[var(--accent-dark)] disabled:opacity-50"
            >
              Download dictionary ZIP
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleGenerate()}
              className="rounded-lg border-2 border-[var(--accent)] px-5 py-2.5 font-semibold text-[var(--accent)] hover:bg-[rgba(196,92,38,0.08)] disabled:opacity-50"
            >
              Regenerate & download
            </button>
          </div>
        </div>
      )}

      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[#f5f3f0] p-6 text-sm text-[var(--muted)]">
        <h3 className="mb-2 font-semibold text-[var(--text)]">
          Install on Kindle
        </h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            If you downloaded a ZIP, open <code>dict.opf</code> in Kindle
            Previewer 3 and export as <code>.mobi</code>.
          </li>
          <li>
            Copy the <code>.mobi</code> file to{" "}
            <code>documents/dictionaries/</code> on your Kindle.
          </li>
          <li>
            While reading, long-press a word. If another dictionary opens, tap
            its name and switch to this one.
          </li>
        </ol>
      </section>
    </div>
  );
}
