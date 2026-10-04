"""Compare original ALTID parsing with controlled allocation/string operations.

Pinned offline instructions only; no game, save or resource acquisition.
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
WINDOW = (0x56aff0, 0x56b2a1)
TOKEN_STUB = 0x1000  # Private fixture RVA, never identified as a game routine.
STUBS = (0x2c190f0, 0x2c19170, 0x2139c0, 0x33e0fce, TOKEN_STUB)


def parse_altid(value):
    if not value.isascii() or '\0' in value or len(value) > 255:
        raise ValueError('ALTID outside bounded ASCII scope')
    result = []
    for token in value.split(' '):
        if not token:
            continue
        position = token.find('LOD')
        if position >= 0 and len(token) - position == 4 and token[-1] in '0123456789':
            token = token[:position]
        result.append(token[:31].upper())
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('executable', 'python-tools', 'emulator-tools', 'output'):
        parser.add_argument('--' + name, type=Path, required=True)
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
        offset = section['raw_offset'] + rva - section['virtual_address']
        return raw[offset:offset + size]
    begin, end = WINDOW
    data = read(begin, end - begin)
    decoder = Cs(CS_ARCH_X86, CS_MODE_64); decoder.detail = True
    instructions = list(decoder.disasm(data, BASE + begin))
    if sum(i.size for i in instructions) != len(data):
        raise ValueError('Incomplete parser instruction decoding')
    constants = {}
    for instruction in instructions:
        if instruction.mnemonic in ('syscall', 'sysenter', 'int', 'in', 'out'):
            raise ValueError('External instruction rejected')
        for operand in instruction.operands:
            if operand.type == X86_OP_MEM and operand.mem.base == X86_REG_RIP:
                rva = instruction.address + instruction.size + operand.mem.disp - BASE
                constants[rva] = read(rva, max(32, operand.size))
    for slot, name, target in ((0x34118c0, b'strncpy', COMMON['STRNCPY_STUB']),
                                (0x3411878, b'strtok', BASE + TOKEN_STUB),
                                (0x3411140, b'strstr', BASE + 0x33e0fce)):
        import_rva = struct.unpack('<Q', read(slot, 8))[0]
        if read(import_rva + 2, 32).split(b'\0', 1)[0] != name:
            raise ValueError('Unexpected parser import at ' + hex(slot))
        constants[slot] = struct.pack('<Q', target)
    values = ('', ' ', '   ', '_wing', '_wing _wing', '_wingLOD1 _body',
              '_wingLOD10', '_wingLODq', '_winglod1', 'LOD0',
              '_wingLOD0_extraLOD1', '_wing\t_body', 'a' * 31,
              'a' * 32, 'a' * 60, ' _wing  _body ', 'z-9 _xLOD9')
    records = []
    for text, seed, enabled in itertools.product(values, (0, 7, 2**64 - 1), (False, True)):
        state = {'next_token': 0}
        def observer(machine, address, allocate, write, unpack, get, put, cstring):
            rva = address - BASE
            if rva not in (0x2c190f0, 0x2c19170, 0x2139c0, TOKEN_STUB) and address != COMMON['STRNCPY_STUB']:
                return False
            value = 0
            if address == COMMON['STRNCPY_STUB']:
                count = get('R8')
                if count > 255:
                    raise ValueError('ALTID strncpy budget exceeded')
                machine.mem_write(get('RCX'), cstring(get('RDX'))[:count].ljust(count, b'\0'))
                value = get('RCX')
            elif rva == 0x2c190f0:
                size = get('RCX')
                if not 1 <= size <= 256:
                    raise ValueError('ALTID allocation budget exceeded')
                value = allocate(size)
            elif rva == 0x2139c0:
                count = get('R8')
                if count > 255:
                    raise ValueError('ALTID string construction budget exceeded')
                head = get('RCX'); content = bytes(machine.mem_read(get('RDX'), count))
                if count <= 15:
                    machine.mem_write(head, content.ljust(16, b'\0'))
                    capacity = 15
                else:
                    storage = allocate(count + 1)
                    machine.mem_write(storage, content + b'\0'); write(head, '<Q', storage)
                    capacity = count
                write(head + 0x10, '<QQ', count, capacity)
                value = head
            elif rva == TOKEN_STUB:
                if cstring(get('RDX')) != b' ':
                    raise ValueError('Unexpected ALTID token delimiter')
                position = get('RCX') or state['next_token']
                if position:
                    content = cstring(position)
                    skipped = len(content) - len(content.lstrip(b' '))
                    position += skipped; content = content[skipped:]
                    if content:
                        split = content.find(b' ')
                        value = position
                        if split >= 0:
                            machine.mem_write(position + split, b'\0')
                            state['next_token'] = position + split + 1
                        else:
                            state['next_token'] = 0
                    else:
                        state['next_token'] = 0
            sp = get('RSP')
            put('RAX', value); put('RIP', unpack(sp, '<Q')[0]); put('RSP', sp + 8)
            return True
        machine, allocate, write, unpack, _, _, execute = COMMON['create_fixture'](
            unicorn, regs, {begin: data}, constants, windows=(WINDOW,), stubs=STUBS, observer=observer)
        output_context, rows, input_pair, value = allocate(48), allocate(64 * 32), allocate(16), allocate(256)
        write(output_context, '<IIQ', 64, 0, rows)
        write(output_context + 0x10, '<QQ', 99, 1)
        write(input_pair, '<QQ', seed, int(enabled))
        machine.mem_write(value, text.encode('ascii').ljust(256, b'\0'))
        execute(begin, (output_context, value, input_pair))
        count = unpack(output_context + 4, '<I')[0]
        if count > 64:
            raise ValueError('ALTID output vector budget exceeded')
        actual = [bytes(machine.mem_read(rows + i * 32, 32)).split(b'\0', 1)[0].decode('ascii') for i in range(count)]
        actual_pair = unpack(output_context + 0x10, '<QQ')
        records.append({'input': text, 'seed': hex(seed), 'enabled': enabled, 'ids': actual,
                        'matches': actual == parse_altid(text) and actual_pair == ((seed, int(enabled)) if text else (99, 1))})
    report = {'executable_sha256': HASH, 'runtime_verified': False,
              'cases': len(records), 'mismatches': sum(not r['matches'] for r in records),
              'window_sha256': hashlib.sha256(data).hexdigest(),
              'source_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'records': records, 'limitations': ['Allocation, C string operations and string construction are controlled.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2); stream.write('\n')
    print(json.dumps({key: report[key] for key in ('cases', 'mismatches', 'runtime_verified')}))
    if report['mismatches']:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
