"""Run the original build 180383 installed-technology routine (RVA 4cef50) offline.

The pinned executable image and the original technology table binary are mapped
into a private Unicorn machine. The manager, solar-system wealth row, known
technology list, rarity weights and the inventory store are synthetic inputs
supplied on the command line; element insertion is a recording boundary. The
result lists which technology IDs the game's own instructions select for a
seed. It is offline instruction evidence, not a live observation: natural
callers' arguments and the runtime state are assumptions stated in the report.
"""
import argparse
import hashlib
import json
from pathlib import Path
import struct
import sys

HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
BASE = 0x140000000
ROUTINE = 0x4cef50
ENTRY_SIZE, TABLE_START = 0x2e0, 0x30
MANAGER_POINTER, RARITY_POINTER, MODE_GLOBAL = 0x6e89688, 0x5245ee8, 0x52699fc
# Pointer to a settings block; only a float table at +0x27c0 is read, to choose the initial charge.
SETTINGS_POINTER = 0x702f5d0
# Runtime-initialized 16-byte ID: its entry is a candidate only for class argument 8 with inventory type 5.
SPECIAL_ID = 0x5220e20
INSERT, CLEAR_MAP, STATE_INIT, ASSERT = 0x4d06f0, 0x365fb0, 0x2d6b670, 0x1f1830
# Stack probe reads the thread block; the private stack is fully mapped, so it is skipped.
STACK_PROBE = 0x33df370
# Import thunks used as memcpy, memmove and memset by the callees.
COPY, MOVE, FILL = 0x33e0fe6, 0x33e0fec, 0x33e0ff2
# Engine allocator (pool, size, ...) and its two release routines; a private bump heap replaces them.
ALLOCATE, RELEASE, RELEASE_VECTOR = 0x2c1d1e0, 0x2c1b8c0, 0x2bf6c60
HEAP = 0x48000000
MANAGER, SYSTEM, TABLE, LISTS, STORE, SEED, STACK, RETURN = (
    0x40000000, 0x41000000, 0x42000000, 0x43000000, 0x44000000, 0x45000000, 0x46000000, 0x47000000)


def sections(raw):
    pe = struct.unpack_from('<I', raw, 0x3c)[0]
    count, optional = struct.unpack_from('<H', raw, pe + 6)[0], struct.unpack_from('<H', raw, pe + 20)[0]
    for index in range(count):
        at = pe + 24 + optional + index * 40
        virtual_size, address, raw_size, raw_at = struct.unpack_from('<IIII', raw, at + 8)
        yield raw[at:at + 8].rstrip(b'\0').decode(), address, virtual_size, raw_at, raw_size


def load_table(path, expected):
    data = path.read_bytes()
    if len(data) > 8 * 1024**2 or hashlib.sha256(data).hexdigest() != expected.lower():
        raise ValueError('Technology table fingerprint or byte budget mismatch')
    offset, count = struct.unpack_from('<qI', data, 0x20)
    if 0x20 + offset != TABLE_START or not 1 <= count <= 2048:
        raise ValueError('Unexpected technology table header')
    return data, count


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('executable', 'table', 'python-tools', 'emulator-tools', 'output'):
        parser.add_argument('--' + key, type=Path, required=True)
    parser.add_argument('--table-sha256', required=True)
    parser.add_argument('--inventory-type', type=int, required=True)
    parser.add_argument('--class-argument', type=int, default=0)
    parser.add_argument('--size-argument', type=int, default=0)
    parser.add_argument('--slots', type=int, action='append', required=True, help='Store slot count; repeatable')
    parser.add_argument('--wealth-row', type=int, action='append', required=True, choices=range(4))
    parser.add_argument('--seed', action='append', required=True, help='Hex seed; maximum 64')
    parser.add_argument('--progress', type=int, default=100, help='Manager value compared with entry +0x1b4')
    parser.add_argument('--known', choices=('all', 'none'), default='all',
                        help='Contents of the manager list searched for required technologies')
    parser.add_argument('--special-id', default='SOLAR_SAIL',
                        help='Assumed value of the runtime ID global at 5220e20; empty to leave it zero')
    parser.add_argument('--rarity-weights', default='10,50,25,2,1,0,9999999')
    args = parser.parse_args()
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in (exe.parent.parent, Path(__file__).resolve().parents[2])):
        parser.error('Require a new external output')
    if not 1 <= len(args.seed) <= 64 or len(args.slots) * len(args.wealth_row) * len(args.seed) > 2048:
        parser.error('Select at most 64 seeds and 2048 cases')
    raw = exe.read_bytes()
    if len(raw) > 128 * 1024**2 or hashlib.sha256(raw).hexdigest() != HASH:
        parser.error('Executable fingerprint mismatch')
    table, count = load_table(args.table, args.table_sha256)
    weights = [float(value) for value in args.rarity_weights.split(',')]
    if len(weights) != 7:
        parser.error('Expected seven rarity weights')
    sys.path[:0] = [str(args.python_tools), str(args.emulator_tools)]
    import unicorn
    from unicorn import x86_const as regs
    if unicorn.__version__ != '2.1.4':
        parser.error('Requires private Unicorn 2.1.4')

    # Relocate the per-entry list this routine reads (stat bonuses at +0x158) to absolute pointers.
    image = bytearray(table)
    identifiers = []
    for index in range(count):
        entry = TABLE_START + index * ENTRY_SIZE
        identifiers.append(table[entry + 0x108:entry + 0x118])
        relative, items = struct.unpack_from('<qI', table, entry + 0x158)
        struct.pack_into('<Q', image, entry + 0x158, TABLE + entry + 0x158 + relative if items else 0)

    def run(seed, slots, wealth):
        machine = unicorn.Uc(unicorn.UC_ARCH_X86, unicorn.UC_MODE_64)
        for name, address, virtual_size, raw_at, raw_size in sections(raw):
            if name not in ('.text', '.rdata', '.data'):
                continue
            machine.mem_map(BASE + address, (max(virtual_size, raw_size) + 0xfff) & ~0xfff)
            machine.mem_write(BASE + address, raw[raw_at:raw_at + raw_size])
        for address, size in ((MANAGER, 0x800000), (SYSTEM, 0x10000), (TABLE, 0x100000), (LISTS, 0x100000),
                              (STORE, 0x10000), (SEED, 0x1000), (STACK, 0x100000), (RETURN, 0x1000),
                              (HEAP, 0x400000)):
            machine.mem_map(address, size)
        machine.mem_write(TABLE, bytes(image))
        write = lambda address, layout, *values: machine.mem_write(address, struct.pack(layout, *values))
        write(BASE + MANAGER_POINTER, '<Q', MANAGER)
        write(BASE + MODE_GLOBAL, '<I', 0)
        write(BASE + SETTINGS_POINTER, '<Q', LISTS + 0x80000)       # zero floats: charged elements
        machine.mem_write(BASE + SPECIAL_ID, args.special_id.encode('ascii').ljust(16, bytes(1))[:16])
        write(BASE + RARITY_POINTER, '<Q', LISTS)
        write(LISTS, '<7f', *weights)
        write(LISTS + 0x100, '<QI', TABLE + TABLE_START, count)          # technology table descriptor
        write(LISTS + 0x200, '<QI', 0, 0)                                # second table left empty
        write(MANAGER + 0x70, '<Q', LISTS + 0x100)
        write(MANAGER + 0x98, '<Q', LISTS + 0x200)
        write(MANAGER + 0x72afb0, '<Q', SYSTEM)
        write(SYSTEM + 0x2524, '<i', wealth)
        write(MANAGER + 0x26310, '<i', args.progress)
        known = identifiers if args.known == 'all' else []
        machine.mem_write(LISTS + 0x1000, b''.join(known))
        write(MANAGER + 0x24074, '<I', len(known))
        write(MANAGER + 0x24078, '<Q', LISTS + 0x1000)
        # Store: ten columns, every slot valid, empty element vector with room for 256 elements.
        rows = (slots + 9) // 10
        for row in range(min(rows, 16)):
            write(STORE + row * 8, '<Q', 0x3ff)
        write(STORE + 0x80, '<3h', 10, rows, slots)
        write(STORE + 0x88, '<IIQ', 256, 0, STORE + 0x1000)
        write(SEED, '<QQ', seed, 1)
        stack = STACK + 0xf0000
        write(stack, '<Q', RETURN)
        write(stack + 0x28, '<Q', args.size_argument)
        write(stack + 0x30, '<Q', 0)
        machine.reg_write(regs.UC_X86_REG_RSP, stack)
        machine.reg_write(regs.UC_X86_REG_RCX, STORE)
        machine.reg_write(regs.UC_X86_REG_RDX, args.inventory_type)
        machine.reg_write(regs.UC_X86_REG_R8, SEED)
        machine.reg_write(regs.UC_X86_REG_R9, args.class_argument)
        picked, state = [], {'error': None, 'heap': HEAP}

        def leave(emulator, value=None):
            top = emulator.reg_read(regs.UC_X86_REG_RSP)
            emulator.reg_write(regs.UC_X86_REG_RIP, struct.unpack('<Q', emulator.mem_read(top, 8))[0])
            emulator.reg_write(regs.UC_X86_REG_RSP, top + 8)
            if value is not None:
                emulator.reg_write(regs.UC_X86_REG_RAX, value)

        def hook(emulator, address, size, user):
            rva = address - BASE
            if rva in (CLEAR_MAP, STATE_INIT, STACK_PROBE):
                leave(emulator)
            elif rva == INSERT:
                element = bytes(emulator.mem_read(emulator.reg_read(regs.UC_X86_REG_R8), 0x30))
                target = emulator.reg_read(regs.UC_X86_REG_RCX)
                _, used, data = struct.unpack('<IIQ', emulator.mem_read(target + 0x88, 16))
                emulator.mem_write(data + used * 0x30, element)
                emulator.mem_write(target + 0x8c, struct.pack('<I', used + 1))
                picked.append(element[:16].split(b'\0')[0].decode('ascii', 'replace'))
                leave(emulator)
            elif rva in (COPY, MOVE, FILL):
                target, second, length = (emulator.reg_read(r) for r in
                                          (regs.UC_X86_REG_RCX, regs.UC_X86_REG_RDX, regs.UC_X86_REG_R8))
                if length > 0x100000:
                    state['error'] = 'memory helper length out of bounds'
                    emulator.emu_stop()
                    return
                data = bytes([second & 0xff]) * length if rva == FILL else bytes(emulator.mem_read(second, length))
                emulator.mem_write(target, data)
                leave(emulator, target)
            elif rva == ALLOCATE:
                length = (emulator.reg_read(regs.UC_X86_REG_RDX) & 0xffffffff) + 15 & ~15
                if not length or state['heap'] + length > HEAP + 0x400000:
                    state['error'] = 'private heap exhausted'
                    emulator.emu_stop()
                    return
                state['heap'] += length
                leave(emulator, state['heap'] - length)
            elif rva in (RELEASE, RELEASE_VECTOR):
                leave(emulator)
            elif rva == ASSERT:
                state['error'] = 'native assertion path reached'
                emulator.emu_stop()

        trail = []

        def block(emulator, address, size, user):
            trail.append(address - BASE)
            del trail[:-6]

        machine.hook_add(unicorn.UC_HOOK_BLOCK, block)
        for stub in (CLEAR_MAP, STATE_INIT, STACK_PROBE, INSERT, ASSERT, COPY, MOVE, FILL,
                     ALLOCATE, RELEASE, RELEASE_VECTOR):
            machine.hook_add(unicorn.UC_HOOK_CODE, hook, begin=BASE + stub, end=BASE + stub)
        try:
            machine.emu_start(BASE + ROUTINE, RETURN, count=20_000_000)
        except unicorn.UcError as error:
            state['error'] = '%s at rva %x after blocks %s' % (
                error, machine.reg_read(regs.UC_X86_REG_RIP) - BASE, ','.join('%x' % rva for rva in trail))
        if not state['error'] and machine.reg_read(regs.UC_X86_REG_RIP) != RETURN:
            state['error'] = 'instruction budget exhausted'
        return picked, state['error']

    records = []
    for slots in args.slots:
        for wealth in args.wealth_row:
            for text in args.seed:
                picked, error = run(int(text, 16), slots, wealth)
                records.append({'seed': '0x%X' % int(text, 16), 'slots': slots, 'wealth_row': wealth,
                                'installed': picked, 'error': error})
    report = {'executable_sha256': HASH, 'table_sha256': args.table_sha256.lower(),
              'tool_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), 'routine_rva': hex(ROUTINE),
              'inputs': {'inventory_type': args.inventory_type, 'class_argument': args.class_argument,
                         'size_argument': args.size_argument, 'progress': args.progress, 'known': args.known,
                         'special_id': args.special_id,
                         'rarity_weights': weights}, 'records': records,
              'errors': sum(bool(r['error']) for r in records), 'runtime_verified': False,
              'limitations': ['Synthetic manager, wealth row, progress value, known-technology list and store.',
                              'The second (procedural) table is empty; stores that draw from it are incomplete.',
                              'Element insertion is recorded, not executed; slot placement is not reproduced.',
                              'The settings float that selects an empty initial charge is zero; charge amounts are not reported.',
                              'Caller arguments of natural generation are assumptions, not traced facts.',
                              'The special ID global is initialized at runtime; its value here is an inference.',
                              'Corpus table and executable are build 180383.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({'cases': len(records), 'errors': report['errors']}))
    for record in records[:40]:
        print(record['seed'], record['slots'], record['wealth_row'], record['installed'], record['error'] or '')


if __name__ == '__main__':
    main()
