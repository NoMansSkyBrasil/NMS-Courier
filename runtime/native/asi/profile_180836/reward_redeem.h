// Reward domain of the build 180836 research profile: mark season (expedition), Twitch and platform
// rewards as redeemed in the loaded save slot through the game's own routine. Included once by the
// profile source; it is not a shared helper.
//
// Observed offline on 2026-10-07 (docs/REWARD_REDEMPTION_NOTES.md): after the shipped season reward
// unlocks an ID on the account, its handler calls one routine with the player state and the ID. That
// routine adds the matching special to the slot's known specials and, when the ID is in the season,
// Twitch or platform table, records it in the slot's redeemed set for that kind. This file calls that
// routine and nothing else: it does not touch the account lists.

#define REWARD_REDEEM_RVA 0x5ab380u
#define REWARD_PLAYER_STATE_OFFSET 0xb940u     // from the manager object
#define REWARD_SEASON_SET_OFFSET 0xa8ac0u      // from the player state: slot array at +0x10, end at +0x18
#define REWARD_ID_SIZE 16u
#define REWARD_REQUEST_CAPACITY 512

enum { REWARD_PENDING = 0, REWARD_CHANGED, REWARD_NO_CHANGE, REWARD_BLOCKED_ID, REWARD_NOT_READY };
static const char *const reward_result_names[] = {"pending", "changed", "no_change", "blocked_id", "not_ready"};

typedef uint8_t (*reward_redeem_fn)(void *player_state, const char *reward_id);

static reward_redeem_fn reward_redeem;
static char reward_ids[REWARD_REQUEST_CAPACITY][REWARD_ID_SIZE];
static volatile LONG reward_results[REWARD_REQUEST_CAPACITY];
static volatile LONG reward_count;
static volatile LONG reward_state;         // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG reward_season_before = -1;
static volatile LONG reward_season_after = -1;

// Repeatable purchases must never be marked known or redeemed: the shop stops selling them. The table
// flag is IsConsumable; until that flag is read from the running game these are refused by ID.
static int reward_blocked_id(const char *id) {
    return strncmp(id, "SPEC_FIREWORK", 13) == 0 || strstr(id, "FIREWORK") != NULL ||
           strcmp(id, "MYSTERY_BEACON") == 0 || strcmp(id, "ODD_EGG") == 0;
}

__attribute__((unused)) static int reward_resolve(uintptr_t base) {
    static const unsigned char redeem_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x6c, 0x24, 0x10, 0x48, 0x89,
        0x74, 0x24, 0x18, 0x48, 0x89, 0x7c, 0x24, 0x20, 0x41, 0x56, 0x48, 0x83,
        0xec, 0x40, 0x48, 0x8b, 0x3d, 0x67, 0x23, 0x8e
    };
    reward_redeem = (reward_redeem_fn)(base + REWARD_REDEEM_RVA);
    return memcmp((void *)(base + REWARD_REDEEM_RVA), redeem_entry, sizeof(redeem_entry)) == 0;
}

// Entries of the slot's redeemed season set, or -1 when it does not look like one.
static LONG reward_season_entries(const uint8_t *player_state) {
    const uint8_t *set = player_state + REWARD_SEASON_SET_OFFSET;
    const uint8_t *data = *(const uint8_t *const *)(set + 0x10), *end = *(const uint8_t *const *)(set + 0x18);
    MEMORY_BASIC_INFORMATION memory;
    if (!data || end < data || (size_t)(end - data) > 16u * 65536u || ((size_t)(end - data) % REWARD_ID_SIZE) != 0)
        return -1;
    if (end == data) return 0;
    if (VirtualQuery(data, &memory, sizeof(memory)) != sizeof(memory) || memory.State != MEM_COMMIT ||
        (memory.Protect & (PAGE_GUARD | PAGE_NOACCESS)) ||
        (uintptr_t)end > (uintptr_t)memory.BaseAddress + memory.RegionSize) return -1;
    LONG entries = 0;
    for (const uint8_t *slot = data; slot < end; slot += REWARD_ID_SIZE) entries += slot[0] != 0;
    return entries;
}

// Runs on the game's update thread: redeem each requested reward in the loaded slot.
static void reward_apply_request(void) {
    // The routine stays unresolved in the fixture build, where no game manager exists.
    uintptr_t manager = reward_redeem
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    uint8_t *player_state = (uint8_t *)(manager + REWARD_PLAYER_STATE_OFFSET);
    int ready = manager && writable_range((uintptr_t)player_state + REWARD_SEASON_SET_OFFSET, 0x40);
    LONG count = InterlockedCompareExchange(&reward_count, 0, 0);
    if (ready) InterlockedExchange(&reward_season_before, reward_season_entries(player_state));
    for (LONG index = 0; index < count && index < REWARD_REQUEST_CAPACITY; ++index) {
        LONG result;
        if (reward_blocked_id(reward_ids[index])) result = REWARD_BLOCKED_ID;
        else if (!ready) result = REWARD_NOT_READY;
        else result = reward_redeem(player_state, reward_ids[index]) ? REWARD_CHANGED : REWARD_NO_CHANGE;
        InterlockedExchange(&reward_results[index], result);
    }
    if (ready) InterlockedExchange(&reward_season_after, reward_season_entries(player_state));
    InterlockedExchange(&reward_state, 2);
}

static int reward_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-redeem-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: one "id=<ID>" per line. Any other content, a malformed ID, a
// duplicate or more than the capacity rejects the whole request.
static int reward_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&reward_state, 0, 0) != 0 || !reward_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG count = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        size_t length = strlen(line);
        if (strncmp(line, "id=", 3) != 0 || length < 4 || length > 3 + REWARD_ID_SIZE - 1 ||
            count >= REWARD_REQUEST_CAPACITY) {
            ok = 0;
            break;
        }
        for (const char *cursor = line + 3; *cursor; ++cursor)
            if (!((*cursor >= 'A' && *cursor <= 'Z') || (*cursor >= '0' && *cursor <= '9') || *cursor == '_')) ok = 0;
        for (LONG seen = 0; ok && seen < count; ++seen)
            if (strcmp(reward_ids[seen], line + 3) == 0) ok = 0;
        if (!ok) break;
        memset(reward_ids[count], 0, sizeof(reward_ids[count]));
        memcpy(reward_ids[count], line + 3, length - 3);
        InterlockedExchange(&reward_results[count], REWARD_PENDING);
        ++count;
    }
    fclose(file);
    if (!ok || count == 0) return 0;
    InterlockedExchange(&reward_count, count);
    InterlockedExchange(&reward_season_before, -1);
    InterlockedExchange(&reward_season_after, -1);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void reward_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&reward_state, 0, 0) != 2 || !reward_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        LONG count = InterlockedCompareExchange(&reward_count, 0, 0);
        fprintf(file, "requested=%ld\nseason_redeemed_before=%ld\nseason_redeemed_after=%ld\n", (long)count,
                (long)InterlockedCompareExchange(&reward_season_before, 0, 0),
                (long)InterlockedCompareExchange(&reward_season_after, 0, 0));
        for (LONG index = 0; index < count; ++index)
            fprintf(file, "%.16s=%s\n", reward_ids[index],
                    reward_result_names[InterlockedCompareExchange(&reward_results[index], 0, 0)]);
        fclose(file);
    }
    InterlockedExchange(&reward_state, 0);
}
