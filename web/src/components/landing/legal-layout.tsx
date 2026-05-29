"use client";

import Link from "next/link";

import { LandingNav } from "@/components/landing-nav";
import { useLocale } from "@/components/locale-provider";

import "./landing.css";

export function LegalLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { messages: m } = useLocale();

  return (
    <div className="landing">
      <LandingNav variant="compact" />

      <main className="container legal-page">
        <h1>{title}</h1>
        <div className="legal-content">{children}</div>
        <p className="legal-back">
          <Link href="/">{m.common.backHome}</Link>
        </p>
      </main>

      <footer>
        <div className="container">
          <p>{m.common.footerTagline}</p>
          <p className="footer-links">
            <Link href="/privacy">{m.common.privacy}</Link> ·{" "}
            <Link href="/terms">{m.common.terms}</Link> ·{" "}
            <Link href="/contact">{m.common.contact}</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
