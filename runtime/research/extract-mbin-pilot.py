"""Extract three selected tables serially, stage conversion, then verify publication."""

import argparse
import importlib.util
import importlib.metadata
import json
from pathlib import Path
import shutil
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

SPEC = importlib.util.spec_from_file_location("bulk", Path(__file__).with_name("bulk-game-data.py"))
bulk = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(bulk)
ASSETS = (
    "metadata/reality/tables/rewardtable.mbin",
    "metadata/reality/tables/inventorytable.mbin",
    "metadata/simulation/space/aispaceshipmanager.mbin",
)
COMPILER_HASH = "4179dddb665f7cddbe9dddddf6e529172abdd98b0097f65fdd224467d5bb3ea4"
MAX_INPUT = 32 * 1024**2
MAX_STAGE = 128 * 1024**2
RESERVE = 2 * 1024**3


def validate_roots(game, stage, output, compiler, tools):
    """Reject overlapping roots and require new external directories."""
    repository = Path(__file__).resolve().parents[2]
    protected = (game, repository, compiler.parent, tools)
    for target in (stage, output):
        if target.exists():
            raise ValueError("Stage and output must be new directories")
        for source in protected:
            if target.is_relative_to(source) or source.is_relative_to(target):
                raise ValueError("Research directories overlap protected files")
    if stage.is_relative_to(output) or output.is_relative_to(stage):
        raise ValueError("Stage and output must be separate")
    if stage.drive.casefold() == output.drive.casefold():
        raise ValueError("Stage and publication must use separate drives")
    for target in (stage, output):
        parent = target.parent
        while not parent.exists():
            parent = parent.parent
        if shutil.disk_usage(parent).free < RESERVE + MAX_STAGE:
            raise ValueError("Insufficient free space for bounded pilot and reserve")


def stage_size(root):
    return sum(p.stat().st_size for p in root.rglob("*") if p.is_file())


def convert(compiler, mbin, stage):
    """Monitor one converter with a wall-clock and staged-output limit."""
    log = mbin.with_suffix(".conversion.log")
    with log.open("x", encoding="utf-8") as console:
        child = subprocess.Popen(
            [str(compiler), "convert", "--force", "--keep", "--input-format=MBIN",
             "--output-format=MXML", "--exclude=", str(mbin)],
            cwd=stage, stdout=console, stderr=subprocess.STDOUT,
        )
        started = time.monotonic()
        try:
            while child.poll() is None:
                if time.monotonic() - started > 120 or stage_size(stage) > MAX_STAGE:
                    raise RuntimeError("Converter exceeded time or staged-output budget")
                time.sleep(0.25)
            if child.returncode != 0 or stage_size(stage) > MAX_STAGE:
                raise RuntimeError("Converter failed or exceeded staged-output budget")
        finally:
            if child.poll() is None:
                child.kill()
                child.wait()
    xml = bulk.converted_path(mbin)
    for _, element in ET.iterparse(xml, events=("end",)):
        element.clear()
    return xml


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("game", "stage", "output", "compiler", "python-tools"):
        parser.add_argument("--" + name, type=Path, required=True)
    args = parser.parse_args()
    game, stage, output, compiler, tools = (
        p.resolve() for p in (args.game, args.stage, args.output, args.compiler, args.python_tools)
    )
    validate_roots(game, stage, output, compiler, tools)
    if bulk.sha256(compiler) != COMPILER_HASH:
        raise ValueError("Compiler fingerprint mismatch")
    sys.path.insert(0, str(tools))
    from hgpaktool import HGPAKFile
    dependencies = {name: importlib.metadata.version(name)
                    for name in ("hgpaktool", "zstandard", "lz4")}
    if dependencies != {"hgpaktool": "1.1.3", "zstandard": "0.25.0", "lz4": "4.4.5"}:
        raise ValueError("Pinned extraction dependency mismatch")
    archive = game / "GAMEDATA" / "PCBANKS" / "NMSARC.Precache.pak"
    before = archive.stat()
    report = {
        "started_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "game_sha256": bulk.sha256(game / "Binaries" / "NMS.exe"),
        "archive_sha256": bulk.sha256(archive), "compiler_sha256": COMPILER_HASH,
        "script_sha256": bulk.sha256(Path(__file__)), "dependencies": dependencies,
        "output": str(output), "stage": str(stage), "files": [], "status": "running",
        "runtime_mutation": False, "max_publication_bytes": MAX_STAGE,
    }
    stage.mkdir(parents=True, exist_ok=False)

    def save_report():
        (stage / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    try:
        save_report()
        with HGPAKFile(archive) as pak:
            names = {name.lower().replace("\\", "/"): name for name in pak.files}
            selected = [names[asset] for asset in ASSETS]
            if any(not 0 < pak.files[name].size <= MAX_INPUT for name in selected):
                raise ValueError("Selected MBIN exceeds input budget")
            for name in selected:
                print(f"phase=extract asset={name}", flush=True)
                target = bulk.safe_destination(stage, name)
                target.parent.mkdir(parents=True, exist_ok=True)
                written = 0
                with target.open("xb") as stream:
                    for chunk in pak._extractor_function(name):
                        written += len(chunk)
                        if written > pak.files[name].size:
                            raise ValueError("Extraction exceeded declared asset size")
                        stream.write(chunk)
                if written != pak.files[name].size:
                    raise ValueError("Extraction size mismatch")
                xml = convert(compiler, target, stage)
                report["files"].append({
                    "asset": name, "mbin_bytes": written, "mbin_sha256": bulk.sha256(target),
                    "xml_bytes": xml.stat().st_size, "xml_sha256": bulk.sha256(xml),
                    "xml_relative": str(xml.relative_to(stage)),
                })
                save_report()
                time.sleep(1)
        after = archive.stat()
        if (before.st_size, before.st_mtime_ns) != (after.st_size, after.st_mtime_ns):
            raise RuntimeError("Archive changed during pilot")
        files = [bulk.safe_destination(stage, entry["asset"]) for entry in report["files"]]
        files += [stage / entry["xml_relative"] for entry in report["files"]]
        total = sum(path.stat().st_size for path in files)
        if total > MAX_STAGE or shutil.disk_usage(output.parent).free < total + RESERVE:
            raise RuntimeError("Publication budget or free-space check failed")
        output.mkdir(parents=True, exist_ok=False)
        for source in files:
            destination = output / source.relative_to(stage)
            destination.parent.mkdir(parents=True, exist_ok=True)
            print(f"phase=publish file={source.name} bytes={source.stat().st_size}", flush=True)
            with source.open("rb") as reader, destination.open("xb") as writer:
                shutil.copyfileobj(reader, writer, length=256 * 1024)
            if bulk.sha256(destination) != bulk.sha256(source):
                raise RuntimeError("Published file readback hash mismatch")
            time.sleep(1)
        report.update(status="verified", published_bytes=total)
        save_report()
        with (output / "report.json").open("x", encoding="utf-8") as stream:
            stream.write(json.dumps(report, indent=2))
        if bulk.sha256(output / "report.json") != bulk.sha256(stage / "report.json"):
            raise RuntimeError("Published report readback hash mismatch")
        print(json.dumps({"status": report["status"], "files": len(report["files"]),
                          "published_bytes": total, "output": str(output)}), flush=True)
    except BaseException as error:
        report.update(status="failed", error=str(error))
        save_report()
        raise


if __name__ == "__main__":
    main()
