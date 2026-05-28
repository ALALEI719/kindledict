"use client";

import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
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
      <nav>
        <div className="container nav-inner">
          <Link href="/" className="logo">
            Kindle<span>Dict</span>
          </Link>
          <div className="nav-links">
            <Link href="/">{m.common.home}</Link>
            <Link href="/pricing">{m.common.pricing}</Link>
            <Link href="/account">{m.common.account}</Link>
            <LanguageSwitcher />
            <Link href="/app" className="btn btn-primary">
              {m.common.tryFree}
            </Link>
          </div>
        </div>
      </nav>

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
