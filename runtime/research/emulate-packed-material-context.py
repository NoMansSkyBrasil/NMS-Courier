"""Compare packed MESH acquisition and resource contexts in private Unicorn.

Original pinned creator, validators and purchase accessor instructions execute.
Allocation, resource IO and vector copying are controlled
stubs. This is not whole-model loading, cache acquisition or runtime delivery.
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
WINDOWS = ((0x189f400, 0x18a0097), (0x2d62450, 0x2d627a0),
           (0x18319a0, 0x18319ca), (0x18319d0, 0x1831a07), (0x183cd20, 0x183ce50),
           (0x1833ec0, 0x1833f0b), (0x1839e10, 0x1839ebb),
           (0x18db0e0, 0x18db13e), (0x18dae90, 0x18dae9e),
           (0x2d63670, 0x2d636aa), (0x2d646f0, 0x2d647f0),
           (0x2d65280, 0x2d652c3))
STUBS = (0x2c190b0, 0x2c190f0, 0x2d65130, 0x1ae230, 0x2d60100,
         0x2d61ce0, 0x2d65980, 0x2bf5d70, 0x2d641c0, 0x21fc60, 0x201110)


def context_equal(left, right, strict=True):
    """Port the low-byte boolean contract, not undefined upper return bits."""
    ids, seed, enabled, texture, texture_enabled = left
    other_ids, other_seed, other_enabled, other_texture, other_texture_enabled = right
    if (enabled, texture_enabled) != (other_enabled, other_texture_enabled):
        return False
    if strict:
        return (not enabled or seed == other_seed) and (
            not texture_enabled or texture == other_texture) and ids == other_ids
    if enabled:
        return seed == other_seed and (not texture_enabled or texture == other_texture)
    return ids == other_ids


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--emulator-tools', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in
                             (exe.parent.parent, HERE.parents[1])):
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
    decoder = Cs(CS_ARCH_X86, CS_MODE_64); decoder.detail = True
    code, constants = {}, {}
    for begin, end in WINDOWS:
        data = read(begin, end - begin)
        instructions = list(decoder.disasm(data, BASE + begin))
        if sum(i.size for i in instructions) != len(data):
            raise ValueError('Incomplete instruction decoding at ' + hex(begin))
        for instruction in instructions:
            if instruction.mnemonic in ('syscall', 'sysenter', 'int', 'in', 'out'):
                raise ValueError('External instruction rejected')
            for operand in instruction.operands:
                if operand.type == X86_OP_MEM and operand.mem.base == X86_REG_RIP:
                    rva = instruction.address + instruction.size + operand.mem.disp - BASE
                    if rva in (0x6e1bc10, 0x5910190):
                        constants[rva] = bytes(32)  # Private resource-manager pointer installed below.
                    else:
                        try:
                            constants[rva] = read(rva, max(operand.size, 32))
                        except StopIteration as error:
                            raise ValueError('Unmapped constant at ' + hex(rva)) from error
        code[begin] = data
    constants[0x4afb510] = read(0x4afb510, 0x60)
    for table, slot, expected in ((0x4b01b08, 0x20, 0x18db0e0),
                                  (0x4b01b58, 0xd8, 0x18dae90),
                                  (0x4afb270, 0x20, 0x1833ec0),
                                  (0x4afb6f8, 0x20, 0x1839e10)):
        constants[table + slot] = read(table + slot, 8)
        if struct.unpack('<Q', constants[table + slot])[0] != BASE + expected:
            raise ValueError('Collector table differs from audited association')
    material_key = read(0x50ad3e8, 16)
    if material_key.rstrip(b'\0') != b'MATERIAL':
        raise ValueError('Packed material key differs from audited literal')
    for slot, expected in ((0x50, 0x2d62450), (0x58, 0x18319a0)):
        if struct.unpack('<Q', read(0x4afb510 + slot, 8))[0] != BASE + expected:
            raise ValueError('Material validator table differs from audited association')

    records = []
    def fixture(fail_first=False, name_match=True):
        calls, resolved, state = [], {}, {}
        def observer(machine, address, allocate, write, unpack, get, put, cstring):
            rva = address - BASE
            if rva not in STUBS and address != COMMON['STRNCPY_STUB']:
                return False
            sp, value = get('RSP'), 0
            if rva in (0x2c190b0, 0x2c190f0):
                size = get('RCX')
                if size not in (0x10, 0x20, 0xf0):
                    raise ValueError('Unexpected creator allocation size')
                value = allocate(size)
            elif rva == 0x2d65130:
                value = state['default_context']
            elif rva == 0x2d60100:
                context = unpack(sp + 0x38, '<Q')[0]
                flags = unpack(sp + 0x28, '<Q')[0]
                calls.append({'name': cstring(get('R9')).decode('ascii'),
                              'type': get('R8'), 'flags': flags,
                              'context': context,
                              'context_bytes': bytes(machine.mem_read(context, 48)).hex()})
                handle = len(calls)
                write(get('RDX'), '<I', handle)
                resolved[handle] = 0 if fail_first and handle == 1 else allocate(0x1c0)
                write(state['table'] + (handle - 1) * 8, '<Q', resolved[handle])
            elif rva == 0x21fc60:
                if unpack(get('RDX'), '<I')[0] != 4:
                    raise ValueError('Unexpected private context-bank type')
                value = 0
            elif rva == 0x201110:
                selector = unpack(get('RDX'), '<Q')[0]
                state['selector_lookups'].append(selector)
                if len(state['selector_lookups']) > 4:
                    raise ValueError('Selector lookup bound exceeded')
                keys = list(state['variant_bank'])
                value = keys.index(selector) if selector in keys else len(keys)
            elif rva == 0x2bf5d70:
                count, stride = get('R8'), get('R9')
                if count > 32 or stride != 32:
                    raise ValueError('Context copy count/stride budget exceeded')
                value = allocate(max(1, count) * stride)
                machine.mem_write(value, bytes(machine.mem_read(get('RDX'), count * stride)))
                write(get('RCX'), '<II', count, count)
            elif rva == 0x2d641c0:
                state['writer_arguments'] = [get(register) for register in ('RCX', 'RDX', 'R8', 'R9')]
                state['writer_arguments'].extend(unpack(sp + offset, '<Q')[0] for offset in (0x28, 0x30))
            elif address == COMMON['STRNCPY_STUB']:
                value = int(name_match)
            put('RAX', value); put('RIP', unpack(sp, '<Q')[0]); put('RSP', sp + 8)
            return True
        result = COMMON['create_fixture'](unicorn, regs, code, constants,
                                          windows=WINDOWS, stubs=STUBS + (0x167aca0,), observer=observer)
        machine, allocate, write, unpack, _, identity, _ = result
        state['default_context'] = allocate(8)
        manager, table = allocate(0x100), allocate(32)
        write(BASE + 0x6e1bc10, '<Q', manager)
        write(BASE + 0x5910190, '<Q', manager)
        write(manager + 0x5c, '<I', 4); write(manager + 0x60, '<Q', table)
        state.update(manager=manager, table=table)
        state['name'] = allocate(256)
        machine.mem_write(state['name'], b'MATERIAL.MBIN\0')
        def context(data):
            ids, seed, enabled, texture, texture_enabled = data
            if len(ids) > 32:
                raise ValueError('Context identity count budget exceeded')
            head, rows = allocate(48), allocate(max(1, len(ids)) * 32)
            for i, item in enumerate(ids): machine.mem_write(rows + i * 32, identity(item))
            write(head, '<IIQ', len(ids), len(ids), rows)
            write(head + 16, '<QB7xQB7x', seed, enabled, texture, texture_enabled)
            return head
        return result, calls, state, context

    for count, fail_first, null_value, flags in itertools.product(range(4), (False, True), (False, True), (0, 0x4000000)):
        result, calls, _, make_context = fixture(fail_first)
        machine, allocate, write, unpack, _, _, execute = result
        context = make_context((('_WING',), 0xabcdef123, True, 7, True))
        scene, rows = allocate(0x80), allocate(max(1, count) * 32)
        write(scene, '<QI', rows, count)
        for i in range(count):
            machine.mem_write(rows + i * 32, material_key)
            value = 0 if null_value and i == 0 else allocate(256)
            if value: machine.mem_write(value, ('MATERIAL' + str(i) + '.MATERIAL.MBIN\0').encode())
            write(rows + i * 32 + 16, '<Q', value)
        node = execute(0x189f400, (scene, context, flags))
        expected_count = min(count, 2 if fail_first else 1)
        expected_names = ['' if null_value and i == 0 else 'MATERIAL' + str(i) + '.MATERIAL.MBIN' for i in range(expected_count)]
        observed_names = [call['name'] for call in calls]
        ok = observed_names == expected_names and all(call['type'] == 4 and call['flags'] == flags and call['context'] == context for call in calls)
        ok = ok and unpack(node, '<Q')[0] == BASE + 0x4afb6f8
        ok = ok and bool(unpack(node + 0x98, '<Q')[0]) == (count > 0 and (not fail_first or count > 1))
        records.append({'kind': 'packed_mesh', 'count': count, 'fail_first': fail_first,
                        'null_value': null_value, 'flags': flags, 'matches': ok,
                        'requested_names': observed_names})

    values = (((), 7, False, 11, False), (('_A', '_B'), 7, False, 11, False),
              (('_B', '_A'), 7, False, 11, False), (('_A',), 7, True, 11, False),
              (('_B',), 7, True, 12, False), (('_A',), 8, True, 11, False),
              (('_A',), 7, False, 11, True), (('_A',), 7, False, 12, True),
              (('_A',), 7, True, 11, True), (('_B',), 7, True, 11, True),
              (('_A',), 7, True, 12, True))
    for left, right, strict in itertools.product(values, values, (False, True)):
        result, _, state, context = fixture()
        machine, allocate, write, unpack, _, _, execute = result
        a, b = context(left), context(right)
        native_leaf = bool(execute(0x2d626c0, (a, b)) & 255)
        resource = allocate(0x1c0)
        write(resource, '<Q', BASE + 0x4afb510)
        write(resource + 8, '<I', 4)
        machine.mem_write(resource + 0xc, b'MATERIAL.MBIN\0')
        machine.mem_write(resource + 0x190, bytes(machine.mem_read(a, 48)))
        flags = 0x4000000 if strict else 0
        write(resource + 0x110, '<Q', flags)
        native_validator = bool(execute(0x2d62450, (resource, state['name'], b, 4)) & 255)
        native_variant = bool(execute(0x18319a0, (resource, state['name'], b, 4, flags)) & 255)
        mismatch_variant = bool(execute(0x18319a0, (resource, state['name'], b, 4, flags ^ 1)) & 255)
        records.append({'kind': 'material_context', 'left': left, 'right': right,
                        'strict': strict, 'matches': native_leaf == context_equal(left, right) and
                        native_validator == context_equal(left, right, strict) and
                        native_variant == native_validator and not mismatch_variant})
    for name, request_type in itertools.product(('MATERIAL.MBIN', 'material.mbin', 'OTHER.MBIN', ''), (1, 4, 7)):
        result, _, state, _ = fixture()
        machine, allocate, write, _, _, _, execute = result
        resource = allocate(0x1c0)
        write(resource, '<Q', BASE + 0x4afb510); write(resource + 8, '<I', 4)
        machine.mem_write(resource + 0xc, b'MATERIAL.MBIN\0')
        machine.mem_write(state['name'], name.encode() + b'\0')
        actual = bool(execute(0x2d62450, (resource, state['name'], 0, request_type)) & 255)
        records.append({'kind': 'material_name_type', 'name': name, 'type': request_type,
                        'matches': actual == (name == 'MATERIAL.MBIN' and request_type == 4)})
    for value in values:
        result, _, state, context = fixture()
        machine, allocate, write, unpack, _, identity, execute = result
        source, resource, output_context = context(value), allocate(0x1c0), allocate(48)
        machine.mem_write(resource + 0x190, bytes(machine.mem_read(source, 48)))
        write(state['table'], '<Q', resource)
        execute(0x183cd20, (output_context, 1))
        count = unpack(output_context + 4, '<I')[0]
        rows = unpack(output_context + 8, '<Q')[0]
        actual_ids = bytes(machine.mem_read(rows, count * 32))
        ok = count == len(value[0]) and actual_ids == b''.join(identity(i) for i in value[0])
        ok = ok and bytes(machine.mem_read(output_context + 16, 32)) == bytes(machine.mem_read(source + 16, 32))
        records.append({'kind': 'purchase_context', 'context': value, 'matches': ok})
    for handle in (0, 2, 5, 0xffffffff):
        result, _, _, _ = fixture()
        machine, allocate, _, unpack, _, _, execute = result
        output_context = allocate(48)
        execute(0x183cd20, (output_context, handle))
        ok = unpack(output_context, '<QQ')[0:2] == (0, 0)
        ok = ok and unpack(output_context + 16, '<QB7xQB')[0:4] == (2**64 - 1, 0, 2**64 - 1, 0)
        records.append({'kind': 'purchase_invalid_handle', 'handle': handle, 'matches': ok})
    for seed, enabled in itertools.product((0, 7, 2**64 - 1), (False, True)):
        result, _, state, context = fixture()
        machine, allocate, write, unpack, _, _, execute = result
        output_context = context((('_OLD',), 17, True, 91, True))
        pair, prefix, filter_input, inclusion = (allocate(32) for _ in range(4))
        write(pair, '<QB7x', seed, enabled)
        second_before = bytes(machine.mem_read(output_context + 32, 16))
        execute(0x2d63670, (output_context, state['name'], pair, prefix, filter_input, inclusion))
        ok = unpack(output_context + 4, '<I')[0] == 0
        ok = ok and bytes(machine.mem_read(output_context + 16, 16)) == bytes(machine.mem_read(pair, 16))
        ok = ok and bytes(machine.mem_read(output_context + 32, 16)) == second_before
        ok = ok and state['writer_arguments'] == [output_context, state['name'], inclusion, pair, prefix, filter_input]
        records.append({'kind': 'default_context_writer', 'seed': hex(seed), 'enabled': enabled, 'matches': ok})
    for bank, selector in itertools.product(({7: 2}, {0: 2}, {7: 0, 0: 2},
                                            {7: 5, 0: 2}, {7: 3, 0: 2}, {}, {0: 0}, {0: 5}),
                                           (0, 7, 9)):
        result, _, state, _ = fixture()
        machine, allocate, write, _, _, _, execute = result
        variant, target, type_vector, type_entry, rows = (allocate(size) for size in (0x1c0, 0x1c0, 8, 0x60, max(1, len(bank)) * 16))
        write(variant + 8, '<I', 4); write(variant + 0x13b, '<B', 1)
        write(variant + 0x110, '<Q', selector)
        write(state['table'], '<QQ', variant, target)
        write(type_vector, '<Q', type_entry)
        write(state['manager'] + 0xd8, '<QQ', type_vector, type_vector + 8)
        write(type_entry + 0x50, '<QQ', rows, rows + len(bank) * 16)
        for index, (key, handle) in enumerate(bank.items()): write(rows + index * 16, '<QI', key, handle)
        state.update(variant_bank=bank, selector_lookups=[])
        wrapper = allocate(4); write(wrapper, '<I', 1)
        actual = execute(0x2d65280, (wrapper,))
        expected_handle = bank.get(selector, bank.get(0, 0) if selector else 0)
        expected = target if expected_handle == 2 else 0
        lookups = [selector]
        if selector not in bank and selector:
            lookups.append(0)
            if 0 in bank: lookups.append(0)
        records.append({'kind': 'variant_handle_resolution', 'selector': selector,
                        'bank': bank, 'lookups': state['selector_lookups'],
                        'matches': actual == expected and state['selector_lookups'] == lookups})
    for handle in (0, 1, 5, 0xffffffff):
        result, _, _, _ = fixture()
        _, allocate, write, _, _, _, execute = result
        wrapper = allocate(4); write(wrapper, '<I', handle)
        records.append({'kind': 'invalid_material_wrapper', 'handle': handle,
                        'matches': execute(0x2d65280, (wrapper,)) == 0})
    # References collect their local children before traversing the resource root.
    for local, referenced, initial in itertools.product(((1,), (2, 1), (1, 1)),
                                                       ((2,), (1, 3), (3, 2, 1)),
                                                       ((), (3,))):
        result, _, _, _ = fixture()
        machine, allocate, write, unpack, _, _, execute = result
        def mesh(handle):
            node, material = allocate(0xf0), allocate(0x1c0)
            write(node, '<Q', BASE + 0x4afb6f8)
            write(node + 0x98, '<Q', material); write(material + 0x130, '<I', handle)
            return node
        def children(node, handles):
            rows = allocate(max(1, len(handles)) * 8)
            for i, handle in enumerate(handles): write(rows + i * 8, '<Q', mesh(handle))
            write(node + 0x78, '<IIQ', len(handles), len(handles), rows)
        reference, resource, root = allocate(0xb0), allocate(0x200), allocate(0x90)
        write(reference, '<Q', BASE + 0x4b01b08); children(reference, local)
        write(reference + 0xa8, '<Q', resource); write(resource, '<Q', BASE + 0x4b01b58)
        write(resource + 0x1c8, '<Q', root); write(root, '<Q', BASE + 0x4afb270)
        children(root, referenced)
        output_vector, rows = allocate(16), allocate(64 * 4)
        write(output_vector, '<IIQ', 64, len(initial), rows)
        for i, handle in enumerate(initial): write(rows + i * 4, '<I', handle)
        execute(0x18db0e0, (reference, output_vector))
        count = unpack(output_vector + 4, '<I')[0]
        actual = list(unpack(rows, '<' + 'I' * count))
        expected = list(dict.fromkeys((*initial, *local, *referenced)))
        records.append({'kind': 'reference_collection', 'local': local,
                        'referenced': referenced, 'initial': initial,
                        'observed': actual, 'matches': actual == expected})
    report = {'executable_sha256': HASH, 'runtime_verified': False,
              'scope': 'Original packed mesh creator, reference collectors, complete material validators and accessor; controlled resource IO',
              'source_hashes': {path.name: hashlib.sha256(path.read_bytes()).hexdigest() for path in
                                (Path(__file__), HERE / 'emulate-appearance-context.py')},
              'window_hashes': {hex(begin): hashlib.sha256(data).hexdigest() for begin, data in code.items()},
              'cases': len(records), 'mismatches': sum(not r['matches'] for r in records), 'records': records}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
        stream.write('\n')
    print(json.dumps({key: report[key] for key in ('cases', 'mismatches', 'runtime_verified')}))
    if report['mismatches']: raise SystemExit(1)


if __name__ == '__main__':
    main()
