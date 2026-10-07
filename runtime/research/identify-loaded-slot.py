"""Identify which save slot the running game has loaded, read-only.

Opens the game process with query and read rights only and reads the player's
known technology and known product lists (in the order the game keeps them).
Decompresses every slot file of the save folder in memory, without writing,
and compares: a slot matches when its saved list is a prefix of the list in
memory (the running game may have learned more since the last save). The
answer is the slot whose two lists both match, with the longer saved lists
winning; if no slot or more than one slot fits equally, the tool says so
instead of guessing.

This is identification by content, not the game's own slot variable, which
has not been located yet. Pinned to build 180836 by executable hash.
"""
import argparse
import ctypes
import ctypes.wintypes as wt
import hashlib
import json
from pathlib import Path
import re
import struct
import sys

BUILD_HASH = '13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499'
MANAGER_POINTER_RVA = 0x6e8d708
PLAYER_STATE_OFFSET = 0xb940
VECTORS = {'technologies': 0x18730, 'products': 0x18740}   # capacity, count, pointer; 16-byte IDs
SAVE_KEYS = {'technologies': '4kj', 'products': 'eZ<'}       # keys of the same lists in the save files
PROCESS_QUERY_INFORMATION, PROCESS_VM_READ = 0x0400, 0x0010


def slot_of(name):
    """Slot number and kind for a save file name: save.hg is slot 1 auto, save2.hg slot 1 manual, and so on."""
    match = re.fullmatch(r'save(\d*)\.hg', name)
    if not match:
        return None
    number = int(match.group(1) or 1)
    return (number + 1) // 2, 'auto' if number % 2 else 'manual'


def decode(path, lz4_block):
    raw = path.read_bytes()
    out, at = bytearray(), 0
    while at + 16 <= len(raw):
        magic, compressed, size, _ = struct.unpack_from('<IIII', raw, at)
        if magic != 0xFEEDA1E5:
            break
        out += lz4_block.decompress(raw[at + 16:at + 16 + compressed], uncompressed_size=size)
        at += 16 + compressed
    return out.decode('utf-8', 'replace')


def saved_list(text, key):
    """First flat list of quoted IDs stored under the given key."""
    match = re.search(r'"%s":\[((?:"\^?[A-Z0-9_]{1,15}",?)*)\]' % re.escape(key), text)
    return [item.lstrip('^') for item in re.findall(r'"(\^?[A-Z0-9_]{1,15})"', match.group(1))] if match else None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pid', type=int, required=True)
    parser.add_argument('--executable', type=Path, required=True, help='Installed executable, for the build check')
    parser.add_argument('--save-folder', type=Path, required=True)
    parser.add_argument('--tools', type=Path, required=True, help='Folder that provides the lz4 module')
    args = parser.parse_args()
    if hashlib.sha256(args.executable.read_bytes()).hexdigest() != BUILD_HASH:
        parser.error('Executable is not the supported build')
    sys.path.insert(0, str(args.tools))
    import lz4.block

    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel.OpenProcess.restype = wt.HANDLE
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

    class ModuleEntry(ctypes.Structure):
        _fields_ = [('dwSize', wt.DWORD), ('th32ModuleID', wt.DWORD), ('th32ProcessID', wt.DWORD),
                    ('GlblcntUsage', wt.DWORD), ('ProccntUsage', wt.DWORD), ('modBaseAddr', ctypes.c_void_p),
                    ('modBaseSize', wt.DWORD), ('hModule', wt.HMODULE), ('szModule', ctypes.c_char * 256),
                    ('szExePath', ctypes.c_char * 260)]
    snapshot = kernel.CreateToolhelp32Snapshot(0x8 | 0x10, args.pid)
    entry = ModuleEntry()
    entry.dwSize = ctypes.sizeof(ModuleEntry)
    kernel.Module32First.argtypes = [wt.HANDLE, ctypes.POINTER(ModuleEntry)]
    if not kernel.Module32First(snapshot, ctypes.byref(entry)):
        parser.error('Cannot list process modules')
    kernel.CloseHandle(snapshot)
    manager = int.from_bytes(read(entry.modBaseAddr + MANAGER_POINTER_RVA, 8), 'little')
    state = manager + PLAYER_STATE_OFFSET
    memory = {}
    for label, offset in VECTORS.items():
        capacity, count, pointer = struct.unpack('<IIQ', read(state + offset, 16))
        if not (0 <= count <= capacity <= 100000) or (count and not pointer):
            parser.error('The %s list in memory does not look valid; is a save loaded?' % label)
        raw = read(pointer, count * 16) if count else b''
        memory[label] = [raw[i * 16:i * 16 + 16].split(b'\0')[0].decode('ascii', 'replace') for i in range(count)]
    kernel.CloseHandle(handle)

    candidates = []
    for path in sorted(args.save_folder.glob('save*.hg')):
        slot = slot_of(path.name)
        if not slot:
            continue
        text = decode(path, lz4.block)
        score, fits = 0, True
        for label, key in SAVE_KEYS.items():
            saved = saved_list(text, key)
            if saved is None or memory[label][:len(saved)] != saved:
                fits = False
                break
            score += len(saved)
        if fits:
            candidates.append({'slot': slot[0], 'kind': slot[1], 'file': path.name, 'matched_entries': score,
                               'modified': path.stat().st_mtime})
    best = max((c['matched_entries'] for c in candidates), default=None)
    winners = sorted({c['slot'] for c in candidates if c['matched_entries'] == best})
    report = {'pid': args.pid, 'known_technologies_in_memory': len(memory['technologies']),
              'known_products_in_memory': len(memory['products']), 'matching_files': candidates,
              'loaded_slot': winners[0] if len(winners) == 1 else None,
              'status': 'identified' if len(winners) == 1 else 'ambiguous' if winners else 'no_slot_matches',
              'method': 'content match of the known technology and product lists; not the game\'s slot variable'}
    print(json.dumps(report, indent=1))
    return 0 if len(winners) == 1 else 2


if __name__ == '__main__':
    sys.exit(main())
