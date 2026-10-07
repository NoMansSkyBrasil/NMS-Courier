// Shared by the starship, multitool and exosuit domains of the build 180836 research profile: the one
// request that changes an owned inventory in place (full grids and/or every technology slot special)
// and the steps that are the same for all three. Where each domain's stores are is in its own file.
// Included once by profile_core.c.

static volatile LONG owned_state;          // 0 idle, 1 requested
static volatile LONG owned_target;         // 0 ship, 1 multitool record, 2 equipped multitool, 3 exosuit, 4 primary ship
static volatile LONG owned_index;
static volatile LONG owned_slots;
static volatile LONG owned_super;
static volatile LONG owned_applied;
static volatile LONG owned_rejected;

// Runs on the game's update thread: one in-place change of an owned item's stores.
static void apply_owned_request(void) {
#ifndef COURIER_NATIVE_CALLBACK_FIXTURE
    uintptr_t base = (uintptr_t)GetModuleHandleW(NULL);
    uintptr_t manager = *(const uintptr_t *)(base + MANAGER_POINTER_RVA);
    LONG index = InterlockedCompareExchange(&owned_index, 0, 0);
    uint8_t *main_store = NULL, *technology = NULL;
    if (InterlockedCompareExchange(&owned_target, 0, 0) == 4) {
        // Resolve the primary ship slot the way the game does, then continue as an ordinary ship request.
        index = ship_primary_index(manager);
        InterlockedExchange(&owned_index, index);
        InterlockedExchange(&owned_target, 0);
    }
    LONG target = InterlockedCompareExchange(&owned_target, 0, 0);
    if (target == 0) ship_inventory_stores(manager, index, &main_store, &technology);
    else if (target == 1) technology = multitool_record_store(manager, index);
    else if (target == 2) technology = multitool_equipped_store(manager);
    else if (target == 3) exosuit_inventory_stores(manager, &main_store, &technology);
    int suit = target == 3;
    if (!manager || !technology || !consistent_store(technology, 0) ||
        (main_store && !consistent_store(main_store, suit))) {
        InterlockedIncrement(&owned_rejected);
        return;
    }
    if (InterlockedCompareExchange(&owned_slots, 0, 0)) {
        if (main_store) fill_store_grid(main_store);
        fill_store_grid(technology);
    }
    if (InterlockedCompareExchange(&owned_super, 0, 0)) add_special_slots(technology);
    if (main_store) {
        const int16_t *header = (const int16_t *)(main_store + 0x80);
        InterlockedExchange(&grid[0], header[0]);
        InterlockedExchange(&grid[1], header[1]);
        InterlockedExchange(&grid[2], header[2]);
    }
    const int16_t *header = (const int16_t *)(technology + 0x80);
    InterlockedExchange(&grid[3], header[0]);
    InterlockedExchange(&grid[4], header[1]);
    InterlockedExchange(&grid[5], header[2]);
    InterlockedIncrement(&owned_applied);
#endif
}

// Parse the per-process owned request: "target=ship|weapon", "index=N", optional "slots=1", "super=1".
static int read_owned_request(void) {
    wchar_t root[MAX_PATH], path[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    if (!length || length >= MAX_PATH ||
        swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-owned-request-180836-%lu.txt",
                 root, (unsigned long)GetCurrentProcessId()) < 0) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG target = -1, index = -1, slots = 0, super = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if (strcmp(line, "target=ship") == 0) target = 0;
        else if (strcmp(line, "target=weapon") == 0) target = 1;
        else if (strcmp(line, "target=equipped-weapon") == 0) { target = 2; if (index < 0) index = 0; }
        else if (strcmp(line, "target=suit") == 0) { target = 3; if (index < 0) index = 0; }
        else if (strcmp(line, "target=primary-ship") == 0) { target = 4; if (index < 0) index = 0; }
        else if (strncmp(line, "index=", 6) == 0 && line[6] >= '0' && line[6] <= '9' && (!line[7] || (line[7] >= '0' && line[7] <= '9' && !line[8])))
            index = atoi(line + 6);
        else if (strcmp(line, "slots=1") == 0) slots = 1;
        else if (strcmp(line, "super=1") == 0) super = 1;
        else ok = 0;
    }
    fclose(file);
    if (!ok || target < 0 || index < 0 || !(slots || super)) return 0;
    InterlockedExchange(&owned_target, target);
    InterlockedExchange(&owned_index, index);
    InterlockedExchange(&owned_slots, slots);
    InterlockedExchange(&owned_super, super);
    return 1;
}
