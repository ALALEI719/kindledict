import type { DictionaryEntry } from "./types";

function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = normalizeWord(trimmed);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

export function mergeDictionaryEntries(
  entries: DictionaryEntry[],
): DictionaryEntry[] {
  const merged = new Map<string, DictionaryEntry>();

  for (const entry of entries) {
    const key = normalizeWord(entry.word);
    if (!key) continue;

    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, {
        ...entry,
        inflections: uniqueStrings(entry.inflections ?? []),
      });
      continue;
    }

    existing.inflections = uniqueStrings([
      ...(existing.inflections ?? []),
      ...(entry.inflections ?? []),
      entry.word,
    ]).filter((value) => normalizeWord(value) !== key);

    if (entry.definition.length > existing.definition.length) {
      existing.definition = entry.definition;
    }

    if (!existing.notes && entry.notes) existing.notes = entry.notes;
    if (!existing.synonyms && entry.synonyms) existing.synonyms = entry.synonyms;
  }

  return [...merged.values()].sort((a, b) =>
    a.word.localeCompare(b.word, undefined, { sensitivity: "base" }),
  );
}

export function filterExtractableChapters<
  T extends { text: string; label: string },
>(chapters: T[]): T[] {
  return chapters.filter((chapter) => chapter.text.trim().length >= 100);
}
