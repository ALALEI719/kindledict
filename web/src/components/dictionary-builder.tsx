"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { DictionaryEntry } from "@/lib/types";

import "@/components/landing/landing.css";

type Step = "form" | "preview";
type InputMode = "paste" | "epub";

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
  const [step, setStep] = useState<Step>("form");
  const [inputMode, setInputMode] = useState<InputMode>("paste");
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
      setInputMode("paste");
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
        "AI extraction is not configured yet. Ask the site owner to add OPENAI_API_KEY on Vercel.",
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
        "AI extraction is not configured yet. Ask the site owner to add OPENAI_API_KEY on Vercel.",
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
            AI extraction is not live yet — <code>OPENAI_API_KEY</code> must be
            set in Vercel. You can still load the sample chapter to explore the
            UI, but generate will fail until the key is added.
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
            <div className="builder-tabs">
              <button
                type="button"
                className={inputMode === "paste" ? "builder-tab active" : "builder-tab"}
                onClick={() => setInputMode("paste")}
              >
                Paste text
              </button>
              <button
                type="button"
                className={inputMode === "epub" ? "builder-tab active" : "builder-tab"}
                onClick={() => setInputMode("epub")}
              >
                Upload EPUB
              </button>
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

            {inputMode === "epub" ? (
              <div className="builder-field">
                <span>EPUB file (DRM-free, max 15 MB)</span>
                <input
                  type="file"
                  accept=".epub,application/epub+zip"
                  disabled={loading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleEpubUpload(file);
                  }}
                />
                {epubFileName && (
                  <p className="builder-hint">Loaded: {epubFileName}</p>
                )}
                {epubChapters.length > 1 && (
                  <label className="builder-field" style={{ marginTop: 12 }}>
                    <span>Select chapter</span>
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
              </div>
            ) : (
              <label className="builder-field">
                <span>Chapter text</span>
                <textarea
                  value={chapterText}
                  onChange={(event) => setChapterText(event.target.value)}
                  rows={14}
                  placeholder="Paste the full chapter text here…"
                />
              </label>
            )}

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
