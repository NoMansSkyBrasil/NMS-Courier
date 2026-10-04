"""Bounded build-180383 resource-table family and instruction-checked LEA scan.

Pointer similarity is only a candidate heuristic, not a type or callable ABI.
No game execution, corpus extraction or whole-program analysis.
"""
import argparse
import bisect
import hashlib
import json
from pathlib import Path
import re
import runpy
import struct
import sys

EXE_HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
BASE = 0x140000000


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in (exe.parent.parent, Path(__file__).resolve().parents[2])):
        parser.error('Output must be new and outside game/repository')
    if exe.stat().st_size > 128*1024*1024:
        parser.error('Executable byte budget exceeded')
    raw = exe.read_bytes()
    if hashlib.sha256(raw).hexdigest() != EXE_HASH:
        parser.error('Executable fingerprint mismatch')
    helpers = runpy.run_path(str(Path(__file__).parents[1]/'native/asi/locate-frontend-hooks.py'))
    sections = helpers['executable_sections'](raw)
    text, data, pdata = [next(s for s in sections if s['name'] == name) for name in ('.text','.rdata','.pdata')]
    if data['raw_size'] > 64*1024*1024:
        parser.error('Read-only data budget exceeded')
    values = struct.unpack('<'+'Q'*(data['raw_size']//8), raw[data['raw_offset']:data['raw_offset']+data['raw_size']//8*8])
    baseline_at = (0x352cf80-data['virtual_address'])//8
    baseline = values[baseline_at:baseline_at+12]
    if baseline[10] != BASE+0x2d62450:
        parser.error('Resource-family anchor mismatch')
    tables = []
    for i,value in enumerate(values):
        if value != baseline[10] or i < 10 or i+18 >= len(values):
            continue
        start = i-10
        tables.append({'table':hex(data['virtual_address']+start*8),
                       'shared_prefix_slots':sum(a==b for a,b in zip(values[start:start+12],baseline)),
                       'slot_d8':hex(values[start+27]-BASE),
                       'slot_is_code':BASE+text['virtual_address'] <= values[start+27] < BASE+text['virtual_address']+text['raw_size']})
        if len(tables) > 64:
            raise ValueError('Table candidate budget exceeded')
    targets = {int(row['table'],16) for row in tables if row['slot_d8']=='0x18dae90'}
    entries = sorted((a,b,c) for a,b,c in struct.iter_unpack('<III',raw[pdata['raw_offset']:pdata['raw_offset']+pdata['raw_size']//12*12]) if a and b>a)
    starts = [a for a,b,c in entries]
    chain = runpy.run_path(str(Path(__file__).with_name('inspect-native-fragments.py')))['unwind_chain']
    sys.path.insert(0,str(args.python_tools))
    from capstone import Cs,CS_ARCH_X86,CS_MODE_64
    decoder = Cs(CS_ARCH_X86,CS_MODE_64)
    code = raw[text['raw_offset']:text['raw_offset']+text['raw_size']]
    references = []
    for match in re.finditer(rb'[\x48\x4c]\x8d.....',code,re.DOTALL):
        if match.group()[2]&0xc7 != 5:
            continue
        site = text['virtual_address']+match.start()
        target = site+7+struct.unpack_from('<i',match.group(),3)[0]
        if target not in targets:
            continue
        position = bisect.bisect_right(starts,site)-1
        if position < 0:
            continue
        begin,end,unwind = entries[position]
        if not begin <= site < end or end-begin > 16384:
            continue
        offset = text['raw_offset']+begin-text['virtual_address']
        instructions = list(decoder.disasm(raw[offset:offset+end-begin],begin))
        if sum(item.size for item in instructions) != end-begin:
            raise ValueError('Incomplete candidate owner decoding')
        found = next((item for item in instructions if item.address==site and item.size==7),None)
        if found is not None:
            references.append({'target':hex(target),'site':hex(site),'fragment':hex(begin),
                               'root':chain(raw,sections,entries[position])[-1]['begin'],
                               'instruction':found.op_str})
            if len(references)>128:
                raise ValueError('Reference budget exceeded')
    report = {'exe_sha256':EXE_HASH,'candidate_heuristic':True,'tables':tables,
              'references':references,'runtime_verified':False,
              'limitations':['Shared pointer slots do not identify concrete types','Only RIP-relative LEA and unwind-covered owners are checked']}
    output.parent.mkdir(parents=True,exist_ok=True)
    with output.open('x',encoding='utf-8') as stream:
        json.dump(report,stream,indent=2)
    print(json.dumps({'tables':len(tables),'references':len(references)}))


if __name__ == '__main__':
    main()
