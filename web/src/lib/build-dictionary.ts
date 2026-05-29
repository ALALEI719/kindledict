import type { DictConfig, DictionaryEntry, DictionaryFiles } from "./types";

const CONTENT_HEADER = `<!DOCTYPE html>
<html xmlns:math="http://exslt.org/math" xmlns:svg="http://www.w3.org/2000/svg" xmlns:saxon="http://saxon.sf.net/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:mbp="https://kindlegen.s3.amazonaws.com/AmazonKindlePublishingGuidelines.pdf" xmlns:idx="https://kindlegen.s3.amazonaws.com/AmazonKindlePublishingGuidelines.pdf">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <style>
    h5 {
      font-size: 1em;
      margin: 0;
    }
    dd {
      margin: 0;
      padding: 0 0 0.5em 0;
      display: block;
    }
    .meta small { color:#555; }
    .synonyms small { color:#666; }
    .notes small { color:#666; font-style: italic; }
  </style>
</head>
<body>
`;

const CONTENT_FOOTER = `</body>
</html>
`;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
}

/** Short prefix kept within kindle's ~31-char internal dictionary name limit. */
export function buildDictionaryTitle(bookTitle: string, chapterLabel: string): string {
  const tag = slugify(chapterLabel).slice(0, 12) || "dict";
  return `[${tag}] ${bookTitle.trim()} Dictionary`;
}

export function buildDictionaryIdentifier(bookTitle: string, chapterLabel: string): string {
  const bookSlug = slugify(bookTitle).slice(0, 16) || "book";
  const chapterSlug = slugify(chapterLabel).slice(0, 16) || "chapter";
  return `kindledict-${bookSlug}-${chapterSlug}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInflections(inflections: string[] | undefined): string {
  const forms = (inflections ?? []).map((form) => form.trim()).filter(Boolean);
  if (forms.length === 0) return "";
  const tags = forms
    .map((form) => `<idx:iform value="${escapeHtml(form)}"/>`)
    .join("");
  return `  <idx:infl>${tags}</idx:infl>\n`;
}

function renderEntry(entry: DictionaryEntry): string {
  const word = entry.word.trim();
  const definition = entry.definition.trim();
  const category = entry.category?.trim() ?? "";
  const chapterId = entry.chapter_id?.trim() ?? "";
  const notes = entry.notes?.trim() ?? "";
  const synonyms = entry.synonyms?.trim() ?? "";

  const metaParts: string[] = [];
  if (chapterId) metaParts.push(`chapter: ${escapeHtml(chapterId)}`);
  if (category) metaParts.push(escapeHtml(category));

  let metaHtml = "";
  if (metaParts.length > 0) {
    metaHtml =
      `<div class="meta" data-chapter-id="${escapeHtml(chapterId)}" ` +
      `data-category="${escapeHtml(category)}">` +
      `<small>${metaParts.join(" • ")}</small></div>`;
  }

  let extras = "";
  if (notes) {
    extras += `<div class="notes"><small>${escapeHtml(notes)}</small></div>`;
  }
  if (synonyms) {
    extras += `<div class="synonyms"><small> synonym: ${escapeHtml(synonyms)}</small></div>`;
  }

  const inflHtml = renderInflections(entry.inflections);

  return (
    `<idx:entry name="default" scriptable="yes" spell="yes">\n` +
    `  <h5><dt><idx:orth>${escapeHtml(word)}</idx:orth></dt></h5>\n` +
    inflHtml +
    `  <dd>${metaHtml}${escapeHtml(definition)}${extras}</dd>\n` +
    `</idx:entry>\n` +
    `<hr/>\n`
  );
}

function renderContent(entries: DictionaryEntry[]): string {
  const body = entries.map(renderEntry).join("");
  return CONTENT_HEADER + body + CONTENT_FOOTER;
}

function renderCover(config: DictConfig): string {
  const title = escapeHtml(config.title);
  const bookTitle = escapeHtml(config.book_title ?? "");
  const chapterLabel = escapeHtml(config.chapter_label ?? "");
  const creator = escapeHtml(config.creator ?? "KindleDict");

  return `<!DOCTYPE html>
<html>
<head>
  <meta content="text/html" http-equiv="content-type"/>
</head>
<body>
  <h1>${title}</h1>
  <h2>${bookTitle}</h2>
  <h3>${chapterLabel}</h3>
  <p>Created by ${creator}</p>
</body>
</html>
`;
}

function renderCopyright(config: DictConfig): string {
  const title = escapeHtml(config.title);
  const creator = escapeHtml(config.creator ?? "KindleDict");

  return `<!DOCTYPE html>
<html>
<head>
  <meta content="text/html" http-equiv="content-type"/>
</head>
<body>
  <p>${title}</p>
  <p>Copyright &copy; ${creator}. For personal study use.</p>
  <p>Character and place names belong to their respective copyright holders.</p>
</body>
</html>
`;
}

function renderUsage(config: DictConfig): string {
  const title = escapeHtml(config.title);
  const notes = config.usage_notes ?? [
    "Long-press a word while reading, then choose Dictionary.",
    "If another dictionary appears, tap its name and switch to this one.",
  ];
  const items = notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta content="text/html" http-equiv="content-type"/>
</head>
<body>
  <h1>How to use this dictionary</h1>
  <p>${title}</p>
  <ol>
    ${items}
  </ol>
</body>
</html>
`;
}

function renderOpf(config: DictConfig): string {
  const title = escapeHtml(config.title);
  const creator = escapeHtml(config.creator ?? "KindleDict");
  const languageIn = escapeHtml(config.language_in ?? "en-us");
  const languageOut = escapeHtml(config.language_out ?? "en-us");
  const bookTitle = config.book_title?.trim() || "book";
  const chapterLabel = config.chapter_label?.trim() || "chapter";
  const identifier = escapeHtml(
    config.dictionary_id ?? buildDictionaryIdentifier(bookTitle, chapterLabel),
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<package version="2.0"
         xmlns="http://www.idpf.org/2007/opf"
         xmlns:dc="http://purl.org/dc/elements/1.1/"
         xmlns:opf="http://www.idpf.org/2007/opf"
         unique-identifier="BookId">
  <metadata>
    <dc:title>${title}</dc:title>
    <dc:creator opf:role="aut">${creator}</dc:creator>
    <dc:language>${languageIn}</dc:language>
    <dc:identifier id="BookId">${identifier}</dc:identifier>
    <x-metadata>
      <DictionaryInLanguage>${languageIn}</DictionaryInLanguage>
      <DictionaryOutLanguage>${languageOut}</DictionaryOutLanguage>
      <DefaultLookupIndex>default</DefaultLookupIndex>
    </x-metadata>
  </metadata>
  <manifest>
    <item id="cover" href="cover.html" media-type="application/xhtml+xml"/>
    <item id="usage" href="usage.html" media-type="application/xhtml+xml"/>
    <item id="copyright" href="copyright.html" media-type="application/xhtml+xml"/>
    <item id="content" href="content.html" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="cover"/>
    <itemref idref="usage"/>
    <itemref idref="copyright"/>
    <itemref idref="content"/>
  </spine>
  <guide>
    <reference type="index" title="Index" href="content.html"/>
  </guide>
</package>
`;
}

export function buildDictionaryFiles(
  entries: DictionaryEntry[],
  config: DictConfig,
): DictionaryFiles {
  if (entries.length === 0) {
    throw new Error("No entries to build.");
  }

  return {
    "content.html": renderContent(entries),
    "cover.html": renderCover(config),
    "copyright.html": renderCopyright(config),
    "usage.html": renderUsage(config),
    "dict.opf": renderOpf(config),
  };
}

export function defaultConfigFromRequest(input: {
  bookTitle?: string;
  chapterLabel?: string;
}): DictConfig {
  const bookTitle = input.bookTitle?.trim() || "My Book";
  const chapterLabel = input.chapterLabel?.trim() || "Chapter 1";

  return {
    title: buildDictionaryTitle(bookTitle, chapterLabel),
    creator: "KindleDict",
    language_in: "en-us",
    language_out: "en-us",
    book_title: bookTitle,
    chapter_label: chapterLabel,
    dictionary_id: buildDictionaryIdentifier(bookTitle, chapterLabel),
    usage_notes: [
      "Long-press a word while reading, or select text and tap Dictionary.",
      "If another dictionary opens first, tap its name in the popup and switch to this one.",
      "Words not listed here will fall back to your built-in dictionaries.",
    ],
  };
}
