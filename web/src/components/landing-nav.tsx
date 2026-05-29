"use client";

import Link from "next/link";

import { AuthNav } from "@/components/auth-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";

import "./landing/landing.css";

type LandingNavVariant = "marketing" | "compact" | "builder";

export function LandingNav({ variant = "marketing" }: { variant?: LandingNavVariant }) {
  const { messages: m } = useLocale();

  return (
    <nav>
      <div className="container nav-inner">
        <Link href="/" className="logo">
          Kindle<span>Dict</span>
        </Link>
        <div className="nav-links">
          {variant === "marketing" ? (
            <>
              <a href="/#how-it-works">{m.common.howItWorks}</a>
              <a href="/#features">{m.common.features}</a>
              <Link href="/pricing">{m.common.pricing}</Link>
              <a href="/#faq">{m.common.faq}</a>
            </>
          ) : variant === "compact" ? (
            <>
              <Link href="/">{m.common.home}</Link>
              <Link href="/pricing">{m.common.pricing}</Link>
            </>
          ) : (
            <>
              <Link href="/">{m.common.home}</Link>
              <Link href="/privacy">{m.common.privacy}</Link>
            </>
          )}
          <AuthNav />
          <LanguageSwitcher />
          {variant !== "builder" ? (
            <Link href="/app" className="btn btn-primary">
              {m.common.tryFree}
            </Link>
          ) : (
            <Link href="/app" className="btn btn-primary">
              {m.common.buildDictionary}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
