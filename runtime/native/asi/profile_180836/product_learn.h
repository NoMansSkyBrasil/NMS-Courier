// Product domain of the build 180836 research profile: teach the loaded slot product recipes through
// the game's own routine. Included once by profile_core.c.
//
// Observed offline on 2026-10-07 (docs/PRODUCT_DELIVERY_NOTES.md): the shipped reward that teaches a
// product recipe looks the product up and calls one routine with the player state, the product ID and
// a silent flag. That routine adds the ID to the slot's known products when the product is craftable
// or a customisation part, and also marks the product as seen on the account. This file calls it for
// requested IDs and refuses more than the game does: see product_blocked_id() and product_blocked().

#define PRODUCT_LOOKUP_RVA 0xec9ba0u
#define PRODUCT_LEARN_RVA 0x5aafd0u
#define PRODUCT_TABLE_OFFSET 0x60u             // from the manager object
#define PRODUCT_PLAYER_STATE_OFFSET 0xb940u    // from the manager object
#define PRODUCT_KNOWN_COUNT_OFFSET 0x18744u    // from the player state
#define PRODUCT_ID_OFFSET 0x150u               // definition fields
#define PRODUCT_TYPE_OFFSET 0x1e8u
#define PRODUCT_WIKI_CATEGORY_OFFSET 0x1ecu
#define PRODUCT_CRAFTABLE_OFFSET 0x2f5u
#define PRODUCT_DEFINITION_SIZE 0x300u
#define PRODUCT_TYPE_CUSTOMISATION_PART 7
#define PRODUCT_TYPE_COUNT 12
#define PRODUCT_WIKI_CATEGORY_COUNT 7
#define PRODUCT_REQUEST_CAPACITY 2048

enum {
    PRODUCT_PENDING = 0,
    PRODUCT_LEARNED,            // the game added it to the slot's known products
    PRODUCT_NOT_ADDED,          // the game's routine declined: already known
    PRODUCT_UNKNOWN_ID,         // no definition with this ID in the running game
    PRODUCT_BLOCKED_ID,         // refused by the permanent ID rules below, before any lookup
    PRODUCT_BLOCKED_NOT_LEARNABLE,  // neither craftable nor a customisation part: the game refuses it too
    PRODUCT_BLOCKED_LAYOUT      // the definition did not look like one; nothing was called
};
static const char *const product_result_names[] = {
    "pending", "learned", "not_added", "unknown_id", "blocked_id", "blocked_not_learnable", "blocked_layout"
};

typedef void *(*product_lookup_fn)(void *table, const char *id);
typedef uint8_t (*product_learn_fn)(void *player_state, const char *id, uint8_t silent);

static product_lookup_fn product_lookup;
static product_learn_fn product_learn;
static char product_ids[PRODUCT_REQUEST_CAPACITY][16];
static volatile LONG product_results[PRODUCT_REQUEST_CAPACITY];
static volatile LONG product_count;
static volatile LONG product_state;        // 0 idle, 1 requested, 2 applied and waiting for the result file
// 1: the game shows nothing; 0: the game shows its own "new recipe" notification for each product.
static volatile LONG product_silent = 1;
static volatile LONG product_known_before = -1;
static volatile LONG product_known_after = -1;

// Repeatable purchases must never become known: the shop stops selling them (fireworks, Myth Beacon,
// Void Egg). The table flag for this is on the special, not on the product, so these are refused by ID.
static int product_blocked_id(const char *id) {
    // Firework items, not everything with the word: JETS_FIREWORK is a jetpack trail.
    return strncmp(id, "SPEC_FIREWORK", 13) == 0 || strncmp(id, "EXPD_FIREWORK", 13) == 0 ||
           strcmp(id, "MYSTERY_BEACON") == 0 || strcmp(id, "ODD_EGG") == 0;
}

// Structural rules read from the running game's own definition.
static LONG product_blocked(const uint8_t *definition, const char *id) {
    MEMORY_BASIC_INFORMATION memory;
    if (VirtualQuery(definition, &memory, sizeof(memory)) != sizeof(memory) || memory.State != MEM_COMMIT ||
        (memory.Protect & (PAGE_GUARD | PAGE_NOACCESS)) ||
        (uintptr_t)definition + PRODUCT_DEFINITION_SIZE > (uintptr_t)memory.BaseAddress + memory.RegionSize)
        return PRODUCT_BLOCKED_LAYOUT;
    int32_t type = *(const int32_t *)(definition + PRODUCT_TYPE_OFFSET);
    int32_t wiki = *(const int32_t *)(definition + PRODUCT_WIKI_CATEGORY_OFFSET);
    uint8_t craftable = definition[PRODUCT_CRAFTABLE_OFFSET];
    if (strncmp((const char *)definition + PRODUCT_ID_OFFSET, id, 16) != 0 || type < 0 || type >= PRODUCT_TYPE_COUNT ||
        wiki < 0 || wiki >= PRODUCT_WIKI_CATEGORY_COUNT || craftable > 1) return PRODUCT_BLOCKED_LAYOUT;
    if (!craftable && type != PRODUCT_TYPE_CUSTOMISATION_PART) return PRODUCT_BLOCKED_NOT_LEARNABLE;
    // A product the catalogue hides is not refused here: the game's own research terminals sell such
    // products (station decorations, storage containers). Which hidden products are requested is decided
    // by the classification, see docs/PRODUCT_DELIVERY_NOTES.md.
    return PRODUCT_PENDING;
}

__attribute__((unused)) static int product_resolve(uintptr_t base) {
    static const unsigned char lookup_entry[32] = {
        0x48, 0x89, 0x6c, 0x24, 0x10, 0x48, 0x89, 0x74, 0x24, 0x18, 0x57, 0x48,
        0x83, 0xec, 0x20, 0x48, 0x8b, 0xf9, 0x48, 0x8b, 0xea, 0x48, 0x81, 0xc1,
        0xc0, 0x03, 0x00, 0x00, 0xe8, 0x4f, 0xda, 0x69
    };
    static const unsigned char learn_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x10, 0x55, 0x56, 0x57, 0x41, 0x56, 0x41, 0x57,
        0x48, 0x8d, 0x6c, 0x24, 0xc9, 0x48, 0x81, 0xec, 0xb0, 0x00, 0x00, 0x00,
        0x48, 0x8b, 0xf1, 0x45, 0x0f, 0xb6, 0xf0, 0x48
    };
    product_lookup = (product_lookup_fn)(base + PRODUCT_LOOKUP_RVA);
    product_learn = (product_learn_fn)(base + PRODUCT_LEARN_RVA);
    return memcmp((void *)(base + PRODUCT_LOOKUP_RVA), lookup_entry, sizeof(lookup_entry)) == 0 &&
           memcmp((void *)(base + PRODUCT_LEARN_RVA), learn_entry, sizeof(learn_entry)) == 0;
}

// Runs on the game's update thread: teach each requested product recipe once.
static void product_apply_request(void) {
    // The routines stay unresolved in the fixture build, where no game manager exists.
    uintptr_t manager = product_lookup && product_learn
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    LONG count = InterlockedCompareExchange(&product_count, 0, 0);
    uint8_t *player_state = (uint8_t *)(manager + PRODUCT_PLAYER_STATE_OFFSET);
    int ready = manager && writable_range((uintptr_t)player_state + PRODUCT_KNOWN_COUNT_OFFSET, 16);
    uint8_t silent = InterlockedCompareExchange(&product_silent, 0, 0) != 0;
    if (ready) InterlockedExchange(&product_known_before,
                                   *(const int32_t *)(player_state + PRODUCT_KNOWN_COUNT_OFFSET));
    for (LONG index = 0; index < count && index < PRODUCT_REQUEST_CAPACITY; ++index) {
        const char *id = product_ids[index];
        LONG result;
        if (!ready) result = PRODUCT_BLOCKED_LAYOUT;
        else if (product_blocked_id(id)) result = PRODUCT_BLOCKED_ID;
        else {
            const uint8_t *definition = product_lookup((void *)(manager + PRODUCT_TABLE_OFFSET), id);
            if (!definition) result = PRODUCT_UNKNOWN_ID;
            else if ((result = product_blocked(definition, id)) == PRODUCT_PENDING)
                result = product_learn(player_state, id, silent) ? PRODUCT_LEARNED : PRODUCT_NOT_ADDED;
        }
        InterlockedExchange(&product_results[index], result);
    }
    if (ready) InterlockedExchange(&product_known_after,
                                   *(const int32_t *)(player_state + PRODUCT_KNOWN_COUNT_OFFSET));
    InterlockedExchange(&product_state, 2);
}

static int product_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-product-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: optional "silent=0" or "silent=1" (the default), then one
// "id=<ID>" per line. Any other content, a malformed ID, a
// duplicate or more than the capacity rejects the whole request.
static int product_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&product_state, 0, 0) != 0 || !product_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG count = 0, silent = 1;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if (strcmp(line, "silent=1") == 0) { silent = 1; continue; }
        if (strcmp(line, "silent=0") == 0) { silent = 0; continue; }
        size_t length = strlen(line);
        if (strncmp(line, "id=", 3) != 0 || length < 4 || length > 3 + 15 || count >= PRODUCT_REQUEST_CAPACITY) {
            ok = 0;
            break;
        }
        for (const char *cursor = line + 3; *cursor; ++cursor)
            if (!((*cursor >= 'A' && *cursor <= 'Z') || (*cursor >= '0' && *cursor <= '9') || *cursor == '_')) ok = 0;
        // A linear duplicate check is enough for a request of this size.
        for (LONG seen = 0; ok && seen < count; ++seen)
            if (strcmp(product_ids[seen], line + 3) == 0) ok = 0;
        if (!ok) break;
        memset(product_ids[count], 0, sizeof(product_ids[count]));
        memcpy(product_ids[count], line + 3, length - 3);
        InterlockedExchange(&product_results[count], PRODUCT_PENDING);
        ++count;
    }
    fclose(file);
    if (!ok || count == 0) return 0;
    InterlockedExchange(&product_count, count);
    InterlockedExchange(&product_silent, silent);
    InterlockedExchange(&product_known_before, -1);
    InterlockedExchange(&product_known_after, -1);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void product_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&product_state, 0, 0) != 2 || !product_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        LONG count = InterlockedCompareExchange(&product_count, 0, 0);
        fprintf(file, "requested=%ld\nknown_before=%ld\nknown_after=%ld\n", (long)count,
                (long)InterlockedCompareExchange(&product_known_before, 0, 0),
                (long)InterlockedCompareExchange(&product_known_after, 0, 0));
        for (LONG index = 0; index < count; ++index)
            fprintf(file, "%.16s=%s\n", product_ids[index],
                    product_result_names[InterlockedCompareExchange(&product_results[index], 0, 0)]);
        fclose(file);
    }
    InterlockedExchange(&product_state, 0);
}
