"""Download and verify portable developer analysis tools outside the repository."""

import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path, PurePosixPath
import urllib.request
import zipfile


def prepare(root, name, configuration):
    downloads = root / "downloads"
    downloads.mkdir(parents=True, exist_ok=True)
    archive = downloads / f"{name}-{configuration['version'].replace('+', '_')}.zip"
    if not archive.exists():
        temporary = archive.with_suffix(".partial")
        urllib.request.urlretrieve(configuration["url"], temporary)
        temporary.replace(archive)
    with archive.open("rb") as stream:
        digest = hashlib.file_digest(stream, "sha256").hexdigest()
    if digest != configuration["sha256"]:
        raise RuntimeError(f"{name}: downloaded SHA-256 differs from pinned artifact")
    destination = root / name
    marker = destination / "verified-artifact.json"
    if marker.exists() and json.loads(marker.read_text()) == configuration:
        return {"name": name, "directory": str(destination), "sha256": digest, "reused": True}
    destination.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive) as package:
        for item in package.infolist():
            parts = PurePosixPath(item.filename.replace("\\", "/"))
            if parts.is_absolute() or any(part == ".." or ":" in part for part in parts.parts):
                raise ValueError("Unsafe tool archive member")
            if ((item.external_attr >> 16) & 0o170000) == 0o120000:
                raise ValueError("Symbolic tool archive member is not supported")
        package.extractall(destination)
    marker.write_text(json.dumps(configuration, indent=2), encoding="utf-8")
    return {"name": name, "directory": str(destination), "sha256": digest, "reused": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    root = args.output.resolve()
    if root.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error("Portable tools must be stored outside the repository")
    config = json.loads(Path(__file__).with_name("offline-tools.json").read_text())
    with ThreadPoolExecutor(max_workers=2) as pool:
        jobs = [pool.submit(prepare, root, name, definition) for name, definition in config.items()]
        for job in jobs:
            print(json.dumps(job.result()), flush=True)


if __name__ == "__main__":
    main()
