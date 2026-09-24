"""Find upstream frontend signatures in the pinned NMS executable without modifying it."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import struct


EXPECTED_SHA256 = "b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb"
SOURCE = (
    "https://github.com/monkeyman192/NMS.py/blob/"
    "b41bf9e6fdff1c833b77d805bb0c8da555c4ced4/nmspy/data/types.py"
)
SIGNATURES = {
    "QueueFrontendPage": "48 63 81 ? ? ? ? 48 03 C0 83 BC C1 ? ? ? ? ? 75 ? 89 94 C1",
    "RenderPage": (
        "48 89 4C 24 ? 55 53 48 8D AC 24 ? ? ? ? B8 ? ? ? ? "
        "E8 ? ? ? ? 48 2B E0 48 89 B4 24 ? ? ? ? 48 89 BC"
    ),
}
KNOWN_REWARD_RVA = 0xF0BD70


def pattern_regex(signature: str) -> re.Pattern[bytes]:
    return re.compile(
        b"".join(b"." if item == "?" else re.escape(bytes.fromhex(item))
                 for item in signature.split()),
        re.DOTALL,
    )


def executable_sections(data: bytes) -> list[dict[str, int | str]]:
    if data[:2] != b"MZ":
        raise ValueError("Not an MZ executable")
    pe_offset = struct.unpack_from("<I", data, 0x3C)[0]
    if data[pe_offset:pe_offset + 4] != b"PE\0\0":
        raise ValueError("Not a PE executable")
    count = struct.unpack_from("<H", data, pe_offset + 6)[0]
    optional_size = struct.unpack_from("<H", data, pe_offset + 20)[0]
    section_offset = pe_offset + 24 + optional_size
    sections = []
    for index in range(count):
        offset = section_offset + index * 40
        name = data[offset:offset + 8].rstrip(b"\0").decode("ascii", errors="replace")
        virtual_size, virtual_address, raw_size, raw_offset = struct.unpack_from(
            "<IIII", data, offset + 8
        )
        sections.append({
            "name": name,
            "virtual_size": virtual_size,
            "virtual_address": virtual_address,
            "raw_size": raw_size,
            "raw_offset": raw_offset,
        })
    return sections


def locate(data: bytes) -> dict[str, object]:
    sections = executable_sections(data)
    results = {}
    for name, signature in SIGNATURES.items():
        matches = []
        expression = pattern_regex(signature)
        for section in sections:
            if section["name"] != ".text":
                continue
            start = int(section["raw_offset"])
            end = start + int(section["raw_size"])
            for match in expression.finditer(data, start, end):
                rva = int(section["virtual_address"]) + match.start() - start
                matches.append({"rva": hex(rva), "file_offset": hex(match.start())})
        results[name] = matches
    targets = {
        int(matches[0]["rva"], 16): name
        for name, matches in results.items() if len(matches) == 1
    }
    targets[KNOWN_REWARD_RVA] = "GiveGenericReward"
    calls = {name: [] for name in targets.values()}
    for section in sections:
        if section["name"] != ".text":
            continue
        start = int(section["raw_offset"])
        end = start + int(section["raw_size"])
        position = start
        while True:
            position = data.find(b"\xE8", position, end - 4)
            if position < 0:
                break
            caller_rva = int(section["virtual_address"]) + position - start
            displacement = struct.unpack_from("<i", data, position + 1)[0]
            target_rva = caller_rva + 5 + displacement
            if target_rva in targets:
                calls[targets[target_rva]].append(hex(caller_rva))
            position += 1
    return {
        "source": SOURCE,
        "signatures": results,
        "potential_direct_call_sites": calls,
        "call_site_caveat": "Byte-level E8 matches are candidates until instruction boundaries are verified",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("executable")
    args = parser.parse_args()
    with open(args.executable, "rb") as game_file:
        data = game_file.read()
    digest = hashlib.sha256(data).hexdigest()
    if digest != EXPECTED_SHA256:
        raise SystemExit("Executable hash does not match the pinned build")
    print(json.dumps({"exe_sha256": digest, **locate(data)}, indent=2))


if __name__ == "__main__":
    main()
