"use client";

import Link from "next/link";

import { LandingNav } from "@/components/landing-nav";
import { useLocale } from "@/components/locale-provider";

import "./landing.css";

export function PricingPage() {
  const { messages: m } = useLocale();
  const p = m.pricingPage;

  return (
    <div className="landing pricing-page">
      <LandingNav variant="compact" />

      <main>
        <header className="hero container pricing-hero">
          <div className="hero-badge">{p.badge}</div>
          <h1>{p.title}</h1>
          <p className="hero-sub">{p.subtitle}</p>
          <p className="pricing-reassurance">{p.reassurance}</p>
        </header>

        <section className="pricing-section">
          <div className="container">
            <div className="pricing-grid pricing-grid-expanded">
              {p.plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`pricing-card pricing-card-detailed${
                    index === 1 ? " pricing-card-featured" : ""
                  }`}
                >
                  <h3>{plan.name}</h3>
                  <div className="pricing-price">{plan.price}</div>
                  <p>{plan.body}</p>
                  <ul className="pricing-list">
                    {plan.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <Link className="btn btn-secondary" href={plan.href}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="container">
            <h2>{p.notesTitle}</h2>
            <div className="pain-grid">
              {p.notes.map((item) => (
                <div key={item.title} className="pain-card">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="container">
            <h2>{p.faqTitle}</h2>
            <div className="faq-list">
              {p.faqs.map((item) => (
                <div key={item.q} className="faq-item">
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="cta-band">
          <h2>{p.ctaTitle}</h2>
          <p>{p.ctaBody}</p>
          <div className="hero-cta pricing-page-actions">
            <Link href="/app?sample=1" className="btn btn-primary">
              {p.ctaPrimary}
            </Link>
            <Link href="/app" className="btn btn-secondary">
              {p.ctaSecondary}
            </Link>
          </div>
        </div>
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
