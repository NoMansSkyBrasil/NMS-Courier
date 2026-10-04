"""Build a bounded-search navigation index without copying game data or pseudocode."""

import argparse
import ast
from collections import Counter
import csv
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3


def topic(text):
    text = text.lower()
    for label, words in (
        ("freighter", ("freighter", "freight", "pirate")),
        ("currency", ("currency", "quicksilver", "nanite", "money")),
        ("inventory", ("inventory", "carbon", "slots")),
        ("reward", ("reward", "recipe", "technology")),
        ("bridge", ("callback", "hook", "proxy", "startup", "signal")),
    ):
        if any(word in text for word in words):
            return label
    return "research"


def repository_items(repo):
    """Python uses AST; C definitions use a deliberately limited signature matcher."""
    roots = (repo / "runtime/research", repo / "runtime/native/asi")
    signature = re.compile(
        r"^[\w *]+?\b([A-Za-z_]\w*)\s*\([^;{}]*\)\s*\{", re.MULTILINE)
    for root in roots:
        for path in sorted(root.rglob("*")):
            if not path.is_file() or path.suffix not in (".py", ".c", ".cs", ".h", ".ps1", ".java", ".md", ".json"):
                continue
            if "__pycache__" in path.parts:
                continue
            relative = path.relative_to(repo).as_posix()
            yield ("source_file", topic(relative), relative, str(path), 1, "", "source_present", "repository", "")
            text = path.read_text(encoding="utf-8-sig")
            if path.suffix == ".py":
                def visit(node, parents=()):
                    for child in ast.iter_child_nodes(node):
                        if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
                            name = ".".join((*parents, child.name))
                            doc = ast.get_docstring(child) or ""
                            yield ("source_function", topic(relative + name), name, str(path),
                                   child.lineno, "", "ast_definition", "repository", doc.splitlines()[0] if doc else "")
                            yield from visit(child, (*parents, child.name))
                        elif isinstance(child, ast.ClassDef):
                            yield from visit(child, (*parents, child.name))
                        else:
                            yield from visit(child, parents)
                yield from visit(ast.parse(text))
            elif path.suffix == ".c":
                for match in signature.finditer(text):
                    name = match.group(1)
                    if name in ("if", "for", "while", "switch"):
                        continue
                    yield ("source_function", topic(relative + name), name, str(path),
                           text.count("\n", 0, match.start()) + 1, "", "signature_candidate", "repository", "C signature match; not an ABI verification")


def corpus_items(corpus):
    db = sqlite3.connect((corpus / "index.sqlite").as_uri() + "?mode=ro", uri=True)
    try:
        for archive_hash, archive, path, conversion, xml_path, error in db.execute(
                "SELECT archive_hash,archive,path,conversion,xml_path,error FROM files"):
            source = xml_path or str(corpus / "archives" / f"{Path(archive).stem}-{archive_hash[:12]}" / path)
            yield ("data_file", topic(path), path, source, 0, "", conversion or "not_converted",
                   archive_hash, error or "")
    finally:
        db.close()


def native_items(native):
    report = json.loads((native / "run.json").read_text(encoding="utf-8-sig"))
    fingerprint = report.get("executable_sha256", report.get("exe_sha256", ""))
    if not re.fullmatch(r"[0-9a-fA-F]{64}", fingerprint):
        raise ValueError("Native report has no valid executable SHA-256")
    export = native / "export"
    if (export / "manifest.tsv").is_file():
        seen = set()
        stages = ('layout', 'inventory', 'setup', 'initializer', 'handler', 'metadata',
                  'focused', 'rewardflags', 'rewardfields', 'weaponmetadata',
                  'weaponhandler', 'weaponserializer', 'weaponfields',
                  'capabilitymetadata', 'capabilityhandlers', 'descriptors',
                  'proceduraltask', 'proceduraltaskcallees', 'proceduraltaskconstructor',
                  'proceduralselection', 'proceduralselector', 'proceduralchoice',
                  'proceduraltexture', 'proceduralarithmetic', 'proceduralpalette',
                  'proceduralpalettelookup', 'proceduralpalettecallers',
                  'proceduralcolorbranches', 'proceduralalternatepalette',
                  'proceduralmaterialcolors', 'proceduraltexturecallback',
                  'proceduralresourcelookup', 'faunageneration', 'faunametadata',
                  'faunalayout20261004', 'faunaseedlinks20261004',
                  'faunaseedfields20261004', 'faunaresourcelinks20261004',
                  'faunaresourcefields20261004', 'faunacomponentfields20261004',
                  'faunarolefields20261004', 'planetseedentry20261004',
                  'planetseedconsumers20261004', 'planetresourceseeds20261004',
                  'priorityentityentries20261004', 'priorityentitymetadata20261004',
                  'priorityentityfields20261004', 'priorityentityfieldbodies20261004',
                  'priorityentitylinks20261004', 'priorityentitymodels20261004',
                  'priorityentityinputfields20261004', 'priorityentityinputbodies20261004',
                  'priorityentitysplitroots20261004', 'priorityentitynamedbodies20261004',
                  'prioritynpccolourloader20261004', 'prioritynpccomponentfactory20261004',
                  'prioritycustomisationsources20261004', 'freightersource20261004',
                  'freightersourceroot20261004', 'freighterupstream20261004',
                  'freighterresourcecopy20261004')
        for directory in (*(native / (stage + '-export') for stage in stages), export):
            if not (directory / "manifest.tsv").is_file():
                run_path = native / ('run-' + directory.name.removesuffix('-export') + '.json')
                if run_path.is_file():
                    run = json.loads(run_path.read_text(encoding='utf-8-sig'))
                    if run.get('exe_sha256') != fingerprint:
                        raise ValueError('Native stage report fingerprint mismatch')
                    yield ('native_analysis_run', topic(directory.name), directory.name,
                           str(run_path), 1, '', 'export_unavailable_' + str(run.get('status', 'unknown')),
                           fingerprint, 'No export manifest; preserve stage failure without inferring function results')
                continue
            with (directory / "manifest.tsv").open(encoding="utf-8-sig", newline="") as stream:
                for line, row in enumerate(csv.DictReader(stream, delimiter="\t"), 2):
                    if not re.fullmatch(r"[0-9a-fA-F]+", row.get("rva", "")) or not row.get("public_candidate") or not row.get("status"):
                        raise ValueError("Incomplete acquisition candidate TSV row")
                    if row['rva'] in seen:
                        continue
                    seen.add(row['rva'])
                    pseudocode = directory / (row["rva"] + ".c")
                    has_output = row["status"] == "decompiled" and pseudocode.is_file()
                    yield ("native_function", topic(row["public_candidate"]), row["public_candidate"],
                           str(pseudocode if has_output else directory / "manifest.tsv"),
                           1 if has_output else line, "0x" + row["rva"],
                           "pseudocode_unverified" if has_output else "decompilation_failed",
                           fingerprint, "Offline static candidate; identity and ABI unverified")
        return
    candidates = {}
    with (export / "candidates.tsv").open(encoding="utf-8-sig", newline="") as stream:
        for row in csv.DictReader(stream, delimiter="\t"):
            if any(row.get(field) is None for field in ("rva", "name", "status", "terms")):
                raise ValueError("Incomplete native candidate TSV row")
            if not re.fullmatch(r"0x[0-9a-fA-F]+", row["rva"]):
                raise ValueError("Invalid native candidate RVA")
            candidates[row["rva"]] = row
    with (export / "function-index.tsv").open(encoding="utf-8-sig", newline="") as stream:
        for line, row in enumerate(csv.DictReader(stream, delimiter="\t"), 2):
            if any(row.get(field) is None for field in ("rva", "name", "address_count")):
                raise ValueError("Incomplete native function TSV row")
            if not re.fullmatch(r"0x[0-9a-fA-F]+", row["rva"]) or int(row["address_count"]) < 0:
                raise ValueError("Invalid native function metadata")
            candidate = candidates.get(row["rva"], {})
            terms = candidate.get("terms", "")
            pseudocode = export / "functions" / (row["rva"].removeprefix("0x") + ".c")
            has_output = candidate.get("status") == "decompiled" and pseudocode.is_file()
            yield ("native_function", topic(terms), row["name"],
                   str(pseudocode if has_output else export / "function-index.tsv"),
                   1 if has_output else line, row["rva"],
                   "pseudocode_unverified" if has_output else "analysis_candidate",
                   fingerprint, terms)


def index_database(path):
    db = sqlite3.connect(path)
    db.executescript("""
        CREATE TABLE items (id INTEGER PRIMARY KEY, kind TEXT, topic TEXT, name TEXT,
            source TEXT, line INTEGER, rva TEXT, status TEXT, scope TEXT, evidence TEXT);
        CREATE VIRTUAL TABLE search USING fts5(name,topic,evidence);
    """)
    return db


def build(args):
    output = args.output.resolve()
    repo = args.repo.resolve()
    if output.is_relative_to(repo):
        raise ValueError("Keep the combined generated index outside the repository")
    for source in (args.corpus, args.native):
        if source and (output.is_relative_to(source.resolve()) or source.resolve().is_relative_to(output)):
            raise ValueError("Index output must be separate from imported research directories")
    output.mkdir(parents=True, exist_ok=True)
    temporary = output / "navigation.partial.sqlite"
    if temporary.exists():
        raise ValueError("A partial navigation index exists; inspect it before a new build")
    db = index_database(temporary)
    counts = Counter()
    warnings = []
    sources = [("repository", repository_items(repo))]
    if args.corpus:
        sources.append(("corpus", corpus_items(args.corpus.resolve())))
    if args.native:
        sources.append(("native", native_items(args.native.resolve())))
    try:
        for label, items in sources:
            source_counts = Counter()
            db.execute("SAVEPOINT import_source")
            try:
                for item in items:
                    cursor = db.execute("INSERT INTO items VALUES (NULL,?,?,?,?,?,?,?,?,?)", item)
                    db.execute("INSERT INTO search(rowid,name,topic,evidence) VALUES (?,?,?,?)",
                               (cursor.lastrowid, item[2], item[1], item[8]))
                    source_counts[item[0]] += 1
                db.execute("RELEASE import_source")
                counts.update(source_counts)
            except (OSError, ValueError, sqlite3.Error, KeyError) as error:
                db.execute("ROLLBACK TO import_source")
                db.execute("RELEASE import_source")
                warnings.append({"source": label, "error": str(error)[:300]})
        db.commit()
        rows = db.execute("SELECT topic,kind,count(*) FROM items GROUP BY topic,kind ORDER BY topic,kind").fetchall()
    finally:
        db.close()
    temporary.replace(output / "navigation.sqlite")
    report = {"counts": dict(counts), "warnings": warnings, "runtime_verified": False,
              "repository": str(repo), "corpus": str(args.corpus), "native": str(args.native)}
    report["generated_utc"] = datetime.now(timezone.utc).isoformat()
    report["generator_sha256"] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    (output / "navigation.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    lines = ["# Research navigation snapshot", "", "Metadata only; no runtime compatibility claim.", "",
             "| Topic | Kind | Count |", "| --- | --- | --- |"]
    lines += [f"| {category} | {kind} | {count} |" for category, kind, count in rows]
    lines += ["", "## Import warnings", ""]
    lines += [f"- {warning['source']}: {warning['error']}" for warning in warnings] or ["None."]
    (output / "SUMMARY.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


def refresh_repository(args):
    """Refresh source metadata without reading or rewriting the proprietary corpus."""
    output, repo = args.output.resolve(), args.repo.resolve()
    if output.is_relative_to(repo):
        raise ValueError('Keep the generated index outside the repository')
    report_path = output / 'navigation.json'
    report = json.loads(report_path.read_text(encoding='utf-8'))
    if Path(report['repository']).resolve() != repo:
        raise ValueError('Existing navigation repository mismatch')
    for field in ('corpus', 'native'):
        if report.get(field) not in (None, 'None'):
            source = Path(report[field]).resolve()
            if output.is_relative_to(source) or source.is_relative_to(output):
                raise ValueError('Index must remain separate from imported research')
    db = sqlite3.connect((output / 'navigation.sqlite').as_uri() + '?mode=rw', uri=True)
    try:
        with db:
            db.execute('DELETE FROM search WHERE rowid IN (SELECT id FROM items WHERE kind IN (?,?))',
                       ('source_file', 'source_function'))
            db.execute('DELETE FROM items WHERE kind IN (?,?)', ('source_file', 'source_function'))
            for item in repository_items(repo):
                cursor = db.execute('INSERT INTO items VALUES (NULL,?,?,?,?,?,?,?,?,?)', item)
                db.execute('INSERT INTO search(rowid,name,topic,evidence) VALUES (?,?,?,?)',
                           (cursor.lastrowid, item[2], item[1], item[8]))
        report['counts'] = dict(db.execute('SELECT kind,count(*) FROM items GROUP BY kind').fetchall())
        rows = db.execute('SELECT topic,kind,count(*) FROM items GROUP BY topic,kind ORDER BY topic,kind').fetchall()
    finally:
        db.close()
    report.setdefault('imported_data_native_utc', report.get('generated_utc'))
    report['source_refreshed_utc'] = datetime.now(timezone.utc).isoformat()
    report['generator_sha256'] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    report_path.write_text(json.dumps(report, indent=2), encoding='utf-8')
    lines = ['# Research navigation snapshot', '', 'Metadata only; no runtime compatibility claim.', '',
             '| Topic | Kind | Count |', '| --- | --- | --- |']
    lines += [f'| {category} | {kind} | {count} |' for category, kind, count in rows]
    lines += ['', '## Import warnings', '']
    lines += [f"- {warning['source']}: {warning['error']}" for warning in report.get('warnings', [])] or ['None.']
    (output / 'SUMMARY.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(json.dumps(report, indent=2))


def query(args):
    db = sqlite3.connect((args.output.resolve() / "navigation.sqlite").as_uri() + "?mode=ro", uri=True)
    db.row_factory = sqlite3.Row
    try:
        rows = db.execute("""SELECT items.* FROM search JOIN items ON items.id=search.rowid
            WHERE search MATCH ? AND (? IS NULL OR kind=?) LIMIT ?""",
            (args.query, args.kind, args.kind, args.limit)).fetchall()
        print(json.dumps([dict(row) for row in rows], indent=2))
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--corpus", type=Path)
    parser.add_argument("--native", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--source-summary", type=Path,
                        help="Optional Markdown map containing repository source metadata only")
    parser.add_argument("--query")
    parser.add_argument('--refresh-source', action='store_true',
                        help='Refresh repository definitions in an existing index; preserve data/native imports')
    parser.add_argument("--kind", choices=("source_file", "source_function", "data_file", "native_function", "native_analysis_run"))
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()
    if not 1 <= args.limit <= 100:
        parser.error("limit must be 1..100")
    if args.refresh_source and (args.query or args.corpus or args.native):
        parser.error('Source refresh cannot query or reimport corpus/native artifacts')
    if args.refresh_source:
        refresh_repository(args)
    elif args.query:
        query(args)
    else:
        build(args)
    if args.source_summary and not args.query:
        summary = args.source_summary.resolve()
        if not summary.is_relative_to(args.repo.resolve() / "docs"):
            parser.error("Source summaries must be written under repository docs")
        db = sqlite3.connect((args.output.resolve() / "navigation.sqlite").as_uri() + "?mode=ro", uri=True)
        try:
            rows = db.execute("SELECT topic,name,source,line,status FROM items WHERE kind='source_function' ORDER BY source,line").fetchall()
        finally:
            db.close()
        lines = ["# Repository function map", "", "Generated by `runtime/research/build-research-index.py --source-summary`.",
                 "Python definitions use AST; C entries use signature matching. Tests and fixtures are included.",
                 "These are Courier source functions, not discovered or verified game functions.", "",
                 "Return to [the research index](RESEARCH_INDEX.md).", "",
                 "| Topic | Function | Source | Extraction |", "| --- | --- | --- | --- |"]
        for category, name, source, line, status in rows:
            path = Path(source)
            relative = path.relative_to(args.repo.resolve()).as_posix()
            link = Path(os.path.relpath(path, summary.parent)).as_posix()
            lines.append(f"| {category} | `{name}` | [{relative}:{line}]({link}#L{line}) | {status} |")
        summary.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
