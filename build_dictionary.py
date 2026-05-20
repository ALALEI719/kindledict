#!/usr/bin/env python3
"""Build Kindle-compatible dictionary source files from JSON entries.

Usage:
  python build_dictionary.py entries-ch04.json
  python build_dictionary.py entries-ch04.json --config dict-config.json --output dist/my-dict

Then open dist/my-dict/dict.opf in Kindle Previewer and export as .mobi.
"""

from __future__ import annotations

import argparse
import html
import json
import sys
from pathlib import Path


CONTENT_HEADER = """\
<!DOCTYPE html>
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
  <mbp:frameset>
"""

CONTENT_FOOTER = """\
  </mbp:frameset>
</body>
</html>
"""


def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def render_inflections(inflections: list[str]) -> str:
    forms = [form.strip() for form in inflections if form and form.strip()]
    if not forms:
        return ""
    tags = "".join(f'<idx:iform value="{html.escape(form, quote=True)}"/>' for form in forms)
    return f"  <idx:infl>{tags}</idx:infl>\n"


def render_entry(entry: dict) -> str:
    word = entry["word"].strip()
    definition = entry["definition"].strip()
    category = entry.get("category", "").strip()
    chapter_id = entry.get("chapter_id", "").strip()
    inflections = entry.get("inflections") or []
    notes = entry.get("notes", "").strip()
    synonyms = entry.get("synonyms", "").strip()

    meta_parts = []
    if chapter_id:
        meta_parts.append(f"chapter: {html.escape(chapter_id)}")
    if category:
        meta_parts.append(html.escape(category))
    meta_html = ""
    if meta_parts:
        meta_html = (
            f'<div class="meta" data-chapter-id="{html.escape(chapter_id, quote=True)}" '
            f'data-category="{html.escape(category, quote=True)}">'
            f"<small>{' • '.join(meta_parts)}</small></div>"
        )

    extras = ""
    if notes:
        extras += f'<div class="notes"><small>{html.escape(notes)}</small></div>'
    if synonyms:
        extras += f'<div class="synonyms"><small> synonym: {html.escape(synonyms)}</small></div>'

    infl_html = render_inflections(inflections)
    return (
        f'<idx:entry name="default" scriptable="yes" spell="yes">\n'
        f"  <h5><dt><idx:orth>{html.escape(word)}</idx:orth></dt></h5>\n"
        f"{infl_html}"
        f"  <dd>{meta_html}{html.escape(definition)}{extras}</dd>\n"
        f"</idx:entry>\n"
        f"<hr/>\n"
    )


def render_content(entries: list[dict]) -> str:
    body = "".join(render_entry(entry) for entry in entries)
    return CONTENT_HEADER + body + CONTENT_FOOTER


def render_cover(config: dict) -> str:
    title = html.escape(config["title"])
    book_title = html.escape(config.get("book_title", ""))
    chapter_label = html.escape(config.get("chapter_label", ""))
    creator = html.escape(config.get("creator", "KindleDict"))
    return f"""\
<!DOCTYPE html>
<html>
<head>
  <meta content="text/html" http-equiv="content-type"/>
</head>
<body>
  <h1>{title}</h1>
  <h2>{book_title}</h2>
  <h3>{chapter_label}</h3>
  <p>Created by {creator}</p>
</body>
</html>
"""


def render_copyright(config: dict) -> str:
    title = html.escape(config["title"])
    creator = html.escape(config.get("creator", "KindleDict"))
    return f"""\
<!DOCTYPE html>
<html>
<head>
  <meta content="text/html" http-equiv="content-type"/>
</head>
<body>
  <p>{title}</p>
  <p>Copyright &copy; {creator}. For personal study use.</p>
  <p>Character and place names belong to their respective copyright holders.</p>
</body>
</html>
"""


def render_usage(config: dict) -> str:
    title = html.escape(config["title"])
    notes = config.get("usage_notes") or [
        "Long-press a word while reading, then choose Dictionary.",
        "If another dictionary appears, tap its name and switch to this one.",
    ]
    items = "".join(f"<li>{html.escape(note)}</li>" for note in notes)
    return f"""\
<!DOCTYPE html>
<html>
<head>
  <meta content="text/html" http-equiv="content-type"/>
</head>
<body>
  <h1>How to use this dictionary</h1>
  <p>{title}</p>
  <ol>
    {items}
  </ol>
</body>
</html>
"""


def render_opf(config: dict) -> str:
    title = html.escape(config["title"])
    creator = html.escape(config.get("creator", "KindleDict"))
    language_in = html.escape(config.get("language_in", "en-us"))
    language_out = html.escape(config.get("language_out", "en-us"))
    return f"""\
<?xml version="1.0" encoding="UTF-8"?>
<package version="2.0"
         xmlns="http://www.idpf.org/2007/opf"
         xmlns:dc="http://purl.org/dc/elements/1.1/"
         xmlns:opf="http://www.idpf.org/2007/opf"
         unique-identifier="BookId">
  <metadata>
    <dc:title>{title}</dc:title>
    <dc:creator opf:role="aut">{creator}</dc:creator>
    <dc:language>{language_in}</dc:language>
    <dc:identifier id="BookId">kindledict-{language_in}-companion</dc:identifier>
    <x-metadata>
      <DictionaryInLanguage>{language_in}</DictionaryInLanguage>
      <DictionaryOutLanguage>{language_out}</DictionaryOutLanguage>
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
"""


def build(entries_path: Path, config_path: Path, output_dir: Path) -> int:
    payload = load_json(entries_path)
    config = load_json(config_path) if config_path.exists() else {}
    entries = payload.get("entries") or []
    if not entries:
        print("Error: no entries found in JSON.", file=sys.stderr)
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)
    files = {
        "content.html": render_content(entries),
        "cover.html": render_cover(config),
        "copyright.html": render_copyright(config),
        "usage.html": render_usage(config),
        "dict.opf": render_opf(config),
    }
    for name, content in files.items():
        (output_dir / name).write_text(content, encoding="utf-8")

    print(f"Built {len(entries)} entries into {output_dir}")
    print("Next steps:")
    print("  1. Install Kindle Previewer 3 from Amazon if needed.")
    print(f"  2. Open {output_dir / 'dict.opf'} in Kindle Previewer.")
    print("  3. File -> Export, save as .mobi")
    print("  4. Copy the .mobi file to your Kindle (USB: documents/dictionaries/)")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build Kindle dictionary source files.")
    parser.add_argument("entries", type=Path, help="Path to entries JSON file")
    parser.add_argument(
        "--config",
        type=Path,
        default=Path("dict-config.json"),
        help="Dictionary metadata config (default: dict-config.json)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output directory (default: dist/<entries-stem>)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output_dir = args.output or Path("dist") / args.entries.stem
    return build(args.entries, args.config, output_dir)


if __name__ == "__main__":
    raise SystemExit(main())
