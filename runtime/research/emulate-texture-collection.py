"""Compare restricted texture-layer merging with original isolated instructions.

IgnoreName/default collection only, explicit layer call order, no linked layers.
Native collector and copy constructor run in Unicorn; allocation/copy/free are
bounded stubs. Does not prove resource loading order or final entity appearance.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import runpy
import struct
import sys

E = runpy.run_path(str(Path(__file__).with_name('evaluate-texture-options.py')))
EXE_HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
BASE = 0x140000000
WINDOWS = ((0x62fba0, 0x630273), (0x63bb20, 0x63bb9c))
STUBS = (0x2bf5930, 0x2bf5d70, 0x2bf6c60)


def collect(layers, families):
    """Candidate for unlinked IgnoreName calls; preserve first encounter order."""
    groups = []
    for layer in layers:
        f = layer['fields']
        if f.get('LinkedLayer') or any(o['fields']['TextureGameplayUse'] != 'IgnoreName' for o in layer['options']):
            raise ValueError('Unsupported collection context')
        if not layer['options']:
            continue
        existing = next((g for g in groups if (g['layer'], g['group']) == (f['Name'], f['Group'])), None)
        if existing is None:
            existing = {'layer': f['Name'], 'group': f['Group'], 'occurrences': 0,
                        'probability_sum': 0.0, 'base_match': False, 'options': []}
            groups.append(existing)
            new_group = True
        else:
            new_group = False
        existing['occurrences'] += 1
        existing['probability_sum'] = E['f32'](existing['probability_sum'] + E['probability'](f['Probability']))
        existing['base_match'] |= f['SelectToMatchBase'] == 'true'
        for option in layer['options']:
            b = option['palette']
            name = option['fields']['Name']
            selector, family = E['CHANNELS'].index(b['ColourAlt']), families[b['Palette']]
            # Palette Index is retained from the first option but excluded from
            # the observed equivalence test. Initial-layer options are appended.
            found = None if new_group else next((o for o in existing['options'] if
                    (o['name'], o['selector'], o['family_index']) == (name, selector, family)), None)
            if found is None:
                found = {'name': name, 'selector': selector, 'index': int(b['Index']),
                         'family_index': family, 'occurrences': 0, 'probability_sum': 0.0}
                existing['options'].append(found)
            found['occurrences'] += 1
            found['probability_sum'] = E['f32'](found['probability_sum'] + E['probability'](option['fields']['Probability']))
    return groups


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--asset', action='append', required=True)
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--emulator-tools', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    exe, corpus, output = args.executable.resolve(), args.corpus.resolve(), args.output.resolve()
    if not 1 <= len(args.asset) <= 16 or output.exists() or any(output.is_relative_to(p) for p in
            (exe.parent.parent, corpus, Path(__file__).resolve().parents[2])):
        parser.error('Require 1..16 assets and new external output')
    if exe.stat().st_size > 128*1024*1024:
        parser.error('Executable exceeds byte budget')
    raw = exe.read_bytes()
    if hashlib.sha256(raw).hexdigest() != EXE_HASH:
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
        data = read(begin, end-begin)
        instructions = list(decoder.disasm(data, BASE+begin))
        if sum(i.size for i in instructions) != len(data):
            raise ValueError('Incomplete code decoding')
        for instruction in instructions:
            if instruction.mnemonic in ('syscall', 'sysenter', 'int', 'in', 'out'):
                raise ValueError('External execution rejected')
            for op in instruction.operands:
                if op.type == X86_OP_MEM and op.mem.base == X86_REG_RIP:
                    rva = instruction.address + instruction.size + op.mem.disp - BASE
                    constants[rva] = read(rva, max(op.size, 16))
        code[begin] = data
    palette = E['B']['load_base'](corpus)
    families = {row['family']: i for i, row in enumerate(E['B']['generate'](7, palette))}
    sources = E['T']['inspect'](corpus, args.asset)['sources']
    cases = []
    identifier = runpy.run_path(str(Path(__file__).with_name('emulate-texture-selection.py')))['identifier']
    for source in sources:
        if source['status'] != 'inspected':
            raise ValueError('Texture source unavailable')
        original = [l for l in source['layers'] if l['options']]
        for profile in ('declared', 'repeated', 'changed_index_weight_group', 'changed_selector_family', 'duplicate_initial_options'):
            layers = copy.deepcopy(original)
            if profile == 'duplicate_initial_options':
                for layer in layers:
                    layer['options'] += copy.deepcopy(layer['options'])
            elif profile != 'declared':
                extra = copy.deepcopy(original)
                if profile == 'changed_index_weight_group':
                    for i, layer in enumerate(extra):
                        layer['fields']['Probability'] = '0.25'
                        layer['fields']['SelectToMatchBase'] = 'true'
                        for option in layer['options']:
                            option['palette']['Index'] = '17'
                            option['fields']['Probability'] = '0.125'
                        if i % 2:
                            layer['fields']['Group'] = 'TESTGROUP'
                elif profile == 'changed_selector_family':
                    for layer in extra:
                        for i, option in enumerate(layer['options']):
                            binding = option['palette']
                            if i % 2:
                                binding['Palette'] = 'Rock' if binding['Palette'] != 'Rock' else 'Paint'
                            else:
                                binding['ColourAlt'] = 'None' if binding['ColourAlt'] != 'None' else 'Primary'
                layers += extra
            expected = collect(layers, families)
            if len(layers) > 16 or len(expected) > 16 or any(len(g['options']) > 256 for g in expected):
                raise ValueError('Collection fixture budget exceeded')
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
                for at in range((BASE+begin)&~4095, BASE+begin+len(data), 4096): page(at, True)
                machine.mem_write(BASE+begin, data)
            for rva, data in constants.items():
                page(BASE+rva); page(BASE+rva+len(data)-1)
                machine.mem_write(BASE+rva, data)
            for rva in STUBS:
                page(BASE+rva, True); machine.mem_write(BASE+rva, b'\xc3')
            stop = 0x10000000
            page(stop, True)
            machine.mem_map(0x20000000, 1048576)
            machine.mem_map(0x30000000, 65536)
            cursor = 0x20000000

            def allocate(size):
                nonlocal cursor
                address = cursor; cursor += (size+15)&~15
                if cursor > 0x20100000: raise ValueError('Heap budget exceeded')
                return address
            def write(at, fmt, *v): machine.mem_write(at, struct.pack(fmt, *v))
            def unpack(at, fmt): return struct.unpack(fmt, machine.mem_read(at, struct.calcsize(fmt)))
            def get(name): return machine.reg_read(getattr(regs, 'UC_X86_REG_'+name))
            def put(name, value): machine.reg_write(getattr(regs, 'UC_X86_REG_'+name), value)
            collection, rows, context_name = allocate(16), allocate(16*0x40), allocate(32)
            write(collection, '<IIQ', 16, 0, rows)
            stub_calls = []

            def hook(uc, address, size, user):
                rva = address-BASE
                if rva not in STUBS:
                    if not any(BASE+b <= address < BASE+e for b,e in WINDOWS) and address != stop:
                        raise ValueError('Unapproved execution target '+hex(address))
                    return
                stub_calls.append(hex(rva))
                if len(stub_calls) > 512: raise ValueError('Stub budget exceeded')
                sp = get('RSP')
                if rva == 0x2bf5930:
                    count = unpack(get('RCX')+4, '<I')[0]
                    stride = unpack(sp+0x50, '<Q')[0]
                    index, src = unpack(sp+0x28,'<Q')[0], unpack(sp+0x30,'<Q')[0]
                    if stride != 0x38 or count > 256 or index != count:
                        raise ValueError('Unexpected append ABI')
                    new = allocate((count+1)*stride)
                    if count: machine.mem_write(new, bytes(machine.mem_read(get('R9'),count*stride)))
                    machine.mem_write(new+count*stride, bytes(machine.mem_read(src,stride)))
                    write(get('RCX'),'<II',count+1,count+1); put('RAX',new)
                elif rva == 0x2bf5d70:
                    count, stride = get('R8')&0xffffffff, get('R9')&0xffffffff
                    if count > 256 or stride != 0x38: raise ValueError('Unexpected copy ABI')
                    new = allocate(max(1,count)*stride)
                    if count: machine.mem_write(new,bytes(machine.mem_read(get('RDX'),count*stride)))
                    write(get('RCX'),'<II',count,count); put('RAX',new)
                put('RIP',unpack(sp,'<Q')[0]); put('RSP',sp+8)
            machine.hook_add(unicorn.UC_HOOK_CODE, hook)
            for layer in layers:
                f, options = layer['fields'], layer['options']
                declaration, opt = allocate(0x48), allocate(len(options)*0x60)
                machine.mem_write(declaration, identifier(f['Name'],16))
                machine.mem_write(declaration+0x20, identifier(f['Group'],16))
                write(declaration+0x30,'<QI',opt,len(options))
                write(declaration+0x40,'<fB',float(f['Probability']),f['SelectToMatchBase']=='true')
                for i,o in enumerate(options):
                    b=o['palette']; at=opt+i*0x60
                    machine.mem_write(at+0x10,identifier(o['fields']['Name'],32))
                    write(at+0x40,'<iiifI',E['CHANNELS'].index(b['ColourAlt']),int(b['Index']),
                          families[b['Palette']],float(o['fields']['Probability']),0)
                sp=0x3000f008
                write(sp,'<Q',stop); write(sp+0x28,'<Q',0); write(sp+0x30,'<Q',0)
                for name,value in {'RCX':declaration,'RDX':collection,'R8':context_name,'R9':0,'RSP':sp}.items(): put(name,value)
                machine.emu_start(BASE+0x62fba0,stop,timeout=200000,count=100000)
                if get('RIP') != stop: raise RuntimeError('Collector exceeded execution budget')
            actual=[]
            count=unpack(collection+4,'<I')[0]
            if count>16: raise ValueError('Native group count budget exceeded')
            def text(at,width): return bytes(machine.mem_read(at,width)).split(b'\0',1)[0].decode('ascii')
            for i in range(count):
                at=rows+i*0x40
                n, pointer=unpack(at+4,'<IQ')
                if n>256: raise ValueError('Native option budget exceeded')
                group={'layer':text(at+0x28,16),'group':text(at+0x18,16),
                       'occurrences':unpack(at+0x10,'<I')[0],'probability_sum':unpack(at+0x14,'<f')[0],
                       'base_match':bool(unpack(at+0x38,'<B')[0]),'options':[]}
                for j in range(n):
                    pos=pointer+j*0x38
                    selector,index,family,occurrences,probability=unpack(pos+0x20,'<iiiIf')
                    group['options'].append({'name':text(pos,32),'selector':selector,'index':index,
                        'family_index':family,'occurrences':occurrences,'probability_sum':probability})
                actual.append(group)
            if actual != expected:
                raise AssertionError('Collector divergence: '+json.dumps({'actual':actual,'expected':expected}))
            cases.append({'resource':source['resource'],'source_sha256':source['binary_sha256'],
                          'xml_sha256':source['xml_sha256'],
                          'profile':profile,'calls':len(layers),'groups':actual,'stub_calls':len(stub_calls)})
    report={'exe_sha256':EXE_HASH,'windows':[{'begin':hex(b),'end':hex(e),'sha256':hashlib.sha256(code[b]).hexdigest()} for b,e in WINDOWS],
            'cases':cases,'comparisons':{'cases':len(cases),'mismatches':0},'runtime_verified':False,
            'emulator':'Unicorn 2.1.4',
            'limits':{'heap_bytes':1048576,'stack_bytes':65536,'instructions_per_call':100000,
                      'timeout_microseconds_per_call':200000,'groups':16,'options_per_group':256,'stub_calls':512},
            'scope':'IgnoreName unlinked collector calls; repeated and altered index/weight/group/selector/family plus initial duplicate fixtures',
            'not_proven':['Native material resource order','Linked/name-filtered modes','Merged final selector','Rendered appearance or delivery']}
    output.parent.mkdir(parents=True,exist_ok=True)
    with output.open('x',encoding='utf-8') as stream: json.dump(report,stream,indent=2)
    print(json.dumps(report['comparisons']))


if __name__ == '__main__':
    main()
