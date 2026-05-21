"use client";

import Link from "next/link";

import { LegalLayout } from "@/components/landing/legal-layout";
import { useLocale } from "@/components/locale-provider";

export default function TermsPage() {
  const { messages: m } = useLocale();
  const t = m.legal.terms;

  return (
    <LegalLayout title={m.legal.termsTitle}>
      <p className="legal-updated">{m.legal.updated}</p>

      <h2>{t.agreement.title}</h2>
      <p>{t.agreement.body}</p>

      <h2>{t.provides.title}</h2>
      <p>{t.provides.body}</p>

      <h2>{t.permitted.title}</h2>
      <ul>
        {t.permitted.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{t.prohibited.title}</h2>
      <p>{t.prohibited.intro}</p>
      <ul>
        {t.prohibited.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{t.ip.title}</h2>
      <p>{t.ip.body1}</p>
      <p>{t.ip.body2}</p>

      <h2>{t.ai.title}</h2>
      <p>{t.ai.body}</p>

      <h2>{t.kindle.title}</h2>
      <p>{t.kindle.body}</p>

      <h2>{t.availability.title}</h2>
      <p>{t.availability.body}</p>

      <h2>{t.warranty.title}</h2>
      <p>{t.warranty.body}</p>

      <h2>{t.liability.title}</h2>
      <p>{t.liability.body}</p>

      <h2>{t.termination.title}</h2>
      <p>{t.termination.body}</p>

      <h2>{t.changes.title}</h2>
      <p>{t.changes.body}</p>

      <h2>{t.contact.title}</h2>
      <p>
        {t.contact.body}{" "}
        <Link href="/contact">{t.contact.link}</Link>
        {t.contact.suffix}
      </p>
    </LegalLayout>
  );
}
