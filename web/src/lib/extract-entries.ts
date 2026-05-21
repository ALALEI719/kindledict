import { generateObject } from "ai";
import { z } from "zod";

import { getExtractionModel } from "./llm";
import type { DictionaryEntry, ExtractRequest } from "./types";

const entrySchema = z.object({
  word: z.string().describe("Primary lookup headword as it appears in the book"),
  definition: z
    .string()
    .describe("Clear, spoiler-safe definition based only on text provided"),
  category: z.enum([
    "Character",
    "Place",
    "Artifact",
    "Concept",
    "Term",
    "Other",
  ]),
  inflections: z
    .array(z.string())
    .optional()
    .describe(
      "Alternate forms Kindle may look up: possessives, nicknames, single-word fragments of multi-word names",
    ),
  notes: z.string().optional(),
  synonyms: z.string().optional(),
});

const extractionSchema = z.object({
  entries: z.array(entrySchema).min(1).max(80),
});

export async function extractEntries(
  request: ExtractRequest,
): Promise<DictionaryEntry[]> {
  const chapterText = request.chapterText.trim();
  if (chapterText.length < 100) {
    throw new Error("Chapter text is too short. Paste at least a few paragraphs.");
  }

  if (chapterText.length > 120_000) {
    throw new Error(
      "Chapter text is too long for one request. Split by chapter or paste a shorter section.",
    );
  }

  const chapterId = request.chapterId?.trim() || "ch01";
  const spoilerScope =
    request.spoilerScope?.trim() ||
    "Only use facts explicitly present in the supplied chapter text. Do not spoil later chapters.";

  const { object } = await generateObject({
    model: getExtractionModel(),
    schema: extractionSchema,
    prompt: `You are building a Kindle companion dictionary (fictionary) for fiction readers.

Book title: ${request.bookTitle || "Unknown book"}
Chapter label: ${request.chapterLabel || "Unknown chapter"}
Chapter id: ${chapterId}

Task:
1. Identify words a reader is likely to tap in Kindle but built-in dictionaries will miss.
2. Prioritize: character names, nicknames, places, artifacts, in-world titles, book-specific terms.
3. Skip common English words unless they clearly have a special meaning in THIS chapter.
4. Target 30-80 high-value entries for this chapter.
5. ${spoilerScope}

Kindle lookup rules (critical):
- Readers usually long-press ONE word, not whole phrases.
- For "King's Landing", add inflections like "Landing" and "Landing's".
- Always include possessive forms in inflections (e.g. "Yoren's" for Yoren).
- Add common nicknames and shortened forms as inflections.

Definition style:
- 1-3 sentences, plain English, helpful at the moment of reading.
- No plot spoilers beyond this chapter.

Chapter text:
---
${chapterText}
---`,
  });

  return object.entries.map((entry) => ({
    ...entry,
    chapter_id: chapterId,
  }));
}
