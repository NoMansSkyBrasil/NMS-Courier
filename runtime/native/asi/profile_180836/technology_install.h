// Waiting-technology domain of the build 180836 research profile: list the technologies that sit in
// an inventory still waiting for their components, and finish them through the game's own routine.
// Included once by profile_core.c, after technology_learn.h (it reuses that file's refusal rules).
//
// Read in the executable on 2026-10-10 (docs/TECHNOLOGY_INSTALL_NOTES.md):
//   - GcInventoryElement (0x30 bytes): Id +0x00, Index +0x10 (x, y), Amount +0x18, DamageFactor +0x1c,
//     MaxAmount +0x20, Type +0x24 (1 is a technology), FullyInstalled +0x29.
//   - 47de30(player state holder at manager+0xc240, inventory choice, owner index) returns the store
//     of a GcInventoryChoice; a store holds its element count at +0x8c and its elements at +0x90.
//   - 10b7c80(object) is what the game's install screen calls when the last component is in: it reads
//     the choice at object+0x4f0, the owner index at +0x4f4 and the slot at +0x4f8, finds the element,
//     posts the technology's message, clears DamageFactor, sets FullyInstalled, sets the charge and
//     refreshes the store. Nothing else of the object is read, so a blank block with those three
//     fields stands in for the screen.
//
// Listing only reads. Finishing calls the game's routine once per element; this file writes nothing
// into a store itself. The components the game would have asked for are not taken: the routine does
// not take them (its caller, the install screen, does). Not exercised in the running game when this
// was written.

#define INSTALL_FINISH_RVA 0x10b7c80u
#define INSTALL_STORE_RVA 0x47de30u
#define INSTALL_HOLDER_OFFSET 0xc240u       // from the manager object
#define INSTALL_STORE_COUNT_OFFSET 0x8cu
#define INSTALL_STORE_DATA_OFFSET 0x90u
#define INSTALL_ELEMENT_SIZE 0x30u
#define INSTALL_ELEMENT_INDEX_OFFSET 0x10u
#define INSTALL_ELEMENT_TYPE_OFFSET 0x24u
#define INSTALL_ELEMENT_FLAG_OFFSET 0x29u
#define INSTALL_TYPE_TECHNOLOGY 1
#define INSTALL_OBJECT_SIZE 0x800u
#define INSTALL_OBJECT_CHOICE_OFFSET 0x4f0u
#define INSTALL_OBJECT_OWNER_OFFSET 0x4f4u
#define INSTALL_OBJECT_SLOT_OFFSET 0x4f8u
#define INSTALL_MAX_ELEMENTS 512
#define INSTALL_MAX_ENTRIES 256
#define INSTALL_SHIPS 12
#define INSTALL_VEHICLES 7

enum {
    INSTALL_WAITING = 0,       // listed, not asked to finish
    INSTALL_FINISHED,          // the game's routine ran and the element now reads fully installed
    INSTALL_STILL_WAITING,     // the routine ran and the element did not change
    INSTALL_BLOCKED,           // refused by the technology rules; never finished
    INSTALL_UNKNOWN_ID         // the running game has no definition for the identifier; never finished
};
static const char *const install_entry_names[] = {"waiting", "finished", "still_waiting", "blocked", "unknown_id"};
enum { INSTALL_PENDING = 0, INSTALL_LISTED, INSTALL_DONE, INSTALL_NOT_READY };
static const char *const install_result_names[] = {"pending", "listed", "finished", "not_ready"};

typedef struct { int32_t choice, owner, x, y; char id[17]; LONG state; } install_entry;
typedef void *(*install_store_fn)(void *holder, int32_t choice, int32_t owner);
typedef void (*install_finish_fn)(void *object);

static install_store_fn install_store;
static install_finish_fn install_finish;
static volatile LONG install_state;      // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG install_finish_mode;   // 0 list only, 1 finish
static volatile LONG install_all;
static volatile LONG install_wanted_count;
static volatile LONG install_result;
static volatile LONG install_entry_count;
static volatile LONG install_truncated;
static int32_t install_wanted[INSTALL_MAX_ENTRIES][4];
static install_entry install_entries[INSTALL_MAX_ENTRIES];
static uint8_t install_object[INSTALL_OBJECT_SIZE];

__attribute__((unused)) static int install_resolve(uintptr_t base) {
    static const unsigned char finish_entry[32] = {
        0x48, 0x8b, 0xc4, 0x48, 0x89, 0x48, 0x08, 0x55, 0x41, 0x54, 0x48, 0x8d, 0x68, 0xa1, 0x48, 0x81,
        0xec, 0xd8, 0x00, 0x00, 0x00, 0x8b, 0x91, 0xf4, 0x04, 0x00, 0x00, 0x48, 0x89, 0x58, 0x20, 0x8b
    };
    static const unsigned char store_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x57, 0x48, 0x83, 0xec, 0x20, 0x48, 0x8b, 0xd9, 0x41, 0x83, 0xf8,
        0xff, 0x75, 0x31, 0x8b, 0xca, 0x83, 0xe9, 0x04, 0x74, 0x20, 0x83, 0xe9, 0x01, 0x74, 0x1b, 0x83
    };
    install_finish = (install_finish_fn)(base + INSTALL_FINISH_RVA);
    install_store = (install_store_fn)(base + INSTALL_STORE_RVA);
    return memcmp((void *)(base + INSTALL_FINISH_RVA), finish_entry, sizeof(finish_entry)) == 0 &&
           memcmp((void *)(base + INSTALL_STORE_RVA), store_entry, sizeof(store_entry)) == 0;
}

// An identifier as the game stores it: 1 to 15 printable characters, then zeros.
static int install_plain_id(const uint8_t *id) {
    size_t length = 0;
    while (length < 16 && id[length]) {
        if (id[length] < 0x21 || id[length] > 0x7e) return 0;
        ++length;
    }
    if (length < 1 || length > 15) return 0;
    for (size_t index = length; index < 16; ++index) if (id[index]) return 0;
    return 1;
}

static int install_is_wanted(const install_entry *entry) {
    if (InterlockedCompareExchange(&install_all, 0, 0)) return 1;
    LONG count = InterlockedCompareExchange(&install_wanted_count, 0, 0);
    for (LONG index = 0; index < count; ++index)
        if (install_wanted[index][0] == entry->choice && install_wanted[index][1] == entry->owner &&
            install_wanted[index][2] == entry->x && install_wanted[index][3] == entry->y) return 1;
    return 0;
}

// Walk one store: record every waiting technology and, when asked, finish it.
static void install_walk_store(uintptr_t manager, int32_t choice, int32_t owner, int finish) {
    uint8_t *store = install_store((void *)(manager + INSTALL_HOLDER_OFFSET), choice, owner);
    if (!store || !writable_range((uintptr_t)store, STORE_SIZE)) return;
    uint32_t count = *(const uint32_t *)(store + INSTALL_STORE_COUNT_OFFSET);
    if (count < 1 || count > INSTALL_MAX_ELEMENTS) return;
    // Positions are copied first: finishing an element makes the game refresh the store.
    int32_t positions[INSTALL_MAX_ELEMENTS][2];
    uint32_t found = 0;
    const uint8_t *data = *(uint8_t *const *)(store + INSTALL_STORE_DATA_OFFSET);
    if (!data || !writable_range((uintptr_t)data, (size_t)count * INSTALL_ELEMENT_SIZE)) return;
    for (uint32_t index = 0; index < count; ++index) {
        const uint8_t *element = data + (size_t)index * INSTALL_ELEMENT_SIZE;
        if (*(const int32_t *)(element + INSTALL_ELEMENT_TYPE_OFFSET) != INSTALL_TYPE_TECHNOLOGY ||
            element[INSTALL_ELEMENT_FLAG_OFFSET] != 0 || !install_plain_id(element)) continue;
        memcpy(positions[found++], element + INSTALL_ELEMENT_INDEX_OFFSET, 8);
    }
    for (uint32_t index = 0; index < found; ++index) {
        LONG slot = InterlockedCompareExchange(&install_entry_count, 0, 0);
        if (slot >= INSTALL_MAX_ENTRIES) { InterlockedExchange(&install_truncated, 1); return; }
        install_entry *entry = &install_entries[slot];
        const uint8_t *element = NULL;
        // Find the element again by its position; an earlier call may have moved the array.
        count = *(const uint32_t *)(store + INSTALL_STORE_COUNT_OFFSET);
        data = *(uint8_t *const *)(store + INSTALL_STORE_DATA_OFFSET);
        if (count > INSTALL_MAX_ELEMENTS || !data ||
            !writable_range((uintptr_t)data, (size_t)count * INSTALL_ELEMENT_SIZE)) return;
        for (uint32_t other = 0; other < count && !element; ++other) {
            const uint8_t *candidate = data + (size_t)other * INSTALL_ELEMENT_SIZE;
            if (memcmp(candidate + INSTALL_ELEMENT_INDEX_OFFSET, positions[index], 8) == 0) element = candidate;
        }
        if (!element || *(const int32_t *)(element + INSTALL_ELEMENT_TYPE_OFFSET) != INSTALL_TYPE_TECHNOLOGY ||
            element[INSTALL_ELEMENT_FLAG_OFFSET] != 0 || !install_plain_id(element)) continue;
        memset(entry, 0, sizeof(*entry));
        entry->choice = choice;
        entry->owner = owner;
        entry->x = positions[index][0];
        entry->y = positions[index][1];
        memcpy(entry->id, element, 16);
        entry->state = INSTALL_WAITING;
        // The same refusals as teaching: a damaged-slot, maintenance, template or repair entry is
        // never finished, and neither is anything the running game has no definition for.
        uint8_t *definition = technology_blocked_id(entry->id) ? NULL
            : technology_lookup((void *)(manager + TECHNOLOGY_TABLE_OFFSET), entry->id, 0);
        if (technology_blocked_id(entry->id)) entry->state = INSTALL_BLOCKED;
        else if (!definition) entry->state = INSTALL_UNKNOWN_ID;
        else if (technology_blocked(definition, entry->id) != TECHNOLOGY_PENDING) entry->state = INSTALL_BLOCKED;
        InterlockedExchange(&install_entry_count, slot + 1);
        if (!finish || entry->state != INSTALL_WAITING || !install_is_wanted(entry)) continue;
        memset(install_object, 0, sizeof(install_object));
        *(int32_t *)(install_object + INSTALL_OBJECT_CHOICE_OFFSET) = choice;
        *(int32_t *)(install_object + INSTALL_OBJECT_OWNER_OFFSET) = owner;
        memcpy(install_object + INSTALL_OBJECT_SLOT_OFFSET, positions[index], 8);
        install_finish(install_object);
        // Read the outcome back from the store instead of trusting the call.
        entry->state = INSTALL_STILL_WAITING;
        count = *(const uint32_t *)(store + INSTALL_STORE_COUNT_OFFSET);
        data = *(uint8_t *const *)(store + INSTALL_STORE_DATA_OFFSET);
        if (count > INSTALL_MAX_ELEMENTS || !data ||
            !writable_range((uintptr_t)data, (size_t)count * INSTALL_ELEMENT_SIZE)) return;
        for (uint32_t other = 0; other < count; ++other) {
            const uint8_t *candidate = data + (size_t)other * INSTALL_ELEMENT_SIZE;
            if (memcmp(candidate + INSTALL_ELEMENT_INDEX_OFFSET, positions[index], 8) == 0 &&
                memcmp(candidate, entry->id, 16) == 0 && candidate[INSTALL_ELEMENT_FLAG_OFFSET] == 1)
                entry->state = INSTALL_FINISHED;
        }
    }
}

// Runs on the game's update thread. The stores walked, by the game's own inventory choices: the
// exosuit (0 to 2), the multi-tool in hand (3), each of the twelve ships (4 to 6), the freighter
// (7 to 9) and each of the seven exocraft (10 and 11).
static void install_apply_request(void) {
    // The routines stay unresolved in the fixture build, where no game manager exists.
    uintptr_t manager = install_store && install_finish && technology_lookup
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    int finish = InterlockedCompareExchange(&install_finish_mode, 0, 0) != 0;
    InterlockedExchange(&install_entry_count, 0);
    InterlockedExchange(&install_truncated, 0);
    if (manager && writable_range(manager + INSTALL_HOLDER_OFFSET, sizeof(uintptr_t)) &&
        writable_range(*(const uintptr_t *)(manager + INSTALL_HOLDER_OFFSET), 1)) {
        for (int32_t choice = 0; choice <= 3; ++choice) install_walk_store(manager, choice, -1, finish);
        for (int32_t owner = 0; owner < INSTALL_SHIPS; ++owner)
            for (int32_t choice = 4; choice <= 6; ++choice) install_walk_store(manager, choice, owner, finish);
        for (int32_t choice = 7; choice <= 9; ++choice) install_walk_store(manager, choice, -1, finish);
        for (int32_t owner = 0; owner < INSTALL_VEHICLES; ++owner)
            for (int32_t choice = 10; choice <= 11; ++choice) install_walk_store(manager, choice, owner, finish);
        InterlockedExchange(&install_result, finish ? INSTALL_DONE : INSTALL_LISTED);
    } else {
        InterlockedExchange(&install_result, INSTALL_NOT_READY);
    }
    InterlockedExchange(&install_state, 2);
}

static int install_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-install-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: "mode=list", or "mode=finish" followed by either "all=1" or 1 to
// 256 "slot=<choice>,<owner>,<x>,<y>" lines (choice 0 to 11, owner -1 to 11, x and y 0 to 15), none
// twice. Anything else rejects the whole request.
static int install_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&install_state, 0, 0) != 0 || !install_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG mode = -1, all = 0, count = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        if (!strchr(line, '\n') && !feof(file)) { ok = 0; break; }
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if (strcmp(line, "mode=list") == 0 && mode < 0) mode = 0;
        else if (strcmp(line, "mode=finish") == 0 && mode < 0) mode = 1;
        else if (strcmp(line, "all=1") == 0 && mode == 1 && !all && !count) all = 1;
        else if (strncmp(line, "slot=", 5) == 0 && mode == 1 && !all && count < INSTALL_MAX_ENTRIES) {
            int values[4], used = 0;
            if (sscanf(line + 5, "%d,%d,%d,%d%n", &values[0], &values[1], &values[2], &values[3], &used) != 4 ||
                line[5 + used] || values[0] < 0 || values[0] > 11 || values[1] < -1 || values[1] > 11 ||
                values[2] < 0 || values[2] > 15 || values[3] < 0 || values[3] > 15) { ok = 0; break; }
            for (LONG index = 0; index < count; ++index)
                if (install_wanted[index][0] == values[0] && install_wanted[index][1] == values[1] &&
                    install_wanted[index][2] == values[2] && install_wanted[index][3] == values[3]) ok = 0;
            for (int index = 0; index < 4; ++index) install_wanted[count][index] = values[index];
            ++count;
        } else ok = 0;
    }
    fclose(file);
    if (!ok || mode < 0 || (mode == 1 && !all && count < 1)) return 0;
    InterlockedExchange(&install_finish_mode, mode);
    InterlockedExchange(&install_all, all);
    InterlockedExchange(&install_wanted_count, count);
    InterlockedExchange(&install_result, INSTALL_PENDING);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void install_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&install_state, 0, 0) != 2 || !install_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        LONG count = InterlockedCompareExchange(&install_entry_count, 0, 0), finished = 0;
        for (LONG index = 0; index < count; ++index) finished += install_entries[index].state == INSTALL_FINISHED;
        fprintf(file, "result=%s\nentries=%ld\nfinished=%ld\ntruncated=%ld\n",
                install_result_names[InterlockedCompareExchange(&install_result, 0, 0)], count, finished,
                InterlockedCompareExchange(&install_truncated, 0, 0));
        for (LONG index = 0; index < count; ++index) {
            const install_entry *entry = &install_entries[index];
            fprintf(file, "entry=%d,%d,%d,%d,%s,%s\n", entry->choice, entry->owner, entry->x, entry->y,
                    entry->id, install_entry_names[entry->state]);
        }
        fclose(file);
    }
    InterlockedExchange(&install_state, 0);
}
