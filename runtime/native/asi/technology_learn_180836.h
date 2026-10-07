// Technology domain of the build 180836 research profile: teach known technologies through the
// game's own routine. Included once by the profile source; it is not a shared helper.
//
// Observed offline on 2026-10-07 (docs/TECHNOLOGY_DELIVERY_NOTES.md): the shipped reward that teaches
// a technology (handler RVA 0xf394a0) resolves the definition with the lookup below and calls the
// learn routine with the player state, the definition, the pin flag and the silent flag. The learn
// routine itself refuses the ID "OBSOLETE", procedural and repair entries and already known ones.
// This file refuses more than the game does: see technology_blocked().

#define TECHNOLOGY_LOOKUP_RVA 0xec8dc0u
#define TECHNOLOGY_LEARN_RVA 0x5a95a0u
#define TECHNOLOGY_TABLE_OFFSET 0x60u          // from the manager object
#define TECHNOLOGY_PLAYER_STATE_OFFSET 0xb940u // from the manager object
#define TECHNOLOGY_KNOWN_COUNT_OFFSET 0x18734u // from the player state
#define TECHNOLOGY_ID_OFFSET 0x108u            // definition fields
#define TECHNOLOGY_CATEGORY_OFFSET 0x194u
#define TECHNOLOGY_BROKEN_SLOT_OFFSET 0x2c4u
#define TECHNOLOGY_TEMPLATE_OFFSET 0x2c9u
#define TECHNOLOGY_PROCEDURAL_OFFSET 0x2ccu
#define TECHNOLOGY_REPAIR_OFFSET 0x2cdu
#define TECHNOLOGY_TEACH_OFFSET 0x2ceu
#define TECHNOLOGY_WIKI_OFFSET 0x2d1u
#define TECHNOLOGY_DEFINITION_SIZE 0x2e0u
#define TECHNOLOGY_CATEGORY_MAINTENANCE 7
#define TECHNOLOGY_CATEGORY_COUNT 18
#define TECHNOLOGY_REQUEST_CAPACITY 256

// Result codes written to the result file.
enum {
    TECHNOLOGY_PENDING = 0,
    TECHNOLOGY_LEARNED,          // the game added it to the known list
    TECHNOLOGY_NOT_ADDED,        // the game's routine declined: already known or refused by the game
    TECHNOLOGY_UNKNOWN_ID,       // no definition with this ID in the running game
    TECHNOLOGY_BLOCKED_ID,       // refused by the permanent ID rules below, before any lookup
    TECHNOLOGY_BLOCKED_DAMAGED,  // BrokenSlotTech: a damaged-slot entry
    TECHNOLOGY_BLOCKED_MAINTENANCE,
    TECHNOLOGY_BLOCKED_TEMPLATE, // IsTemplate or Procedural
    TECHNOLOGY_BLOCKED_REPAIR,
    TECHNOLOGY_BLOCKED_LAYOUT    // the definition did not look like one; nothing was called
};
static const char *const technology_result_names[] = {
    "pending", "learned", "not_added", "unknown_id", "blocked_id", "blocked_damaged",
    "blocked_maintenance", "blocked_template", "blocked_repair", "blocked_layout"
};

typedef void *(*technology_lookup_fn)(void *table, const char *id, uint8_t report_missing);
typedef uint8_t (*technology_learn_fn)(void *player_state, void *definition, uint8_t pin, uint8_t silent);

static technology_lookup_fn technology_lookup;
static technology_learn_fn technology_learn;
static char technology_ids[TECHNOLOGY_REQUEST_CAPACITY][16];
static volatile LONG technology_results[TECHNOLOGY_REQUEST_CAPACITY];
static volatile LONG technology_count;
static volatile LONG technology_silent;
static volatile LONG technology_state;     // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG technology_known_before = -1;
static volatile LONG technology_known_after = -1;

// Permanent ID rules. They hold whatever a later table says about the entry, so a game update cannot
// turn one of these into a deliverable technology. Prefixes cover entries added later in the same
// families. Entries the game hides from its catalogue are not refused: the project owner reviewed
// them on 2026-10-07 and kept only "OBSOLETE" blocked. "SPIDERBRAIN" has no display name.
static int technology_blocked_id(const char *id) {
    static const char *const prefixes[] = {"MAINT_", "EXOPOD_TECH", "SHIPSLOT_DMG", "SHIPEASY_DMG",
                                           "WEAPSLOT_DMG", "WEAPSENT_DMG", "WEAPEASY_DMG"};
    static const char *const fragments[] = {"_DMG", "DAMAGE", "BROKEN", "OBSOLETE"};
    static const char *const exact[] = {"SPIDERBRAIN"};
    for (unsigned index = 0; index < sizeof(prefixes) / sizeof(prefixes[0]); ++index)
        if (strncmp(id, prefixes[index], strlen(prefixes[index])) == 0) return 1;
    for (unsigned index = 0; index < sizeof(fragments) / sizeof(fragments[0]); ++index)
        if (strstr(id, fragments[index])) return 1;
    for (unsigned index = 0; index < sizeof(exact) / sizeof(exact[0]); ++index)
        if (strcmp(id, exact[index]) == 0) return 1;
    return 0;
}

// Structural rules read from the running game's own definition, so entries added by a later game
// version are refused by what they are, not by a list of names.
static LONG technology_blocked(const uint8_t *definition, const char *id) {
    static const uint32_t flags[] = {TECHNOLOGY_BROKEN_SLOT_OFFSET, TECHNOLOGY_TEMPLATE_OFFSET,
                                     TECHNOLOGY_PROCEDURAL_OFFSET, TECHNOLOGY_REPAIR_OFFSET,
                                     TECHNOLOGY_TEACH_OFFSET, TECHNOLOGY_WIKI_OFFSET};
    MEMORY_BASIC_INFORMATION memory;
    if (VirtualQuery(definition, &memory, sizeof(memory)) != sizeof(memory) || memory.State != MEM_COMMIT ||
        (memory.Protect & (PAGE_GUARD | PAGE_NOACCESS)) ||
        (uintptr_t)definition + TECHNOLOGY_DEFINITION_SIZE > (uintptr_t)memory.BaseAddress + memory.RegionSize)
        return TECHNOLOGY_BLOCKED_LAYOUT;
    int32_t category = *(const int32_t *)(definition + TECHNOLOGY_CATEGORY_OFFSET);
    if (strncmp((const char *)definition + TECHNOLOGY_ID_OFFSET, id, 16) != 0 ||
        category < 0 || category >= TECHNOLOGY_CATEGORY_COUNT) return TECHNOLOGY_BLOCKED_LAYOUT;
    for (unsigned index = 0; index < sizeof(flags) / sizeof(flags[0]); ++index)
        if (definition[flags[index]] > 1) return TECHNOLOGY_BLOCKED_LAYOUT;
    if (definition[TECHNOLOGY_BROKEN_SLOT_OFFSET]) return TECHNOLOGY_BLOCKED_DAMAGED;
    if (category == TECHNOLOGY_CATEGORY_MAINTENANCE) return TECHNOLOGY_BLOCKED_MAINTENANCE;
    if (definition[TECHNOLOGY_TEMPLATE_OFFSET] || definition[TECHNOLOGY_PROCEDURAL_OFFSET])
        return TECHNOLOGY_BLOCKED_TEMPLATE;
    if (definition[TECHNOLOGY_REPAIR_OFFSET]) return TECHNOLOGY_BLOCKED_REPAIR;
    return TECHNOLOGY_PENDING;
}

__attribute__((unused)) static int technology_resolve(uintptr_t base) {
    static const unsigned char lookup_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x10, 0x48, 0x89, 0x6c, 0x24, 0x18, 0x48, 0x89,
        0x74, 0x24, 0x20, 0x57, 0x48, 0x83, 0xec, 0x30, 0x48, 0x8b, 0xf1, 0x41,
        0x0f, 0xb6, 0xe8, 0x48, 0x81, 0xc1, 0x40, 0x03
    };
    static const unsigned char learn_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x6c, 0x24, 0x18, 0x56, 0x57,
        0x41, 0x56, 0x48, 0x81, 0xec, 0x90, 0x00, 0x00, 0x00, 0x41, 0x0f, 0xb6,
        0xe9, 0x45, 0x0f, 0xb6, 0xf0, 0x48, 0x8b, 0xda
    };
    technology_lookup = (technology_lookup_fn)(base + TECHNOLOGY_LOOKUP_RVA);
    technology_learn = (technology_learn_fn)(base + TECHNOLOGY_LEARN_RVA);
    return memcmp((void *)(base + TECHNOLOGY_LOOKUP_RVA), lookup_entry, sizeof(lookup_entry)) == 0 &&
           memcmp((void *)(base + TECHNOLOGY_LEARN_RVA), learn_entry, sizeof(learn_entry)) == 0;
}

// Runs on the game's update thread: teach each requested technology once.
static void technology_apply_request(void) {
    // The routines stay unresolved in the fixture build, where no game manager exists.
    uintptr_t manager = technology_lookup && technology_learn
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    LONG count = InterlockedCompareExchange(&technology_count, 0, 0);
    uint8_t silent = InterlockedCompareExchange(&technology_silent, 0, 0) != 0;
    uint8_t *player_state = (uint8_t *)(manager + TECHNOLOGY_PLAYER_STATE_OFFSET);
    int ready = manager && writable_range((uintptr_t)player_state + TECHNOLOGY_KNOWN_COUNT_OFFSET, 16);
    if (ready) InterlockedExchange(&technology_known_before,
                                   *(const int32_t *)(player_state + TECHNOLOGY_KNOWN_COUNT_OFFSET));
    for (LONG index = 0; index < count && index < TECHNOLOGY_REQUEST_CAPACITY; ++index) {
        const char *id = technology_ids[index];
        LONG result;
        if (!ready) result = TECHNOLOGY_BLOCKED_LAYOUT;
        else if (technology_blocked_id(id)) result = TECHNOLOGY_BLOCKED_ID;
        else {
            // Same arguments as the shipped reward handler: table, 16-byte ID, report flag 1.
            uint8_t *definition = technology_lookup((void *)(manager + TECHNOLOGY_TABLE_OFFSET), id, 1);
            if (!definition) result = TECHNOLOGY_UNKNOWN_ID;
            else if ((result = technology_blocked(definition, id)) == TECHNOLOGY_PENDING)
                result = technology_learn(player_state, definition, 0, silent) ? TECHNOLOGY_LEARNED
                                                                               : TECHNOLOGY_NOT_ADDED;
        }
        InterlockedExchange(&technology_results[index], result);
    }
    if (ready) InterlockedExchange(&technology_known_after,
                                   *(const int32_t *)(player_state + TECHNOLOGY_KNOWN_COUNT_OFFSET));
    InterlockedExchange(&technology_state, 2);
}

static int technology_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-technology-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: optional "silent=1", then one "id=<ID>" per line. Any other
// content, a malformed ID, a duplicate or more than the capacity rejects the whole request.
static int technology_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&technology_state, 0, 0) != 0 || !technology_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG count = 0, silent = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if (strcmp(line, "silent=1") == 0) { silent = 1; continue; }
        if (strcmp(line, "silent=0") == 0) { silent = 0; continue; }
        size_t length = strlen(line);
        if (strncmp(line, "id=", 3) != 0 || length < 4 || length > 3 + 15 || count >= TECHNOLOGY_REQUEST_CAPACITY) {
            ok = 0;
            break;
        }
        for (const char *cursor = line + 3; *cursor; ++cursor)
            if (!((*cursor >= 'A' && *cursor <= 'Z') || (*cursor >= '0' && *cursor <= '9') || *cursor == '_')) ok = 0;
        for (LONG seen = 0; ok && seen < count; ++seen)
            if (strcmp(technology_ids[seen], line + 3) == 0) ok = 0;
        if (!ok) break;
        memset(technology_ids[count], 0, sizeof(technology_ids[count]));
        memcpy(technology_ids[count], line + 3, length - 3);
        InterlockedExchange(&technology_results[count], TECHNOLOGY_PENDING);
        ++count;
    }
    fclose(file);
    if (!ok || count == 0) return 0;
    InterlockedExchange(&technology_silent, silent);
    InterlockedExchange(&technology_count, count);
    InterlockedExchange(&technology_known_before, -1);
    InterlockedExchange(&technology_known_after, -1);
    return 1;
}

// Called from the worker thread: write one line per requested ID after the game thread applied them.
static void technology_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&technology_state, 0, 0) != 2 || !technology_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        LONG count = InterlockedCompareExchange(&technology_count, 0, 0);
        fprintf(file, "requested=%ld\nknown_before=%ld\nknown_after=%ld\n", (long)count,
                (long)InterlockedCompareExchange(&technology_known_before, 0, 0),
                (long)InterlockedCompareExchange(&technology_known_after, 0, 0));
        for (LONG index = 0; index < count; ++index) {
            LONG result = InterlockedCompareExchange(&technology_results[index], 0, 0);
            fprintf(file, "%.16s=%s\n", technology_ids[index], technology_result_names[result]);
        }
        fclose(file);
    }
    InterlockedExchange(&technology_state, 0);
}
