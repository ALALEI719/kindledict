import { DictionaryBuilder } from "@/components/dictionary-builder";

export const metadata = {
  title: "Build Dictionary — KindleDict",
  description:
    "Upload EPUB or paste a chapter to generate a Kindle-compatible companion dictionary.",
};

export default function AppPage() {
  return <DictionaryBuilder />;
}
