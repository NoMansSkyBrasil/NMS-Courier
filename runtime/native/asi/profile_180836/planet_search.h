// Planet search domain of the build 180836 research profile: look through the star systems around
// the one the player is in, nearest regions first, and report the planets that match what was asked
// for. Everything is worked out by the game's own routines; nothing of the game's state is written
// by this file. Included once by profile_core.c.
//
// Read in the executable on 2026-10-10 (docs/PLANET_FINDER_NOTES.md):
//   - 16a3a50(planet generator, input, biome) is how the game itself learns about a planet of a
//     system it is not in: it builds an empty cGcSolarSystemData on its own stack, runs the three
//     stages of the system generator on it (164c580, 164da40, 164c770) for the universe address in
//     the input, reads one planet's biome subtype and throws the rest away.
//   - 164c770(generator, info, request, extra) is the last of those stages; request+8 points at the
//     system data being filled. A hook there copies that data and the info block while this file's
//     own call of 16a3a50 is running, and does nothing at any other time.
//   - 16a7880(planet generator, planet data, input) is the game's full planet routine, the one its
//     own screens call for a planet of another system (callers 75cdd5, 75d97f). The input is the
//     universe address with the planet number from 1 in bits 52 to 55, the planet's seed, its biome
//     with the class in the upper word, and the count 2 at +0x30.
//   - 1e0dbd0(handle) builds an empty cGcPlanetData (0x3ae0 bytes) with the game's allocator and
//     1cea50(planet data) releases what a filled one holds. A freshly built one holds no pointers
//     (run in an emulator), so a byte copy of it is a clean object to start each planet from.
//   - The planet generator is the current solar system object (manager +0x72afb0) +0x520570.
//
// Fields read: of the system, cGcSolarSystemData as the executable's field table names them
// (Planet Generation Inputs +0x2180 of 0x58 bytes with Seed +0x20, Biome +0x30, BiomeSubType +0x34,
// Class +0x38; TradingData +0x2520; ConflictData +0x2530; InhabitingRace +0x2534; Planets +0x2544;
// PrimePlanets +0x2548; StarType +0x2550; PrimePlanetsIncludedInPlanetCount +0x25d4); of the planet,
// cGcPlanetData (Colours +0x0, whose first palette is the grass; storms +0x1e48; extreme +0x1e50;
// weather +0x1e54; Biome +0x32b8; BiomeSubType +0x32bc; the sentinel level of the normal preset
// +0x34fc).
//
// Which indices of a region hold a system (132b3f0, read 2026-10-10): an index below the region's
// star count (info block +0x70) is a star of the galaxy map; from there to 2FF the game still
// generates a system, which can be reached by portal only; 3E9 to 429 are the 65 purple stars of
// the region (base 1000 at info +0x7c, count at +0x78).
//
// Not exercised in the running game when this was written.

#define SEARCH_REMOTE_SYSTEM_RVA 0x16a3a50u
#define SEARCH_LAST_STAGE_RVA 0x164c770u
#define SEARCH_PLANET_RVA 0x16a7880u
#define SEARCH_PLANET_FACTORY_RVA 0x1e0dbd0u
#define SEARCH_PLANET_RELEASE_RVA 0x1cea50u
#define SEARCH_OWNER_OFFSET 0x72afb0u               // from the manager object
#define SEARCH_PLANET_GENERATOR_OFFSET 0x520570u    // from the solar system object
#define SEARCH_SEED_OFFSET 0x2480u
#define SEARCH_SYSTEM_SIZE 0x2600u
#define SEARCH_INFO_SIZE 0x768u
#define SEARCH_INFO_FILLED_OFFSET 0x760u
#define SEARCH_PLANET_SIZE 0x3ae0u
#define SEARCH_INPUTS_OFFSET 0x2180u
#define SEARCH_INPUT_SIZE 0x58u
#define SEARCH_MAX_PLANETS 8
#define SEARCH_LAST_SYSTEM 0x2ff
#define SEARCH_FIRST_PURPLE 0x3e9
#define SEARCH_LAST_PURPLE 0x429
#define SEARCH_INFO_STARS_OFFSET 0x70u
#define SEARCH_MAX_FOUND 2000
#define SEARCH_SLICE_MICROSECONDS 3000
#define SEARCH_WRITE_MILLISECONDS 700u

enum { SEARCH_IDLE = 0, SEARCH_REQUESTED, SEARCH_RUNNING, SEARCH_FINISHED };
enum {
    SEARCH_RESULT_RUNNING = 0,
    SEARCH_RESULT_DONE,        // the time asked for has passed, or the list is full
    SEARCH_RESULT_STOPPED,     // stopped on request
    SEARCH_RESULT_TRAVELLED,   // the player left the star system the search started from
    SEARCH_RESULT_FAILED,      // the game's routine did not hand a system over; nothing more was called
    SEARCH_RESULT_NOT_READY    // no star system is loaded
};
static const char *const search_result_names[] = {"running", "done", "stopped", "travelled", "failed", "not_ready"};

typedef struct {
    int32_t seconds;
    int32_t biome;           // -1 any
    uint32_t subtypes;       // one bit a biome subtype
    int32_t storms;          // highest storm level accepted, 0 to 3
    int32_t sentinels;       // highest sentinel level accepted, 0 to 3
    int32_t extreme;         // 1 accepts extreme weather
    int32_t pirate;          // -1 any, 0 only systems without pirates, 1 only pirate systems
    int32_t race;            // -1 any
    int32_t limit;
} search_filter;

typedef struct {
    uint64_t address;        // universe address with the planet number in bits 52 to 55
    int32_t biome, subtype, weather, storms, extreme, sentinels;
    int32_t race, star, economy, wealth, conflict;
    uint32_t grass;          // 0xRRGGBB of the first colour of the grass palette
    int32_t distance;        // in regions from the start, the largest of the three axes
    int32_t kind;            // 0 a star of the galaxy map, 1 reached by portal only, 2 a purple star
} search_planet_found;

typedef int32_t (*search_remote_fn)(void *planet_generator, const uint64_t *input, int32_t biome);
typedef void *(*search_stage_fn)(void *generator, void *info, void *request, void *extra);
typedef void (*search_planet_fn)(void *planet_generator, void *planet, const uint64_t *input);
typedef void *(*search_factory_fn)(void *handle);
typedef void (*search_release_fn)(void *planet);

static search_remote_fn search_remote;
static search_stage_fn search_stage_original;
static void *search_stage_target;
static search_planet_fn search_planet;
static search_factory_fn search_factory;
static search_release_fn search_release;

static volatile LONG search_state;
static volatile LONG search_stop_wanted;
static volatile LONG search_result;
static volatile LONG search_dirty;
static search_filter search_wanted;          // written by the worker thread before the request is posted
static search_filter search_active;          // the game thread's copy
// Capture: set only around this file's own call, read by the hook on the same thread.
static volatile LONG search_armed;
static DWORD search_thread;
static int search_captured;
static uint8_t search_system[SEARCH_SYSTEM_SIZE];
static uint8_t search_info[SEARCH_INFO_SIZE];
static uint8_t *search_planet_object;        // built once by the game's factory, kept for the session
static uint8_t search_planet_template[SEARCH_PLANET_SIZE];
// Where the walk is.
static uint64_t search_centre;               // universe address of the region the search started in
static uint64_t search_start_seed;           // seed of the star system the search started in
static uint8_t *search_owner;
static int32_t search_distance, search_dx, search_dy, search_dz, search_system_index;
static int search_region_valid;
static ULONGLONG search_started;
static int search_failures;
// Progress, read by the worker thread.
static volatile LONG search_regions, search_systems, search_planets, search_found_count, search_elapsed;
static search_planet_found search_found[SEARCH_MAX_FOUND];

__attribute__((unused)) static int search_resolve(uintptr_t base) {
    static const unsigned char remote_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x74, 0x24, 0x10, 0x48, 0x89, 0x7c, 0x24, 0x18, 0x4c,
        0x89, 0x64, 0x24, 0x20, 0x55, 0x41, 0x56, 0x41, 0x57, 0x48, 0x8d, 0xac, 0x24, 0x80, 0xd2, 0xff
    };
    static const unsigned char stage_entry[32] = {
        0x48, 0x8b, 0xc4, 0x4c, 0x89, 0x48, 0x20, 0x4c, 0x89, 0x40, 0x18, 0x48, 0x89, 0x50, 0x10, 0x48,
        0x89, 0x48, 0x08, 0x53, 0x55, 0x56, 0x57, 0x41, 0x54, 0x41, 0x55, 0x41, 0x56, 0x41, 0x57, 0x48
    };
    static const unsigned char planet_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x6c, 0x24, 0x10, 0x48, 0x89, 0x74, 0x24, 0x18, 0x57,
        0x41, 0x56, 0x41, 0x57, 0x48, 0x81, 0xec, 0xe0, 0x01, 0x00, 0x00, 0x48, 0x8b, 0xf2, 0x4d, 0x8b
    };
    static const unsigned char factory_entry[32] = {
        0x40, 0x55, 0x41, 0x56, 0x41, 0x57, 0x48, 0x83, 0xec, 0x30, 0x45, 0x33, 0xff, 0xc7, 0x44, 0x24,
        0x20, 0x11, 0x00, 0x00, 0x00, 0x4c, 0x89, 0x39, 0x4c, 0x8d, 0x0d, 0x31, 0x37, 0xc3, 0x02, 0x44
    };
    static const unsigned char release_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x57, 0x48, 0x83, 0xec, 0x20, 0x48, 0x8b, 0x91, 0x20, 0x34, 0x00,
        0x00, 0x48, 0x8b, 0xf9, 0x48, 0x85, 0xd2, 0x74, 0x1b, 0x80, 0xb9, 0x2c, 0x34, 0x00, 0x00, 0x00
    };
    search_remote = (search_remote_fn)(base + SEARCH_REMOTE_SYSTEM_RVA);
    search_stage_target = (void *)(base + SEARCH_LAST_STAGE_RVA);
    search_planet = (search_planet_fn)(base + SEARCH_PLANET_RVA);
    search_factory = (search_factory_fn)(base + SEARCH_PLANET_FACTORY_RVA);
    search_release = (search_release_fn)(base + SEARCH_PLANET_RELEASE_RVA);
    return memcmp((void *)(base + SEARCH_REMOTE_SYSTEM_RVA), remote_entry, sizeof(remote_entry)) == 0 &&
           memcmp(search_stage_target, stage_entry, sizeof(stage_entry)) == 0 &&
           memcmp((void *)(base + SEARCH_PLANET_RVA), planet_entry, sizeof(planet_entry)) == 0 &&
           memcmp((void *)(base + SEARCH_PLANET_FACTORY_RVA), factory_entry, sizeof(factory_entry)) == 0 &&
           memcmp((void *)(base + SEARCH_PLANET_RELEASE_RVA), release_entry, sizeof(release_entry)) == 0;
}

// The game's last system stage, passed through untouched. While this file's own call is running on
// this thread, the finished system data and its info block are copied before the game discards them.
static void *search_stage_detour(void *generator, void *info, void *request, void *extra) {
    void *result = search_stage_original(generator, info, request, extra);
    if (InterlockedCompareExchange(&search_armed, 0, 0) && GetCurrentThreadId() == search_thread && request) {
        const uint8_t *data = *(uint8_t *const *)((uint8_t *)request + 8);
        if (data && info) {
            memcpy(search_system, data, SEARCH_SYSTEM_SIZE);
            memcpy(search_info, info, SEARCH_INFO_SIZE);
            search_captured = 1;
        }
    }
    return result;
}

// A voxel coordinate of a universe address: X and Z are twelve bits, Y eight, each with a sign.
static int32_t search_axis(uint64_t address, unsigned shift, unsigned bits) {
    int32_t value = (int32_t)((address >> shift) & ((1u << bits) - 1));
    return value >= (int32_t)(1u << (bits - 1)) ? value - (int32_t)(1u << bits) : value;
}

static void search_finish(LONG result) {
    InterlockedExchange(&search_result, result);
    InterlockedExchange(&search_elapsed, (LONG)(GetTickCount64() - search_started));
    InterlockedExchange(&search_state, SEARCH_FINISHED);
    InterlockedExchange(&search_dirty, 1);
}

// The current solar system object, when one is loaded and still the one the search started in.
static uint8_t *search_current_owner(uint64_t *seed) {
    uintptr_t manager = *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA);
    if (!manager || !writable_range(manager + SEARCH_OWNER_OFFSET, sizeof(uintptr_t))) return NULL;
    uint8_t *owner = *(uint8_t *const *)(manager + SEARCH_OWNER_OFFSET);
    if (!owner || !writable_range((uintptr_t)owner + SEARCH_SEED_OFFSET, 0x10) ||
        !writable_range((uintptr_t)owner + SEARCH_PLANET_GENERATOR_OFFSET, 0x1000) ||
        !owner[SEARCH_SEED_OFFSET + 8]) return NULL;
    *seed = *(const uint64_t *)(owner + SEARCH_SEED_OFFSET);
    return owner;
}

static void search_begin(void) {
    uint64_t seed = 0;
    search_active = search_wanted;
    InterlockedExchange(&search_stop_wanted, 0);
    InterlockedExchange(&search_regions, 0);
    InterlockedExchange(&search_systems, 0);
    InterlockedExchange(&search_planets, 0);
    InterlockedExchange(&search_found_count, 0);
    InterlockedExchange(&search_elapsed, 0);
    search_started = GetTickCount64();
    search_failures = 0;
    search_owner = search_remote && search_planet && search_factory && search_release && search_stage_original
        ? search_current_owner(&seed) : NULL;
    if (!search_owner) { search_finish(SEARCH_RESULT_NOT_READY); return; }
    if (!search_planet_object) {
        // The game builds one empty planet data object; its bytes are the clean start of every planet.
        struct { uint8_t *object; uint32_t class_hash; uint8_t flags[4]; } handle = {0};
        search_factory(&handle);
        if (!handle.object || !writable_range((uintptr_t)handle.object, SEARCH_PLANET_SIZE)) {
            search_finish(SEARCH_RESULT_FAILED);
            return;
        }
        memcpy(search_planet_template, handle.object, SEARCH_PLANET_SIZE);
        search_planet_object = handle.object;
    }
    search_start_seed = seed;
    search_centre = seed & ~(0xfull << 52) & ~(0xfffull << 40);
    search_distance = 0;
    search_dx = search_dy = search_dz = 0;
    search_region_valid = 1;
    search_system_index = 0;
    InterlockedExchange(&search_result, SEARCH_RESULT_RUNNING);
    InterlockedExchange(&search_state, SEARCH_RUNNING);
    InterlockedExchange(&search_dirty, 1);
}

// Move to the next region: the cube shell at the current distance, then the next shell out.
static void search_next_region(void) {
    for (;;) {
        if (++search_dz > search_distance) {
            search_dz = -search_distance;
            if (++search_dy > search_distance) {
                search_dy = -search_distance;
                if (++search_dx > search_distance) {
                    ++search_distance;
                    search_dx = search_dy = search_dz = -search_distance;
                }
            }
        }
        int32_t ax = search_dx < 0 ? -search_dx : search_dx, ay = search_dy < 0 ? -search_dy : search_dy;
        int32_t az = search_dz < 0 ? -search_dz : search_dz;
        int32_t furthest = ax > ay ? (ax > az ? ax : az) : (ay > az ? ay : az);
        if (furthest != search_distance) continue;
        int32_t x = search_axis(search_centre, 0, 12) + search_dx, y = search_axis(search_centre, 24, 8) + search_dy;
        int32_t z = search_axis(search_centre, 12, 12) + search_dz;
        search_region_valid = x >= -2047 && x <= 2047 && y >= -127 && y <= 127 && z >= -2047 && z <= 2047;
        // Past this distance every region is outside the galaxy on some axis; the search ends there.
        if (search_region_valid || search_distance > 4096) return;
    }
}

static uint64_t search_address(int32_t system) {
    uint64_t x = (uint64_t)(search_axis(search_centre, 0, 12) + search_dx) & 0xfff;
    uint64_t y = (uint64_t)(search_axis(search_centre, 24, 8) + search_dy) & 0xff;
    uint64_t z = (uint64_t)(search_axis(search_centre, 12, 12) + search_dz) & 0xfff;
    return (search_centre & (0xffull << 32)) | ((uint64_t)system << 40) | (y << 24) | (z << 12) | x;
}

static uint32_t search_colour_byte(float value) {
    return value <= 0.0f ? 0u : value >= 1.0f ? 255u : (uint32_t)(value * 255.0f + 0.5f);
}

// One star system: ask the game for it, then for each of its planets the filter does not rule out
// by biome, ask the game for the planet. Returns 0 when the search cannot go on.
static int search_one_system(uint8_t *generator) {
    const search_filter *filter = &search_active;
    // The ordinary indices of the region, then its purple stars, then the next region.
    if (search_system_index == SEARCH_LAST_SYSTEM) search_system_index = SEARCH_FIRST_PURPLE - 1;
    if (++search_system_index > SEARCH_LAST_PURPLE) {
        search_system_index = 1;
        search_next_region();
        InterlockedIncrement(&search_regions);
        if (!search_region_valid) return 0;
    }
    uint64_t address = search_address(search_system_index);
    uint64_t input[8] = {address | (1ull << 52)};
    search_captured = 0;
    search_thread = GetCurrentThreadId();
    InterlockedExchange(&search_armed, 1);
    search_remote(generator, input, 0);
    InterlockedExchange(&search_armed, 0);
    if (!search_captured) return ++search_failures < 3;
    search_failures = 0;
    // The info block says whether the address holds a region at all.
    if (*(const int32_t *)search_info == -1 || !search_info[SEARCH_INFO_FILLED_OFFSET]) return 1;
    InterlockedIncrement(&search_systems);
    int32_t economy = *(const int32_t *)(search_system + 0x2520), wealth = *(const int32_t *)(search_system + 0x2524);
    int32_t conflict = *(const int32_t *)(search_system + 0x2530), race = *(const int32_t *)(search_system + 0x2534);
    int32_t star = *(const int32_t *)(search_system + 0x2550);
    int32_t stars = *(const int32_t *)(search_info + SEARCH_INFO_STARS_OFFSET);
    int32_t kind = search_system_index >= SEARCH_FIRST_PURPLE ? 2 : search_system_index >= stars ? 1 : 0;
    int32_t planets = *(const int32_t *)(search_system + 0x2544);
    if (!search_system[0x25d4]) planets += *(const int32_t *)(search_system + 0x2548);
    if (planets < 0 || planets > SEARCH_MAX_PLANETS) return 1;
    InterlockedExchangeAdd(&search_planets, planets);
    if ((filter->race >= 0 && race != filter->race) ||
        (filter->pirate >= 0 && (conflict == 3) != (filter->pirate == 1))) return 1;
    for (int32_t index = 0; index < planets; ++index) {
        const uint8_t *record = search_system + SEARCH_INPUTS_OFFSET + SEARCH_INPUT_SIZE * (size_t)index;
        int32_t biome = *(const int32_t *)(record + 0x30), subtype = *(const int32_t *)(record + 0x34);
        if (biome < 0 || biome > 16 || subtype < 0 || subtype > 31) continue;
        if ((filter->biome >= 0 && biome != filter->biome) || !(filter->subtypes >> subtype & 1)) continue;
        uint64_t planet_input[8] = {address | ((uint64_t)(index + 1) << 52), *(const uint64_t *)(record + 0x20),
                                    (uint64_t)(uint8_t)biome | ((uint64_t)(uint32_t)*(const int32_t *)(record + 0x38) << 16)};
        ((uint32_t *)planet_input)[12] = 2;      // the count at +0x30: the seed and the biome are given
        uint8_t *planet = search_planet_object;
        memcpy(planet, search_planet_template, SEARCH_PLANET_SIZE);
        search_planet(generator, planet, planet_input);
        search_planet_found found = {
            .address = planet_input[0], .biome = *(const int32_t *)(planet + 0x32b8),
            .subtype = *(const int32_t *)(planet + 0x32bc), .weather = *(const int32_t *)(planet + 0x1e54),
            .storms = *(const int32_t *)(planet + 0x1e48), .extreme = *(const int32_t *)(planet + 0x1e50) != 0,
            .sentinels = *(const int32_t *)(planet + 0x34fc), .race = race, .star = star, .economy = economy,
            .wealth = wealth, .conflict = conflict, .distance = search_distance, .kind = kind
        };
        const float *grass = (const float *)planet;
        found.grass = search_colour_byte(grass[0]) << 16 | search_colour_byte(grass[1]) << 8 | search_colour_byte(grass[2]);
        // What the routine allocated for this planet is handed back before the object is reused.
        search_release(planet);
        // A planet whose biome is not the one the system gave means the routine was not understood.
        if (found.biome != biome || found.storms < 0 || found.storms > 3 || found.sentinels < 0 || found.sentinels > 3)
            continue;
        if (found.storms > filter->storms || found.sentinels > filter->sentinels ||
            (found.extreme && !filter->extreme)) continue;
        LONG count = InterlockedCompareExchange(&search_found_count, 0, 0);
        if (count >= filter->limit || count >= SEARCH_MAX_FOUND) return 0;
        search_found[count] = found;
        InterlockedExchange(&search_found_count, count + 1);
    }
    return 1;
}

// Called on the game's update thread every frame: a few milliseconds of search, then the game goes on.
static void search_tick(void) {
    if (InterlockedCompareExchange(&search_state, 0, 0) == SEARCH_REQUESTED) search_begin();
    if (InterlockedCompareExchange(&search_state, 0, 0) != SEARCH_RUNNING) return;
    static LARGE_INTEGER frequency;
    LARGE_INTEGER start, now;
    if (!frequency.QuadPart) QueryPerformanceFrequency(&frequency);
    QueryPerformanceCounter(&start);
    uint64_t seed = 0;
    uint8_t *owner = search_current_owner(&seed);
    ULONGLONG elapsed = GetTickCount64() - search_started;
    if (InterlockedCompareExchange(&search_stop_wanted, 0, 0)) { search_finish(SEARCH_RESULT_STOPPED); return; }
    if (!owner || owner != search_owner || seed != search_start_seed) {
        search_finish(SEARCH_RESULT_TRAVELLED);
        return;
    }
    if (elapsed >= (ULONGLONG)search_active.seconds * 1000u) { search_finish(SEARCH_RESULT_DONE); return; }
    do {
        if (!search_one_system(owner + SEARCH_PLANET_GENERATOR_OFFSET)) {
            search_finish(search_failures >= 3 ? SEARCH_RESULT_FAILED : SEARCH_RESULT_DONE);
            return;
        }
        QueryPerformanceCounter(&now);
    } while ((now.QuadPart - start.QuadPart) * 1000000 < (LONGLONG)SEARCH_SLICE_MICROSECONDS * frequency.QuadPart);
    InterlockedExchange(&search_elapsed, (LONG)elapsed);
    InterlockedExchange(&search_dirty, 1);
}

static int search_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-planets-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: "mode=stop", or "mode=start" with every one of seconds (1 to 3600),
// biome (-1 to 15), subtypes (eight hexadecimal digits), storms and sentinels (0 to 3), extreme (0 or
// 1), pirate (-1, 0 or 1), race (-1 to 8) and limit (1 to 2000). Anything else rejects the request.
// A start while a search runs begins again with the new values.
static int search_read_request(void) {
    wchar_t path[MAX_PATH];
    if (!search_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    static const char *const keys[] = {"seconds", "biome", "storms", "sentinels", "extreme", "pirate", "race", "limit"};
    static const int low[] = {1, -1, 0, 0, 0, -1, -1, 1}, high[] = {3600, 15, 3, 3, 1, 1, 8, SEARCH_MAX_FOUND};
    int values[8], seen = 0, mode = -1, ok = 1, masked = 0;
    unsigned mask = 0;
    char line[64];
    while (ok && fgets(line, sizeof(line), file)) {
        if (!strchr(line, '\n') && !feof(file)) { ok = 0; break; }
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        int used = 0, matched = 0;
        if (strcmp(line, "mode=start") == 0 && mode < 0) { mode = 1; continue; }
        if (strcmp(line, "mode=stop") == 0 && mode < 0) { mode = 0; continue; }
        if (strncmp(line, "subtypes=", 9) == 0 && !masked && strlen(line) == 17 &&
            sscanf(line + 9, "%8x%n", &mask, &used) == 1 && used == 8) { masked = 1; continue; }
        for (unsigned key = 0; key < 8 && !matched; ++key) {
            size_t length = strlen(keys[key]);
            if (strncmp(line, keys[key], length) != 0 || line[length] != '=' || (seen >> key & 1)) continue;
            if (sscanf(line + length + 1, "%d%n", &values[key], &used) != 1 || line[length + 1 + used] ||
                values[key] < low[key] || values[key] > high[key]) { ok = 0; break; }
            seen |= 1 << key;
            matched = 1;
        }
        if (!matched) ok = 0;
    }
    fclose(file);
    if (!ok || mode < 0) return 0;
    if (mode == 0) {
        if (seen || masked) return 0;
        InterlockedExchange(&search_stop_wanted, 1);
        // A search that already ended answers a stop by writing its last state again.
        InterlockedExchange(&search_dirty, 1);
        return 1;
    }
    if (seen != 0xff || !masked) return 0;
    search_wanted = (search_filter){.seconds = values[0], .biome = values[1], .subtypes = mask, .storms = values[2],
                                    .sentinels = values[3], .extreme = values[4], .pirate = values[5],
                                    .race = values[6], .limit = values[7]};
    InterlockedExchange(&search_result, SEARCH_RESULT_RUNNING);
    InterlockedExchange(&search_state, SEARCH_REQUESTED);
    return 1;
}

// Called from the worker thread: the progress and every planet found so far, written under another
// name first so a reader never sees half a file.
static void search_write_result(void) {
    static ULONGLONG written;
    LONG state = InterlockedCompareExchange(&search_state, 0, 0);
    if (state != SEARCH_RUNNING && state != SEARCH_FINISHED) return;
    ULONGLONG now = GetTickCount64();
    if (!InterlockedCompareExchange(&search_dirty, 0, 0) ||
        (state == SEARCH_RUNNING && now - written < SEARCH_WRITE_MILLISECONDS)) return;
    wchar_t path[MAX_PATH], temporary[MAX_PATH];
    if (!search_path(path, L"result") || swprintf(temporary, MAX_PATH, L"%ls.new", path) < 0) return;
    InterlockedExchange(&search_dirty, 0);
    written = now;
    FILE *file = _wfopen(temporary, L"w");
    if (!file) return;
    LONG count = InterlockedCompareExchange(&search_found_count, 0, 0);
    // Read again after the count: a search that ended between the two reads is reported as ended.
    LONG result = InterlockedCompareExchange(&search_result, 0, 0);
    fprintf(file, "result=%s\ngalaxy=%u\ncentre=%03X%02X%03X%03X\nregions=%ld\nsystems=%ld\nplanets=%ld\nfound=%ld\n"
                  "distance=%d\nelapsed_ms=%ld\n",
            search_result_names[result], (unsigned)(search_centre >> 32 & 0xff),
            (unsigned)(search_centre >> 40 & 0xfff), (unsigned)(search_centre >> 24 & 0xff),
            (unsigned)(search_centre >> 12 & 0xfff), (unsigned)(search_centre & 0xfff),
            InterlockedCompareExchange(&search_regions, 0, 0), InterlockedCompareExchange(&search_systems, 0, 0),
            InterlockedCompareExchange(&search_planets, 0, 0), count, search_distance,
            InterlockedCompareExchange(&search_elapsed, 0, 0));
    for (LONG index = 0; index < count; ++index) {
        const search_planet_found *found = &search_found[index];
        fprintf(file, "planet=%X%03X%02X%03X%03X,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%06X,%d,%d\n",
                (unsigned)(found->address >> 52 & 0xf), (unsigned)(found->address >> 40 & 0xfff),
                (unsigned)(found->address >> 24 & 0xff), (unsigned)(found->address >> 12 & 0xfff),
                (unsigned)(found->address & 0xfff), found->biome, found->subtype, found->weather, found->storms,
                found->extreme, found->sentinels, found->race, found->star, found->economy, found->wealth,
                found->conflict, (unsigned)found->grass, found->distance, found->kind);
    }
    fclose(file);
    MoveFileExW(temporary, path, MOVEFILE_REPLACE_EXISTING);
}
