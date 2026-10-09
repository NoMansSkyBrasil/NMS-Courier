// Word domain of the build 180836 research profile: teach alien words of one race through the
// game's own rewards, which add the words to the loaded slot and show the game's notification.
// Included once by profile_core.c, after reward_carrier.h.
//
// Read in the executable on 2026-10-09 (docs/WORD_AND_GLYPH_NOTES.md). Two rewards teach words:
//   GcRewardTeachSpecificWords (class 0xafc59db0, 0x40 bytes): CustomOSDMessage +0x00, the list of
//     word groups at +0x20 (pointer, count at +0x28, each group 0x20 bytes), OSDMessageTime +0x30,
//     Race +0x34, SuppressOSDMessage +0x38. Its handler (f35d30) makes "<race prefix>_<group>" of
//     every entry and hands it to the game's learn routine; the race None is skipped.
//   GcRewardTeachWord (class 0x9ed38e36, 0x14 bytes): AmountMax +0x00, AmountMin +0x04,
//     Category +0x08, Race +0x0c, UseCategory +0x10: words the player does not know yet, chosen
//     by the game.
// Races as the game numbers them: Traders 0, Warriors 1, Explorers 2, Atlas 4, Builders 8.
//
// The game has no reward for an arbitrary list, so this file uses two rewards of the data file
// (runtime/mods/courier_rewards) as carriers, see reward_carrier.h: it checks that the carrier is
// exactly that file's entry, writes the requested race and groups (or amount), calls the game's
// reward routine and writes the file's content back. Not exercised in the running game when this
// was written.

#define WORD_SPECIFIC_CLASS_HASH 0xafc59db0u
#define WORD_SPECIFIC_SIZE 0x40u
#define WORD_RANDOM_CLASS_HASH 0x9ed38e36u
#define WORD_GROUP_SIZE 0x20u
#define WORD_CARRIER_GROUPS 64          // groups the data file gives the specific carrier
#define WORD_REQUEST_CAPACITY 4096
#define WORD_RANDOM_MAXIMUM 500
#define WORD_CARRIER_RACE 0             // Traders, in both carriers
#define WORD_RACE_COUNT 5

typedef struct { int32_t amount_max, amount_min, category, race; uint8_t use_category; } word_random;

enum { WORD_PENDING = 0, WORD_GIVEN, WORD_UNKNOWN_REWARD, WORD_BAD_LAYOUT, WORD_NOT_READY };
static const char *const word_result_names[] = {"pending", "given", "unknown_reward", "bad_layout", "not_ready"};
static const char *const word_race_names[WORD_RACE_COUNT] = {"traders", "warriors", "explorers", "atlas", "builders"};
static const int32_t word_race_values[WORD_RACE_COUNT] = {0, 1, 2, 4, 8};

static volatile LONG word_state;        // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG word_race = -1;    // index into word_race_names
static volatile LONG word_silent;
static volatile LONG word_random_count; // above zero: that many words the game chooses; else the groups
static volatile LONG word_group_count;
static char word_groups[WORD_REQUEST_CAPACITY][WORD_GROUP_SIZE];
static volatile LONG word_result;
static volatile LONG word_calls;
// Where the specific carrier keeps its groups; set by the check when it passes.
static uint8_t *word_carrier_list;

// The group list of a specific-words reward, when it is the data file's own: the file's count and
// its first and last placeholder names.
static uint8_t *word_carrier_groups(const uint8_t *reward) {
    if (*(const int32_t *)(reward + 0x28) != WORD_CARRIER_GROUPS) return NULL;
    for (int attempt = 0; attempt < 2; ++attempt) {
        uint8_t *list = (uint8_t *)reward_carrier_follow((uintptr_t)reward + 0x20, attempt);
        if (!writable_range((uintptr_t)list, (size_t)WORD_CARRIER_GROUPS * WORD_GROUP_SIZE)) continue;
        if (strncmp((const char *)list, "COURIER00", WORD_GROUP_SIZE) == 0 &&
            strncmp((const char *)list + (WORD_CARRIER_GROUPS - 1) * WORD_GROUP_SIZE, "COURIER63", WORD_GROUP_SIZE) == 0)
            return list;
    }
    return NULL;
}

static int word_is_specific_carrier(const void *reward, int unused) {
    const uint8_t *bytes = reward;
    (void)unused;
    if (*(const int32_t *)(bytes + 0x34) != WORD_CARRIER_RACE || bytes[0x38] != 0) return 0;
    word_carrier_list = word_carrier_groups(bytes);
    return word_carrier_list != NULL;
}

static int word_is_random_carrier(const void *reward, int unused) {
    const word_random *random = reward;
    (void)unused;
    return random->amount_max == 1 && random->amount_min == 1 && random->race == WORD_CARRIER_RACE &&
           random->use_category == 0;
}

// Runs on the game's update thread.
static void word_apply_request(void) {
    uintptr_t manager = give_reward && reward_manager
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    LONG race = InterlockedCompareExchange(&word_race, 0, 0), found = REWARD_CARRIER_NOT_READY, calls = 0;
    LONG random_count = InterlockedCompareExchange(&word_random_count, 0, 0);
    uint8_t silent = InterlockedCompareExchange(&word_silent, 0, 0) != 0;
    int given = 0;
    if (manager && race >= 0 && race < WORD_RACE_COUNT && random_count > 0) {
        word_random *random = reward_carrier_find(manager, "COURIER_WORD", WORD_RANDOM_CLASS_HASH, sizeof(word_random),
                                                  word_is_random_carrier, 0, &found);
        if (random) {
            // One word a call, as a knowledge stone gives it; the game picks one the player lacks.
            random->race = word_race_values[race];
            for (; calls < random_count; ++calls) reward_carrier_give("COURIER_WORD", silent);
            random->race = WORD_CARRIER_RACE;
            given = 1;
        }
    } else if (manager && race >= 0 && race < WORD_RACE_COUNT) {
        uint8_t *reward = reward_carrier_find(manager, "COURIER_WORDS", WORD_SPECIFIC_CLASS_HASH, WORD_SPECIFIC_SIZE,
                                              word_is_specific_carrier, 0, &found);
        LONG count = InterlockedCompareExchange(&word_group_count, 0, 0);
        if (reward && word_carrier_list) {
            uint8_t *list = word_carrier_list;
            *(int32_t *)(reward + 0x34) = word_race_values[race];
            reward[0x38] = silent;
            for (LONG sent = 0; sent < count; ++calls) {
                LONG part = count - sent > WORD_CARRIER_GROUPS ? WORD_CARRIER_GROUPS : count - sent;
                memcpy(list, word_groups[sent], (size_t)part * WORD_GROUP_SIZE);
                *(int32_t *)(reward + 0x28) = (int32_t)part;
                reward_carrier_give("COURIER_WORDS", silent);
                sent += part;
            }
            // The data file's content again.
            for (int index = 0; index < WORD_CARRIER_GROUPS; ++index) {
                char name[WORD_GROUP_SIZE] = {0};
                snprintf(name, sizeof(name), "COURIER%02d", index);
                memcpy(list + (size_t)index * WORD_GROUP_SIZE, name, WORD_GROUP_SIZE);
            }
            *(int32_t *)(reward + 0x28) = WORD_CARRIER_GROUPS;
            *(int32_t *)(reward + 0x34) = WORD_CARRIER_RACE;
            reward[0x38] = 0;
            given = 1;
        }
    }
    InterlockedExchange(&word_calls, calls);
    InterlockedExchange(&word_result, given ? WORD_GIVEN
                                      : found == REWARD_CARRIER_UNKNOWN ? WORD_UNKNOWN_REWARD
                                      : found == REWARD_CARRIER_BAD_LAYOUT ? WORD_BAD_LAYOUT
                                      : WORD_NOT_READY);
    InterlockedExchange(&word_state, 2);
}

static int word_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-word-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// A group as the game writes it after the race prefix: 1 to 31 characters of A-Z, 0-9, "_", "-"
// and "'".
static int word_valid_group(const char *text, size_t length) {
    if (length < 1 || length >= WORD_GROUP_SIZE) return 0;
    for (size_t index = 0; index < length; ++index) {
        char c = text[index];
        if (!((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '_' || c == '-' || c == '\'')) return 0;
    }
    return 1;
}

// Parse the per-process request: "race=<traders|warriors|explorers|atlas|builders>" once,
// "silent=0|1" once, and either "count=<1..500>" (words the game chooses) or one
// "group=<name>" per line. Anything else rejects the whole request.
static int word_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&word_state, 0, 0) != 0 || !word_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG race = -1, silent = -1, random_count = 0, groups = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if (strncmp(line, "race=", 5) == 0 && race < 0) {
            for (int index = 0; index < WORD_RACE_COUNT; ++index)
                if (strcmp(line + 5, word_race_names[index]) == 0) race = index;
            if (race < 0) ok = 0;
        } else if ((strcmp(line, "silent=0") == 0 || strcmp(line, "silent=1") == 0) && silent < 0) {
            silent = line[7] - '0';
        } else if (strncmp(line, "count=", 6) == 0 && random_count == 0) {
            char *end = NULL;
            long value = strtol(line + 6, &end, 10);
            if (end == line + 6 || *end || value < 1 || value > WORD_RANDOM_MAXIMUM) ok = 0;
            else random_count = (LONG)value;
        } else if (strncmp(line, "group=", 6) == 0 && groups < WORD_REQUEST_CAPACITY &&
                   word_valid_group(line + 6, strlen(line + 6))) {
            memset(word_groups[groups], 0, WORD_GROUP_SIZE);
            memcpy(word_groups[groups], line + 6, strlen(line + 6));
            ++groups;
        } else ok = 0;
    }
    fclose(file);
    if (!ok || race < 0 || silent < 0 || (random_count > 0) == (groups > 0)) return 0;
    InterlockedExchange(&word_race, race);
    InterlockedExchange(&word_silent, silent);
    InterlockedExchange(&word_random_count, random_count);
    InterlockedExchange(&word_group_count, groups);
    InterlockedExchange(&word_result, WORD_PENDING);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void word_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&word_state, 0, 0) != 2 || !word_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        LONG race = InterlockedCompareExchange(&word_race, 0, 0);
        fprintf(file, "result=%s\nrace=%s\ngroups=%ld\nrandom=%ld\nreward_calls=%ld\n",
                word_result_names[InterlockedCompareExchange(&word_result, 0, 0)],
                race >= 0 && race < WORD_RACE_COUNT ? word_race_names[race] : "?",
                InterlockedCompareExchange(&word_group_count, 0, 0),
                InterlockedCompareExchange(&word_random_count, 0, 0), InterlockedCompareExchange(&word_calls, 0, 0));
        fclose(file);
    }
    InterlockedExchange(&word_state, 0);
}
