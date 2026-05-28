/** Keep each /api/extract body under Vercel's ~4.5 MB request limit (with JSON overhead). */
export const MAX_CHAPTER_EXTRACT_CHARS = 90_000;
export const MAX_FULL_BOOK_EXTRACT_CHARS = 1_200_000;
export const MAX_FULL_BOOK_REQUESTS = 30;

export interface TextChunk {
  id: string;
  label: string;
  text: string;
}

/** Split oversized spine sections so each extract request stays within platform limits. */
export function splitChaptersForExtract<
  T extends { id: string; label: string; text: string },
>(chapters: T[]): T[] {
  const result: T[] = [];

  for (const chapter of chapters) {
    if (chapter.text.length <= MAX_CHAPTER_EXTRACT_CHARS) {
      result.push(chapter);
      continue;
    }

    let offset = 0;
    let part = 1;
    while (offset < chapter.text.length) {
      const slice = chapter.text.slice(offset, offset + MAX_CHAPTER_EXTRACT_CHARS);
      result.push({
        ...chapter,
        id: `${chapter.id}-p${String(part).padStart(2, "0")}`,
        label: `${chapter.label} (${part})`,
        text: slice,
      });
      offset += MAX_CHAPTER_EXTRACT_CHARS;
      part += 1;
    }
  }

  return result;
}

export function truncateForExtract(text: string): string {
  if (text.length <= MAX_CHAPTER_EXTRACT_CHARS) return text;
  return text.slice(0, MAX_CHAPTER_EXTRACT_CHARS);
}
