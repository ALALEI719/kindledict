"use client";

import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";

import "./landing.css";

function compareCell(
  value: string,
  labels: { yes: string; no: string; sometimes: string; limited: string },
) {
  if (value === "yes") return labels.yes;
  if (value === "no") return labels.no;
  if (value === "sometimes") return labels.sometimes;
  return labels.limited;
}

export function LandingPage() {
  const { messages: m } = useLocale();
  const l = m.landing;
  const paymentLink = process.env.NEXT_PUBLIC_KINDLE_DICT_PAYMENT_LINK_URL;
  const cmp = {
    yes: l.compareYes,
    no: l.compareNo,
    sometimes: l.compareSometimes,
    limited: l.compareLimited,
  };

  return (
    <div className="landing">
      <nav>
        <div className="container nav-inner">
          <Link href="/" className="logo">
            Kindle<span>Dict</span>
          </Link>
          <div className="nav-links">
            <a href="#how-it-works">{m.common.howItWorks}</a>
            <a href="#features">{m.common.features}</a>
            <a href="#pricing">{m.common.pricing}</a>
            <a href="#faq">{m.common.faq}</a>
            <LanguageSwitcher />
            <Link href="/app" className="btn btn-primary">
              {m.common.tryFree}
            </Link>
          </div>
        </div>
      </nav>

      <header className="hero container">
        <div className="hero-badge">{l.heroBadge}</div>
        <h1>{l.heroTitle}</h1>
        <p className="hero-sub">
          {l.heroSubBefore}
          <strong>{l.heroSubBold}</strong>
          {l.heroSubAfter}
        </p>
        <div className="hero-cta">
          <Link href="/app" className="btn btn-primary">
            {l.heroCtaPrimary}
          </Link>
          <a href="#how-it-works" className="btn btn-secondary">
            {l.heroCtaSecondary}
          </a>
          <Link href="/app?sample=1" className="btn btn-secondary">
            {l.demoCta}
          </Link>
        </div>

        <div className="hero-visual">
          <div className="hero-visual-label">{l.heroVisualLabel}</div>
          <div className="lookup-demo">
            {l.heroDemoLine1}
            <span className="lookup-word">Yoren</span>
            {l.heroDemoLine2}
            <span className="lookup-word">Needle</span>
            {l.heroDemoLine3}
          </div>
          <div className="lookup-popup">
            <strong>Yoren</strong>
            <div className="tag">{l.lookupTag}</div>
            {l.lookupDef}
          </div>
        </div>
      </header>

      <section id="problem">
        <div className="container">
          <h2>{l.problemTitle}</h2>
          <p className="section-sub">{l.problemSub}</p>
          <div className="pain-grid">
            {l.problemCards.map((card) => (
              <div key={card.title} className="pain-card">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works">
        <div className="container">
          <h2>{l.stepsTitle}</h2>
          <p className="section-sub">{l.stepsSub}</p>
          <div className="steps">
            {l.steps.map((step, index) => (
              <div key={step.title} className="step">
                <div className="step-num">{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features">
        <div className="container">
          <h2>{l.featuresTitle}</h2>
          <p className="section-sub">{l.featuresSub}</p>
          <div className="features-grid">
            {l.features.map((feature) => (
              <div key={feature.title} className="feature">
                <h3>
                  <span className="check">✓</span> {feature.title}
                </h3>
                <p>{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="compare">
        <div className="container">
          <h2>{l.compareTitle}</h2>
          <p className="section-sub">{l.compareSub}</p>
          <div className="compare">
            <table>
              <thead>
                <tr>
                  {l.compareHeaders.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {l.compareRows.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td className={row[1]}>{compareCell(row[1], cmp)}</td>
                    <td className={row[2]}>{compareCell(row[2], cmp)}</td>
                    <td className={row[3]}>{compareCell(row[3], cmp)}</td>
                    <td className={row[4]}>{compareCell(row[4], cmp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="audience">
        <div className="container">
          <h2>{l.audienceTitle}</h2>
          <p className="section-sub">{l.audienceSub}</p>
          <div className="pain-grid">
            {l.audienceCards.map((card) => (
              <div key={card.title} className="pain-card">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo">
        <div className="container demo-strip">
          <div>
            <h2>{l.demoTitle}</h2>
            <p>{l.demoSub}</p>
          </div>
          <Link href="/app?sample=1" className="btn btn-primary">
            {l.demoCta}
          </Link>
        </div>
      </section>

      <section id="pricing">
        <div className="container">
          <h2>{l.pricingTitle}</h2>
          <p className="section-sub">{l.pricingSub}</p>
          <div className="pricing-grid">
            {l.pricingPlans.map((plan, index) => {
              const href = index === 1 && paymentLink ? paymentLink : plan.href;
              const isExternal = href.startsWith("http");
              return (
                <div key={plan.name} className="pricing-card">
                  <h3>{plan.name}</h3>
                  <div className="pricing-price">{plan.price}</div>
                  <p>{plan.body}</p>
                  {isExternal ? (
                    <a className="btn btn-secondary" href={href}>
                      {plan.cta}
                    </a>
                  ) : (
                    <Link className="btn btn-secondary" href={href}>
                      {plan.cta}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="container">
          <h2>{l.faqTitle}</h2>
          <div className="faq-list">
            {l.faqs.map((item) => (
              <div key={item.q} className="faq-item">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="cta-band" id="try">
        <h2>{l.ctaTitle}</h2>
        <p>{l.ctaSub}</p>
        <Link href="/app" className="btn btn-primary">
          {l.ctaButton}
        </Link>
        <p className="cta-note">{l.ctaNote}</p>
      </div>

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
