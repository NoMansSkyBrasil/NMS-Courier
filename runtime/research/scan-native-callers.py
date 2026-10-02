"""Locate instruction-boundary-checked direct call/jump candidates in a pinned PE."""
import argparse
import bisect
import hashlib
import json
from pathlib import Path
import re
import runpy
import struct
import sys


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--sha256', required=True)
    parser.add_argument('--target', action='append', required=True, help='Exact target RVA in hex; maximum 16')
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    targets = {int(value, 16) for value in args.target}
    if not 1 <= len(targets) <= 16:
        parser.error('Select 1..16 target RVAs')
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(exe.parent.parent) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and outside game/repository')
    if exe.stat().st_size > 128*1024*1024:
        parser.error('Executable size budget exceeded')
    raw = exe.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    if digest != args.sha256.lower():
        parser.error('Executable fingerprint mismatch')
    sys.path.insert(0, str(args.python_tools))
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64
    helpers = runpy.run_path(str(Path(__file__).parents[1] / 'native/asi/locate-frontend-hooks.py'))
    sections = helpers['executable_sections'](raw)
    text = next(s for s in sections if s['name'] == '.text')
    pdata = next(s for s in sections if s['name'] == '.pdata')
    data = raw[pdata['raw_offset']:pdata['raw_offset']+pdata['raw_size']-pdata['raw_size']%12]
    ranges = sorted((a,b) for a,b,_ in struct.iter_unpack('<III',data) if a and b>a)
    starts = [a for a,_ in ranges]
    decoder = Cs(CS_ARCH_X86, CS_MODE_64)
    cache, records, seeds = {}, [], {}
    code = raw[text['raw_offset']:text['raw_offset']+text['raw_size']]
    for match in re.finditer(rb'[\xe8\xe9]....', code, re.DOTALL):
        site = text['virtual_address']+match.start()
        target = site+5+struct.unpack_from('<i',match.group(),1)[0]
        if target not in targets:
            continue
        index = bisect.bisect_right(starts,site)-1
        if index < 0 or not ranges[index][0] <= site < ranges[index][1]:
            continue
        begin,end = ranges[index]
        if begin not in cache:
            offset = text['raw_offset']+begin-text['virtual_address']
            if not text['raw_offset'] <= offset or end-begin > 65536:
                continue
            cache[begin] = {i.address:(i.mnemonic,i.op_str) for i in decoder.disasm(raw[offset:offset+end-begin],begin)}
        instruction = cache[begin].get(site)
        if not instruction or instruction[0] not in ('call','jmp') or instruction[1] != hex(target):
            continue
        if len(records) >= 256 or len(seeds) >= 48:
            raise ValueError('Caller budget exceeded; narrow the target set')
        records.append({'site':hex(site),'target':hex(target),'unwind_start':hex(begin),'kind':instruction[0]})
        seeds.setdefault(begin, 'Direct native caller candidate; semantic identity unverified')
    output.mkdir(parents=True)
    report = {'exe_sha256':digest,'runtime_verified':False,'records':records,
              'scope':'Direct E8/E9 edges in the first unwind fragment; indirect/split-function edges may be missed'}
    (output/'callers.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    (output/'seeds.tsv').write_text(''.join(f'{r:x}\t{label}\n' for r,label in seeds.items()),encoding='utf-8')
    print(json.dumps({'edges':len(records),'caller_fragments':len(seeds),'runtime_verified':False}))


if __name__ == '__main__':
    main()
