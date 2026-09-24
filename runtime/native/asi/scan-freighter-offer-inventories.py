"""Find plausible freighter inventory headers in an exact-build live process."""

from __future__ import annotations

import argparse
import ctypes
import hashlib
import json
import os
import struct
import time
from ctypes import wintypes


EXPECTED_SHA256 = "b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb"
READ_ACCESS = 0x0400 | 0x0010
MEM_COMMIT = 0x1000
READABLE = {0x02, 0x04, 0x08, 0x20, 0x40, 0x80}
HEADER = b"\x07\x00\x05\x00\x23\x00"


class MemoryBasicInformation(ctypes.Structure):
    _fields_ = [
        ("BaseAddress", ctypes.c_void_p),
        ("AllocationBase", ctypes.c_void_p),
        ("AllocationProtect", wintypes.DWORD),
        ("PartitionId", wintypes.WORD),
        ("RegionSize", ctypes.c_size_t),
        ("State", wintypes.DWORD),
        ("Protect", wintypes.DWORD),
        ("Type", wintypes.DWORD),
    ]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pid", type=int, required=True)
    parser.add_argument("--max-seconds", type=int, default=35)
    args = parser.parse_args()
    if os.name != "nt" or ctypes.sizeof(ctypes.c_void_p) != 8:
        raise RuntimeError("This diagnostic requires 64-bit Windows")
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    psapi = ctypes.WinDLL("psapi", use_last_error=True)
    kernel.OpenProcess.argtypes = (wintypes.DWORD, wintypes.BOOL, wintypes.DWORD)
    kernel.OpenProcess.restype = wintypes.HANDLE
    kernel.CloseHandle.argtypes = (wintypes.HANDLE,)
    kernel.VirtualQueryEx.argtypes = (
        wintypes.HANDLE, ctypes.c_void_p, ctypes.POINTER(MemoryBasicInformation),
        ctypes.c_size_t,
    )
    kernel.VirtualQueryEx.restype = ctypes.c_size_t
    kernel.ReadProcessMemory.argtypes = (
        wintypes.HANDLE, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_size_t,
        ctypes.POINTER(ctypes.c_size_t),
    )
    kernel.ReadProcessMemory.restype = wintypes.BOOL
    psapi.GetModuleFileNameExW.argtypes = (
        wintypes.HANDLE, ctypes.c_void_p, wintypes.LPWSTR, wintypes.DWORD,
    )
    psapi.GetModuleFileNameExW.restype = wintypes.DWORD
    handle = kernel.OpenProcess(READ_ACCESS, False, args.pid)
    if not handle:
        raise OSError(ctypes.get_last_error(), "OpenProcess failed")
    try:
        path_buffer = ctypes.create_unicode_buffer(32768)
        if not psapi.GetModuleFileNameExW(handle, None, path_buffer, len(path_buffer)):
            raise OSError(ctypes.get_last_error(), "GetModuleFileNameExW failed")
        digest = hashlib.sha256()
        with open(path_buffer.value, "rb") as executable:
            for block in iter(lambda: executable.read(1024 * 1024), b""):
                digest.update(block)
        if digest.hexdigest() != EXPECTED_SHA256:
            raise RuntimeError("The executable is not the verified build")

        start = time.monotonic()
        address = 0x10000
        scanned = 0
        matches: list[dict[str, object]] = []
        block_size = 8 * 1024 * 1024
        while address < 0x7FFF00000000 and time.monotonic() - start < args.max_seconds:
            info = MemoryBasicInformation()
            if not kernel.VirtualQueryEx(handle, ctypes.c_void_p(address),
                                         ctypes.byref(info), ctypes.sizeof(info)):
                break
            base = info.BaseAddress or address
            region_end = base + info.RegionSize
            if region_end <= address:
                break
            if info.State == MEM_COMMIT and info.Protect & 0xFF in READABLE and not info.Protect & 0x100:
                cursor = max(base, address)
                while cursor < region_end and time.monotonic() - start < args.max_seconds:
                    size = min(block_size, region_end - cursor)
                    buffer = ctypes.create_string_buffer(size)
                    count = ctypes.c_size_t()
                    if kernel.ReadProcessMemory(handle, ctypes.c_void_p(cursor),
                                                buffer, size, ctypes.byref(count)):
                        data = buffer.raw[:count.value]
                        scanned += len(data)
                        position = data.find(HEADER)
                        while position != -1:
                            store_start = cursor + position - 0x80
                            if position >= 0x80 and position + 0x1C8 <= len(data):
                                store = data[position - 0x80:position - 0x80 + 0x248]
                                valid = int.from_bytes(store[:0x80], "little").bit_count()
                                inventory_class = struct.unpack_from("<I", store, 0x100)[0]
                                if valid == 35 and inventory_class <= 3:
                                    name = store[0x104:0x204].split(b"\0", 1)[0]
                                    matches.append({
                                        "address": hex(store_start),
                                        "class": "CBAS"[inventory_class],
                                        "valid_slots": valid,
                                        "name": name.decode("ascii", errors="replace")[:80],
                                    })
                            position = data.find(HEADER, position + 1)
                    cursor += size
            address = region_end
        print(json.dumps({"pid": args.pid, "scanned_bytes": scanned,
                          "seconds": round(time.monotonic() - start, 2),
                          "matches": matches[:100], "truncated": len(matches) > 100},
                         indent=2))
    finally:
        kernel.CloseHandle(handle)


if __name__ == "__main__":
    main()
