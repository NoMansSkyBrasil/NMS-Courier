// Galaxy map domain of the build 180836 research profile: let the loaded slot see purple star
// systems on the galaxy map, through the reward the story gives. Included once by profile_core.c,
// after reward_carrier.h.
//
// Read in the executable and the mission tables on 2026-10-10 (docs/UPKEEP_NOTES.md):
// GcRewardPurpleSystems (class 0x56a095a7, 1 byte) holds Allow at +0x00; three mission rewards give
// it with Allow true. Where the game keeps the state it sets was not located, so the result reports
// only that the reward was given.
//
// The carrier is the reward COURIER_PURPLE of the data file; it already holds Allow true, so nothing
// is written here: the carrier is checked and given. The view is only ever allowed, never taken
// away. Not exercised in the running game when this was written.

#define PURPLE_CLASS_HASH 0x56a095a7u
#define PURPLE_REWARD_SIZE 1u

enum { PURPLE_PENDING = 0, PURPLE_GIVEN, PURPLE_UNKNOWN_REWARD, PURPLE_BAD_LAYOUT, PURPLE_NOT_READY };
static const char *const purple_result_names[] = {"pending", "given", "unknown_reward", "bad_layout", "not_ready"};

static volatile LONG purple_state;     // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG purple_result;

static int purple_is_carrier(const void *reward, int unused) {
    (void)unused;
    return *(const uint8_t *)reward == 1;
}

// Runs on the game's update thread.
static void purple_apply_request(void) {
    uintptr_t manager = give_reward && reward_manager
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    LONG found = REWARD_CARRIER_NOT_READY;
    void *reward = manager
        ? reward_carrier_find(manager, "COURIER_PURPLE", PURPLE_CLASS_HASH, PURPLE_REWARD_SIZE, purple_is_carrier, 0, &found)
        : NULL;
    if (reward) reward_carrier_give("COURIER_PURPLE", 0);
    InterlockedExchange(&purple_result, reward ? PURPLE_GIVEN
                                        : found == REWARD_CARRIER_UNKNOWN ? PURPLE_UNKNOWN_REWARD
                                        : found == REWARD_CARRIER_BAD_LAYOUT ? PURPLE_BAD_LAYOUT
                                        : PURPLE_NOT_READY);
    InterlockedExchange(&purple_state, 2);
}

static int purple_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-purple-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// The per-process request is the one line "allow=1". Anything else rejects it.
static int purple_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&purple_state, 0, 0) != 0 || !purple_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[32];
    int lines = 0, ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if (strcmp(line, "allow=1") == 0 && lines == 0) ++lines;
        else ok = 0;
    }
    fclose(file);
    if (!ok || lines != 1) return 0;
    InterlockedExchange(&purple_result, PURPLE_PENDING);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void purple_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&purple_state, 0, 0) != 2 || !purple_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        fprintf(file, "result=%s\n", purple_result_names[InterlockedCompareExchange(&purple_result, 0, 0)]);
        fclose(file);
    }
    InterlockedExchange(&purple_state, 0);
}
