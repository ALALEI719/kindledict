"use client";

import { LegalLayout } from "@/components/landing/legal-layout";
import { useLocale } from "@/components/locale-provider";

export default function ContactPage() {
  const { messages: m } = useLocale();
  const c = m.legal.contact;

  return (
    <LegalLayout title={m.legal.contactTitle}>
      <p>{c.intro}</p>

      <h2>{c.github}</h2>
      <p>
        {c.githubDesc}{" "}
        <a
          href="https://github.com/ALALEI719/kindledict/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/ALALEI719/kindledict/issues
        </a>
      </p>

      <h2>{c.repo}</h2>
      <p>
        {c.repoDesc}{" "}
        <a
          href="https://github.com/ALALEI719/kindledict"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/ALALEI719/kindledict
        </a>
      </p>

      <h2>{c.responseTitle}</h2>
      <p>{c.response}</p>
    </LegalLayout>
  );
}
