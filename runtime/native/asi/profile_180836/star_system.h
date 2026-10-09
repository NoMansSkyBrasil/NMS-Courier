// Star system domain of the build 180836 research profile: reports the seed of the star system
// the player is in and the ships the game generated for it. Read only: nothing in the game is
// written and no game routine is called. Included once by profile_core.c.
//
// Where the values are (docs/SEED_ORIGINS.md): the current star system is the pointer at
// manager +0x72afb0 (the game reads it as +0x25e020 of the object at manager +0x4ccf90); its
// data starts at the object itself, with the fields the executable's own field table of
// cGcSolarSystemData names: Seed at +0x2480 (64-bit value, in-use byte at +8) and SystemShips at
// +0x24a0 (pointer, then a 32-bit count). One ship is 0x40 bytes: texture hint (32 bytes of
// text), seed +0x20 (in-use byte at +0x28), faction +0x30, frigate class +0x34, ship class +0x38,
// ship role +0x3c.

#define STAR_SYSTEM_POINTER_OFFSET 0x72afb0u
#define STAR_SYSTEM_SEED_OFFSET 0x2480u
#define STAR_SYSTEM_SHIPS_OFFSET 0x24a0u
#define STAR_SYSTEM_SHIP_SIZE 0x40u
#define STAR_SYSTEM_SHIP_CAPACITY 96
#define STAR_SYSTEM_REFRESH_FRAMES 300

typedef struct {
    char hint[33];
    uint64_t seed;
    int32_t faction, frigate_class, ship_class, ship_role;
} star_system_ship;

// What the game thread last read, and what the worker thread last wrote to the file.
static star_system_ship star_system_ships[STAR_SYSTEM_SHIP_CAPACITY];
static uint64_t star_system_seed;
static LONG star_system_count = -1;      // -1: no star system is loaded
static volatile LONG star_system_version, star_system_reported = -1;
static volatile LONG star_system_lock;
static int star_system_frames;

static int star_system_readable(uintptr_t address, size_t length) {
    MEMORY_BASIC_INFORMATION memory;
    return address && address <= UINTPTR_MAX - length &&
           VirtualQuery((void *)address, &memory, sizeof(memory)) == sizeof(memory) &&
           memory.State == MEM_COMMIT && !(memory.Protect & (PAGE_GUARD | PAGE_NOACCESS)) &&
           address + length <= (uintptr_t)memory.BaseAddress + memory.RegionSize;
}

// Called on the game thread once per frame; reads every STAR_SYSTEM_REFRESH_FRAMES frames.
static void star_system_tick(void) {
    if (++star_system_frames < STAR_SYSTEM_REFRESH_FRAMES) return;
    star_system_frames = 0;
    uintptr_t base = (uintptr_t)GetModuleHandleW(NULL);
    uintptr_t manager = star_system_readable(base + MANAGER_POINTER_RVA, sizeof(uintptr_t))
        ? *(const uintptr_t *)(base + MANAGER_POINTER_RVA) : 0;
    uintptr_t system = manager && star_system_readable(manager + STAR_SYSTEM_POINTER_OFFSET, sizeof(uintptr_t))
        ? *(const uintptr_t *)(manager + STAR_SYSTEM_POINTER_OFFSET) : 0;
    static star_system_ship ships[STAR_SYSTEM_SHIP_CAPACITY];
    uint64_t seed = 0;
    LONG count = -1;
    if (system && star_system_readable(system + STAR_SYSTEM_SEED_OFFSET, 0x30) &&
        *(const uint8_t *)(system + STAR_SYSTEM_SEED_OFFSET + 8)) {
        seed = *(const uint64_t *)(system + STAR_SYSTEM_SEED_OFFSET);
        uintptr_t list = *(const uintptr_t *)(system + STAR_SYSTEM_SHIPS_OFFSET);
        int32_t listed = *(const int32_t *)(system + STAR_SYSTEM_SHIPS_OFFSET + 8);
        count = 0;
        if (list && listed > 0 && listed <= STAR_SYSTEM_SHIP_CAPACITY &&
            star_system_readable(list, (size_t)listed * STAR_SYSTEM_SHIP_SIZE)) {
            for (int32_t index = 0; index < listed; ++index) {
                const uint8_t *entry = (const uint8_t *)(list + (uintptr_t)index * STAR_SYSTEM_SHIP_SIZE);
                star_system_ship *ship = &ships[count++];
                // The hint is text; anything that is not printable ASCII ends it.
                size_t length = 0;
                while (length < 32 && entry[length] >= 0x20 && entry[length] < 0x7f) ++length;
                memcpy(ship->hint, entry, length);
                ship->hint[length] = 0;
                ship->seed = *(const uint64_t *)(entry + 0x20);
                ship->faction = *(const int32_t *)(entry + 0x30);
                ship->frigate_class = *(const int32_t *)(entry + 0x34);
                ship->ship_class = *(const int32_t *)(entry + 0x38);
                ship->ship_role = *(const int32_t *)(entry + 0x3c);
            }
        }
    }
    // The worker thread may be writing the file; skip this round and read again later.
    if (InterlockedCompareExchange(&star_system_lock, 1, 0) != 0) return;
    if (count != star_system_count || seed != star_system_seed ||
        (count > 0 && memcmp(ships, star_system_ships, (size_t)count * sizeof(ships[0])) != 0)) {
        star_system_seed = seed;
        star_system_count = count;
        if (count > 0) memcpy(star_system_ships, ships, (size_t)count * sizeof(ships[0]));
        InterlockedIncrement(&star_system_version);
    }
    InterlockedExchange(&star_system_lock, 0);
}

// Called on the worker thread; writes native-star-system-180836-<PID>.txt when the reading changed.
static void star_system_write(void) {
    LONG version = InterlockedCompareExchange(&star_system_version, 0, 0);
    if (version == InterlockedCompareExchange(&star_system_reported, 0, 0)) return;
    wchar_t root[MAX_PATH], path[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    if (!length || length >= MAX_PATH ||
        swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-star-system-180836-%lu.txt", root,
                 (unsigned long)GetCurrentProcessId()) <= 0) return;
    if (InterlockedCompareExchange(&star_system_lock, 1, 0) != 0) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        if (star_system_count < 0) {
            fprintf(file, "state=no_system\n");
        } else {
            fprintf(file, "state=read\nseed=0x%016llX\nships=%ld\n", (unsigned long long)star_system_seed,
                    (long)star_system_count);
            for (LONG index = 0; index < star_system_count; ++index) {
                const star_system_ship *ship = &star_system_ships[index];
                fprintf(file, "ship=%ld class=%ld role=%ld faction=%ld frigate=%ld seed=0x%016llX hint=%s\n",
                        (long)index, (long)ship->ship_class, (long)ship->ship_role, (long)ship->faction,
                        (long)ship->frigate_class, (unsigned long long)ship->seed, ship->hint);
            }
        }
        fclose(file);
        InterlockedExchange(&star_system_reported, version);
    }
    InterlockedExchange(&star_system_lock, 0);
}
