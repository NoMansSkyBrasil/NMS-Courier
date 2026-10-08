// Account domain of the build 180836 research profile: unlock titles, specials and season
// (expedition) rewards on the account through the game's own single-entry routines. Included once by
// profile_core.c.
//
// Observed offline on 2026-10-08 (docs/ACCOUNT_UNLOCK_NOTES.md): three routines take the account object
// and a 16-byte ID, check the ID against the game's own table, insert it into the account's set and
// mark the account data as changed. This file calls them and nothing else: it does not insert into a
// set itself and it does not touch a save slot. The account data is shared by every slot and is
// synchronised outside the machine.

#define ACCOUNT_TITLE_RVA 0x60ab50u
#define ACCOUNT_SPECIAL_RVA 0x60ad70u
#define ACCOUNT_SEASON_RVA 0x60ae70u
#define ACCOUNT_OBJECT_OFFSET 0x315748u        // from the manager object
#define ACCOUNT_TITLE_SET_OFFSET 0x140u        // from the account object: slot array at +0x10, end at +0x18
#define ACCOUNT_SPECIAL_SET_OFFSET 0x180u
#define ACCOUNT_SEASON_SET_OFFSET 0x1c0u
#define ACCOUNT_ID_SIZE 16u
#define ACCOUNT_REQUEST_CAPACITY 2048

enum { ACCOUNT_KIND_TITLE = 0, ACCOUNT_KIND_SPECIAL, ACCOUNT_KIND_SEASON, ACCOUNT_KIND_COUNT };
static const char *const account_kind_names[ACCOUNT_KIND_COUNT] = {"title", "special", "season"};
static const uint32_t account_set_offsets[ACCOUNT_KIND_COUNT] = {
    ACCOUNT_TITLE_SET_OFFSET, ACCOUNT_SPECIAL_SET_OFFSET, ACCOUNT_SEASON_SET_OFFSET
};

enum { ACCOUNT_PENDING = 0, ACCOUNT_UNLOCKED, ACCOUNT_NO_CHANGE, ACCOUNT_BLOCKED_ID, ACCOUNT_NOT_READY };
static const char *const account_result_names[] = {"pending", "unlocked", "no_change", "blocked_id", "not_ready"};

typedef uint8_t (*account_unlock_fn)(void *account, const char *id);

static account_unlock_fn account_unlock[ACCOUNT_KIND_COUNT];
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
    return memcmp((void *)(base + ACCOUNT_TITLE_RVA), title_entry, sizeof(title_entry)) == 0 &&
           memcmp((void *)(base + ACCOUNT_SPECIAL_RVA), special_entry, sizeof(special_entry)) == 0 &&
           memcmp((void *)(base + ACCOUNT_SEASON_RVA), season_entry, sizeof(season_entry)) == 0;
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
    LONG count = InterlockedCompareExchange(&account_count, 0, 0);
    for (LONG index = 0; index < count && index < ACCOUNT_REQUEST_CAPACITY; ++index) {
        LONG result;
        if (account_blocked_id(account_ids[index])) result = ACCOUNT_BLOCKED_ID;
        else if (!ready) result = ACCOUNT_NOT_READY;
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

// Parse the per-process request: one "<kind>=<ID>" per line, kind being title, special or season.
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
        fprintf(file, "requested=%ld\n", (long)count);
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
