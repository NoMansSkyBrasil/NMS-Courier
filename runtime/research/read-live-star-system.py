"""Read the current star system from the running game's memory, for research. Read only.

Windows only (ReadProcessMemory). This is a research tool: it is not on the path between the
application and the game, which reads the bridge's report file instead. Offsets are those of build
180836 (executable SHA-256 13d5060d...cc3499); the tool refuses any other executable size check by
reading the system seed, which must have the shape of a universe address.

    read-live-star-system.py record            the system record and where its seeds lie
    read-live-star-system.py scan OUT [COUNT]  every 8-byte value in writable memory that is a child
                                               seed of the system's number stream (first COUNT
                                               positions, default 2000); needs NumPy; takes minutes

See docs/SEED_ORIGINS.md for what the readings established.
"""
import ctypes
import ctypes.wintypes as wt
import struct
import subprocess
import sys

MANAGER_POINTER_RVA = 0x6E8D708
SYSTEM_POINTER_OFFSET = 0x72AFB0
RECORD_SIZE = 0x25E0
MULTIPLIER = 0x5A76F899
MASK32 = (1 << 32) - 1
MASK64 = (1 << 64) - 1
MIX_A, MIX_B = 0x64DD81482CBD31D7, 0xE36AA5C613612997

kernel = ctypes.WinDLL('kernel32', use_last_error=True) if sys.platform == 'win32' else None


class MemoryInformation(ctypes.Structure):
    _fields_ = [('BaseAddress', ctypes.c_void_p), ('AllocationBase', ctypes.c_void_p),
                ('AllocationProtect', wt.DWORD), ('PartitionId', wt.WORD),
                ('RegionSize', ctypes.c_size_t), ('State', wt.DWORD), ('Protect', wt.DWORD),
                ('Type', wt.DWORD)]


class Game:
    def __init__(self):
        listing = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq NMS.exe', '/FO', 'CSV', '/NH'],
                                 capture_output=True, text=True).stdout
        if 'NMS.exe' not in listing:
            raise SystemExit('the game is not running')
        self.pid = int(listing.split(',')[1].strip('"'))
        kernel.OpenProcess.restype = wt.HANDLE
        kernel.OpenProcess.argtypes = [wt.DWORD, wt.BOOL, wt.DWORD]
        kernel.ReadProcessMemory.argtypes = [wt.HANDLE, ctypes.c_void_p, ctypes.c_void_p,
                                             ctypes.c_size_t, ctypes.POINTER(ctypes.c_size_t)]
        kernel.VirtualQueryEx.argtypes = [wt.HANDLE, ctypes.c_void_p,
                                          ctypes.POINTER(MemoryInformation), ctypes.c_size_t]
        kernel.VirtualQueryEx.restype = ctypes.c_size_t
        # Query and read rights only.
        self.handle = kernel.OpenProcess(0x0400 | 0x0010, False, self.pid)
        if not self.handle:
            raise SystemExit('cannot open the game process')
        process = ctypes.WinDLL('psapi', use_last_error=True)
        process.EnumProcessModules.argtypes = [wt.HANDLE, ctypes.POINTER(ctypes.c_void_p), wt.DWORD,
                                               ctypes.POINTER(wt.DWORD)]
        modules = (ctypes.c_void_p * 1)()
        needed = wt.DWORD()
        process.EnumProcessModules(self.handle, modules, ctypes.sizeof(modules), ctypes.byref(needed))
        self.base = modules[0]

    def read(self, address, size):
        buffer = ctypes.create_string_buffer(size)
        got = ctypes.c_size_t()
        if not kernel.ReadProcessMemory(self.handle, ctypes.c_void_p(address), buffer, size,
                                        ctypes.byref(got)):
            return b''
        return buffer.raw[:got.value]

    def pointer(self, address):
        data = self.read(address, 8)
        return struct.unpack('<Q', data)[0] if len(data) == 8 else 0

    def writable_regions(self):
        address = 0
        information = MemoryInformation()
        while kernel.VirtualQueryEx(self.handle, ctypes.c_void_p(address), ctypes.byref(information),
                                    ctypes.sizeof(information)):
            base = information.BaseAddress or 0
            if information.State == 0x1000 and information.Protect == 0x04:
                yield base, information.RegionSize
            address = base + information.RegionSize
            if address >= 0x7FFFFFFF0000:
                break

    def system_record(self):
        manager = self.pointer(self.base + MANAGER_POINTER_RVA)
        system = self.pointer(manager + SYSTEM_POINTER_OFFSET) if manager else 0
        record = self.read(system, RECORD_SIZE) if system else b''
        if len(record) != RECORD_SIZE:
            raise SystemExit('no star system is loaded')
        seed = struct.unpack_from('<Q', record, 0x2480)[0]
        if seed >> 52:
            raise SystemExit('the system seed is not a universe address; wrong build?')
        return record, seed


def step(state):
    product = state[0] * MULTIPLIER + state[1]
    return product & MASK32, product >> 32


def mix(value):
    value = ((value ^ (value >> 33)) * MIX_A) & MASK64
    value = ((value ^ (value >> 33)) * MIX_B) & MASK64
    return value ^ (value >> 33)


def initial_state(seed):
    low = seed & MASK32
    rotated = ((low >> 16) | (low << 16)) & MASK32
    return low or 1, rotated ^ (seed >> 32) ^ low


def child_seeds_by_position(seed, count):
    """Child seed -> number of steps taken before it, for every position of the stream."""
    table = {}
    previous = step(initial_state(seed))
    for position in range(count):
        following = step(previous)
        table.setdefault(mix((following[0] << 32) | previous[0]), position)
        previous = following
    return table


def record_command(game):
    record, seed = game.system_record()
    integer = lambda offset: struct.unpack_from('<i', record, offset)[0]
    quad = lambda offset: struct.unpack_from('<Q', record, offset)[0]
    print('process %d, system seed 0x%016X' % (game.pid, seed))
    for name, offset in (('Class', 0x252C), ('ConflictData', 0x2530), ('InhabitingRace', 0x2534),
                         ('MaxNumFreighters', 0x2538), ('NumTradeRoutes', 0x253C),
                         ('Planets', 0x2544), ('PrimePlanets', 0x2548), ('StarType', 0x2550)):
        print('  %s = %d' % (name, integer(offset)))
    for planet in range(integer(0x2544)):
        base = 0x2180 + planet * 0x58
        print('  planet %d seed 0x%016X biome %d size %d prime %d' % (
            planet, quad(base + 0x20), integer(base + 0x30), integer(base + 0x40),
            record[base + 0x52]))
    table = child_seeds_by_position(seed, 4000)
    print('values of the record that are child seeds of the system stream:')
    for offset in range(0, RECORD_SIZE, 8):
        if quad(offset) in table:
            print('  +0x%04x 0x%016X after %d steps' % (offset, quad(offset), table[quad(offset)]))


def scan_command(game, out_path, count):
    import numpy

    _, seed = game.system_record()
    table = child_seeds_by_position(seed, count)
    keys = numpy.array(sorted(table), dtype=numpy.uint64)
    chunk = 64 << 20
    hits = []
    for base, size in game.writable_regions():
        for offset in range(0, size, chunk):
            data = game.read(base + offset, min(chunk, size - offset))
            values = numpy.frombuffer(data[:len(data) // 8 * 8], dtype=numpy.uint64)
            for index in numpy.nonzero(numpy.isin(values, keys))[0]:
                hits.append((base + offset + int(index) * 8, int(values[index])))
    with open(out_path, 'w', encoding='utf-8') as out:
        out.write('system=0x%016X\n' % seed)
        for address, value in hits:
            out.write('%x 0x%016X %d\n' % (address, value, table[value]))
    positions = sorted({table[value] for _, value in hits})
    print('%d hits at %d stream positions: %s' % (len(hits), len(positions), positions))


if __name__ == '__main__':
    if sys.platform != 'win32' or len(sys.argv) < 2 or sys.argv[1] not in ('record', 'scan'):
        raise SystemExit(__doc__)
    if sys.argv[1] == 'record':
        record_command(Game())
    else:
        scan_command(Game(), sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 2000)
