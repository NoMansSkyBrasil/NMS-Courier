// Fish domain of the build 180836 research profile: fill the loaded slot's fishing record through
// the routine the game runs when a fish is caught. Included once by the profile source.
//
// Observed offline on 2026-10-07 (docs/REWARD_REDEMPTION_NOTES.md): the catch routine receives the
// fishing object, the fish's entry of the fish table and the catch size. It adds the fish to the
// record (count 1) or, for a recorded fish, adds one to its count and keeps the larger size. It also
// counts the catch in the game's statistics and runs the game's own milestone check. This file calls
// it once for every fish of the running game's table that is not recorded yet and that is not bound
// to a mission. The size is not known to the game table, so it is drawn at random (owner decision).

#define FISH_RECORD_RVA 0x4678d0u
#define FISH_OBJECT_OFFSET 0x307788u       // from the manager object
#define FISH_TABLE_HOLDER_OFFSET 0xe0u     // from the manager object: pointer to {entries, count}
#define FISH_ENTRY_SIZE 0x68u
#define FISH_ENTRY_PRODUCT_OFFSET 0x20u    // 16-byte product ID
#define FISH_ENTRY_MISSION_OFFSET 0x30u    // 16-byte mission ID; set for fish that only a mission gives
#define FISH_ENTRY_QUALITY_OFFSET 0x44u
#define FISH_RECORD_VECTOR_OFFSET 0x18u    // from the fishing object: capacity, count, pointer
#define FISH_RECORD_SIZE 0x18u             // product ID, catch count, largest size
#define FISH_TABLE_LIMIT 1024
#define FISH_SIZE_MINIMUM 1.0f
#define FISH_SIZE_MAXIMUM 100.0f

typedef uint8_t (*fish_record_fn)(void *fishing, const void *entry, float size);

static fish_record_fn fish_record;
static volatile LONG fish_state;           // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG fish_result[6] = {-1, -1, -1, -1, -1, -1};  // table, recorded, already, mission, refused, records after
__attribute__((unused)) static int fish_resolve(uintptr_t base) {
    static const unsigned char record_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x74, 0x24, 0x10, 0x57, 0x48,
        0x81, 0xec, 0xa0, 0x00, 0x00, 0x00, 0xff, 0x41, 0x30, 0x48, 0x8b, 0xda,
        0x83, 0x7a, 0x44, 0x00, 0x48, 0x8b, 0xf9, 0x0f
    };
    fish_record = (fish_record_fn)(base + FISH_RECORD_RVA);
    return memcmp((void *)(base + FISH_RECORD_RVA), record_entry, sizeof(record_entry)) == 0;
}

static int fish_readable(const void *address, size_t length) {
    MEMORY_BASIC_INFORMATION memory;
    return address && VirtualQuery(address, &memory, sizeof(memory)) == sizeof(memory) &&
           memory.State == MEM_COMMIT && !(memory.Protect & (PAGE_GUARD | PAGE_NOACCESS)) &&
           (uintptr_t)address + length <= (uintptr_t)memory.BaseAddress + memory.RegionSize;
}

// A 16-byte ID field holding 1 to 15 characters of A-Z, 0-9 and underscore, zero padded.
static int fish_valid_id(const char *id) {
    size_t length = 0;
    while (length < 16 && id[length]) {
        char c = id[length];
        if (!((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '_')) return 0;
        ++length;
    }
    if (length == 0 || length >= 16) return 0;
    for (size_t rest = length; rest < 16; ++rest) if (id[rest]) return 0;
    return 1;
}

// Chosen fish (bridge 1.20.0): the per-process request file native-fish-request holds either the
// single line "all=1" or one "id=<product ID>" per line. Without a file every fish is recorded, as
// before. A count below zero means every fish.
#define FISH_REQUEST_CAPACITY 512
static char fish_requested[FISH_REQUEST_CAPACITY][16];
static volatile LONG fish_requested_count = -1;
static volatile LONG fish_not_named;       // fish left alone because the request did not name them

static int fish_named(const char *product) {
    LONG count = InterlockedCompareExchange(&fish_requested_count, 0, 0);
    if (count < 0) return 1;
    for (LONG index = 0; index < count; ++index)
        if (memcmp(fish_requested[index], product, 16) == 0) return 1;
    return 0;
}

// Reads the request; 0 when the file exists and is malformed, so that nothing is recorded.
static int fish_read_request(void) {
    wchar_t root[MAX_PATH], path[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    InterlockedExchange(&fish_requested_count, -1);
    if (!length || length >= MAX_PATH ||
        swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-fish-request-180836-%lu.txt",
                 root, (unsigned long)GetCurrentProcessId()) <= 0) return 1;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 1;
    char line[64];
    LONG count = 0;
    int all = 0, ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if (strcmp(line, "all=1") == 0) { all = 1; continue; }
        size_t size = strlen(line);
        if (strncmp(line, "id=", 3) != 0 || size < 4 || size > 3 + 15 || count >= FISH_REQUEST_CAPACITY) { ok = 0; break; }
        memset(fish_requested[count], 0, 16);
        memcpy(fish_requested[count], line + 3, size - 3);
        if (!fish_valid_id(fish_requested[count])) { ok = 0; break; }
        ++count;
    }
    fclose(file);
    if (!ok || (all && count) || (!all && !count)) return 0;
    InterlockedExchange(&fish_requested_count, all ? -1 : count);
    return 1;
}

// 1 when the fishing record already has this product, 0 when not, -1 when the record is unreadable.
static int fish_recorded(const uint8_t *fishing, const char *product) {
    uint32_t count = *(const uint32_t *)(fishing + FISH_RECORD_VECTOR_OFFSET + 4);
    const uint8_t *records = *(const uint8_t *const *)(fishing + FISH_RECORD_VECTOR_OFFSET + 8);
    if (count == 0) return 0;
    if (count > 4096 || !fish_readable(records, (size_t)count * FISH_RECORD_SIZE)) return -1;
    for (uint32_t index = 0; index < count; ++index)
        if (memcmp(records + (size_t)index * FISH_RECORD_SIZE, product, 16) == 0) return 1;
    return 0;
}

// Runs on the game's update thread: record one catch for every fish that has none.
static void fish_apply_request(void) {
    LONG table_count = -1, recorded = 0, already = 0, mission = 0, refused = 0, after = -1, not_named = 0;
    // The routine stays unresolved in the fixture build, where no game manager exists.
    uintptr_t manager = fish_record
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    const uint8_t *holder = manager ? *(const uint8_t *const *)(manager + FISH_TABLE_HOLDER_OFFSET) : NULL;
    const uint8_t *entries = NULL;
    if (fish_readable(holder, 16)) {
        entries = *(const uint8_t *const *)holder;
        table_count = *(const int32_t *)(holder + 8);
    }
    uint8_t *fishing = (uint8_t *)(manager + FISH_OBJECT_OFFSET);
    if (table_count > 0 && table_count <= FISH_TABLE_LIMIT &&
        fish_readable(entries, (size_t)table_count * FISH_ENTRY_SIZE) &&
        writable_range((uintptr_t)fishing, 0x40)) {
        LARGE_INTEGER counter;
        QueryPerformanceCounter(&counter);
        uint32_t random = (uint32_t)counter.LowPart | 1u;
        for (LONG index = 0; index < table_count; ++index) {
            const uint8_t *entry = entries + (size_t)index * FISH_ENTRY_SIZE;
            const char *product = (const char *)entry + FISH_ENTRY_PRODUCT_OFFSET;
            int32_t quality = *(const int32_t *)(entry + FISH_ENTRY_QUALITY_OFFSET);
            if (!fish_valid_id(product) || quality < 0 || quality > 4) { ++refused; continue; }
            // Fish that exist only while a mission runs are not part of the catalogue a player fills.
            if (entry[FISH_ENTRY_MISSION_OFFSET]) { ++mission; continue; }
            if (!fish_named(product)) { ++not_named; continue; }
            int known = fish_recorded(fishing, product);
            if (known < 0) { ++refused; continue; }
            if (known) { ++already; continue; }
            random ^= random << 13; random ^= random >> 17; random ^= random << 5;
            float size = FISH_SIZE_MINIMUM + (FISH_SIZE_MAXIMUM - FISH_SIZE_MINIMUM) * (float)(random >> 8) / 16777215.0f;
            fish_record(fishing, entry, size);
            ++recorded;
        }
        after = (LONG)*(const uint32_t *)(fishing + FISH_RECORD_VECTOR_OFFSET + 4);
    }
    InterlockedExchange(&fish_result[0], table_count);
    InterlockedExchange(&fish_result[1], recorded);
    InterlockedExchange(&fish_result[2], already);
    InterlockedExchange(&fish_result[3], mission);
    InterlockedExchange(&fish_result[4], refused);
    InterlockedExchange(&fish_result[5], after);
    InterlockedExchange(&fish_not_named, not_named);
    InterlockedExchange(&fish_state, 2);
}

// Called from the worker thread after the game thread applied the request.
static void fish_write_result(void) {
    wchar_t root[MAX_PATH], path[MAX_PATH];
    if (InterlockedCompareExchange(&fish_state, 0, 0) != 2) return;
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    if (length && length < MAX_PATH &&
        swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-fish-result-180836-%lu.txt",
                 root, (unsigned long)GetCurrentProcessId()) > 0) {
        FILE *file = _wfopen(path, L"w");
        if (file) {
            fprintf(file, "table_fish=%ld\nrecorded=%ld\nalready_recorded=%ld\nmission_only_skipped=%ld\n"
                          "refused_table_entries=%ld\nrecords_after=%ld\nnot_named=%ld\n",
                    (long)InterlockedCompareExchange(&fish_result[0], 0, 0),
                    (long)InterlockedCompareExchange(&fish_result[1], 0, 0),
                    (long)InterlockedCompareExchange(&fish_result[2], 0, 0),
                    (long)InterlockedCompareExchange(&fish_result[3], 0, 0),
                    (long)InterlockedCompareExchange(&fish_result[4], 0, 0),
                    (long)InterlockedCompareExchange(&fish_result[5], 0, 0),
                    (long)InterlockedCompareExchange(&fish_not_named, 0, 0));
            fclose(file);
        }
    }
    InterlockedExchange(&fish_state, 0);
}
