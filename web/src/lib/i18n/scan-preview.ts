import type { GenerationPlan } from "@/lib/generation-scope";
import type { Locale } from "@/lib/i18n/locale";
import { formatMessage, getMessages } from "@/lib/i18n/messages";

export function buildLocalizedScanPreviewText<
  T extends { text: string; label: string; id: string },
>(plan: GenerationPlan<T>, locale: Locale): string {
  const labels = getMessages(locale).builder.scopeLabels;
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
    formatMessage(labels.previewHeader, {
      count: plan.requestCount,
      chars: plan.totalChars.toLocaleString(),
    }),
    formatMessage(labels.previewFirst, {
      label: plan.chapters[0]?.label ?? "Section 1",
    }),
    "",
    trimmed,
    plan.chapters.length > 1
      ? formatMessage(labels.previewMore, {
          count: plan.chapters.length - 1,
        })
      : "",
  ].join("\n");
}
