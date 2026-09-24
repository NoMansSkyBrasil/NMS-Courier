"""Read exact-build NMS inventory headers without changing process or save data."""

from __future__ import annotations

import argparse
import ctypes
import hashlib
import json
import os
import struct
import sys
from ctypes import wintypes
from typing import Callable


EXPECTED_EXE_SHA256 = "b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb"
APPLICATION_DATA_POINTER_RVA = 0x06E7AAE8
GAME_STATE_OFFSET = 0x0E70
PLAYER_STATE_OFFSET = 0xAAD0
INVENTORIES_OFFSET = 0x0910
INVENTORY_STORE_SIZE = 0x248
REALITY_MANAGER_OFFSET = 0x60
INVENTORY_TABLE_POINTER_OFFSET = 0x1B8
FREIGHTER_LARGE_GENERATION_OFFSET = 0x5E0 + 0x1D * 0x54
CLASS_PROBABILITY_OFFSET = 0x1A54
FRONTEND_MANAGER_OFFSET = 0x849020
FRONTEND_PAGE_QUEUE_OFFSET = 0x5BD28
INVENTORY_NAMES = {0: "Personal", 7: "Freighter", 8: "Freighter_TechOnly", 9: "Freighter_Cargo"}
CLASS_NAMES = {0: "C", 1: "B", 2: "A", 3: "S"}
SPECIAL_SLOT_NAMES = {
    0: "Broken", 1: "TechOnly", 2: "Cargo", 3: "BlockedByBrokenTech", 4: "TechBonus"
}
PROCESS_QUERY_INFORMATION = 0x0400
PROCESS_VM_READ = 0x0010
LIST_MODULES_ALL = 0x03


def inspect_store(data: bytes, index: int) -> dict[str, int | str]:
    if len(data) != INVENTORY_STORE_SIZE:
        raise ValueError("Incomplete inventory header")
    width, height, capacity = struct.unpack_from("<hhh", data, 0x80)
    vector_size = struct.unpack_from("<I", data, 0x8C)[0]
    layout_slots = struct.unpack_from("<i", data, 0xF4)[0]
    auto_max = data[0xF8]
    inventory_class = struct.unpack_from("<I", data, 0x100)[0]
    empty_legacy_freighter = index == 7 and width == height == capacity == 0
    if not (empty_legacy_freighter or
            (1 <= width <= 64 and 1 <= height <= 64 and 0 <= capacity <= 4096)):
        raise ValueError(f"Implausible inventory dimensions for index {index}")
    if vector_size > 4096 or inventory_class not in CLASS_NAMES or auto_max not in (0, 1):
        raise ValueError(
            f"Implausible inventory fields for index {index}: "
            f"elements={vector_size}, class={inventory_class}"
        )
    if height > 16:
        raise ValueError(f"Inventory grid exceeds the 16 observable slot-mask rows for index {index}")
    valid_slot_mask = int.from_bytes(data[:0x80], "little")
    row_mask = (1 << width) - 1
    valid_bits_in_grid = sum(
        ((valid_slot_mask >> (row * 64)) & row_mask).bit_count()
        for row in range(height)
    )
    return {
        "index": index,
        "name": INVENTORY_NAMES[index],
        "width": width,
        "height": height,
        "capacity": capacity,
        "valid_slot_bits_in_grid": valid_bits_in_grid,
        "valid_slot_bits_outside_grid": valid_slot_mask.bit_count() - valid_bits_in_grid,
        "stored_elements": vector_size,
        "layout_slots": layout_slots,
        "auto_max_enabled": bool(auto_max),
        "class": CLASS_NAMES[inventory_class],
    }


def inspect_special_slots(data: bytes, read: Callable[[int, int], bytes]) -> dict[str, object]:
    allocated, count, address = struct.unpack_from("<IIQ", data, 0xC0)
    width, height = struct.unpack_from("<hh", data, 0x80)
    if count > allocated or count > 4096 or (count and address == 0):
        raise ValueError("Implausible special-slot vector")
    counts = {name: 0 for name in SPECIAL_SLOT_NAMES.values()}
    coordinates = {name: set() for name in SPECIAL_SLOT_NAMES.values()}
    in_grid = {name: set() for name in SPECIAL_SLOT_NAMES.values()}
    if count:
        raw = read(address, count * 12)
        for offset in range(0, len(raw), 12):
            x, y, slot_type = struct.unpack_from("<iiI", raw, offset)
            if slot_type not in SPECIAL_SLOT_NAMES:
                raise ValueError(f"Unknown special-slot type: {slot_type}")
            name = SPECIAL_SLOT_NAMES[slot_type]
            counts[name] += 1
            coordinates[name].add((x, y))
            if 0 <= x < width and 0 <= y < height:
                in_grid[name].add((x, y))
    return {
        "special_slots_count": count,
        "special_slot_types": counts,
        "special_slot_unique_coordinates": {
            name: len(value) for name, value in coordinates.items()
        },
        "special_slot_unique_in_grid": {
            name: len(value) for name, value in in_grid.items()
        },
    }


def inspect_process(pid: int, candidate_address: int | None = None,
                    candidate_offset: int | None = None,
                    frontend_queue: bool = False) -> dict[str, object]:
    if os.name != "nt" or ctypes.sizeof(ctypes.c_void_p) != 8:
        raise RuntimeError("This diagnostic requires 64-bit Windows Python")
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

    handle = kernel32.OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, False, pid)
    if not handle:
        raise OSError(ctypes.get_last_error(), "OpenProcess failed")
    try:
        modules = (ctypes.c_void_p * 1024)()
        needed = wintypes.DWORD()
        if not psapi.EnumProcessModulesEx(
            handle, modules, ctypes.sizeof(modules), ctypes.byref(needed), LIST_MODULES_ALL
        ):
            raise OSError(ctypes.get_last_error(), "EnumProcessModulesEx failed")
        if needed.value > ctypes.sizeof(modules):
            raise RuntimeError("Module list exceeded diagnostic capacity")
        executable_base = None
        executable_path = None
        for module in modules[: needed.value // ctypes.sizeof(ctypes.c_void_p)]:
            path_buffer = ctypes.create_unicode_buffer(32768)
            if not psapi.GetModuleFileNameExW(handle, module, path_buffer, len(path_buffer)):
                continue
            if os.path.basename(path_buffer.value).lower() == "nms.exe":
                executable_base = module
                executable_path = path_buffer.value
                break
        if executable_base is None or executable_path is None:
            raise RuntimeError("NMS.exe module was not found in the selected process")
        digest = hashlib.sha256()
        with open(executable_path, "rb") as executable:
            for chunk in iter(lambda: executable.read(1024 * 1024), b""):
                digest.update(chunk)
        if digest.hexdigest() != EXPECTED_EXE_SHA256:
            raise RuntimeError("The selected NMS.exe does not match the verified build")

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
            raise RuntimeError("Application data is not ready; load a save first")
        if candidate_offset is not None:
            candidate_address = application_data + candidate_offset
        player_state = application_data + GAME_STATE_OFFSET + PLAYER_STATE_OFFSET
        inventories = []
        for index in INVENTORY_NAMES:
            address = player_state + INVENTORIES_OFFSET + index * INVENTORY_STORE_SIZE
            store_data = read(address, INVENTORY_STORE_SIZE)
            entry = inspect_store(store_data, index)
            entry.update(inspect_special_slots(store_data, read))
            entry["address"] = hex(address)
            inventories.append(entry)
        if inventories[0]["width"] != 10 or inventories[0]["height"] != 12:
            raise RuntimeError("Personal inventory did not match the previously verified layout")
        inventory_table = struct.unpack(
            "<Q", read(application_data + REALITY_MANAGER_OFFSET + INVENTORY_TABLE_POINTER_OFFSET, 8)
        )[0]
        if inventory_table == 0:
            raise RuntimeError("Inventory table is not ready")
        generation = read(inventory_table + FREIGHTER_LARGE_GENERATION_OFFSET, 0x54)
        max_slots = struct.unpack_from("<i", generation, 0x40)[0]
        max_tech_slots = struct.unpack_from("<i", generation, 0x44)[0]
        min_slots = struct.unpack_from("<i", generation, 0x4C)[0]
        min_tech_slots = struct.unpack_from("<i", generation, 0x50)[0]
        if (min_slots, max_slots, min_tech_slots, max_tech_slots) != (35, 48, 18, 30):
            raise RuntimeError("Freighter generation values did not match the verified game table")
        class_probability_data = read(inventory_table + CLASS_PROBABILITY_OFFSET, 0x40)
        class_probabilities = {
            name: list(struct.unpack_from("<4f", class_probability_data, index * 0x10))
            for index, name in enumerate(("Poor", "Average", "Wealthy", "Pirate"))
        }
        if class_probabilities["Poor"] != [60.0, 30.0, 10.0, 0.0]:
            raise RuntimeError("Class probabilities did not match the verified game table")
        result = {
            "pid": pid,
            "exe_sha256": digest.hexdigest(),
            "inventories": inventories,
            "freighter_large_generation": {
                "min_slots": min_slots,
                "max_slots": max_slots,
                "min_tech_slots": min_tech_slots,
                "max_tech_slots": max_tech_slots,
            },
            "class_probabilities": class_probabilities,
        }
        if frontend_queue:
            queue_data = read(
                application_data + FRONTEND_MANAGER_OFFSET + FRONTEND_PAGE_QUEUE_OFFSET,
                0x34,
            )
            next_index = struct.unpack_from("<i", queue_data, 0x30)[0]
            if not 0 <= next_index < 3:
                raise RuntimeError("Frontend page queue index is outside the observed ring")
            result["frontend_page_queue"] = {
                "next_index": next_index,
                "entries": [
                    {
                        "page": struct.unpack_from("<i", queue_data, index * 16)[0],
                        "start_delay": struct.unpack_from("<f", queue_data, index * 16 + 4)[0],
                        "interaction": hex(struct.unpack_from("<Q", queue_data, index * 16 + 8)[0]),
                    }
                    for index in range(3)
                ],
            }
        if candidate_address is not None:
            candidate = []
            for index in (7, 8, 9):
                address = candidate_address + (index - 7) * INVENTORY_STORE_SIZE
                try:
                    store_data = read(address, INVENTORY_STORE_SIZE)
                    entry = inspect_store(store_data, index)
                    entry.update(inspect_special_slots(store_data, read))
                    entry["name"] = f"FrontendStore_{index - 7}"
                    entry["address"] = hex(address)
                    candidate.append(entry)
                except (OSError, ValueError):
                    continue
            result["candidate_inventories"] = candidate
        return result
    finally:
        kernel32.CloseHandle(handle)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pid", type=int, required=True)
    parser.add_argument("--candidate-address", type=lambda value: int(value, 0))
    parser.add_argument("--candidate-offset", type=lambda value: int(value, 0))
    parser.add_argument("--frontend-queue", action="store_true")
    args = parser.parse_args()
    try:
        print(json.dumps(inspect_process(args.pid, args.candidate_address,
                                         args.candidate_offset, args.frontend_queue), indent=2))
    except (OSError, RuntimeError, ValueError) as error:
        print(f"freighter_read_only_inspection_failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
