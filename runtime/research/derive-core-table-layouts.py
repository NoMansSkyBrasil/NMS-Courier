"""Derive the binary layout of the three core definition tables from a research corpus.

The desktop application reads the substance, product and technology tables straight from the
game's archives, without a converter. It needs, for each table, where the entry array is, how big
an entry is and where a handful of fields sit inside it. This tool finds those numbers by
comparing each binary table with the text the pinned converter produced for the same file, and
accepts a field offset only when it holds for every entry of the table.

The result is keyed by the 16 header bytes that identify the table's structure revision, so the
application refuses a table whose structure it was not derived for.

Reads the corpus only; never touches the game or a save.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import struct
import xml.etree.ElementTree as ET
from pathlib import Path

HEADER_SIZE = 0x20
TABLES = {
    "substance": {
        "path": "metadata/reality/tables/nms_reality_gcsubstancetable",
        "template": "cGcSubstanceTable",
        "strings": {"gameId": "ID", "name": "Name", "nameLower": "NameLower",
                    "subtitle": "Subtitle", "description": "Description", "icon": "Icon/Filename"},
        "category": "Category/SubstanceCategory",
    },
    "product": {
        "path": "metadata/reality/tables/nms_reality_gcproducttable",
        "template": "cGcProductTable",
        "strings": {"gameId": "ID", "name": "Name", "nameLower": "NameLower",
                    "subtitle": "Subtitle", "description": "Description", "icon": "Icon/Filename"},
        "category": "Type/ProductCategory",
    },
    "technology": {
        "path": "metadata/reality/tables/nms_reality_gctechnologytable",
        "template": "cGcTechnologyTable",
        "strings": {"gameId": "ID", "name": "Name", "nameLower": "NameLower",
                    "subtitle": "Subtitle", "description": "Description", "icon": "Icon/Filename"},
        "category": "Category/TechnologyCategory",
    },
}


def child_value(entry: ET.Element, path: str) -> str:
    node = entry
    for name in path.split("/"):
        node = next(child for child in node if child.get("name") == name)
    return node.get("value") or ""


def find_list(data: bytes, count: int) -> tuple[int, int]:
    """Position of the root list header whose count matches, and of its first entry."""
    for position in range(HEADER_SIZE, HEADER_SIZE + 0x100, 8):
        offset, length, marker = struct.unpack_from("<qII", data, position)
        if length == count and marker & 0xFF == 1 and offset > 0:
            return position, position + offset
    raise SystemExit("no root list with %d entries" % count)


def inline_string(data: bytes, start: int) -> bytes:
    return data[start:data.index(b"\0", start)]


def variable_string(data: bytes, start: int) -> bytes | None:
    """A string stored outside the entry: relative offset, length, marker."""
    offset, length, marker = struct.unpack_from("<qII", data, start)
    if marker & 0xFF != 1 or offset < 0 or start + offset + length > len(data):
        return None
    return data[start + offset:start + offset + length].rstrip(b"\0")


READERS = {"inline": inline_string, "variable": variable_string}


def derive(corpus: Path, domain: str, spec: dict) -> dict:
    matches = sorted(corpus.glob("archives/*/" + spec["path"] + ".mbin"))
    if not matches:
        raise SystemExit("table not in corpus: " + spec["path"])
    binary_path = matches[0]
    data = binary_path.read_bytes()
    root = ET.parse(binary_path.with_suffix(".MXML")).getroot()
    if root.get("template") != spec["template"]:
        raise SystemExit("unexpected template in " + str(binary_path))
    table = next(child for child in root if child.get("name") == "Table")
    entries = list(table)
    count = len(entries)
    list_position, first = find_list(data, count)

    # Entry size: distance between the identifiers of the first two entries.
    ids = [child_value(entry, "ID") for entry in entries]
    first_id = data.index(ids[0].encode() + b"\0", first)
    second_id = data.index(ids[1].encode() + b"\0", first_id + 1)
    size = second_id - first_id
    if first + count * size > len(data):
        raise SystemExit("entry array does not fit: " + domain)

    fields = {}
    for field, path in spec["strings"].items():
        wanted = [child_value(entry, path) for entry in entries]
        wanted_bytes = [value.encode("utf-8") for value in wanted]
        found = None
        for kind, reader in READERS.items():
            for offset in range(0, size, 4):
                if all(reader(data, first + index * size + offset) == value
                       for index, value in enumerate(wanted_bytes)):
                    found = {"offset": offset, "kind": kind}
                    break
            if found:
                break
        if found is None:
            raise SystemExit("no offset holds for every entry: %s.%s" % (domain, field))
        fields[field] = found

    wanted = [child_value(entry, spec["category"]) for entry in entries]
    category = None
    for offset in range(0, size, 4):
        names: dict[int, str] = {}
        ok = True
        for index, value in enumerate(wanted):
            number = struct.unpack_from("<i", data, first + index * size + offset)[0]
            if names.setdefault(number, value) != value:
                ok = False
                break
        if ok and len(set(names.values())) == len(names) and len(names) > 1:
            if category is not None:
                raise SystemExit("category offset is ambiguous: " + domain)
            category = {"offset": offset,
                        "names": {str(number): names[number] for number in sorted(names)}}
    if category is None:
        raise SystemExit("no category offset: " + domain)

    return {
        "path": spec["path"] + ".mbin",
        "structure": data[8:24].hex(),
        "listPosition": list_position,
        "entrySize": size,
        "entryCount": count,
        "sourceSha256": hashlib.sha256(data).hexdigest(),
        "fields": fields,
        "category": category,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--corpus", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    layouts = {domain: derive(args.corpus, domain, spec) for domain, spec in TABLES.items()}
    args.output.write_text(json.dumps(layouts, indent=2) + "\n", encoding="utf-8", newline="\n")
    for domain, layout in layouts.items():
        print(domain, layout["structure"], "entries", layout["entryCount"],
              "size", hex(layout["entrySize"]), layout["fields"],
              "category@%d" % layout["category"]["offset"], len(layout["category"]["names"]))


if __name__ == "__main__":
    main()
