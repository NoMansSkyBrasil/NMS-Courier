"""Resolve bounded ASCII name references from exact-build offline pseudocode."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import runpy

EXPECTED_SHA256 = "671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4"


def inspect(executable, pseudocode):
    data = executable.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    if digest != EXPECTED_SHA256:
        raise ValueError("Unsupported executable fingerprint")
    parser = Path(__file__).parents[1] / "native/asi/locate-frontend-hooks.py"
    sections = runpy.run_path(str(parser))["executable_sections"](data)
    text = pseudocode.read_text(encoding="utf-8-sig")
    addresses = sorted(set(re.findall(r"\bUNK_(14[0-9a-f]+)\b", text)))
    if len(addresses) > 256:
        raise ValueError("Pseudocode exceeds the 256-reference bound")
    references = []
    for address in addresses:
        rva = int(address, 16) - 0x140000000
        for section in sections:
            start, size = int(section["virtual_address"]), int(section["raw_size"])
            if not start <= rva < start + size:
                continue
            offset = int(section["raw_offset"]) + rva - start
            raw = data[offset:offset + min(128, start + size - rva)]
            name, separator, _ = raw.partition(b"\0")
            if separator and name and all(32 <= value < 127 for value in name):
                references.append({"rva": hex(rva), "name": name.decode("ascii")})
            break
    return {"executable_sha256": digest,
            "pseudocode_sha256": hashlib.sha256(pseudocode.read_bytes()).hexdigest(),
            "reference_candidates": len(addresses), "ascii_references": references,
            "runtime_verified": False, "mode": "offline_read_only"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--executable", type=Path, required=True)
    parser.add_argument("--pseudocode", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = inspect(args.executable, args.pseudocode)
    except ValueError as error:
        parser.error(str(error))
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
