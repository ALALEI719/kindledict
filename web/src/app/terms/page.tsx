import type { Metadata } from "next";

import { LegalLayout } from "@/components/landing/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service — KindleDict",
  description:
    "Terms of use for KindleDict — custom Kindle companion dictionaries for personal reading.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <p className="legal-updated">Last updated: May 21, 2026</p>

      <h2>Agreement</h2>
      <p>
        By using KindleDict, you agree to these Terms of Service. If you do not
        agree, do not use the service.
      </p>

      <h2>What KindleDict provides</h2>
      <p>
        KindleDict is a tool that helps you create custom Kindle-compatible
        dictionary files (&ldquo;fictionaries&rdquo;) from text you supply. The
        service includes a web interface, AI-assisted term extraction, and
        dictionary file generation.
      </p>

      <h2>Permitted use</h2>
      <ul>
        <li>
          Personal, non-commercial study and reading support for books you
          legally own or have the right to use.
        </li>
        <li>
          Creating dictionaries for sideloading onto your own Kindle devices.
        </li>
        <li>
          Using DRM-free source material or text you paste manually from your
          own copies.
        </li>
      </ul>

      <h2>Prohibited use</h2>
      <p>You may not use KindleDict to:</p>
      <ul>
        <li>Remove, bypass, or circumvent DRM on ebooks.</li>
        <li>
          Upload, process, or distribute pirated or unauthorized copies of
          copyrighted works.
        </li>
        <li>
          Redistribute commercial dictionary packs built from copyrighted books
          without proper rights.
        </li>
        <li>
          Abuse the service (automated scraping, denial-of-service, attempting
          to access other users&apos; data).
        </li>
        <li>Violate applicable laws or third-party terms of service.</li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        Character names, places, and other elements from books remain the
        property of their respective copyright holders. Dictionary entries you
        generate may constitute derivative summaries for personal use. You are
        responsible for ensuring your use complies with copyright law in your
        jurisdiction.
      </p>
      <p>
        The KindleDict name, website, and software are provided as-is. We do not
        claim ownership of your source text or the specific wording of entries
        generated for your personal dictionaries.
      </p>

      <h2>AI-generated content</h2>
      <p>
        Definitions and term lists are produced with AI assistance and may
        contain errors, omissions, or spoilers despite our prompts. Review
        entries before relying on them. KindleDict does not guarantee accuracy,
        completeness, or fitness for any particular purpose.
      </p>

      <h2>Kindle compatibility</h2>
      <p>
        We aim to produce files compatible with Kindle dictionary sideloading,
        but device behavior varies by model and firmware. You are responsible
        for testing on your device and following Amazon&apos;s sideloading
        instructions.
      </p>

      <h2>Service availability</h2>
      <p>
        The service may change, pause, or discontinue features without notice.
        We do not guarantee uninterrupted availability. API usage limits or
        pricing may be introduced for heavy use in the future.
      </p>

      <h2>Disclaimer of warranties</h2>
      <p>
        KindleDict is provided &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo; without warranties of any kind, express or implied,
        including merchantability or fitness for a particular purpose.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, KindleDict and its operators
        shall not be liable for any indirect, incidental, special, or
        consequential damages arising from your use of the service, including
        loss of data, reading progress, or device issues.
      </p>

      <h2>Termination</h2>
      <p>
        We may suspend or terminate access if we believe you have violated these
        terms or pose a risk to the service or other users.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. Material changes will be reflected on this
        page with an updated date. Your continued use constitutes acceptance.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? See our{" "}
        <a href="/contact">Contact</a> page.
      </p>
    </LegalLayout>
  );
}
