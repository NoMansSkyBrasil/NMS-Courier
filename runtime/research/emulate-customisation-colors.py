"""Compare explicit RGBA quantization against original build-180383 instructions.

The setter's one-edit loop, matched palette lookup and final alpha overlay execute
in private memory. Natural working-object initialization is outside comparison.
"""
import argparse
import hashlib
import json
from pathlib import Path
import random
import runpy
import struct
import sys

HERE = Path(__file__).resolve().parent
COMMON = runpy.run_path(str(HERE / 'emulate-appearance-context.py'))
PORT = runpy.run_path(str(HERE / 'evaluate-customisation-colors.py'))
BASE, HASH = COMMON['BASE'], COMMON['HASH']
BEGIN, END, EXIT = 0x11483a0, 0x1148449, 0x1148445
OVERLAY_BEGIN, OVERLAY_END = 0x114851d, 0x1148608
LOOKUP_BEGIN, LOOKUP_END = 0x5a6210, 0x5a62cb


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('executable', 'python-tools', 'emulator-tools', 'corpus', 'output'):
        parser.add_argument('--' + key, type=Path, required=True)
    args = parser.parse_args()
    exe, output, corpus = args.executable.resolve(), args.output.resolve(), args.corpus.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in (exe.parent.parent, corpus, HERE.parents[1])):
        parser.error('Require a new external output')
    if exe.stat().st_size > 128 * 1024**2:
        parser.error('Executable byte budget exceeded')
    raw = exe.read_bytes()
    if hashlib.sha256(raw).hexdigest() != HASH:
        parser.error('Executable fingerprint mismatch')
    sections = runpy.run_path(str(HERE.parent / 'native/asi/locate-frontend-hooks.py'))['executable_sections'](raw)
    def file_bytes(rva, size):
        section = next(s for s in sections if s['virtual_address'] <= rva < s['virtual_address'] + s['raw_size'])
        offset = section['raw_offset'] + rva - section['virtual_address']
        if rva + size > section['virtual_address'] + section['raw_size']:
            raise ValueError('Literal exceeds file-backed section')
        return raw[offset:offset + size]
    code = file_bytes(BEGIN, END - BEGIN)
    overlay_code = file_bytes(OVERLAY_BEGIN, OVERLAY_END - OVERLAY_BEGIN)
    lookup_code = file_bytes(LOOKUP_BEGIN, LOOKUP_END - LOOKUP_BEGIN)
    counts = file_bytes(0x4a2ecf0, 24)
    tolerance = file_bytes(0x4b2ec80, 16)
    maximum = file_bytes(0x4b26f90, 4)
    if struct.unpack('<6i', counts) != PORT['COUNTS'] or struct.unpack('<4f', tolerance) != (1 / 256,) * 4:
        raise ValueError('Native quantizer constants changed')
    sys.path[:0] = [str(args.python_tools), str(args.emulator_tools)]
    import unicorn
    from unicorn import x86_const as regs
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64
    if unicorn.__version__ != '2.1.4':
        parser.error('Requires private Unicorn 2.1.4')
    instructions = list(Cs(CS_ARCH_X86, CS_MODE_64).disasm(code, BEGIN))
    if sum(i.size for i in instructions) != len(code) or instructions[0].mnemonic != 'mov':
        raise ValueError('Unexpected quantizer instruction slice')
    table = PORT['load_table'](corpus)
    rng = random.Random(180383)
    cases = []
    for palette in table['palettes']:
        for color in [(0, 0, 0, 0), (1, 1, 1, 1), palette['colors'][0],
                      *[tuple(rng.random() for _ in range(4)) for _ in range(8)]]:
            cases.append((palette, color))
    # Controlled boundary colors independently exercise tolerance, ties and alpha.
    colors = [(0.5, 0.5, 0.5, 1), (0.5, 0.5, 0.5, 0)] + [(1, 1, 1, 1)] * 62
    for mode in range(6):
        for delta in (0, 1 / 256, 1 / 256 + 2**-23, -1 / 256):
            cases.append(({'id': 'controlled', 'mode': mode, 'colors': colors}, (0.5 + delta, 0.5, 0.5, 1)))
    records = []
    for n, (palette, supplied) in enumerate(cases):
        def observe(machine, address, allocate, write, unpack, get, put, cstring):
            if address == BASE + EXIT:
                put('RIP', 0x10000000)
                return True
            return False
        machine, allocate, write, unpack, _, _, execute = COMMON['create_fixture'](
            unicorn, regs, {BEGIN: code}, {}, windows=((BEGIN, END),), stubs=(), observer=observe)
        palette_at, counts_at = allocate(0x410), allocate(24)
        working, vector, edit = allocate(0x3ae0), allocate(0x58), allocate(0x20)
        machine.mem_write(counts_at, counts)
        for i, color in enumerate(palette['colors']):
            write(palette_at + i * 16, '<4f', *color)
        write(palette_at + 0x400, '<I', palette['mode'])
        color = PORT['rgba'](supplied)
        family, slot = n % 66, n % 5
        write(edit, '<4f', *color)
        write(edit + 0x10, '<I', slot)
        write(edit + 0x18, '<I', family)
        write(vector + 0x10, '<Q', edit)
        write(vector + 0x18, '<I', 1)
        for name, value in {'RBX': palette_at, 'RDI': counts_at, 'R14': working,
                            'R13': vector, 'R8': 0, 'R12': 0, 'R11': 0}.items():
            machine.reg_write(getattr(regs, 'UC_X86_REG_' + name), value)
        machine.reg_write(regs.UC_X86_REG_XMM7, int.from_bytes(maximum + bytes(12), 'little'))
        machine.reg_write(regs.UC_X86_REG_XMM6, int.from_bytes(struct.pack('<4I', *([0x80000000] * 4)), 'little'))
        machine.reg_write(regs.UC_X86_REG_XMM5, int.from_bytes(tolerance, 'little'))
        execute(BEGIN, ())
        observed = unpack(working + 0x90 + family * 0x70 + slot * 16, '<4f')
        flag = unpack(working + 0x71, '<B')[0]
        expected = PORT['quantize'](color, palette)
        matches = struct.pack('<4f', *observed) == struct.pack('<4f', *expected['rgba']) and flag == 1
        records.append({'palette': palette['id'], 'mode': palette['mode'], 'input': color,
                        'family': family, 'slot': slot, 'observed': observed, 'flag': flag,
                        'expected': expected, 'matches': matches})
    overlays = []
    for n in range(40):
        rows = [[tuple([rng.random(), rng.random(), rng.random(), (0, 0.5, 1 - 2**-24, 1)[(family + slot + n) % 4]])
                 for slot in range(5)] for family in range(66)]
        def stop_overlay(machine, address, allocate, write, unpack, get, put, cstring):
            if address == BASE + OVERLAY_END:
                put('RIP', 0x10000000)
                return True
            return False
        # Include the first epilogue instruction solely as a hookable stop boundary.
        machine, allocate, write, unpack, _, _, execute = COMMON['create_fixture'](
            unicorn, regs, {OVERLAY_BEGIN: overlay_code + file_bytes(OVERLAY_END, 8)}, {},
            windows=((OVERLAY_BEGIN, OVERLAY_END + 8),), stubs=(), observer=stop_overlay)
        working = allocate(0x3ae0)
        for family, row in enumerate(rows):
            for slot, color in enumerate(row): write(working + 0x90 + family * 0x70 + slot * 16, '<4f', *color)
        machine.reg_write(regs.UC_X86_REG_R14, working)
        machine.reg_write(regs.UC_X86_REG_XMM6, int.from_bytes(struct.pack('<f', 1) + bytes(12), 'little'))
        execute(OVERLAY_BEGIN, ())
        observed = [[unpack(working + 0x1d70 + family * 0x70 + slot * 16, '<4f') for slot in range(5)] for family in range(66)]
        expected = PORT['overlay_snapshot'](rows)
        overlays.append({'case': n, 'matches': observed == expected,
                         'output_sha256': hashlib.sha256(b''.join(struct.pack('<4f', *color) for row in observed for color in row)).hexdigest()})
    lookups = []
    lookup_cases = [('', category) for category in range(26)] + [(p['id'], 26) for p in table['palettes']]
    lookup_cases += [('', 26), ('unknown', 0), ('ship', 3)]
    for identity, category in lookup_cases:
        missed = []
        def observe_lookup(machine, address, allocate, write, unpack, get, put, cstring):
            if address == BASE + 0x5a62a3:
                missed.append('unknown_global_fallback')
                put('RIP', 0x10000000)
                return True
            return False
        machine, allocate, write, unpack, _, _, execute = COMMON['create_fixture'](
            unicorn, regs, {LOOKUP_BEGIN: lookup_code}, {}, windows=((LOOKUP_BEGIN, LOOKUP_END),), stubs=(), observer=observe_lookup)
        manager, data, palette_rows, id_at = allocate(0xca520), allocate(0x1b0), allocate(len(table['palettes']) * 0x440), allocate(16)
        write(manager + 0xca518, '<Q', data)
        write(data + 0x1a0, '<QI', palette_rows, len(table['palettes']))
        for i, item in enumerate(table['categories']): machine.mem_write(data + i * 16, item['palette_id'].encode().ljust(16, b'\0'))
        for i, item in enumerate(table['palettes']): machine.mem_write(palette_rows + i * 0x440 + 0x430, item['id'].encode().ljust(16, b'\0'))
        machine.mem_write(id_at, identity.encode().ljust(16, b'\0'))
        returned = execute(LOOKUP_BEGIN, (manager, id_at, category))
        try:
            expected_palette = PORT['select_palette'](table, identity, category)
            expected = next(i for i, p in enumerate(table['palettes']) if p['id'] == expected_palette['id'])
            matches = not missed and returned == palette_rows + expected * 0x440
        except ValueError:
            expected = 'unsupported_global_fallback'; matches = bool(missed)
        lookups.append({'palette_id': identity, 'category_index': category, 'expected': expected,
                        'fallback_captured': bool(missed), 'matches': matches})
    report = {'executable_sha256': HASH, 'source_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'port_sha256': hashlib.sha256((HERE / 'evaluate-customisation-colors.py').read_bytes()).hexdigest(),
              'table_sha256': table['binary_sha256'], 'window': {'begin': hex(BEGIN), 'end': hex(END),
                 'sha256': hashlib.sha256(code).hexdigest()},
              'cases': len(records) + len(overlays) + len(lookups),
              'mismatches': sum(not r['matches'] for r in records + overlays + lookups),
              'quantizer_cases': len(records), 'overlay_cases': len(overlays), 'lookup_cases': len(lookups),
              'records': records, 'overlays': overlays, 'lookups': lookups,
              'additional_windows': [{'begin': hex(begin), 'end': hex(end), 'sha256': hashlib.sha256(data).hexdigest()}
                  for begin, end, data in ((OVERLAY_BEGIN, OVERLAY_END, overlay_code), (LOOKUP_BEGIN, LOOKUP_END, lookup_code))],
              'runtime_verified': False, 'limitations': ['Quantizer, final overlay and matched lookup only; supplied snapshots.',
                'Unknown lookup fallback is captured before GS/global access, never initialized or guessed.',
                'Working-object initialization and intervening transforms remain outside this comparison.',
                'No procedural seed inversion, native pixels, process access or delivery.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream: json.dump(report, stream, indent=2)
    print(json.dumps({key: report[key] for key in ('cases', 'mismatches')}))
    if report['mismatches']: raise SystemExit(1)


if __name__ == '__main__': main()
