import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

export interface EpubChapter {
  id: string;
  label: string;
  text: string;
  href: string;
}

export interface ParsedEpub {
  title: string;
  chapters: EpubChapter[];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function dirname(path: string): string {
  const index = path.lastIndexOf("/");
  return index >= 0 ? path.slice(0, index + 1) : "";
}

function resolveHref(basePath: string, href: string): string {
  if (href.startsWith("/")) return href.slice(1);
  const baseDir = dirname(basePath);
  const parts = (baseDir + href).split("/");
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") resolved.pop();
    else resolved.push(part);
  }
  return resolved.join("/");
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function pickTitle(metadata: Record<string, unknown> | undefined): string {
  if (!metadata) return "Untitled book";
  const titleNode = metadata["dc:title"] ?? metadata.title;
  if (typeof titleNode === "string") return titleNode;
  if (Array.isArray(titleNode)) return String(titleNode[0] ?? "Untitled book");
  if (titleNode && typeof titleNode === "object" && "#text" in titleNode) {
    return String((titleNode as { "#text": string })["#text"]);
  }
  return "Untitled book";
}

function chapterLabelFromHref(href: string, index: number): string {
  const fileName = href.split("/").pop() ?? href;
  const stem = fileName.replace(/\.[^.]+$/, "");
  if (/chapter|ch\d|part/i.test(stem)) {
    return stem.replace(/[-_]/g, " ");
  }
  return `Section ${index + 1}`;
}

export async function parseEpubBuffer(buffer: ArrayBuffer): Promise<ParsedEpub> {
  const zip = await JSZip.loadAsync(buffer);
  const containerXml = await zip.file("META-INF/container.xml")?.async("string");
  if (!containerXml) {
    throw new Error("Invalid EPUB: missing META-INF/container.xml");
  }

  const container = parser.parse(containerXml);
  const rootfile =
    container?.container?.rootfiles?.rootfile ??
    container?.container?.rootfiles?.[0]?.rootfile;
  const rootfiles = asArray(rootfile);
  const opfPath = rootfiles[0]?.["@_full-path"];
  if (!opfPath) {
    throw new Error("Invalid EPUB: cannot locate package document.");
  }

  const opfXml = await zip.file(opfPath)?.async("string");
  if (!opfXml) {
    throw new Error("Invalid EPUB: package document not found.");
  }

  const opf = parser.parse(opfXml);
  const pkg = opf.package ?? opf;
  const metadata = pkg.metadata;
  const title = pickTitle(metadata);

  const manifestItems = asArray(pkg.manifest?.item);
  const manifest = new Map<string, { href: string; mediaType: string }>();
  for (const item of manifestItems) {
    manifest.set(item["@_id"], {
      href: item["@_href"],
      mediaType: item["@_media-type"] ?? "",
    });
  }

  const spineItems = asArray(pkg.spine?.itemref);
  const chapters: EpubChapter[] = [];

  for (let index = 0; index < spineItems.length; index += 1) {
    const idref = spineItems[index]?.["@_idref"];
    if (!idref) continue;

    const item = manifest.get(idref);
    if (!item) continue;

    const mediaType = item.mediaType.toLowerCase();
    if (
      !mediaType.includes("html") &&
      !mediaType.includes("xml") &&
      !mediaType.includes("xhtml")
    ) {
      continue;
    }

    const resolvedPath = resolveHref(opfPath, item.href);
    const file = zip.file(resolvedPath) ?? zip.file(item.href);
    if (!file) continue;

    const raw = await file.async("string");
    const text = htmlToText(raw);
    if (text.length < 80) continue;

    chapters.push({
      id: `ch${String(index + 1).padStart(2, "0")}`,
      label: chapterLabelFromHref(item.href, index),
      text,
      href: item.href,
    });
  }

  if (chapters.length === 0) {
    throw new Error(
      "No readable chapters found in this EPUB. Try pasting chapter text instead.",
    );
  }

  return { title, chapters };
}

export const MAX_EPUB_BYTES = 15 * 1024 * 1024;
