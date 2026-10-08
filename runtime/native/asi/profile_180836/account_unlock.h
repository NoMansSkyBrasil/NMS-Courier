// Account domain of the build 180836 research profile: unlock titles, specials, season (expedition),
// Twitch and platform rewards on the account. Included once by profile_core.c.
//
// Observed offline on 2026-10-08 (docs/ACCOUNT_UNLOCK_NOTES.md): for titles, specials and season
// rewards three routines take the account object and a 16-byte ID, check the ID against the game's own
// table, insert it into the account's set and mark the account data as changed. This file calls them.
//
// Twitch and platform rewards have no such routine: the game only fills those sets in bulk when it
// applies loaded settings. For these two kinds this file does what the season routine does, step by
// step, with the game's own helpers: look the ID up in the game's map of that kind, insert it into the
// account's set with the game's container routine, and mark the account data as changed. That is a
// DIRECT WRITE through native helpers, not a call of a game unlock routine, and is reported as such.
//
// Nothing here touches a save slot. The account data is shared by every slot and is synchronised
// outside the machine.

#define ACCOUNT_TITLE_RVA 0x60ab50u
#define ACCOUNT_SPECIAL_RVA 0x60ad70u
#define ACCOUNT_SEASON_RVA 0x60ae70u
#define ACCOUNT_OBJECT_OFFSET 0x315748u        // from the manager object
#define ACCOUNT_TITLE_SET_OFFSET 0x140u        // from the account object: slot array at +0x10, end at +0x18
#define ACCOUNT_SPECIAL_SET_OFFSET 0x180u
#define ACCOUNT_SEASON_SET_OFFSET 0x1c0u
#define ACCOUNT_TWITCH_SET_OFFSET 0x200u
#define ACCOUNT_PLATFORM_SET_OFFSET 0x240u
#define ACCOUNT_PENDING_TWITCH_COUNT_OFFSET 0x294u    // plain lists the bulk routine may use instead of the sets
#define ACCOUNT_PENDING_PLATFORM_COUNT_OFFSET 0x2a4u
#define ACCOUNT_CHANGED_OFFSET 0x2b0u
#define ACCOUNT_LISTS_READY_OFFSET 0x2b1u             // the bulk routine filters into the sets only when non-zero
#define ACCOUNT_MAP_LOOKUP_RVA 0x567610u
#define ACCOUNT_SET_INSERT_RVA 0x3df740u
#define ACCOUNT_DIRTY_COUNTER_POINTER_RVA 0x6e1d098u  // the season routine increments a byte at +0xc of this object
#define ACCOUNT_TWITCH_MAP_OFFSET 0x920u              // from the manager object: entries at +0x10, end at +0x18
#define ACCOUNT_PLATFORM_MAP_OFFSET 0x960u
#define ACCOUNT_MAP_ENTRY_SIZE 24u
#define ACCOUNT_ID_SIZE 16u
#define ACCOUNT_REQUEST_CAPACITY 2048

enum {
    ACCOUNT_KIND_TITLE = 0, ACCOUNT_KIND_SPECIAL, ACCOUNT_KIND_SEASON,
    ACCOUNT_KIND_TWITCH, ACCOUNT_KIND_PLATFORM,     // the two direct-write kinds
    ACCOUNT_KIND_COUNT
};
#define ACCOUNT_ROUTINE_KINDS 3
static const char *const account_kind_names[ACCOUNT_KIND_COUNT] = {"title", "special", "season", "twitch", "platform"};
static const uint32_t account_set_offsets[ACCOUNT_KIND_COUNT] = {
    ACCOUNT_TITLE_SET_OFFSET, ACCOUNT_SPECIAL_SET_OFFSET, ACCOUNT_SEASON_SET_OFFSET,
    ACCOUNT_TWITCH_SET_OFFSET, ACCOUNT_PLATFORM_SET_OFFSET
};

enum {
    ACCOUNT_PENDING = 0, ACCOUNT_UNLOCKED, ACCOUNT_NO_CHANGE, ACCOUNT_BLOCKED_ID, ACCOUNT_NOT_READY,
    ACCOUNT_INSERTED,           // direct write: the ID was added to the set
    ACCOUNT_PRESENT,            // direct write: the container reported the ID as already there
    ACCOUNT_UNKNOWN_ID,         // direct write: the game's own map of that kind does not hold the ID
    ACCOUNT_INSERT_FAILED       // direct write: the container routine reported failure; nothing written
};
static const char *const account_result_names[] = {
    "pending", "unlocked", "no_change", "blocked_id", "not_ready", "inserted", "present", "unknown_id",
    "insert_failed"
};

typedef uint8_t (*account_unlock_fn)(void *account, const char *id);
typedef uint64_t (*account_map_lookup_fn)(void *map, const char *id);
typedef void (*account_set_insert_fn)(void *set, void *out, const char *id);

static account_unlock_fn account_unlock[ACCOUNT_ROUTINE_KINDS];
static account_map_lookup_fn account_map_lookup;
static account_set_insert_fn account_set_insert;
static volatile LONG account_lists_ready = -1;
static volatile LONG account_pending_twitch = -1;
static volatile LONG account_pending_platform = -1;
static char account_ids[ACCOUNT_REQUEST_CAPACITY][ACCOUNT_ID_SIZE];
static uint8_t account_kinds[ACCOUNT_REQUEST_CAPACITY];
static volatile LONG account_results[ACCOUNT_REQUEST_CAPACITY];
static volatile LONG account_count;
static volatile LONG account_state;        // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG account_before[ACCOUNT_KIND_COUNT];
static volatile LONG account_after[ACCOUNT_KIND_COUNT];

// Repeatable purchases must never be unlocked: the shop stops selling them (fireworks, Myth Beacon,
// Void Egg). Same rule as the product and reward domains.
static int account_blocked_id(const char *id) {
    return strncmp(id, "SPEC_FIREWORK", 13) == 0 || strncmp(id, "EXPD_FIREWORK", 13) == 0 ||
           strcmp(id, "MYSTERY_BEACON") == 0 || strcmp(id, "ODD_EGG") == 0;
}

__attribute__((unused)) static int account_resolve(uintptr_t base) {
    static const unsigned char title_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x10, 0x48, 0x89, 0x6c, 0x24, 0x20, 0x57, 0x48,
        0x83, 0xec, 0x70, 0x48, 0x8b, 0x05, 0xa2, 0x2b, 0x88, 0x06, 0x48, 0x8b,
        0xfa, 0x48, 0x8b, 0xe9, 0x4c, 0x8b, 0xc2, 0x48
    };
    static const unsigned char special_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x6c, 0x24, 0x10, 0x48, 0x89,
        0x74, 0x24, 0x18, 0x57, 0x48, 0x83, 0xec, 0x40, 0x48, 0x8b, 0x3d, 0x7d,
        0x29, 0x88, 0x06, 0x48, 0x8b, 0xe9, 0x48, 0x8b
    };
    static const unsigned char season_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x6c, 0x24, 0x10, 0x48, 0x89,
        0x74, 0x24, 0x18, 0x57, 0x48, 0x83, 0xec, 0x40, 0x48, 0x8b, 0x3d, 0x7d,
        0x28, 0x88, 0x06, 0x48, 0x8b, 0xf1, 0x48, 0x8b
    };
    account_unlock[ACCOUNT_KIND_TITLE] = (account_unlock_fn)(base + ACCOUNT_TITLE_RVA);
    account_unlock[ACCOUNT_KIND_SPECIAL] = (account_unlock_fn)(base + ACCOUNT_SPECIAL_RVA);
    account_unlock[ACCOUNT_KIND_SEASON] = (account_unlock_fn)(base + ACCOUNT_SEASON_RVA);
    static const unsigned char lookup_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x10, 0x48, 0x89, 0x7c, 0x24, 0x18, 0x48, 0x8b,
        0x5a, 0x08, 0x4c, 0x8b, 0xd1, 0x4c, 0x8b, 0x1a, 0x48, 0xb9, 0xdb, 0x28,
        0xb4, 0xa0, 0xd1, 0x7e, 0x03, 0xe7, 0x48, 0x8b
    };
    static const unsigned char insert_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x6c, 0x24, 0x10, 0x48, 0x89,
        0x74, 0x24, 0x18, 0x57, 0x41, 0x54, 0x41, 0x55, 0x41, 0x56, 0x41, 0x57,
        0x48, 0x83, 0xec, 0x20, 0x33, 0xf6, 0x4d, 0x8b
    };
    account_map_lookup = (account_map_lookup_fn)(base + ACCOUNT_MAP_LOOKUP_RVA);
    account_set_insert = (account_set_insert_fn)(base + ACCOUNT_SET_INSERT_RVA);
    return memcmp((void *)(base + ACCOUNT_TITLE_RVA), title_entry, sizeof(title_entry)) == 0 &&
           memcmp((void *)(base + ACCOUNT_SPECIAL_RVA), special_entry, sizeof(special_entry)) == 0 &&
           memcmp((void *)(base + ACCOUNT_SEASON_RVA), season_entry, sizeof(season_entry)) == 0 &&
           memcmp((void *)(base + ACCOUNT_MAP_LOOKUP_RVA), lookup_entry, sizeof(lookup_entry)) == 0 &&
           memcmp((void *)(base + ACCOUNT_SET_INSERT_RVA), insert_entry, sizeof(insert_entry)) == 0;
}

// Direct write for the kinds without a game routine, mirroring the season routine: the ID must be in the
// game's own map of that kind; the game's container routine finds or makes the slot; this code stores
// the ID where the routine says and marks the account data changed.
static LONG account_insert_listed(uint8_t *manager, uint8_t *account, int kind, const char *id) {
    uint8_t *map = manager + (kind == ACCOUNT_KIND_TWITCH ? ACCOUNT_TWITCH_MAP_OFFSET : ACCOUNT_PLATFORM_MAP_OFFSET);
    uint8_t *set = account + account_set_offsets[kind];
    const uint8_t *entries = *(const uint8_t *const *)(map + 0x10), *end = *(const uint8_t *const *)(map + 0x18);
    if (!entries || end < entries || !writable_range((uintptr_t)map, 0x40)) return ACCOUNT_NOT_READY;
    const uint8_t *entry = entries + account_map_lookup(map, id) * ACCOUNT_MAP_ENTRY_SIZE;
    if (entry < entries || entry >= end || *(const uint64_t *)(entry + 0x10) == 0) return ACCOUNT_UNKNOWN_ID;
    struct { uint64_t index; uint32_t status; uint32_t unused; } placed = {0, 0, 0};
    char copy[ACCOUNT_ID_SIZE];
    memcpy(copy, id, sizeof(copy));
    account_set_insert(set, &placed, copy);
    if (placed.status == 0) return ACCOUNT_INSERT_FAILED;
    LONG result = ACCOUNT_PRESENT;
    if (placed.status == 2 || placed.status == 3) {
        uint8_t *slots = *(uint8_t *const *)(set + 0x10), *slots_end = *(uint8_t *const *)(set + 0x18);
        uint8_t *slot = slots + placed.index * ACCOUNT_ID_SIZE;
        if (!slots || slot < slots || slot + ACCOUNT_ID_SIZE > slots_end) return ACCOUNT_INSERT_FAILED;
        memcpy(slot, copy, ACCOUNT_ID_SIZE);
        result = ACCOUNT_INSERTED;
    }
    account[ACCOUNT_CHANGED_OFFSET] = 1;
    uint8_t *dirty = *(uint8_t *const *)((uintptr_t)GetModuleHandleW(NULL) + ACCOUNT_DIRTY_COUNTER_POINTER_RVA);
    if (dirty) ++dirty[0xc];
    return result;
}

// Entries of one account set, or -1 when it does not look like one.
static LONG account_set_entries(const uint8_t *account, uint32_t offset) {
    const uint8_t *set = account + offset;
    const uint8_t *data = *(const uint8_t *const *)(set + 0x10), *end = *(const uint8_t *const *)(set + 0x18);
    MEMORY_BASIC_INFORMATION memory;
    if (!data || end < data || (size_t)(end - data) > 16u * 65536u || ((size_t)(end - data) % ACCOUNT_ID_SIZE) != 0)
        return -1;
    if (end == data) return 0;
    if (VirtualQuery(data, &memory, sizeof(memory)) != sizeof(memory) || memory.State != MEM_COMMIT ||
        (memory.Protect & (PAGE_GUARD | PAGE_NOACCESS)) ||
        (uintptr_t)end > (uintptr_t)memory.BaseAddress + memory.RegionSize) return -1;
    LONG entries = 0;
    for (const uint8_t *slot = data; slot < end; slot += ACCOUNT_ID_SIZE) entries += slot[0] != 0;
    return entries;
}

// Runs on the game's update thread: unlock each requested ID on the account, once.
static void account_apply_request(void) {
    // The routines stay unresolved in the fixture build, where no game manager exists.
    uintptr_t manager = account_unlock[ACCOUNT_KIND_TITLE]
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    uint8_t *account = (uint8_t *)(manager + ACCOUNT_OBJECT_OFFSET);
    int ready = manager && writable_range((uintptr_t)account, 0x2c0);
    for (int kind = 0; ready && kind < ACCOUNT_KIND_COUNT; ++kind) {
        LONG entries = account_set_entries(account, account_set_offsets[kind]);
        InterlockedExchange(&account_before[kind], entries);
        if (entries < 0) ready = 0;
    }
    if (ready) {
        InterlockedExchange(&account_lists_ready, account[ACCOUNT_LISTS_READY_OFFSET]);
        InterlockedExchange(&account_pending_twitch, *(const int32_t *)(account + ACCOUNT_PENDING_TWITCH_COUNT_OFFSET));
        InterlockedExchange(&account_pending_platform, *(const int32_t *)(account + ACCOUNT_PENDING_PLATFORM_COUNT_OFFSET));
    }
    LONG count = InterlockedCompareExchange(&account_count, 0, 0);
    for (LONG index = 0; index < count && index < ACCOUNT_REQUEST_CAPACITY; ++index) {
        LONG result;
        if (account_blocked_id(account_ids[index])) result = ACCOUNT_BLOCKED_ID;
        else if (!ready) result = ACCOUNT_NOT_READY;
        else if (account_kinds[index] >= ACCOUNT_ROUTINE_KINDS)
            result = account_insert_listed((uint8_t *)manager, account, account_kinds[index], account_ids[index]);
        else result = account_unlock[account_kinds[index]](account, account_ids[index])
            ? ACCOUNT_UNLOCKED : ACCOUNT_NO_CHANGE;
        InterlockedExchange(&account_results[index], result);
    }
    for (int kind = 0; ready && kind < ACCOUNT_KIND_COUNT; ++kind)
        InterlockedExchange(&account_after[kind], account_set_entries(account, account_set_offsets[kind]));
    InterlockedExchange(&account_state, 2);
}

static int account_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-account-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: one "<kind>=<ID>" per line, kind being title, special, season, twitch
// or platform.
// Any other content, a malformed ID, a duplicate or more than the capacity rejects the whole request.
static int account_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&account_state, 0, 0) != 0 || !account_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG count = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        const char *separator = strchr(line, '=');
        int kind = -1;
        for (int candidate = 0; separator && candidate < ACCOUNT_KIND_COUNT; ++candidate)
            if (strlen(account_kind_names[candidate]) == (size_t)(separator - line) &&
                strncmp(line, account_kind_names[candidate], (size_t)(separator - line)) == 0) kind = candidate;
        const char *id = separator ? separator + 1 : "";
        size_t length = strlen(id);
        if (kind < 0 || length < 1 || length > ACCOUNT_ID_SIZE - 1 || count >= ACCOUNT_REQUEST_CAPACITY) {
            ok = 0;
            break;
        }
        for (const char *cursor = id; *cursor; ++cursor)
            if (!((*cursor >= 'A' && *cursor <= 'Z') || (*cursor >= '0' && *cursor <= '9') || *cursor == '_')) ok = 0;
        // A linear duplicate check is enough for a request of this size.
        for (LONG seen = 0; ok && seen < count; ++seen)
            if (account_kinds[seen] == kind && strcmp(account_ids[seen], id) == 0) ok = 0;
        if (!ok) break;
        memset(account_ids[count], 0, sizeof(account_ids[count]));
        memcpy(account_ids[count], id, length);
        account_kinds[count] = (uint8_t)kind;
        InterlockedExchange(&account_results[count], ACCOUNT_PENDING);
        ++count;
    }
    fclose(file);
    if (!ok || count == 0) return 0;
    InterlockedExchange(&account_count, count);
    for (int kind = 0; kind < ACCOUNT_KIND_COUNT; ++kind) {
        InterlockedExchange(&account_before[kind], -1);
        InterlockedExchange(&account_after[kind], -1);
    }
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void account_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&account_state, 0, 0) != 2 || !account_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        LONG count = InterlockedCompareExchange(&account_count, 0, 0);
        fprintf(file, "requested=%ld\nlists_ready_flag=%ld\npending_twitch_list=%ld\npending_platform_list=%ld\n",
                (long)count, (long)InterlockedCompareExchange(&account_lists_ready, 0, 0),
                (long)InterlockedCompareExchange(&account_pending_twitch, 0, 0),
                (long)InterlockedCompareExchange(&account_pending_platform, 0, 0));
        for (int kind = 0; kind < ACCOUNT_KIND_COUNT; ++kind)
            fprintf(file, "%s_before=%ld\n%s_after=%ld\n", account_kind_names[kind],
                    (long)InterlockedCompareExchange(&account_before[kind], 0, 0), account_kind_names[kind],
                    (long)InterlockedCompareExchange(&account_after[kind], 0, 0));
        for (LONG index = 0; index < count; ++index)
            fprintf(file, "%s:%.16s=%s\n", account_kind_names[account_kinds[index]], account_ids[index],
                    account_result_names[InterlockedCompareExchange(&account_results[index], 0, 0)]);
        fclose(file);
    }
    InterlockedExchange(&account_state, 0);
}
