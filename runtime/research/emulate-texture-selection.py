"""Emulate bounded build-180383 texture selection in private synthetic memory.

Original x64 selector/record initialization instructions run only in Unicorn.
Container allocation/resize/free are explicit stubs; loaded resources and
single-occurrence collection are synthetic. No game process, imports or I/O
are reachable from the emulator. This is not a live entity appearance oracle.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import runpy
import random
import struct
import sys

EXE_HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
BASE = 0x140000000
WINDOWS = ((0x631310, 0x631f78), (0x1ac7450, 0x1ac748d), (0x1ae4cf0, 0x1ae4d05))
STUBS = (0x2bf5930, 0x211420, 0x2bf6c60)


def identifier(value, width):
    data = value.encode('ascii')
    if len(data) >= width or b'\0' in data:
        raise ValueError('Identifier exceeds native fixture field')
    return data.ljust(width, b'\0')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--asset', action='append', required=True)
    parser.add_argument('--texture-seed', type=lambda v: int(v, 0), default=7)
    parser.add_argument('--palette-seed', type=lambda v: int(v, 0), default=7)
    parser.add_argument('--samples', type=int, default=0,
                        help='Add four boundary seeds and this many deterministic random seeds (0..8)')
    parser.add_argument('--include-zero-probability-fixtures', action='store_true')
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--emulator-tools', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if not 0 <= args.samples <= 8 or len(args.asset) > 8:
        parser.error('Expected samples=0..8 and at most eight sources')
    exe, corpus, output = args.executable.resolve(), args.corpus.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in (exe.parent.parent, corpus, Path(__file__).resolve().parents[2])):
        parser.error('Output must be new and outside game/corpus/repository')
    if exe.stat().st_size > 128 * 1024 * 1024:
        parser.error('Executable byte budget exceeded')
    raw = exe.read_bytes()
    if hashlib.sha256(raw).hexdigest() != EXE_HASH:
        parser.error('Executable fingerprint mismatch')
    sys.path[:0] = [str(args.python_tools), str(args.emulator_tools)]
    import unicorn
    from unicorn import x86_const as regs
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64
    if unicorn.__version__ != '2.1.4':
        parser.error('Requires private Unicorn 2.1.4')
    evaluator = runpy.run_path(str(Path(__file__).with_name('evaluate-texture-options.py')))
    sections = runpy.run_path(str(Path(__file__).parents[1] / 'native/asi/locate-frontend-hooks.py'))['executable_sections'](raw)

    def read(rva, size):
        section = next(s for s in sections if s['virtual_address'] <= rva and
                       rva + size <= s['virtual_address'] + s['raw_size'])
        at = section['raw_offset'] + rva - section['virtual_address']
        return raw[at:at + size]

    decoder = Cs(CS_ARCH_X86, CS_MODE_64)
    code_meta, constants, code = [], {}, {}
    for begin, end in WINDOWS:
        data = read(begin, end - begin)
        instructions = list(decoder.disasm(data, BASE + begin))
        if sum(i.size for i in instructions) != len(data):
            raise ValueError('Incomplete selected code decoding')
        for instruction in instructions:
            if instruction.mnemonic in ('syscall', 'sysenter', 'int', 'in', 'out'):
                raise ValueError('External execution instruction rejected')
        code[begin] = data
        code_meta.append({'begin': hex(begin), 'end': hex(end), 'sha256': hashlib.sha256(data).hexdigest()})
    decoder.detail = True
    from capstone.x86_const import X86_OP_MEM, X86_REG_RIP
    for begin, data in code.items():
        for instruction in decoder.disasm(data, BASE + begin):
            for operand in instruction.operands:
                if operand.type == X86_OP_MEM and operand.mem.base == X86_REG_RIP:
                    rva = instruction.address + instruction.size + operand.mem.disp - BASE
                    constants[rva] = read(rva, max(operand.size, 16))
    sources = evaluator['T']['inspect'](corpus, args.asset)['sources']
    palette = evaluator['B']['generate'](args.palette_seed, evaluator['B']['load_base'](corpus))
    families = {row['family']: i for i, row in enumerate(palette)}
    results = []

    seeds = [args.texture_seed]
    if args.samples:
        rng = random.Random(180383)
        seeds += [0, 1, 0xffffffff, 0xffffffffffffffff] + [rng.getrandbits(64) for _ in range(args.samples)]
    seeds = list(dict.fromkeys(seeds))
    profiles = ('declared', 'zero_probability') if args.include_zero_probability_fixtures else ('declared',)
    for original, texture_seed, profile in ((s, k, p) for s in sources for k in seeds for p in profiles):
        source = copy.deepcopy(original)
        if profile == 'zero_probability':
            for layer in source['layers']: layer['fields']['Probability'] = '0'
        candidate = evaluator['evaluate_fresh_single'](source, texture_seed, palette)
        machine = unicorn.Uc(unicorn.UC_ARCH_X86, unicorn.UC_MODE_64)
        mapped = set()

        def page(address, execute=False):
            p = address & ~4095
            if p not in mapped:
                machine.mem_map(p, 4096, unicorn.UC_PROT_ALL if execute else unicorn.UC_PROT_READ | unicorn.UC_PROT_WRITE)
                mapped.add(p)
            elif execute:
                machine.mem_protect(p, 4096, unicorn.UC_PROT_ALL)

        for begin, data in code.items():
            for addr in range((BASE + begin) & ~4095, BASE + begin + len(data), 4096): page(addr, True)
            machine.mem_write(BASE + begin, data)
        for rva, data in constants.items():
            page(BASE + rva)
            page(BASE + rva + len(data) - 1)
            machine.mem_write(BASE + rva, data)
        for rva in STUBS:
            page(BASE + rva, True)
            machine.mem_write(BASE + rva, b'\xc3')
        heap, cursor = 0x20000000, 0x20000000
        machine.mem_map(heap, 1024 * 1024, unicorn.UC_PROT_READ | unicorn.UC_PROT_WRITE)
        stack_base, rsp = 0x30000000, 0x3000f008
        machine.mem_map(stack_base, 65536, unicorn.UC_PROT_READ | unicorn.UC_PROT_WRITE)
        stop = 0x10000000
        page(stop, True)
        machine.mem_write(stop, b'\xf4')

        def allocate(size):
            nonlocal cursor
            addr = cursor
            cursor += (size + 15) & ~15
            if cursor > heap + 1024 * 1024:
                raise ValueError('Synthetic heap budget exceeded')
            return addr

        def write(address, fmt, *values): machine.mem_write(address, struct.pack(fmt, *values))
        def unpack(address, fmt): return struct.unpack(fmt, machine.mem_read(address, struct.calcsize(fmt)))
        def get(name): return machine.reg_read(getattr(regs, 'UC_X86_REG_' + name))
        def put(name, value): machine.reg_write(getattr(regs, 'UC_X86_REG_' + name), value)

        layers = [l for l in source['layers'] if l['options']]
        context, collection, collection_rows = allocate(0x50), allocate(16), allocate(len(layers) * 0x40)
        resource_rows, declaration = allocate(0x228), allocate(8 * 0x48)
        output_slot, output_table = allocate(8), allocate(16)
        write(output_slot, '<Q', output_table)
        write(context + 0x10, '<Q', output_slot)
        write(context + 0x2c, '<I', 1)
        write(context + 0x30, '<Q', resource_rows)
        write(resource_rows + 0x108, '<Q', declaration)
        write(collection, '<IIQ', len(layers), len(layers), collection_rows)
        for i, layer in enumerate(layers):
            fields, options = layer['fields'], layer['options']
            row = collection_rows + i * 0x40
            declaration_row = declaration + source['layers'].index(layer) * 0x48
            alternatives = allocate(len(options) * 0x38)
            native_options = allocate(len(options) * 0x60)
            write(row, '<IIQI f', len(options), len(options), alternatives, 1, float(fields['Probability']))
            machine.mem_write(row + 0x18, identifier(fields['Group'], 16))
            machine.mem_write(row + 0x28, identifier(fields['Name'], 16))
            machine.mem_write(row + 0x38, bytes([fields['SelectToMatchBase'] == 'true']))
            machine.mem_write(declaration_row, identifier(fields['Name'], 16))
            machine.mem_write(declaration_row + 0x20, identifier(fields['Group'], 16))
            write(declaration_row + 0x30, '<QI', native_options, len(options))
            write(declaration_row + 0x40, '<f', float(fields['Probability']))
            machine.mem_write(declaration_row + 0x44, bytes([fields['SelectToMatchBase'] == 'true']))
            for j, option in enumerate(options):
                binding = option['palette']
                selector = evaluator['CHANNELS'].index(binding['ColourAlt'])
                family = families[binding['Palette']]
                name = identifier(option['fields']['Name'], 32)
                machine.mem_write(alternatives + j * 0x38, name)
                write(alternatives + j * 0x38 + 0x20, '<iiiif', selector, -1, family, 1, float(option['fields']['Probability']))
                machine.mem_write(native_options + j * 0x60 + 0x10, name)
                write(native_options + j * 0x60 + 0x40, '<iiifI', selector, -1, family, float(option['fields']['Probability']), 0)
        palette_at, seed_at, ground_at, name_at = allocate(66 * 0x70), allocate(16), allocate(16), allocate(32)
        for i, row in enumerate(palette):
            for j, color in enumerate(row['colors']): write(palette_at + i * 0x70 + j * 16, '<4f', *color['rgba'])
        write(seed_at, '<QB', texture_seed, 1)
        write(rsp, '<Q', stop)
        write(rsp + 0x28, '<Q', 0)
        write(rsp + 0x30, '<Q', ground_at)
        write(rsp + 0x38, '<Q', 0)
        write(rsp + 0x40, '<Q', name_at)
        for name, value in {'RCX': context, 'RDX': collection, 'R8': seed_at, 'R9': palette_at, 'RSP': rsp}.items(): put(name, value)
        trace, first_pass, states = [], [], {}

        def records(pointer, count):
            if count > 16: raise ValueError('Synthetic record count budget exceeded')
            rows = []
            for i in range(count):
                data = bytes(machine.mem_read(pointer + i * 0x60, 0x60))
                text = lambda start, width: data[start:start + width].split(b'\0', 1)[0].decode('ascii')
                rows.append({'name': text(0x10, 32), 'layer': text(0x30, 16), 'group': text(0x40, 16),
                             'rgba': list(struct.unpack_from('<4f', data)),
                             'selector': struct.unpack_from('<i', data, 0x50)[0],
                             'family_index': struct.unpack_from('<i', data, 0x58)[0]})
            return rows

        def hook(uc, address, size, user):
            rva = address - BASE
            if rva == 0x631786:
                first_pass.extend(records(unpack(get('RSP') + 0x78, '<Q')[0], unpack(get('RSP') + 0x74, '<I')[0]))
                states['first_pass'] = [unpack(get('RSP') + offset, '<I')[0] for offset in (0x80, 0x98)]
            if rva == 0x631ea6:
                states['selector_exit'] = [unpack(get('RSP') + offset, '<I')[0] for offset in (0x80, 0x98)]
            if rva not in STUBS:
                if not any(BASE + b <= address < BASE + e for b, e in WINDOWS) and address != stop:
                    raise ValueError('Unapproved execution target: ' + hex(address))
                return
            trace.append(hex(rva))
            if len(trace) > 64: raise ValueError('Container stub call budget exceeded')
            sp = get('RSP')
            if rva == 0x2bf5930:
                capacity, count = unpack(get('RCX'), '<II')
                index, src = unpack(sp + 0x28, '<Q')[0], unpack(sp + 0x30, '<Q')[0]
                stride = unpack(sp + 0x50, '<Q')[0]
                if stride != 0x60 or count > 16 or index != count:
                    raise ValueError('Unexpected container append layout')
                new_at = allocate((count + 1) * stride)
                if count: machine.mem_write(new_at, bytes(machine.mem_read(get('R9'), count * stride)))
                machine.mem_write(new_at + count * stride, bytes(machine.mem_read(src, stride)))
                write(get('RCX'), '<II', count + 1, count + 1)
                put('RAX', new_at)
            elif rva == 0x211420:
                count = get('RDX') & 0xffffffff
                if count > 16: raise ValueError('Unexpected output resize count')
                write(get('RCX'), '<QII', allocate(max(1, count) * 0x60), count, count)
            else:
                # Free has no observable payload effect in the synthetic heap.
                pass
            return_at = unpack(sp, '<Q')[0]
            put('RSP', sp + 8)
            put('RIP', return_at)

        machine.hook_add(unicorn.UC_HOOK_CODE, hook)
        try:
            machine.emu_start(BASE + 0x631310, stop, timeout=200000, count=100000)
        except unicorn.UcError as error:
            raise RuntimeError('Bounded emulation stopped at ' + hex(get('RIP')) + ': ' + str(error)) from error
        if get('RIP') != stop: raise RuntimeError('Native selector did not return within bounds')
        pointer, count = unpack(output_table, '<QI')
        final = records(pointer, count)
        for actual, expected in zip(first_pass, candidate['first_pass']['layers'], strict=True):
            if expected.get('option'):
                if actual['name'] != expected['option']['fields']['Name'] or tuple(actual['rgba']) != tuple(expected['color']['rgba']):
                    raise AssertionError('Native first-pass choice/color mismatch: ' + json.dumps(
                        {'actual': actual, 'expected_name': expected['option']['fields']['Name'],
                         'expected_rgba': expected['color']['rgba']}))
        if final != candidate['final_rows']:
            raise AssertionError('Native final rows/candidate mismatch: ' + json.dumps({'actual': final, 'expected': candidate['final_rows']}))
        if states != {'first_pass': candidate['first_pass']['first_pass_state'], 'selector_exit': candidate['selector_exit_state']}:
            raise AssertionError('Native selector state/candidate mismatch: ' + json.dumps(states))
        results.append({'resource': source['resource'], 'source_sha256': source['binary_sha256'],
                        'texture_seed': hex(texture_seed), 'fixture_profile': profile,
                        'first_pass': first_pass, 'final_rows': final, 'states': states,
                        'container_stub_calls': trace})
    report = {'exe_sha256': EXE_HASH, 'windows': code_meta, 'emulator': 'Unicorn 2.1.4',
              'texture_seed': hex(args.texture_seed), 'palette_seed': hex(args.palette_seed), 'results': results,
              'comparisons': {'cases': len(results), 'first_pass_mismatches': 0,
                              'final_row_mismatches': 0, 'state_mismatches': 0},
              'runtime_verified': False, 'appearance_verified': False,
              'scope': 'Full selector with synthetic single-resource collection and container stubs; fresh/default context only',
              'limits': {'heap_bytes': 1048576, 'stack_bytes': 65536, 'instructions_per_case': 100000,
                         'timeout_microseconds_per_case': 200000, 'records_per_case': 16},
              'not_proven': ['Native collector equivalence or merged resources', 'Caller seeds, alternate palettes, DDS composition and gameplay']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream: json.dump(report, stream, indent=2)
    print(json.dumps({'cases': len(results), 'first_pass_mismatches': 0, 'final_row_mismatches': 0,
                      'state_mismatches': 0, 'runtime_verified': False}))


if __name__ == '__main__':
    main()
