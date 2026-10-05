"""Find bounded, instruction-checked RIP data references independent of Ghidra metadata.

Only exact targets in a hash-pinned offline PE are searched. Indirect addressing,
relocations and unowned fragments remain explicit gaps, not negative proof.
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

HERE = Path(__file__).resolve().parent
HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'


def target_storage(raw, sections, target):
    """Never translate a virtual-only tail into unrelated file bytes."""
    section = next((s for s in sections if s['virtual_address'] <= target <
                    s['virtual_address'] + max(s['virtual_size'], s['raw_size'])), None)
    if section is None:
        return {'rva': hex(target), 'storage': 'outside_sections', 'hex': None}
    relative = target - section['virtual_address']
    if relative >= section['raw_size']:
        return {'rva': hex(target), 'section': section['name'], 'storage': 'zero_filled_virtual_tail', 'hex': None}
    size = min(16, section['raw_size'] - relative)
    offset = section['raw_offset'] + relative
    data = raw[offset:offset + size]
    if len(data) != size:
        raise ValueError('Incomplete file-backed target bytes')
    return {'rva': hex(target), 'section': section['name'], 'storage': 'file_backed', 'hex': data.hex()}


def displacement_candidates(code, text_rva, targets):
    """RIP ModRM followed by disp32; up to eight immediate bytes may follow."""
    found = []
    for match in re.finditer(rb'(?=[\x05\x0d\x15\x1d\x25\x2d\x35\x3d]....)', code, re.DOTALL):
        displacement = struct.unpack_from('<i', code, match.start() + 1)[0]
        end = text_rva + match.start() + 5
        for target in targets:
            if 0 <= target - end - displacement <= 8:
                found.append((text_rva + match.start(), target))
                if len(found) > 512:
                    raise ValueError('Data-reference candidate budget exceeded')
    return found


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('executable', 'python-tools', 'output'):
        parser.add_argument('--' + key, type=Path, required=True)
    parser.add_argument('--target', action='append', required=True, type=lambda x: int(x, 0))
    args = parser.parse_args()
    targets = set(args.target)
    if not 1 <= len(targets) <= 16 or any(not 0 <= t <= 0xffffffff for t in targets):
        parser.error('Require 1..16 bounded target RVAs')
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in (exe.parent.parent, HERE.parents[1])):
        parser.error('Require a new external output')
    if exe.stat().st_size > 128 * 1024**2:
        parser.error('Executable byte budget exceeded')
    raw = exe.read_bytes()
    if hashlib.sha256(raw).hexdigest() != HASH:
        parser.error('Executable fingerprint mismatch')
    helper = runpy.run_path(str(HERE.parent / 'native/asi/locate-frontend-hooks.py'))
    sections = helper['executable_sections'](raw)
    text = next(s for s in sections if s['name'] == '.text')
    pdata = next(s for s in sections if s['name'] == '.pdata')
    if text['raw_size'] > 64 * 1024**2:
        parser.error('Code byte budget exceeded')
    code = raw[text['raw_offset']:text['raw_offset'] + text['raw_size']]
    entries = sorted((b, e, u) for b, e, u in struct.iter_unpack('<III', raw[
        pdata['raw_offset']:pdata['raw_offset'] + pdata['raw_size'] - pdata['raw_size'] % 12]) if b and e > b)
    starts = [b for b, _, _ in entries]
    sys.path.insert(0, str(args.python_tools))
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64, CS_AC_READ, CS_AC_WRITE
    from capstone.x86_const import X86_OP_MEM, X86_REG_RIP
    decoder = Cs(CS_ARCH_X86, CS_MODE_64); decoder.detail = True
    chain = runpy.run_path(str(HERE / 'inspect-native-fragments.py'))['unwind_chain']
    candidates = displacement_candidates(code, text['virtual_address'], targets)
    decoded, skipped, records, seen = {}, [], [], set()
    for site, target in candidates:
        pos = bisect.bisect_right(starts, site) - 1
        if pos < 0 or not entries[pos][0] <= site < entries[pos][1]:
            skipped.append({'site': hex(site), 'reason': 'no_unwind_owner'}); continue
        begin, end, unwind = entries[pos]
        if begin not in decoded:
            if end - begin > 16384:
                decoded[begin] = None
            else:
                offset = begin - text['virtual_address']
                if not 0 <= offset <= len(code) - (end - begin):
                    raise ValueError('Owner outside file-backed code')
                instructions = list(decoder.disasm(code[offset:offset + end - begin], begin))
                decoded[begin] = instructions if sum(i.size for i in instructions) == end - begin else None
        if decoded[begin] is None:
            skipped.append({'site': hex(site), 'reason': 'owner_decode_budget_or_gap'}); continue
        for instruction in decoded[begin]:
            if not instruction.address <= site < instruction.address + instruction.size:
                continue
            for operand in instruction.operands:
                if operand.type != X86_OP_MEM or operand.mem.base != X86_REG_RIP or (
                        instruction.address + instruction.size + operand.mem.disp != target):
                    continue
                key = instruction.address, target
                if key in seen: continue
                seen.add(key)
                records.append({'target': hex(target), 'site': hex(instruction.address),
                    'fragment': hex(begin), 'root': chain(raw, sections, (begin, end, unwind))[-1]['begin'],
                    'instruction': instruction.mnemonic + ' ' + instruction.op_str,
                    'access': ('read' if operand.access & CS_AC_READ else '') + ('write' if operand.access & CS_AC_WRITE else ''),
                    'size': operand.size})
    report = {'executable_sha256': HASH, 'source_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'targets': [hex(t) for t in sorted(targets)],
        'target_storage': [target_storage(raw, sections, t) for t in sorted(targets)],
        'candidate_count': len(candidates), 'records': records,
        'skipped_candidates': skipped, 'runtime_verified': False,
        'limitations': ['Exact RIP operands only; register-based/absolute/relocated writes are not covered.',
                        'Incomplete/no-unwind owners remain skipped; absence of a writer is not proof of immutability.',
                        'Zero-filled virtual tails describe initial PE storage, not runtime initialized values.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream: json.dump(report, stream, indent=2)
    print(json.dumps({'candidates': len(candidates), 'references': len(records), 'skipped': len(skipped)}))


if __name__ == '__main__': main()
