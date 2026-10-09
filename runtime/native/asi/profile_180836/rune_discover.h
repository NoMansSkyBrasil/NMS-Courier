// Glyph domain of the build 180836 research profile: discover portal glyphs through the game's own
// reward, which adds them to the loaded slot in the game's order and shows the game's notification.
// Included once by profile_core.c, after reward_carrier.h.
//
// Read in the executable on 2026-10-09 (docs/WORD_AND_GLYPH_NOTES.md): GcRewardDiscoverRune (class
// 0x0cf21824) is one byte, AllRunes. Its handler (f3a200) keeps the known glyphs as sixteen bits at
// manager +0x26968; with AllRunes it sets every one, without it the next one the player lacks. The
// game has no reward for a chosen glyph, so glyphs can only be given in the game's order.
//
// The carrier is the reward COURIER_RUNE of the data file (runtime/mods/courier_rewards), see
// reward_carrier.h. Only the bits are read here, to report them; the game writes them. Not
// exercised in the running game when this was written.

#define RUNE_CLASS_HASH 0x0cf21824u
#define RUNE_KNOWN_OFFSET 0x26968u     // from the manager object: sixteen bits, one a glyph
#define RUNE_COUNT 16

enum { RUNE_PENDING = 0, RUNE_GIVEN, RUNE_UNKNOWN_REWARD, RUNE_BAD_LAYOUT, RUNE_NOT_READY };
static const char *const rune_result_names[] = {"pending", "given", "unknown_reward", "bad_layout", "not_ready"};

static volatile LONG rune_state;       // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG rune_wanted;      // 1 to 16 glyphs in the game's order, or 0 for all at once
static volatile LONG rune_silent;
static volatile LONG rune_result;
static volatile LONG rune_calls;
static volatile LONG rune_known_before = -1, rune_known_after = -1;

static int rune_is_carrier(const void *reward, int unused) {
    (void)unused;
    return *(const uint8_t *)reward == 0;
}

// Runs on the game's update thread.
static void rune_apply_request(void) {
    uintptr_t manager = give_reward && reward_manager
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    LONG found = REWARD_CARRIER_NOT_READY, calls = 0, wanted = InterlockedCompareExchange(&rune_wanted, 0, 0);
    uint8_t silent = InterlockedCompareExchange(&rune_silent, 0, 0) != 0;
    uint8_t *all = manager
        ? reward_carrier_find(manager, "COURIER_RUNE", RUNE_CLASS_HASH, 1, rune_is_carrier, 0, &found) : NULL;
    int readable = manager && reward_carrier_readable(manager + RUNE_KNOWN_OFFSET, 4);
    InterlockedExchange(&rune_known_before, readable ? (LONG)(*(const uint32_t *)(manager + RUNE_KNOWN_OFFSET) & 0xffff) : -1);
    if (all) {
        if (wanted == 0) {
            *all = 1;
            reward_carrier_give("COURIER_RUNE", silent);
            *all = 0;
            calls = 1;
        } else {
            for (; calls < wanted; ++calls) reward_carrier_give("COURIER_RUNE", silent);
        }
    }
    InterlockedExchange(&rune_known_after, readable ? (LONG)(*(const uint32_t *)(manager + RUNE_KNOWN_OFFSET) & 0xffff) : -1);
    InterlockedExchange(&rune_calls, calls);
    InterlockedExchange(&rune_result, all ? RUNE_GIVEN
                                      : found == REWARD_CARRIER_UNKNOWN ? RUNE_UNKNOWN_REWARD
                                      : found == REWARD_CARRIER_BAD_LAYOUT ? RUNE_BAD_LAYOUT
                                      : RUNE_NOT_READY);
    InterlockedExchange(&rune_state, 2);
}

static int rune_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-rune-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: "silent=0|1" once and either "all=1" or "count=<1..16>".
// Anything else rejects the whole request.
static int rune_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&rune_state, 0, 0) != 0 || !rune_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[32];
    LONG silent = -1, wanted = -1;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if ((strcmp(line, "silent=0") == 0 || strcmp(line, "silent=1") == 0) && silent < 0) silent = line[7] - '0';
        else if (strcmp(line, "all=1") == 0 && wanted < 0) wanted = 0;
        else if (strncmp(line, "count=", 6) == 0 && wanted < 0) {
            char *end = NULL;
            long value = strtol(line + 6, &end, 10);
            if (end == line + 6 || *end || value < 1 || value > RUNE_COUNT) ok = 0;
            else wanted = (LONG)value;
        } else ok = 0;
    }
    fclose(file);
    if (!ok || silent < 0 || wanted < 0) return 0;
    InterlockedExchange(&rune_wanted, wanted);
    InterlockedExchange(&rune_silent, silent);
    InterlockedExchange(&rune_result, RUNE_PENDING);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void rune_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&rune_state, 0, 0) != 2 || !rune_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        fprintf(file, "result=%s\nreward_calls=%ld\nknown_before=0x%04lX\nknown_after=0x%04lX\n",
                rune_result_names[InterlockedCompareExchange(&rune_result, 0, 0)],
                InterlockedCompareExchange(&rune_calls, 0, 0),
                (unsigned long)InterlockedCompareExchange(&rune_known_before, 0, 0) & 0xfffful,
                (unsigned long)InterlockedCompareExchange(&rune_known_after, 0, 0) & 0xfffful);
        fclose(file);
    }
    InterlockedExchange(&rune_state, 0);
}
