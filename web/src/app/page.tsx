import type { Metadata } from "next";
import Script from "next/script";

import { LandingPage } from "@/components/landing/landing-page";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why doesn't my Kindle dictionary find character names?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Built-in Kindle dictionaries only cover standard English. Character names, fictional places, and book-specific terms are not included — so lookup returns no result. KindleDict builds a custom dictionary from your book so those words resolve when you tap them.",
      },
    },
    {
      "@type": "Question",
      name: "What is a fictionary?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A fictionary is a custom Kindle dictionary made for a specific fiction book. It works like a normal dictionary during reading: press and hold a word, and the definition appears in the popup — but the entries are about that book's characters, places, and terms.",
      },
    },
    {
      "@type": "Question",
      name: "Will this work on my Kindle device?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. KindleDict exports a standard .mobi dictionary file. Sideload it to your Kindle, set it as your default dictionary, and tap-to-define works on Kindle e-readers including Paperwhite, Oasis, and Scribe.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to flip to the back-of-book glossary?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Unlike a static glossary at the end of a book, a KindleDict fictionary integrates with Kindle's built-in lookup. You stay on the same page, same sentence — just tap the word.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "KindleDict — Custom Kindle Dictionaries for Every Book You Read",
  description:
    "Build a Kindle fictionary in minutes. Look up character names, places, and book-specific terms while reading — right inside your Kindle dictionary popup. No more 'word not found'.",
  keywords: [
    "fictionary",
    "custom kindle dictionary",
    "kindle word not found",
    "book glossary kindle",
    "companion dictionary",
    "fantasy reading dictionary",
  ],
  alternates: {
    canonical: "https://kindledict.com/",
  },
  openGraph: {
    title: "KindleDict — Custom Kindle Dictionaries for Every Book",
    description:
      "Turn any book into a tap-to-define Kindle dictionary. Character names, lore, and hard words — looked up without leaving the page.",
    type: "website",
    url: "https://kindledict.com/",
  },
};

export default function HomePage() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingPage />
    </>
  );
}
