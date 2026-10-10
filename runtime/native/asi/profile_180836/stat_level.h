// Levelled stat domain of the build 180836 research profile: raise journey milestones and standings
// by levels through the game's own stat reward. Included once by profile_core.c, after
// reward_carrier.h.
//
// Read in the executable on 2026-10-09 (docs/STAT_LEVEL_NOTES.md): GcRewardModifyStat (class
// 0x1e9efba2, 0x30 bytes) holds OtherStat at +0x00, Stat at +0x10, Amount at +0x20, ModifyType at
// +0x24 (0 set, 1 add, 2 subtract), CanSetToValueLowerThanCurrent at +0x28 and UseOtherStat at
// +0x29. Its handler (f2a5a0) reads the stat of the group GLOBAL_STATS with the routine 23c680 and
// hands the new value to the game's stat setter (610c60), which queues the change; a set to a value
// that is not above the current one is dropped when CanSetToValueLowerThanCurrent is false. The
// standing with a race or guild is one of these stats.
//
// Fractional stats. The stat store keeps a fractional value as 32 bits in the same place as a
// whole one, and the handler, the getter (5fa880) and the setter (616420, type 1) move those bits
// unchanged; the handler compares them as whole numbers, which orders values that are not negative
// the same way. So a fractional stat is asked for with the bits of each level's value, and the
// result reports bits for it. The application does that conversion; nothing here depends on it.
//
// A request names stats with the values of their eleven levels (from the game's levelled stat
// table, sent by the application) and a number of levels. For each stat the current value is read
// with the game's own routine, the level it is on is found, and the value of the level that many
// above is set through the reward. Nothing is ever lowered. The carrier is the reward COURIER_STAT
// of the data file (runtime/mods/courier_rewards), see reward_carrier.h. Only the carrier is
// written here; the game writes the stat. First used live on 2026-10-09 (the level arrived).
//
// Message. The game's level routine (5fc700) reads StatMessageType of the stat's entry in the loaded
// levelled stat table when the level changes: 0 shows the full milestone message, 1 a short one,
// 2 nothing. Most stats are 2 with no message text. With "announce=1" the entry of a silent stat is
// set to 0 for the one call and, when it has no message text, given the text identifier the
// request names (the stat's title); both are put back right after the call. This is a temporary
// change of the game's loaded table, never of a save. Entry layout (0x610 bytes, class
// GcLeveledStatData): NotifyMessage +0x580, NotifyMessageSingular +0x5a0, StatId +0x5f8,
// StatMessageType +0x608. The table is the pointer at store +0x20: entries, then their count.

#define STAT_CLASS_HASH 0x1e9efba2u
#define STAT_REWARD_SIZE 0x30u
#define STAT_REWARD_STAT_OFFSET 0x10u
#define STAT_REWARD_AMOUNT_OFFSET 0x20u
#define STAT_REWARD_MODIFY_OFFSET 0x24u
#define STAT_REWARD_LOWER_OFFSET 0x28u
#define STAT_REWARD_OTHER_OFFSET 0x29u
#define STAT_GET_RVA 0x23c680u
#define STAT_STORE_OFFSET 0x307880u    // from the manager object: the stat store the handler uses
#define STAT_TABLE_OFFSET 0x20u        // from the stat store: pointer to the levelled stat table
#define STAT_ENTRY_SIZE 0x610u
#define STAT_ENTRY_NOTIFY_OFFSET 0x580u   // two texts of 0x20 bytes: plural, then singular
#define STAT_ENTRY_ID_OFFSET 0x5f8u
#define STAT_ENTRY_MESSAGE_OFFSET 0x608u
#define STAT_MESSAGE_FULL 0
#define STAT_MESSAGE_SILENT 2
#define STAT_TEXT_SIZE 0x20u
#define STAT_LEVELS 11
#define STAT_MAX 64

enum { STAT_PENDING = 0, STAT_GIVEN, STAT_UNKNOWN_REWARD, STAT_BAD_LAYOUT, STAT_NOT_READY };
static const char *const stat_result_names[] = {"pending", "given", "unknown_reward", "bad_layout", "not_ready"};

typedef int32_t (*stat_get_fn)(void *store, const char *stat, const char *group, const uint64_t *key);
static stat_get_fn stat_get;

static volatile LONG stat_state;       // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG stat_silent;
static volatile LONG stat_announce;   // 1: ask for the full message on stats the game keeps silent
static volatile LONG stat_raise;       // levels to go up, 1 to 10
static volatile LONG stat_count;
static volatile LONG stat_result;
static volatile LONG stat_calls;
static char stat_ids[STAT_MAX][16];
// Text identifier to show for a stat that has no message text of its own; empty when none.
static char stat_texts[STAT_MAX][STAT_TEXT_SIZE];
static int32_t stat_levels[STAT_MAX][STAT_LEVELS];
// What was found and asked for each stat: value before, level before (-1 below the first), level
// asked (the level before when nothing was to do) and the value sent.
static int32_t stat_before[STAT_MAX], stat_level_before[STAT_MAX], stat_level_asked[STAT_MAX], stat_sent[STAT_MAX];
// Value read right after the call, and whether the full message was asked for a silent stat.
static int32_t stat_after[STAT_MAX], stat_announced[STAT_MAX];

__attribute__((unused)) static int stat_resolve(uintptr_t base) {
    static const unsigned char get_entry[32] = {
        0x48, 0x89, 0x5c, 0x24, 0x08, 0x48, 0x89, 0x6c, 0x24, 0x10, 0x48, 0x89, 0x74, 0x24, 0x18, 0x57,
        0x41, 0x54, 0x41, 0x55, 0x41, 0x56, 0x41, 0x57, 0x48, 0x83, 0xec, 0x20, 0x48, 0x8b, 0x99, 0xa8
    };
    stat_get = (stat_get_fn)(base + STAT_GET_RVA);
    return memcmp((void *)(base + STAT_GET_RVA), get_entry, sizeof(get_entry)) == 0;
}

// The carrier as the data file gives it: the placeholder stat, set, nothing to add.
static int stat_is_carrier(const void *reward, int unused) {
    static const char placeholder[16] = "COURIER";
    const uint8_t *bytes = reward;
    (void)unused;
    return memcmp(bytes + STAT_REWARD_STAT_OFFSET, placeholder, sizeof(placeholder)) == 0 &&
           *(const int32_t *)(bytes + STAT_REWARD_AMOUNT_OFFSET) == 0 &&
           *(const int32_t *)(bytes + STAT_REWARD_MODIFY_OFFSET) == 0 &&
           bytes[STAT_REWARD_LOWER_OFFSET] == 0 && bytes[STAT_REWARD_OTHER_OFFSET] == 0;
}

// The writable entry of a stat in the game's loaded levelled stat table, or NULL.
static uint8_t *stat_entry(uintptr_t manager, const char *id) {
    uintptr_t holder = *(const uintptr_t *)(manager + STAT_STORE_OFFSET + STAT_TABLE_OFFSET);
    if (!reward_carrier_readable(holder, 0x10)) return NULL;
    uintptr_t entries = *(const uintptr_t *)holder;
    int32_t count = *(const int32_t *)(holder + 8);
    if (count < 1 || count > 256) return NULL;
    for (int32_t index = 0; index < count; ++index) {
        uintptr_t entry = entries + (uintptr_t)index * STAT_ENTRY_SIZE;
        if (!writable_range(entry, STAT_ENTRY_SIZE)) return NULL;
        if (memcmp((const void *)(entry + STAT_ENTRY_ID_OFFSET), id, 16) == 0) return (uint8_t *)entry;
    }
    return NULL;
}

// Runs on the game's update thread.
static void stat_apply_request(void) {
    static const char group[16] = "GLOBAL_STATS";
    static const uint64_t key = 0;
    // The getter stays unresolved in the fixture build, where no game manager exists.
    uintptr_t manager = give_reward && reward_manager && stat_get
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    LONG found = REWARD_CARRIER_NOT_READY, calls = 0;
    LONG count = InterlockedCompareExchange(&stat_count, 0, 0), raise = InterlockedCompareExchange(&stat_raise, 0, 0);
    uint8_t silent = InterlockedCompareExchange(&stat_silent, 0, 0) != 0;
    int announce = InterlockedCompareExchange(&stat_announce, 0, 0) != 0;
    uint8_t *reward = manager && reward_carrier_readable(manager + STAT_STORE_OFFSET, 0xb0)
        ? reward_carrier_find(manager, "COURIER_STAT", STAT_CLASS_HASH, STAT_REWARD_SIZE, stat_is_carrier, 0, &found)
        : NULL;
    if (reward) {
        uint8_t original[STAT_REWARD_SIZE];
        memcpy(original, reward, sizeof(original));
        for (LONG index = 0; index < count; ++index) {
            int32_t value = stat_get((void *)(manager + STAT_STORE_OFFSET), stat_ids[index], group, &key);
            int level = -1;
            while (level + 1 < STAT_LEVELS && value >= stat_levels[index][level + 1]) ++level;
            int asked = level + raise < STAT_LEVELS - 1 ? level + (int)raise : STAT_LEVELS - 1;
            stat_before[index] = value;
            stat_level_before[index] = level;
            stat_level_asked[index] = level;
            stat_sent[index] = value;
            stat_after[index] = value;
            stat_announced[index] = 0;
            // A level whose value is not above the current one would change nothing.
            while (asked > level && stat_levels[index][asked] <= value) --asked;
            if (asked <= level) continue;
            memcpy(reward + STAT_REWARD_STAT_OFFSET, stat_ids[index], 16);
            *(int32_t *)(reward + STAT_REWARD_AMOUNT_OFFSET) = stat_levels[index][asked];
            // A silent stat is made to announce this one change; see "Message" above.
            uint8_t *entry = announce ? stat_entry(manager, stat_ids[index]) : NULL;
            uint8_t texts[STAT_TEXT_SIZE * 2];
            int forced = entry && *(const int32_t *)(entry + STAT_ENTRY_MESSAGE_OFFSET) == STAT_MESSAGE_SILENT;
            if (forced) {
                memcpy(texts, entry + STAT_ENTRY_NOTIFY_OFFSET, sizeof(texts));
                *(int32_t *)(entry + STAT_ENTRY_MESSAGE_OFFSET) = STAT_MESSAGE_FULL;
                if (!texts[0] && stat_texts[index][0]) {
                    memcpy(entry + STAT_ENTRY_NOTIFY_OFFSET, stat_texts[index], STAT_TEXT_SIZE);
                    memcpy(entry + STAT_ENTRY_NOTIFY_OFFSET + STAT_TEXT_SIZE, stat_texts[index], STAT_TEXT_SIZE);
                }
            }
            reward_carrier_give("COURIER_STAT", silent);
            stat_after[index] = stat_get((void *)(manager + STAT_STORE_OFFSET), stat_ids[index], group, &key);
            if (forced) {
                memcpy(entry + STAT_ENTRY_NOTIFY_OFFSET, texts, sizeof(texts));
                *(int32_t *)(entry + STAT_ENTRY_MESSAGE_OFFSET) = STAT_MESSAGE_SILENT;
            }
            stat_announced[index] = forced;
            stat_level_asked[index] = asked;
            stat_sent[index] = stat_levels[index][asked];
            ++calls;
        }
        memcpy(reward, original, sizeof(original));
    }
    InterlockedExchange(&stat_calls, calls);
    InterlockedExchange(&stat_result, reward ? STAT_GIVEN
                                      : found == REWARD_CARRIER_UNKNOWN ? STAT_UNKNOWN_REWARD
                                      : found == REWARD_CARRIER_BAD_LAYOUT ? STAT_BAD_LAYOUT
                                      : STAT_NOT_READY);
    InterlockedExchange(&stat_state, 2);
}

static int stat_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-stat-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

static int stat_identifier(const char *text, size_t length) {
    for (size_t index = 0; index < length; ++index) {
        char c = text[index];
        if (!((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '_')) return 0;
    }
    return length > 0;
}

// One "stat=<ID>,<value of level 0>,...,<value of level 10>[,<TEXT>]" line: the identifier in
// capitals, digits and underscores, eleven whole numbers that never fall and end above where they
// start, and optionally the text identifier (1 to 31 such characters) to show for the stat.
static int stat_read_line(const char *text, char *id, int32_t *levels, char *shown) {
    size_t length = strcspn(text, ",");
    if (length > 15 || text[length] != ',' || !stat_identifier(text, length)) return 0;
    memset(id, 0, 16);
    memcpy(id, text, length);
    const char *at = text + length + 1;
    for (int level = 0; level < STAT_LEVELS; ++level) {
        char *end = NULL;
        long value = strtol(at, &end, 10);
        // A fractional stat travels as the bits of its 32-bit value, which reach 2^31 - 1.
        if (end == at || value <= -2147483647L || value >= 2147483647L) return 0;
        if (level + 1 < STAT_LEVELS ? *end != ',' : *end != ',' && *end != 0) return 0;
        if (level > 0 && value < levels[level - 1]) return 0;
        levels[level] = (int32_t)value;
        at = *end ? end + 1 : end;
    }
    memset(shown, 0, STAT_TEXT_SIZE);
    if (*at) {
        size_t size = strlen(at);
        if (size >= STAT_TEXT_SIZE || !stat_identifier(at, size)) return 0;
        memcpy(shown, at, size);
    } else if (at[-1] == ',') return 0;
    return levels[STAT_LEVELS - 1] > levels[0];
}

// Parse the per-process request: "silent=0|1" once, "raise=<1..10>" once, "announce=0|1" at most
// once (0 when absent) and 1 to 64 "stat=" lines, no stat twice. Anything else rejects the whole request.
static int stat_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&stat_state, 0, 0) != 0 || !stat_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[256];
    LONG silent = -1, raise = -1, announce = -1, count = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        if (!strchr(line, '\n') && !feof(file)) { ok = 0; break; }
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if ((strcmp(line, "silent=0") == 0 || strcmp(line, "silent=1") == 0) && silent < 0) silent = line[7] - '0';
        else if ((strcmp(line, "announce=0") == 0 || strcmp(line, "announce=1") == 0) && announce < 0)
            announce = line[9] - '0';
        else if (strncmp(line, "raise=", 6) == 0 && raise < 0) {
            char *end = NULL;
            long value = strtol(line + 6, &end, 10);
            if (end == line + 6 || *end || value < 1 || value > STAT_LEVELS - 1) ok = 0;
            else raise = (LONG)value;
        } else if (strncmp(line, "stat=", 5) == 0 && count < STAT_MAX &&
                   stat_read_line(line + 5, stat_ids[count], stat_levels[count], stat_texts[count])) {
            for (LONG index = 0; index < count; ++index)
                if (memcmp(stat_ids[index], stat_ids[count], 16) == 0) ok = 0;
            ++count;
        } else ok = 0;
    }
    fclose(file);
    if (!ok || silent < 0 || raise < 0 || count < 1) return 0;
    InterlockedExchange(&stat_silent, silent);
    InterlockedExchange(&stat_announce, announce > 0);
    InterlockedExchange(&stat_raise, raise);
    InterlockedExchange(&stat_count, count);
    InterlockedExchange(&stat_result, STAT_PENDING);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void stat_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&stat_state, 0, 0) != 2 || !stat_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        LONG result = InterlockedCompareExchange(&stat_result, 0, 0);
        fprintf(file, "result=%s\nreward_calls=%ld\n", stat_result_names[result],
                InterlockedCompareExchange(&stat_calls, 0, 0));
        if (result == STAT_GIVEN)
            for (LONG index = 0; index < InterlockedCompareExchange(&stat_count, 0, 0); ++index)
                fprintf(file, "stat=%.16s before=%ld level=%ld to_level=%ld value=%ld after=%ld announced=%ld\n",
                        stat_ids[index],
                        (long)stat_before[index], (long)stat_level_before[index],
                        (long)stat_level_asked[index], (long)stat_sent[index], (long)stat_after[index],
                        (long)stat_announced[index]);
        fclose(file);
    }
    InterlockedExchange(&stat_state, 0);
}
