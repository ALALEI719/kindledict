export type EntryCategory =
  | "Character"
  | "Place"
  | "Artifact"
  | "Concept"
  | "Term"
  | "Other";

export interface DictionaryEntry {
  word: string;
  definition: string;
  category: EntryCategory;
  inflections?: string[];
  chapter_id?: string;
  notes?: string;
  synonyms?: string;
}

export interface DictConfig {
  title: string;
  creator?: string;
  language_in?: string;
  language_out?: string;
  book_title?: string;
  chapter_label?: string;
  usage_notes?: string[];
}

export interface ExtractRequest {
  chapterText: string;
  bookTitle?: string;
  chapterLabel?: string;
  chapterId?: string;
  spoilerScope?: string;
}

export interface BuildRequest {
  entries: DictionaryEntry[];
  config: DictConfig;
}

export interface GenerateRequest extends ExtractRequest {
  config?: Partial<DictConfig>;
}

export interface DictionaryFiles {
  "content.html": string;
  "cover.html": string;
  "copyright.html": string;
  "usage.html": string;
  "dict.opf": string;
}
