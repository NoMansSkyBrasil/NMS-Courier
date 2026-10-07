// Recipe domain of the build 180836 research profile: teach known refiner and cooking recipes through
// the game's own routine. Included once by the profile source; it is not a shared helper.
//
// Observed offline on 2026-10-07 (docs/RECIPE_DELIVERY_NOTES.md): when a save is loaded the game merges
// lists of known things into the player state with one routine. Its source argument holds plain
// (pointer, count) lists; the recipe list is at +0x10 with 32-byte IDs. For each recipe the routine
// requires the ID in the game's recipe table, skips IDs already known and inserts the rest into the
// known-recipe set. This file builds such a source with only the recipe list filled and calls it.

#define RECIPE_MERGE_RVA 0x5a1670u
#define RECIPE_KNOWN_RVA 0x5aad90u
#define RECIPE_TABLE_HOLDER_OFFSET 0xb8u       // from the manager object: pointer to {entries, count}
#define RECIPE_ENTRY_SIZE 0x90u
#define RECIPE_ID_SIZE 32u
#define RECIPE_PLAYER_STATE_OFFSET 0xb940u     // from the manager object
#define RECIPE_SOURCE_SIZE 0x60u
#define RECIPE_SOURCE_LIST_OFFSET 0x10u        // pointer, then a 32-bit count at +0x18
#define RECIPE_CAPACITY 4096
// Besides the lists of its source argument, the merge routine also walks two lists held by the manager
// and adds their entries to the known technologies and known products. They are read here only to
// refuse the call unless every one of their entries is already known, so that the call can add
// nothing but recipes.
#define RECIPE_DEFAULT_TECH_LIST_OFFSET 0x4c5cd8u      // from the manager: pointer, 32-bit count at +8
#define RECIPE_DEFAULT_PRODUCT_LIST_OFFSET 0x4c5cc8u
#define RECIPE_KNOWN_TECH_VECTOR_OFFSET 0x18730u       // from the player state: capacity, count, pointer
#define RECIPE_KNOWN_PRODUCT_VECTOR_OFFSET 0x18740u
#define RECIPE_SHORT_ID_SIZE 16u
#define RECIPE_SIDE_LIST_LIMIT 8192

typedef void (*recipe_merge_fn)(void *player_state, const void *source, uint8_t include_products_and_recipes);
typedef uint8_t (*recipe_known_fn)(void *player_state, const char *recipe_id);

static recipe_merge_fn recipe_merge;
static recipe_known_fn recipe_known;
static char recipe_requested[RECIPE_CAPACITY][RECIPE_ID_SIZE];
static char recipe_buffer[RECIPE_CAPACITY][RECIPE_ID_SIZE];
static volatile LONG recipe_all;
static volatile LONG recipe_requested_count;
static volatile LONG recipe_state;          // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG recipe_result[7] = {-1, -1, -1, -1, -1, -1, -1};  // table, sent, unknown, before, after, refused, side effect

__attribute__((unused)) static int recipe_resolve(uintptr_t base) {
    static const unsigned char merge_entry[32] = {
        0x44, 0x88, 0x44, 0x24, 0x18, 0x55, 0x53, 0x57, 0x41, 0x55, 0x41, 0x57,
        0x48, 0x8d, 0x6c, 0x24, 0xa0, 0x48, 0x81, 0xec, 0x60, 0x01, 0x00, 0x00,
        0x48, 0x8b, 0x5a, 0x30, 0x4c, 0x8b, 0xea, 0x48
    };
    static const unsigned char known_entry[32] = {
        0x40, 0x53, 0x48, 0x83, 0xec, 0x20, 0x48, 0x8d, 0x99, 0x50, 0x87, 0x01,
        0x00, 0x48, 0x8b, 0xcb, 0xe8, 0x3b, 0x4c, 0x02, 0x00, 0x48, 0xc1, 0xe0,
        0x05, 0x48, 0x03, 0x43, 0x10, 0x48, 0x3b, 0x43
    };
    recipe_merge = (recipe_merge_fn)(base + RECIPE_MERGE_RVA);
    recipe_known = (recipe_known_fn)(base + RECIPE_KNOWN_RVA);
    return memcmp((void *)(base + RECIPE_MERGE_RVA), merge_entry, sizeof(merge_entry)) == 0 &&
           memcmp((void *)(base + RECIPE_KNOWN_RVA), known_entry, sizeof(known_entry)) == 0;
}

static int recipe_readable(const void *address, size_t length) {
    MEMORY_BASIC_INFORMATION memory;
    return address && VirtualQuery(address, &memory, sizeof(memory)) == sizeof(memory) &&
           memory.State == MEM_COMMIT && !(memory.Protect & (PAGE_GUARD | PAGE_NOACCESS)) &&
           (uintptr_t)address + length <= (uintptr_t)memory.BaseAddress + memory.RegionSize;
}

// 1 when every 16-byte ID of a manager list is already in the given known vector of the player state,
// so the merge routine has nothing to add from it. Unreadable or implausible data counts as 0.
static int recipe_side_list_settled(uintptr_t manager, uint32_t list_offset, const uint8_t *player_state,
                                    uint32_t vector_offset) {
    const uint8_t *list = *(const uint8_t *const *)(manager + list_offset);
    int32_t list_count = *(const int32_t *)(manager + list_offset + 8);
    uint32_t known_count = *(const uint32_t *)(player_state + vector_offset + 4);
    const uint8_t *known = *(const uint8_t *const *)(player_state + vector_offset + 8);
    if (list_count == 0) return 1;
    if (list_count < 0 || list_count > RECIPE_SIDE_LIST_LIMIT || known_count > RECIPE_SIDE_LIST_LIMIT ||
        !recipe_readable(list, (size_t)list_count * RECIPE_SHORT_ID_SIZE) ||
        (known_count && !recipe_readable(known, (size_t)known_count * RECIPE_SHORT_ID_SIZE))) return 0;
    for (int32_t index = 0; index < list_count; ++index) {
        int found = 0;
        for (uint32_t entry = 0; !found && entry < known_count; ++entry)
            found = memcmp(list + (size_t)index * RECIPE_SHORT_ID_SIZE, known + (size_t)entry * RECIPE_SHORT_ID_SIZE,
                           RECIPE_SHORT_ID_SIZE) == 0;
        if (!found) return 0;
    }
    return 1;
}

// A recipe ID as the table stores it: 1 to 31 characters of A-Z, 0-9 and underscore, zero padded.
static int recipe_valid_id(const char *id) {
    size_t length = 0;
    while (length < RECIPE_ID_SIZE && id[length]) {
        char c = id[length];
        if (!((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '_')) return 0;
        ++length;
    }
    if (length == 0 || length >= RECIPE_ID_SIZE) return 0;
    for (size_t rest = length; rest < RECIPE_ID_SIZE; ++rest) if (id[rest]) return 0;
    return 1;
}

// Runs on the game's update thread: teach every recipe of the game's table, or the requested ones.
static void recipe_apply_request(void) {
    LONG table_count = -1, sent = 0, unknown = 0, before = -1, after = -1, refused = 0, side_effect = 0;
    // The routines stay unresolved in the fixture build, where no game manager exists.
    uintptr_t manager = recipe_merge && recipe_known
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    const uint8_t *holder = manager ? *(const uint8_t *const *)(manager + RECIPE_TABLE_HOLDER_OFFSET) : NULL;
    const uint8_t *entries = NULL;
    if (recipe_readable(holder, 16)) {
        entries = *(const uint8_t *const *)holder;
        table_count = *(const int32_t *)(holder + 8);
    }
    uint8_t *player_state = (uint8_t *)(manager + RECIPE_PLAYER_STATE_OFFSET);
    if (table_count > 0 && table_count <= RECIPE_CAPACITY &&
        recipe_readable(entries, (size_t)table_count * RECIPE_ENTRY_SIZE) &&
        writable_range((uintptr_t)player_state + 0x18750u, 0x40)) {
        before = 0;
        for (LONG index = 0; index < table_count; ++index) {
            const char *id = (const char *)(entries + (size_t)index * RECIPE_ENTRY_SIZE);
            if (!recipe_valid_id(id)) { ++refused; continue; }
            if (recipe_known(player_state, id)) { ++before; continue; }
            // Not known yet: send it when everything was asked for, or when it was named.
            int wanted = InterlockedCompareExchange(&recipe_all, 0, 0) != 0;
            for (LONG named = 0; !wanted && named < recipe_requested_count; ++named)
                wanted = memcmp(recipe_requested[named], id, RECIPE_ID_SIZE) == 0;
            if (wanted) memcpy(recipe_buffer[sent++], id, RECIPE_ID_SIZE);
        }
        if (!InterlockedCompareExchange(&recipe_all, 0, 0)) {
            // Named IDs that the running game's table does not contain are reported, never sent.
            for (LONG named = 0; named < recipe_requested_count; ++named) {
                int found = 0;
                for (LONG index = 0; !found && index < table_count; ++index)
                    found = memcmp(recipe_requested[named], entries + (size_t)index * RECIPE_ENTRY_SIZE,
                                   RECIPE_ID_SIZE) == 0;
                if (!found) ++unknown;
            }
        }
        // Refuse when the routine would also add a technology or product from the manager's own lists.
        side_effect = !recipe_side_list_settled(manager, RECIPE_DEFAULT_TECH_LIST_OFFSET, player_state,
                                                RECIPE_KNOWN_TECH_VECTOR_OFFSET) ||
                      !recipe_side_list_settled(manager, RECIPE_DEFAULT_PRODUCT_LIST_OFFSET, player_state,
                                                RECIPE_KNOWN_PRODUCT_VECTOR_OFFSET);
        if (sent > 0 && !side_effect) {
            // Only the recipe list is filled; the empty lists make the routine skip everything else.
            // The flag must be 1: with 0 the routine returns before the product and recipe lists.
            uint8_t source[RECIPE_SOURCE_SIZE] = {0};
            *(const void **)(source + RECIPE_SOURCE_LIST_OFFSET) = recipe_buffer;
            *(int32_t *)(source + RECIPE_SOURCE_LIST_OFFSET + 8) = (int32_t)sent;
            recipe_merge(player_state, source, 1);
        }
        after = 0;
        for (LONG index = 0; index < table_count; ++index) {
            const char *id = (const char *)(entries + (size_t)index * RECIPE_ENTRY_SIZE);
            if (recipe_valid_id(id) && recipe_known(player_state, id)) ++after;
        }
    }
    InterlockedExchange(&recipe_result[0], table_count);
    InterlockedExchange(&recipe_result[1], sent);
    InterlockedExchange(&recipe_result[2], unknown);
    InterlockedExchange(&recipe_result[3], before);
    InterlockedExchange(&recipe_result[4], after);
    InterlockedExchange(&recipe_result[5], refused);
    InterlockedExchange(&recipe_result[6], side_effect);
    InterlockedExchange(&recipe_state, 2);
}

static int recipe_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-recipe-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: either the single line "all=1", or one "id=<ID>" per line. Any other
// content, a malformed ID, a duplicate, mixing both forms or more than the capacity rejects it.
static int recipe_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&recipe_state, 0, 0) != 0 || !recipe_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG count = 0, all = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if (strcmp(line, "all=1") == 0) { all = 1; continue; }
        size_t length = strlen(line);
        if (strncmp(line, "id=", 3) != 0 || length < 4 || length > 3 + RECIPE_ID_SIZE - 1 || count >= RECIPE_CAPACITY) {
            ok = 0;
            break;
        }
        char id[RECIPE_ID_SIZE] = {0};
        memcpy(id, line + 3, length - 3);
        ok = recipe_valid_id(id);
        for (LONG seen = 0; ok && seen < count; ++seen)
            if (memcmp(recipe_requested[seen], id, RECIPE_ID_SIZE) == 0) ok = 0;
        if (ok) memcpy(recipe_requested[count++], id, RECIPE_ID_SIZE);
    }
    fclose(file);
    if (!ok || (all && count) || (!all && !count)) return 0;
    InterlockedExchange(&recipe_all, all);
    InterlockedExchange(&recipe_requested_count, count);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void recipe_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&recipe_state, 0, 0) != 2 || !recipe_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        fprintf(file, "table_recipes=%ld\nsent=%ld\nunknown_ids=%ld\nknown_before=%ld\nknown_after=%ld\n"
                      "refused_table_entries=%ld\nrefused_for_side_effect=%ld\n",
                (long)InterlockedCompareExchange(&recipe_result[0], 0, 0),
                (long)InterlockedCompareExchange(&recipe_result[1], 0, 0),
                (long)InterlockedCompareExchange(&recipe_result[2], 0, 0),
                (long)InterlockedCompareExchange(&recipe_result[3], 0, 0),
                (long)InterlockedCompareExchange(&recipe_result[4], 0, 0),
                (long)InterlockedCompareExchange(&recipe_result[5], 0, 0),
                (long)InterlockedCompareExchange(&recipe_result[6], 0, 0));
        fclose(file);
    }
    InterlockedExchange(&recipe_state, 0);
}
