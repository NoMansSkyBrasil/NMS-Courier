// Recharge domain of the build 180836 research profile: have the game recharge the installed
// technologies whose charge has run down, through the reward its own missions use. Included once by
// profile_core.c, after reward_carrier.h and technology_install.h (it walks the same inventories with
// the same store routine and element layout).
//
// Read in the executable and the mission tables on 2026-10-10 (docs/UPKEEP_NOTES.md):
// GcRewardRechargeTech (class 0x865c738a, 0x18 bytes) holds TechID at +0x00 (16 bytes of text) and
// Silent at +0x10. The game's tables use it for PROTECT, LAUNCHER and SUB_ENGINE. A technology
// element keeps its charge in Amount (+0x18) of MaxAmount (+0x20).
//
// The carrier is the reward COURIER_RECHARGE of the data file. This file only reads the inventories
// to learn which technologies are low, then writes the carrier's TechID for one call each and puts
// it back; the game does the recharging. Not exercised in the running game when this was written.

#define RECHARGE_CLASS_HASH 0x865c738au
#define RECHARGE_REWARD_SIZE 0x18u
#define RECHARGE_ID_SIZE 0x10u
#define RECHARGE_SILENT_OFFSET 0x10u
#define RECHARGE_ELEMENT_AMOUNT_OFFSET 0x18u
#define RECHARGE_ELEMENT_MAX_OFFSET 0x20u
#define RECHARGE_MAX 64

enum { RECHARGE_PENDING = 0, RECHARGE_GIVEN, RECHARGE_NOTHING, RECHARGE_UNKNOWN_REWARD, RECHARGE_BAD_LAYOUT, RECHARGE_NOT_READY };
static const char *const recharge_result_names[] = {"pending", "given", "nothing_low", "unknown_reward", "bad_layout", "not_ready"};

static volatile LONG recharge_state;   // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG recharge_silent;
static volatile LONG recharge_threshold;   // percent: a charge below it is recharged; 100 means any not full
static volatile LONG recharge_result;
static volatile LONG recharge_count;
static char recharge_ids[RECHARGE_MAX][17];

static int recharge_is_carrier(const void *reward, int unused) {
    static const char placeholder[RECHARGE_ID_SIZE] = "COURIER";
    const uint8_t *bytes = reward;
    (void)unused;
    return memcmp(bytes, placeholder, sizeof(placeholder)) == 0 && bytes[RECHARGE_SILENT_OFFSET] <= 1;
}

// Note the technologies of one store whose charge is under the threshold. Reads only.
static void recharge_scan_store(uintptr_t manager, int32_t choice, int32_t owner, LONG threshold) {
    uint8_t *store = install_store((void *)(manager + INSTALL_HOLDER_OFFSET), choice, owner);
    if (!store || !writable_range((uintptr_t)store, STORE_SIZE)) return;
    uint32_t count = *(const uint32_t *)(store + INSTALL_STORE_COUNT_OFFSET);
    const uint8_t *data = *(uint8_t *const *)(store + INSTALL_STORE_DATA_OFFSET);
    if (count < 1 || count > INSTALL_MAX_ELEMENTS || !data ||
        !writable_range((uintptr_t)data, (size_t)count * INSTALL_ELEMENT_SIZE)) return;
    for (uint32_t index = 0; index < count; ++index) {
        const uint8_t *element = data + (size_t)index * INSTALL_ELEMENT_SIZE;
        int32_t amount = *(const int32_t *)(element + RECHARGE_ELEMENT_AMOUNT_OFFSET);
        int32_t most = *(const int32_t *)(element + RECHARGE_ELEMENT_MAX_OFFSET);
        if (*(const int32_t *)(element + INSTALL_ELEMENT_TYPE_OFFSET) != INSTALL_TYPE_TECHNOLOGY ||
            element[INSTALL_ELEMENT_FLAG_OFFSET] != 1 || !install_plain_id(element) ||
            most < 1 || amount < 0 || amount >= most || (int64_t)amount * 100 >= (int64_t)most * threshold) continue;
        char id[17] = {0};
        memcpy(id, element, 16);
        if (technology_blocked_id(id)) continue;
        LONG known = InterlockedCompareExchange(&recharge_count, 0, 0);
        int listed = 0;
        for (LONG other = 0; other < known && !listed; ++other) listed = strcmp(recharge_ids[other], id) == 0;
        if (listed || known >= RECHARGE_MAX) continue;
        memcpy(recharge_ids[known], id, sizeof(id));
        InterlockedExchange(&recharge_count, known + 1);
    }
}

// Runs on the game's update thread.
static void recharge_apply_request(void) {
    uintptr_t manager = give_reward && reward_manager && install_store
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    LONG found = REWARD_CARRIER_NOT_READY, threshold = InterlockedCompareExchange(&recharge_threshold, 0, 0);
    uint8_t silent = InterlockedCompareExchange(&recharge_silent, 0, 0) != 0;
    InterlockedExchange(&recharge_count, 0);
    uint8_t *reward = manager
        ? reward_carrier_find(manager, "COURIER_RECHARGE", RECHARGE_CLASS_HASH, RECHARGE_REWARD_SIZE,
                              recharge_is_carrier, 0, &found)
        : NULL;
    if (reward && writable_range(manager + INSTALL_HOLDER_OFFSET, sizeof(uintptr_t)) &&
        writable_range(*(const uintptr_t *)(manager + INSTALL_HOLDER_OFFSET), 1)) {
        // The same inventories the waiting-technology walk covers.
        for (int32_t choice = 0; choice <= 3; ++choice) recharge_scan_store(manager, choice, -1, threshold);
        for (int32_t owner = 0; owner < INSTALL_SHIPS; ++owner)
            for (int32_t choice = 4; choice <= 6; ++choice) recharge_scan_store(manager, choice, owner, threshold);
        for (int32_t choice = 7; choice <= 9; ++choice) recharge_scan_store(manager, choice, -1, threshold);
        for (int32_t owner = 0; owner < INSTALL_VEHICLES; ++owner)
            for (int32_t choice = 10; choice <= 11; ++choice) recharge_scan_store(manager, choice, owner, threshold);
        uint8_t original[RECHARGE_REWARD_SIZE];
        memcpy(original, reward, sizeof(original));
        LONG count = InterlockedCompareExchange(&recharge_count, 0, 0);
        reward[RECHARGE_SILENT_OFFSET] = silent;
        for (LONG index = 0; index < count; ++index) {
            memset(reward, 0, RECHARGE_ID_SIZE);
            memcpy(reward, recharge_ids[index], strlen(recharge_ids[index]));
            reward_carrier_give("COURIER_RECHARGE", silent);
        }
        memcpy(reward, original, sizeof(original));
        InterlockedExchange(&recharge_result, count > 0 ? RECHARGE_GIVEN : RECHARGE_NOTHING);
    } else {
        InterlockedExchange(&recharge_result, found == REWARD_CARRIER_UNKNOWN ? RECHARGE_UNKNOWN_REWARD
                                              : found == REWARD_CARRIER_BAD_LAYOUT ? RECHARGE_BAD_LAYOUT
                                              : RECHARGE_NOT_READY);
    }
    InterlockedExchange(&recharge_state, 2);
}

static int recharge_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-recharge-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: "silent=0|1" and "threshold=<1 to 100>", each once. Anything else
// rejects it.
static int recharge_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&recharge_state, 0, 0) != 0 || !recharge_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[32];
    int silent = -1, threshold = -1, ok = 1, used = 0;
    while (ok && fgets(line, sizeof(line), file)) {
        if (!strchr(line, '\n') && !feof(file)) { ok = 0; break; }
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if ((strcmp(line, "silent=0") == 0 || strcmp(line, "silent=1") == 0) && silent < 0) silent = line[7] - '0';
        else if (strncmp(line, "threshold=", 10) == 0 && threshold < 0 &&
                 sscanf(line + 10, "%d%n", &threshold, &used) == 1 && !line[10 + used] &&
                 threshold >= 1 && threshold <= 100) continue;
        else ok = 0;
    }
    fclose(file);
    if (!ok || silent < 0 || threshold < 1) return 0;
    InterlockedExchange(&recharge_silent, silent);
    InterlockedExchange(&recharge_threshold, threshold);
    InterlockedExchange(&recharge_result, RECHARGE_PENDING);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void recharge_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&recharge_state, 0, 0) != 2 || !recharge_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        LONG count = InterlockedCompareExchange(&recharge_count, 0, 0);
        fprintf(file, "result=%s\nrecharged=%ld\n",
                recharge_result_names[InterlockedCompareExchange(&recharge_result, 0, 0)], count);
        for (LONG index = 0; index < count; ++index) fprintf(file, "tech=%s\n", recharge_ids[index]);
        fclose(file);
    }
    InterlockedExchange(&recharge_state, 0);
}
