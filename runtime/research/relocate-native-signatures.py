"""Relocate selected instruction windows from one pinned executable to another.

Each window is decoded in the source executable; rip-relative displacements and
direct call/jump targets are wildcarded, every other byte must match exactly.
A unique match is a location candidate for the target build, not a verified
semantic identity or ABI. No process is attached and nothing is executed.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import sys


def sections(raw):
    pe = struct.unpack_from('<I', raw, 0x3c)[0]
    count, optional = struct.unpack_from('<H', raw, pe + 6)[0], struct.unpack_from('<H', raw, pe + 20)[0]
    for index in range(count):
        at = pe + 24 + optional + index * 40
        _, address, raw_size, raw_at = struct.unpack_from('<IIII', raw, at + 8)
        yield raw[at:at + 8].rstrip(b'\0').decode(), address, raw_at, raw_size


def load(path, expected):
    if path.stat().st_size > 160 * 1024**2:
        raise ValueError('Executable byte budget exceeded')
    raw = path.read_bytes()
    if hashlib.sha256(raw).hexdigest() != expected.lower():
        raise ValueError('Executable fingerprint mismatch: ' + str(path))
    text = next(section for section in sections(raw) if section[0] == '.text')
    return raw, text


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--source-sha256', required=True)
    parser.add_argument('--target', type=Path, required=True)
    parser.add_argument('--target-sha256', required=True)
    parser.add_argument('--window', action='append', required=True,
                        help='label=RVA:size in hex, e.g. setup=8e3a10:30; maximum 64')
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists() or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Require a new output outside the repository')
    if not 1 <= len(args.window) <= 64:
        parser.error('Select 1..64 windows')
    source, source_text = load(args.source, args.source_sha256)
    target, target_text = load(args.target, args.target_sha256)
    sys.path.insert(0, str(args.python_tools))
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64
    from capstone.x86_const import X86_OP_MEM, X86_REG_RIP
    decoder = Cs(CS_ARCH_X86, CS_MODE_64)
    decoder.detail = True
    haystack = target[target_text[2]:target_text[2] + target_text[3]]
    records = []
    for item in args.window:
        label, _, span = item.partition('=')
        rva, size = (int(value, 16) for value in span.split(':'))
        if not 8 <= size <= 0x400 or not source_text[1] <= rva <= source_text[1] + source_text[3] - size:
            parser.error('Window outside .text or size outside 8..0x400: ' + item)
        code = source[source_text[2] + rva - source_text[1]:][:size]
        pattern, decoded = b'', 0
        for instruction in decoder.disasm(code, rva):
            parts = [re.escape(bytes([value])) for value in instruction.bytes]
            data = bytes(instruction.bytes)
            wild = range(0)
            if instruction.disp_size == 4 and any(op.type == X86_OP_MEM and op.mem.base == X86_REG_RIP
                                                  for op in instruction.operands):
                wild = range(instruction.disp_offset, instruction.disp_offset + 4)
            elif data[0] in (0xe8, 0xe9) and len(data) == 5:
                wild = range(1, 5)
            elif data[0] == 0x0f and 0x80 <= data[1] <= 0x8f and len(data) == 6:
                wild = range(2, 6)
            for index in wild:
                parts[index] = b'.'
            pattern += b''.join(parts)
            decoded += instruction.size
        if decoded != size:
            parser.error('Window does not end on an instruction boundary: ' + item)
        matches = [target_text[1] + match.start() for match in re.finditer(pattern, haystack, re.S)]
        entry = {'label': label, 'source_rva': hex(rva), 'size': size, 'matches': [hex(m) for m in matches]}
        if len(matches) == 1:
            at = target_text[2] + matches[0] - target_text[1]
            entry['target_bytes_sha256'] = hashlib.sha256(target[at:at + size]).hexdigest()
            entry['identical_bytes'] = target[at:at + size] == code
        records.append(entry)
    report = {'source_sha256': args.source_sha256.lower(), 'target_sha256': args.target_sha256.lower(),
              'tool_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), 'windows': records,
              'unique': sum(len(r['matches']) == 1 for r in records), 'runtime_verified': False,
              'limitations': ['Masked byte equality of a bounded window only.',
                              'Does not compare the remaining function body, data layouts or ABI.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({'windows': len(records), 'unique': report['unique']}))
    for record in records:
        print(record['label'], record['source_rva'], '->', ','.join(record['matches']) or 'no match')


if __name__ == '__main__':
    main()
