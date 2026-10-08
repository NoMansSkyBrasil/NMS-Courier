// Item domain of the build 180836 research profile: put substances and products into the exosuit
// cargo of the loaded slot through the game's own inventory routine. Included once by profile_core.c.
//
// Observed offline on 2026-10-08 (docs/ITEM_DELIVERY_NOTES.md): the routine the game uses to fill a
// store with starting contents looks each ID up as a substance, then as a product, asks the store for
// the stack limit of that item, builds a default element with the ID, the amount, the limit and the
// item type, and calls the store's add routine. This file does the same for requested IDs, one stack
// at a time, and stops when the store reports no room. Nothing is written to the store directly.

#define ITEM_STORE_ADD_RVA 0x4d0780u
#define ITEM_SUBSTANCE_LIMIT_RVA 0x4d43c0u
#define ITEM_PRODUCT_LIMIT_RVA 0x4d4420u
#define ITEM_ELEMENT_INIT_RVA 0x2a3aa80u
#define ITEM_SUBSTANCE_LOOKUP_RVA 0xebbf70u
#define ITEM_PRODUCT_LOOKUP_RVA 0xec9ba0u
#define ITEM_TABLE_OFFSET 0x60u              // from the manager object
#define ITEM_SUIT_CARGO_OFFSET 0xc250u       // from the manager object
#define ITEM_SUBSTANCE_ID_OFFSET 0xc8u       // definition fields
#define ITEM_PRODUCT_ID_OFFSET 0x150u
#define ITEM_TYPE_SUBSTANCE 0
#define ITEM_TYPE_PRODUCT 2
#define ITEM_REQUEST_CAPACITY 32
#define ITEM_MAX_AMOUNT 999999
// A request never adds more stacks than one full cargo grid has positions.
#define ITEM_MAX_STACKS 120

typedef struct {
    char id[16];
    int32_t x, y;
    int32_t amount;
    float damage_factor;
    int32_t max_amount;
    int32_t type;
    uint8_t added_automatically, fully_installed, padding[6];
} item_element;
typedef struct { int32_t x, y; } item_index;
_Static_assert(sizeof(item_element) == 48, "inventory element size");

enum {
    ITEM_PENDING = 0,
    ITEM_ADDED,          // the whole amount went in
    ITEM_PARTIAL,        // the store ran out of room; "added" says how much went in
    ITEM_NO_ROOM,        // nothing went in
    ITEM_UNKNOWN_ID,     // neither a substance nor a product of the running game
    ITEM_BAD_LIMIT,      // the game returned no usable stack limit; nothing was called
    ITEM_NOT_READY       // no game manager or store
};
static const char *const item_result_names[] = {
    "pending", "added", "partial", "no_room", "unknown_id", "bad_limit", "not_ready"
};

typedef void *(*item_lookup_fn)(void *table, const char *id);
typedef int32_t (*item_limit_fn)(void *store, const char *id);
typedef void (*item_element_init_fn)(item_element *element);
typedef item_index *(*item_store_add_fn)(void *store, item_index *out, const item_element *element);

static item_lookup_fn item_substance_lookup, item_product_lookup;
static item_limit_fn item_substance_limit, item_product_limit;
static item_element_init_fn item_element_init;
static item_store_add_fn item_store_add;
static char item_ids[ITEM_REQUEST_CAPACITY][16];
static LONG item_amounts[ITEM_REQUEST_CAPACITY];
static volatile LONG item_added[ITEM_REQUEST_CAPACITY];
static volatile LONG item_limits[ITEM_REQUEST_CAPACITY];   // stack limit the game gave for each item
static volatile LONG item_results[ITEM_REQUEST_CAPACITY];
static volatile LONG item_count;
static volatile LONG item_state;        // 0 idle, 1 requested, 2 applied and waiting for the result file

__attribute__((unused)) static int item_resolve(uintptr_t base) {
    static const unsigned char add_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x10, 0x48, 0x89, 0x74, 0x24, 0x18, 0x55, 0x57, 0x41, 0x56, 0x48, 0x8d,
        0x6c, 0x24, 0xb0, 0x48, 0x81, 0xec, 0x50, 0x01, 0x00, 0x00, 0x41, 0x0f, 0x10, 0x00, 0x4c, 0x8b
    };
    static const unsigned char product_limit_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x57, 0x48, 0x83, 0xec, 0x20, 0x4c, 0x8b, 0x0d, 0xd7, 0x92, 0x9b,
        0x06, 0x49, 0x63, 0x81, 0x34, 0x5a, 0x31, 0x00, 0x48, 0x6b, 0xf8, 0x70, 0x48, 0x63, 0x81, 0xfc
    };
    static const unsigned char substance_limit_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x57, 0x48, 0x83, 0xec, 0x20, 0x4c, 0x8b, 0x0d, 0x37, 0x93, 0x9b,
        0x06, 0x49, 0x63, 0x81, 0x34, 0x5a, 0x31, 0x00, 0x48, 0x6b, 0xf8, 0x70, 0x48, 0x63, 0x81, 0xfc
    };
    static const unsigned char element_init_entry[32] = {
        0x40, 0x53, 0x48, 0x83, 0xec, 0x20, 0x0f, 0x57, 0xc0, 0x33, 0xc0, 0x0f, 0x11, 0x01, 0x48, 0xc7,
        0x41, 0x10, 0xff, 0xff, 0xff, 0xff, 0x48, 0x8b, 0xd9, 0x48, 0x89, 0x41, 0x18, 0xc7, 0x41, 0x20
    };
    static const unsigned char substance_lookup_entry[32] = {
        0x48, 0x89, 0x6c, 0x24, 0x10, 0x48, 0x89, 0x74, 0x24, 0x18, 0x57, 0x48, 0x83, 0xec, 0x20, 0x48,
        0x8b, 0xf9, 0x48, 0x8b, 0xea, 0x48, 0x81, 0xc1, 0x00, 0x03, 0x00, 0x00, 0xe8, 0x7f, 0xb6, 0x6a
    };
    // The product lookup's entry bytes are checked by the product domain.
    item_store_add = (item_store_add_fn)(base + ITEM_STORE_ADD_RVA);
    item_product_limit = (item_limit_fn)(base + ITEM_PRODUCT_LIMIT_RVA);
    item_substance_limit = (item_limit_fn)(base + ITEM_SUBSTANCE_LIMIT_RVA);
    item_element_init = (item_element_init_fn)(base + ITEM_ELEMENT_INIT_RVA);
    item_substance_lookup = (item_lookup_fn)(base + ITEM_SUBSTANCE_LOOKUP_RVA);
    item_product_lookup = (item_lookup_fn)(base + ITEM_PRODUCT_LOOKUP_RVA);
    return memcmp((void *)(base + ITEM_STORE_ADD_RVA), add_entry, sizeof(add_entry)) == 0 &&
           memcmp((void *)(base + ITEM_PRODUCT_LIMIT_RVA), product_limit_entry, sizeof(product_limit_entry)) == 0 &&
           memcmp((void *)(base + ITEM_SUBSTANCE_LIMIT_RVA), substance_limit_entry,
                  sizeof(substance_limit_entry)) == 0 &&
           memcmp((void *)(base + ITEM_ELEMENT_INIT_RVA), element_init_entry, sizeof(element_init_entry)) == 0 &&
           memcmp((void *)(base + ITEM_SUBSTANCE_LOOKUP_RVA), substance_lookup_entry,
                  sizeof(substance_lookup_entry)) == 0;
}

static int item_readable(uintptr_t address, size_t length) {
    MEMORY_BASIC_INFORMATION memory;
    return VirtualQuery((void *)address, &memory, sizeof(memory)) == sizeof(memory) &&
           memory.State == MEM_COMMIT && !(memory.Protect & (PAGE_GUARD | PAGE_NOACCESS)) &&
           address + length <= (uintptr_t)memory.BaseAddress + memory.RegionSize;
}

// One requested item: stacks of at most the game's limit until the amount is in or the store is full.
static LONG item_give(uintptr_t manager, void *store, const char *id, LONG amount, volatile LONG *added,
                      volatile LONG *used_limit) {
    void *table = (void *)(manager + ITEM_TABLE_OFFSET);
    const uint8_t *definition = item_substance_lookup(table, id);
    int32_t type = ITEM_TYPE_SUBSTANCE;
    size_t id_offset = ITEM_SUBSTANCE_ID_OFFSET;
    if (!definition) {
        definition = item_product_lookup(table, id);
        type = ITEM_TYPE_PRODUCT;
        id_offset = ITEM_PRODUCT_ID_OFFSET;
    }
    // The lookup must have returned the definition of exactly this ID.
    if (!definition || !item_readable((uintptr_t)definition + id_offset, 16) ||
        strncmp((const char *)definition + id_offset, id, 16) != 0) return ITEM_UNKNOWN_ID;
    int32_t limit = type == ITEM_TYPE_SUBSTANCE ? item_substance_limit(store, id) : item_product_limit(store, id);
    InterlockedExchange(used_limit, limit);
    if (limit < 1 || limit > ITEM_MAX_AMOUNT) return ITEM_BAD_LIMIT;

    LONG remaining = amount;
    for (int stack = 0; remaining > 0 && stack < ITEM_MAX_STACKS; ++stack) {
        item_element element;
        item_index where = {-1, -1};
        item_element_init(&element);
        memcpy(element.id, definition + id_offset, sizeof(element.id));
        element.amount = remaining < limit ? remaining : limit;
        element.max_amount = limit;
        element.type = type;
        item_store_add(store, &where, &element);
        if (where.x < 0 || where.y < 0) break;
        remaining -= element.amount;
        InterlockedExchange(added, amount - remaining);
    }
    return remaining == 0 ? ITEM_ADDED : remaining == amount ? ITEM_NO_ROOM : ITEM_PARTIAL;
}

// Runs on the game's update thread.
static void item_apply_request(void) {
    // The routines stay unresolved in the fixture build, where no game manager exists.
    uintptr_t manager = item_store_add
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    void *store = (void *)(manager + ITEM_SUIT_CARGO_OFFSET);
    int ready = manager && writable_range((uintptr_t)store, STORE_SIZE);
    LONG count = InterlockedCompareExchange(&item_count, 0, 0);
    for (LONG index = 0; index < count && index < ITEM_REQUEST_CAPACITY; ++index)
        InterlockedExchange(&item_results[index],
                            ready ? item_give(manager, store, item_ids[index], item_amounts[index], &item_added[index],
                                              &item_limits[index])
                                  : ITEM_NOT_READY);
    InterlockedExchange(&item_state, 2);
}

static int item_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-item-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: one "<ID>=<amount>" per line. Any other content, a malformed ID, an
// amount outside 1..999999, a duplicate or more than the capacity rejects the whole request.
static int item_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&item_state, 0, 0) != 0 || !item_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG count = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        char *separator = strchr(line, '=');
        size_t length = separator ? (size_t)(separator - line) : 0;
        if (!separator || length < 1 || length > 15 || count >= ITEM_REQUEST_CAPACITY) { ok = 0; break; }
        for (const char *cursor = line; cursor < separator; ++cursor)
            if (!((*cursor >= 'A' && *cursor <= 'Z') || (*cursor >= '0' && *cursor <= '9') || *cursor == '_')) ok = 0;
        LONG amount = 0;
        const char *digit = separator + 1;
        if (!*digit || strlen(digit) > 6) ok = 0;
        for (; ok && *digit; ++digit) {
            if (*digit < '0' || *digit > '9') ok = 0;
            else amount = amount * 10 + (*digit - '0');
        }
        if (amount < 1 || amount > ITEM_MAX_AMOUNT) ok = 0;
        for (LONG seen = 0; ok && seen < count; ++seen)
            if (strlen(item_ids[seen]) == length && strncmp(item_ids[seen], line, length) == 0) ok = 0;
        if (!ok) break;
        memset(item_ids[count], 0, sizeof(item_ids[count]));
        memcpy(item_ids[count], line, length);
        item_amounts[count] = amount;
        InterlockedExchange(&item_added[count], 0);
        InterlockedExchange(&item_limits[count], 0);
        InterlockedExchange(&item_results[count], ITEM_PENDING);
        ++count;
    }
    fclose(file);
    if (!ok || count == 0) return 0;
    InterlockedExchange(&item_count, count);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void item_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&item_state, 0, 0) != 2 || !item_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        LONG count = InterlockedCompareExchange(&item_count, 0, 0);
        fprintf(file, "requested=%ld\n", (long)count);
        for (LONG index = 0; index < count; ++index)
            fprintf(file, "%.16s:%ld/%ld stack %ld=%s\n", item_ids[index],
                    (long)InterlockedCompareExchange(&item_added[index], 0, 0), (long)item_amounts[index],
                    (long)InterlockedCompareExchange(&item_limits[index], 0, 0),
                    item_result_names[InterlockedCompareExchange(&item_results[index], 0, 0)]);
        fclose(file);
    }
    InterlockedExchange(&item_state, 0);
}

// Stack sizes of the exosuit cargo for the loaded save, read where the game's two stack limit
// routines read them: the base stack of a substance and of a product for the store's size group
// under the current difficulty settings, and the two caps. An item's stack is its own multiplier
// times the base, at most the cap. Refreshed on the game's update thread, reported by the worker.
#define ITEM_LIMITS_POINTER_RVA 0x7033650u
#define ITEM_DIFFICULTY_INDEX_OFFSET 0x315a34u  // from the manager object
#define ITEM_LIMITS_ENTRY_SIZE 0x70u
#define ITEM_STORE_GROUP_OFFSET 0xfcu
#define ITEM_GROUP_COUNT 13
#define ITEM_PRODUCT_BASE_OFFSET 0x25b0u
#define ITEM_SUBSTANCE_BASE_OFFSET 0x25e4u
#define ITEM_PRODUCT_CAP_OFFSET 0x2618u
#define ITEM_SUBSTANCE_CAP_OFFSET 0x261cu
#define ITEM_LIMITS_REFRESH_FRAMES 300

static volatile LONG item_stack_values[4] = {-1, -1, -1, -1};  // substance base, substance cap, product base, product cap
static volatile LONG item_stack_reported[4] = {-2, -2, -2, -2};
static LONG item_stack_frames;

// Runs on the game's update thread.
static void item_limits_tick(void) {
    if (++item_stack_frames < ITEM_LIMITS_REFRESH_FRAMES) return;
    item_stack_frames = 0;
    uintptr_t base = (uintptr_t)GetModuleHandleW(NULL);
    uintptr_t manager = item_store_add ? *(const uintptr_t *)(base + MANAGER_POINTER_RVA) : 0;
    LONG values[4] = {-1, -1, -1, -1};
    if (manager && item_readable(manager + ITEM_DIFFICULTY_INDEX_OFFSET, 4) &&
        item_readable(manager + ITEM_SUIT_CARGO_OFFSET, STORE_SIZE) && item_readable(base + ITEM_LIMITS_POINTER_RVA, 8)) {
        int32_t difficulty = *(const int32_t *)(manager + ITEM_DIFFICULTY_INDEX_OFFSET);
        int32_t group = *(const int32_t *)(manager + ITEM_SUIT_CARGO_OFFSET + ITEM_STORE_GROUP_OFFSET);
        uintptr_t table = *(const uintptr_t *)(base + ITEM_LIMITS_POINTER_RVA);
        if (table && difficulty >= 0 && difficulty < 64 && group >= 0 && group < ITEM_GROUP_COUNT) {
            uintptr_t limits = table + (uintptr_t)difficulty * ITEM_LIMITS_ENTRY_SIZE;
            if (item_readable(limits + ITEM_PRODUCT_BASE_OFFSET, ITEM_SUBSTANCE_CAP_OFFSET + 4 - ITEM_PRODUCT_BASE_OFFSET)) {
                values[0] = *(const int32_t *)(limits + ITEM_SUBSTANCE_BASE_OFFSET + (uintptr_t)group * 4);
                values[1] = *(const int32_t *)(limits + ITEM_SUBSTANCE_CAP_OFFSET);
                values[2] = *(const int32_t *)(limits + ITEM_PRODUCT_BASE_OFFSET + (uintptr_t)group * 4);
                values[3] = *(const int32_t *)(limits + ITEM_PRODUCT_CAP_OFFSET);
            }
        }
    }
    for (int index = 0; index < 4; ++index) InterlockedExchange(&item_stack_values[index], values[index]);
}

// Called from the worker thread: rewrite the file only when a value changed.
static void item_limits_write(void) {
    LONG values[4];
    int changed = 0;
    for (int index = 0; index < 4; ++index) {
        values[index] = InterlockedCompareExchange(&item_stack_values[index], 0, 0);
        if (values[index] != InterlockedCompareExchange(&item_stack_reported[index], 0, 0)) changed = 1;
    }
    wchar_t path[MAX_PATH];
    if (!changed || !item_path(path, L"limits")) return;
    FILE *file = _wfopen(path, L"w");
    if (!file) return;
    fprintf(file, "substance_base=%ld\nsubstance_cap=%ld\nproduct_base=%ld\nproduct_cap=%ld\n",
            (long)values[0], (long)values[1], (long)values[2], (long)values[3]);
    fclose(file);
    for (int index = 0; index < 4; ++index) InterlockedExchange(&item_stack_reported[index], values[index]);
}
