import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { formatMessage, getMessages } from "@/lib/i18n/messages";

export type GenerationScopeId =
  | "trial-15k"
  | "trial-30k"
  | "first-chapter"
  | "first-3-chapters"
  | "full-book"
  | "custom-chars";

export interface GenerationScopeOption {
  id: GenerationScopeId;
  label: string;
  description: string;
  estimatedRequests: string;
}

export const GENERATION_SCOPES: GenerationScopeOption[] = [
  {
    id: "trial-15k",
    label: "Quick try · 15,000 characters",
    description: "Best for first test. Roughly one AI request.",
    estimatedRequests: "~1 request",
  },
  {
    id: "trial-30k",
    label: "Short sample · 30,000 characters",
    description: "A longer taste of the book without running the full novel.",
    estimatedRequests: "~1 request",
  },
  {
    id: "first-chapter",
    label: "First chapter only",
    description: "Process the first readable chapter in the EPUB.",
    estimatedRequests: "~1 request",
  },
  {
    id: "first-3-chapters",
    label: "First 3 chapters",
    description: "Good balance between coverage and API cost.",
    estimatedRequests: "~3 requests",
  },
  {
    id: "full-book",
    label: "Full book",
    description: "Scan every chapter and merge into one dictionary.",
    estimatedRequests: "Many requests",
  },
  {
    id: "custom-chars",
    label: "Custom character limit",
    description: "Read from the start of the book up to your chosen limit.",
    estimatedRequests: "~1 request",
  },
];

export interface ScopedChapter {
  id: string;
  label: string;
  text: string;
}

export interface GenerationPlan {
  chapters: ScopedChapter[];
  totalChars: number;
  scopeLabel: string;
  requestCount: number;
}

function charLimitForScope(
  scopeId: GenerationScopeId,
  customCharLimit?: number,
): number | null {
  if (scopeId === "trial-15k") return 15_000;
  if (scopeId === "trial-30k") return 30_000;
  if (scopeId === "custom-chars") {
    const limit = customCharLimit ?? 0;
    return limit >= 100 ? Math.min(limit, 120_000) : null;
  }
  return null;
}

export function buildGenerationPlan<
  T extends { text: string; label: string; id: string },
>(
  chapters: T[],
  scopeId: GenerationScopeId,
  customCharLimit?: number,
  locale: Locale = DEFAULT_LOCALE,
): GenerationPlan {
  const scopeLabels = getMessages(locale).builder.scopeLabels;
  const readable = chapters.filter((chapter) => chapter.text.trim().length >= 100);

  if (readable.length === 0) {
    return {
      chapters: [],
      totalChars: 0,
      scopeLabel: scopeLabels.noReadable,
      requestCount: 0,
    };
  }

  const charLimit = charLimitForScope(scopeId, customCharLimit);
  if (charLimit) {
    let remaining = charLimit;
    let combined = "";

    for (const chapter of readable) {
      if (remaining <= 0) break;
      const slice = chapter.text.slice(0, remaining);
      combined += slice;
      remaining -= slice.length;
      if (remaining <= 0) break;
    }

    const excerpt = combined.trim();
    if (excerpt.length < 100) {
      return {
        chapters: [],
        totalChars: 0,
        scopeLabel: scopeLabels.notEnoughText,
        requestCount: 0,
      };
    }

    const label =
      scopeId === "custom-chars"
        ? formatMessage(scopeLabels.customExcerpt, {
            count: excerpt.length.toLocaleString(),
          })
        : scopeId === "trial-15k"
          ? scopeLabels.trial15k
          : scopeLabels.trial30k;

    return {
      chapters: [
        {
          id: "excerpt",
          label,
          text: excerpt,
        },
      ],
      totalChars: excerpt.length,
      scopeLabel: label,
      requestCount: 1,
    };
  }

  if (scopeId === "first-chapter") {
    const chapter = readable[0]!;
    return {
      chapters: [chapter],
      totalChars: chapter.text.length,
      scopeLabel: chapter.label,
      requestCount: 1,
    };
  }

  if (scopeId === "first-3-chapters") {
    const selected = readable.slice(0, 3);
    return {
      chapters: selected,
      totalChars: selected.reduce((sum, chapter) => sum + chapter.text.length, 0),
      scopeLabel: scopeLabels.first3,
      requestCount: selected.length,
    };
  }

  return {
    chapters: readable,
    totalChars: readable.reduce((sum, chapter) => sum + chapter.text.length, 0),
    scopeLabel: scopeLabels.fullBook,
    requestCount: readable.length,
  };
}

export function getGenerationScopeOption(
  scopeId: GenerationScopeId,
): GenerationScopeOption {
  return (
    GENERATION_SCOPES.find((scope) => scope.id === scopeId) ?? GENERATION_SCOPES[0]!
  );
}

export function buildScanPreviewText(plan: GenerationPlan): string {
  if (plan.chapters.length === 0) return "";

  if (plan.requestCount === 1) {
    return plan.chapters[0]?.text ?? "";
  }

  const first = plan.chapters[0]?.text ?? "";
  const previewLimit = 4_000;
  const trimmed =
    first.length > previewLimit
      ? `${first.slice(0, previewLimit)}\n\n…`
      : first;

  return [
    `[Preview] ${plan.requestCount} sections · ${plan.totalChars.toLocaleString()} characters total`,
    `[First section: ${plan.chapters[0]?.label ?? "Section 1"}]`,
    "",
    trimmed,
    plan.chapters.length > 1
      ? `\n… plus ${plan.chapters.length - 1} more section(s) in this scan range.`
      : "",
  ].join("\n");
}
