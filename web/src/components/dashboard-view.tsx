"use client";

import Link from "next/link";

import { LandingNav } from "@/components/landing-nav";
import { useLocale } from "@/components/locale-provider";
import type { AccountAccessState } from "@/lib/supabase/server";

function StatusBanner({
  tone,
  children,
}: {
  tone: "info" | "success" | "error";
  children: React.ReactNode;
}) {
  return <div className={`account-banner account-banner-${tone}`}>{children}</div>;
}

export function DashboardView({
  account,
  signedIn,
  checkout,
  error,
  paymentLink,
  creemConfigured,
}: {
  account: AccountAccessState;
  signedIn: boolean;
  checkout: string | null;
  error: string | null;
  paymentLink: string | undefined;
  creemConfigured: boolean;
}) {
  const { messages: m } = useLocale();
  const d = m.dashboard;

  return (
    <div className="landing account-page dashboard-page">
      <LandingNav variant="compact" />

      <main className="container account-shell">
        <section className="account-hero">
          <div className="hero-badge">{d.badge}</div>
          <h1>{d.title}</h1>
          <p className="hero-sub">{d.subtitle}</p>
        </section>

        <section className="account-grid account-grid-single">
          <div className="account-panel">
            <div className="account-panel-head">
              <div>
                <p className="account-kicker">{d.signedInKicker}</p>
                <h2>{account.email}</h2>
              </div>
              <div className={`account-pill ${account.paid ? "is-paid" : ""}`}>
                {account.paid ? d.paidAccess : d.freeTrialOnly}
              </div>
            </div>

            {signedIn ? <StatusBanner tone="success">{d.signedInSuccess}</StatusBanner> : null}
            {checkout === "success" ? (
              <StatusBanner tone="info">{d.checkoutSuccess}</StatusBanner>
            ) : null}
            {checkout === "already_active" ? (
              <StatusBanner tone="info">{d.checkoutAlreadyActive}</StatusBanner>
            ) : null}
            {error === "signin_required" ? (
              <StatusBanner tone="error">{d.signInRequired}</StatusBanner>
            ) : null}
            {error === "auth_not_configured" ? (
              <StatusBanner tone="error">{d.authNotConfigured}</StatusBanner>
            ) : null}
            {error && error !== "signin_required" && error !== "auth_not_configured" ? (
              <StatusBanner tone="error">{error}</StatusBanner>
            ) : null}

            <div className="account-summary-grid">
              <div className="account-summary-card">
                <span>{d.statusLabel}</span>
                <strong>{account.paid ? d.statusPaid : d.statusFree}</strong>
              </div>
              <div className="account-summary-card">
                <span>{d.planLabel}</span>
                <strong>{account.planSlug || d.planNone}</strong>
              </div>
            </div>

            <p className="account-body-copy">{account.paid ? d.paidBody : d.freeBody}</p>

            <div className="dashboard-quick-links">
              <Link href="/app" className="btn btn-secondary">
                {d.openBuilder}
              </Link>
              <Link href="/pricing" className="btn btn-secondary">
                {d.viewPricing}
              </Link>
            </div>

            <div className="account-actions">
              <form action="/auth/logout" method="post">
                <button type="submit" className="btn btn-secondary">
                  {d.signOut}
                </button>
              </form>
              {account.paid ? null : creemConfigured ? (
                <form action="/api/creem/checkout" method="post">
                  <button type="submit" className="btn btn-primary">
                    {d.buyAccess}
                  </button>
                </form>
              ) : paymentLink ? (
                <a href={paymentLink} className="btn btn-primary">
                  {d.buyAccess}
                </a>
              ) : (
                <Link href="/contact" className="btn btn-primary">
                  {d.contactForAccess}
                </Link>
              )}
            </div>
          </div>
        </section>
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
