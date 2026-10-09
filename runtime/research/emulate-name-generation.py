"""Run the original name routines of build 180383 or 180836 under emulation.

Ship (RVA e8ce30), weapon/staff (e8ebf0), place (e85aa0) and the two
fleet-code routines (e8da90, e8e150) are
produced by the game's own instructions, including its compiled procedural
word generator (e7f860 and its letter tables). Private stand-ins replace only
the language lookup, the two formatting helpers, a few C runtime imports and
the stack probe; English strings are read from converted language files in the
external corpus. The generator object, language object and manager are zeroed
private memory. No game process or save is accessed, and which seed and type
each natural caller passes is not established here.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import sys

BASE = 0x140000000
# 'code-a' and 'code-b' are the two routines that use the NAMEGEN_FRIGATE_CODE strings; 'place' is the
# multi-purpose routine that also holds the FREIGHTER_NAME formats. Build 180836 addresses were found by
# relocate-native-signatures.py (unique matches of each routine's first instructions; the state initializer
# had two candidates and the one at the common displacement is used).
BUILDS = {
    '180383': {'sha256': '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4',
               'routines': {'ship': 0xe8ce30, 'weapon': 0xe8ebf0, 'place': 0xe85aa0, 'code-a': 0xe8da90,
                            'code-b': 0xe8e150},
               'state_init': 0x2d6b670, 'stack_probe': 0x33df370, 'language_object': 0x1cb3b0,
               'translate': 0x2be1190, 'format': (0x89edd0, 0x1c8bf0), 'manager_pointer': 0x6e89688},
    '180836': {'sha256': '13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499',
               'routines': {'ship': 0xe8ed50, 'weapon': 0xe90b10, 'place': 0xe879c0, 'code-a': 0xe8f9b0,
                            'code-b': 0xe90070, 'galaxy': 0x135a2a0},
               'state_init': 0x2d6f410, 'stack_probe': 0x33e2ed0, 'language_object': 0x1cb3b0,
               'translate': 0x2be4e20, 'format': (0x8a0ca0, 0x1c8bf0), 'manager_pointer': 0x6e8d708},
}
# 'galaxy' (build 180836 only) is the routine that names a galaxy from its number, counted from 0: the
# first five take a language string, the others the procedural word generator with a seed made from the number.
# Its seed argument is that number; the type argument is not used.
KINDS = ('ship', 'weapon', 'place', 'code-a', 'code-b', 'galaxy')
STUBS, MANAGER, OBJECTS, OUTPUT, HEAP, STACK, RETURN = (0x200000000, 0x210000000, 0x220000000, 0x221000000,
                                                         0x222000000, 0x230000000, 0x240000000)


LANGUAGES = {'english': 'English', 'brazilianportuguese': 'BrazilianPortuguese', 'portuguese': 'Portuguese',
             'spanish': 'Spanish', 'french': 'French', 'german': 'German', 'italian': 'Italian'}


def load_language(corpus, language='english'):
    """Strings of one language by ID from the converted language files of the corpus."""
    folder = next((Path(corpus) / 'archives').glob('NMSARC.MetadataEtc-*/language'), None)
    if folder is None:
        raise ValueError('Converted language files are not in the corpus')
    table, sources = {}, {}
    entry = re.compile(r'<Property name="Table" value="TkLocalisationEntry"[^>]*>(.*?)\s</Property>', re.DOTALL)
    key = re.compile(r'name="Id" value="([^"]*)"')
    text = re.compile(r'name="%s" value="([^"]*)"' % LANGUAGES[language])
    for path in sorted(folder.glob('*_%s.MXML' % language)):
        data = path.read_bytes()
        if len(data) > 64 * 1024**2:
            raise ValueError('Language file byte budget exceeded')
        sources[path.name] = hashlib.sha256(data).hexdigest()
        for block in entry.findall(data.decode('utf-8')):
            name, value = key.search(block), text.search(block)
            if name and value:
                value = (value.group(1).replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
                         .replace('&quot;', '"').replace('&apos;', "'"))
                table.setdefault(name.group(1), value)
    return table, sources


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('executable', 'corpus', 'python-tools', 'emulator-tools', 'output'):
        parser.add_argument('--' + key, type=Path, required=True)
    parser.add_argument('--kind', choices=KINDS, required=True)
    parser.add_argument('--build', choices=sorted(BUILDS), default='180383')
    parser.add_argument('--type', type=int, action='append', required=True,
                        help='Type argument (ship type, place name type or weapon class; ignored by code-a/code-b); repeatable')
    parser.add_argument('--seed', action='append', required=True, help='Hex seed; maximum 256')
    parser.add_argument('--language', choices=sorted(LANGUAGES), default='english')
    args = parser.parse_args()
    exe, output = args.executable.resolve(), args.output.resolve()
    here = Path(__file__).resolve()
    if output.exists() or any(output.is_relative_to(p) for p in (exe.parent.parent, here.parents[2], args.corpus.resolve())):
        parser.error('Require a new external output')
    raw = exe.read_bytes()
    build = BUILDS[args.build]
    HASH, ROUTINES = build['sha256'], build['routines']
    if args.kind not in ROUTINES:
        parser.error('This routine was not located in build ' + args.build)
    STATE_INIT, STACK_PROBE, LANGUAGE_OBJECT = build['state_init'], build['stack_probe'], build['language_object']
    TRANSLATE, FORMAT_ROUTINES, MANAGER_POINTER = build['translate'], build['format'], build['manager_pointer']
    if len(raw) > 128 * 1024**2 or hashlib.sha256(raw).hexdigest() != HASH:
        parser.error('Executable fingerprint mismatch')
    language, language_sources = load_language(args.corpus, args.language)
    sys.path[:0] = [str(args.python_tools), str(args.emulator_tools)]
    import unicorn
    from unicorn import x86_const as regs
    if unicorn.__version__ != '2.1.4':
        parser.error('Requires private Unicorn 2.1.4')

    machine = unicorn.Uc(unicorn.UC_ARCH_X86, unicorn.UC_MODE_64)
    pe = struct.unpack_from('<I', raw, 0x3c)[0]
    count, optional = struct.unpack_from('<H', raw, pe + 6)[0], struct.unpack_from('<H', raw, pe + 20)[0]
    sections = [struct.unpack_from('<IIII', raw, pe + 24 + optional + index * 40 + 8) for index in range(count)]
    for virtual_size, address, raw_size, raw_at in sections:
        size = (max(virtual_size, raw_size) + 0xfff) & ~0xfff
        machine.mem_map(BASE + address, size)
        machine.mem_write(BASE + address, raw[raw_at:raw_at + raw_size])

    def file_offset(rva):
        for virtual_size, address, raw_size, raw_at in sections:
            if address <= rva < address + raw_size:
                return raw_at + rva - address
        raise ValueError('Address is not file-backed')

    # Every import slot points at its own private stub so C runtime calls can be answered here.
    imports = []
    table = struct.unpack_from('<I', raw, pe + 24 + 112 + 8)[0]
    at = file_offset(table)
    while True:
        lookup, _, _, name, thunk = struct.unpack_from('<IIIII', raw, at)
        if not lookup and not thunk:
            break
        entry = file_offset(lookup or thunk)
        slot = 0
        while True:
            value = struct.unpack_from('<Q', raw, entry + slot * 8)[0]
            if not value:
                break
            label = 'ordinal' if value >> 63 else raw[file_offset(value & 0x7fffffff) + 2:].split(bytes(1))[0].decode()
            machine.mem_write(BASE + thunk + slot * 8, struct.pack('<Q', STUBS + len(imports) * 16))
            imports.append(label)
            slot += 1
        at += 20
    for address, size in ((STUBS, 0x100000), (MANAGER, 0x800000), (OBJECTS, 0x10000), (OUTPUT, 0x10000),
                          (HEAP, 0x400000), (STACK, 0x200000), (RETURN, 0x1000)):
        machine.mem_map(address, size)
    machine.mem_write(STUBS, b'\xc3' * 0x100000)
    machine.mem_write(BASE + MANAGER_POINTER, struct.pack('<Q', MANAGER))
    for rva in (STATE_INIT, STACK_PROBE, LANGUAGE_OBJECT, TRANSLATE) + FORMAT_ROUTINES:
        machine.mem_write(BASE + rva, b'\xc3')
    state = {'heap': HEAP, 'error': None, 'missing': set()}
    register = machine.reg_read
    RCX, RDX, R8, R9, RSP, RAX = (regs.UC_X86_REG_RCX, regs.UC_X86_REG_RDX, regs.UC_X86_REG_R8,
                                  regs.UC_X86_REG_R9, regs.UC_X86_REG_RSP, regs.UC_X86_REG_RAX)

    def text_at(address, limit=4096):
        data = bytes(machine.mem_read(address, limit))
        return data.split(bytes(1))[0]

    def argument(index):
        if index < 4:
            return register((RCX, RDX, R8, R9)[index])
        return struct.unpack('<Q', machine.mem_read(register(RSP) + 8 + index * 8, 8))[0]

    def allocate(data):
        address = state['heap']
        state['heap'] += (len(data) + 16) & ~15
        if state['heap'] > HEAP + 0x400000:
            raise ValueError('private heap exhausted')
        machine.mem_write(address, data)
        return address

    def formatted(template_address, read):
        """Minimal printf for the specifiers these routines use; read(index) yields the following arguments."""
        template, index, parts = text_at(template_address).decode('latin-1'), 0, []
        position = 0
        for match in re.finditer(r'%(?:%|[-0-9.]*(?:[idu]|c|s))', template):
            parts.append(template[position:match.start()])
            position, spec = match.end(), match.group()
            if spec == '%%':
                parts.append('%')
                continue
            value = read(index)
            index += 1
            if spec[-1] in 'id':
                parts.append((spec[:-1] + 'd') % (((value & 0xffffffff) ^ 0x80000000) - 0x80000000))
            elif spec[-1] == 'u':
                parts.append((spec[:-1] + 'd') % (value & 0xffffffff))
            elif spec[-1] == 'c':
                parts.append(chr(value & 0xff))
            else:
                parts.append(spec % text_at(value).decode('latin-1'))
        parts.append(template[position:])
        return ''.join(parts).encode('latin-1')

    def leave(value=None):
        if value is not None:
            machine.reg_write(RAX, value & (1 << 64) - 1)

    def native(emulator, address, size, user):
        rva = address - BASE
        if rva == LANGUAGE_OBJECT:
            leave(OBJECTS + 0x1000)
        elif rva == TRANSLATE:
            key = text_at(register(RDX)).decode('latin-1')
            if key in language:
                leave(allocate(language[key].encode('utf-8') + bytes(1)))
            else:
                state['missing'].add(key)
                leave(register(RDX))
        elif rva in FORMAT_ROUTINES:
            data = formatted(argument(1), lambda index: argument(index + 2))[:126]
            machine.mem_write(register(RCX), data + bytes(1))
            leave(len(data))

    def imported(emulator, address, size, user):
        name = imports[(address - STUBS) // 16]
        if name in ('memcpy', 'memmove'):
            machine.mem_write(argument(0), bytes(machine.mem_read(argument(1), argument(2))))
            leave(argument(0))
        elif name == 'memset':
            machine.mem_write(argument(0), bytes([argument(1) & 0xff]) * argument(2))
            leave(argument(0))
        elif name == 'strncat':
            target = text_at(argument(0))
            extra = text_at(argument(1))[:argument(2) & 0xffffffff]
            machine.mem_write(argument(0) + len(target), extra + bytes(1))
            leave(argument(0))
        elif name == 'strstr':
            found = text_at(argument(0)).find(text_at(argument(1)))
            leave(0 if found < 0 else argument(0) + found)
        elif name == 'toupper':
            value = argument(0) & 0xffffffff
            leave(value - 32 if 97 <= value <= 122 else value)
        elif name == 'tolower':
            value = argument(0) & 0xffffffff
            leave(value + 32 if 65 <= value <= 90 else value)
        elif name == '__stdio_common_vsprintf':
            # (options, buffer, count, format, locale, argument list); arguments are eight-byte slots.
            values = argument(5)
            data = formatted(argument(3), lambda index: struct.unpack('<Q', machine.mem_read(values + index * 8, 8))[0])
            limit = argument(2)
            if argument(1) and limit:
                machine.mem_write(argument(1), data[:limit - 1] + bytes(1))
            leave(len(data))
        elif name == '__stdio_common_vsnprintf_s':
            # (options, buffer, size, maximum count, format, locale, argument list).
            values = argument(6)
            data = formatted(argument(4), lambda index: struct.unpack('<Q', machine.mem_read(values + index * 8, 8))[0])
            limit = min(argument(2), (argument(3) & 0xffffffff) + 1)
            if argument(1) and limit:
                machine.mem_write(argument(1), data[:limit - 1] + bytes(1))
            leave(len(data))
        elif name == 'strlen':
            leave(len(text_at(argument(0))))
        else:
            state['error'] = 'unhandled import ' + name
            emulator.emu_stop()

    for rva in (LANGUAGE_OBJECT, TRANSLATE) + FORMAT_ROUTINES:
        machine.hook_add(unicorn.UC_HOOK_CODE, native, begin=BASE + rva, end=BASE + rva)
    machine.hook_add(unicorn.UC_HOOK_CODE, imported, begin=STUBS, end=STUBS + 0x100000)

    def run(kind, type_argument, seed):
        state.update(heap=HEAP, error=None)
        machine.mem_write(OUTPUT, bytes(0x1000))
        stack = STACK + 0x180000
        machine.mem_write(stack, struct.pack('<Q', RETURN))
        machine.reg_write(RSP, stack)
        machine.reg_write(RCX, OBJECTS)
        if kind == 'galaxy':
            # (galaxy number, generate flag, name buffer, second buffer for the name alone)
            machine.reg_write(RCX, seed)
            values = (1, OUTPUT, OUTPUT + 0x800)
        elif kind in ('ship', 'code-a', 'code-b'):
            values = (seed, OUTPUT, 0)
            machine.mem_write(stack + 0x28, struct.pack('<Q', type_argument))
        elif kind == 'place':
            values = (type_argument, seed, OUTPUT)
            machine.mem_write(stack + 0x28, struct.pack('<Q', 0))
        else:
            values = (seed, type_argument, OUTPUT)
            machine.mem_write(stack + 0x28, struct.pack('<Q', 0))
        for target, value in zip((RDX, R8, R9), values):
            machine.reg_write(target, value)
        try:
            machine.emu_start(BASE + ROUTINES[kind], RETURN, count=20_000_000)
        except unicorn.UcError as error:
            state['error'] = '%s at rva %x' % (error, register(regs.UC_X86_REG_RIP) - BASE)
        if not state['error'] and register(regs.UC_X86_REG_RIP) != RETURN:
            state['error'] = 'instruction budget exhausted'
        return text_at(OUTPUT, 256).decode('utf-8', 'replace'), state['error']

    records = []
    for type_argument in args.type:
        for text in args.seed[:256]:
            seed = int(text, 16)
            name, error = run(args.kind, type_argument, seed)
            records.append({'kind': args.kind, 'type': type_argument, 'seed': '0x%X' % seed, 'name': name,
                            'error': error})
    report = {'build': args.build, 'executable_sha256': HASH, 'tool_sha256': hashlib.sha256(here.read_bytes()).hexdigest(),
              'routine_rva': hex(ROUTINES[args.kind]), 'language': args.language,
              'language_sources': language_sources,
              'records': records, 'errors': sum(bool(r['error']) for r in records),
              'missing_language_ids': sorted(state['missing'])[:64], 'runtime_verified': False,
              'limitations': ['Language lookup, two formatting helpers, C runtime imports and the stack probe are '
                              'private stand-ins; everything else is original code.',
                              'Generator, language and manager objects are zeroed private memory.',
                              'Seed and type passed by natural callers are not established here.',
                              'Language strings come from the corpus build, not from the running game.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    sys.stdout.reconfigure(encoding='utf-8')
    print(json.dumps({'cases': len(records), 'errors': report['errors'],
                      'names': [r['name'] or r['error'] for r in records[:24]]}, ensure_ascii=False))


if __name__ == '__main__':
    main()
