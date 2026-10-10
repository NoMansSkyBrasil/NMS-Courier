// Mission domain of the build 180836 research profile: ask the game to complete named missions
// through the game's own reward. Included once by profile_core.c, after reward_carrier.h.
//
// Read in the executable on 2026-10-09 (docs/MISSION_COMPLETION_NOTES.md): GcRewardCompleteMission
// (class 0x0d91902f, 0x10 bytes) is the mission's identifier. Its handler (f2b650) does not complete
// anything itself: it appends the identifier, with the game's default seed, to a list of the
// manager object at +0x847d50 (capacity, count at +4, entries of 0x20 bytes at +8) through the
// routine 42d110; the game works that list off later. The code that does was not found, so what
// completing does to the stages it skips is unknown. EXPERIMENTAL: for a test save with a backup.
//
// The carrier is the reward COURIER_MISSION of the data file (runtime/mods/courier_rewards), see
// reward_carrier.h. Only the carrier is written here; the game does the rest. The count of the
// list is read before and after, to report it. Not exercised in the running game when written.

#define MISSION_CLASS_HASH 0x0d91902fu
#define MISSION_REWARD_SIZE 0x10u
#define MISSION_QUEUE_COUNT_OFFSET 0x847d54u   // from the manager object: missions waiting to be completed
#define MISSION_MAX 256

enum { MISSION_PENDING = 0, MISSION_GIVEN, MISSION_UNKNOWN_REWARD, MISSION_BAD_LAYOUT, MISSION_NOT_READY };
static const char *const mission_result_names[] = {"pending", "given", "unknown_reward", "bad_layout", "not_ready"};

static volatile LONG mission_state;    // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG mission_count;
static volatile LONG mission_silent;
static volatile LONG mission_result;
static volatile LONG mission_calls;
static volatile LONG mission_queued_before = -1, mission_queued_after = -1;
static char mission_ids[MISSION_MAX][MISSION_REWARD_SIZE];

// The carrier as the data file gives it: the placeholder mission.
static int mission_is_carrier(const void *reward, int unused) {
    static const char placeholder[MISSION_REWARD_SIZE] = "COURIER";
    (void)unused;
    return memcmp(reward, placeholder, sizeof(placeholder)) == 0;
}

// Runs on the game's update thread.
static void mission_apply_request(void) {
    uintptr_t manager = give_reward && reward_manager
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    LONG found = REWARD_CARRIER_NOT_READY, calls = 0, count = InterlockedCompareExchange(&mission_count, 0, 0);
    // The reward itself has nothing to show; the flag only keeps the reward routine quiet. Whether the
    // game announces a completed mission is the mission's own setting (MessageComplete).
    uint8_t silent = InterlockedCompareExchange(&mission_silent, 0, 0) != 0;
    uint8_t *reward = manager
        ? reward_carrier_find(manager, "COURIER_MISSION", MISSION_CLASS_HASH, MISSION_REWARD_SIZE,
                              mission_is_carrier, 0, &found)
        : NULL;
    int readable = manager && reward_carrier_readable(manager + MISSION_QUEUE_COUNT_OFFSET, 4);
    InterlockedExchange(&mission_queued_before,
                        readable ? *(const int32_t *)(manager + MISSION_QUEUE_COUNT_OFFSET) : -1);
    if (reward) {
        uint8_t original[MISSION_REWARD_SIZE];
        memcpy(original, reward, sizeof(original));
        for (; calls < count; ++calls) {
            memcpy(reward, mission_ids[calls], MISSION_REWARD_SIZE);
            reward_carrier_give("COURIER_MISSION", silent);
        }
        memcpy(reward, original, sizeof(original));
    }
    InterlockedExchange(&mission_queued_after,
                        readable ? *(const int32_t *)(manager + MISSION_QUEUE_COUNT_OFFSET) : -1);
    InterlockedExchange(&mission_calls, calls);
    InterlockedExchange(&mission_result, reward ? MISSION_GIVEN
                                         : found == REWARD_CARRIER_UNKNOWN ? MISSION_UNKNOWN_REWARD
                                         : found == REWARD_CARRIER_BAD_LAYOUT ? MISSION_BAD_LAYOUT
                                         : MISSION_NOT_READY);
    InterlockedExchange(&mission_state, 2);
}

static int mission_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-mission-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: "silent=0|1" once and 1 to 256 "mission=<ID>" lines, the identifier 1 to 15 capitals,
// digits and underscores, none twice. Anything else rejects the whole request.
static int mission_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&mission_state, 0, 0) != 0 || !mission_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[48];
    LONG count = 0, silent = -1;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        if (!strchr(line, '\n') && !feof(file)) { ok = 0; break; }
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if ((strcmp(line, "silent=0") == 0 || strcmp(line, "silent=1") == 0) && silent < 0) {
            silent = line[7] - '0';
            continue;
        }
        if (strncmp(line, "mission=", 8) != 0 || count >= MISSION_MAX) { ok = 0; break; }
        const char *id = line + 8;
        size_t length = strlen(id);
        if (length < 1 || length >= MISSION_REWARD_SIZE) { ok = 0; break; }
        for (size_t index = 0; index < length; ++index) {
            char c = id[index];
            if (!((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '_')) ok = 0;
        }
        memset(mission_ids[count], 0, MISSION_REWARD_SIZE);
        memcpy(mission_ids[count], id, length);
        for (LONG index = 0; index < count; ++index)
            if (memcmp(mission_ids[index], mission_ids[count], MISSION_REWARD_SIZE) == 0) ok = 0;
        ++count;
    }
    fclose(file);
    if (!ok || count < 1 || silent < 0) return 0;
    InterlockedExchange(&mission_count, count);
    InterlockedExchange(&mission_silent, silent);
    InterlockedExchange(&mission_result, MISSION_PENDING);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void mission_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&mission_state, 0, 0) != 2 || !mission_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        fprintf(file, "result=%s\nrequested=%ld\nreward_calls=%ld\nqueued_before=%ld\nqueued_after=%ld\n",
                mission_result_names[InterlockedCompareExchange(&mission_result, 0, 0)],
                InterlockedCompareExchange(&mission_count, 0, 0), InterlockedCompareExchange(&mission_calls, 0, 0),
                InterlockedCompareExchange(&mission_queued_before, 0, 0),
                InterlockedCompareExchange(&mission_queued_after, 0, 0));
        fclose(file);
    }
    InterlockedExchange(&mission_state, 0);
}
