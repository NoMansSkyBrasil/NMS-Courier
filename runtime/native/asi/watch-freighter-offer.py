"""Watch frontend queue and offer headers on the pinned build without writing game memory."""

from __future__ import annotations

import argparse
import ctypes
import hashlib
import json
import os
import struct
import time
from ctypes import wintypes


EXPECTED_EXE_SHA256 = "b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb"
APPLICATION_DATA_POINTER_RVA = 0x06E7AAE8
FRONTEND_MANAGER_OFFSET = 0x849020
FRONTEND_PAGE_QUEUE_OFFSET = 0x5BD28
OFFER_MAIN_OFFSET = 0x864930
INVENTORY_STORE_SIZE = 0x248


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pid", type=int, required=True)
    parser.add_argument("--seconds", type=int, default=45)
    parser.add_argument("--poll-ms", type=int, default=5)
    args = parser.parse_args()
    if not 1 <= args.seconds <= 120 or not 1 <= args.poll_ms <= 100:
        parser.error("seconds must be 1..120 and poll-ms must be 1..100")
    if os.name != "nt" or ctypes.sizeof(ctypes.c_void_p) != 8:
        parser.error("requires 64-bit Windows Python")

    kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
    psapi = ctypes.WinDLL("psapi", use_last_error=True)
    kernel32.OpenProcess.argtypes = (wintypes.DWORD, wintypes.BOOL, wintypes.DWORD)
    kernel32.OpenProcess.restype = wintypes.HANDLE
    kernel32.CloseHandle.argtypes = (wintypes.HANDLE,)
    kernel32.CloseHandle.restype = wintypes.BOOL
    kernel32.ReadProcessMemory.argtypes = (
        wintypes.HANDLE, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_size_t,
        ctypes.POINTER(ctypes.c_size_t),
    )
    kernel32.ReadProcessMemory.restype = wintypes.BOOL
    psapi.EnumProcessModulesEx.argtypes = (
        wintypes.HANDLE, ctypes.c_void_p, wintypes.DWORD,
        ctypes.POINTER(wintypes.DWORD), wintypes.DWORD,
    )
    psapi.EnumProcessModulesEx.restype = wintypes.BOOL
    psapi.GetModuleFileNameExW.argtypes = (
        wintypes.HANDLE, ctypes.c_void_p, wintypes.LPWSTR, wintypes.DWORD,
    )
    psapi.GetModuleFileNameExW.restype = wintypes.DWORD

    handle = kernel32.OpenProcess(0x0400 | 0x0010, False, args.pid)
    if not handle:
        raise OSError(ctypes.get_last_error(), "OpenProcess failed")
    try:
        modules = (ctypes.c_void_p * 1024)()
        needed = wintypes.DWORD()
        if not psapi.EnumProcessModulesEx(
            handle, modules, ctypes.sizeof(modules), ctypes.byref(needed), 0x03
        ) or needed.value > ctypes.sizeof(modules):
            raise OSError(ctypes.get_last_error(), "Cannot enumerate process modules")
        executable_base = None
        executable_path = None
        for module in modules[: needed.value // ctypes.sizeof(ctypes.c_void_p)]:
            path = ctypes.create_unicode_buffer(32768)
            if psapi.GetModuleFileNameExW(handle, module, path, len(path)):
                if os.path.basename(path.value).lower() == "nms.exe":
                    executable_base = module
                    executable_path = path.value
                    break
        if executable_base is None or executable_path is None:
            raise RuntimeError("NMS.exe module was not found")
        digest = hashlib.sha256()
        with open(executable_path, "rb") as executable:
            for chunk in iter(lambda: executable.read(1024 * 1024), b""):
                digest.update(chunk)
        if digest.hexdigest() != EXPECTED_EXE_SHA256:
            raise RuntimeError("Executable hash does not match the pinned build")

        def read(address: int, size: int) -> bytes:
            buffer = ctypes.create_string_buffer(size)
            transferred = ctypes.c_size_t()
            if not kernel32.ReadProcessMemory(
                handle, ctypes.c_void_p(address), buffer, size, ctypes.byref(transferred)
            ) or transferred.value != size:
                raise OSError(ctypes.get_last_error(), f"ReadProcessMemory failed at 0x{address:x}")
            return buffer.raw

        application_data = struct.unpack(
            "<Q", read(executable_base + APPLICATION_DATA_POINTER_RVA, 8)
        )[0]
        if application_data == 0:
            raise RuntimeError("Load a save before starting the frontend watcher")

        def offer_header(address: int) -> dict[str, int]:
            data = read(address, 0x104)
            width, height, capacity = struct.unpack_from("<hhh", data, 0x80)
            element_count = struct.unpack_from("<I", data, 0x8C)[0]
            inventory_class = struct.unpack_from("<I", data, 0x100)[0]
            if not (0 <= width <= 64 and 0 <= height <= 64 and
                    0 <= capacity <= 4096 and element_count <= 4096 and
                    inventory_class <= 3):
                raise RuntimeError("Frontend inventory header is not plausible")
            return {
                "width": width,
                "height": height,
                "capacity": capacity,
                "elements": element_count,
                "class": inventory_class,
            }

        start = time.monotonic()
        deadline = start + args.seconds
        previous = None
        samples = 0
        changes = 0
        while time.monotonic() < deadline:
            queue = read(
                application_data + FRONTEND_MANAGER_OFFSET + FRONTEND_PAGE_QUEUE_OFFSET,
                0x34,
            )
            next_index = struct.unpack_from("<i", queue, 0x30)[0]
            if not 0 <= next_index < 3:
                raise RuntimeError("Frontend queue index is outside the observed ring")
            pages = [struct.unpack_from("<i", queue, index * 16)[0]
                     for index in range(3)]
            offer_stores = [
                offer_header(application_data + OFFER_MAIN_OFFSET + index * INVENTORY_STORE_SIZE)
                for index in range(3)
            ]
            state = {"pages": pages, "next_index": next_index,
                     "offer_stores": offer_stores}
            samples += 1
            if state != previous:
                print(json.dumps({"elapsed_ms": round((time.monotonic() - start) * 1000),
                                  **state}), flush=True)
                previous = state
                changes += 1
            time.sleep(args.poll_ms / 1000)
        print(json.dumps({"result": "observation_complete", "pid": args.pid,
                          "samples": samples, "changes": changes,
                          "mutation": False}), flush=True)
    finally:
        kernel32.CloseHandle(handle)


if __name__ == "__main__":
    main()
