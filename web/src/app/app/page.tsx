import { DictionaryBuilder } from "@/components/dictionary-builder";
import { SiteNav } from "@/components/site-nav";

export const metadata = {
  title: "Build Dictionary — KindleDict",
  description:
    "Paste a chapter and generate a Kindle-compatible companion dictionary.",
};

export default function AppPage() {
  return (
    <>
      <SiteNav />
      <DictionaryBuilder />
    </>
  );
}
