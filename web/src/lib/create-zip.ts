import JSZip from "jszip";

import type { DictionaryFiles } from "./types";

export async function createDictionaryZip(files: DictionaryFiles): Promise<Blob> {
  const zip = new JSZip();

  for (const [name, content] of Object.entries(files)) {
    zip.file(name, content);
  }

  zip.file(
    "README.txt",
    [
      "KindleDict dictionary source package",
      "",
      "To create a .mobi file for your Kindle:",
      "1. Install Kindle Previewer 3 from Amazon.",
      "2. Open dict.opf in Kindle Previewer.",
      "3. File -> Export and save as .mobi",
      "4. Copy the .mobi to your Kindle: documents/dictionaries/",
      "5. While reading, long-press a word and switch to this dictionary if needed.",
      "",
      "For personal study use only.",
    ].join("\n"),
  );

  return zip.generateAsync({ type: "blob" });
}
