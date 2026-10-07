"""Read-only scan of a running game process for inventory store structures.

Opens the process with query and read rights only and never writes to it.
Looks through committed private read-write memory for the store layout
established on build 180836: sixteen 64-bit valid-slot rows at +0, width,
height and slot count as 16-bit values at +0x80, class at +0x100. A candidate
must have rows that fit its width, no rows beyond its height, and a valid
slot count equal to the number of set bits. Reports each candidate's address,
grid, class, special-slot count and its offset from the game manager object,
so owned ship, multitool and exosuit stores can be recognized by comparing
with what the game shows. Research tool; pinned to the build by executable
hash.
"""
import argparse
import ctypes
import ctypes.wintypes as wt
import hashlib
import json
from pathlib import Path
import sys

BUILD_HASH = '13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499'
MANAGER_POINTER_RVA = 0x6e8d708
PROCESS_QUERY_INFORMATION, PROCESS_VM_READ = 0x0400, 0x0010
MEM_COMMIT, MEM_PRIVATE, PAGE_READWRITE = 0x1000, 0x20000, 0x04


class MemoryBasicInformation(ctypes.Structure):
    _fields_ = [('BaseAddress', ctypes.c_void_p), ('AllocationBase', ctypes.c_void_p),
                ('AllocationProtect', wt.DWORD), ('PartitionId', wt.WORD), ('RegionSize', ctypes.c_size_t),
                ('State', wt.DWORD), ('Protect', wt.DWORD), ('Type', wt.DWORD)]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pid', type=int, required=True)
    parser.add_argument('--executable', type=Path, required=True, help='Installed executable, for the build check')
    parser.add_argument('--imaging-tools', type=Path, required=True, help='Folder that provides NumPy')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists() or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Require a new output outside the repository')
    if hashlib.sha256(args.executable.read_bytes()).hexdigest() != BUILD_HASH:
        parser.error('Executable is not the supported build')
    sys.path.insert(0, str(args.imaging_tools))
    import numpy

    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel.OpenProcess.restype = wt.HANDLE
    kernel.VirtualQueryEx.argtypes = [wt.HANDLE, ctypes.c_void_p, ctypes.POINTER(MemoryBasicInformation), ctypes.c_size_t]
    kernel.VirtualQueryEx.restype = ctypes.c_size_t
    kernel.ReadProcessMemory.argtypes = [wt.HANDLE, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_size_t,
                                         ctypes.POINTER(ctypes.c_size_t)]
    handle = kernel.OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, False, args.pid)
    if not handle:
        parser.error('Cannot open the process for reading')

    def read(address, size):
        buffer = (ctypes.c_char * size)()
        done = ctypes.c_size_t()
        if not kernel.ReadProcessMemory(handle, ctypes.c_void_p(address), buffer, size, ctypes.byref(done)):
            return None
        return bytes(buffer[:done.value])

    # Module base: the first image mapping whose header matches; found through the toolhelp snapshot.
    snapshot = kernel.CreateToolhelp32Snapshot(0x8 | 0x10, args.pid)

    class ModuleEntry(ctypes.Structure):
        _fields_ = [('dwSize', wt.DWORD), ('th32ModuleID', wt.DWORD), ('th32ProcessID', wt.DWORD),
                    ('GlblcntUsage', wt.DWORD), ('ProccntUsage', wt.DWORD), ('modBaseAddr', ctypes.c_void_p),
                    ('modBaseSize', wt.DWORD), ('hModule', wt.HMODULE), ('szModule', ctypes.c_char * 256),
                    ('szExePath', ctypes.c_char * 260)]
    entry = ModuleEntry()
    entry.dwSize = ctypes.sizeof(ModuleEntry)
    kernel.Module32First.argtypes = [wt.HANDLE, ctypes.POINTER(ModuleEntry)]
    if not kernel.Module32First(snapshot, ctypes.byref(entry)):
        parser.error('Cannot list process modules')
    base = entry.modBaseAddr
    kernel.CloseHandle(snapshot)
    manager = int.from_bytes(read(base + MANAGER_POINTER_RVA, 8), 'little')

    stores, address, scanned = [], 0x10000, 0
    information = MemoryBasicInformation()
    while kernel.VirtualQueryEx(handle, ctypes.c_void_p(address), ctypes.byref(information), ctypes.sizeof(information)):
        start, size = information.BaseAddress or 0, information.RegionSize
        if (information.State == MEM_COMMIT and information.Type == MEM_PRIVATE
                and information.Protect == PAGE_READWRITE and size <= 512 * 1024**2):
            data = read(start, size)
            if data and len(data) >= 0x110:
                scanned += len(data)
                words = numpy.frombuffer(data, dtype='<u8', count=len(data) // 8)
                header = words[16:len(words) - 17]
                width, height, count = header & 0xffff, (header >> 16) & 0xffff, (header >> 32) & 0xffff
                classes = words[32:len(words) - 1] & 0xffffffff
                mask = ((width >= 1) & (width <= 16) & (height >= 1) & (height <= 16) & (count >= 1)
                        & (count <= width * height) & (classes <= 3))
                for index in numpy.nonzero(mask)[0]:
                    rows = words[index:index + 16]
                    w, h, c = int(width[index]), int(height[index]), int(count[index])
                    if any(int(row) >> w for row in rows[:h]) or any(int(row) for row in rows[h:]):
                        continue
                    if sum(bin(int(row)).count('1') for row in rows[:h]) != c:
                        continue
                    store = start + int(index) * 8
                    capacity, special = int(words[index + 24] & 0xffffffff), int(words[index + 24] >> 32)
                    elements = int(words[index + 17] >> 32)
                    if special > 256 or elements > 512:
                        continue
                    stores.append({'address': hex(store), 'width': w, 'height': h, 'slots': c,
                                   'class': 'CBAS'[int(classes[index])], 'elements': elements, 'special_slots': special,
                                   'seed': hex(int(words[index + 28])),
                                   'manager_offset': hex(store - manager) if 0 <= store - manager < 0x4000000 else None})
        address = start + size
        if address >= 0x7fffffffffff:
            break
    kernel.CloseHandle(handle)
    report = {'pid': args.pid, 'build_sha256': BUILD_HASH, 'manager': hex(manager), 'bytes_scanned': scanned,
              'stores': stores, 'inside_manager': sum(1 for store in stores if store['manager_offset']),
              'limitations': ['Pattern match only; a candidate may be an offer, a container or a stale copy.',
                              'Offsets relative to the manager are observations of one process, not layouts.',
                              'Read-only: the process is opened without write or operation rights.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=1), encoding='utf-8')
    print(json.dumps({'stores': len(stores), 'inside_manager': report['inside_manager'], 'bytes_scanned': scanned}))


if __name__ == '__main__':
    main()
