"""Exercise navigation imports and partial-source rollback with synthetic fixtures."""

import json
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile


def main():
    script = Path(__file__).with_name("build-research-index.py").resolve()
    with tempfile.TemporaryDirectory(prefix="courier-navigation-check-") as temporary:
        root = Path(temporary)
        repo = root / "repo"
        source = repo / "runtime/research"
        source.mkdir(parents=True)
        (source / "example.py").write_text("def deliver():\n    return 1\n")
        corpus = root / "corpus"
        corpus.mkdir()
        db = sqlite3.connect(corpus / "index.sqlite")
        db.execute("CREATE TABLE files (archive_hash,archive,path,conversion,xml_path,error)")
        db.execute("INSERT INTO files VALUES ('archive','test.pak','rewardtable.mbin','ok','rewardtable.MXML',NULL)")
        db.commit()
        db.close()
        native = root / "native"
        export = native / "export"
        (export / "functions").mkdir(parents=True)
        (native / "run.json").write_text(json.dumps({"executable_sha256": "a" * 64}))
        header = "rva\tname\taddress_count\n"
        (export / "function-index.tsv").write_text(header + "0x100\tFUN_100\t20\n0x200\tFUN_200\t30\n")
        (export / "candidates.tsv").write_text("rva\tname\tstatus\tterms\n0x100\tFUN_100\tdecompiled\tFreighter\n")
        (export / "functions/100.c").write_text("/* Synthetic fixture only. */")
        output = root / "index"
        command = [sys.executable, str(script), "--repo", str(repo), "--corpus", str(corpus),
                   "--native", str(native), "--output", str(output)]
        first = json.loads(subprocess.check_output(command, text=True))
        assert first["counts"] == {"source_file": 1, "source_function": 1, "data_file": 1, "native_function": 2}
        found = json.loads(subprocess.check_output([sys.executable, str(script), "--output", str(output),
                          "--query", "Freighter", "--kind", "native_function", "--limit", "1"], text=True))
        assert len(found) == 1 and found[0]["rva"] == "0x100"
        assert found[0]["scope"] == "a" * 64 and found[0]["status"] == "pseudocode_unverified"
        (export / "function-index.tsv").write_text(header + "0x100\tFUN_100\t20\n0xBAD\n")
        second = json.loads(subprocess.check_output(command, text=True))
        assert second["counts"].get("native_function", 0) == 0
        assert second["warnings"][0]["source"] == "native"
        assert second["counts"]["data_file"] == 1 and second["counts"]["source_function"] == 1
    print("PASS: imports, bounded search, fingerprint/RVA lookup, partial-source rollback, and rebuild")


if __name__ == "__main__":
    main()
