// Guide domain of the build 180836 research profile: unlock topics of the game's guide through the
// game's own reward, which records the topic for the loaded slot and shows the game's message.
// Included once by profile_core.c, after reward_carrier.h.
//
// Read in the executable on 2026-10-09 (docs/EXPEDITION_HISTORY_NOTES.md): GcRewardWikiTopic (class
// 0x6525a55c, 0x28 bytes) holds Topic at +0x00 (a text of 0x20 bytes, the topic's identifier in
// the guide table) and CentreMessage at +0x20. Its handler is f34a20.
//
// The carrier is the reward COURIER_WIKI of the data file (runtime/mods/courier_rewards), see
// reward_carrier.h. Only the carrier is written here; the game records the topic. Not exercised in
// the running game when this was written.

#define WIKI_CLASS_HASH 0x6525a55cu
#define WIKI_REWARD_SIZE 0x28u
#define WIKI_TOPIC_SIZE 0x20u
#define WIKI_CENTRE_OFFSET 0x20u
#define WIKI_MAX 128

enum { WIKI_PENDING = 0, WIKI_GIVEN, WIKI_UNKNOWN_REWARD, WIKI_BAD_LAYOUT, WIKI_NOT_READY };
static const char *const wiki_result_names[] = {"pending", "given", "unknown_reward", "bad_layout", "not_ready"};

static volatile LONG wiki_state;       // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG wiki_silent;
static volatile LONG wiki_count;
static volatile LONG wiki_result;
static volatile LONG wiki_calls;
static char wiki_topics[WIKI_MAX][WIKI_TOPIC_SIZE];

// The carrier as the data file gives it: the placeholder topic, message in the centre.
static int wiki_is_carrier(const void *reward, int unused) {
    static const char placeholder[WIKI_TOPIC_SIZE] = "COURIER";
    const uint8_t *bytes = reward;
    (void)unused;
    return memcmp(bytes, placeholder, sizeof(placeholder)) == 0 && bytes[WIKI_CENTRE_OFFSET] == 1;
}

// Runs on the game's update thread.
static void wiki_apply_request(void) {
    uintptr_t manager = give_reward && reward_manager
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    LONG found = REWARD_CARRIER_NOT_READY, calls = 0, count = InterlockedCompareExchange(&wiki_count, 0, 0);
    uint8_t silent = InterlockedCompareExchange(&wiki_silent, 0, 0) != 0;
    uint8_t *reward = manager
        ? reward_carrier_find(manager, "COURIER_WIKI", WIKI_CLASS_HASH, WIKI_REWARD_SIZE, wiki_is_carrier, 0, &found)
        : NULL;
    if (reward) {
        uint8_t original[WIKI_REWARD_SIZE];
        memcpy(original, reward, sizeof(original));
        // Without notifications the topic's own message in the centre of the screen is left out too.
        reward[WIKI_CENTRE_OFFSET] = !silent;
        for (; calls < count; ++calls) {
            memcpy(reward, wiki_topics[calls], WIKI_TOPIC_SIZE);
            reward_carrier_give("COURIER_WIKI", silent);
        }
        memcpy(reward, original, sizeof(original));
    }
    InterlockedExchange(&wiki_calls, calls);
    InterlockedExchange(&wiki_result, reward ? WIKI_GIVEN
                                      : found == REWARD_CARRIER_UNKNOWN ? WIKI_UNKNOWN_REWARD
                                      : found == REWARD_CARRIER_BAD_LAYOUT ? WIKI_BAD_LAYOUT
                                      : WIKI_NOT_READY);
    InterlockedExchange(&wiki_state, 2);
}

static int wiki_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-wiki-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: "silent=0|1" once and 1 to 128 "topic=<ID>" lines, the identifier
// 1 to 31 capitals, digits and underscores, none twice. Anything else rejects the whole request.
static int wiki_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&wiki_state, 0, 0) != 0 || !wiki_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG silent = -1, count = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        if (!strchr(line, '\n') && !feof(file)) { ok = 0; break; }
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if ((strcmp(line, "silent=0") == 0 || strcmp(line, "silent=1") == 0) && silent < 0) silent = line[7] - '0';
        else if (strncmp(line, "topic=", 6) == 0 && count < WIKI_MAX) {
            const char *id = line + 6;
            size_t length = strlen(id);
            if (length < 1 || length >= WIKI_TOPIC_SIZE) { ok = 0; break; }
            for (size_t index = 0; index < length; ++index) {
                char c = id[index];
                if (!((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '_')) ok = 0;
            }
            memset(wiki_topics[count], 0, WIKI_TOPIC_SIZE);
            memcpy(wiki_topics[count], id, length);
            for (LONG index = 0; index < count; ++index)
                if (memcmp(wiki_topics[index], wiki_topics[count], WIKI_TOPIC_SIZE) == 0) ok = 0;
            ++count;
        } else ok = 0;
    }
    fclose(file);
    if (!ok || silent < 0 || count < 1) return 0;
    InterlockedExchange(&wiki_silent, silent);
    InterlockedExchange(&wiki_count, count);
    InterlockedExchange(&wiki_result, WIKI_PENDING);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void wiki_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&wiki_state, 0, 0) != 2 || !wiki_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        fprintf(file, "result=%s\nrequested=%ld\nreward_calls=%ld\n",
                wiki_result_names[InterlockedCompareExchange(&wiki_result, 0, 0)],
                InterlockedCompareExchange(&wiki_count, 0, 0), InterlockedCompareExchange(&wiki_calls, 0, 0));
        fclose(file);
    }
    InterlockedExchange(&wiki_state, 0);
}
