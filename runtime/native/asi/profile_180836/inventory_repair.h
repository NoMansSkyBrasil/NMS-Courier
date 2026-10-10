// Repair domain of the build 180836 research profile: have the game repair every damaged technology
// of an inventory, through the reward its own missions use after a crash. Included once by
// profile_core.c, after reward_carrier.h.
//
// Read in the executable and the mission tables on 2026-10-10 (docs/UPKEEP_NOTES.md):
// GcRewardRepairWholeInventory (class 0xe7a841f6, 4 bytes) holds InventoryToRepair at +0x00, an enum
// the executable names Personal, PersonalTech, Ship, ShipTech, Freighter, Vehicle,
// AttachedAbandonedShip, Weapon. 27 mission rewards use it, with Weapon and Ship.
//
// The carrier is the reward COURIER_REPAIR of the data file (runtime/mods/courier_rewards), see
// reward_carrier.h. Only the carrier is written, for one call each inventory, and put back; the game
// does the repair. Not exercised in the running game when this was written.

#define REPAIR_CLASS_HASH 0xe7a841f6u
#define REPAIR_REWARD_SIZE 4u
#define REPAIR_PLACEHOLDER 7          // Weapon, as the data file gives the carrier
#define REPAIR_MAX 7

enum { REPAIR_PENDING = 0, REPAIR_GIVEN, REPAIR_UNKNOWN_REWARD, REPAIR_BAD_LAYOUT, REPAIR_NOT_READY };
static const char *const repair_result_names[] = {"pending", "given", "unknown_reward", "bad_layout", "not_ready"};

static volatile LONG repair_state;     // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG repair_silent;
static volatile LONG repair_count;
static volatile LONG repair_result;
static volatile LONG repair_calls;
static int32_t repair_inventories[REPAIR_MAX];

static int repair_is_carrier(const void *reward, int unused) {
    (void)unused;
    return *(const int32_t *)reward == REPAIR_PLACEHOLDER;
}

// Runs on the game's update thread.
static void repair_apply_request(void) {
    uintptr_t manager = give_reward && reward_manager
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    LONG found = REWARD_CARRIER_NOT_READY, calls = 0, count = InterlockedCompareExchange(&repair_count, 0, 0);
    uint8_t silent = InterlockedCompareExchange(&repair_silent, 0, 0) != 0;
    int32_t *reward = manager
        ? reward_carrier_find(manager, "COURIER_REPAIR", REPAIR_CLASS_HASH, REPAIR_REWARD_SIZE, repair_is_carrier, 0, &found)
        : NULL;
    if (reward) {
        for (; calls < count; ++calls) {
            *reward = repair_inventories[calls];
            reward_carrier_give("COURIER_REPAIR", silent);
        }
        *reward = REPAIR_PLACEHOLDER;
    }
    InterlockedExchange(&repair_calls, calls);
    InterlockedExchange(&repair_result, reward ? REPAIR_GIVEN
                                        : found == REWARD_CARRIER_UNKNOWN ? REPAIR_UNKNOWN_REWARD
                                        : found == REWARD_CARRIER_BAD_LAYOUT ? REPAIR_BAD_LAYOUT
                                        : REPAIR_NOT_READY);
    InterlockedExchange(&repair_state, 2);
}

static int repair_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-repair-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: "silent=0|1" once and 1 to 7 "inventory=<n>" lines, n one of 0 to 5
// or 7 (the attached abandoned ship, 6, is never asked for), none twice. Anything else rejects it.
static int repair_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&repair_state, 0, 0) != 0 || !repair_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[32];
    LONG silent = -1, count = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        if (!strchr(line, '\n') && !feof(file)) { ok = 0; break; }
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if ((strcmp(line, "silent=0") == 0 || strcmp(line, "silent=1") == 0) && silent < 0) silent = line[7] - '0';
        else if (strncmp(line, "inventory=", 10) == 0 && strlen(line) == 11 && count < REPAIR_MAX) {
            int value = line[10] - '0';
            if (value < 0 || value > 7 || value == 6) { ok = 0; break; }
            for (LONG index = 0; index < count; ++index) if (repair_inventories[index] == value) ok = 0;
            repair_inventories[count++] = value;
        } else ok = 0;
    }
    fclose(file);
    if (!ok || silent < 0 || count < 1) return 0;
    InterlockedExchange(&repair_silent, silent);
    InterlockedExchange(&repair_count, count);
    InterlockedExchange(&repair_result, REPAIR_PENDING);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void repair_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&repair_state, 0, 0) != 2 || !repair_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        fprintf(file, "result=%s\nrequested=%ld\nreward_calls=%ld\n",
                repair_result_names[InterlockedCompareExchange(&repair_result, 0, 0)],
                InterlockedCompareExchange(&repair_count, 0, 0), InterlockedCompareExchange(&repair_calls, 0, 0));
        fclose(file);
    }
    InterlockedExchange(&repair_state, 0);
}
