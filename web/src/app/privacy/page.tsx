"use client";

import Link from "next/link";

import { LegalLayout } from "@/components/landing/legal-layout";
import { useLocale } from "@/components/locale-provider";

export default function PrivacyPage() {
  const { messages: m } = useLocale();
  const p = m.legal.privacy;

  return (
    <LegalLayout title={m.legal.privacyTitle}>
      <p className="legal-updated">{m.legal.updated}</p>

      <h2>{p.overview.title}</h2>
      <p>{p.overview.body}</p>

      <h2>{p.submit.title}</h2>
      <p>{p.submit.body}</p>

      <h2>{p.process.title}</h2>
      <ul>
        {p.process.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{p.retention.title}</h2>
      <p>{p.retention.body1}</p>
      <p>{p.retention.body2}</p>

      <h2>{p.notDo.title}</h2>
      <ul>
        {p.notDo.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{p.cookies.title}</h2>
      <p>{p.cookies.body}</p>

      <h2>{p.responsibility.title}</h2>
      <p>{p.responsibility.body}</p>

      <h2>{p.children.title}</h2>
      <p>{p.children.body}</p>

      <h2>{p.changes.title}</h2>
      <p>{p.changes.body}</p>

      <h2>{p.contact.title}</h2>
      <p>
        {p.contact.body}{" "}
        <Link href="/contact">{p.contact.link}</Link>
        {p.contact.suffix}
      </p>
    </LegalLayout>
  );
}
