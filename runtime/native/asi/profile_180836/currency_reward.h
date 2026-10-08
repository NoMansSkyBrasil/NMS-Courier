// Currency domain of the build 180836 research profile: give units, nanites or quicksilver of any
// amount through the game's own reward routine, which adds the money to the loaded slot, keeps the
// game's maximum and shows the game's notification. Included once by profile_core.c, after
// shipped_reward_dispatch.h.
//
// The game has no reward of an arbitrary amount, so this file uses the three smallest rewards of the
// currency rewards data file (runtime/mods/currency_rewards) as carriers: it finds the carrier in the
// game's reward table, checks that it is exactly that file's entry (identifier, one money reward, the
// expected currency and the file's amount), writes the requested amount into that one entry, calls
// the game's reward routine and writes the file's amount back. Only this project's own table entry
// is written; the balance itself is changed by the game. Layout observed offline on 2026-10-08
// (docs/CURRENCY_DELIVERY_NOTES.md); anything that does not match is refused before any write.

#define CURRENCY_REWARD_MAP_OFFSET 0x7a0u      // from the manager object: entries at +0x10, end at +0x18
#define CURRENCY_MAP_LOOKUP_RVA 0x567610u      // entry bytes are checked by the account domain
#define CURRENCY_MAP_ENTRY_SIZE 24u
#define CURRENCY_ENTRY_ID_OFFSET 0x18u         // reward table entry: item list at +0, identifier at +0x18
#define CURRENCY_ITEM_REWARD_OFFSET 0x10u      // reward item: reference to the reward and its class hash
#define CURRENCY_MONEY_CLASS_HASH 0xac3b9854u
#define CURRENCY_COUNT 3
// One call of the reward routine carries a signed 32-bit amount.
#define CURRENCY_CALL_MAX 2147483647u

typedef struct { int32_t amount_max, amount_min, currency; uint8_t round_number; } currency_money;
typedef uint64_t (*currency_map_lookup_fn)(void *map, const char *id);

enum {
    CURRENCY_PENDING = 0,
    CURRENCY_GIVEN,           // the game's reward routine was called for the whole amount
    CURRENCY_UNKNOWN_REWARD,  // the carrier is not in the game's reward table: the data file is not loaded
    CURRENCY_BAD_LAYOUT,      // the carrier did not look like the data file's entry; nothing was written
    CURRENCY_NOT_READY
};
static const char *const currency_result_names[] = {
    "pending", "given", "unknown_reward", "bad_layout", "not_ready"
};
static const char *const currency_names[CURRENCY_COUNT] = {"units", "nanites", "quicksilver"};
// Carrier of each currency with the amount the data file gives it, in the game's currency order.
static const char *const currency_carriers[CURRENCY_COUNT] = {"CR_UNITS_1M", "CR_NANITE_1K", "CR_QS_1K"};
static const int32_t currency_carrier_amounts[CURRENCY_COUNT] = {1000000, 1000, 1000};

static currency_map_lookup_fn currency_map_lookup;
static volatile LONG currency_state;       // 0 idle, 1 requested, 2 applied and waiting for the result file
static volatile LONG currency_kind;
static volatile LONG currency_silent;
static uint32_t currency_amount;
static volatile LONG currency_result;
static volatile LONG currency_calls;

__attribute__((unused)) static int currency_resolve(uintptr_t base) {
    currency_map_lookup = (currency_map_lookup_fn)(base + CURRENCY_MAP_LOOKUP_RVA);
    return 1;
}

static int currency_readable(uintptr_t address, size_t length) {
    MEMORY_BASIC_INFORMATION memory;
    return address && VirtualQuery((void *)address, &memory, sizeof(memory)) == sizeof(memory) &&
           memory.State == MEM_COMMIT && !(memory.Protect & (PAGE_GUARD | PAGE_NOACCESS)) &&
           address + length <= (uintptr_t)memory.BaseAddress + memory.RegionSize;
}

// A reference of the loaded table is either a pointer or, as in the file, an offset from its own
// position. Both are tried; the caller checks what the result points at.
static uintptr_t currency_follow(uintptr_t position, int attempt) {
    if (!currency_readable(position, 16)) return 0;
    uint64_t value = *(const uint64_t *)position;
    return attempt == 0 ? (uintptr_t)value : position + (uintptr_t)value;
}

// The carrier's money structure, or NULL with a reason when anything differs from the data file.
static currency_money *currency_find_carrier(uintptr_t manager, int kind, LONG *reason) {
    uint8_t *map = (uint8_t *)(manager + CURRENCY_REWARD_MAP_OFFSET);
    *reason = CURRENCY_NOT_READY;
    if (!currency_readable((uintptr_t)map, 0x40)) return NULL;
    const uint8_t *entries = *(const uint8_t *const *)(map + 0x10), *end = *(const uint8_t *const *)(map + 0x18);
    if (!entries || end < entries) return NULL;
    char id[16] = {0};
    memcpy(id, currency_carriers[kind], strlen(currency_carriers[kind]));
    const uint8_t *slot = entries + currency_map_lookup(map, id) * CURRENCY_MAP_ENTRY_SIZE;
    *reason = CURRENCY_UNKNOWN_REWARD;
    if (slot < entries || slot >= end || !currency_readable((uintptr_t)slot, CURRENCY_MAP_ENTRY_SIZE)) return NULL;
    uintptr_t entry = *(const uintptr_t *)(slot + 0x10);
    if (!entry) return NULL;
    *reason = CURRENCY_BAD_LAYOUT;
    if (!currency_readable(entry, 0x38) || strncmp((const char *)entry + CURRENCY_ENTRY_ID_OFFSET, id, 16) != 0 ||
        *(const uint32_t *)(entry + 8) != 1) return NULL;
    for (int list_attempt = 0; list_attempt < 2; ++list_attempt) {
        uintptr_t item = currency_follow(entry, list_attempt);
        if (!currency_readable(item, 0x28) ||
            *(const uint32_t *)(item + CURRENCY_ITEM_REWARD_OFFSET + 8) != CURRENCY_MONEY_CLASS_HASH) continue;
        for (int reward_attempt = 0; reward_attempt < 2; ++reward_attempt) {
            currency_money *money = (currency_money *)currency_follow(item + CURRENCY_ITEM_REWARD_OFFSET, reward_attempt);
            if (!writable_range((uintptr_t)money, sizeof(*money))) continue;
            if (money->amount_max == currency_carrier_amounts[kind] && money->amount_min == currency_carrier_amounts[kind] &&
                money->currency == kind && money->round_number == 0) return money;
        }
    }
    return NULL;
}

// Runs on the game's update thread.
static void currency_apply_request(void) {
    uintptr_t manager = currency_map_lookup && give_reward && reward_manager
        ? *(const uintptr_t *)((uintptr_t)GetModuleHandleW(NULL) + MANAGER_POINTER_RVA) : 0;
    LONG kind = InterlockedCompareExchange(&currency_kind, 0, 0), reason = CURRENCY_NOT_READY;
    currency_money *money = manager && kind >= 0 && kind < CURRENCY_COUNT ? currency_find_carrier(manager, kind, &reason) : NULL;
    LONG calls = 0;
    if (money) {
        uint8_t silent = InterlockedCompareExchange(&currency_silent, 0, 0) != 0;
        char reward_id[16] = {0}, mission_id[16] = {0};
        unsigned char seed[16] = {0};
        memcpy(reward_id, currency_carriers[kind], strlen(currency_carriers[kind]));
        for (uint32_t remaining = currency_amount; remaining > 0; ++calls) {
            uint32_t part = remaining > CURRENCY_CALL_MAX ? CURRENCY_CALL_MAX : remaining;
            uint64_t multi_product_count = 0;
            money->amount_max = (int32_t)part;
            money->amount_min = (int32_t)part;
            give_reward(reward_manager, reward_id, mission_id, seed, 0, !silent, &multi_product_count, silent, -1, 0);
            remaining -= part;
        }
        money->amount_max = currency_carrier_amounts[kind];
        money->amount_min = currency_carrier_amounts[kind];
        reason = CURRENCY_GIVEN;
    }
    InterlockedExchange(&currency_calls, calls);
    InterlockedExchange(&currency_result, reason);
    InterlockedExchange(&currency_state, 2);
}

static int currency_path(wchar_t *path, const wchar_t *kind) {
    wchar_t root[MAX_PATH];
    DWORD length = GetEnvironmentVariableW(L"LOCALAPPDATA", root, MAX_PATH);
    return length && length < MAX_PATH &&
           swprintf(path, MAX_PATH, L"%ls\\NMSCourier\\diagnostics\\native-currency-%ls-180836-%lu.txt",
                    root, kind, (unsigned long)GetCurrentProcessId()) > 0;
}

// Parse the per-process request: "currency=<units|nanites|quicksilver>", "amount=<1..4294967295>" and
// optionally "silent=1". Anything else rejects the whole request.
static int currency_read_request(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&currency_state, 0, 0) != 0 || !currency_path(path, L"request")) return 0;
    FILE *file = _wfopen(path, L"r");
    if (!file) return 0;
    char line[64];
    LONG kind = -1, silent = 0;
    uint64_t amount = 0;
    int ok = 1;
    while (ok && fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\r\n")] = 0;
        if (!line[0]) continue;
        if (strcmp(line, "silent=1") == 0) silent = 1;
        else if (strcmp(line, "silent=0") == 0) silent = 0;
        else if (strncmp(line, "currency=", 9) == 0) {
            kind = -1;
            for (int index = 0; index < CURRENCY_COUNT; ++index)
                if (strcmp(line + 9, currency_names[index]) == 0) kind = index;
            if (kind < 0) ok = 0;
        } else if (strncmp(line, "amount=", 7) == 0) {
            const char *digit = line + 7;
            amount = 0;
            if (!*digit || strlen(digit) > 10) ok = 0;
            for (; ok && *digit; ++digit) {
                if (*digit < '0' || *digit > '9') ok = 0;
                else amount = amount * 10 + (uint64_t)(*digit - '0');
            }
        } else ok = 0;
    }
    fclose(file);
    if (!ok || kind < 0 || amount < 1 || amount > 0xffffffffull) return 0;
    currency_amount = (uint32_t)amount;
    InterlockedExchange(&currency_kind, kind);
    InterlockedExchange(&currency_silent, silent);
    InterlockedExchange(&currency_result, CURRENCY_PENDING);
    return 1;
}

// Called from the worker thread after the game thread applied the request.
static void currency_write_result(void) {
    wchar_t path[MAX_PATH];
    if (InterlockedCompareExchange(&currency_state, 0, 0) != 2 || !currency_path(path, L"result")) return;
    FILE *file = _wfopen(path, L"w");
    if (file) {
        fprintf(file, "currency=%s\namount=%lu\ncalls=%ld\nresult=%s\n",
                currency_names[InterlockedCompareExchange(&currency_kind, 0, 0)], (unsigned long)currency_amount,
                (long)InterlockedCompareExchange(&currency_calls, 0, 0),
                currency_result_names[InterlockedCompareExchange(&currency_result, 0, 0)]);
        fclose(file);
    }
    InterlockedExchange(&currency_state, 0);
}
