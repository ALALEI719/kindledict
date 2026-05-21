import type { Metadata } from "next";

import { LegalLayout } from "@/components/landing/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy — KindleDict",
  description:
    "How KindleDict handles your book text, AI processing, and personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p className="legal-updated">Last updated: May 21, 2026</p>

      <h2>Overview</h2>
      <p>
        KindleDict (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;the
        service&rdquo;) helps you build custom Kindle companion dictionaries
        from text you provide. This policy explains what we collect, how we
        use it, and your choices.
      </p>

      <h2>What you submit</h2>
      <p>
        When you use the dictionary builder, you may paste chapter text or
        upload DRM-free files (such as EPUB). This content is submitted solely
        to generate dictionary entries for your personal use.
      </p>

      <h2>How we process your content</h2>
      <ul>
        <li>
          Chapter text is sent to an AI provider (currently OpenAI) to extract
          names, places, and book-specific terms and to write definitions.
        </li>
        <li>
          We do <strong>not</strong> use your books or chapter text to train
          AI models.
        </li>
        <li>
          Generated dictionary files (HTML, OPF, ZIP, or MOBI) are returned to
          you in the browser or as a download.
        </li>
      </ul>

      <h2>Retention</h2>
      <p>
        We design the service to avoid long-term storage of your source text.
        Content submitted through the web app is processed for the active
        request and is not kept as a permanent library on our servers. Server
        logs may retain technical metadata (such as timestamps and error
        messages) for a limited period for security and debugging.
      </p>
      <p>
        Third-party AI providers may have their own retention policies for API
        requests. Review OpenAI&apos;s policies if you use the default
        extraction backend.
      </p>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not sell your book content or personal data.</li>
        <li>We do not bypass DRM or process protected Kindle (AZW/KFX) files.</li>
        <li>
          We do not publish or redistribute dictionaries you create unless you
          choose to share them yourself.
        </li>
      </ul>

      <h2>Cookies and analytics</h2>
      <p>
        Our hosting provider (Vercel) may collect standard web analytics and
        performance data. We may add privacy-friendly analytics in the future;
        this page will be updated if that changes materially.
      </p>

      <h2>Your responsibilities</h2>
      <p>
        You must have the legal right to use any text you submit. KindleDict is
        intended for personal study. Do not upload content you do not own or
        are not permitted to process.
      </p>

      <h2>Children</h2>
      <p>
        The service is not directed at children under 13. We do not knowingly
        collect personal information from children.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. Continued use of the
        service after changes are posted constitutes acceptance of the updated
        policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? See our{" "}
        <a href="/contact">Contact</a> page.
      </p>
    </LegalLayout>
  );
}
