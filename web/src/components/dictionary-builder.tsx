"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ClientLlmConfig, DictionaryEntry } from "@/lib/types";
import {
  filterExtractableChapters,
  mergeDictionaryEntries,
} from "@/lib/merge-entries";
import {
  buildGenerationPlan,
  buildScanPreviewText,
  GENERATION_SCOPES,
  getGenerationScopeOption,
  type GenerationScopeId,
} from "@/lib/generation-scope";
import { ApiKeyPanel } from "@/components/api-key-panel";
import { useUserLlm } from "@/hooks/use-user-llm";

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

function formatUserError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("api key not found") ||
    lower.includes("api key expired") ||
    lower.includes("invalid api key") ||
    lower.includes("no longer available to new users")
  ) {
    if (lower.includes("no longer available")) {
      return "Gemini model was updated. In Vercel, set GOOGLE_CHAT_MODEL to gemini-2.5-flash, save, redeploy, then try again.";
    }
    return "Your Gemini API key is invalid or expired. Expand AI provider & API key below and click Verify & save.";
  }
  return message;
}

function buildLlmPayload(clientConfig: ClientLlmConfig | null) {
  return clientConfig ? { llm: clientConfig } : {};
}

export function DictionaryBuilder() {
  const epubInputRef = useRef<HTMLInputElement>(null);
  const apiPanelRef = useRef<HTMLDivElement>(null);
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
  const [byokRequired, setByokRequired] = useState(true);
  const userLlm = useUserLlm();

  const [epubFileName, setEpubFileName] = useState<string | null>(null);
  const [epubChapters, setEpubChapters] = useState<EpubChapterOption[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [bookProgress, setBookProgress] = useState<{
    current: number;
    total: number;
    label: string;
  } | null>(null);
  const [generationScope, setGenerationScope] =
    useState<GenerationScopeId>("trial-15k");
  const [customCharLimit, setCustomCharLimit] = useState("20000");
  const [showPasteText, setShowPasteText] = useState(false);
  const [apiPanelOpen, setApiPanelOpen] = useState(false);
  const [apiPanelHighlight, setApiPanelHighlight] = useState(false);

  const extractableChapters = useMemo(
    () => filterExtractableChapters(epubChapters),
    [epubChapters],
  );

  const generationPlan = useMemo(() => {
    if (extractableChapters.length > 0) {
      return buildGenerationPlan(
        extractableChapters,
        generationScope,
        Number(customCharLimit) || 0,
      );
    }

    if (chapterText.trim().length >= 100) {
      return buildGenerationPlan(
        [
          {
            id: chapterId || "paste",
            label: chapterLabel || "Pasted text",
            text: chapterText,
          },
        ],
        generationScope,
        Number(customCharLimit) || 0,
      );
    }

    return {
      chapters: [],
      totalChars: 0,
      scopeLabel: "",
      requestCount: 0,
    };
  }, [
    extractableChapters,
    chapterText,
    chapterId,
    chapterLabel,
    generationScope,
    customCharLimit,
  ]);

  const scopeOption = useMemo(
    () => getGenerationScopeOption(generationScope),
    [generationScope],
  );

  const hasFullBook = extractableChapters.length > 0;

  const scanPreviewText = useMemo(() => {
    if (generationPlan.chapters.length === 0) return "";
    return buildScanPreviewText(generationPlan);
  }, [generationPlan]);

  const entryCountLabel = useMemo(() => {
    if (entries.length === 0) return "";
    return `${entries.length} entries ready`;
  }, [entries.length]);

  const canSubmit = chapterText.trim().length >= 100;
  const canExtract = byokRequired
    ? userLlm.isConfigured
    : userLlm.isConfigured || serviceReady === true;
  const canGenerateContent =
    generationPlan.chapters.length > 0 && (hasFullBook || canSubmit);

  const ensureExtractReady = () => {
    if (canExtract) return true;
    setApiPanelOpen(true);
    setApiPanelHighlight(true);
    window.setTimeout(() => setApiPanelHighlight(false), 4000);
    setError(
      byokRequired
        ? "Configure your AI API key first: expand AI provider & API key below, enter your key, and click Verify & save."
        : "AI extraction is not configured. Add an API key, or configure credentials on the server.",
    );
    apiPanelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return false;
  };

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setByokRequired(Boolean(data.beta?.byokRequired));
      setServiceReady(Boolean(data.ready));
    } catch {
      setServiceReady(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    if (userLlm.loaded && !userLlm.isConfigured && byokRequired) {
      setApiPanelOpen(true);
    }
  }, [userLlm.loaded, userLlm.isConfigured, byokRequired]);

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
      setShowPasteText(true);
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
      }
      setShowPasteText(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse EPUB.");
      setEpubFileName(null);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  async function extractChapterEntries(
    chapter: EpubChapterOption,
  ): Promise<DictionaryEntry[]> {
    const response = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterText: chapter.text,
        bookTitle,
        chapterLabel: chapter.label,
        chapterId: chapter.id,
        ...buildLlmPayload(userLlm.clientConfig),
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(
        data.error || `Extraction failed for ${chapter.label}.`,
      );
    }

    return data.entries as DictionaryEntry[];
  }

  async function downloadDictionaryZip(
    dictionaryEntries: DictionaryEntry[],
    scopeLabel: string,
    fileSlug: string,
  ) {
    const response = await fetch("/api/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entries: dictionaryEntries,
        config: {
          title: `${bookTitle || "My Book"} — Companion Dictionary`,
          book_title: bookTitle || "My Book",
          chapter_label: scopeLabel,
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
    anchor.download = `kindledict-${fileSlug}.zip`;
    anchor.click();
    URL.revokeObjectURL(url);
    setDownloadFormat("zip");
  }

  async function handleGenerateDictionary() {
    if (!ensureExtractReady()) return;

    if (generationPlan.chapters.length === 0) {
      setError(
        hasFullBook
          ? generationScope === "custom-chars"
            ? "Custom limit must be at least 100 characters."
            : "This EPUB has no readable chapters long enough to process."
          : "Upload an EPUB or paste at least a few paragraphs of chapter text.",
      );
      return;
    }

    setLoading(true);
    setError(null);
    setDownloadFormat(null);
    setBookProgress({
      current: 0,
      total: generationPlan.requestCount,
      label: generationPlan.chapters[0]?.label ?? "",
    });

    try {
      const collected: DictionaryEntry[] = [];

      for (let index = 0; index < generationPlan.chapters.length; index += 1) {
        const chapter = generationPlan.chapters[index]!;
        setBookProgress({
          current: index + 1,
          total: generationPlan.requestCount,
          label: chapter.label,
        });
        setLoadingMessage(
          generationPlan.requestCount === 1
            ? `Reading ${generationPlan.totalChars.toLocaleString()} characters…`
            : `Reading chapter ${index + 1} of ${generationPlan.requestCount}: ${chapter.label}`,
        );

        const chapterEntries = await extractChapterEntries(chapter);
        collected.push(...chapterEntries);
      }

      const merged = mergeDictionaryEntries(collected);
      if (merged.length === 0) {
        throw new Error("No dictionary entries were extracted from this selection.");
      }

      setEntries(merged);
      setChapterLabel(generationPlan.scopeLabel);
      setLoadingMessage("Packaging your dictionary…");

      await downloadDictionaryZip(
        merged,
        generationPlan.scopeLabel,
        slugify(`${bookTitle || "book"}-${generationScope}`),
      );

      setStep("preview");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Dictionary generation failed.";
      setError(formatUserError(message));
    } finally {
      setLoading(false);
      setLoadingMessage("");
      setBookProgress(null);
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
          <p className="hero-badge">Public beta</p>
          <h1>Build a Kindle dictionary from your book</h1>
          <p className="hero-sub builder-sub">
            Upload EPUB, choose how much to scan, and download one companion
            dictionary for Kindle.
          </p>
        </div>

        {error && <div className="builder-banner builder-banner-error">{error}</div>}

        {loading && bookProgress && (
          <div className="builder-progress">
            <div className="builder-progress-label">
              Chapter {bookProgress.current} of {bookProgress.total}:{" "}
              {bookProgress.label}
            </div>
            <div className="builder-progress-track">
              <div
                className="builder-progress-fill"
                style={{
                  width: `${Math.round((bookProgress.current / bookProgress.total) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {loading && loadingMessage && !bookProgress && (
          <div className="builder-banner builder-banner-info">{loadingMessage}</div>
        )}

        {downloadFormat && (
          <div className="builder-banner builder-banner-success">
            Downloaded ZIP — open dict.opf in Kindle Previewer 3 → Export .mobi
          </div>
        )}

        {step === "form" && (
          <div className="builder-card builder-workspace">
            <div className="builder-upload-zone builder-upload-compact">
              <p className="builder-upload-title">1. Add your book text</p>
              <p className="builder-hint builder-source-hint">
                Upload a DRM-free EPUB (max 15 MB) or paste chapter text.
                {epubFileName ? (
                  <>
                    {" "}
                    Loaded <strong>{epubFileName}</strong>
                    {hasFullBook && (
                      <> · {extractableChapters.length} chapters</>
                    )}
                  </>
                ) : null}
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
              <div className="builder-source-actions">
                <button
                  type="button"
                  className={`btn btn-primary${hasFullBook ? " builder-source-active" : ""}`}
                  disabled={loading}
                  onClick={() => epubInputRef.current?.click()}
                >
                  Choose EPUB
                </button>
                <button
                  type="button"
                  className={`btn btn-secondary${showPasteText && !hasFullBook ? " builder-source-active" : ""}`}
                  disabled={loading || hasFullBook}
                  onClick={() => {
                    if (hasFullBook) return;
                    setShowPasteText((value) => !value);
                  }}
                >
                  {showPasteText
                    ? "Hide pasted text"
                    : "Or paste chapter text instead"}
                </button>
              </div>
              {(showPasteText || (!hasFullBook && chapterText.length > 0)) && (
                <label className="builder-field builder-paste-field">
                  <span>Chapter text</span>
                  <textarea
                    value={chapterText}
                    onChange={(event) => setChapterText(event.target.value)}
                    rows={8}
                    placeholder="Paste a chapter here if you do not have an EPUB…"
                  />
                </label>
              )}
            </div>

            <div className="builder-section-label">2. Dictionary settings</div>

            <label className="builder-field">
              <span>Book title</span>
              <input
                value={bookTitle}
                onChange={(event) => setBookTitle(event.target.value)}
                placeholder="A Clash of Kings"
              />
            </label>

            <div
              className={`builder-grid ${generationScope === "custom-chars" ? "builder-grid-3" : ""}`}
            >
              <label className="builder-field">
                <span>How much to scan</span>
                <select
                  value={generationScope}
                  onChange={(event) =>
                    setGenerationScope(event.target.value as GenerationScopeId)
                  }
                >
                  {GENERATION_SCOPES.map((scope) => (
                    <option key={scope.id} value={scope.id}>
                      {scope.label}
                    </option>
                  ))}
                </select>
              </label>

              {generationScope === "custom-chars" && (
                <label className="builder-field">
                  <span>Character limit</span>
                  <input
                    type="number"
                    min={100}
                    max={120000}
                    value={customCharLimit}
                    onChange={(event) =>
                      setCustomCharLimit(event.target.value)
                    }
                    placeholder="20000"
                  />
                </label>
              )}
            </div>

            <p className="builder-hint builder-scope-hint">
              {scopeOption.description} · {scopeOption.estimatedRequests}
              {generationPlan.totalChars > 0 && (
                <>
                  {" "}
                  · {generationPlan.totalChars.toLocaleString()} characters
                </>
              )}
            </p>

            {hasFullBook && (
              <label className="builder-field builder-scan-preview">
                <span>Text to scan (preview — updates when you change the option above)</span>
                <textarea
                  readOnly
                  value={
                    scanPreviewText ||
                    "Not enough readable text in this scan range. Try a different option."
                  }
                  rows={10}
                  className="builder-preview-text"
                />
              </label>
            )}

            {userLlm.loaded && !canExtract && canGenerateContent && (
              <div
                className="builder-banner builder-banner-warn builder-api-callout"
                role="alert"
              >
                <strong>API key required</strong>
                <p>
                  Before generating your dictionary, expand{" "}
                  <strong>AI provider &amp; API key</strong> below, enter your
                  key, and click <strong>Verify &amp; save</strong>.
                </p>
              </div>
            )}

            <button
              type="button"
              className={`btn btn-primary builder-generate-btn${
                !canExtract && canGenerateContent ? " builder-generate-needs-key" : ""
              }`}
              disabled={loading || !canGenerateContent}
              onClick={handleGenerateDictionary}
            >
              {loading && bookProgress
                ? `Generating ${bookProgress.current}/${bookProgress.total}…`
                : "Generate dictionary"}
            </button>

            <div className="builder-secondary-actions">
              <button
                type="button"
                className="builder-link-btn"
                disabled={loading}
                onClick={handleLoadSample}
              >
                Try sample chapter
              </button>
            </div>

            {userLlm.loaded && (
              <div ref={apiPanelRef}>
                <ApiKeyPanel
                  byokRequired={byokRequired}
                  settings={userLlm.settings}
                  preset={userLlm.preset}
                  presets={userLlm.presets}
                  isConfigured={userLlm.isConfigured}
                  testStatus={userLlm.testStatus}
                  testMessage={userLlm.testMessage}
                  open={apiPanelOpen}
                  highlighted={apiPanelHighlight}
                  onOpenChange={setApiPanelOpen}
                  onPresetChange={userLlm.setPresetId}
                  onSettingsChange={userLlm.updateSettings}
                  onTest={() => void userLlm.testSettings()}
                />
              </div>
            )}
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
                Back to book
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
                onClick={handleGenerateDictionary}
              >
                Regenerate
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
