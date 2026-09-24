"""Disassemble a function in the pinned NMS executable for offline research."""

from __future__ import annotations

import argparse
import hashlib
import runpy
import struct
from pathlib import Path


EXPECTED_SHA256 = "b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("executable", type=Path)
    parser.add_argument("rva", type=lambda value: int(value, 0))
    parser.add_argument("--radius", type=int, default=24)
    args = parser.parse_args()
    if args.radius < 1 or args.radius > 300:
        parser.error("radius must be between 1 and 300")

    data = args.executable.read_bytes()
    if hashlib.sha256(data).hexdigest() != EXPECTED_SHA256:
        parser.error("executable hash does not match the pinned build")

    try:
        from capstone import CS_ARCH_X86, CS_MODE_64, Cs
    except ImportError:
        parser.error("Capstone 5.0.5 is required on this development machine")

    locator = runpy.run_path(str(Path(__file__).with_name("locate-frontend-hooks.py")))
    sections = locator["executable_sections"](data)
    text_section = next(section for section in sections if section["name"] == ".text")
    pdata_section = next(section for section in sections if section["name"] == ".pdata")
    text_start = int(text_section["virtual_address"])
    text_end = text_start + int(text_section["raw_size"])
    if not text_start <= args.rva < text_end:
        parser.error("RVA is outside .text")

    pdata_start = int(pdata_section["raw_offset"])
    pdata_end = pdata_start + int(pdata_section["raw_size"])
    bounds = None
    for offset in range(pdata_start, pdata_end, 12):
        start, end, _unwind = struct.unpack_from("<III", data, offset)
        if text_start <= start <= args.rva < end <= text_end:
            if bounds is None or end - start < bounds[1] - bounds[0]:
                bounds = (start, end)
    has_unwind_entry = bounds is not None
    if bounds is None:
        bounds = (args.rva, min(args.rva + 0x200, text_end))
    start, end = bounds
    file_offset = int(text_section["raw_offset"]) + start - text_start
    function_bytes = data[file_offset:file_offset + end - start]
    decoder = Cs(CS_ARCH_X86, CS_MODE_64)
    instructions = list(decoder.disasm(function_bytes, start))
    if not instructions:
        parser.error("function bytes could not be disassembled")
    target_index = min(
        range(len(instructions)),
        key=lambda index: abs(instructions[index].address - args.rva),
    )
    if instructions[target_index].address != args.rva:
        parser.error("RVA is not an instruction boundary in this linear decode")
    label = "function" if has_unwind_entry else "unwind_uncovered_slice"
    print(f"{label}={start:#x}..{end:#x} target={args.rva:#x} sha256={EXPECTED_SHA256}")
    for instruction in instructions[
        max(0, target_index - args.radius):target_index + args.radius + 1
    ]:
        mark = ">" if instruction.address == args.rva else " "
        print(f"{mark} {instruction.address:#010x} {instruction.mnemonic:8} {instruction.op_str}")


if __name__ == "__main__":
    main()
