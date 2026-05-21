import type { Metadata } from "next";

import { LegalLayout } from "@/components/landing/legal-layout";

export const metadata: Metadata = {
  title: "Contact — KindleDict",
  description:
    "Get in touch with KindleDict for support, privacy, or feedback.",
};

export default function ContactPage() {
  return (
    <LegalLayout title="Contact">
      <p>
        For support, privacy questions, or feedback about KindleDict, open an
        issue on GitHub.
      </p>

      <h2>GitHub</h2>
      <p>
        Report bugs, ask questions, or request features:{" "}
        <a
          href="https://github.com/ALALEI719/kindledict/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/ALALEI719/kindledict/issues
        </a>
      </p>

      <h2>Repository</h2>
      <p>
        Source code and documentation:{" "}
        <a
          href="https://github.com/ALALEI719/kindledict"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/ALALEI719/kindledict
        </a>
      </p>

      <h2>Response time</h2>
      <p>
        KindleDict is an independent project. We aim to respond to GitHub issues
        within a few business days when possible.
      </p>
    </LegalLayout>
  );
}
