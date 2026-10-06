"""Compare the procedural-statistics port with original build 180383 instructions.

Two windows of the instance generator (RVA ec1e60) run under Unicorn with a
private frame: the stream initialization (ec1f9b..ec1fe3) and the statistics
part (ec272e..ec2e75), including the real curve function, list growth helpers
and stat-list resize. The procedural table entry is the original binary; the
instance, reality object, globals and allocator are private. The imported power
function is replaced by the same double-precision power the port uses, so the
two exponential curves are compared up to that shared definition only.
"""
import argparse
import hashlib
import json
from pathlib import Path
import runpy
import struct
import sys

HERE = Path(__file__).resolve().parent
PORT = runpy.run_path(str(HERE / 'evaluate-procedural-technology.py'))
HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
BASE = 0x140000000
INIT_BEGIN, INIT_END = 0xec1f9b, 0xec1fe3
STATS_BEGIN, STATS_END = 0xec272e, 0xec2e75
MANAGER_POINTER, MODE, BOOST_CHANCE, DEBUG_FLAG = 0x6e89688, 0x6e89694, 0x5246310, 0x5246e84
ALLOCATE, RELEASE, RELEASE_VECTOR, POWER = 0x2c1d1e0, 0x2c1b8c0, 0x2bf6c60, 0x33e1064
COPY, MOVE, FILL = 0x33e0fe6, 0x33e0fec, 0x33e0ff2
MANAGER, REALITY, DATA, TABLE, INSTANCE, STACK, HEAP = (
    0x40000000, 0x41000000, 0x41100000, 0x42000000, 0x43000000, 0x44000000, 0x45000000)


def sections(raw):
    pe = struct.unpack_from('<I', raw, 0x3c)[0]
    count, optional = struct.unpack_from('<H', raw, pe + 6)[0], struct.unpack_from('<H', raw, pe + 20)[0]
    for index in range(count):
        at = pe + 24 + optional + index * 40
        virtual_size, address, raw_size, raw_at = struct.unpack_from('<IIII', raw, at + 8)
        yield raw[at:at + 8].rstrip(b'\0').decode(), address, virtual_size, raw_at, raw_size


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('executable', 'procedural-table', 'reality-data', 'python-tools', 'emulator-tools', 'output'):
        parser.add_argument('--' + key, type=Path, required=True)
    parser.add_argument('--procedural-table-sha256', required=True)
    parser.add_argument('--reality-data-sha256', required=True)
    parser.add_argument('--numbers', type=int, default=24, help='Instance numbers per entry, spread over 0..99999')
    args = parser.parse_args()
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in (exe.parent.parent, HERE.parents[1])):
        parser.error('Require a new external output')
    if not 1 <= args.numbers <= 400:
        parser.error('Select 1..400 numbers per entry')
    raw = exe.read_bytes()
    if len(raw) > 128 * 1024**2 or hashlib.sha256(raw).hexdigest() != HASH:
        parser.error('Executable fingerprint mismatch')
    table = args.procedural_table.read_bytes()
    entries = PORT['load_procedural'](args.procedural_table, args.procedural_table_sha256)
    reality = args.reality_data.read_bytes()
    if hashlib.sha256(reality).hexdigest() != args.reality_data_sha256.lower():
        parser.error('Reality data fingerprint mismatch')
    curves = list(reality[0x20 + PORT['WEIGHTING_CURVES_OFFSET']:0x20 + PORT['WEIGHTING_CURVES_OFFSET'] + 7])
    sys.path[:0] = [str(args.python_tools), str(args.emulator_tools)]
    import unicorn
    from unicorn import x86_const as regs
    if unicorn.__version__ != '2.1.4':
        parser.error('Requires private Unicorn 2.1.4')
    power = lambda base, exponent: PORT['float32'](base ** exponent)

    machine = unicorn.Uc(unicorn.UC_ARCH_X86, unicorn.UC_MODE_64)
    for name, address, virtual_size, raw_at, raw_size in sections(raw):
        if name in ('.text', '.rdata', '.data'):
            machine.mem_map(BASE + address, (max(virtual_size, raw_size) + 0xfff) & ~0xfff)
            machine.mem_write(BASE + address, raw[raw_at:raw_at + raw_size])
    for address, size in ((MANAGER, 0xa00000), (REALITY, 0x1000), (DATA, 0x10000), (TABLE, 0x100000),
                          (INSTANCE, 0x10000), (STACK, 0x100000), (HEAP, 0x100000)):
        machine.mem_map(address, size)
    write = lambda address, layout, *values: machine.mem_write(address, struct.pack(layout, *values))
    image = bytearray(table)
    for entry in entries:
        at = PORT['PROCEDURAL_START'] + entry['index'] * PORT['PROCEDURAL_SIZE']
        relative, items = struct.unpack_from('<qI', table, at + 0x50)
        struct.pack_into('<Q', image, at + 0x50, TABLE + at + 0x50 + relative if items else 0)
    machine.mem_write(TABLE, bytes(image))
    write(BASE + MANAGER_POINTER, '<Q', MANAGER)
    write(BASE + MODE, '<I', 1)                     # any mode other than 0 or 6: the ordinary boosted-roll branch
    write(BASE + DEBUG_FLAG, '<B', 0)
    write(REALITY, '<Q', DATA)
    machine.mem_write(DATA + PORT['WEIGHTING_CURVES_OFFSET'], bytes(curves))
    state = {'heap': HEAP, 'error': None}

    def leave(emulator, value=None):
        top = emulator.reg_read(regs.UC_X86_REG_RSP)
        emulator.reg_write(regs.UC_X86_REG_RIP, struct.unpack('<Q', emulator.mem_read(top, 8))[0])
        emulator.reg_write(regs.UC_X86_REG_RSP, top + 8)
        if value is not None:
            emulator.reg_write(regs.UC_X86_REG_RAX, value)

    def single(emulator, register):
        return struct.unpack('<f', emulator.reg_read(register).to_bytes(16, 'little')[:4])[0]

    def hook(emulator, address, size, user):
        rva = address - BASE
        if rva == ALLOCATE:
            length = (emulator.reg_read(regs.UC_X86_REG_RDX) & 0xffffffff) + 15 & ~15
            if not length or state['heap'] + length > HEAP + 0x100000:
                state['error'] = 'private heap exhausted'
                emulator.emu_stop()
                return
            state['heap'] += length
            leave(emulator, state['heap'] - length)
        elif rva in (RELEASE, RELEASE_VECTOR):
            leave(emulator)
        elif rva == POWER:
            result = power(single(emulator, regs.UC_X86_REG_XMM0), single(emulator, regs.UC_X86_REG_XMM1))
            emulator.reg_write(regs.UC_X86_REG_XMM0, int.from_bytes(struct.pack('<f', result).ljust(16, bytes(1)), 'little'))
            leave(emulator)
        elif rva in (COPY, MOVE, FILL):
            target, second, length = (emulator.reg_read(r) for r in
                                      (regs.UC_X86_REG_RCX, regs.UC_X86_REG_RDX, regs.UC_X86_REG_R8))
            if length > 0x10000:
                state['error'] = 'memory helper length out of bounds'
                emulator.emu_stop()
                return
            emulator.mem_write(target, bytes([second & 0xff]) * length if rva == FILL
                               else bytes(emulator.mem_read(second, length)))
            leave(emulator, target)

    for stub in (ALLOCATE, RELEASE, RELEASE_VECTOR, POWER, COPY, MOVE, FILL):
        machine.hook_add(unicorn.UC_HOOK_CODE, hook, begin=BASE + stub, end=BASE + stub)
    frame = STACK + 0x80000

    def start(begin, end):
        state['error'] = None
        try:
            machine.emu_start(BASE + begin, BASE + end, count=5_000_000)
        except unicorn.UcError as error:
            state['error'] = '%s at rva %x' % (error, machine.reg_read(regs.UC_X86_REG_RIP) - BASE)
        if not state['error'] and machine.reg_read(regs.UC_X86_REG_RIP) != BASE + end:
            state['error'] = 'instruction budget exhausted'

    def native_state(number):
        machine.reg_write(regs.UC_X86_REG_RSP, frame)
        machine.reg_write(regs.UC_X86_REG_RBP, frame + 0x100)
        machine.reg_write(regs.UC_X86_REG_RSI, 0)
        write(frame + 0x100 - 0x58, '<I', number)
        start(INIT_BEGIN, INIT_END)
        return (machine.reg_read(regs.UC_X86_REG_R12) & 0xffffffff,
                struct.unpack('<Q', machine.mem_read(frame + 0x100 - 0x80, 8))[0] & 0xffffffff)

    def native_stats(entry, stream, chance, forced):
        state['heap'] = HEAP
        machine.mem_write(INSTANCE, bytes(0x400))
        machine.mem_write(frame - 0x1000, bytes(0x3000))
        write(BASE + BOOST_CHANCE, '<i', chance)
        write(frame + 0x78, '<Q', INSTANCE)
        write(frame + 0x100 + 0x890, '<Q', REALITY)
        write(frame + 0x100 + 0x8a0, '<B', forced)
        write(frame + 0x100 - 0x80, '<Q', stream[1])
        for register, value in ((regs.UC_X86_REG_RSP, frame), (regs.UC_X86_REG_RBP, frame + 0x100),
                                (regs.UC_X86_REG_RSI, 0), (regs.UC_X86_REG_RDI, forced), (regs.UC_X86_REG_R12, stream[0]),
                                (regs.UC_X86_REG_R13, TABLE + PORT['PROCEDURAL_START'] + entry['index'] * PORT['PROCEDURAL_SIZE']),
                                (regs.UC_X86_REG_R15, 0), (regs.UC_X86_REG_RBX, 0), (regs.UC_X86_REG_R14, 0)):
            machine.reg_write(register, value)
        start(STATS_BEGIN, STATS_END)
        pointer, count = struct.unpack('<QI', machine.mem_read(INSTANCE + 0x158, 12))
        result = []
        for index in range(min(count, 8)):
            value, level, stat = struct.unpack('<fii', machine.mem_read(pointer + index * 12, 12))
            result.append([stat, value, level])
        return result

    numbers = sorted({(index * 99999) // max(args.numbers - 1, 1) for index in range(args.numbers)} | {0, 1, 99999})
    state_cases = [{'number': number, 'native': list(native_state(number)), 'port': list(PORT['stream_state'](number))}
                   for number in numbers + [100000, 0xffffffff, 0x3d0000]]
    records, mismatches, errors = [], 0, 0
    for entry in entries:
        chances = (0, 37, 100) if entry['quality'] in PORT['BOOSTED_QUALITIES'] else (0,)
        for number in numbers:
            stream = PORT['stream_state'](number)
            for chance in chances:
                for forced in (0, 1):
                    native = native_stats(entry, stream, chance, forced)
                    ported = [list(item) for item in PORT['generate'](entry, number, curves, chance, bool(forced), power)]
                    matches = native == ported and not state['error']
                    mismatches += not matches
                    errors += bool(state['error'])
                    if not matches and len(records) < 40:
                        records.append({'id': entry['id'], 'number': number, 'chance': chance, 'forced': forced,
                                        'native': native, 'port': ported, 'error': state['error']})
    cases = len(entries) * len(numbers) * 2 + sum(
        len(numbers) * 4 for entry in entries if entry['quality'] in PORT['BOOSTED_QUALITIES'])
    report = {'executable_sha256': HASH, 'procedural_table_sha256': args.procedural_table_sha256.lower(),
              'reality_data_sha256': args.reality_data_sha256.lower(), 'curves': curves,
              'tool_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'port_sha256': hashlib.sha256((HERE / 'evaluate-procedural-technology.py').read_bytes()).hexdigest(),
              'state_cases': len(state_cases), 'state_mismatches': sum(c['native'] != c['port'] for c in state_cases),
              'stat_cases': cases, 'stat_mismatches': mismatches, 'errors': errors, 'first_mismatches': records,
              'runtime_verified': False,
              'limitations': ['Windows of the generator only; naming, description and template copying are outside.',
                              'The imported power function is a shared double-precision stand-in.',
                              'The special-mode boosted branch (modes 0 and 6 with extra runtime flags) is not exercised.',
                              'Private frame, reality object and allocator; no game process.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({key: report[key] for key in ('state_cases', 'state_mismatches', 'stat_cases', 'stat_mismatches', 'errors')}))
    for record in records[:6]:
        print(record)
    if report['state_mismatches'] or mismatches:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
