"use client";

import { LOCALE_LABELS, type Locale } from "@/lib/i18n/locale";
import { useLocale } from "@/components/locale-provider";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, messages } = useLocale();

  return (
    <div
      className={`lang-switcher ${className}`.trim()}
      role="group"
      aria-label={messages.common.language}
    >
      {(["zh", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          className={`lang-switcher-btn${locale === code ? " is-active" : ""}`}
          aria-pressed={locale === code}
          onClick={() => setLocale(code as Locale)}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
