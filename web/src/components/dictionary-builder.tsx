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
  type GenerationScopeId,
} from "@/lib/generation-scope";
import { friendlyFetchError, readApiJson } from "@/lib/api-response";
import {
  MAX_FULL_BOOK_EXTRACT_CHARS,
  MAX_FULL_BOOK_REQUESTS,
  splitChaptersForExtract,
  truncateForExtract,
} from "@/lib/chapter-limits";
import { MAX_EPUB_BYTES, parseEpubBuffer } from "@/lib/parse-epub";
import { ApiKeyPanel } from "@/components/api-key-panel";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";
import { useUserLlm } from "@/hooks/use-user-llm";
import { buildLocalizedScanPreviewText } from "@/lib/i18n/scan-preview";
import { getLocalizedGenerationScopes } from "@/lib/i18n/scopes";
import { formatMessage } from "@/lib/i18n/messages";

import "@/components/landing/landing.css";

type Step = "form" | "preview";

interface EpubChapterOption {
  id: string;
  label: string;
  text: string;
}

interface AccessState {
  freeChapterRemaining: boolean;
  paid: boolean;
  sampleAllowed: boolean;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatUserError(
  message: string,
  errors: {
    geminiModel: string;
    geminiKey: string;
  },
): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("api key not found") ||
    lower.includes("api key expired") ||
    lower.includes("invalid api key") ||
    lower.includes("no longer available to new users")
  ) {
    if (lower.includes("no longer available")) {
      return errors.geminiModel;
    }
    return errors.geminiKey;
  }
  return message;
}

function buildLlmPayload(clientConfig: ClientLlmConfig | null) {
  return clientConfig ? { llm: clientConfig } : {};
}

function filenameFromDisposition(value: string | null): string | null {
  const match = value?.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? null;
}

export function DictionaryBuilder() {
  const { locale, messages: m } = useLocale();
  const b = m.builder;
  const paymentLink = process.env.NEXT_PUBLIC_KINDLE_DICT_PAYMENT_LINK_URL;
  const generationScopes = useMemo(
    () => getLocalizedGenerationScopes(locale),
    [locale],
  );

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
  const [mobiCompileReady, setMobiCompileReady] = useState(false);
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
  const [access, setAccess] = useState<AccessState>({
    freeChapterRemaining: true,
    paid: false,
    sampleAllowed: true,
  });
  const [contentSource, setContentSource] = useState<"sample" | "epub" | "pasted">(
    "pasted",
  );
  const sampleLoadedFromUrlRef = useRef(false);

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
        selectedChapterId,
        locale,
      );
    }

    if (chapterText.trim().length >= 100) {
      return buildGenerationPlan(
        [
          {
            id: chapterId || "paste",
            label: chapterLabel || b.scopeLabels.pastedText,
            text: chapterText,
          },
        ],
        generationScope,
        Number(customCharLimit) || 0,
        chapterId || "paste",
        locale,
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
    selectedChapterId,
    locale,
    b.scopeLabels.pastedText,
  ]);

  const scopeOption = useMemo(
    () =>
      generationScopes.find((scope) => scope.id === generationScope) ??
      generationScopes[0]!,
    [generationScopes, generationScope],
  );

  const hasFullBook = extractableChapters.length > 0;
  const trialMode =
    contentSource === "sample"
      ? "sample"
      : access.paid
        ? "paid"
        : "free-chapter";

  const limitError = useMemo(() => {
    if (generationPlan.chapters.length === 0) return null;

    if (!access.paid && hasFullBook && generationScope !== "selected-chapter") {
      return b.errors.paidPlanRequired;
    }

    if (generationScope === "full-book") {
      if (generationPlan.totalChars > MAX_FULL_BOOK_EXTRACT_CHARS) {
        return formatMessage(b.errors.fullBookTooLargeChars, {
          count: MAX_FULL_BOOK_EXTRACT_CHARS.toLocaleString(),
        });
      }

      if (generationPlan.requestCount > MAX_FULL_BOOK_REQUESTS) {
        return formatMessage(b.errors.fullBookTooLargeRequests, {
          count: MAX_FULL_BOOK_REQUESTS,
        });
      }
    }

    if (!access.paid && !access.freeChapterRemaining && contentSource !== "sample") {
      return b.errors.trialUsed;
    }

    return null;
  }, [
    access.freeChapterRemaining,
    access.paid,
    b.errors.fullBookTooLargeChars,
    b.errors.fullBookTooLargeRequests,
    b.errors.paidPlanRequired,
    b.errors.trialUsed,
    contentSource,
    generationPlan.chapters.length,
    generationPlan.requestCount,
    generationPlan.totalChars,
    generationScope,
    hasFullBook,
  ]);

  const scanPreviewText = useMemo(() => {
    if (generationPlan.chapters.length === 0) return "";
    return buildLocalizedScanPreviewText(generationPlan, locale);
  }, [generationPlan, locale]);

  const entryCountLabel = useMemo(() => {
    if (entries.length === 0) return "";
    return formatMessage(b.entriesReady, { count: entries.length });
  }, [entries.length, b.entriesReady]);

  const canSubmit = chapterText.trim().length >= 100;
  const canExtract = byokRequired
    ? userLlm.isConfigured
    : userLlm.isConfigured || serviceReady === true;
  const canGenerateContent =
    generationPlan.chapters.length > 0 && (hasFullBook || canSubmit) && !limitError;

  const ensureExtractReady = () => {
    if (canExtract) return true;
    setApiPanelOpen(true);
    setApiPanelHighlight(true);
    window.setTimeout(() => setApiPanelHighlight(false), 4000);
    setError(
      byokRequired ? b.errors.needApiKey : b.errors.aiNotConfigured,
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
      setMobiCompileReady(Boolean(data.features?.mobiCompile));
      setAccess({
        freeChapterRemaining: Boolean(data.access?.freeChapterRemaining ?? true),
        paid: Boolean(data.access?.paid ?? false),
        sampleAllowed: Boolean(data.access?.sampleAllowed ?? true),
      });
    } catch {
      setServiceReady(false);
      setMobiCompileReady(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void checkHealth();
    });
  }, [checkHealth]);

  useEffect(() => {
    if (userLlm.loaded && !userLlm.isConfigured && byokRequired) {
      queueMicrotask(() => setApiPanelOpen(true));
    }
  }, [userLlm.loaded, userLlm.isConfigured, byokRequired]);

  useEffect(() => {
    if (sampleLoadedFromUrlRef.current) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("sample") !== "1") return;
    sampleLoadedFromUrlRef.current = true;
    void handleLoadSample();
  });

  async function handleLoadSample() {
    setError(null);
    setLoading(true);
    setLoadingMessage(b.loadingSample);

    try {
      const response = await fetch("/samples/acok-ch04.txt");
      if (!response.ok) throw new Error(b.errors.loadSample);
      const text = await response.text();
      setEpubFileName(null);
      setEpubChapters([]);
      setSelectedChapterId("");
      setBookTitle("A Clash of Kings");
      setChapterLabel("Chapter 4 (Arya IV)");
      setChapterId("ak-ch04");
      setChapterText(text);
      setShowPasteText(true);
      setContentSource("sample");
      setGenerationScope("trial-15k");
    } catch (err) {
      setError(err instanceof Error ? err.message : b.errors.loadSampleFail);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  async function handleEpubUpload(file: File) {
    setError(null);

    if (!file.name.toLowerCase().endsWith(".epub")) {
      setError(b.errors.parseEpub);
      return;
    }

    if (file.size > MAX_EPUB_BYTES) {
      setError(b.errors.epubTooLarge);
      return;
    }

    setLoading(true);
    setLoadingMessage(b.readingEpub);
    setEpubFileName(file.name);
    setEpubChapters([]);
    setChapterText("");

    try {
      let buffer: ArrayBuffer;
      try {
        buffer = await file.arrayBuffer();
      } catch {
        throw new Error(b.errors.epubReadFail);
      }

      const parsed = await parseEpubBuffer(buffer);

      const chapters: EpubChapterOption[] = splitChaptersForExtract(
        parsed.chapters.map((chapter) => ({
          id: chapter.id,
          label: chapter.label,
          text: chapter.text,
        })),
      );

      setEpubChapters(chapters);
      setSelectedChapterId(chapters[0]?.id ?? "");
      if (parsed.title) setBookTitle(parsed.title);
      setShowPasteText(false);
      setContentSource("epub");
      if (!access.paid) setGenerationScope("selected-chapter");
    } catch (err) {
      const message = friendlyFetchError(
        err,
        b.errors.parseEpubFail,
        b.errors.epubReadFail,
      );
      if (message.includes("No readable chapters")) {
        setError(b.errors.noReadableInEpub);
      } else if (message === b.errors.epubReadFail) {
        setError(b.errors.epubReadFail);
      } else {
        setError(message);
      }
      setEpubFileName(null);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  async function extractChapterEntries(
    chapter: EpubChapterOption,
  ): Promise<DictionaryEntry[]> {
    const chapterText = truncateForExtract(chapter.text);

    let response: Response;
    try {
      response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterText,
          bookTitle,
          chapterLabel: chapter.label,
          chapterId: chapter.id,
          generationScope,
          usageMode: trialMode,
          ...buildLlmPayload(userLlm.clientConfig),
        }),
      });
    } catch (error) {
      throw new Error(
        friendlyFetchError(error, b.errors.generateFail, b.errors.networkError),
      );
    }

    const data = await readApiJson<{
      ok: boolean;
      error?: string;
      entries: DictionaryEntry[];
    }>(response, b.errors.networkError);
    if (!response.ok || !data.ok) {
      throw new Error(
        data.error ||
          formatMessage(b.errors.extractFail, { label: chapter.label }),
      );
    }

    return data.entries as DictionaryEntry[];
  }

  async function downloadDictionaryFile(
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
          title: formatMessage(b.dictTitle, {
            book: bookTitle || b.myBook,
          }),
          book_title: bookTitle || b.myBook,
          chapter_label: scopeLabel,
        },
        usageMode: trialMode,
      }),
    });

    if (!response.ok) {
      const data = await readApiJson<{ error?: string }>(
        response,
        b.errors.buildFail,
      ).catch(() => ({ error: undefined }));
      throw new Error(data.error || b.errors.buildFail);
    }

    const blob = await response.blob();
    const format =
      response.headers.get("X-KindleDict-Format") === "mobi" ? "mobi" : "zip";
    const filename =
      filenameFromDisposition(response.headers.get("Content-Disposition")) ??
      `kindledict-${fileSlug}.${format === "mobi" ? "mobi" : "zip"}`;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    setDownloadFormat(format);
    await checkHealth();
  }

  async function handleGenerateDictionary() {
    if (!ensureExtractReady()) return;

    if (generationPlan.chapters.length === 0) {
      setError(
        hasFullBook
          ? generationScope === "custom-chars"
            ? b.errors.customLimitMin
            : b.errors.noReadableChapters
          : b.errors.needText,
      );
      return;
    }

    if (limitError) {
      setError(limitError);
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
            ? formatMessage(b.readingChars, {
                count: generationPlan.totalChars.toLocaleString(),
              })
            : formatMessage(b.readingChapter, {
                index: index + 1,
                total: generationPlan.requestCount,
                label: chapter.label,
              }),
        );

        const chapterEntries = await extractChapterEntries(chapter);
        collected.push(...chapterEntries);
      }

      const merged = mergeDictionaryEntries(collected);
      if (merged.length === 0) {
        throw new Error(b.errors.noEntries);
      }

      setEntries(merged);
      setChapterLabel(generationPlan.scopeLabel);
      setLoadingMessage(b.packaging);

      await downloadDictionaryFile(
        merged,
        generationPlan.scopeLabel,
        slugify(`${bookTitle || "book"}-${generationScope}`),
      );

      setStep("preview");
    } catch (err) {
      const message = formatUserError(
        friendlyFetchError(err, b.errors.generateFail, b.errors.networkError),
        b.errors,
      );
      setError(message);
    } finally {
      setLoading(false);
      setLoadingMessage("");
      setBookProgress(null);
    }
  }

  async function handleDownloadZipFromPreview() {
    setLoading(true);
    setLoadingMessage(b.packagingFiles);
    setError(null);

    try {
      const response = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries,
          config: {
            title: formatMessage(b.dictTitleChapter, {
              book: bookTitle || b.myBook,
              chapter: chapterLabel || b.chapter,
            }),
            book_title: bookTitle || b.myBook,
            chapter_label: chapterLabel || b.chapter,
          },
          usageMode: trialMode,
        }),
      });

      if (!response.ok) {
        const data = await readApiJson<{ error?: string }>(
          response,
          b.errors.buildFail,
        ).catch(() => ({ error: undefined }));
        throw new Error(data.error || b.errors.buildFail);
      }

      const blob = await response.blob();
      const format =
        response.headers.get("X-KindleDict-Format") === "mobi" ? "mobi" : "zip";
      const filename =
        filenameFromDisposition(response.headers.get("Content-Disposition")) ??
        `kindledict-${slugify(chapterLabel || chapterId)}.${
          format === "mobi" ? "mobi" : "zip"
        }`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setDownloadFormat(format);
      await checkHealth();
    } catch (err) {
      setError(err instanceof Error ? err.message : b.errors.generic);
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
            <Link href="/">{m.common.home}</Link>
            <Link href="/privacy">{m.common.privacy}</Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <main className="container builder-main">
        <div className="builder-header">
          <p className="hero-badge">{b.publicBeta}</p>
          <h1>{b.title}</h1>
          <p className="hero-sub builder-sub">{b.subtitle}</p>
        </div>

        {error && <div className="builder-banner builder-banner-error">{error}</div>}

        {!error && limitError && (
          <div className="builder-banner builder-banner-warn">{limitError}</div>
        )}

        {loading && bookProgress && (
          <div className="builder-progress">
            <div className="builder-progress-label">
              {formatMessage(b.progressChapter, {
                current: bookProgress.current,
                total: bookProgress.total,
              })}{" "}
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
            {downloadFormat === "mobi" ? b.downloadedMobi : b.downloadedZip}
          </div>
        )}

        {!access.paid && (
          <div className="builder-banner builder-banner-info">
            {access.freeChapterRemaining ? b.freeChapterRemaining : b.freeChapterUsed}
            {paymentLink ? (
              <>
                {" "}
                <a href={paymentLink}>{b.buyAccess}</a>
              </>
            ) : null}
          </div>
        )}

        {step === "form" && (
          <div className="builder-card builder-workspace">
            <div className="builder-upload-zone builder-upload-compact">
              <p className="builder-upload-title">{b.step1Title}</p>
              <p className="builder-hint builder-source-hint">
                {b.step1Hint}
                {epubFileName ? (
                  <>
                    {" "}
                    {b.loaded} <strong>{epubFileName}</strong>
                    {hasFullBook && (
                      <>
                        {" "}
                        · {extractableChapters.length} {b.chapters}
                      </>
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
              <div className="builder-source-primary">
                <button
                  type="button"
                  className="btn btn-primary builder-epub-btn"
                  disabled={loading}
                  onClick={() => epubInputRef.current?.click()}
                >
                  {b.chooseEpub}
                </button>
                {!hasFullBook && (
                  <button
                    type="button"
                    className="builder-source-alt"
                    disabled={loading}
                    onClick={() => setShowPasteText((value) => !value)}
                  >
                    {showPasteText ? b.hidePaste : b.pasteAlt}
                  </button>
                )}
              </div>
              {(showPasteText || (!hasFullBook && chapterText.length > 0)) && (
                <label className="builder-field builder-paste-field">
                  <span>{b.chapterText}</span>
                  <textarea
                    value={chapterText}
                    onChange={(event) => {
                      setChapterText(event.target.value);
                      setContentSource("pasted");
                    }}
                    rows={8}
                    placeholder={b.chapterPlaceholder}
                  />
                </label>
              )}
            </div>

            <div className="builder-section-label">{b.step2Title}</div>

            <label className="builder-field">
              <span>{b.bookTitle}</span>
              <input
                value={bookTitle}
                onChange={(event) => setBookTitle(event.target.value)}
                placeholder={b.bookTitlePlaceholder}
              />
            </label>

            <div
              className={`builder-grid ${generationScope === "custom-chars" ? "builder-grid-3" : ""}`}
            >
              <label className="builder-field">
                <span>{b.howMuchScan}</span>
                <select
                  value={generationScope}
                  onChange={(event) =>
                    setGenerationScope(event.target.value as GenerationScopeId)
                  }
                >
                  {generationScopes.map((scope) => (
                    <option key={scope.id} value={scope.id}>
                      {scope.label}
                    </option>
                  ))}
                </select>
              </label>

              {hasFullBook && generationScope === "selected-chapter" && (
                <label className="builder-field">
                  <span>{b.selectedChapter}</span>
                  <select
                    value={selectedChapterId}
                    onChange={(event) => setSelectedChapterId(event.target.value)}
                  >
                    {extractableChapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {generationScope === "custom-chars" && (
                <label className="builder-field">
                  <span>{b.charLimit}</span>
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
                  · {generationPlan.totalChars.toLocaleString()} {b.characters}
                </>
              )}
            </p>

            {hasFullBook && (
              <label className="builder-field builder-scan-preview">
                <span>{b.scanPreview}</span>
                <textarea
                  readOnly
                  value={scanPreviewText || b.scanPreviewEmpty}
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
                <strong>{b.apiKeyRequired}</strong>
                <p>{b.apiKeyRequiredBody}</p>
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
                ? `${b.generating} ${bookProgress.current}/${bookProgress.total}…`
                : b.generate}
            </button>

            <div className="builder-secondary-actions">
              <button
                type="button"
                className="builder-link-btn"
                disabled={loading}
                onClick={handleLoadSample}
              >
                  {b.trySample}
                </button>
              </div>

            {serviceReady === true && !byokRequired && (
              <div className="builder-banner builder-banner-success">
                {b.hostedAiReady}
              </div>
            )}

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
                <h2>{b.previewTitle}</h2>
                <p className="builder-hint">{entryCountLabel}</p>
              </div>
              <button
                type="button"
                className="builder-link-btn"
                onClick={() => setStep("form")}
              >
                {b.backToBook}
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
                      {b.also}: {entry.inflections.join(", ")}
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
                {mobiCompileReady ? b.downloadMobi : b.downloadZip}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={loading}
                onClick={handleGenerateDictionary}
              >
                {b.regenerate}
              </button>
            </div>
          </div>
        )}

        <section className="builder-install">
          <h3>{b.installTitle}</h3>
          <ol>
            {(mobiCompileReady ? b.installStepsMobi : b.installStepsZip).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
