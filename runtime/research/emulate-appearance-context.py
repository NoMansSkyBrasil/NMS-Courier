"""Validate material traversal and explicit descriptor contexts in private Unicorn.

Only pinned original instruction windows execute. Strings and vector allocation
are bounded stubs. No game process, save, loader or natural context is accessed.
"""
import argparse
import hashlib
import itertools
import json
from pathlib import Path
import runpy
import struct
import sys

HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
BASE = 0x140000000
WINDOWS = ((0x1833ec0, 0x1833f0b), (0x1839e10, 0x1839ebb),
           (0x2d64800, 0x2d64888), (0x2d67800, 0x2d67df2),
           (0x2d69ad0, 0x2d69bf1), (0x21f4a0, 0x21f528), (0x2d698c0, 0x2d69acd))
STUBS = (0x167aca0, 0x33e0fce, 0x33e0fc8, 0x33e1052, 0x2bf5930, 0x2bf6c60)
STRNCPY_STUB = 0x10001000  # Private fixture address, not a game RVA.
PORT = runpy.run_path(str(Path(__file__).with_name('evaluate-descriptor-seed.py')))


def material_order(tree, initial=()):
    result = list(initial)
    def visit(node, depth):
        if depth > 16:
            raise ValueError('Material tree depth budget exceeded')
        if node[0] is not None and node[0] not in result:
            result.append(node[0])
        for child in node[1]:
            visit(child, depth + 1)
    visit(tree, 0)
    return result


def create_fixture(unicorn, regs, code, constants, windows=WINDOWS, stubs=STUBS, observer=None):
    machine = unicorn.Uc(unicorn.UC_ARCH_X86, unicorn.UC_MODE_64)
    mapped = set()
    def page(address, execute=False):
        address &= ~4095
        if address not in mapped:
            machine.mem_map(address, 4096, unicorn.UC_PROT_ALL if execute else 3)
            mapped.add(address)
        elif execute:
            machine.mem_protect(address, 4096, unicorn.UC_PROT_ALL)
    for begin, data in code.items():
        for at in range((BASE + begin) & ~4095, BASE + begin + len(data), 4096):
            page(at, True)
        machine.mem_write(BASE + begin, data)
    for rva, data in constants.items():
        page(BASE + rva); page(BASE + rva + len(data) - 1)
        machine.mem_write(BASE + rva, data)
    for rva in stubs:
        page(BASE + rva, True); machine.mem_write(BASE + rva, b'\xc3')
    page(STRNCPY_STUB, True); machine.mem_write(STRNCPY_STUB, b'\xc3')
    stop = 0x10000000
    page(stop, True)
    machine.mem_map(0x20000000, 1048576)
    machine.mem_map(0x30000000, 65536)
    cursor = 0x20000000
    def allocate(size):
        nonlocal cursor
        address = cursor
        cursor += (size + 15) & ~15
        if cursor > 0x20100000:
            raise ValueError('Private heap budget exceeded')
        return address
    def write(address, fmt, *values):
        machine.mem_write(address, struct.pack(fmt, *values))
    def unpack(address, fmt):
        return struct.unpack(fmt, machine.mem_read(address, struct.calcsize(fmt)))
    def get(name): return machine.reg_read(getattr(regs, 'UC_X86_REG_' + name))
    def put(name, value): machine.reg_write(getattr(regs, 'UC_X86_REG_' + name), value)
    def cstring(address):
        data = bytes(machine.mem_read(address, 256))
        if b'\0' not in data:
            raise ValueError('String byte budget exceeded')
        return data.split(b'\0', 1)[0]
    def identity(value):
        if not value.isascii() or len(value) > 31 or '\0' in value:
            raise ValueError('Invalid fixture identity')
        return value.encode().ljust(32, b'\0')
    def vector(values):
        head, rows = allocate(16), allocate(max(1, len(values)) * 32)
        for i, value in enumerate(values):
            machine.mem_write(rows + i * 32, identity(value))
        write(head, '<IIQ', len(values), len(values), rows)
        return head
    calls = [0]
    def hook(uc, address, size, user):
        rva = address - BASE
        if observer and observer(machine, address, allocate, write, unpack, get, put, cstring):
            return
        if rva not in stubs and address != STRNCPY_STUB:
            if not any(BASE + b <= address < BASE + e for b, e in windows):
                raise ValueError('Unapproved execution target ' + hex(address))
            return
        calls[0] += 1
        if calls[0] > 1024:
            raise ValueError('Stub call budget exceeded')
        sp = get('RSP')
        if address == STRNCPY_STUB:
            count = get('R8')
            if not 0 <= count <= 31:
                raise ValueError('Unexpected bounded strncpy count')
            data = cstring(get('RDX'))[:count].ljust(count, b'\0')
            machine.mem_write(get('RCX'), data); put('RAX', get('RCX'))
        elif rva in (0x33e0fce, 0x33e0fc8, 0x33e1052):
            left = cstring(get('RCX'))
            if rva == 0x33e0fc8:
                needle = bytes([get('RDX') & 255])
            else:
                needle = cstring(get('RDX'))
            if rva == 0x33e1052:
                value = (left > needle) - (left < needle)
            else:
                position = left.find(needle)
                value = get('RCX') + position if position >= 0 else 0
            put('RAX', value & ((1 << 64) - 1))
        elif rva == 0x167aca0:
            head = get('RCX')
            capacity, count, rows = unpack(head, '<IIQ')
            if capacity != 64 or count >= capacity:
                raise ValueError('Material append fixture bound exceeded')
            machine.mem_write(rows + count * 4, bytes(machine.mem_read(get('RDX'), 4)))
            write(head + 4, '<I', count + 1)
        elif rva == 0x2bf5930:
            head, old = get('RCX'), get('R9')
            count = unpack(head + 4, '<I')[0]
            index, source, stride = (unpack(sp + offset, '<Q')[0] for offset in (0x28, 0x30, 0x50))
            if count >= 256 or stride not in (8, 32) or index != count:
                raise ValueError('Unexpected prefix vector append ABI')
            new = allocate((count + 1) * stride)
            if count:
                machine.mem_write(new, bytes(machine.mem_read(old, count * stride)))
            machine.mem_write(new + count * stride, bytes(machine.mem_read(source, stride)))
            write(head, '<II', count + 1, count + 1); put('RAX', new)
        # Free is a no-op in the bounded private heap.
        put('RIP', unpack(sp, '<Q')[0]); put('RSP', sp + 8)
    machine.hook_add(unicorn.UC_HOOK_CODE, hook)
    def execute(rva, arguments):
        sp = 0x3000f008
        write(sp, '<Q', stop)
        for name, value in zip(('RCX', 'RDX', 'R8', 'R9'), arguments): put(name, value)
        for i, value in enumerate(arguments[4:]): write(sp + 0x28 + i * 8, '<Q', value)
        put('RSP', sp)
        machine.emu_start(BASE + rva, stop, timeout=1000000, count=50000)
        if get('RIP') != stop:
            raise ValueError('Private execution instruction/time budget exceeded')
        return get('RAX')
    return machine, allocate, write, unpack, vector, identity, execute


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--emulator-tools', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in
                             (exe.parent.parent, Path(__file__).resolve().parents[2])):
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
    sections = runpy.run_path(str(Path(__file__).parents[1] / 'native/asi/locate-frontend-hooks.py'))['executable_sections'](raw)
    def read(rva, size):
        section = next(s for s in sections if s['virtual_address'] <= rva and
                       rva + size <= s['virtual_address'] + s['raw_size'])
        at = section['raw_offset'] + rva - section['virtual_address']
        return raw[at:at+size]
    decoder = Cs(CS_ARCH_X86, CS_MODE_64)
    decoder.detail = True
    code, constants = {}, {}
    for begin, end in WINDOWS:
        data = read(begin, end - begin)
        instructions = list(decoder.disasm(data, BASE + begin))
        if sum(i.size for i in instructions) != len(data):
            raise ValueError('Incomplete instruction decoding')
        for instruction in instructions:
            if instruction.mnemonic in ('syscall', 'sysenter', 'int', 'in', 'out'):
                raise ValueError('External instruction rejected')
            for operand in instruction.operands:
                if operand.type == X86_OP_MEM and operand.mem.base == X86_REG_RIP:
                    rva = instruction.address + instruction.size + operand.mem.disp - BASE
                    constants[rva] = read(rva, max(operand.size, 32))
        code[begin] = data
    import_name_rva = struct.unpack('<Q', read(0x34118c0, 8))[0]
    if read(import_name_rva + 2, 32).split(b'\0', 1)[0] != b'strncpy':
        raise ValueError('Selected IAT entry is not the audited strncpy import')
    constants[0x34118c0] = struct.pack('<Q', STRNCPY_STUB)

    def fixture():
        return create_fixture(unicorn, regs, code, constants)

    records = []
    for name in ('WING', '_PART', '_wing_left', '_wing_left_extra',
                 '_ABCDEFGHIJKLMNOP_tail', '_ABCDEFGHIJKLMNOPQRSTUVWXYZabcd', '_X_A'):
        for selected in ((), ('_WING_LEFT',), (name[:15].upper(),), (name[:16].upper(),),
                         (name[:31].upper(),), ('_wing_left',)):
            machine, allocate, _, _, vector, _, execute = fixture()
            head, name_ptr = vector(selected), allocate(256)
            machine.mem_write(name_ptr, name.encode() + b'\0')
            result = execute(0x2d698c0, [head, name_ptr, 0]) & 255
            expected = PORT['loaded_node_included'](name, selected)
            records.append({'kind': 'loaded_node_membership', 'name': name, 'selected': selected,
                            'observed': bool(result), 'expected': expected, 'matched': bool(result) == expected})
    for capacity in (0, 1, 8):
        machine, allocate, write, unpack, _, _, execute = fixture()
        head, rows, value_ptr = allocate(16), allocate(64), allocate(8)
        write(head, '<IIQ', capacity, 0, rows)
        values = (0x111, 0x333, 0x111)
        for value in values:
            write(value_ptr, '<Q', value)
            execute(0x21f4a0, [head, value_ptr])
        count, actual_rows = unpack(head + 4, '<IQ')
        if count != len(values): raise ValueError('Unexpected child append count')
        actual = unpack(actual_rows, '<' + 'Q' * count)
        records.append({'kind': 'child_append_order', 'initial_capacity': capacity,
                        'observed': actual, 'expected': values, 'matched': actual == values})
    leaf = lambda handle: (handle, [])
    trees = [(None, []), leaf(0), (None, [leaf(7), leaf(2), leaf(7)]),
             (9, [leaf(7), (2, [leaf(9), leaf(4)])]),
             (None, [(None, [leaf(4), leaf(2)]), leaf(4), leaf(8)])]
    for tree, initial in itertools.product(trees, ((), (7,), (4, 4))):
        machine, allocate, write, unpack, _, _, execute = fixture()
        nodes = [0]
        def build(node, depth=0):
            nodes[0] += 1
            if nodes[0] > 32 or depth > 16:
                raise ValueError('Node fixture budget exceeded')
            address, table = allocate(0xa0), allocate(0x28)
            write(address, '<Q', table)
            write(table + 0x20, '<Q', BASE + (0x1833ec0 if node[0] is None else 0x1839e10))
            if node[0] is not None:
                material = allocate(0x134)
                write(address + 0x98, '<Q', material); write(material + 0x130, '<I', node[0])
            children = [build(child, depth + 1) for child in node[1]]
            rows = allocate(max(1, len(children)) * 8)
            for i, child in enumerate(children): write(rows + i * 8, '<Q', child)
            write(address + 0x7c, '<I', len(children)); write(address + 0x80, '<Q', rows)
            return address
        root = build(tree)
        head, rows = allocate(16), allocate(64 * 4)
        write(head, '<IIQ', 64, len(initial), rows)
        for i, value in enumerate(initial): write(rows + i * 4, '<I', value)
        execute(0x1833ec0 if tree[0] is None else 0x1839e10, [root, head])
        count = unpack(head + 4, '<I')[0]
        if count > 64: raise ValueError('Material result budget exceeded')
        observed = list(unpack(rows, '<' + 'I' * count))
        expected = material_order(tree, initial)
        records.append({'kind': 'material_order', 'tree': tree, 'initial': initial,
                        'observed': observed, 'expected': expected, 'matched': observed == expected})

    options = [{'id': '_PART_XA', 'name': 'normal'}, {'id': '_PART_XB', 'name': 'xRARE'},
               {'id': '_PART_XC', 'name': 'xNEVER'}, {'id': 'WING', 'name': 'xWEIRD'},
               {'id': '_XA', 'name': 'normal'}, {'id': 'PARTXA', 'name': 'normal'}]
    for seed, inclusion, exclusion, prefix, selected in itertools.product(
            (0, 7, 0xffffffffffffffff), ((), ('_XA',), ('XA',), ('UNMATCHED',)),
            ((), ('WING',), ('', '_PART')), ('', '_PART', 'XC', 'WING', 'MISSING'),
            ((), ('_PART_XC',))):
        machine, allocate, write, unpack, vector, identity, execute = fixture()
        selected_vector, include_vector = vector(selected), vector(inclusion)
        exclude_vector = vector(exclusion)
        excluded = allocate(16)
        write(excluded, '<QQ', unpack(exclude_vector + 8, '<Q')[0], len(exclusion))
        model, groups, rows = allocate(16), allocate(0x20), allocate(len(options) * 0xc8)
        write(model, '<QI', groups, 1); write(groups, '<QI', rows, len(options))
        for i, option in enumerate(options):
            machine.mem_write(rows + i * 0xc8, identity(option['id']))
            machine.mem_write(rows + i * 0xc8 + 0x44, option['name'].encode() + b'\0')
        prefix_ptr, state_ptr = allocate(32), allocate(8)
        machine.mem_write(prefix_ptr, identity(prefix))
        state = PORT['core']['seed_state'](seed)
        write(state_ptr, '<II', *state)
        result = execute(0x2d67800, [selected_vector, model, include_vector, 0, prefix_ptr, state_ptr, excluded])
        if result and (result < rows or (result - rows) % 0xc8 or result >= rows + len(options) * 0xc8):
            raise ValueError('Native result is not a fixture option')
        index = (result - rows) // 0xc8 if result else None
        actual_state = unpack(state_ptr, '<II')
        expected_state, expected_index = PORT['choose_group'](state, options, selected, inclusion, exclusion, prefix)
        records.append({'kind': 'descriptor_context', 'seed': hex(seed), 'inclusion': inclusion,
                        'exclusion': exclusion, 'prefix': prefix, 'selected': selected,
                        'observed_index': index, 'expected_index': expected_index,
                        'observed_state': actual_state, 'expected_state': expected_state,
                        'matched': (index, actual_state) == (expected_index, expected_state)})
    report = {'mode': 'isolated_original_instruction_comparison', 'exe_sha256': HASH,
              'runtime_verified': False, 'natural_context_proven': False,
              'tool_versions': {'python': sys.version.split()[0], 'unicorn': unicorn.__version__},
              'source_hashes': {name: hashlib.sha256(Path(__file__).with_name(name).read_bytes()).hexdigest()
                                for name in ('emulate-appearance-context.py', 'evaluate-descriptor-seed.py',
                                             'procedural-seed-primitives.py')},
              'window_hashes': {hex(rva): hashlib.sha256(data).hexdigest() for rva, data in code.items()},
              'cases': len(records), 'mismatches': sum(not record['matched'] for record in records),
              'records': records}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({k: report[k] for k in ('cases', 'mismatches', 'runtime_verified')}))
    if report['mismatches']: raise SystemExit(1)


if __name__ == '__main__':
    main()
