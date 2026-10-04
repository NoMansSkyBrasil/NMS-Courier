"""Replay the pinned warm-cache descriptor filter resolver in private Unicorn.

Cache records and cold resource IO results are controlled fixtures.
No game process, save, archive or corpus is changed.
"""
import argparse
import hashlib
import itertools
import json
from pathlib import Path
import runpy
import struct
import sys

HERE = Path(__file__).resolve().parent
COMMON = runpy.run_path(str(HERE / 'emulate-appearance-context.py'))
BASE, HASH = COMMON['BASE'], COMMON['HASH']
WINDOW = (0x2d652d0, 0x2d6584f)
STUBS = (0x33e0fe6, 0x33e0fec, 0x33e1052, 0x33e1058, 0x33e0fce,
         0x1d15b0, 0x2c53830, 0x2d5ce10)


def cache_hash(value):
    """Port the uint32 cache hash visible in the audited resolver."""
    result = 0
    for byte in value:
        result = ((result + byte) * 0x401) & 0xffffffff
        result ^= result >> 6
    result = (result * 9) & 0xffffffff
    return ((result ^ (result >> 11)) * 0x8001) & 0xffffffff


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--emulator-tools', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in (exe.parent.parent, HERE.parents[1])):
        parser.error('Require a new external output')
    if exe.stat().st_size > 128 * 1024**2:
        parser.error('Executable byte budget exceeded')
    raw = exe.read_bytes()
    if hashlib.sha256(raw).hexdigest() != HASH:
        parser.error('Executable fingerprint mismatch')
    sys.path[:0] = [str(args.python_tools), str(args.emulator_tools)]
    import unicorn
    from unicorn import x86_const as regs
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64
    from capstone.x86_const import X86_OP_MEM, X86_REG_RIP
    if unicorn.__version__ != '2.1.4':
        parser.error('Requires private Unicorn 2.1.4')
    sections = runpy.run_path(str(HERE.parent / 'native/asi/locate-frontend-hooks.py'))['executable_sections'](raw)
    def read(rva, size):
        section = next(s for s in sections if s['virtual_address'] <= rva and
                       rva + size <= s['virtual_address'] + s['raw_size'])
        at = section['raw_offset'] + rva - section['virtual_address']
        return raw[at:at + size]
    begin, end = WINDOW
    data = read(begin, end - begin)
    decoder = Cs(CS_ARCH_X86, CS_MODE_64); decoder.detail = True
    instructions = list(decoder.disasm(data, BASE + begin))
    if sum(i.size for i in instructions) != len(data):
        raise ValueError('Incomplete resolver instruction decoding')
    constants = {0x59101f8: bytes(64)}
    for instruction in instructions:
        if instruction.mnemonic in ('syscall', 'sysenter', 'int', 'in', 'out'):
            raise ValueError('External instruction rejected')
        for operand in instruction.operands:
            if operand.type == X86_OP_MEM and operand.mem.base == X86_REG_RIP:
                rva = instruction.address + instruction.size + operand.mem.disp - BASE
                constants[rva] = bytes(32) if 0x59101f8 <= rva < 0x5910238 else read(rva, max(32, operand.size))
    records = []
    for path, names, prefix, mode in itertools.product(
            ('MODELS/SHIP.SCENE.MBIN', 'models/ship.scene.mbin'),
            ((), ('_WING_LEFT',), ('_WING_LEFT', '_WING'), ('_wing', '_BODY')),
            ('', '_WING', 'WING', '_wing', '_BODY', 'MISSING'),
            ('warm', 'warm_null', 'cold_missing', 'cold_loaded')):
        state = {'loaded_paths': [], 'exists_paths': []}
        def observer(machine, address, allocate, write, unpack, get, put, cstring):
            rva = address - BASE
            if rva not in (0x33e0fe6, 0x33e0fec, 0x33e1058, 0x1d15b0, 0x2c53830, 0x2d5ce10):
                return False
            value = 0
            if rva in (0x33e0fe6, 0x33e0fec):
                count = get('R8')
                if not 1 <= count <= 256:
                    raise ValueError('Unexpected bounded memcpy count')
                machine.mem_write(get('RCX'), bytes(machine.mem_read(get('RDX'), count)))
                value = get('RCX')
            elif rva == 0x33e1058:
                value = len(cstring(get('RCX')))
            elif rva == 0x1d15b0:
                value = 0x20000000
            elif rva == 0x2c53830:
                state['exists_paths'].append(cstring(get('RDX')).decode('ascii'))
                value = int(mode == 'cold_loaded')
            elif rva == 0x2d5ce10:
                if get('RDX') != 0 or get('R8') != 1:
                    raise ValueError('Unexpected filter resource loader arguments')
                state['loaded_paths'].append(cstring(get('RCX')).decode('ascii'))
                value = state['resource']
            sp = get('RSP')
            put('RAX', value); put('RIP', unpack(sp, '<Q')[0]); put('RSP', sp + 8)
            return True
        fixture = COMMON['create_fixture'](unicorn, regs, {begin: data}, constants,
                                            windows=(WINDOW,), stubs=STUBS, observer=observer)
        machine, allocate, write, _, _, identity, execute = fixture
        def string(value, size=256):
            address = allocate(size)
            machine.mem_write(address, value.encode('ascii').ljust(size, b'\0'))
            return address
        filename, choice = string(path), string(prefix, 32)
        rows, resource, entry, buckets = allocate(max(1, len(names)) * 32), allocate(16), allocate(0x130), allocate(8)
        state['resource'] = resource
        for i, name in enumerate(names):
            machine.mem_write(rows + i * 32 + 0x10, name.encode('ascii').ljust(16, b'\0'))
        write(resource, '<QI', rows, len(names))
        machine.mem_write(entry, path.encode('ascii').ljust(256, b'\0'))
        write(entry + 0x100, '<QQQ', 0 if mode == 'warm_null' else resource, cache_hash(path.encode('ascii')), 0)
        if mode.startswith('cold'):
            machine.mem_write(entry, bytes(0x120))
        write(buckets, '<Q', entry if mode.startswith('warm') else 0)
        write(BASE + 0x5910200, '<Q', buckets)
        write(BASE + 0x5910208, '<Q', entry if mode.startswith('cold') else 0)
        write(BASE + 0x5910214, '<II', int(mode.startswith('warm')), 1)
        try:
            actual = execute(begin, (filename, choice))
        except unicorn.UcError as error:
            raise ValueError(f'Filter fixture failed: {mode}, RIP={machine.reg_read(regs.UC_X86_REG_RIP):x}') from error
        index = next((i for i, name in enumerate(names) if prefix and prefix in name), None)
        expected = 0 if mode in ('warm_null', 'cold_missing') or index is None else rows + index * 32
        expected_path = path.replace('.SCENE.MBIN', '.FILTER.MBIN', 1)
        paths_match = (state['exists_paths'] == [expected_path] if mode.startswith('cold') else not state['exists_paths'])
        paths_match &= state['loaded_paths'] == ([expected_path] if mode == 'cold_loaded' else [])
        if mode == 'cold_loaded':
            paths_match &= execute(begin, (filename, choice)) == actual and len(state['loaded_paths']) == 1
        records.append({'path': path, 'names': names, 'prefix': prefix,
                        'mode': mode, 'loaded_paths': state['loaded_paths'], 'exists_paths': state['exists_paths'],
                        'selected_index': None if not actual else (actual - rows) // 32,
                        'matches': actual == expected and paths_match})
    report = {'executable_sha256': HASH, 'runtime_verified': False,
              'cold_resource_io_proven': False, 'cases': len(records),
              'mismatches': sum(not r['matches'] for r in records), 'records': records,
              'window_sha256': hashlib.sha256(data).hexdigest(),
              'source_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2); stream.write('\n')
    print(json.dumps({key: report[key] for key in ('cases', 'mismatches', 'runtime_verified')}))
    if report['mismatches']:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
