"""Compare complete original descriptor recursion with controlled resource IO.

Uses synthetic trees and optionally bounded corpus roots. Resource lookup and
string/allocation imports are private stubs; choice, recursion, seed mixing and
the all-never predicate execute original pinned instructions. No host game runs.
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
PORT = COMMON['PORT']
BASE, HASH = COMMON['BASE'], COMMON['HASH']
WINDOWS = COMMON['WINDOWS'] + ((0x2d63bf0, 0x2d641b3), (0x2d623c0, 0x2d6244d))
STUBS = COMMON['STUBS'] + (0x33e1058, 0x1bcb400, 0x2d649f0, 0x2d652d0)


def option(identity, name='normal', children=(), references=()):
    return {'id': identity, 'name': name, 'child_model_lists': list(children),
            'reference_paths': list(references)}


def model(*groups):
    return {'groups': [{'type_id': name, 'options': list(options)} for name, options in groups]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--emulator-tools', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--corpus', type=Path)
    parser.add_argument('--models-file', type=Path)
    parser.add_argument('--corpus-only', action='store_true', help='Compare new corpus boundaries without repeating synthetic cases')
    parser.add_argument('--explicit-list', action='store_true',
                        help='Compare original 2d63810 explicit selection instead of seeded recursion')
    args = parser.parse_args()
    if bool(args.corpus) != bool(args.models_file):
        parser.error('Corpus and model manifest must be supplied together')
    if args.corpus_only and not args.corpus:
        parser.error('Corpus-only requires corpus and model manifest')
    output = args.output.resolve()
    if output.exists() or output.is_relative_to(HERE.parents[1]) or output.is_relative_to(args.executable.resolve().parent.parent):
        parser.error('Require a new external output')
    if args.corpus and output.is_relative_to(args.corpus.resolve()):
        parser.error('Output cannot be inside the corpus')
    if args.executable.stat().st_size > 128 * 1024**2:
        parser.error('Executable byte budget exceeded')
    raw = args.executable.read_bytes()
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
        section = next(s for s in sections if s['virtual_address'] <= rva and rva + size <= s['virtual_address'] + s['raw_size'])
        start = section['raw_offset'] + rva - section['virtual_address']
        return raw[start:start + size]
    decoder = Cs(CS_ARCH_X86, CS_MODE_64)
    decoder.detail = True
    code, constants = {}, {}
    windows = WINDOWS + ((0x2d63810, 0x2d63bf0),) if args.explicit_list else WINDOWS
    for begin, end in windows:
        data = read(begin, end - begin)
        instructions = list(decoder.disasm(data, BASE + begin))
        if sum(i.size for i in instructions) != len(data):
            raise ValueError('Incomplete window decoding')
        for instruction in instructions:
            if instruction.mnemonic in ('syscall', 'sysenter', 'int', 'in', 'out'):
                raise ValueError('External instruction rejected')
            for operand in instruction.operands:
                if operand.type == X86_OP_MEM and operand.mem.base == X86_REG_RIP:
                    rva = instruction.address + instruction.size + operand.mem.disp - BASE
                    constants[rva] = read(rva, max(operand.size, 32))
        code[begin] = data
    name = struct.unpack('<Q', read(0x34118c0, 8))[0]
    if read(name + 2, 32).split(b'\0', 1)[0] != b'strncpy':
        raise ValueError('Unexpected audited import')
    constants[0x34118c0] = struct.pack('<Q', COMMON['STRNCPY_STUB'])

    leaf = model(('LEAF', [option('_LEAF_A'), option('_LEAF_B', 'xRARE'), option('_LEAF_C', 'xWEIRD')]))
    never = model(('NEVER', [option('_NEVER_A', 'xNEVER')]))
    duplicate = model(('DUP', [option('_ROOT_A'), option('_SECOND_A')]))
    trees = [model(), model(('EMPTY', [])),
             model(('ROOT', [option('_ROOT_A', children=[leaf, never, None, duplicate])]), ('LAST', [option('_LAST_A'), option('_LAST_B')])),
             model(('_PLAYER_', [option('_PLAYER_A', children=[leaf, never, leaf])]), ('LAST', [option('_LAST_A'), option('_LAST_B')])),
             model(('ROOT', [option('_ROOT_A', references=['leaf', 'missing', 'never', 'leaf'])]), ('LAST', [option('_LAST_A'), option('_LAST_B')])),
             model(('LOD', [option('_fooLOD1', children=[leaf])]), ('LOD2', [option('_FOO'), option('_barLOD2')])),
             model(('PREFIX', [option('_ROOT_XA', children=[leaf], references=['leaf']), option('_ROOT_XB', 'xNEVER', [duplicate])])),
             model(('ROOT', [option('_ROOT_A', children=[model(('MID', [option('_MID_A', children=[leaf], references=['leaf'])]))])])),
             model(('RARE', [option('_RARE_A', 'xRARE')]), ('NORMAL', [option('_NORMAL_A')]),
                   ('WEIRD', [option('_WEIRD_A', 'xWEIRD')]))]
    contexts = [((), (), ''), (('_XA',), (), ''), ((), ('_LEAF_A',), '_ROOT'), ((), (), 'A')]
    records = []
    loader = None
    source_records = []
    failures = []
    def compare(label, tree, seed, enabled, inclusion, exclusion, prefix, resolve):
        pointers, lookup_calls, observed_visits = {}, [], []
        def observer(machine, address, allocate, write, unpack, get, put, cstring):
            rva = address - BASE
            if args.explicit_list and rva == 0x2d63810:
                observed_visits.append({})
                if len(observed_visits) > 128:
                    raise ValueError('Native explicit call bound exceeded')
                return False
            if rva == 0x2d63bf0:
                value = unpack(get('R9'), '<Q')[0]
                flag = bool(unpack(get('R9') + 8, '<B')[0])
                observed_visits.append({'seed': hex(value), 'enabled': flag})
                if len(observed_visits) > 128:
                    raise ValueError('Native recursive call bound exceeded')
                return False
            if rva not in (0x33e1058, 0x1bcb400, 0x2d649f0, 0x2d652d0):
                return False
            if rva == 0x33e1058:
                result = len(cstring(get('RCX')))
            elif rva == 0x1bcb400:
                result = unpack(get('RCX'), '<Q')[0]
            elif rva == 0x2d649f0:
                path = cstring(get('RCX')).decode('ascii')
                lookup_calls.append(path)
                if len(lookup_calls) > 1024:
                    raise ValueError('Resource lookup bound exceeded')
                resolved = resolve(path)
                result = build(resolved) if resolved is not None else 0
            else:
                if cstring(get('RDX')) != b'':
                    raise ValueError('Reference filter reset was not empty')
                result = 0
            sp = get('RSP')
            put('RAX', result); put('RIP', unpack(sp, '<Q')[0]); put('RSP', sp + 8)
            return True
        machine, allocate, write, unpack, vector, identity, execute = COMMON['create_fixture'](
            unicorn, regs, code, constants, windows, STUBS, observer)
        def build(tree, depth=0):
            if id(tree) in pointers:
                return pointers[id(tree)]
            if len(pointers) >= 128 or depth > 16 or len(tree['groups']) > 128:
                raise ValueError('Fixture model bound exceeded')
            root = allocate(16)
            pointers[id(tree)] = root
            groups = allocate(max(1, len(tree['groups'])) * 32)
            write(root, '<QI', groups, len(tree['groups']))
            for g, group in enumerate(tree['groups']):
                if len(group['options']) > 128 or len(group['type_id']) > 15:
                    raise ValueError('Fixture group bound exceeded')
                rows = allocate(max(1, len(group['options'])) * 0xc8)
                write(groups + g * 32, '<QI', rows, len(group['options']))
                machine.mem_write(groups + g * 32 + 16, group['type_id'].encode().ljust(16, b'\0'))
                for i, option in enumerate(group['options']):
                    at = rows + i * 0xc8
                    machine.mem_write(at, identity(option['id']))
                    if len(option['name']) > 63:
                        raise ValueError('Fixture option name bound exceeded')
                    machine.mem_write(at + 0x44, option['name'].encode() + b'\0')
                    children = option['child_model_lists']
                    child_rows = allocate(max(1, len(children)) * 16)
                    write(at + 0x20, '<QI', child_rows, len(children))
                    for j, child in enumerate(children):
                        write(child_rows + j * 16, '<Q', build(child, depth + 1) if child is not None else 0)
                    references = option['reference_paths']
                    ref_rows = allocate(max(1, len(references)) * 16)
                    write(at + 0x30, '<QI', ref_rows, len(references))
                    for j, path in enumerate(references):
                        if not path.isascii() or len(path) > 255:
                            raise ValueError('Fixture path bound exceeded')
                        pointer = allocate(256)
                        machine.mem_write(pointer, path.encode() + b'\0')
                        write(ref_rows + j * 16, '<Q', pointer)
            return root
        root = build(tree)
        selected, included = vector(()), vector(inclusion)
        excluded = allocate(16)
        excluded_vector = vector(exclusion)
        write(excluded, '<QQ', unpack(excluded_vector + 8, '<Q')[0], len(exclusion))
        prefix_ptr, pair = allocate(32), allocate(16)
        machine.mem_write(prefix_ptr, identity(prefix)); write(pair, '<QB', seed, enabled)
        if args.explicit_list:
            choices = vector(exclusion)
            execute(0x2d63810, [selected, root, choices, included, 0])
            result = None  # The explicit routine is void, not a classification API.
        else:
            result = execute(0x2d63bf0, [selected, root, included, pair, prefix_ptr, excluded]) & 255
        count, rows = unpack(selected + 4, '<IQ')
        if count > 256:
            raise ValueError('Selected result bound exceeded')
        actual = [bytes(machine.mem_read(rows + i * 32, 32)).split(b'\0', 1)[0].decode() for i in range(count)]
        expected_lookups = []
        def port_resolve(path):
            expected_lookups.append(path)
            return resolve(path)
        if args.explicit_list:
            expected = PORT['evaluate_explicit'](tree, port_resolve, exclusion, inclusion)
            expected.update(visits=[{}] * expected['calls'], classification=result)
        else:
            expected = PORT['evaluate'](seed, tree, port_resolve, enabled, inclusion, exclusion, prefix)
        matched = (actual == expected['selected_ids'] and observed_visits == expected['visits']
                   and lookup_calls == expected_lookups and result == expected['classification'])
        records.append({'root': label, 'seed': hex(seed), 'enabled': enabled,
                        'inclusion': inclusion, 'exclusion': exclusion, 'prefix': prefix,
                        'selected_ids': actual, 'expected_ids': expected['selected_ids'],
                        'visits': observed_visits, 'expected_visits': expected['visits'],
                        'lookup_calls': lookup_calls, 'expected_lookups': expected_lookups,
                        'native_classification': result, 'expected_classification': expected['classification'],
                        'matched': matched})
    try:
        for i, tree in enumerate(() if args.corpus_only else trees):
            seeds = (0,) if args.explicit_list else (0, 7, 0xffffffffffffffff)
            flags = (False,) if args.explicit_list else (False, True)
            for seed, enabled, context in itertools.product(seeds, flags, contexts):
                compare('synthetic-' + str(i), tree, seed, enabled, *context,
                        lambda path: {'leaf': leaf, 'never': never}.get(path))
        if args.corpus:
            if args.models_file.stat().st_size > 32768:
                raise ValueError('Manifest byte bound exceeded')
            roots = json.loads(args.models_file.read_text(encoding='utf-8'))
            if not isinstance(roots, list) or not 1 <= len(roots) <= 32 or any(not isinstance(p, str) or not 1 <= len(p) <= 512 for p in roots):
                raise ValueError('Manifest root bound exceeded')
            sources = None
            for path in roots:
                loader = PORT['CorpusDescriptors'](args.corpus, sources)
                sources = loader.sources
                tree = loader.load(path)
                if tree is None:
                    raise ValueError('Corpus root is missing: ' + path)
                if args.explicit_list:
                    choices = tuple(o['id'] for g in tree['groups'] for o in g['options'][1:2])
                    for selection in ((), choices):
                        compare(path, tree, 0, False, (), selection, '', loader.load)
                else:
                    for seed in (0, 7, 0xffffffffffffffff):
                        compare(path, tree, seed, True, (), (), '', loader.load)
                source_records.extend({'root': path, **{k: v for k, v in r.items() if k != 'tree'}}
                                      for r in loader.cache.values())
                loader.close()
                loader = None
    except (ValueError, unicorn.UcError) as error:
        failures.append({'error_type': type(error).__name__, 'error': str(error),
                         'completed_cases': len(records)})
    finally:
        if loader:
            loader.close()
    report = {'exe_sha256': HASH, 'runtime_verified': False, 'natural_resource_io_proven': False,
              'selection_mode': 'explicit_list' if args.explicit_list else 'seeded_recursion',
              'cases': len(records), 'mismatches': sum(not r['matched'] for r in records),
              'failures': failures,
              'window_hashes': {hex(k): hashlib.sha256(v).hexdigest() for k, v in code.items()},
              'source_hashes': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in
                                (Path(__file__), HERE / 'emulate-appearance-context.py', HERE / 'evaluate-descriptor-seed.py')},
              'sources': source_records,
              'records': records}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({k: report[k] for k in ('cases', 'mismatches', 'runtime_verified')}))
    if report['mismatches'] or failures:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
