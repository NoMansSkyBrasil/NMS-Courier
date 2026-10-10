// Reward trace of the build 180836 research profile: a diagnostic that writes down the rewards the
// game gives while it is switched on, with the seed each call was given and the place in the game
// that called. Reads only: every call is passed through untouched. Included once by profile_core.c,
// after shipped_reward_dispatch.h.
//
// Why it exists (docs/SEED_ORIGINS.md, 2026-10-10): a multi-tool offered at a terminal is built by
// the game's reward routine from the seed its caller passes. Which caller that is at a space station,
// and so where the seed comes from, could not be read offline. One interaction at a terminal with
// the trace on names the reward, the seed and the calling code.

#define REWARD_TRACE_CAPACITY 64

typedef struct {
    char reward[17], mission[17];
    uint8_t seed[16];
    uint32_t caller;       // return address of the call, as an offset from the executable's base
    uint8_t peek, silent;
} reward_trace_entry;

static give_reward_fn reward_trace_original;
static volatile LONG reward_trace_on;
static volatile LONG reward_trace_total;      // calls seen since it was switched on
static volatile LONG reward_trace_dirty;
static volatile LONG reward_trace_lock;
static reward_trace_entry reward_trace_entries[REWARD_TRACE_CAPACITY];

static void reward_trace_text(char *out, const char *text) {
    size_t length = 0;
    if (text && writable_range((uintptr_t)text, 16))
        while (length < 16 && text[length] >= 0x21 && text[length] <= 0x7e) { out[length] = text[length]; ++length; }
    out[length] = 0;
}

static uint8_t reward_trace_detour(void *manager, const char *reward_id, const char *mission_id, const void *seed,
                                   uint8_t peek, uint8_t force_show_message, uint64_t *out_multi_product_count,
                                   uint8_t force_silent, int32_t inventory_choice_override,
                                   uint8_t use_mining_modifier) {
    if (InterlockedCompareExchange(&reward_trace_on, 0, 0) &&
        InterlockedCompareExchange(&reward_trace_lock, 1, 0) == 0) {
        LONG total = InterlockedCompareExchange(&reward_trace_total, 0, 0);
        reward_trace_entry *entry = &reward_trace_entries[total % REWARD_TRACE_CAPACITY];
        memset(entry, 0, sizeof(*entry));
        reward_trace_text(entry->reward, reward_id);
        reward_trace_text(entry->mission, mission_id);
        if (seed && writable_range((uintptr_t)seed, 16)) memcpy(entry->seed, seed, 16);
        entry->caller = (uint32_t)((uintptr_t)__builtin_return_address(0) - (uintptr_t)GetModuleHandleW(NULL));
        entry->peek = peek;
        entry->silent = force_silent;
        InterlockedExchange(&reward_trace_total, total + 1);
        InterlockedExchange(&reward_trace_dirty, 1);
        InterlockedExchange(&reward_trace_lock, 0);
    }
    return reward_trace_original(manager, reward_id, mission_id, seed, peek, force_show_message,
                                 out_multi_product_count, force_silent, inventory_choice_override,
                                 use_mining_modifier);
}

static int reward_trace_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-rewardtrace-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// The per-process request is the one line "trace=1" (start afresh) or "trace=0" (stop).
static int reward_trace_read_request(void) {
    wchar_t path[MAX_PATH];
    if (!reward_trace_original || !reward_trace_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[32] = {0};
    int ok = fgets(line, sizeof(line), file) != NULL;
    fclose(file);
    line[strcspn(line, "\r\n")] = 0;
    if (!ok || (strcmp(line, "trace=1") != 0 && strcmp(line, "trace=0") != 0)) return 0;
    if (line[6] == '1') InterlockedExchange(&reward_trace_total, 0);
    InterlockedExchange(&reward_trace_on, line[6] == '1');
    InterlockedExchange(&reward_trace_dirty, 1);
    return 1;
}

// Called from the worker thread: the last calls, oldest first.
static void reward_trace_write_result(void) {
    wchar_t path[MAX_PATH];
    if (!InterlockedCompareExchange(&reward_trace_dirty, 0, 0) || !reward_trace_path(path, L"result")) return;
    if (InterlockedCompareExchange(&reward_trace_lock, 1, 0) != 0) return;
    InterlockedExchange(&reward_trace_dirty, 0);
    FILE *file = _wfopen(path, L"w");
    if (file) {
        LONG total = InterlockedCompareExchange(&reward_trace_total, 0, 0);
        LONG first = total > REWARD_TRACE_CAPACITY ? total - REWARD_TRACE_CAPACITY : 0;
        fprintf(file, "result=%s\ncalls=%ld\n", InterlockedCompareExchange(&reward_trace_on, 0, 0) ? "tracing" : "stopped", total);
        for (LONG index = first; index < total; ++index) {
            const reward_trace_entry *entry = &reward_trace_entries[index % REWARD_TRACE_CAPACITY];
            fprintf(file, "call=%s,%s,%016llX,%u,%X,%u,%u\n", entry->reward[0] ? entry->reward : "-",
                    entry->mission[0] ? entry->mission : "-", *(const unsigned long long *)entry->seed,
                    (unsigned)entry->seed[8], (unsigned)entry->caller, (unsigned)entry->peek, (unsigned)entry->silent);
        }
        fclose(file);
    }
    InterlockedExchange(&reward_trace_lock, 0);
}
