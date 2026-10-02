"""Write a compact archive inventory from an existing read-only corpus index."""

import argparse
from collections import Counter
import json
from pathlib import Path
import sqlite3


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--corpus", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    corpus = args.corpus.resolve()
    output = args.output.resolve()
    repository = Path(__file__).resolve().parents[2]
    if output.is_relative_to(repository) or output.is_relative_to(corpus):
        parser.error("Keep generated summaries outside the repository and corpus")
    report = json.loads((corpus / "report.json").read_text(encoding="utf-8-sig"))
    with sqlite3.connect((corpus / "index.sqlite").as_uri() + "?mode=ro", uri=True) as db:
        formats = Counter()
        for (name,) in db.execute("SELECT path FROM files"):
            formats[".mbin.pc" if name.lower().endswith(".mbin.pc") else Path(name).suffix.lower() or "no_extension"] += 1
        failures = db.execute("SELECT archive,path,extracted,conversion,error FROM files WHERE extracted!='ok' OR conversion='failed' ORDER BY archive,path").fetchall()
        extracted = db.execute("SELECT count(*) FROM files WHERE extracted='ok'").fetchone()[0]
        converted = db.execute("SELECT count(*) FROM files WHERE conversion='ok'").fetchone()[0]
    lines = ["# NMS corpus summary", "", f"Status: `{report['status']}`.",
             f"Finished (UTC): {report.get('finished_utc', 'not recorded')}.",
             f"Executable SHA-256: `{report['game_executable_sha256']}`.", "",
             f"Archives processed: {sum(a['status'] == 'processed' for a in report['archives'])}/{len(report['archives'])}.",
             f"Extracted entries: {extracted:,}. Converted and indexed MBINs: {converted:,}.",
             "Archive-qualified paths preserve duplicates without asserting game load order.",
             "This is data extraction, not native executable decompilation or runtime verification.", "",
             "## Navigation", "", "- `navigation/SUMMARY.md`: topic and entry counts.",
             "- `navigation/navigation.sqlite`: bounded filename and repository-function search.",
             "- `corpus/index.sqlite`: full asset inventory and XML property search.",
             "- `delivery-evidence.json`: reward, freighter model, and inventory-table evidence.",
             "- `corpus/report.json`: source/compiler fingerprints and archive outcomes.", "",
             "## Formats", "", "| Format | Entries |", "| --- | ---: |"]
    lines += [f"| {kind} | {count:,} |" for kind, count in sorted(formats.items())]
    lines += ["", "## Archive outcomes", "", "| Archive | Extracted | Converted | Conversion failures | Status |",
              "| --- | ---: | ---: | ---: | --- |"]
    for archive in report["archives"]:
        conversions = archive.get("conversion_counts", {})
        lines.append(f"| {archive['name']} | {archive.get('extraction_counts', {}).get('ok', 0):,} | {conversions.get('ok', 0):,} | {conversions.get('failed', 0)} | {archive['status']} |")
    lines += ["", "## Recorded failures", ""]
    lines += [f"- `{archive}` / `{path}`: extraction `{extraction}`, conversion `{conversion}`; {error}"
              for archive, path, extraction, conversion, error in failures] or ["None."]
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output), "extracted": extracted, "converted": converted, "failures": len(failures)}))


if __name__ == "__main__":
    main()
