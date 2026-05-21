import Link from "next/link";

import "../landing/landing.css";

export function LegalLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="landing">
      <nav>
        <div className="container nav-inner">
          <Link href="/" className="logo">
            Kindle<span>Dict</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/app" className="btn btn-primary">
              Try free
            </Link>
          </div>
        </div>
      </nav>

      <main className="container legal-page">
        <h1>{title}</h1>
        <div className="legal-content">{children}</div>
        <p className="legal-back">
          <Link href="/">← Back to home</Link>
        </p>
      </main>

      <footer>
        <div className="container">
          <p>
            © 2026 KindleDict · Custom Kindle dictionaries &amp; fictionaries
            for serious readers
          </p>
          <p className="footer-links">
            <Link href="/privacy">Privacy</Link> ·{" "}
            <Link href="/terms">Terms</Link> ·{" "}
            <Link href="/contact">Contact</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
