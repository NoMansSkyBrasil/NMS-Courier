"""Compare whole routines between two pinned executables after masking relocated operands.

For each pair source_rva:target_rva the routine extent is taken from the
exception table of each file (all chained fragments), both are disassembled
linearly, and instructions are compared with instruction-pointer-relative
displacements, direct branch and call targets and absolute image addresses
replaced by placeholders. An identical normalized stream means the routine's
logic did not change between the builds; it says nothing about the data the
routine reads, and it does not make a port valid for other routines.
"""
import argparse
import bisect
import hashlib
import json
from pathlib import Path
import re
import struct
import sys


class Image:
    def __init__(self, path, expected):
        self.raw = Path(path).read_bytes()
        if len(self.raw) > 160 * 1024**2 or hashlib.sha256(self.raw).hexdigest() != expected.lower():
            raise ValueError('Executable fingerprint mismatch: %s' % path)
        pe = struct.unpack_from('<I', self.raw, 0x3c)[0]
        count, optional = struct.unpack_from('<H', self.raw, pe + 6)[0], struct.unpack_from('<H', self.raw, pe + 20)[0]
        self.sections = [struct.unpack_from('<IIII', self.raw, pe + 24 + optional + index * 40 + 8)
                         for index in range(count)]
        table, size = struct.unpack_from('<II', self.raw, pe + 24 + 112 + 3 * 8)
        at = self.offset(table)
        self.functions = [struct.unpack_from('<III', self.raw, at + index * 12) for index in range(size // 12)]
        self.starts = [entry[0] for entry in self.functions]

    def offset(self, rva):
        for _, address, raw_size, raw_at in self.sections:
            if address <= rva < address + raw_size:
                return raw_at + rva - address
        raise ValueError('Address is not file-backed: %x' % rva)

    def extent(self, rva):
        """Start and end of the routine containing rva, joining chained unwind fragments."""
        index = bisect.bisect_right(self.starts, rva) - 1
        if index < 0 or not self.functions[index][0] <= rva < self.functions[index][1]:
            # Leaf routines have no unwind entry: take the bytes up to the padding that follows them.
            at = self.offset(rva)
            end = self.raw.find(bytes([0xcc, 0xcc]), at)
            if end < 0 or end - at > 0x4000:
                raise ValueError('No unwind entry or padding bounds %x' % rva)
            return rva, rva + end - at
        chained = lambda item: (self.raw[self.offset(self.functions[item][2])] >> 3) & 4
        first = last = index
        while first > 0 and chained(first):
            first -= 1
        while last + 1 < len(self.functions) and chained(last + 1):
            last += 1
        return self.functions[first][0], self.functions[last][1]

    def code(self, start, end):
        at = self.offset(start)
        return self.raw[at:at + end - start]


def normalized(engine, image, start, end):
    """Instruction strings with relocated operands masked; jump-table data inside the routine is cut off."""
    code = image.code(start, end)
    # A displacement that points inside the routine addresses a jump table stored after its code.
    tables = [int(value, 16) for item in engine.disasm(code, start)
              for value in re.findall(r'[+] (0x[0-9a-f]{5,})\]', item.op_str) if start <= int(value, 16) < end]
    limit = min(tables) if tables else end
    stream = []
    for item in engine.disasm(code[:limit - start], start):
        operands = re.sub(r'rip [+-] 0x[0-9a-f]+', 'rip + DISP', item.op_str)
        if item.mnemonic.startswith(('j', 'call', 'loop')) and re.fullmatch(r'0x[0-9a-f]+', operands):
            target = int(operands, 16)
            operands = 'LOCAL%+d' % (target - start) if start <= target < end else 'EXTERNAL'
        # Image-relative table displacements and absolute image addresses move between builds.
        operands = re.sub(r'([+-]) 0x[0-9a-f]{6,}\]', lambda match: match.group(1) + ' IMAGEDISP]', operands)
        operands = re.sub(r'0x14[0-9a-f]{7}(?![0-9a-f])', 'IMAGE', operands)
        stream.append(item.mnemonic + ' ' + operands)
    return stream, len(tables)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('source', 'target', 'python-tools'):
        parser.add_argument('--' + key, type=Path, required=True)
    parser.add_argument('--source-sha256', required=True)
    parser.add_argument('--target-sha256', required=True)
    parser.add_argument('--pair', action='append', required=True, help='label=source_rva:target_rva in hex; maximum 96')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists() or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Require a new output outside the repository')
    sys.path.insert(0, str(args.python_tools))
    import capstone
    engine = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_64)
    source, target = Image(args.source, args.source_sha256), Image(args.target, args.target_sha256)
    records = []
    for text in args.pair[:96]:
        label, span = text.split('=', 1)
        left, right = (int(value, 16) for value in span.split(':'))
        record = {'label': label, 'source_rva': hex(left), 'target_rva': hex(right)}
        try:
            first, second = source.extent(left), target.extent(right)
            (one, one_tables), (two, two_tables) = normalized(engine, source, *first), normalized(engine, target, *second)
            difference = next((index for index, pair in enumerate(zip(one, two)) if pair[0] != pair[1]), None)
            if difference is None and len(one) != len(two):
                difference = min(len(one), len(two))
            record.update(source_extent=[hex(value) for value in first], target_extent=[hex(value) for value in second],
                          source_instructions=len(one), target_instructions=len(two),
                          entry_at_extent_start=left == first[0] and right == second[0],
                          jump_table_references=[one_tables, two_tables],
                          identical=difference is None and one_tables == two_tables)
            if difference is not None:
                record['first_difference'] = {'index': difference, 'source': one[difference:difference + 3],
                                              'target': two[difference:difference + 3]}
        except ValueError as error:
            record.update(identical=False, error=str(error))
        records.append(record)
    report = {'source_sha256': args.source_sha256.lower(), 'target_sha256': args.target_sha256.lower(),
              'tool_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), 'records': records,
              'identical': sum(record['identical'] for record in records), 'compared': len(records),
              'limitations': ['Linear disassembly; jump-table data after the code is cut off and its entries are not compared.',
                              'Relocated operands are masked, so a changed callee or constant address is not seen.',
                              'Callees are compared only when listed as their own pair.',
                              'Data tables read by a routine are outside this comparison.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({'compared': report['compared'], 'identical': report['identical'],
                      'different': [record['label'] for record in records if not record['identical']]}))


if __name__ == '__main__':
    main()
