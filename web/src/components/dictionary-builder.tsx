"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { DictionaryEntry } from "@/lib/types";

import "@/components/landing/landing.css";

type Step = "form" | "preview";

interface EpubChapterOption {
  id: string;
  label: string;
  text: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function DictionaryBuilder() {
  const epubInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("form");
  const [bookTitle, setBookTitle] = useState("");
  const [chapterLabel, setChapterLabel] = useState("");
  const [chapterId, setChapterId] = useState("ch01");
  const [chapterText, setChapterText] = useState("");
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<"zip" | "mobi" | null>(
    null,
  );
  const [serviceReady, setServiceReady] = useState<boolean | null>(null);
  const [mobiCompileReady, setMobiCompileReady] = useState(false);

  const [epubFileName, setEpubFileName] = useState<string | null>(null);
  const [epubChapters, setEpubChapters] = useState<EpubChapterOption[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState("");

  const entryCountLabel = useMemo(() => {
    if (entries.length === 0) return "";
    return `${entries.length} entries ready`;
  }, [entries.length]);

  const canSubmit = chapterText.trim().length >= 100;

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setServiceReady(Boolean(data.ready));
      setMobiCompileReady(Boolean(data.features?.mobiCompile));
    } catch {
      setServiceReady(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  function applyChapter(chapter: EpubChapterOption, title?: string) {
    setChapterText(chapter.text);
    setChapterId(chapter.id);
    setChapterLabel(chapter.label);
    if (title) setBookTitle(title);
  }

  async function handleLoadSample() {
    setError(null);
    setLoading(true);
    setLoadingMessage("Loading sample chapter…");

    try {
      const response = await fetch("/samples/acok-ch04.txt");
      if (!response.ok) throw new Error("Could not load sample chapter.");
      const text = await response.text();
      setBookTitle("A Clash of Kings");
      setChapterLabel("Chapter 4 (Arya IV)");
      setChapterId("ak-ch04");
      setChapterText(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sample.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  async function handleEpubUpload(file: File) {
    setError(null);
    setLoading(true);
    setLoadingMessage("Reading EPUB…");
    setEpubFileName(file.name);
    setEpubChapters([]);
    setSelectedChapterId("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-epub", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "EPUB parsing failed.");
      }

      const chapters: EpubChapterOption[] = data.chapterTexts;
      setEpubChapters(chapters);
      if (data.title) setBookTitle(data.title);

      const first = chapters[0];
      if (first) {
        setSelectedChapterId(first.id);
        applyChapter(first, data.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse EPUB.");
      setEpubFileName(null);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  function handleChapterSelect(chapterId: string) {
    setSelectedChapterId(chapterId);
    const chapter = epubChapters.find((item) => item.id === chapterId);
    if (chapter) applyChapter(chapter);
  }

  async function handleExtract() {
    if (!serviceReady) {
      setError(
        "AI extraction is not configured yet. Add GOOGLE_GENERATIVE_AI_API_KEY (Gemini) or an OpenAI-compatible key on Vercel.",
      );
      return;
    }

    setLoading(true);
    setLoadingMessage("AI is reading your chapter and picking lookup terms…");
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
      setLoadingMessage("");
    }
  }

  async function handleGenerate() {
    if (!serviceReady) {
      setError(
        "AI extraction is not configured yet. Add GOOGLE_GENERATIVE_AI_API_KEY (Gemini) or an OpenAI-compatible key on Vercel.",
      );
      return;
    }

    setLoading(true);
    setLoadingMessage(
      "Generating dictionary — this may take 1–2 minutes for a long chapter…",
    );
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

      if (step === "form" && entries.length === 0) {
        setStep("preview");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  async function handleDownloadZipFromPreview() {
    setLoading(true);
    setLoadingMessage("Packaging dictionary files…");
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
      setLoadingMessage("");
    }
  }

  return (
    <div className="landing builder-page">
      <nav>
        <div className="container nav-inner">
          <Link href="/" className="logo">
            Kindle<span>Dict</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </nav>

      <main className="container builder-main">
        <div className="builder-header">
          <p className="hero-badge">MVP · Kindle fictionary builder</p>
          <h1>Turn a chapter into a Kindle dictionary</h1>
          <p className="hero-sub builder-sub">
            Upload a DRM-free EPUB or paste chapter text. AI extracts names,
            places, and book-specific terms, then packages a Kindle-compatible
            dictionary you can sideload.
          </p>
        </div>

        {serviceReady === false && (
          <div className="builder-banner builder-banner-warn">
            AI extraction is not live yet. Easiest setup without OpenAI: add{" "}
            <code>GOOGLE_GENERATIVE_AI_API_KEY</code> (Gemini, free tier on Google
            AI Studio). Or use DeepSeek via <code>OPENAI_COMPAT_BASE_URL</code>.
          </div>
        )}

        {serviceReady && !mobiCompileReady && (
          <div className="builder-banner builder-banner-info">
            Downloads are dictionary source ZIP files. Open{" "}
            <code>dict.opf</code> in Kindle Previewer 3 to export{" "}
            <code>.mobi</code>.
          </div>
        )}

        {error && <div className="builder-banner builder-banner-error">{error}</div>}

        {loading && loadingMessage && (
          <div className="builder-banner builder-banner-info">{loadingMessage}</div>
        )}

        {downloadFormat && (
          <div className="builder-banner builder-banner-success">
            {downloadFormat === "mobi"
              ? "Downloaded .mobi — copy to Kindle documents/dictionaries/"
              : "Downloaded ZIP — open dict.opf in Kindle Previewer 3 → Export .mobi"}
          </div>
        )}

        {step === "form" && (
          <div className="builder-card">
            <div className="builder-upload-zone">
              <p className="builder-upload-title">Upload your ebook</p>
              <p className="builder-hint">
                DRM-free EPUB only · max 15 MB · Amazon AZW/KFX not supported
              </p>
              <input
                ref={epubInputRef}
                type="file"
                accept=".epub,application/epub+zip"
                disabled={loading}
                className="builder-file-input"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleEpubUpload(file);
                }}
              />
              <button
                type="button"
                className="btn btn-primary builder-upload-btn"
                disabled={loading}
                onClick={() => epubInputRef.current?.click()}
              >
                Choose EPUB file
              </button>
              {epubFileName ? (
                <p className="builder-upload-status">
                  Loaded: <strong>{epubFileName}</strong>
                </p>
              ) : (
                <p className="builder-upload-status muted">
                  No file selected yet
                </p>
              )}
            </div>

            {epubChapters.length > 1 && (
              <label className="builder-field">
                <span>Select chapter from EPUB</span>
                <select
                  value={selectedChapterId}
                  onChange={(event) =>
                    handleChapterSelect(event.target.value)
                  }
                >
                  {epubChapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.label} ({chapter.text.length.toLocaleString()}{" "}
                      chars)
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="builder-divider">
              <span>or paste chapter text</span>
            </div>

            <div className="builder-grid">
              <label className="builder-field">
                <span>Book title</span>
                <input
                  value={bookTitle}
                  onChange={(event) => setBookTitle(event.target.value)}
                  placeholder="A Clash of Kings"
                />
              </label>
              <label className="builder-field">
                <span>Chapter label</span>
                <input
                  value={chapterLabel}
                  onChange={(event) => setChapterLabel(event.target.value)}
                  placeholder="Chapter 4 (Arya IV)"
                />
              </label>
            </div>

            <label className="builder-field">
              <span>Chapter id (optional)</span>
              <input
                value={chapterId}
                onChange={(event) => setChapterId(event.target.value)}
                placeholder="ak-ch04"
              />
            </label>

            <label className="builder-field">
              <span>Chapter text</span>
              <textarea
                value={chapterText}
                onChange={(event) => setChapterText(event.target.value)}
                rows={14}
                placeholder="Paste one chapter here, or upload an EPUB above and we will fill this in…"
              />
            </label>

            <p className="builder-hint">
              Personal study only. No DRM. Chapter text is sent to OpenAI for
              extraction and not stored after processing.
              {chapterText.length > 0 && (
                <> · {chapterText.length.toLocaleString()} characters</>
              )}
            </p>

            <div className="builder-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={loading}
                onClick={handleLoadSample}
              >
                Try sample chapter
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={loading || !canSubmit}
                onClick={handleExtract}
              >
                {loading ? "Working…" : "Preview entries"}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={loading || !canSubmit}
                onClick={handleGenerate}
              >
                {loading ? "Working…" : "Generate & download"}
              </button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="builder-preview">
            <div className="builder-preview-header">
              <div>
                <h2>Preview entries</h2>
                <p className="builder-hint">{entryCountLabel}</p>
              </div>
              <button
                type="button"
                className="builder-link-btn"
                onClick={() => setStep("form")}
              >
                Edit chapter
              </button>
            </div>

            <ul className="builder-entry-list">
              {entries.map((entry) => (
                <li key={entry.word}>
                  <div className="builder-entry-head">
                    <strong>{entry.word}</strong>
                    <span className="builder-tag">{entry.category}</span>
                  </div>
                  <p>{entry.definition}</p>
                  {entry.inflections && entry.inflections.length > 0 && (
                    <p className="builder-hint">
                      Also: {entry.inflections.join(", ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            <div className="builder-actions">
              <button
                type="button"
                className="btn btn-primary"
                disabled={loading}
                onClick={handleDownloadZipFromPreview}
              >
                Download dictionary ZIP
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={loading}
                onClick={handleGenerate}
              >
                Regenerate & download
              </button>
            </div>
          </div>
        )}

        <section className="builder-install">
          <h3>Install on Kindle</h3>
          <ol>
            <li>
              If you downloaded a ZIP, open <code>dict.opf</code> in{" "}
              <a
                href="https://www.amazon.com/gp/feature.html?docId=1000765261"
                target="_blank"
                rel="noopener noreferrer"
              >
                Kindle Previewer 3
              </a>{" "}
              and export as <code>.mobi</code>.
            </li>
            <li>
              Copy the <code>.mobi</code> to{" "}
              <code>documents/dictionaries/</code> on your Kindle (USB or email).
            </li>
            <li>
              While reading, long-press a word. If another dictionary opens, tap
              its name and switch to this one.
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
