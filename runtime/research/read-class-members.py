"""Read the field table of a reflected class from a game executable.

The executable carries, for every data class the game can load or save, a record with the class
name, its size and a pointer to its member records; each member record has the field name, its
size and its offset inside the class. This tool prints them. It reads the file only; it runs no
game code and needs no game process.

Record shapes, read from build 180836 on 2026-10-08 and checked on two classes whose offsets
were already known from disassembly (HomeSystemSeed at 0x4c8, CurrentFreighterHomeSystemSeed at
0x83c20):

  class record   +0x00 pointer to the name, +0x18 pointer to the member records,
                 +0x20 member count (32 bits), +0x24 class size (32 bits)
  member record  +0x00 pointer to the name, +0x14 size (32 bits), +0x18 element count (32 bits),
                 +0x1c offset (32 bits); the distance between records is found from the file.

Examples:
  python read-class-members.py --executable E:/.../NMS.exe --class cGcSolarSystemData
  python read-class-members.py --executable E:/.../NMS.exe --field-name Seed
"""
from __future__ import annotations

import argparse
import hashlib
import re
import struct
from pathlib import Path


class Image:
    def __init__(self, path: Path) -> None:
        self.data = path.read_bytes()
        data = self.data
        pe = struct.unpack_from('<I', data, 0x3c)[0]
        count = struct.unpack_from('<H', data, pe + 6)[0]
        optional = struct.unpack_from('<H', data, pe + 20)[0]
        self.base = struct.unpack_from('<Q', data, pe + 24 + 24)[0]
        self.sections = []
        for index in range(count):
            at = pe + 24 + optional + index * 40
            virtual_size, address, raw_size, raw_offset = struct.unpack_from('<IIII', data, at + 8)
            self.sections.append((address, raw_offset, raw_size))

    def offset(self, pointer: int) -> int | None:
        rva = pointer - self.base
        for address, raw_offset, raw_size in self.sections:
            if address <= rva < address + raw_size:
                return raw_offset + rva - address
        return None

    def pointer(self, offset: int) -> int | None:
        for address, raw_offset, raw_size in self.sections:
            if raw_offset <= offset < raw_offset + raw_size:
                return self.base + address + offset - raw_offset
        return None

    def text(self, pointer: int) -> str | None:
        at = self.offset(pointer)
        if at is None:
            return None
        end = self.data.find(b'\0', at, at + 96)
        raw = self.data[at:end]
        if not raw or any(byte < 32 or byte > 126 for byte in raw):
            return None
        return raw.decode('ascii')

    def references(self, name: str) -> list[int]:
        """File offsets of 64-bit pointers to the zero-terminated string `name`."""
        found = []
        start = 0
        needle = b'\0' + name.encode('ascii') + b'\0'
        while True:
            at = self.data.find(needle, start)
            if at < 0:
                break
            start = at + 1
            pointer = self.pointer(at + 1)
            if pointer is None:
                continue
            packed = struct.pack('<Q', pointer)
            position = 0
            while True:
                position = self.data.find(packed, position)
                if position < 0:
                    break
                found.append(position)
                position += 8
        return found

    def members(self, table: int, count: int) -> list[tuple[str, int, int, int]]:
        """(name, offset, size, element count) of `count` member records starting at `table`."""
        start = self.offset(table)
        if start is None or not 0 < count <= 4096:
            raise SystemExit('member table is not inside the file')
        names = []
        for position in range(0, 0x100, 8):
            if self.text(struct.unpack_from('<Q', self.data, start + position)[0]):
                names.append(position)
        if not names or names[0] != 0:
            raise SystemExit('member table does not start with a name')
        stride = names[1] if len(names) > 1 else 0x48
        result = []
        for index in range(count):
            at = start + index * stride
            name = self.text(struct.unpack_from('<Q', self.data, at)[0])
            if name is None:
                raise SystemExit('member %d has no readable name; record shape differs' % index)
            size, elements, offset = struct.unpack_from('<III', self.data, at + 0x14)
            result.append((name, offset, size, elements))
        return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--executable', type=Path, required=True)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--class', dest='class_name', help='Class name as the game spells it, for example cGcSolarSystemData')
    group.add_argument('--field-name', help='Regular expression; lists every member record whose name matches')
    args = parser.parse_args()
    image = Image(args.executable)
    print('executable SHA-256', hashlib.sha256(image.data).hexdigest())
    if args.class_name:
        for reference in image.references(args.class_name):
            table, count, size = struct.unpack_from('<QII', image.data, reference + 0x18)
            if image.offset(table) is None or not 0 < count <= 4096:
                continue
            print('class %s: size 0x%x, %d members' % (args.class_name, size, count))
            print('| Field | Offset | Size | Elements |')
            print('| --- | --- | --- | --- |')
            for name, offset, field_size, elements in sorted(image.members(table, count), key=lambda item: item[1]):
                print('| `%s` | `0x%x` | `0x%x` | %d |' % (name, offset, field_size, elements))
            return
        raise SystemExit('no class record found for ' + args.class_name)
    pattern = re.compile(args.field_name)
    seen = set()
    for match in re.finditer(rb'\x00([A-Za-z][A-Za-z0-9 _]{2,60})\x00', image.data):
        name = match.group(1).decode('ascii')
        if name in seen or not pattern.search(name):
            continue
        seen.add(name)
        for reference in image.references(name):
            size, elements, offset = struct.unpack_from('<III', image.data, reference + 0x14)
            # A member record: small element count and a size that fits a field.
            if 0 < elements <= 4096 and 0 < size <= 0x100000 and offset < 0x4000000:
                print('%-44s offset 0x%-7x size 0x%-5x elements %d' % (name, offset, size, elements))


if __name__ == '__main__':
    main()
