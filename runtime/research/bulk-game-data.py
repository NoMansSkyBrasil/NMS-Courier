"""Create a resumable, read-only research corpus from every installed Windows PAK."""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import sqlite3
import subprocess
import sys
import time
import xml.etree.ElementTree as ET


def monitored_conversion(command: list[str], root: Path, console, reserve: int,
                         cpu_limit: int) -> int:
    """Bound converter CPU use and stop on low space or excessive duration."""
    child = subprocess.Popen(command, cwd=root, stdout=console, stderr=subprocess.STDOUT)
    started = time.monotonic()
    try:
        if os.name == "nt" and cpu_limit:
            import ctypes
            kernel = ctypes.WinDLL("kernel32", use_last_error=True)
            kernel.SetProcessAffinityMask.argtypes = (ctypes.c_void_p, ctypes.c_size_t)
            kernel.SetProcessAffinityMask.restype = ctypes.c_int
            if not kernel.SetProcessAffinityMask(int(child._handle), (1 << cpu_limit) - 1):
                raise OSError(ctypes.get_last_error(), "Cannot constrain converter CPU affinity")
        while child.poll() is None:
            if shutil.disk_usage(root).free < reserve:
                raise OSError("Converter stopped at free-space reserve")
            if time.monotonic() - started > 3600:
                raise TimeoutError("Converter exceeded one-hour archive limit")
            time.sleep(1)
        return child.returncode
    finally:
        if child.poll() is None:
            child.kill()
            child.wait()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(4 * 1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def safe_destination(root: Path, name: str) -> Path:
    normalized = name.replace("\\", "/")
    parts = PurePosixPath(normalized)
    if parts.is_absolute() or not parts.parts or any(
        part in (".", "..") or ":" in part for part in parts.parts
    ):
        raise ValueError(f"Unsafe archive path: {name}")
    destination = root.joinpath(*parts.parts)
    if not destination.is_relative_to(root):
        raise ValueError(f"Archive path escapes destination: {name}")
    return destination


def database(path: Path) -> sqlite3.Connection:
    db = sqlite3.connect(path)
    db.execute("PRAGMA journal_mode=WAL")
    db.executescript("""
        CREATE TABLE IF NOT EXISTS files (
            archive_hash TEXT, archive TEXT, path TEXT, bytes INTEGER,
            extracted TEXT, content_hash TEXT, conversion TEXT,
            compiler_hash TEXT, xml_path TEXT, error TEXT,
            PRIMARY KEY (archive_hash, path)
        );
        CREATE VIRTUAL TABLE IF NOT EXISTS symbols USING fts5(
            archive_hash UNINDEXED, path UNINDEXED, xml_path UNINDEXED, terms
        );
        CREATE TABLE IF NOT EXISTS symbol_keys (
            archive_hash TEXT, path TEXT, symbol_rowid INTEGER UNIQUE,
            PRIMARY KEY (archive_hash, path)
        );
    """)
    # Migrate old corpora once; exact replacement must not scan the entire FTS table.
    db.execute("""INSERT OR IGNORE INTO symbol_keys
        SELECT archive_hash,path,rowid FROM symbols""")
    db.commit()
    return db


def discard_symbols(db: sqlite3.Connection, archive_hash: str, path: str) -> None:
    row = db.execute("SELECT symbol_rowid FROM symbol_keys WHERE archive_hash=? AND path=?",
                     (archive_hash, path)).fetchone()
    if row:
        db.execute("DELETE FROM symbols WHERE rowid=?", (row[0],))
        db.execute("DELETE FROM symbol_keys WHERE archive_hash=? AND path=?", (archive_hash, path))


def replace_symbols(db: sqlite3.Connection, archive_hash: str, path: str,
                    xml_path: str, terms: str) -> None:
    discard_symbols(db, archive_hash, path)
    cursor = db.execute("INSERT INTO symbols VALUES (?,?,?,?)",
                        (archive_hash, path, xml_path, terms))
    db.execute("INSERT INTO symbol_keys VALUES (?,?,?)", (archive_hash, path, cursor.lastrowid))


def xml_symbols(path: Path) -> str:
    terms = set()
    for _, element in ET.iterparse(path, events=("end",)):
        for key in ("name", "value", "template"):
            value = element.attrib.get(key)
            if value and len(value) <= 512 and (
                key != "value" or any(character.isalpha() or character in "_/" for character in value)
            ):
                terms.add(value)
        element.clear()
    return "\n".join(sorted(terms))


def validate_existing_xml(path: Path) -> bool:
    """Reject partial output left behind by an interrupted converter."""
    try:
        for _, element in ET.iterparse(path, events=("end",)):
            element.clear()
        return True
    except (OSError, ET.ParseError):
        return False


def converted_path(path: Path) -> Path:
    if path.name.lower().endswith(".mbin.pc"):
        return path.with_name(path.name[:-8] + ".MXML")
    return path.with_suffix(".MXML")


def search(args: argparse.Namespace) -> None:
    db = database(args.output / "index.sqlite")
    try:
        rows = db.execute(
            "SELECT path, xml_path FROM symbols WHERE symbols MATCH ? LIMIT ?",
            (args.query, args.limit),
        ).fetchall()
        print(json.dumps({"query": args.query, "matches": rows}, indent=2))
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--game", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--compiler", type=Path)
    parser.add_argument("--compiler-sha256")
    parser.add_argument("--python-tools", type=Path)
    parser.add_argument("--archive", help="Optional PAK name glob for pilot runs")
    parser.add_argument("--query", help="Search the local FTS5 symbol index")
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--retry-failed", action="store_true")
    parser.add_argument("--reserve-gib", type=int, default=20)
    parser.add_argument("--write-mib-per-second", type=int, default=16)
    parser.add_argument("--archive-pause-seconds", type=int, default=3)
    parser.add_argument("--converter-cpus", type=int, default=2)
    parser.add_argument("--report-mirror", type=Path, help="Optional diagnostic report on another volume")
    args = parser.parse_args()
    if args.reserve_gib < 2 or args.write_mib_per_second < 1 or args.archive_pause_seconds < 0:
        parser.error("Invalid storage limits")
    if not 1 <= args.converter_cpus <= min(os.cpu_count() or 1, 64):
        parser.error("Invalid converter CPU limit")
    reserve = args.reserve_gib * 1024**3
    args.output = args.output.resolve()
    if args.query:
        if not (args.output / "index.sqlite").is_file():
            parser.error("No research index exists at the selected output")
        search(args)
        return
    if not args.game or not args.compiler or not args.compiler_sha256:
        parser.error("Extraction requires --game, --compiler and --compiler-sha256")
    args.game = args.game.resolve()
    args.compiler = args.compiler.resolve()
    repository = Path(__file__).resolve().parents[2]
    if args.output.is_relative_to(args.game) or args.game.is_relative_to(args.output):
        parser.error("Output and game installation must be separate directories")
    if args.output.is_relative_to(repository):
        parser.error("Keep proprietary extracted assets outside the repository")
    if args.report_mirror:
        args.report_mirror = args.report_mirror.resolve()
        if args.report_mirror.is_relative_to(args.game) or args.report_mirror.is_relative_to(repository):
            parser.error("Report mirror must be outside the game and repository")
        args.report_mirror.parent.mkdir(parents=True, exist_ok=True)
    executable = args.game / "Binaries" / "NMS.exe"
    priority = {"nmsarc.precache.pak": 0, "nmsarc.metadataetc.pak": 1,
                "nmsarc.entityscenembin.pak": 2}
    archives = sorted((args.game / "GAMEDATA" / "PCBANKS").glob(args.archive or "*.pak"),
                      key=lambda path: (priority.get(path.name.lower(), 3), path.name.lower()))
    if not executable.is_file() or not archives:
        parser.error("The selected game directory has no executable or PAK archives")
    compiler_hash = sha256(args.compiler)
    if compiler_hash.lower() != args.compiler_sha256.lower():
        parser.error("Compiler SHA-256 does not match the selected artifact")
    if args.python_tools:
        sys.path.insert(0, str(args.python_tools.resolve()))
    from hgpaktool import HGPAKFile

    if importlib.metadata.version("hgpaktool") != "1.1.3":
        parser.error("This script requires the audited HGPAKtool 1.1.3 API")
    args.output.mkdir(parents=True, exist_ok=True)
    lock = args.output / "run.lock"
    try:
        lock_fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        parser.error("Corpus is locked; inspect run.lock and the recorded process before removing it")
    os.write(lock_fd, str(os.getpid()).encode())
    os.close(lock_fd)
    db = database(args.output / "index.sqlite")
    run = {
        "started_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "game_executable_sha256": sha256(executable),
        "compiler_sha256": compiler_hash,
        "script_sha256": sha256(Path(__file__)),
        "compiler_version": subprocess.check_output(
            [str(args.compiler), "version"], text=True, cwd=args.output
        ).strip(),
        "python": sys.version,
        "dependencies": {name: importlib.metadata.version(name)
                         for name in ("hgpaktool", "zstandard", "lz4")},
        "archives": [], "status": "running", "mutation": False,
        "limits": {"reserve_gib": args.reserve_gib,
                   "extraction_write_mib_per_second": args.write_mib_per_second,
                   "converter_cpus": args.converter_cpus,
                   "archive_pause_seconds": args.archive_pause_seconds},
    }
    report = args.output / "report.json"

    def save_report() -> None:
        payload = json.dumps(run, indent=2)
        if args.report_mirror:
            mirror_tmp = args.report_mirror.with_suffix(".tmp")
            mirror_tmp.write_text(payload, encoding="utf-8")
            mirror_tmp.replace(args.report_mirror)
        temporary = report.with_suffix(".tmp")
        temporary.write_text(payload, encoding="utf-8")
        temporary.replace(report)

    try:
        save_report()
        for index, archive in enumerate(archives, 1):
            before = archive.stat()
            archive_hash = sha256(archive)
            root = args.output / "archives" / f"{archive.stem}-{archive_hash[:12]}"
            root.mkdir(parents=True, exist_ok=True)
            entry = {"name": archive.name, "sha256": archive_hash,
                     "compressed_bytes": before.st_size, "status": "running"}
            run["archives"].append(entry)
            save_report()
            print(f"archive={index}/{len(archives)} name={archive.name} phase=extract", flush=True)
            try:
                with HGPAKFile(archive) as pak:
                    names = list(pak.files)
                    destinations = {name: safe_destination(root, name) for name in names}
                    if len({str(p).casefold() for p in destinations.values()}) != len(names):
                        raise ValueError("Archive contains case-insensitive duplicate paths")
                    pending = []
                    required = 0
                    for name in names:
                        size = pak.files[name].size
                        row = db.execute(
                            "SELECT extracted,content_hash FROM files WHERE archive_hash=? AND path=?",
                            (archive_hash, name),
                        ).fetchone()
                        target = destinations[name]
                        if row and row[0] == "ok" and target.is_file() and target.stat().st_size == size:
                            continue
                        pending.append(name)
                        required += size
                    if shutil.disk_usage(root).free < required + reserve:
                        raise OSError(f"Insufficient space: extraction needs {required} bytes plus reserve")
                    checked_parents = set()
                    for count, name in enumerate(pending, 1):
                        target = destinations[name]
                        target.parent.mkdir(parents=True, exist_ok=True)
                        if target.parent not in checked_parents:
                            if not target.parent.resolve().is_relative_to(root.resolve()):
                                raise ValueError("Output directory link escapes archive root")
                            checked_parents.add(target.parent)
                        if target.is_symlink():
                            raise ValueError("Output file is a symbolic link")
                        temporary = target.with_name(target.name + ".partial")
                        digest = hashlib.sha256()
                        size = pak.files[name].size
                        if shutil.disk_usage(root).free < size + reserve:
                            raise OSError("Extraction stopped at free-space reserve")
                        try:
                            # Audited pinned API iterator streams chunks without buffering large assets.
                            with temporary.open("wb") as output:
                                write_started = time.monotonic()
                                written_bytes = 0
                                for chunk in pak._extractor_function(name):
                                    output.write(chunk)
                                    digest.update(chunk)
                                    written_bytes += len(chunk)
                                    if written_bytes > size:
                                        raise ValueError("Extraction exceeds declared size")
                                    delay = written_bytes / (args.write_mib_per_second * 1024**2) - (time.monotonic() - write_started)
                                    if delay > 0:
                                        time.sleep(delay)
                            if temporary.stat().st_size != size:
                                raise RuntimeError("Extracted byte count differs from archive index")
                            temporary.replace(target)
                            db.execute("""INSERT OR REPLACE INTO files VALUES
                                (?,?,?,?,?,?,NULL,NULL,NULL,NULL)""",
                                (archive_hash, archive.name, name, size, "ok", digest.hexdigest()))
                        except OSError:
                            db.commit()
                            raise
                        except Exception as error:
                            temporary.unlink(missing_ok=True)
                            db.execute("""INSERT OR REPLACE INTO files VALUES
                                (?,?,?,?,?,NULL,NULL,NULL,NULL,?)""",
                                (archive_hash, archive.name, name, size, "failed", str(error)))
                        if count % 200 == 0:
                            db.commit()
                    db.commit()
                    mbins = [name for name in names if name.lower().endswith((".mbin", ".mbin.pc"))]
                after = archive.stat()
                if (before.st_size, before.st_mtime_ns) != (after.st_size, after.st_mtime_ns):
                    raise RuntimeError("Source archive changed during extraction")
                needs_conversion = False
                changed_compiler = False
                for name in mbins:
                    row = db.execute("SELECT conversion,compiler_hash FROM files WHERE archive_hash=? AND path=?",
                                     (archive_hash, name)).fetchone()
                    if not row or row[1] != compiler_hash or row[0] is None or (
                        row[0] == "ok" and not converted_path(destinations[name]).is_file()
                    ) or (args.retry_failed and row[0] != "ok"):
                        needs_conversion = True
                    if row and row[1] and row[1] != compiler_hash:
                        changed_compiler = True
                    target = converted_path(destinations[name])
                    if target.is_file() and (not row or row[0] is None):
                        if not validate_existing_xml(target):
                            target.replace(target.with_name(target.name + ".interrupted"))
                if args.retry_failed:
                    changed_compiler = True
                if needs_conversion:
                    entry["phase"] = "convert"
                    save_report()
                    print(f"name={archive.name} phase=convert candidates={len(mbins)}", flush=True)
                    log = root / "conversion-console.log"
                    with log.open("w", encoding="utf-8") as console:
                        command = [str(args.compiler), "convert", "--force",
                                   "--overwrite" if changed_compiler else "--keep",
                                   "--input-format=MBIN", "--output-format=MXML", "--exclude=", str(root)]
                        exit_code = monitored_conversion(command, root, console, reserve, args.converter_cpus)
                    entry["compiler_exit_code"] = exit_code
                entry["phase"] = "index"
                save_report()
                for position, name in enumerate(mbins, 1):
                    if position % 100 == 0 and shutil.disk_usage(root).free < reserve:
                        raise OSError("Indexing stopped at free-space reserve")
                    target = converted_path(destinations[name])
                    row = db.execute("SELECT conversion,compiler_hash FROM files WHERE archive_hash=? AND path=?",
                                     (archive_hash, name)).fetchone()
                    if row and row[0] == "ok" and row[1] == compiler_hash and target.is_file():
                        continue
                    if row and row[0] == "failed" and row[1] == compiler_hash and not args.retry_failed:
                        continue
                    try:
                        terms = xml_symbols(target)
                        replace_symbols(db, archive_hash, name, str(target), terms)
                        db.execute("UPDATE files SET conversion='ok',compiler_hash=?,xml_path=?,error=NULL WHERE archive_hash=? AND path=?",
                                   (compiler_hash, str(target), archive_hash, name))
                    except OSError as error:
                        if isinstance(error, FileNotFoundError):
                            discard_symbols(db, archive_hash, name)
                            db.execute("UPDATE files SET conversion='failed',compiler_hash=?,error=? WHERE archive_hash=? AND path=?",
                                       (compiler_hash, str(error), archive_hash, name))
                        else:
                            raise
                    except Exception as error:
                        discard_symbols(db, archive_hash, name)
                        db.execute("UPDATE files SET conversion='failed',compiler_hash=?,error=? WHERE archive_hash=? AND path=?",
                                   (compiler_hash, str(error), archive_hash, name))
                    if position % 100 == 0:
                        db.commit()
                db.commit()
                entry.update(files=len(names), mbins=len(mbins), status="processed")
                entry["conversion_counts"] = dict(db.execute(
                    "SELECT COALESCE(conversion,'not_applicable'),count(*) FROM files WHERE archive_hash=? GROUP BY conversion",
                    (archive_hash,)))
                entry["extraction_counts"] = dict(db.execute(
                    "SELECT extracted,count(*) FROM files WHERE archive_hash=? GROUP BY extracted",
                    (archive_hash,)))
            except (OSError, sqlite3.Error) as error:
                entry.update(status="failed", error=str(error))
                run.update(status="stopped_storage_error", error=str(error))
                save_report()
                raise
            except Exception as error:
                entry.update(status="failed", error=str(error))
            save_report()
            time.sleep(args.archive_pause_seconds)
        run["status"] = "completed_with_failures" if any(
            item["status"] == "failed" or item.get("conversion_counts", {}).get("failed", 0)
            or item.get("extraction_counts", {}).get("failed", 0)
            for item in run["archives"]
        ) else "completed"
        run["finished_utc"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        save_report()
        print(json.dumps({"status": run["status"], "report": str(report)}, indent=2), flush=True)
    finally:
        db.close()
        lock.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
