// Nexus domain of the build 180836 research profile: allow the loaded slot to use the Space Anomaly
// (the Nexus) through the game's own reward. Included once by profile_core.c, after
// reward_carrier.h.
//
// Read in the executable on 2026-10-09 (docs/EXPEDITION_HISTORY_NOTES.md): GcRewardNexus (class
// 0xb7c7de23, 0x28 bytes) holds SeasonRewardsString at +0x00 and Allow at +0x20. The reward routine
// handles it in place (f1d641): it copies Allow to one byte of the manager object at +0x28289 and,
// when that byte changed, marks the state as changed. The game ships the same reward as the entry
// R_ENABLENEXUS and inside the rewards that end an expedition. It has no message of its own.
//
// The carrier is the reward COURIER_NEXUS of the data file (runtime/mods/courier_rewards), see
// reward_carrier.h; it already holds Allow true, so nothing is written here at all: the carrier is
// only checked and given. The byte is read before and after, to report it. Access is only ever
// allowed, never taken away. Not exercised in the running game when this was written.

#define NEXUS_CLASS_HASH 0xb7c7de23u
#define NEXUS_REWARD_SIZE 0x28u
#define NEXUS_ALLOW_OFFSET 0x20u
#define NEXUS_STATE_OFFSET 0x28289u    // from the manager object: one byte, 1 when the Nexus may be used

enum { NEXUS_PENDING = 0, NEXUS_GIVEN, NEXUS_UNKNOWN_REWARD, NEXUS_BAD_LAYOUT, NEXUS_NOT_READY };
static const char *const nexus_result_names[] = {"pending", "given", "unknown_reward", "bad_layout", "not_ready"};

static volatile LONG nexus_state;      // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG nexus_result;
static volatile LONG nexus_before = -1, nexus_after = -1;

// The carrier as the data file gives it: no season text, access allowed.
static int nexus_is_carrier(const void *reward, int unused) {
    const uint8_t *bytes = reward;
    (void)unused;
    return bytes[0] == 0 && bytes[NEXUS_ALLOW_OFFSET] == 1;
}

// Runs on the game's update thread.
static void nexus_apply_request(void) {
    uintptr_t manager = give_reward && reward_manager
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    LONG found = REWARD_CARRIER_NOT_READY;
    void *reward = manager
        ? reward_carrier_find(manager, "COURIER_NEXUS", NEXUS_CLASS_HASH, NEXUS_REWARD_SIZE, nexus_is_carrier, 0, &found)
        : NULL;
    int readable = manager && reward_carrier_readable(manager + NEXUS_STATE_OFFSET, 1);
    InterlockedExchange(&nexus_before, readable ? *(const uint8_t *)(manager + NEXUS_STATE_OFFSET) : -1);
    if (reward) reward_carrier_give("COURIER_NEXUS", 1);
    InterlockedExchange(&nexus_after, readable ? *(const uint8_t *)(manager + NEXUS_STATE_OFFSET) : -1);
    InterlockedExchange(&nexus_result, reward ? NEXUS_GIVEN
                                       : found == REWARD_CARRIER_UNKNOWN ? NEXUS_UNKNOWN_REWARD
                                       : found == REWARD_CARRIER_BAD_LAYOUT ? NEXUS_BAD_LAYOUT
                                       : NEXUS_NOT_READY);
    InterlockedExchange(&nexus_state, 2);
}

static int nexus_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-nexus-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// The per-process request is the one line "allow=1". Anything else rejects it.
static int nexus_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&nexus_state, 0, 0) != 0 || !nexus_path(path, L"request")) return 0;
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
    InterlockedExchange(&nexus_result, NEXUS_PENDING);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void nexus_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&nexus_state, 0, 0) != 2 || !nexus_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        fprintf(file, "result=%s\nallowed_before=%ld\nallowed_after=%ld\n",
                nexus_result_names[InterlockedCompareExchange(&nexus_result, 0, 0)],
                InterlockedCompareExchange(&nexus_before, 0, 0), InterlockedCompareExchange(&nexus_after, 0, 0));
        fclose(file);
    }
    InterlockedExchange(&nexus_state, 0);
}
