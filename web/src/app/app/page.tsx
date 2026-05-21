import { DictionaryBuilder } from "@/components/dictionary-builder";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "生成词典 — KindleDict",
  description:
    "上传 EPUB 或粘贴章节，生成可在 Kindle 上使用的定制伴侣词典。",
};

export default function AppPage() {
  return <DictionaryBuilder />;
}
